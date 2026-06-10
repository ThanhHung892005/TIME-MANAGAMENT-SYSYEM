import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Validate Gmail SMTP credentials
if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    throw new Error(
        'Gmail SMTP is not configured. ' +
        'Please set EMAIL_USER (your@gmail.com) and EMAIL_PASS (app password) in your .env file. ' +
        'Note: Use an App Password, not your regular Gmail password. ' +
        'Get one at: https://myaccount.google.com/apppasswords'
    );
}

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER.trim(),
        pass: env.EMAIL_PASS.trim(),
    },
});

logger.info('Email service initialized with Gmail SMTP', {
    emailUser: env.EMAIL_USER,
    nodeEnv: env.NODE_ENV,
});

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    if (!to || !token) {
        throw new Error('Invalid parameters: both "to" email and "token" are required');
    }

    try {
        const info = await transporter.sendMail({
            from: `"Time Management System" <${env.EMAIL_USER}>`,
            to,
            subject: '[Time Management] Yêu cầu đặt lại mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3B82F6;">Đặt lại mật khẩu</h2>
                  <p>Xin chào,</p>
                  <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                  <p>Vui lòng nhấn nút bên dưới để tiếp tục (link có hiệu lực trong 1 giờ):</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">ĐẶT LẠI MẬT KHẨU</a>
                  </div>
                  <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
                  <p>Trân trọng,<br>Time Management Team</p>
                </div>
            `,
        });

        logger.info('Password reset email sent successfully', {
            to,
            messageId: info.messageId,
        });
    } catch (error: any) {
        logger.error('Failed to send password reset email', {
            error: error.message,
            to,
            stack: error.stack,
        });
        throw error;
    }
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
        const info = await transporter.sendMail({
            from: `"Time Management" <${env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã OTP đăng ký tài khoản',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3B82F6;">Xác thực đăng ký tài khoản</h2>
                  <p>Mã OTP của bạn là:</p>
                  <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
                  <p>Mã có hiệu lực trong <b>5 phút</b>.</p>
                  <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                </div>
            `,
        });

        logger.info(`OTP email sent to ${email}`, { messageId: info.messageId });
    } catch (error: any) {
        logger.error('Failed to send OTP email', { error: error.message, email });
        throw new Error('Failed to send OTP email');
    }
}

export async function sendReminderEmail(
    email: string,
    type: 'soon' | 'overdue',
    taskTitle: string,
    dueDate: Date
): Promise<void> {
    const isSoon = type === 'soon';
    const safeTitle = escapeHtml(taskTitle);
    const safeDueDate = escapeHtml(dueDate.toLocaleString('vi-VN'));

    try {
        const info = await transporter.sendMail({
            from: `"Time Management" <${env.EMAIL_USER}>`,
            to: email,
            subject: isSoon ? `⏰ Sắp deadline: ${taskTitle}` : `🚨 Quá hạn: ${taskTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: ${isSoon ? '#F59E0B' : '#EF4444'}">
                        ${isSoon ? '⏰ Nhắc nhở deadline' : '🚨 Task quá hạn'}
                    </h2>
                    <p>Task <b>"${safeTitle}"</b>
                        ${isSoon
                            ? `sẽ hết hạn vào <b>${safeDueDate}</b>.`
                            : `đã quá hạn từ <b>${safeDueDate}</b>.`
                        }
                    </p>
                    <a href="${env.FRONTEND_URL}"
                       style="display:inline-block;margin-top:16px;padding:10px 20px;background:${isSoon ? '#F59E0B' : '#EF4444'};color:white;border-radius:8px;text-decoration:none;">
                        Xem task ngay
                    </a>
                </div>
            `,
        });

        logger.info(`Reminder email sent to ${email}`, { messageId: info.messageId });
    } catch (error: any) {
        logger.error('Failed to send reminder email', { error: error.message, email, type });
        throw new Error('Failed to send reminder email');
    }
}
