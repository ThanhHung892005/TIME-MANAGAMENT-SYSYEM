import { api } from '@/lib/api';
import type { Task, CreateTaskDTO, UpdateTaskDTO, Subtask, Status } from '@/types';

export interface BulkActionDTO {
  ids: string[];
  action: 'complete' | 'archive' | 'delete' | 'updateStatus';
  status?: Status;
}

class TaskService {
  async getAll(params?: Record<string, string>): Promise<Task[]> {
    const res = await api.get<Task[]>('/tasks', { params });
    return res.data;
  }

  async getToday(): Promise<Task[]> {
    const res = await api.get<Task[]>('/tasks/today');
    return res.data;
  }

  async getUpcoming(): Promise<Task[]> {
    const res = await api.get<Task[]>('/tasks/upcoming');
    return res.data;
  }

  async getById(id: string): Promise<Task> {
    const res = await api.get<Task>(`/tasks/${id}`);
    return res.data;
  }

  async create(data: CreateTaskDTO): Promise<Task> {
    const res = await api.post<Task>('/tasks', data);
    return res.data;
  }

  async update(id: string, data: UpdateTaskDTO): Promise<Task> {
    const res = await api.patch<Task>(`/tasks/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await api.patch('/tasks/reorder', { orderedIds });
  }

  async duplicate(id: string): Promise<Task> {
    const res = await api.post<Task>(`/tasks/${id}/duplicate`);
    return res.data;
  }

  async bulkAction(data: BulkActionDTO): Promise<{ affected: number }> {
    const res = await api.patch<{ affected: number }>('/tasks/bulk', data);
    return res.data;
  }

  async addSubtask(taskId: string, title: string): Promise<Subtask> {
    const res = await api.post<Subtask>(`/tasks/${taskId}/subtasks`, { title });
    return res.data;
  }

  async updateSubtask(taskId: string, subtaskId: string, data: { title?: string; completed?: boolean }): Promise<Subtask> {
    const res = await api.patch<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, data);
    return res.data;
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  }
}

export const taskService = new TaskService();
