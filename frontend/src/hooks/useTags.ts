import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tagService } from '@/services/tagService';
import type { CreateTagDTO, UpdateTagDTO } from '@/services/tagService';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getAll(),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagDTO) => tagService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created!');
    },
    onError: () => toast.error('Failed to create tag'),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDTO }) => tagService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tag updated!');
    },
    onError: () => toast.error('Failed to update tag'),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tag deleted');
    },
    onError: () => toast.error('Failed to delete tag'),
  });
}
