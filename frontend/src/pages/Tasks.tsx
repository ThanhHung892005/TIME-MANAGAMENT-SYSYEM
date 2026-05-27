import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';

export function Tasks() {
  const { filters, openForm } = useTaskStore();

  const serverParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (filters.status) p['status'] = filters.status;
    if (filters.priority) p['priority'] = filters.priority;
    if (filters.search) p['search'] = filters.search;
    if (filters.tagId) p['tagId'] = filters.tagId;
    if (filters.sort && filters.sort !== 'order') p['sort'] = filters.sort;
    return p;
  }, [filters.status, filters.priority, filters.search, filters.tagId, filters.sort]);

  const { data: tasks = [], isLoading } = useTasks(serverParams);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
        <Button onClick={() => openForm()} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      <div className="mb-5">
        <TaskFilters />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <TaskList tasks={tasks} sortKey={filters.sort} filters={{ search: '' }} />
      )}

      <TaskForm />
    </div>
  );
}
