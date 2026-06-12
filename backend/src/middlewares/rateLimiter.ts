import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function otpKeyGenerator(req: Request): string {
  const email = req.body?.email;
  const rawIp = req.ip ?? 'unknown';
  const ip = ipKeyGenerator(rawIp);
  return email ? `${ip}:${email}` : ip;
}

export const sendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Quá nhiều yêu cầu gửi mã OTP. Vui lòng thử lại sau 1 giờ.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: otpKeyGenerator,
});

export function emailKeyGenerator(req: Request): string {
  const email = req.body?.email;
  const rawIp = req.ip ?? 'unknown';
  const ip = ipKeyGenerator(rawIp);
  return email ? `${ip}:${email}` : ip;
}

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { error: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKeyGenerator,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKeyGenerator,
});
