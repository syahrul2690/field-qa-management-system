import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { Role } from '@prisma/client';
import {
  submitForReview,
  addReviewerAndComments,
  checkDocument,
  approveDocument,
  getReviewByDocument,
  getReviewById,
  getPendingReviews,
  downloadCommentSheet,
  uploadAmsLetter,
  getNotifications,
  assignReviewTeam,
  getCommentSheetItems,
  saveCommentSheetItems,
} from '../controllers/reviewController';
import { uploadAmsPdf } from '../middlewares/uploadMiddleware';

export const reviewRoutes = Router();

// GET /reviews/notifications — role-aware notifications (must be before /:reviewId)
reviewRoutes.get(
  '/notifications',
  authMiddleware,
  requireRole(Role.REVIEWER, Role.CHECKER, Role.APPROVER, Role.PIC_CONSULTANT, Role.VENDOR),
  getNotifications,
);

// GET /reviews/pending — must be registered before /:reviewId to avoid shadowing
reviewRoutes.get(
  '/pending',
  authMiddleware,
  requireRole(Role.REVIEWER, Role.CHECKER, Role.APPROVER, Role.PIC_CONSULTANT, Role.PIC_PROJECT),
  getPendingReviews,
);

// GET /reviews?document_id=...
reviewRoutes.get('/', authMiddleware, getReviewByDocument);

// POST /reviews
reviewRoutes.post('/', authMiddleware, requireRole(Role.VENDOR), submitForReview);

// GET /reviews/:reviewId
reviewRoutes.get('/:reviewId', authMiddleware, getReviewById);

// POST /reviews/:reviewId/assign — PIC_CONSULTANT assigns reviewer (+ optional checker/approver)
reviewRoutes.post(
  '/:reviewId/assign',
  authMiddleware,
  requireRole(Role.PIC_CONSULTANT),
  assignReviewTeam,
);

// POST /reviews/:reviewId/review
reviewRoutes.post(
  '/:reviewId/review',
  authMiddleware,
  requireRole(Role.REVIEWER),
  addReviewerAndComments,
);

// POST /reviews/:reviewId/check
reviewRoutes.post(
  '/:reviewId/check',
  authMiddleware,
  requireRole(Role.CHECKER),
  checkDocument,
);

// POST /reviews/:reviewId/approve
reviewRoutes.post(
  '/:reviewId/approve',
  authMiddleware,
  requireRole(Role.APPROVER),
  approveDocument,
);

// GET /reviews/:reviewId/comment-sheet — generate & stream PDF
reviewRoutes.get('/:reviewId/comment-sheet', authMiddleware, downloadCommentSheet);

// GET /reviews/:reviewId/comment-sheet-items
reviewRoutes.get('/:reviewId/comment-sheet-items', authMiddleware, getCommentSheetItems);

// PUT /reviews/:reviewId/comment-sheet-items — REVIEWER or CHECKER
reviewRoutes.put(
  '/:reviewId/comment-sheet-items',
  authMiddleware,
  requireRole(Role.REVIEWER, Role.CHECKER),
  saveCommentSheetItems,
);

// POST /reviews/:reviewId/ams-letter — REVIEWER only, single PDF field: ams_file
reviewRoutes.post(
  '/:reviewId/ams-letter',
  authMiddleware,
  requireRole(Role.REVIEWER),
  (req, res, next) => {
    uploadAmsPdf(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  uploadAmsLetter,
);
