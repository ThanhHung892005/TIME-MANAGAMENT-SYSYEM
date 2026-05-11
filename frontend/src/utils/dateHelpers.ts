import { format, formatDistanceToNow, isPast, isWithinInterval, addHours } from 'date-fns';

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt);
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return isPast(new Date(deadline));
}

export function isDueSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  return isWithinInterval(d, { start: new Date(), end: addHours(new Date(), 24) });
}

export function getDeadlineColor(deadline: string | null): string {
  if (!deadline) return 'text-gray-400';
  if (isOverdue(deadline)) return 'text-red-500';
  if (isDueSoon(deadline)) return 'text-yellow-500';
  return 'text-green-500';
}
