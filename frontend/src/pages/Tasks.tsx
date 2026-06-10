import { useMemo } from 'react';
import { Plus, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useTasks, useBulkAction } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';

export function Tasks() {
  const { filters, openForm, selectedIds, clearSelection } = useTaskStore();
  const bulkAction = useBulkAction();

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

  const handleBulkComplete = () => {
    bulkAction.mutate({ ids: selectedIds, action: 'complete' }, { onSuccess: clearSelection });
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Xóa ${selectedIds.length} task đã chọn?`)) return;
    bulkAction.mutate({ ids: selectedIds, action: 'delete' }, { onSuccess: clearSelection });
  };

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

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl shadow-2xl border border-gray-700 dark:border-gray-300">
          <span className="text-sm font-medium">{selectedIds.length} task đã chọn</span>
          <div className="w-px h-4 bg-gray-600 dark:bg-gray-400" />
          <button
            onClick={handleBulkComplete}
            disabled={bulkAction.isPending}
            className="flex items-center gap-1.5 text-sm font-medium text-green-400 dark:text-green-600 hover:text-green-300 dark:hover:text-green-500 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Hoàn thành
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkAction.isPending}
            className="flex items-center gap-1.5 text-sm font-medium text-red-400 dark:text-red-600 hover:text-red-300 dark:hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
          <button
            onClick={clearSelection}
            className="p-1 rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
