import { z } from 'zod';
import { Priority, Status, RecurringType } from '@prisma/client';
import { addDays, addWeeks, addMonths, startOfDay, endOfDay } from 'date-fns';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../types';
import { taskEvents, TASK_EVENTS, type OverdueTaskPayload } from '../events/taskEvents';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(Status).default(Status.TODO),
  deadline: z.string().datetime().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  type: z.enum(['personal', 'work', 'study', 'recurring']).optional(),
  isRecurring: z.boolean().optional(),
  recurringType: z.nativeEnum(RecurringType).optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  order: z.number().int().optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(['complete', 'archive', 'delete', 'updateStatus']),
  status: z.nativeEnum(Status).optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type BulkActionDTO = z.infer<typeof bulkActionSchema>;

const taskInclude = {
  subtasks: { orderBy: { order: 'asc' as const } },
  tags: { include: { tag: true } },
} as const;

function computeNextDueAt(deadline: Date, recurringType: RecurringType): Date {
  switch (recurringType) {
    case RecurringType.DAILY:   return addDays(deadline, 1);
    case RecurringType.WEEKLY:  return addWeeks(deadline, 1);
    case RecurringType.MONTHLY: return addMonths(deadline, 1);
  }
}

class TaskService {
  async getTasks(userId: string, filters: {
    status?: Status;
    priority?: Priority;
    search?: string;
    tagId?: string;
    deadlineBefore?: string;
    sort?: string;
  }) {
    const where: Record<string, unknown> = { userId };

    if (filters.status) where['status'] = filters.status;
    if (filters.priority) where['priority'] = filters.priority;
    if (filters.search) where['title'] = { contains: filters.search, mode: 'insensitive' };
    if (filters.tagId) where['tags'] = { some: { tagId: filters.tagId } };
    if (filters.deadlineBefore) where['deadline'] = { lte: new Date(filters.deadlineBefore) };

    const orderBy = filters.sort === 'deadline'
      ? { deadline: 'asc' as const }
      : filters.sort === 'priority'
        ? { priority: 'asc' as const }
        : { order: 'asc' as const };

    return prisma.task.findMany({ where, include: taskInclude, orderBy });
  }

  // Tasks with deadline = today (not completed/archived)
  async getToday(userId: string) {
    const now = new Date();
    return prisma.task.findMany({
      where: {
        userId,
        status: { notIn: [Status.COMPLETED, Status.ARCHIVED] },
        deadline: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
      },
      include: taskInclude,
      orderBy: { deadline: 'asc' },
    });
  }

  // Tasks with deadline in the next 7 days (after today, not completed/archived)
  async getUpcoming(userId: string) {
    const now = new Date();
    const in7Days = addDays(now, 7);
    return prisma.task.findMany({
      where: {
        userId,
        status: { notIn: [Status.COMPLETED, Status.ARCHIVED] },
        deadline: {
          gt: endOfDay(now),
          lte: endOfDay(in7Days),
        },
      },
      include: taskInclude,
      orderBy: { deadline: 'asc' },
    });
  }

  async getById(id: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
    if (!task) throw new NotFoundError('Task not found');
    if (task.userId !== userId) throw new ForbiddenError();
    return task;
  }

  async create(userId: string, data: CreateTaskDTO) {
    const { tagIds, type: _type, deadline, ...rest } = data;
    return prisma.task.create({
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : undefined,
        userId,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
      },
      include: taskInclude,
    });
  }

  async update(id: string, userId: string, data: UpdateTaskDTO) {
    const existing = await this.getById(id, userId);
    const { tagIds, deadline, ...rest } = data;

    const resolvedDeadline = deadline !== undefined
      ? (deadline ? new Date(deadline) : null)
      : undefined;

    // Recurring: completing a recurring task spawns the next occurrence
    let nextDueAt: Date | undefined;
    if (
      data.status === Status.COMPLETED &&
      existing.isRecurring &&
      existing.recurringType &&
      (resolvedDeadline ?? existing.deadline)
    ) {
      const base = resolvedDeadline ?? existing.deadline!;
      nextDueAt = computeNextDueAt(base, existing.recurringType);

      await prisma.task.create({
        data: {
          title: existing.title,
          description: existing.description ?? undefined,
          priority: existing.priority,
          status: Status.TODO,
          deadline: nextDueAt,
          isRecurring: true,
          recurringType: existing.recurringType,
          order: existing.order,
          userId,
          subtasks: {
            create: existing.subtasks.map((s: { title: string; order: number }) => ({
              title: s.title,
              order: s.order,
            })),
          },
          tags: {
            create: existing.tags.map((t: { tagId: string }) => ({
              tag: { connect: { id: t.tagId } },
            })),
          },
        },
      });
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...rest,
        deadline: resolvedDeadline,
        ...(nextDueAt && { nextDueAt }),
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
          },
        }),
      },
      include: taskInclude,
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.task.delete({ where: { id } });
  }

  // Bulk: complete / archive / delete / updateStatus on multiple task IDs
  async bulkAction(userId: string, data: BulkActionDTO) {
    const owned = await prisma.task.findMany({
      where: { id: { in: data.ids }, userId },
      select: { id: true },
    });
    const ownedIds = owned.map((t) => t.id);

    if (data.action === 'delete') {
      const result = await prisma.task.deleteMany({ where: { id: { in: ownedIds } } });
      return { affected: result.count };
    }

    const newStatus =
      data.action === 'complete'     ? Status.COMPLETED
      : data.action === 'archive'    ? Status.ARCHIVED
      : (data.status ?? Status.TODO);

    const result = await prisma.task.updateMany({
      where: { id: { in: ownedIds } },
      data: { status: newStatus },
    });
    return { affected: result.count };
  }

  async reorder(userId: string, orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.task.updateMany({ where: { id, userId }, data: { order: index } }),
      ),
    );
  }

  async duplicate(id: string, userId: string) {
    const task = await this.getById(id, userId);
    const { id: _id, createdAt: _c, updatedAt: _u, subtasks, tags, ...rest } = task;
    return prisma.task.create({
      data: {
        ...rest,
        title: `${task.title} (copy)`,
        status: Status.TODO,
        subtasks: {
          create: subtasks.map((s: { title: string; order: number }) => ({ title: s.title, order: s.order })),
        },
        tags: {
          create: tags.map((t: { tagId: string }) => ({ tag: { connect: { id: t.tagId } } })),
        },
      },
      include: taskInclude,
    });
  }

  async addSubtask(taskId: string, userId: string, title: string) {
    await this.getById(taskId, userId);
    const count = await prisma.subtask.count({ where: { taskId } });
    return prisma.subtask.create({ data: { title, taskId, order: count } });
  }

  async updateSubtask(taskId: string, subtaskId: string, userId: string, data: { title?: string; completed?: boolean }) {
    await this.getById(taskId, userId);
    return prisma.subtask.update({ where: { id: subtaskId }, data });
  }

  async deleteSubtask(taskId: string, subtaskId: string, userId: string) {
    await this.getById(taskId, userId);
    await prisma.subtask.delete({ where: { id: subtaskId } });
  }

  // Called by cron job — marks TODO/IN_PROGRESS tasks past deadline as OVERDUE,
  // then emits TASKS_OVERDUE so Dev C can trigger push notifications.
  async markOverdueTasks(): Promise<number> {
    const now = new Date();

    const targets = await prisma.task.findMany({
      where: {
        deadline: { lt: now },
        status: { in: [Status.TODO, Status.IN_PROGRESS] },
      },
      select: { id: true, title: true, userId: true, deadline: true },
    });

    if (targets.length === 0) return 0;

    await prisma.task.updateMany({
      where: { id: { in: targets.map((t) => t.id) } },
      data: { status: Status.OVERDUE },
    });

    // Emit event for Dev C (push notification handler)
    const payload: OverdueTaskPayload[] = targets.map((t) => ({
      id: t.id,
      title: t.title,
      userId: t.userId,
      deadline: t.deadline!,
    }));
    taskEvents.emit(TASK_EVENTS.TASKS_OVERDUE, payload);

    return targets.length;
  }
}

export const taskService = new TaskService();
