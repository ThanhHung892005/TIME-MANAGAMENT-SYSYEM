import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
});

export async function sendPasswordResetEmail(to: string, token: string) {
    try {
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
        await transporter.sendMail({
            from: `Time Management System <${env.EMAIL_USER}>`,
            to,
            subject: '[Action Required] Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3B82F6;">Password Reset</h2>
                  <p>Hello,</p>
                  <p>We received a request to reset the password for your account.</p>
                  <p>Please click the button below to proceed (this link is valid for 1 hour):</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">RESET PASSWORD</a>
                  </div>
                  <p>If you did not request a password reset, please ignore this email to ensure your account's safety.</p>
                  <p>Best regards,<br>Time Management Team</p>
                </div>
            `,
        });
        logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
        logger.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email, try again later.');
    }
}

export const sendOTPEmail = async (email: string, otp: string) => {
    await transporter.sendMail({
        from: `"Time Management" <${env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu',
        html: `
      <h2>Đặt lại mật khẩu</h2>
      <p>Mã OTP của bạn là:</p>
      <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
      <p>Mã có hiệu lực trong <b>5 phút</b>.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `,
    });
};

export const sendReminderEmail = async (
    email: string,
    type: 'soon' | 'overdue',
    taskTitle: string,
    dueDate: Date
) => {
    const isSoon = type === 'soon';
    await transporter.sendMail({
        from: `"Time Management" <${env.EMAIL_USER}>`,
        to: email,
        subject: isSoon ? `⏰ Sắp deadline: ${taskTitle}` : `🚨 Quá hạn: ${taskTitle}`,
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: ${isSoon ? '#F59E0B' : '#EF4444'}">
          ${isSoon ? '⏰ Nhắc nhở deadline' : '🚨 Task quá hạn'}
        </h2>
        <p>Task <b>"${taskTitle}"</b>
          ${isSoon
                ? `sẽ hết hạn vào <b>${dueDate.toLocaleString('vi-VN')}</b>.`
                : `đã quá hạn từ <b>${dueDate.toLocaleString('vi-VN')}</b>.`
            }
        </p>
        <a href="${env.FRONTEND_URL}"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:${isSoon ? '#F59E0B' : '#EF4444'};color:white;border-radius:8px;text-decoration:none;">
          Xem task ngay
        </a>
      </div>
    `,
    });
};
