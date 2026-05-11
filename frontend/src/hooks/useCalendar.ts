import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Task } from '@/types';
import toast from 'react-hot-toast';

export function useCalendarTasks(start: Date, end: Date) {
  return useQuery({
    queryKey: ['calendar', start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const res = await api.get<Task[]>('/calendar/tasks', {
        params: { start: start.toISOString(), end: end.toISOString() },
      });
      return res.data;
    },
  });
}

export function useUpdateDeadline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deadline }: { id: string; deadline: string | null }) =>
      api.patch(`/calendar/tasks/${id}/deadline`, { deadline }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Deadline updated!');
    },
    onError: () => toast.error('Failed to update deadline'),
  });
}
