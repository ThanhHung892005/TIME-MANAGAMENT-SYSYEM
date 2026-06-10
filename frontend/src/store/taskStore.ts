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
  selectedIds: string[];
  setSelectedTask: (id: string | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  openForm: (taskId?: string) => void;
  closeForm: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  selectedTaskId: null,
  filters: { search: '', sort: 'order' },
  isFormOpen: false,
  editingTaskId: null,
  selectedIds: [],

  setSelectedTask: (id) => set({ selectedTaskId: id }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  openForm: (taskId) => set({ isFormOpen: true, editingTaskId: taskId ?? null }),
  closeForm: () => set({ isFormOpen: false, editingTaskId: null }),
  toggleSelect: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((sid) => sid !== id)
      : [...state.selectedIds, id],
  })),
  clearSelection: () => set({ selectedIds: [] }),
}));
