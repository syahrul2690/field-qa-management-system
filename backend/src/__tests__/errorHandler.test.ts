import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middlewares/errorHandler';
import { AppError } from '../utils/AppError';
import { ZodError, z } from 'zod';

vi.mock('../config', () => ({
  config: {
    isDev: false,
  },
}));

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    mockRes = {
      status: statusSpy as unknown as Response['status'],
      json: jsonSpy as unknown as Response['json'],
    };
    mockReq = {};
    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should handle AppError with correct status code', () => {
    const err = new AppError('Forbidden', 403);
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(statusSpy).toHaveBeenCalledWith(403);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden',
    });
  });

  it('should handle AppError with errors array', () => {
    const validationErrors = [{ field: 'name', issue: 'required' }];
    const err = new AppError('Validation failed', 400, true, validationErrors);
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      })
    );
  });

  it('should handle ZodError with 400 status', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 123 });
    if (!result.success) {
      errorHandler(result.error, mockReq as Request, mockRes as Response, mockNext);
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation Error',
          errors: expect.any(Array),
        })
      );
    }
  });

  it('should handle Prisma P2002 unique constraint as 409', () => {
    const err = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(statusSpy).toHaveBeenCalledWith(409);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'A record with this value already exists.',
    });
  });

  it('should handle Prisma P2025 not found as 404', () => {
    const err = Object.assign(new Error('Record not found'), { code: 'P2025' });
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(statusSpy).toHaveBeenCalledWith(404);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Record not found.',
    });
  });

  it('should handle unknown errors as 500', () => {
    const err = new Error('Something broke');
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    });
  });
});
