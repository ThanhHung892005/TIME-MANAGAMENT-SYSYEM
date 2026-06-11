import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendOTPEmail } from './emailService';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { passwordSchema } from '../validators/authValidator';
import type { RegisterDTO, LoginDTO, UpdateProfileDTO } from '../validators/authValidator';

// Constants
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const userSelectFields = {
  id: true, email: true, name: true, avatar: true, createdAt: true, password: true, googleId: true,
  theme: true, timezone: true, pomodoroDuration: true, emailNotifications: true, pushNotifications: true,
};

class AuthService {
  async sendRegisterOtp(email: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError('Email already in use', 409);

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // @ts-ignore - Prisma client typing might be slightly off without generate, but the model exists
    await prisma.oTP.upsert({
      where: { email },
      update: { otp: otpHash, expiresAt },
      create: { email, otp: otpHash, expiresAt },
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (error) {
      logger.error('Failed to send register OTP email', { email, error });
      throw new AppError('Failed to send OTP email. Please try again.', 500);
    }

    return { message: 'OTP sent successfully' };
  }

  async register(data: RegisterDTO) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already in use', 409);

    // @ts-ignore
    const otpRecord = await prisma.oTP.findUnique({ where: { email: data.email } });
    if (!otpRecord) throw new AppError('OTP not found or expired. Please request a new one.', 400);
    const inputHash = crypto.createHash('sha256').update(data.otp).digest('hex');
    if (otpRecord.otp !== inputHash) throw new AppError('Invalid OTP', 400);
    if (otpRecord.expiresAt < new Date()) throw new AppError('OTP expired. Please request a new one.', 400);

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, name: data.name },
      select: userSelectFields,
    });

    // @ts-ignore
    await prisma.oTP.delete({ where: { email: data.email } });

    const token = signToken({ userId: user.id, email: user.email });
    const { password: _p, googleId: _g, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: true }, token };
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Invalid email or password', 401);

    if (!user.password) throw new AppError('Account uses Google Sign-In. Please log in with Google.', 401);

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new AppError('Invalid email or password', 401);

    const token = signToken({ userId: user.id, email: user.email });
    const { password: _p, googleId: _g, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: !!user.password }, token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelectFields,
    });
    if (!user) throw new AppError('User not found', 404);
    
    const { password, ...safeUser } = user;
    return { ...safeUser, hasPassword: !!password };
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelectFields,
    });
    const { password, googleId: _g, ...safeUser } = user;
    return { ...safeUser, hasPassword: !!password };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Delay before branching so both paths take ~same time (prevents email enumeration via timing)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

    if (!user) return { message: 'If email exists, a reset link has been sent.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Password reset email could not be sent', {
        email,
        error: errorMessage,
        resetTokenPrefix: resetToken.substring(0, 8) + '...',
      });
      throw new AppError('Failed to send reset email. Please try again later.', 500);
    }

    return { message: 'If email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user) throw new AppError('Invalid or expired token', 400);

    // Validate new password strength (already validated at boundary, but double-check)
    passwordSchema.parse(newPassword);

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new AppError('User not found or uses Google Sign-In', 404);

    const isValid = await bcrypt.compare(oldPass, user.password);
    if (!isValid) throw new AppError('Old password is incorrect', 400);

    // Validate new password strength (already validated at boundary, but double-check)
    passwordSchema.parse(newPass);

    const hashed = await bcrypt.hash(newPass, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }

  async loginOrCreateWithGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    let user = await prisma.user.findUnique({ where: { googleId: profile.googleId } });

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
      if (existingByEmail) {
        throw new AppError('Email đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng mật khẩu.', 409);
      }
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          avatar: profile.avatar,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });
    const { password: _p, googleId: _g, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: !!user.password }, token };
  }
}

export const authService = new AuthService();
