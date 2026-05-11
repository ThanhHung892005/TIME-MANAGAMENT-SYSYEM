import React, { useMemo, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';
import { sortTasks } from '@/utils/sortStrategies';
import { taskService } from '@/services/taskService';
import { useQueryClient } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  sortKey: string;
  filters: { status?: string; priority?: string; search: string };
}

export const TaskList = React.memo(function TaskList({ tasks, sortKey, filters }: TaskListProps) {
  const qc = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (filters.status) result = result.filter((t) => t.status === filters.status);
    if (filters.priority) result = result.filter((t) => t.priority === filters.priority);
    if (filters.search) result = result.filter((t) => t.title.toLowerCase().includes(filters.search.toLowerCase()));
    return sortTasks(result, sortKey);
  }, [tasks, filters, sortKey]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex((t) => t.id === active.id);
    const newIndex = filtered.findIndex((t) => t.id === over.id);
    const reordered = [...filtered];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved!);

    await taskService.reorder(reordered.map((t) => t.id));
    qc.invalidateQueries({ queryKey: ['tasks'] });
  }, [filtered, qc]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ClipboardList className="w-12 h-12 mb-3" />
        <p className="text-sm">No tasks found</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {filtered.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
});
