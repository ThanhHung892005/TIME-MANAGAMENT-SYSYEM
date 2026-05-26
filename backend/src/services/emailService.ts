import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
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
            `
        });
    
        logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
        logger.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email, try again later.');
    }
}