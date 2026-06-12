import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AppError } from '../types';
import { prisma } from '../config/database';


// Intl.supportedValuesOf is available in Node 20+ but not in TypeScript's default lib
const validTimezones = new Set((Intl as any).supportedValuesOf('timeZone') as string[]);
validTimezones.add('Asia/Ho_Chi_Minh'); // Accept legacy/client value

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  timezone: z.preprocess(
    (val) => val === 'Asia/Ho_Chi_Minh' ? 'Asia/Saigon' : val,
    z.string().refine((tz) => validTimezones.has(tz), { message: 'Invalid IANA Timezone' })
  ).optional(),
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
    if (data.timezone === 'Asia/Ho_Chi_Minh') {
      data.timezone = 'Asia/Saigon';
    }
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

  async deleteAccount(userId: string, password?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (user.password) {
      if (!password) {
        throw new AppError('Password is required to delete account', 400);
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AppError('Incorrect password', 401);
    }

    await prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted successfully' };
  }
}

export const settingsService = new SettingsService();
