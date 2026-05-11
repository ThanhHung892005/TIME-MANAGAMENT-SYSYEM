import { api } from '@/lib/api';
import type { PomodoroSession } from '@/types';

class PomodoroService {
  async startSession(data: { duration: number; type: 'work' | 'break'; taskId?: string }): Promise<PomodoroSession> {
    const res = await api.post<PomodoroSession>('/pomodoro/start', data);
    return res.data;
  }

  async endSession(id: string): Promise<PomodoroSession> {
    const res = await api.patch<PomodoroSession>(`/pomodoro/${id}/end`);
    return res.data;
  }

  async getHistory(limit?: number): Promise<PomodoroSession[]> {
    const res = await api.get<PomodoroSession[]>('/pomodoro/history', { params: { limit } });
    return res.data;
  }
}

export const pomodoroService = new PomodoroService();
