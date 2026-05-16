import { z } from 'zod';
import { prisma } from '../config/database';

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  timezone: z.string().optional(),
  pomodoroDuration: z.number().int().min(5).max(180).optional(),
});

export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>;

class SettingsService {
  async getSettings(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        timezone: true,
        pomodoroDuration: true,
      },
    });
  }

  async updateSettings(userId: string, data: UpdateSettingsDTO) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        theme: true,
        timezone: true,
        pomodoroDuration: true,
      },
    });
  }
}

export const settingsService = new SettingsService();
