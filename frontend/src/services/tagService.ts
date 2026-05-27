import { api } from '@/lib/api';
import type { Tag } from '@/types';

export interface CreateTagDTO {
  name: string;
  color?: string;
}

export interface UpdateTagDTO {
  name?: string;
  color?: string;
}

class TagService {
  async getAll(): Promise<Tag[]> {
    const res = await api.get<Tag[]>('/tags');
    return res.data;
  }

  async create(data: CreateTagDTO): Promise<Tag> {
    const res = await api.post<Tag>('/tags', data);
    return res.data;
  }

  async update(id: string, data: UpdateTagDTO): Promise<Tag> {
    const res = await api.patch<Tag>(`/tags/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  }
}

export const tagService = new TagService();
