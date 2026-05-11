import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { pomodoroService } from '../services/pomodoroService';
import type { AuthRequest } from '../types';

const startSchema = z.object({
  duration: z.number().int().min(60),
  type: z.enum(['work', 'break']),
  taskId: z.string().optional(),
});

export async function startSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = startSchema.parse(req.body);
    const session = await pomodoroService.startSession(req.user!.userId, data);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function endSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await pomodoroService.endSession(req.params['id'] as string, req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 50;
    const sessions = await pomodoroService.getHistory(req.user!.userId, limit);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}
