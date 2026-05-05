import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as reviewService from '../services/reviewService';

// GET /verify/:hash
// Public — no auth required
export const verifyQR = asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;

  const data = await reviewService.verifyQR(hash);

  if (!data) {
    throw new AppError('QR code not found or document does not exist', 404);
  }

  res.json({ success: true, data });
});
