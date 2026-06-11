import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export { passwordSchema };

export const sendRegisterOtpSchema = z.object({
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email('Invalid email format')
  ),
});

export const registerSchema = z.object({
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email('Invalid email format')
  ),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z.string().min(1).max(100),
  otp: z.string().length(6, 'OTP must be 6 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email()
  ),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
