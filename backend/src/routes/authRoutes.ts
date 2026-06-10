import { Router } from 'express';
import { register, sendRegisterOtp, login, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { registerSchema, sendRegisterOtpSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../services/authService';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Strict rate limiter for login - prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sending OTP - prevent email spam
const sendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 OTP requests per hour
  message: 'Quá nhiều yêu cầu gửi mã OTP. Vui lòng thử lại sau 1 giờ.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for register - allow multiple typing attempts
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // limit each IP to 15 registration/verification attempts per hour
  message: 'Quá nhiều lần nhập sai. Vui lòng thử lại sau 1 giờ.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard rate limiter for other auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// dont need login
router.get('/test', (req, res) => { res.send('OK'); });
router.post('/send-register-otp', sendOtpLimiter, validate(sendRegisterOtpSchema), sendRegisterOtp);
router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/logout', logout);

// need login
router.use(authenticate);
router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
