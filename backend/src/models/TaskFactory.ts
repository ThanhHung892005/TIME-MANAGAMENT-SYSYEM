import { Priority, Status } from '@prisma/client';

interface TaskDefaults {
  priority: Priority;
  status: Status;
  tags: string[];
}

type TaskType = 'personal' | 'work' | 'study' | 'recurring';

/**
 * Factory Pattern: produces default task configurations per type.
 */
export class TaskFactory {
  static createDefaults(type: TaskType): TaskDefaults {
    const map: Record<TaskType, TaskDefaults> = {
      personal: { priority: Priority.LOW, status: Status.TODO, tags: ['Personal'] },
      work:     { priority: Priority.HIGH, status: Status.TODO, tags: ['Work'] },
      study:    { priority: Priority.MEDIUM, status: Status.TODO, tags: ['Study'] },
      recurring:{ priority: Priority.MEDIUM, status: Status.TODO, tags: [] },
    };
    return map[type] ?? map.personal;
  }
}
