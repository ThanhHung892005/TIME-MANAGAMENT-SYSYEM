import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { generateReport } from '../services/reportService';
import type { AuthRequest } from '../types';
import { startOfDay, endOfDay, startOfWeek, subWeeks, eachDayOfInterval, subDays } from 'date-fns';

export async function getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const today = new Date();

    const [completedToday, totalTasks, upcomingDeadlines, totalSessions] = await Promise.all([
      prisma.task.count({
        where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfDay(today), lte: endOfDay(today) } },
      }),
      prisma.task.count({ where: { userId } }),
      prisma.task.findMany({
        where: { userId, deadline: { gte: today, lte: new Date(Date.now() + 7 * 86400000) }, status: { not: 'COMPLETED' } },
        orderBy: { deadline: 'asc' },
        take: 5,
        select: { id: true, title: true, deadline: true, priority: true },
      }),
      prisma.pomodoroSession.count({ where: { userId, type: 'work', endedAt: { not: null } } }),
    ]);

    const completionRate = totalTasks > 0
      ? Math.round((await prisma.task.count({ where: { userId, status: 'COMPLETED' } }) / totalTasks) * 100)
      : 0;

    res.json({ completedToday, totalTasks, upcomingDeadlines, totalSessions, completionRate });
  } catch (err) {
    next(err);
  }
}

export async function getCompletion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });

    const data = await Promise.all(
      days.map(async (day) => {
        const count = await prisma.task.count({
          where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfDay(day), lte: endOfDay(day) } },
        });
        return { date: day.toISOString().split('T')[0], completed: count };
      }),
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPomodoroStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId, type: 'work', endedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc: number, s) => acc + Math.floor(s.duration / 60), 0);
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    res.json({ totalSessions, totalMinutes, avgMinutes });
  } catch (err) {
    next(err);
  }
}

export async function getHeatmap(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const start = subWeeks(startOfWeek(new Date()), 12);
    const tasks = await prisma.task.findMany({
      where: { userId, status: 'COMPLETED', updatedAt: { gte: start } },
      select: { updatedAt: true },
    });

    const counts: Record<string, number> = {};
    tasks.forEach(({ updatedAt }: { updatedAt: Date }) => {
      const key = updatedAt.toISOString().split('T')[0]!;
      counts[key] = (counts[key] ?? 0) + 1;
    });

    const data = Object.entries(counts).map(([date, count]) => ({ date, count }));
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const format = (req.query['format'] as string) ?? 'csv';
    const result = await generateReport(req.user!.userId, format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (err) {
    next(err);
  }
}
