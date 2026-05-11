import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthResponse { user: User; token: string }

class AuthService {
  async register(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
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
    const res = await api.patch<User>('/auth/profile', data);
    return res.data;
  }
}

export const authService = new AuthService();
