import { Router } from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { registerSchema, loginSchema, updateProfileSchema } from '../services/authService';
import {rateLimit} from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// dont need login
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

// need login
router.use(authenticate);
router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.post('/change-password', changePassword)

export default router;
