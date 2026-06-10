import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { AppError } from '../types';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendOTPEmail } from './emailService';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Constants
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Shared password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export { passwordSchema };

export const registerSchema = z.object({
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email('Invalid email format')
  ),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z.string().min(1).max(100),
  otp: z.string().length(6, 'OTP must be 6 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const sendRegisterOtpSchema = z.object({
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email('Invalid email format')
  ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email()
  ),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

class AuthService {
  async sendRegisterOtp(email: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError('Email already in use', 409);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // @ts-ignore - Prisma client typing might be slightly off without generate, but the model exists
    await prisma.oTP.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
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
    if (otpRecord.otp !== data.otp) throw new AppError('Invalid OTP', 400);
    if (otpRecord.expiresAt < new Date()) throw new AppError('OTP expired. Please request a new one.', 400);

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, name: data.name },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });

    // @ts-ignore
    await prisma.oTP.delete({ where: { email: data.email } });

    const token = signToken({ userId: user.id, email: user.email });
    const { password: _p, googleId: _g, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: !!user.password }, token };
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
      select: { id: true, email: true, name: true, avatar: true, createdAt: true, password: true },
    });
    if (!user) throw new AppError('User not found', 404);
    
    const { password, ...safeUser } = user;
    return { ...safeUser, hasPassword: !!password };
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

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

    // Add artificial delay to prevent timing-based email enumeration
    // Both branches should take approximately the same time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

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
      user = await prisma.user.findUnique({ where: { email: profile.email } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId, avatar: user.avatar ?? profile.avatar },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            googleId: profile.googleId,
            avatar: profile.avatar,
          },
        });
      }
    }

    const token = signToken({ userId: user.id, email: user.email });
    const { password: _p, googleId: _g, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: !!user.password }, token };
  }
}

export const authService = new AuthService();
