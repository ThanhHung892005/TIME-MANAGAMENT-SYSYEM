import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"Time Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your password reset OTP',
      html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2>Reset Password</h2>
                    <p>Your OTP code is:</p>
                    <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
                    <p>This code expires in <b>5 minutes</b>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
    });
  } catch (err) {
    logger.error('Failed to send OTP email:', err);
    throw err;
  }
};

export const sendReminderEmail = async (
  email: string,
  type: 'soon' | 'overdue',
  taskTitle: string,
  dueDate: Date
) => {
  const isSoon = type === 'soon';
  const safeTitle = escapeHtml(taskTitle);
  const safeDueDate = escapeHtml(dueDate.toLocaleString('vi-VN'));
  const frontendUrl = escapeHtml(process.env.FRONTEND_URL ?? 'http://localhost:5173');

  try {
    await transporter.sendMail({
      from: `"Time Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isSoon
        ? `Deadline reminder: ${taskTitle}`
        : `Overdue task: ${taskTitle}`,
      html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: ${isSoon ? '#F59E0B' : '#EF4444'}">
                        ${isSoon ? '⏰ Deadline Reminder' : '🚨 Overdue Task'}
                    </h2>
                    <p>Task <b>"${safeTitle}"</b>
                        ${isSoon
          ? `is due on <b>${safeDueDate}</b>.`
          : `was due on <b>${safeDueDate}</b>.`
        }
                    </p>
                    <a href="${frontendUrl}"
                       style="display:inline-block;margin-top:16px;padding:10px 20px;background:${isSoon ? '#F59E0B' : '#EF4444'};color:white;border-radius:8px;text-decoration:none;">
                        View Task
                    </a>
                </div>
            `,
    });
  } catch (err) {
    logger.error('Failed to send reminder email:', err);
    throw err;
  }
};