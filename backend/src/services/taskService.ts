import { z } from 'zod';
import { Priority, Status } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../types';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(Status).default(Status.TODO),
  deadline: z.string().datetime().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  type: z.enum(['personal', 'work', 'study', 'recurring']).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  order: z.number().int().optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

const taskInclude = {
  subtasks: { orderBy: { order: 'asc' as const } },
  tags: { include: { tag: true } },
} as const;

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
    await this.getById(id, userId);
    const { tagIds, deadline, ...rest } = data;

    return prisma.task.update({
      where: { id },
      data: {
        ...rest,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
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

  async reorder(userId: string, orderedIds: string[]) {
    await Promise.all(
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
}

export const taskService = new TaskService();
