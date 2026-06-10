import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthResponse { user: User }

class AuthService {
  async sendRegisterOtp(email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/send-register-otp', { email });
    return res.data;
  }

  async register(data: { email: string; password: string; name: string; otp: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  }

  async getProfile(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  }

  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    const res = await api.patch<User>('/auth/me', data);
    return res.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/change-password', data);
    return res.data;
  }


  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return res.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
    return res.data;
  }
}

export const authService = new AuthService();
