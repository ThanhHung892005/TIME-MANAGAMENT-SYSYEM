export const PRIORITY_COLORS = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
} as const;

export const STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
} as const;

export const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
  OVERDUE: 'Overdue',
} as const;

export const PRIORITY_LABELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

export const POMODORO_PRESETS = {
  standard: { workMinutes: 25, breakMinutes: 5, longBreakMinutes: 15 },
  long: { workMinutes: 50, breakMinutes: 10, longBreakMinutes: 30 },
} as const;
