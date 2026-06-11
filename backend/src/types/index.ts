import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  email: string;
}

// Make passport's req.user compatible with our AuthPayload
declare global {
  namespace Express {
    interface User extends AuthPayload {}
  }
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

// Re-export errors for backwards compatibility
export { AppError, ValidationError, UnauthorizedError, NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';
