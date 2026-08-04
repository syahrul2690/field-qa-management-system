import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole, requireInstitution } from '../middlewares/roleMiddleware';
import { uploadPdfs } from '../middlewares/uploadMiddleware';
import { Role, InstitutionType } from '@prisma/client';
import * as documentController from '../controllers/documentController';
import { getItpItems, saveItpItems } from '../controllers/reviewController';

export const documentRoutes = Router();

// Reusable multer wrapper that forwards errors to Express error handler
const multerUpload = (req: Parameters<typeof uploadPdfs>[0], res: Parameters<typeof uploadPdfs>[1], next: Parameters<typeof uploadPdfs>[2]) => {
  uploadPdfs(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

// POST /api/documents — Upload a new document (VENDOR only)
documentRoutes.post(
  '/',
  authMiddleware,
  requireRole(Role.VENDOR),
  requireInstitution(InstitutionType.VENDOR),
  multerUpload,
  documentController.uploadDocument,
);

// POST /api/documents/:documentId/revisions — Create a revision (VENDOR only)
documentRoutes.post(
  '/:documentId/revisions',
  authMiddleware,
  requireRole(Role.VENDOR),
  multerUpload,
  documentController.createRevision,
);

// GET /api/documents?boq_item_id=&section= — List documents (authenticated)
documentRoutes.get('/', authMiddleware, documentController.listDocuments);

// GET /api/documents/history?boq_item_id=&section=&doc_number= — Version history (authenticated)
// NOTE: must be declared before /:documentId to avoid route conflict
documentRoutes.get('/history', authMiddleware, documentController.getDocumentHistory);

// GET /api/documents/:documentId — Get single document (authenticated)
documentRoutes.get('/:documentId', authMiddleware, documentController.getDocument);

// GET /api/documents/:documentId/itp-items — List ITP inspection items (authenticated)
documentRoutes.get('/:documentId/itp-items', authMiddleware, getItpItems);

// PUT /api/documents/:documentId/itp-items — Save ITP inspection items (REVIEWER or CHECKER)
documentRoutes.put(
  '/:documentId/itp-items',
  authMiddleware,
  requireRole(Role.REVIEWER, Role.CHECKER),
  saveItpItems,
);
