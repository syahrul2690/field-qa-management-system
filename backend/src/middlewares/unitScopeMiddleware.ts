import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function requireUnitLevel(level: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (req.user.unit_level !== level) {
      return next(new AppError('This action requires a different unit level', 403));
    }

    next();
  };
}

export function requireUnitLevelMin(minLevel: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (req.user.unit_level < minLevel) {
      return next(new AppError('This action requires a different unit level', 403));
    }

    next();
  };
}
