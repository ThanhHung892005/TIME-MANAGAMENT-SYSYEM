import { Router } from 'express';
import { register, sendRegisterOtp, login, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { registerSchema, sendRegisterOtpSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/authValidator';

const router = Router();

// dont need login
router.get('/test', (req, res) => { res.send('OK'); });
router.post('/send-register-otp', validate(sendRegisterOtpSchema), sendRegisterOtp);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/logout', logout);

// need login
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
