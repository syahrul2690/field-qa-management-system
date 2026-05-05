import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';
import * as reviewService from '../services/reviewService';
import { generateCommentSheet } from '../utils/pdfEngine/commentSheetGenerator';
import path from 'path';
import fs from 'fs';

// POST /reviews
// Body: { document_id }
// Requires VENDOR role
export const submitForReview = asyncHandler(async (req: Request, res: Response) => {
  const { document_id } = req.body;

  if (!document_id) {
    throw new AppError('document_id is required', 400);
  }

  const review = await reviewService.submitForReview(document_id, req.user!.id);

  res.json({ success: true, data: review });
});

// POST /reviews/:reviewId/review
// Body: { checker_id?, approver_id?, comments: [{page_ref?, comment, disposition?}] }
// checker_id and approver_id are optional when already pre-assigned by PIC_CONSULTANT
// Requires REVIEWER role
export const addReviewerAndComments = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { checker_id, approver_id, comments = [] } = req.body;

  // Validate: checker/approver required only if not already assigned on the review
  const existing = await reviewService.getReviewById(reviewId);
  if (!existing) throw new AppError('Review not found', 404);

  if (!existing.checker_id && !checker_id) {
    throw new AppError('checker_id is required when no checker has been pre-assigned', 400);
  }
  if (!existing.approver_id && !approver_id) {
    throw new AppError('approver_id is required when no approver has been pre-assigned', 400);
  }

  const review = await reviewService.addReviewerAndComments(reviewId, req.user!.id, {
    checker_id,
    approver_id,
    comments,
  });

  res.json({ success: true, data: review });
});

// POST /reviews/:reviewId/check
// Body: { comments?: [...] }
// Requires CHECKER role
export const checkDocument = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { comments = [] } = req.body;

  const review = await reviewService.checkDocument(reviewId, req.user!.id, { comments });

  res.json({ success: true, data: review });
});

// POST /reviews/:reviewId/approve
// Body: { final_status: 'APPROVED_A'|'APPROVED_WITH_COMMENTS_B'|'REJECTED_C', comments?: [...] }
// Requires APPROVER role
export const approveDocument = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { final_status, comments = [] } = req.body;

  if (!final_status) {
    throw new AppError('final_status is required', 400);
  }

  const review = await reviewService.approveDocument(reviewId, req.user!.id, {
    final_status,
    comments,
  });

  res.json({ success: true, data: review });
});

// GET /reviews?document_id=...
// Requires auth
export const getReviewByDocument = asyncHandler(async (req: Request, res: Response) => {
  const { document_id } = req.query;

  if (!document_id || typeof document_id !== 'string') {
    throw new AppError('document_id query parameter is required', 400);
  }

  const review = await reviewService.getReviewByDocument(document_id);

  if (!review) {
    throw new AppError('No review found for this document', 404);
  }

  res.json({ success: true, data: review });
});

// GET /reviews/:reviewId
// Requires auth
export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  const review = await reviewService.getReviewById(reviewId);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  res.json({ success: true, data: review });
});

// POST /reviews/:reviewId/assign
// Body: { reviewer_id, checker_id?, approver_id? }
// Requires PIC_CONSULTANT role
export const assignReviewTeam = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { reviewer_id, checker_id, approver_id } = req.body as {
    reviewer_id: string;
    checker_id?: string;
    approver_id?: string;
  };

  if (!reviewer_id) {
    throw new AppError('reviewer_id is required', 400);
  }

  const result = await reviewService.assignReviewTeam(reviewId, req.user!.id, {
    reviewer_id,
    checker_id,
    approver_id,
  });

  res.json({ success: true, data: result });
});

// POST /reviews/:reviewId/ams-letter
// Requires REVIEWER role; accepts single PDF field: ams_file
// Body fields (multipart): ams_number?, ams_date?, ams_title?
export const uploadAmsLetter = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const file = req.file as Express.Multer.File | undefined;

  if (!file) {
    throw new AppError('No file uploaded. Send a PDF as field "ams_file".', 400);
  }

  const { ams_number, ams_date, ams_title } = req.body as {
    ams_number?: string;
    ams_date?: string;
    ams_title?: string;
  };

  const result = await reviewService.uploadAmsLetter(reviewId, req.user!.id, file, {
    ams_number,
    ams_date,
    ams_title,
  });

  res.json({ success: true, data: result });
});

// GET /reviews/pending
// Requires auth
export const getPendingReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id, role, unit_id } = req.user!;

  const reviews = await reviewService.getPendingReviews(id, role as Role, unit_id);

  res.json({ success: true, data: reviews });
});

// GET /reviews/:reviewId/comment-sheet
// Requires auth — generates/regenerates PDF on demand and streams it
export const downloadCommentSheet = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { cs_date, cs_status } = req.query as { cs_date?: string; cs_status?: string };

  const fullReview = await reviewService.getFullReviewForSheet(reviewId);
  if (!fullReview) {
    throw new AppError('Review not found', 404);
  }

  const outputDir = path.join(process.cwd(), 'uploads', 'comment-sheets');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${reviewId}.pdf`);

  const items = await reviewService.getCommentSheetItems(reviewId);

  const reviewData = {
    qr_hash:        fullReview.qr_hash,
    document_title: fullReview.document?.title ?? 'N/A',
    doc_number:     fullReview.document?.doc_number ?? 'N/A',
    revision_no:    fullReview.document?.revision_no ?? 0,
    project_name:   fullReview.document?.boq_item?.project?.name ?? 'N/A',
    boq_item_title: fullReview.document?.boq_item?.title ?? 'N/A',
    section:        fullReview.document?.section ?? 'N/A',
    sla_deadline:   fullReview.sla_deadline,
    reviewed_at:    fullReview.reviewed_at,
    checked_at:     fullReview.checked_at,
    approved_at:    fullReview.approved_at,
    final_status:   fullReview.final_status,
    reviewer_name:  fullReview.reviewer?.name ?? 'N/A',
    checker_name:   fullReview.checker?.name ?? 'N/A',
    approver_name:  fullReview.approver?.name ?? 'N/A',
    reviewer_qr_at: fullReview.reviewer_qr_at,
    checker_qr_at:  fullReview.checker_qr_at,
    approver_qr_at: fullReview.approver_qr_at,
    cs_date:        cs_date || null,
    cs_status:      cs_status || null,
  };

  const sheetItems = items.map((i) => ({
    seq_no:              i.seq_no,
    pln_comment:         i.pln_comment,
    contractor_response: i.contractor_response ?? undefined,
  }));

  await generateCommentSheet(reviewData, sheetItems, outputPath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="comment-sheet-${reviewId}.pdf"`);
  res.sendFile(outputPath);
});

// GET /reviews/:reviewId/comment-sheet-items
// Requires auth
export const getCommentSheetItems = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const items = await reviewService.getCommentSheetItems(reviewId);
  res.json({ success: true, data: items });
});

// PUT /reviews/:reviewId/comment-sheet-items
// Body: { items: [{seq_no, pln_comment, contractor_response?}] }
// Requires REVIEWER or CHECKER role
export const saveCommentSheetItems = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { items = [] } = req.body as {
    items: Array<{ seq_no: number; pln_comment: string; contractor_response?: string }>;
  };

  const result = await reviewService.saveCommentSheetItems(
    reviewId,
    req.user!.id,
    req.user!.role as Role,
    items,
  );

  res.json({ success: true, data: result });
});

// GET /reviews/notifications — role-aware notifications for the logged-in user
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const notifications = await reviewService.getNotifications(id, role as Role);
  res.json({ success: true, data: notifications });
});
