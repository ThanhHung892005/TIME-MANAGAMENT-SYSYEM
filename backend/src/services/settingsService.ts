import { z } from 'zod';
import { AppError } from '../types';
import { prisma } from '../config/database';


export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  timezone: z.string().optional(),
  pomodoroDuration: z.number().int().min(5).max(180).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>;

class SettingsService {
  async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        timezone: true,
        pomodoroDuration: true,
        emailNotifications: true,
        pushNotifications: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateSettings(userId: string, data: UpdateSettingsDTO) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        theme: true,
        timezone: true,
        pomodoroDuration: true,
        emailNotifications: true,
        pushNotifications: true,
      },
    });

    return { message: 'Settings updated successfully', settings: updatedUser };
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted successfully' };
  }
}

export const settingsService = new SettingsService();
