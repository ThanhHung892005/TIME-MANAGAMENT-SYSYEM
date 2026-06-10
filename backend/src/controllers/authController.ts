import { Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { blacklistToken } from '../utils/tokenBlacklist';
import type { AuthRequest } from '../types';

export async function sendRegisterOtp(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.sendRegisterOtp(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body);
    // Set httpOnly cookie for JWT
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({ user: result.user }); // Don't send token in body
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    // Set httpOnly cookie for JWT
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ user: result.user }); // Don't send token in body
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

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (token) {
      await blacklistToken(token);
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully' });
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

