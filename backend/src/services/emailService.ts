import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (email: string, otp: string) => {
    await transporter.sendMail({
        from: `"Time Management" <${process.env.EMAIL_USER}>`,
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
        from: `"Time Management" <${process.env.EMAIL_USER}>`,
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
        <a href="${process.env.FRONTEND_URL}" 
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:${isSoon ? '#F59E0B' : '#EF4444'};color:white;border-radius:8px;text-decoration:none;">
          Xem task ngay
        </a>
      </div>
    `,
    });
};