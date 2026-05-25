import { Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import type { AuthRequest } from '../types';

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json(result);
  } catch (err) {
      next(err);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next:NextFunction): Promise<void> {
  try {
    const result = await authService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({message: 'Logged out successfully'});
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
