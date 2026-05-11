import { Task, Priority } from '@prisma/client';

/** Strategy Pattern: interchangeable sort algorithms for tasks */
export interface SortStrategy {
  sort(tasks: Task[]): Task[];
}

const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export class SortByDeadline implements SortStrategy {
  sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });
  }
}

export class SortByPriority implements SortStrategy {
  sort(tasks: Task[]): Task[] {
    return [...tasks].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    );
  }
}

export class SortByCreatedDate implements SortStrategy {
  sort(tasks: Task[]): Task[] {
    return [...tasks].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}

export class TaskSorter {
  constructor(private strategy: SortStrategy) {}

  sortTasks(tasks: Task[]): Task[] {
    return this.strategy.sort(tasks);
  }

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }
}
