import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../types';

class PomodoroService {
  async startSession(userId: string, data: { duration: number; type: string; taskId?: string }) {
    return prisma.pomodoroSession.create({
      data: { ...data, userId },
      include: { task: { select: { id: true, title: true } } },
    });
  }

  async endSession(sessionId: string, userId: string) {
    const session = await prisma.pomodoroSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundError('Session not found');
    if (session.userId !== userId) throw new ForbiddenError();

    return prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
  }

  async getHistory(userId: string, limit = 50) {
    return prisma.pomodoroSession.findMany({
      where: { userId },
      include: { task: { select: { id: true, title: true } } },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }
}

export const pomodoroService = new PomodoroService();
