import { EventEmitter } from 'events';

export interface OverdueTaskPayload {
  id: string;
  title: string;
  userId: string;
  deadline: Date;
}

class TaskEventEmitter extends EventEmitter {}

export const taskEvents = new TaskEventEmitter();

// Event names — Dev C listens on these
export const TASK_EVENTS = {
  TASKS_OVERDUE: 'tasks:overdue',
} as const;
