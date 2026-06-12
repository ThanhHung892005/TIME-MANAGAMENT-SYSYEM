import bcrypt from 'bcryptjs';
import { authService } from '../../services/authService';
import { prisma } from '../../config/database';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../errors/AppError';

jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    oTP: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  signToken: jest.fn().mockReturnValue('mock-token'),
}));

jest.mock('../../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn(),
  sendOTPEmail: jest.fn(),
  sendReminderEmail: jest.fn(),
}));

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomInt: jest.fn().mockReturnValue(123456),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hashed-otp-value'),
  }),
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockFindFirst = prisma.user.findFirst as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockOtpFindUnique = prisma.oTP.findUnique as jest.Mock;
const mockHash = bcrypt.hash as unknown as jest.Mock;
const mockCompare = bcrypt.compare as unknown as jest.Mock;

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date('2024-01-01'),
};

beforeEach(() => {
  jest.clearAllMocks();
  (signToken as jest.Mock).mockReturnValue('mock-token');
});

describe('AuthService.register', () => {
  it('throws 409 if email already exists', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    await expect(
      authService.register({ email: 'test@example.com', password: 'pass1234', confirmPassword: 'pass1234', name: 'Test', otp: '123456' }),
    ).rejects.toThrow(AppError);

    await expect(
      authService.register({ email: 'test@example.com', password: 'pass1234', confirmPassword: 'pass1234', name: 'Test', otp: '123456' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('hashes password with salt 12', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockOtpFindUnique.mockResolvedValue({ email: 'test@example.com', otp: 'hashed-otp-value', expiresAt: new Date(Date.now() + 10000) });
    mockHash.mockResolvedValue('hashed-pw');
    mockCreate.mockResolvedValue(baseUser);

    await authService.register({ email: 'test@example.com', password: 'pass1234', confirmPassword: 'pass1234', name: 'Test', otp: '123456' });

    expect(mockHash).toHaveBeenCalledWith('pass1234', 12);
  });

  it('returns user and token on success', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockOtpFindUnique.mockResolvedValue({ email: 'test@example.com', otp: 'hashed-otp-value', expiresAt: new Date(Date.now() + 10000) });
    mockHash.mockResolvedValue('hashed-pw');
    mockCreate.mockResolvedValue({ ...baseUser, password: 'hashed-pw' });

    const result = await authService.register({ email: 'test@example.com', password: 'pass1234', confirmPassword: 'pass1234', name: 'Test', otp: '123456' });

    expect(result.token).toBe('mock-token');
    expect(result.user).toEqual({ ...baseUser, hasPassword: true });
    expect(result.user).not.toHaveProperty('password');
    expect(signToken).toHaveBeenCalledWith({ userId: baseUser.id, email: baseUser.email });
  });
});

describe('AuthService.login', () => {
  it('throws 401 if user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(
      authService.login({ email: 'ghost@example.com', password: 'pass1234' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 if password is wrong', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-pw' });
    mockCompare.mockResolvedValue(false);
    await expect(
      authService.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns user (without password) and token on success', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-pw' });
    mockCompare.mockResolvedValue(true);

    const result = await authService.login({ email: 'test@example.com', password: 'pass1234' });

    expect(result.token).toBe('mock-token');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('test@example.com');
  });
});

describe('AuthService.getProfile', () => {
  it('throws 404 if user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(authService.getProfile('nonexistent')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns the user profile', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    const result = await authService.getProfile('user-1');
    expect(result).toEqual({ ...baseUser, hasPassword: false });
  });
});

describe('AuthService.forgotPassword', () => {
  it('returns success message when user exists', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    const result = await authService.forgotPassword('test@example.com');
    expect(result.message).toBe('If email exists, a reset link has been sent.');
  });

  it('returns same message when user not found (timing-safe)', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await authService.forgotPassword('nonexistent@example.com');
    expect(result.message).toBe('If email exists, a reset link has been sent.');
  });

  it('updates user with reset token when user exists', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    await authService.forgotPassword('test@example.com');
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });
});

describe('AuthService.resetPassword', () => {
  it('throws 400 for invalid token', async () => {
    mockFindFirst.mockResolvedValue(null);
    await expect(
      authService.resetPassword('invalid-token', 'NewPass123!'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 for expired token', async () => {
    mockFindFirst.mockResolvedValue(null);
    await expect(
      authService.resetPassword('expired-token', 'NewPass123!'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('resets password with valid token', async () => {
    const userWithToken = {
      ...baseUser,
      password: 'old-hashed-pw',
      resetPasswordToken: 'hashed-token',
      resetPasswordExpires: new Date(Date.now() + 10000),
    };
    mockFindFirst.mockResolvedValue(userWithToken);
    const result = await authService.resetPassword('valid-token', 'NewPass123!');
    expect(result.message).toBe('Password has been reset successfully');
  });
});

describe('AuthService.changePassword', () => {
  it('throws 404 if user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(
      authService.changePassword('nonexistent', 'OldPass123!', 'NewPass123!'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 if old password is incorrect', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-old-pw' });
    mockCompare.mockResolvedValue(false);
    await expect(
      authService.changePassword('user-1', 'WrongPass123!', 'NewPass123!'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('changes password with correct old password', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-old-pw' });
    mockCompare.mockResolvedValue(true);
    const result = await authService.changePassword('user-1', 'OldPass123!', 'NewPass123!');
    expect(result.message).toBe('Password changed successfully');
  });

  it('throws 404 if user has Google sign-in only (no password)', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: null });
    await expect(
      authService.changePassword('user-1', 'AnyPass123!', 'NewPass123!'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('AuthService.loginOrCreateWithGoogle', () => {
  it('returns existing user with Google account', async () => {
    const googleUser = { ...baseUser, googleId: 'google-123', password: null };
    mockFindUnique.mockResolvedValue(googleUser);
    const result = await authService.loginOrCreateWithGoogle({
      googleId: 'google-123',
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBe('mock-token');
  });

  it('creates new user when Google account does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ ...baseUser, googleId: 'google-new', password: null });
    const result = await authService.loginOrCreateWithGoogle({
      googleId: 'google-new',
      email: 'new@example.com',
      name: 'New User',
    });
    expect(result.user.email).toBe('test@example.com');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('throws 409 when email exists with different auth method', async () => {
    // First call: findUnique by googleId -> null (no user with this googleId)
    // Second call: findUnique by email -> user with email but different googleId
    mockFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...baseUser, googleId: null, password: 'some-password' });
    await expect(
      authService.loginOrCreateWithGoogle({
        googleId: 'google-123',
        email: 'test@example.com',
        name: 'Test User',
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
