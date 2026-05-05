import { describe, it, expect, vi } from 'vitest';
import { AppError } from '../utils/AppError';

describe('AppError', () => {
  it('should create an operational error with default status code 500', () => {
    const err = new AppError('Something went wrong');
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.errors).toBeUndefined();
  });

  it('should accept custom status code and operational flag', () => {
    const err = new AppError('Not found', 404, true);
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it('should accept validation errors array', () => {
    const errors = [{ field: 'email', message: 'Invalid' }];
    const err = new AppError('Validation failed', 400, true, errors);
    expect(err.errors).toEqual(errors);
  });

  it('should be an instance of Error', () => {
    const err = new AppError('Test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});
