import React, { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, MoreVertical, CheckCircle, Circle, Copy, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { PRIORITY_COLORS, STATUS_LABELS } from '@/utils/constants';
import { formatDate, getDeadlineColor, isOverdue } from '@/utils/dateHelpers';
import { useDeleteTask, useDuplicateTask, useUpdateTask } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';

interface TaskCardProps {
  task: Task;
}

export const TaskCard = React.memo(function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const { setSelectedTask, openForm } = useTaskStore();
  const deleteTask = useDeleteTask();
  const duplicateTask = useDuplicateTask();
  const updateTask = useUpdateTask();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  }, [task.id, task.status, updateTask]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    deleteTask.mutate(task.id);
  }, [task.id, deleteTask]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    duplicateTask.mutate(task.id);
  }, [task.id, duplicateTask]);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer ${isDragging ? 'opacity-50 shadow-lg' : ''} ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`}
      onClick={() => setSelectedTask(task.id)}
    >
      <div {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>

      <button onClick={handleComplete} aria-label={task.status === 'COMPLETED' ? 'Mark incomplete' : 'Mark complete'} className="mt-0.5 flex-shrink-0">
        {task.status === 'COMPLETED'
          ? <CheckCircle className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 truncate ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
          <span className="text-xs text-gray-400">{STATUS_LABELS[task.status]}</span>
          {task.deadline && (
            <span className={`flex items-center gap-1 text-xs ${getDeadlineColor(task.deadline)} ${isOverdue(task.deadline) ? 'font-medium' : ''}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.deadline)}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="text-xs text-gray-400">{completedSubtasks}/{task.subtasks.length}</span>
          )}
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          aria-label="Task options"
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1">
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); openForm(task.id); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
            <button onClick={handleDuplicate} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Copy className="w-3 h-3" />Duplicate</button>
            <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 className="w-3 h-3" />Delete</button>
          </div>
        )}
      </div>
    </div>
  );
});
