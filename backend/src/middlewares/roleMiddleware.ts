import { Request, Response, NextFunction } from 'express';
import { Role, InstitutionType } from '@prisma/client';
import { AppError } from '../utils/AppError';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

export function requireInstitution(...types: InstitutionType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!types.includes(req.user.institution_type)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}
