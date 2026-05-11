export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  taskId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  deadline: string | null;
  order: number;
  userId: string;
  subtasks: Subtask[];
  tags: Array<{ taskId: string; tagId: string; tag: Tag }>;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  duration: number;
  type: 'work' | 'break';
  taskId: string | null;
  task: { id: string; title: string } | null;
  userId: string;
  startedAt: string;
  endedAt: string | null;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  deadline?: string | null;
  tagIds?: string[];
  type?: 'personal' | 'work' | 'study' | 'recurring';
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  order?: number;
}

export interface AnalyticsSummary {
  completedToday: number;
  totalTasks: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    priority: Priority;
  }>;
  totalSessions: number;
  completionRate: number;
}

export interface CompletionData {
  date: string;
  completed: number;
}

export interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
  avgMinutes: number;
}

export interface HeatmapData {
  date: string;
  count: number;
}
