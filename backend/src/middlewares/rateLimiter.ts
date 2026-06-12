import { rateLimit } from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const sendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 3,
  message: { error: 'Too many OTP requests. Please try again after 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 15,
  message: 'Too many attempts. Please try again after 1 hour.',
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
