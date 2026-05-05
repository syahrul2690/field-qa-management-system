import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: ErrorResponse = {
      success: false,
      message: err.message,
    };
    if (err.errors) body.errors = err.errors;
    if (config.isDev) body.stack = err.stack;
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ErrorResponse = {
      success: false,
      message: 'Validation Error',
      errors: err.errors,
    };
    if (config.isDev) body.stack = err.stack;
    res.status(400).json(body);
    return;
  }

  // Prisma unique constraint
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
    return;
  }

  // Prisma not found
  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
    return;
  }

  console.error('[Unhandled Error]', err);
  const body: ErrorResponse = {
    success: false,
    message: 'Internal server error',
  };
  if (config.isDev) body.stack = err.stack;
  res.status(500).json(body);
}
