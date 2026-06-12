import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';
import { prisma } from '../config/database';
import type { UpdateSettingsDTO } from '../validators/settingsValidator';

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
