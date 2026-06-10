import { api } from '@/lib/api';

export interface UserSettings {
  theme: 'light' | 'dark';
  timezone: string;
  pomodoroDuration: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class SettingsService {
  async getSettings(): Promise<UserSettings> {
    const res = await api.get<UserSettings>('/settings');
    return res.data;
  }

  async updateSettings(data: Partial<UserSettings>): Promise<{ message: string; settings: UserSettings }> {
    const res = await api.patch<{ message: string; settings: UserSettings }>('/settings', data);
    return res.data;
  }

  async deleteAccount(password?: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>('/settings/account', {
      data: password ? { password } : undefined
    });
    return res.data;
  }
}

export const settingsService = new SettingsService();
