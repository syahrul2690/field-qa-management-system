import { Router } from 'express';
import { authMiddleware as authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { uploadExcel } from '../middlewares/uploadMiddleware';
import * as boqController from '../controllers/boqController';
import { Role } from '@prisma/client';

// ─── Routes mounted on /api/projects ─────────────────────────────────────────
// e.g. POST /api/projects/:projectId/boq/upload

export const boqProjectRoutes = Router({ mergeParams: true });

boqProjectRoutes.post(
  '/:projectId/boq/upload',
  authenticate,
  requireRole(Role.VENDOR, Role.PIC_PROJECT, Role.ADMIN),
  (req, res, next) => {
    // Wrap multer to forward errors to Express error handler
    uploadExcel(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  boqController.uploadBoq,
);

boqProjectRoutes.get('/:projectId/boq', authenticate, boqController.getBoqTree);

boqProjectRoutes.delete(
  '/:projectId/boq',
  authenticate,
  requireRole(Role.PIC_PROJECT, Role.ADMIN),
  boqController.clearBoq,
);

// ─── Routes mounted on /api/boq ───────────────────────────────────────────────
// e.g. GET /api/boq/:itemId

export const boqItemRoutes = Router();

boqItemRoutes.get('/:itemId', authenticate, boqController.getBoqItem);
boqItemRoutes.get('/:itemId/children', authenticate, boqController.getBoqItemChildren);
