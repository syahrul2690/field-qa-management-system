import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'];

  if (!config.integration.apiKey) {
    res.status(500).json({ success: false, message: 'Integration API key not configured' });
    return;
  }

  if (!key || key !== config.integration.apiKey) {
    res.status(401).json({ success: false, message: 'Invalid or missing API key' });
    return;
  }

  next();
}
