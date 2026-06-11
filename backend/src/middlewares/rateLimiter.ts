import { rateLimit } from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const sendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Quá nhiều yêu cầu gửi mã OTP. Vui lòng thử lại sau 1 giờ.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Quá nhiều lần nhập sai. Vui lòng thử lại sau 1 giờ.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
