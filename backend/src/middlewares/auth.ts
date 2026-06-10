import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../types';
import { isTokenBlacklisted } from '../utils/tokenBlacklist';
import type { AuthRequest } from '../types';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  // Try to get token from cookie first, then fall back to Authorization header
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    return next(new UnauthorizedError('Token has been revoked'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
