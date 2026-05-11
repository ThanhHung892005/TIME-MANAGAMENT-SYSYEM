import bcrypt from 'bcryptjs';
import { authService } from '../../services/authService';
import { prisma } from '../../config/database';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../types';

jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
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
      authService.register({ email: 'test@example.com', password: 'pass1234', name: 'Test' }),
    ).rejects.toThrow(AppError);

    await expect(
      authService.register({ email: 'test@example.com', password: 'pass1234', name: 'Test' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('hashes password with salt 12', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockHash.mockResolvedValue('hashed-pw');
    mockCreate.mockResolvedValue(baseUser);

    await authService.register({ email: 'test@example.com', password: 'pass1234', name: 'Test' });

    expect(mockHash).toHaveBeenCalledWith('pass1234', 12);
  });

  it('returns user and token on success', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockHash.mockResolvedValue('hashed-pw');
    mockCreate.mockResolvedValue(baseUser);

    const result = await authService.register({ email: 'test@example.com', password: 'pass1234', name: 'Test' });

    expect(result.token).toBe('mock-token');
    expect(result.user).toEqual(baseUser);
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
    expect(result).toEqual(baseUser);
  });
});
