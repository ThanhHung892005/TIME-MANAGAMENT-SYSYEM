import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';

import type { AuthRequest } from '../types';
import { startOfDay, endOfDay, startOfWeek, subWeeks, eachDayOfInterval, subDays } from 'date-fns';
import { generateReport, exportTags as exportTagsReport, exportPomodoro as exportPomodoroReport } from '../services/reportService';
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
      prisma.task.count({ where: { userId, status: 'OVERDUE' } }),
    ]);

    const completionRate = totalTasks > 0
      ? Math.round((await prisma.task.count({ where: { userId, status: 'COMPLETED' } }) / totalTasks) * 100)
      : 0;

    res.json({ completedToday, totalTasks, upcomingDeadlines, totalSessions, completionRate});
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
export async function getOverdueStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    const [overdueCount, dueSoonCount] = await Promise.all([
      prisma.task.count({
        where: {
          userId,
          status: { notIn: ['COMPLETED', 'ARCHIVED'] },
          deadline: { lt: now },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: { notIn: ['COMPLETED', 'ARCHIVED'] },
          deadline: { gte: now, lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({ overdueCount, dueSoonCount });
  } catch (err) {
    next(err);
  }
}

export async function getPriorityStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const [low, medium, high] = await Promise.all([
      prisma.task.count({ where: { userId, priority: 'LOW', status: { notIn: ['ARCHIVED'] } } }),
      prisma.task.count({ where: { userId, priority: 'MEDIUM', status: { notIn: ['ARCHIVED'] } } }),
      prisma.task.count({ where: { userId, priority: 'HIGH', status: { notIn: ['ARCHIVED'] } } }),
    ]);

    res.json([
      { priority: 'Low', count: low, fill: '#22C55E' },
      { priority: 'Medium', count: medium, fill: '#F59E0B' },
      { priority: 'High', count: high, fill: '#EF4444' },
    ]);
  } catch (err) {
    next(err);
  }
}

export async function exportTags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const format = (req.query['format'] as 'csv' | 'json') ?? 'csv';
    const result = await exportTagsReport(req.user!.userId, format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (err) {
    next(err);
  }
}

export async function exportPomodoro(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const format = (req.query['format'] as 'csv' | 'json') ?? 'csv';
    const result = await exportPomodoroReport(req.user!.userId, format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (err) {
    next(err);
  }
}