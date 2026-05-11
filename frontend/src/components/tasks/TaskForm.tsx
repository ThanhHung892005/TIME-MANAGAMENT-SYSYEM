import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateTask, useUpdateTask, useTask } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
  deadline: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = { title: '', description: '', priority: 'MEDIUM', status: 'TODO', deadline: '' };

export function TaskForm() {
  const { isFormOpen, editingTaskId, closeForm } = useTaskStore();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: editingTask } = useTask(editingTaskId ?? '');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        status: editingTask.status,
        deadline: editingTask.deadline ? editingTask.deadline.split('T')[0] : '',
      });
    } else {
      reset({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', deadline: '' });
    }
  }, [editingTask, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    };
    if (editingTaskId) {
      await updateTask.mutateAsync({ id: editingTaskId, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    closeForm();
    reset();
  };

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
            <select {...register('priority')} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select {...register('status')} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        <Input label="Deadline" type="date" {...register('deadline')} />
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
