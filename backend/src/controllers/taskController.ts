import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Priority, Status } from '@prisma/client';
import {
  taskService,
  createTaskSchema,
  updateTaskSchema,
  createSubtaskSchema,
  bulkActionSchema,
} from '../services/taskService';
import type { AuthRequest } from '../types';

export async function getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await taskService.getTasks(req.user!.userId, {
      status: req.query['status'] as Status | undefined,
      priority: req.query['priority'] as Priority | undefined,
      search: req.query['search'] as string | undefined,
      tagId: req.query['tagId'] as string | undefined,
      deadlineBefore: req.query['deadlineBefore'] as string | undefined,
      sort: req.query['sort'] as string | undefined,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getToday(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await taskService.getToday(req.user!.userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getUpcoming(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await taskService.getUpcoming(req.user!.userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await taskService.create(req.user!.userId, data);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.getById(req.params['id'] as string, req.user!.userId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateTaskSchema.parse(req.body);
    const task = await taskService.update(req.params['id'] as string, req.user!.userId, data);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.delete(req.params['id'] as string, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkAction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = bulkActionSchema.parse(req.body);
    const result = await taskService.bulkAction(req.user!.userId, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function reorderTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderedIds } = z.object({ orderedIds: z.array(z.string()) }).parse(req.body);
    await taskService.reorder(req.user!.userId, orderedIds);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function duplicateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.duplicate(req.params['id'] as string, req.user!.userId);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function addSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title } = createSubtaskSchema.parse(req.body);
    const subtask = await taskService.addSubtask(req.params['id'] as string, req.user!.userId, title);
    res.status(201).json(subtask);
  } catch (err) {
    next(err);
  }
}

export async function updateSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = z.object({
      title: z.string().min(1).optional(),
      completed: z.boolean().optional(),
    }).parse(req.body);
    const subtask = await taskService.updateSubtask(
      req.params['id'] as string,
      req.params['subtaskId'] as string,
      req.user!.userId,
      data,
    );
    res.json(subtask);
  } catch (err) {
    next(err);
  }
}

export async function deleteSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.deleteSubtask(
      req.params['id'] as string,
      req.params['subtaskId'] as string,
      req.user!.userId,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
