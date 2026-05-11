import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../types';
import type { AuthRequest } from '../types';

export async function getCalendarTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { start, end } = z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).parse({ start: req.query['start'], end: req.query['end'] });

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user!.userId,
        deadline: { gte: new Date(start), lte: new Date(end) },
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { deadline: 'asc' },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function updateDeadline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { deadline } = z.object({ deadline: z.string().datetime().nullable() }).parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: req.params['id'] as string } });
    if (!task) throw new NotFoundError('Task not found');
    if (task.userId !== req.user!.userId) throw new ForbiddenError();

    const updated = await prisma.task.update({
      where: { id: req.params['id'] as string },
      data: { deadline: deadline ? new Date(deadline) : null },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
