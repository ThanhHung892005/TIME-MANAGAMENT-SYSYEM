import React, { useCallback, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, MoreVertical, CheckCircle, Circle, Copy, Trash2, RefreshCw, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import type { Task } from '@/types';
import { PRIORITY_COLORS, STATUS_LABELS } from '@/utils/constants';
import { formatDate, getDeadlineColor, isOverdue } from '@/utils/dateHelpers';
import { useDeleteTask, useDuplicateTask, useUpdateTask, useAddSubtask, useUpdateSubtask, useDeleteSubtask } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';

interface TaskCardProps {
  task: Task;
}

export const TaskCard = React.memo(function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const { selectedTaskId, setSelectedTask, openForm, selectedIds, toggleSelect } = useTaskStore();
  const deleteTask = useDeleteTask();
  const duplicateTask = useDuplicateTask();
  const updateTask = useUpdateTask();
  const addSubtask = useAddSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const [menuOpen, setMenuOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const isExpanded = selectedTaskId === task.id;
  const isSelected = selectedIds.includes(task.id);
  const hasSelection = selectedIds.length > 0;

  const handleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  }, [task.id, task.status, updateTask]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!window.confirm(`Xóa task "${task.title}"?`)) return;
    deleteTask.mutate(task.id);
  }, [task.id, task.title, deleteTask]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    duplicateTask.mutate(task.id);
  }, [task.id, duplicateTask]);

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(isExpanded ? null : task.id);
  }, [isExpanded, task.id, setSelectedTask]);

  const handleAddSubtask = useCallback((e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const title = newSubtaskTitle.trim();
    if (!title) return;
    addSubtask.mutate({ taskId: task.id, title }, { onSuccess: () => setNewSubtaskTitle('') });
  }, [newSubtaskTitle, task.id, addSubtask]);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${isDragging ? 'opacity-50 shadow-lg' : ''} ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); toggleSelect(task.id); }}
          className={`mt-1 w-4 h-4 rounded accent-blue-500 cursor-pointer flex-shrink-0 transition-opacity ${hasSelection ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
        <div {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        <button onClick={handleComplete} aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'} className="mt-0.5 flex-shrink-0">
          {isCompleted
            ? <CheckCircle className="w-5 h-5 text-green-500" />
            : <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 truncate ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </p>
            {task.isRecurring && (
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" title="Recurring task" />
            )}
          </div>

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
              <button
                onClick={toggleExpand}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
              >
                {completedSubtasks}/{task.subtasks.length}
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            {task.subtasks.length === 0 && (
              <button
                onClick={toggleExpand}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Plus className="w-3 h-3" /> subtasks
              </button>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
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

      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 pt-3">
          <div className="space-y-1.5 mb-3">
            {task.subtasks.length === 0 && (
              <p className="text-xs text-gray-400 italic">Chưa có subtask nào</p>
            )}
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 group/sub">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  disabled={updateSubtask.isPending}
                  onChange={() => updateSubtask.mutate({ taskId: task.id, subtaskId: subtask.id, data: { completed: !subtask.completed } })}
                  className="w-3.5 h-3.5 rounded text-blue-500 cursor-pointer disabled:opacity-50"
                />
                <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {subtask.title}
                </span>
                <button
                  onClick={() => deleteSubtask.mutate({ taskId: task.id, subtaskId: subtask.id })}
                  className="opacity-0 group-hover/sub:opacity-100 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Thêm subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleAddSubtask}
              className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim() || addSubtask.isPending}
              className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
