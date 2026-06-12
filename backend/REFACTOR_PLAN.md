# Refactor Plan - Cấu trúc src hiện đại

## Mục tiêu
Tổ chức lại `src/` theo cấu trúc phổ biến của Node.js/Express hiện đại.

---

## Cấu trúc MỚI

```
src/
├── errors/                      ← [THÊM MỚI]
│   └── AppError.ts            ← Error classes
│
├── middlewares/
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts        ← [THÊM MỚI] (từ authRoutes.ts)
│   └── validators/
│       └── authValidator.ts   ← [THÊM MỚI] (từ authService.ts)
│
├── services/
│   └── authService.ts        ← [CẬP NHẬT] (xóa schemas)
│
├── routes/
│   └── authRoutes.ts         ← [CẬP NHẬT] (xóa rate limiters)
│
└── types/
    └── index.ts              ← [CẬP NHẬT] (xóa errors)
```

---

## Thứ tự thực hiện

### Bước 1: Tạo `errors/AppError.ts`

**Tạo file mới:**

```typescript
// src/errors/AppError.ts

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 400);
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}
```

**Cập nhật file `src/types/index.ts`:**

```typescript
// src/types/index.ts
// CHỈ còn types, KHÔNG còn errors

import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
}

export type AuthRequest = Request & {
  user?: TokenPayload;
};
```

**Cập nhật import ở các file:**

| File | Đổi từ | Đổi thành |
|------|---------|------------|
| `services/authService.ts` | `from '../types'` | `from '../errors/AppError'` |
| `services/settingsService.ts` | `from '../types'` | `from '../errors/AppError'` |
| `services/taskService.ts` | `from '../types'` | `from '../errors/AppError'` |
| `services/tagService.ts` | `from '../types'` | `from '../errors/AppError'` |
| `services/pomodoroService.ts` | `from '../types'` | `from '../errors/AppError'` |
| `services/notificationService.ts` | `from '../types'` | `from '../errors/AppError'` |
| `middlewares/errorHandler.ts` | `from '../types'` | `from '../errors/AppError'` |

---

### Bước 2: Tạo `middlewares/rateLimiter.ts`

**Tạo file mới:**

```typescript
// src/middlewares/rateLimiter.ts

import { rateLimit } from 'express-rate-limit';

// Strict rate limiter for login - prevent brute force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sending OTP - prevent email spam
export const sendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 OTP requests per hour
  message: 'Quá nhiều yêu cầu gửi mã OTP. Vui lòng thử lại sau 1 giờ.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for register - allow multiple typing attempts
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // limit each IP to 15 registration/verification attempts per hour
  message: 'Quá nhiều lần nhập sai. Vui lòng thử lại sau 1 giờ.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard rate limiter for other auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Cập nhật `src/routes/authRoutes.ts`:**

```typescript
// src/routes/authRoutes.ts

import { Router } from 'express';
import { register, sendRegisterOtp, login, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { registerSchema, sendRegisterOtpSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../services/authService';
import { loginLimiter, sendOtpLimiter, registerLimiter, authLimiter } from '../middlewares/rateLimiter';

const router = Router();

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
```

**THAY ĐỔI:**
- Xóa các định nghĩa `rateLimit({...})` ở đầu file
- Thêm import rate limiters từ `../middlewares/rateLimiter`

---

### Bước 3: Tạo `middlewares/validators/authValidator.ts`

**Tạo thư mục và file mới:**

```typescript
// src/middlewares/validators/authValidator.ts

import { z } from 'zod';

// Shared password validation schema
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

// Type exports
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
```

**Cập nhật `src/routes/authRoutes.ts`:**

Thêm dòng import validators:

```typescript
import { registerSchema, sendRegisterOtpSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../middlewares/validators/authValidator';
```

**THAY ĐỔI:**
- Xóa dòng import cũ từ `../services/authService`

**Cập nhật `src/services/authService.ts`:**

1. Thêm import:

```typescript
import { passwordSchema } from '../middlewares/validators/authValidator';
import type { RegisterDTO, LoginDTO, UpdateProfileDTO } from '../middlewares/validators/authValidator';
```

2. Xóa các dòng schema definition (giữ lại `passwordSchema` usage):
   - Xóa: `passwordSchema`, `registerSchema`, `loginSchema`, `sendRegisterOtpSchema`, `updateProfileSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `changePasswordSchema`
   - Xóa: `export type RegisterDTO`, `export type LoginDTO`, `export type UpdateProfileDTO`

3. Thay đổi `passwordSchema.parse()` calls để dùng từ import (đã import sẵn)

---

## Kiểm tra sau refactor

Sau mỗi bước, chạy:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build
npm run build

# 3. Test auth flow
# - POST /api/auth/send-register-otp
# - POST /api/auth/register
# - POST /api/auth/login
# - GET /api/auth/me
# - POST /api/auth/logout
```

---

## Cấu trúc cuối cùng

```
src/
├── errors/
│   └── AppError.ts            ← Error classes
│
├── middlewares/
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validators/
│       └── authValidator.ts   ← Zod schemas
│
├── services/
│   └── authService.ts        ← Logic nghiệp vụ
│
├── routes/
│   └── authRoutes.ts         ← Routing
│
├── controllers/
│   └── authController.ts
│
├── config/
│   ├── database.ts
│   ├── env.ts
│   └── passport.ts
│
├── types/
│   └── index.ts              ← TypeScript types only
│
└── utils/
    ├── jwt.ts
    ├── logger.ts
    └── tokenBlacklist.ts
```

---

## Nguyên tắc áp dụng

| Nguyên tắc | Mô tả |
|------------|--------|
| **Single Responsibility** | Mỗi file/folder 1 việc duy nhất |
| **Separation of Concerns** | Validation ≠ Logic ≠ Routing |
| **DRY** | Error classes, schemas dùng chung |
| **Industry Convention** | Node.js/Express standard structure |
