import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsService.getSummary,
    staleTime: 60 * 1000,
  });
}

export function useCompletion() {
  return useQuery({
    queryKey: ['analytics', 'completion'],
    queryFn: analyticsService.getCompletion,
  });
}

export function usePomodoroStats() {
  return useQuery({
    queryKey: ['analytics', 'pomodoro'],
    queryFn: analyticsService.getPomodoroStats,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: analyticsService.getHeatmap,
  });
}
export function useOverdueStats() {
  return useQuery({
    queryKey: ['analytics', 'overdue'],
    queryFn: () => analyticsService.getOverdueStats(),
    staleTime: 60 * 1000,
  });
}

export function usePriorityStats() {
  return useQuery({
    queryKey: ['analytics', 'priority'],
    queryFn: () => analyticsService.getPriorityStats(),
    staleTime: 60 * 1000,
  });
}