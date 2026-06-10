import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/authService';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    patch: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns user and token on successful login', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test' },
          token: 'jwt-token',
        },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('throws error on invalid credentials', async () => {
      const mockError = {
        response: { data: { error: 'Invalid email or password' } },
      };
      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toEqual(mockError);
    });
  });

  describe('register', () => {
    it('returns user and token on successful registration', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'new@example.com', name: 'New User' },
          token: 'jwt-token',
        },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'Password123!',
        name: 'New User',
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('forgotPassword', () => {
    it('returns message on successful request', async () => {
      const mockResponse = {
        data: { message: 'If email exists, a reset link has been sent.' },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword('test@example.com');

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
    });

    it('throws error on failed request', async () => {
      const mockError = {
        response: { data: { error: 'Failed to send reset email' } },
      };
      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(
        authService.forgotPassword('test@example.com')
      ).rejects.toEqual(mockError);
    });
  });

  describe('resetPassword', () => {
    it('returns message on successful reset', async () => {
      const mockResponse = {
        data: { message: 'Password has been reset successfully' },
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.resetPassword('reset-token', 'NewPassword123!');

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        newPassword: 'NewPassword123!',
      });
    });

    it('throws error on invalid or expired token', async () => {
      const mockError = {
        response: { data: { error: 'Invalid or expired token' } },
      };
      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toEqual(mockError);
    });
  });

  describe('getProfile', () => {
    it('returns user profile', async () => {
      const mockResponse = {
        data: { id: '1', email: 'test@example.com', name: 'Test' },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await authService.getProfile();

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateProfile', () => {
    it('returns updated user profile', async () => {
      const mockResponse = {
        data: { id: '1', email: 'test@example.com', name: 'Updated Name' },
      };
      vi.mocked(api.patch).mockResolvedValue(mockResponse);

      const result = await authService.updateProfile({ name: 'Updated Name' });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('refreshToken', () => {
    it('calls refresh endpoint', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: undefined });

      await authService.refreshToken();

      expect(api.post).toHaveBeenCalledWith('/auth/refresh');
    });
  });

  describe('logout', () => {
    it('calls logout endpoint', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: undefined });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
});
