import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction, Request, Response } from 'express';

const mockConfig = vi.hoisted(() => ({
  integration: { apiKey: 'shared-integration-secret' },
}));

vi.mock('../config', () => ({ config: mockConfig }));

import { apiKeyMiddleware } from '../middlewares/apiKeyMiddleware';

describe('apiKeyMiddleware', () => {
  const status = vi.fn();
  const json = vi.fn();
  const response = { status, json } as unknown as Response;
  const next = vi.fn() as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    status.mockReturnValue(response);
    mockConfig.integration.apiKey = 'shared-integration-secret';
  });

  it('returns 500 when the server integration key is not configured', () => {
    mockConfig.integration.apiKey = '';

    apiKeyMiddleware({ headers: {} } as Request, response, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Integration API key not configured',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', undefined],
    ['incorrect', 'wrong-secret'],
  ])('returns 401 for a %s request key', (_label, requestKey) => {
    const headers = requestKey ? { 'x-api-key': requestKey } : {};

    apiKeyMiddleware({ headers } as Request, response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or missing API key',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a request with the configured key', () => {
    apiKeyMiddleware(
      { headers: { 'x-api-key': 'shared-integration-secret' } } as unknown as Request,
      response,
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });
});
