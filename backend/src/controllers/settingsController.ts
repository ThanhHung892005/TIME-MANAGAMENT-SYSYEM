import { Response, NextFunction } from 'express';
import { settingsService } from '../services/settingsService';
import type { AuthRequest } from '../types';

export async function getSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await settingsService.getSettings(req.user!.userId);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await settingsService.updateSettings(req.user!.userId, req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await settingsService.deleteAccount(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
