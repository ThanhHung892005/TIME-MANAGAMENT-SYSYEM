import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import type { AuthRequest } from '../types';
import { startOfDay, endOfDay, startOfWeek, subWeeks, eachDayOfInterval, subDays } from 'date-fns';
import { generateReport, exportTags as exportTagsReport, exportPomodoro as exportPomodoroReport } from '../services/reportService';

export async function getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const today = new Date();

    // Fix: gộp tất cả vào 1 Promise.all, không query thêm sau
    const [completedToday, totalTasks, completedTotal, upcomingDeadlines, totalSessions] = await Promise.all([
      prisma.task.count({
        where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfDay(today), lte: endOfDay(today) } },
      }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.findMany({
        where: {
          userId,
          deadline: { gte: today, lte: new Date(Date.now() + 7 * 86400000) },
          status: { not: 'COMPLETED' },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
        select: { id: true, title: true, deadline: true, priority: true },
      }),
      prisma.pomodoroSession.count({ where: { userId, type: 'work', endedAt: { not: null } } }),
    ]);

    const completionRate = totalTasks > 0
      ? Math.round((completedTotal / totalTasks) * 100)
      : 0;

    res.json({ completedToday, totalTasks, upcomingDeadlines, totalSessions, completionRate });
  } catch (err) {
    next(err);
  }
}

export async function getCompletion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const start = startOfDay(subDays(new Date(), 6));
    const end = endOfDay(new Date());

    // Fix: 1 query duy nhất thay vì 7 query
    const tasks = await prisma.task.findMany({
      where: { userId, status: 'COMPLETED', updatedAt: { gte: start, lte: end } },
      select: { updatedAt: true },
    });

    // Group by date in memory
    const countMap: Record<string, number> = {};
    tasks.forEach(({ updatedAt }) => {
      const key = updatedAt.toISOString().split('T')[0]!;
      countMap[key] = (countMap[key] ?? 0) + 1;
    });

    const days = eachDayOfInterval({ start, end });
    const data = days.map(day => ({
      date: day.toISOString().split('T')[0]!,
      completed: countMap[day.toISOString().split('T')[0]!] ?? 0,
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPomodoroStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Fix: dùng aggregate thay vì findMany rồi tính tay
    const [count, aggregate] = await Promise.all([
      prisma.pomodoroSession.count({ where: { userId, type: 'work', endedAt: { not: null } } }),
      prisma.pomodoroSession.aggregate({
        where: { userId, type: 'work', endedAt: { not: null } },
        _sum: { duration: true },
      }),
    ]);

    const totalMinutes = Math.floor((aggregate._sum.duration ?? 0) / 60);
    const avgMinutes = count > 0 ? Math.round(totalMinutes / count) : 0;

    res.json({ totalSessions: count, totalMinutes, avgMinutes });
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
    tasks.forEach(({ updatedAt }) => {
      const key = updatedAt.toISOString().split('T')[0]!;
      counts[key] = (counts[key] ?? 0) + 1;
    });

    res.json(Object.entries(counts).map(([date, count]) => ({ date, count })));
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
        where: { userId, status: { notIn: ['COMPLETED', 'ARCHIVED'] }, deadline: { lt: now } },
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

    // Fix: 1 query groupBy thay vì 3 query riêng lẻ
    const groups = await prisma.task.groupBy({
      by: ['priority'],
      where: { userId, status: { notIn: ['ARCHIVED'] } },
      _count: { priority: true },
    });

    const countMap = Object.fromEntries(
      groups.map(g => [g.priority, g._count.priority])
    );

    res.json([
      { priority: 'Low', count: countMap['LOW'] ?? 0, fill: '#22C55E' },
      { priority: 'Medium', count: countMap['MEDIUM'] ?? 0, fill: '#F59E0B' },
      { priority: 'High', count: countMap['HIGH'] ?? 0, fill: '#EF4444' },
    ]);
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