import { Request, Response, NextFunction } from 'express';
import { Role, InstitutionType } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        institution_id: string;
        institution_type: InstitutionType;
        unit_id: string;
        unit_level: number;
      };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = authHeader.slice(7);

  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      institution_id: payload.institution_id,
      institution_type: payload.institution_type,
      unit_id: payload.unit_id,
      unit_level: payload.unit_level,
    };
    next();
  } catch (err) {
    next(err);
  }
}
