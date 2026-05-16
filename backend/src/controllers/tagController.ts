import { Response, NextFunction } from 'express';
import { tagService } from '../services/tagService';
import type { AuthRequest } from '../types';

export async function getTags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await tagService.getTags(req.user!.userId);
    res.json(tags);
  } catch (err) {
    next(err);
  }
}

export async function createTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await tagService.createTag(req.user!.userId, req.body);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
}

export async function updateTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tag = await tagService.updateTag(req.user!.userId, tagId, req.body);
    res.json(tag);
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await tagService.deleteTag(req.user!.userId, tagId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
