import bcrypt from 'bcryptjs';
import { settingsService } from '../../services/settingsService';
import { prisma } from '../../config/database';
import { AppError } from '../../errors/AppError';

jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;
const mockDelete = prisma.user.delete as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  theme: 'light',
  timezone: 'UTC',
  pomodoroDuration: 25,
  emailNotifications: true,
  pushNotifications: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SettingsService.getSettings', () => {
  it('returns settings for valid user', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    const result = await settingsService.getSettings('user-1');
    expect(result).toMatchObject({
      theme: 'light',
      timezone: 'UTC',
      pomodoroDuration: 25,
      emailNotifications: true,
      pushNotifications: false,
    });
  });

  it('throws 404 if user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(settingsService.getSettings('nonexistent')).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('SettingsService.updateSettings', () => {
  it('updates settings and returns success message', async () => {
    mockUpdate.mockResolvedValue({ ...baseUser, theme: 'dark' });
    const result = await settingsService.updateSettings('user-1', { theme: 'dark' });
    expect(result.message).toBe('Settings updated successfully');
    expect(result.settings).toMatchObject({ theme: 'dark' });
  });
});

describe('SettingsService.deleteAccount', () => {
  it('deletes account without password for Google-only user', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: null });
    mockDelete.mockResolvedValue(baseUser);
    const result = await settingsService.deleteAccount('user-1');
    expect(result.message).toBe('Account deleted successfully');
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
  });

  it('deletes account with correct password', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-pw' });
    mockCompare.mockResolvedValue(true);
    mockDelete.mockResolvedValue(baseUser);
    const result = await settingsService.deleteAccount('user-1', 'correct-password');
    expect(result.message).toBe('Account deleted successfully');
  });

  it('throws 400 if password required but not provided', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-pw' });
    await expect(settingsService.deleteAccount('user-1')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 401 if password is incorrect', async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: 'hashed-pw' });
    mockCompare.mockResolvedValue(false);
    await expect(settingsService.deleteAccount('user-1', 'wrong-password')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 404 if user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(settingsService.deleteAccount('nonexistent')).rejects.toMatchObject({ statusCode: 404 });
  });
});
