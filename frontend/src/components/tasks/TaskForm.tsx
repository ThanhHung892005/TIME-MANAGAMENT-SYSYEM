import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateTask, useUpdateTask, useTask } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';
import { tagService } from '@/services/tagService';
import type { Tag } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
  deadline: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  deadline: '',
  isRecurring: false,
  recurringType: undefined,
};

export function TaskForm() {
  const { isFormOpen, editingTaskId, closeForm } = useTaskStore();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: editingTask } = useTask(editingTaskId ?? '');
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => tagService.getAll(),
  });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const isRecurring = watch('isRecurring');

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        status: editingTask.status === 'OVERDUE' ? 'TODO' : editingTask.status,
        deadline: editingTask.deadline ? editingTask.deadline.split('T')[0] : '',
        isRecurring: editingTask.isRecurring,
        recurringType: editingTask.recurringType ?? undefined,
      });
      setSelectedTagIds(editingTask.tags.map((t) => t.tagId));
    } else {
      reset(DEFAULT_VALUES);
      setSelectedTagIds([]);
    }
  }, [editingTask, reset]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      recurringType: data.isRecurring ? data.recurringType : undefined,
      tagIds: selectedTagIds,
    };
    if (editingTaskId) {
      await updateTask.mutateAsync({ id: editingTaskId, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    closeForm();
    reset();
  };

  const selectCls = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100';

  return (
    <Modal
      isOpen={isFormOpen}
      onClose={closeForm}
      title={editingTaskId ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} autoFocus />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select {...register('priority')} className={selectCls}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select {...register('status')} className={selectCls}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <Input label="Deadline" type="date" {...register('deadline')} />

        {/* Recurring */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isRecurring')} className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recurring task</span>
          </label>
          {isRecurring && (
            <select {...register('recurringType')} className={selectCls}>
              <option value="">Select frequency</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'text-white border-transparent'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                    style={selected ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>
            {editingTaskId ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
