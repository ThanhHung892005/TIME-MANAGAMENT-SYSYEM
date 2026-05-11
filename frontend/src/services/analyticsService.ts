import { api } from '@/lib/api';
import type { AnalyticsSummary, CompletionData, PomodoroStats, HeatmapData } from '@/types';

class AnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    const res = await api.get<AnalyticsSummary>('/analytics/summary');
    return res.data;
  }

  async getCompletion(): Promise<CompletionData[]> {
    const res = await api.get<CompletionData[]>('/analytics/completion');
    return res.data;
  }

  async getPomodoroStats(): Promise<PomodoroStats> {
    const res = await api.get<PomodoroStats>('/analytics/pomodoro');
    return res.data;
  }

  async getHeatmap(): Promise<HeatmapData[]> {
    const res = await api.get<HeatmapData[]>('/analytics/heatmap');
    return res.data;
  }

  async exportReport(format: 'csv' | 'json' | 'pdf'): Promise<void> {
    const res = await api.get('/analytics/export', {
      params: { format },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const analyticsService = new AnalyticsService();
