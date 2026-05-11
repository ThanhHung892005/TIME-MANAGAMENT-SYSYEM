import { create } from 'zustand';
import type { Priority, Status } from '@/types';

interface TaskFilters {
  status?: Status;
  priority?: Priority;
  search: string;
  tagId?: string;
  sort: 'order' | 'deadline' | 'priority';
}

interface TaskStore {
  selectedTaskId: string | null;
  filters: TaskFilters;
  isFormOpen: boolean;
  editingTaskId: string | null;
  setSelectedTask: (id: string | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  openForm: (taskId?: string) => void;
  closeForm: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  selectedTaskId: null,
  filters: { search: '', sort: 'order' },
  isFormOpen: false,
  editingTaskId: null,

  setSelectedTask: (id) => set({ selectedTaskId: id }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  openForm: (taskId) => set({ isFormOpen: true, editingTaskId: taskId ?? null }),
  closeForm: () => set({ isFormOpen: false, editingTaskId: null }),
}));
