import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as boqService from '../services/boqService';

// POST /api/projects/:projectId/boq/upload
export const uploadBoq = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded. Use field name "boq_file".', 400);
  }

  const { projectId } = req.params;
  const result = await boqService.uploadBoq(projectId, req.file.path);

  res.status(201).json({
    success: true,
    message: `BoQ uploaded successfully. ${result.count} items created.`,
    data: result,
  });
});

// GET /api/projects/:projectId/boq
export const getBoqTree = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const tree = await boqService.getBoqTree(projectId);

  res.json({ success: true, data: tree });
});

// DELETE /api/projects/:projectId/boq
export const clearBoq = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  await boqService.clearBoq(projectId);

  res.json({ success: true, message: 'BoQ cleared. You may now re-upload.' });
});

// GET /api/boq/:itemId
export const getBoqItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const item = await boqService.getBoqItem(itemId);

  res.json({ success: true, data: item });
});

// GET /api/boq/:itemId/children
export const getBoqItemChildren = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const children = await boqService.getBoqItemChildren(itemId);

  res.json({ success: true, data: children });
});
