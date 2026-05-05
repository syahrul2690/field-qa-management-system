import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

describe('asyncHandler', () => {
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const mockNext = vi.fn() as NextFunction;

  it('should pass resolved promise to next middleware', async () => {
    const handler = asyncHandler(async (_req, _res, next) => {
      next();
    });
    await handler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should catch rejected promise and call next with error', async () => {
    const error = new Error('Async error');
    const handler = asyncHandler(async () => {
      throw error;
    });
    await handler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle synchronous errors', async () => {
    const error = new Error('Sync error');
    const handler = asyncHandler(async () => {
      throw error;
    });
    await handler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
