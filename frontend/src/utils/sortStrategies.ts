import type { Task } from '@/types';

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

export interface SortStrategy {
  sort(tasks: Task[]): Task[];
}

export class SortByOrder implements SortStrategy {
  sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => a.order - b.order);
  }
}

export class SortByDeadline implements SortStrategy {
  sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }
}

export class SortByPriority implements SortStrategy {
  sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }
}

const strategies: Record<string, SortStrategy> = {
  order: new SortByOrder(),
  deadline: new SortByDeadline(),
  priority: new SortByPriority(),
};

export function sortTasks(tasks: Task[], sortKey: string): Task[] {
  return (strategies[sortKey] ?? strategies['order']!).sort(tasks);
}
