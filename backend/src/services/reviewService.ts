import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ReviewStatus, DocumentSection, Role } from '@prisma/client';
import { calculateSlaDeadline, isOverdue, getCurrentStage } from './slaService';
import { generateCommentSheet } from '../utils/pdfEngine/commentSheetGenerator';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

// ── submitForReview ──────────────────────────────────────────────────────────

export async function submitForReview(documentId: string, actorId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { boq_item: { include: { project: true } } },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  const allowedStatuses: ReviewStatus[] = [
    ReviewStatus.DRAFT,
    ReviewStatus.APPROVED_WITH_COMMENTS_B,
  ];

  if (!allowedStatuses.includes(document.status)) {
    throw new AppError(
      `Document cannot be submitted for review from status: ${document.status}`,
      400,
    );
  }

  const existingReview = await prisma.documentReview.findFirst({
    where: {
      document_id: documentId,
      final_status: null,
    },
  });

  if (existingReview) {
    throw new AppError('An active review already exists for this document', 400);
  }

  const now = new Date();

  const review = await prisma.documentReview.create({
    data: {
      document_id: documentId,
      sla_deadline: calculateSlaDeadline(now),
      version: 0,
    },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { status: ReviewStatus.SUBMITTED },
  });

  return review;
}

// ── assignReviewTeam ─────────────────────────────────────────────────────────
// Called by PIC_CONSULTANT to assign reviewer (and optionally checker + approver)
// before the reviewer submits their comments.

export async function assignReviewTeam(
  reviewId: string,
  actorId: string,
  data: {
    reviewer_id: string;
    checker_id?: string;
    approver_id?: string;
  },
) {
  const [review, actor, reviewer] = await Promise.all([
    prisma.documentReview.findUnique({ where: { id: reviewId } }),
    prisma.user.findUnique({ where: { id: actorId } }),
    prisma.user.findUnique({ where: { id: data.reviewer_id } }),
  ]);

  if (!review) throw new AppError('Review not found', 404);
  if (!actor || actor.role !== Role.PIC_CONSULTANT) {
    throw new AppError('Only PIC Consultant can assign a review team.', 403);
  }
  if (review.reviewed_at) {
    throw new AppError('Reviewer has already submitted comments — team cannot be reassigned.', 400);
  }
  if (!reviewer || reviewer.role !== Role.REVIEWER) {
    throw new AppError('Selected user is not a Reviewer.', 400);
  }

  if (data.checker_id) {
    const checker = await prisma.user.findUnique({ where: { id: data.checker_id } });
    if (!checker || checker.role !== Role.CHECKER) {
      throw new AppError('Selected user is not a Checker.', 400);
    }
  }
  if (data.approver_id) {
    const approver = await prisma.user.findUnique({ where: { id: data.approver_id } });
    if (!approver || approver.role !== Role.APPROVER) {
      throw new AppError('Selected user is not an Approver.', 400);
    }
  }

  return prisma.documentReview.update({
    where: { id: reviewId },
    data: {
      reviewer_id: data.reviewer_id,
      ...(data.checker_id  ? { checker_id:  data.checker_id  } : {}),
      ...(data.approver_id ? { approver_id: data.approver_id } : {}),
    },
    include: {
      reviewer: { select: { id: true, name: true } },
      checker:  { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      document: { include: { boq_item: { include: { project: true } } } },
    },
  });
}

// ── addReviewerAndComments ───────────────────────────────────────────────────

export async function addReviewerAndComments(
  reviewId: string,
  actorId: string,
  data: {
    checker_id?: string;   // Optional if already assigned by PIC_CONSULTANT
    approver_id?: string;  // Optional if already assigned by PIC_CONSULTANT
    comments: Array<{ page_ref?: string; comment: string; disposition?: string }>;
  },
) {
  const review = await prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: {
      document: { include: { boq_item: true } },
    },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const stage = getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at);
  if (stage !== 'REVIEW') {
    throw new AppError('Review is not in REVIEW stage', 400);
  }

  // If a reviewer is pre-assigned (by PIC_CONSULTANT), only that reviewer may submit
  if (review.reviewer_id && review.reviewer_id !== actorId) {
    throw new AppError('This review is assigned to a different reviewer.', 403);
  }

  // Verify actor has REVIEWER role and is from a Consultant institution
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { unit: true, institution: true },
  });

  if (!actor) {
    throw new AppError('Actor not found', 404);
  }

  if (actor.role !== Role.REVIEWER) {
    throw new AppError('Actor must have REVIEWER role', 403);
  }

  if (actor.institution.type !== 'CONSULTANT') {
    throw new AppError('Reviewer must be from a Consultant institution', 403);
  }

  // Unit-level checks based on document section
  const section = review.document.section;

  if (section === DocumentSection.FIELD_ITP || section === DocumentSection.PROCEDURE) {
    if (actor.unit.level !== 1) {
      throw new AppError(
        'Reviewer for FIELD_ITP or PROCEDURE sections must be from a Child unit (level 1)',
        403,
      );
    }
  } else if (section === DocumentSection.WORK_METHOD) {
    if (actor.unit.level !== 2) {
      throw new AppError(
        'Reviewer for WORK_METHOD section must be from a Grandchild/Project Site Team unit (level 2)',
        403,
      );
    }
  }

  // Resolve effective checker and approver:
  // use values provided in request body; fall back to pre-assigned values from PIC_CONSULTANT.
  const effectiveCheckerId = data.checker_id ?? review.checker_id ?? null;
  const effectiveApproverId = data.approver_id ?? review.approver_id ?? null;

  if (!effectiveCheckerId) {
    throw new AppError('checker_id is required — no checker has been pre-assigned.', 400);
  }
  if (!effectiveApproverId) {
    throw new AppError('approver_id is required — no approver has been pre-assigned.', 400);
  }

  // Validate checker and approver if newly provided (skip validation for pre-assigned values)
  if (data.checker_id) {
    const checker = await prisma.user.findUnique({ where: { id: data.checker_id } });
    if (!checker || checker.role !== Role.CHECKER) {
      throw new AppError('Invalid checker_id: user not found or does not have CHECKER role', 400);
    }
  }
  if (data.approver_id) {
    const approver = await prisma.user.findUnique({ where: { id: data.approver_id } });
    if (!approver || approver.role !== Role.APPROVER) {
      throw new AppError('Invalid approver_id: user not found or does not have APPROVER role', 400);
    }
  }

  const now = new Date();

  // Optimistic locking update
  const updateResult = await prisma.documentReview.updateMany({
    where: { id: reviewId, version: review.version },
    data: {
      reviewer_id: actorId,
      checker_id: effectiveCheckerId,
      approver_id: effectiveApproverId,
      reviewed_at: now,
      version: review.version + 1,
    },
  });

  if (updateResult.count === 0) {
    throw new AppError('Concurrent modification. Please refresh and retry.', 409);
  }

  // Insert comments
  if (data.comments && data.comments.length > 0) {
    await prisma.reviewComment.createMany({
      data: data.comments.map((c) => ({
        review_id: reviewId,
        commenter_id: actorId,
        page_ref: c.page_ref ?? null,
        comment: c.comment,
        disposition: c.disposition ?? null,
      })),
    });
  }

  // Stamp reviewer_qr_at (for QR code in "Prepared By")
  await prisma.documentReview.update({
    where: { id: reviewId },
    data: { reviewer_qr_at: now },
  });

  // Update document status
  await prisma.document.update({
    where: { id: review.document_id },
    data: { status: ReviewStatus.IN_REVIEW },
  });

  // Regenerate comment sheet PDF with Prepared By QR
  void regenerateCommentSheetPdf(reviewId);

  return prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: {
      comments: { include: { commenter: true } },
      reviewer: { select: { id: true, name: true } },
      checker: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
    },
  });
}

// ── checkDocument ────────────────────────────────────────────────────────────

export async function checkDocument(
  reviewId: string,
  actorId: string,
  data: {
    comments?: Array<{ page_ref?: string; comment: string; disposition?: string }>;
  },
) {
  const review = await prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: { document: true },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const stage = getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at);
  if (stage !== 'CHECK') {
    throw new AppError('Review is not in CHECK stage', 400);
  }

  if (review.checker_id !== actorId) {
    throw new AppError('You are not the assigned checker for this review', 403);
  }

  const now = new Date();

  const updateResult = await prisma.documentReview.updateMany({
    where: { id: reviewId, version: review.version },
    data: {
      checked_at: now,
      version: review.version + 1,
    },
  });

  if (updateResult.count === 0) {
    throw new AppError('Concurrent modification. Please refresh and retry.', 409);
  }

  if (data.comments && data.comments.length > 0) {
    await prisma.reviewComment.createMany({
      data: data.comments.map((c) => ({
        review_id: reviewId,
        commenter_id: actorId,
        page_ref: c.page_ref ?? null,
        comment: c.comment,
        disposition: c.disposition ?? null,
      })),
    });
  }

  // Stamp checker_qr_at (for QR in "Reviewed By")
  await prisma.documentReview.update({
    where: { id: reviewId },
    data: { checker_qr_at: now },
  });

  // Regenerate comment sheet PDF with Reviewed By QR added
  void regenerateCommentSheetPdf(reviewId);

  return prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: {
      comments: { include: { commenter: true } },
      reviewer: { select: { id: true, name: true } },
      checker: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
    },
  });
}

// ── approveDocument ──────────────────────────────────────────────────────────

export async function approveDocument(
  reviewId: string,
  actorId: string,
  data: {
    final_status: ReviewStatus;
    comments?: Array<{ page_ref?: string; comment: string; disposition?: string }>;
  },
) {
  const review = await prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: { document: { include: { boq_item: { include: { project: true } } } } },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const stage = getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at);
  if (stage !== 'APPROVE') {
    throw new AppError('Review is not in APPROVE stage', 400);
  }

  if (review.approver_id !== actorId) {
    throw new AppError('You are not the assigned approver for this review', 403);
  }

  const validFinalStatuses: ReviewStatus[] = [
    ReviewStatus.APPROVED_A,
    ReviewStatus.APPROVED_WITH_COMMENTS_B,
    ReviewStatus.REJECTED_C,
  ];

  if (!validFinalStatuses.includes(data.final_status)) {
    throw new AppError(
      'final_status must be one of: APPROVED_A, APPROVED_WITH_COMMENTS_B, REJECTED_C',
      400,
    );
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    // Optimistic lock update review
    const updateResult = await tx.documentReview.updateMany({
      where: { id: reviewId, version: review.version },
      data: {
        approved_at: now,
        final_status: data.final_status,
        version: review.version + 1,
      },
    });

    if (updateResult.count === 0) {
      throw new AppError('Concurrent modification. Please refresh and retry.', 409);
    }

    // Update document status
    await tx.document.update({
      where: { id: review.document_id },
      data: { status: data.final_status },
    });

    // Insert comments
    if (data.comments && data.comments.length > 0) {
      await tx.reviewComment.createMany({
        data: data.comments.map((c) => ({
          review_id: reviewId,
          commenter_id: actorId,
          page_ref: c.page_ref ?? null,
          comment: c.comment,
          disposition: c.disposition ?? null,
        })),
      });
    }

    return tx.documentReview.findUnique({
      where: { id: reviewId },
      include: {
        comments: { include: { commenter: true } },
        reviewer: { select: { id: true, name: true } },
        checker: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        document: {
          include: {
            boq_item: { include: { project: true } },
          },
        },
      },
    });
  });

  // Stamp approver_qr_at — applies to all final statuses (A, B, C)
  await prisma.documentReview.update({
    where: { id: reviewId },
    data: { approver_qr_at: now },
  });

  // Regenerate comment sheet PDF with Approved By QR added (non-fatal)
  void regenerateCommentSheetPdf(reviewId);

  return result;
}

// ── saveCommentSheetItems ────────────────────────────────────────────────────

export async function saveCommentSheetItems(
  reviewId: string,
  actorId: string,
  actorRole: Role,
  items: Array<{ seq_no: number; pln_comment: string; contractor_response?: string }>,
) {
  const review = await prisma.documentReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  // Reviewer: can save only when review is in REVIEW or CHECK stage (before checker completes)
  // Checker: can save only when in CHECK stage
  const stage = getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at);
  const allowedRoles: Role[] = [Role.REVIEWER, Role.CHECKER];
  if (!allowedRoles.includes(actorRole)) {
    throw new AppError('Only Reviewer or Checker can edit comment sheet items', 403);
  }
  if (actorRole === Role.CHECKER && stage !== 'CHECK') {
    throw new AppError('Checker can only edit items during the CHECK stage', 400);
  }
  if (actorRole === Role.REVIEWER && !['REVIEW', 'CHECK'].includes(stage)) {
    throw new AppError('Comment sheet items can only be edited during REVIEW or CHECK stage', 400);
  }

  // Validate ownership: reviewer must be assigned, checker must be assigned
  if (actorRole === Role.REVIEWER && review.reviewer_id && review.reviewer_id !== actorId) {
    throw new AppError('You are not the assigned reviewer for this review', 403);
  }
  if (actorRole === Role.CHECKER && review.checker_id !== actorId) {
    throw new AppError('You are not the assigned checker for this review', 403);
  }

  // Replace all existing items atomically
  await prisma.$transaction(async (tx) => {
    await tx.commentSheetItem.deleteMany({ where: { review_id: reviewId } });
    if (items.length > 0) {
      await tx.commentSheetItem.createMany({
        data: items.map((item) => ({
          review_id: reviewId,
          seq_no: item.seq_no,
          pln_comment: item.pln_comment,
          contractor_response: item.contractor_response ?? null,
        })),
      });
    }
  });

  return prisma.commentSheetItem.findMany({
    where: { review_id: reviewId },
    orderBy: { seq_no: 'asc' },
  });
}

// ── getCommentSheetItems ─────────────────────────────────────────────────────

export async function getCommentSheetItems(reviewId: string) {
  const review = await prisma.documentReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  return prisma.commentSheetItem.findMany({
    where: { review_id: reviewId },
    orderBy: { seq_no: 'asc' },
  });
}

// ── regenerateCommentSheetPdf (internal) ─────────────────────────────────────

async function regenerateCommentSheetPdf(reviewId: string): Promise<void> {
  try {
    const fullReview = await prisma.documentReview.findUnique({
      where: { id: reviewId },
      include: {
        comment_sheet_items: { orderBy: { seq_no: 'asc' } },
        reviewer: { select: { id: true, name: true } },
        checker: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        document: { include: { boq_item: { include: { project: true } } } },
      },
    });
    if (!fullReview) return;

    const outputDir = path.join(process.cwd(), 'uploads', 'comment-sheets');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${reviewId}.pdf`);
    const relativePath = `uploads/comment-sheets/${reviewId}.pdf`;

    const reviewData = {
      qr_hash:       fullReview.qr_hash,
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
    };

    const sheetItems = fullReview.comment_sheet_items.map((i) => ({
      seq_no:               i.seq_no,
      pln_comment:          i.pln_comment,
      contractor_response:  i.contractor_response ?? undefined,
    }));

    await generateCommentSheet(reviewData, sheetItems, outputPath);

    await prisma.documentReview.update({
      where: { id: reviewId },
      data:  { comment_sheet_path: relativePath },
    });
  } catch (err) {
    console.error('[CommentSheet] PDF generation failed:', err);
  }
}

// ── getFullReviewForSheet ────────────────────────────────────────────────────

export async function getFullReviewForSheet(reviewId: string) {
  return prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: {
      comments: {
        include: { commenter: true },
        orderBy: { created_at: 'asc' },
      },
      reviewer: { select: { id: true, name: true } },
      checker: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      document: {
        include: { boq_item: { include: { project: true } } },
      },
    },
  });
}

// ── getReviewByDocument ──────────────────────────────────────────────────────

export async function getReviewByDocument(documentId: string) {
  const review = await prisma.documentReview.findFirst({
    where: { document_id: documentId },
    orderBy: { created_at: 'desc' },
    include: {
      comments: {
        include: { commenter: true },
        orderBy: { created_at: 'asc' },
      },
      reviewer: { select: { id: true, name: true } },
      checker: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      document: {
        include: { files: true, boq_item: { include: { project: true } } },
      },
    },
  });

  if (!review) return null;

  return {
    ...review,
    document_title: review.document?.title,
    document_number: review.document?.doc_number,
    project_name: review.document?.boq_item?.project?.name,
    boq_item_title: review.document?.boq_item?.title,
    section: review.document?.section,
    status: review.document?.status,
    files: review.document?.files,
    is_overdue: isOverdue(review.sla_deadline, review.final_status),
    current_stage: getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at),
  };
}

// ── uploadAmsLetter ──────────────────────────────────────────────────────────

export async function uploadAmsLetter(
  reviewId: string,
  uploadedBy: string,
  file: Express.Multer.File,
  meta?: { ams_number?: string; ams_date?: string; ams_title?: string },
) {
  const review = await prisma.documentReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  // AMS letter can only be uploaded after the Approver has issued a final status
  if (!review.final_status) {
    throw new AppError(
      'AMS letter can only be uploaded after the document has received a final approval status.',
      403,
    );
  }

  // Move file to permanent ams directory
  const destDir = path.join('uploads', 'ams');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const safeName = file.originalname.replace(/\s+/g, '_');
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${unique}-${safeName}`;
  const destPath = path.join(destDir, filename);
  fs.renameSync(file.path, destPath);
  const relPath = `ams/${filename}`;

  // Replace previous AMS letter if one exists (delete old file from disk too)
  const existing = await prisma.amsLetter.findUnique({ where: { review_id: reviewId } });
  if (existing) {
    const oldDiskPath = path.join('uploads', existing.file_path);
    if (fs.existsSync(oldDiskPath)) fs.unlinkSync(oldDiskPath);
    await prisma.amsLetter.delete({ where: { review_id: reviewId } });
  }

  return prisma.amsLetter.create({
    data: {
      review_id: reviewId,
      ams_number: meta?.ams_number ?? null,
      ams_date: meta?.ams_date ? new Date(meta.ams_date) : null,
      ams_title: meta?.ams_title ?? null,
      file_name: file.originalname,
      file_path: relPath,
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: uploadedBy,
    },
    include: { uploader: { select: { id: true, name: true } } },
  });
}

// ── getReviewById ────────────────────────────────────────────────────────────

export async function getReviewById(reviewId: string) {
  const review = await prisma.documentReview.findUnique({
    where: { id: reviewId },
    include: {
      comments: {
        include: { commenter: true },
        orderBy: { created_at: 'asc' },
      },
      reviewer: { select: { id: true, name: true } },
      checker: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      ams_letter: { include: { uploader: { select: { id: true, name: true } } } },
      document: {
        include: { files: true, boq_item: { include: { project: true } } },
      },
    },
  });

  if (!review) return null;

  return {
    ...review,
    document_title: review.document?.title,
    document_number: review.document?.doc_number,
    project_name: review.document?.boq_item?.project?.name,
    boq_item_title: review.document?.boq_item?.title,
    section: review.document?.section,
    status: review.document?.status,
    files: review.document?.files,
    ams_letter: review.ams_letter ?? null,
    is_overdue: isOverdue(review.sla_deadline, review.final_status),
    current_stage: getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at),
  };
}

// ── getPendingReviews ────────────────────────────────────────────────────────

export async function getPendingReviews(
  actorId: string,
  actorRole: Role,
  _actorUnitId: string,
) {
  // ── Section 1: Active reviews that need action ───────────────────────────
  let activeWhereClause: Record<string, unknown> = {};

  if (actorRole === Role.PIC_CONSULTANT || actorRole === Role.PIC_PROJECT) {
    // PIC roles see all reviews not yet assigned a reviewer
    activeWhereClause = { final_status: null, reviewer_id: null };
  } else if (actorRole === Role.REVIEWER) {
    activeWhereClause = {
      final_status: null,
      OR: [
        { reviewer_id: null },
        { reviewer_id: actorId, reviewed_at: null },
      ],
    };
  } else if (actorRole === Role.CHECKER) {
    activeWhereClause = {
      final_status: null,
      checker_id: actorId,
      checked_at: null,
    };
  } else if (actorRole === Role.APPROVER) {
    activeWhereClause = {
      final_status: null,
      approver_id: actorId,
      approved_at: null,
    };
  }

  // ── Section 2: Completed reviews still missing AMS letter ────────────────
  // All consultant roles and PIC_PROJECT can see this so they have visibility
  // and can follow up. Only REVIEWER can actually upload (enforced on the
  // upload endpoint), but everyone benefits from knowing AMS is still pending.
  let amsWhereClause: Record<string, unknown> = {
    final_status: { not: null },
    ams_letter: { is: null },
  };

  if (actorRole === Role.REVIEWER) {
    amsWhereClause['reviewer_id'] = actorId;
  } else if (actorRole === Role.CHECKER) {
    amsWhereClause['checker_id'] = actorId;
  } else if (actorRole === Role.APPROVER) {
    amsWhereClause['approver_id'] = actorId;
  }
  // PIC_CONSULTANT / PIC_PROJECT: no personal filter — see all pending AMS

  const reviewInclude = {
    document: {
      include: { files: true, boq_item: { include: { project: true } } },
    },
    reviewer: { select: { id: true, name: true } },
    checker:  { select: { id: true, name: true } },
    approver: { select: { id: true, name: true } },
  } as const;

  const [activeReviews, amsReviews] = await Promise.all([
    prisma.documentReview.findMany({
      where: activeWhereClause,
      include: reviewInclude,
      orderBy: { sla_deadline: 'asc' },
    }),
    prisma.documentReview.findMany({
      where: amsWhereClause,
      include: reviewInclude,
      orderBy: { approved_at: 'desc' },
    }),
  ]);

  const mapReview = (r: (typeof activeReviews)[0]) => ({
    ...r,
    document_title:  r.document?.title,
    document_number: r.document?.doc_number,
    project_name:    r.document?.boq_item?.project?.name,
    boq_item_title:  r.document?.boq_item?.title,
    section:         r.document?.section,
    status:          r.document?.status,
    files:           r.document?.files,
    is_overdue:      isOverdue(r.sla_deadline, r.final_status),
    current_stage:   getCurrentStage(r.reviewed_at, r.checked_at, r.approved_at),
  });

  return {
    active:       activeReviews.map(mapReview),
    awaiting_ams: amsReviews.map(mapReview),
  };
}

// ── verifyQR ────────────────────────────────────────────────────────────────

export async function verifyQR(qrHash: string) {
  const review = await prisma.documentReview.findUnique({
    where: { qr_hash: qrHash },
    include: {
      reviewer: { select: { id: true, name: true } },
      checker: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      document: {
        include: { boq_item: { include: { project: true } } },
      },
    },
  });

  if (!review) return null;

  return {
    qr_hash: review.qr_hash,
    document_title: review.document.title,
    doc_number: review.document.doc_number,
    revision_no: review.document.revision_no,
    section: review.document.section,
    project_name: review.document.boq_item?.project?.name ?? 'N/A',
    boq_item_title: review.document.boq_item?.title ?? 'N/A',
    final_status: review.final_status,
    reviewed_at: review.reviewed_at,
    checked_at: review.checked_at,
    approved_at: review.approved_at,
    sla_deadline: review.sla_deadline,
    reviewer_name: review.reviewer?.name ?? null,
    checker_name: review.checker?.name ?? null,
    approver_name: review.approver?.name ?? null,
    current_stage: getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at),
    is_overdue: isOverdue(review.sla_deadline, review.final_status),
  };
}

// ── getNotifications ─────────────────────────────────────────────────────────

export type NotificationType =
  | 'ACTION_REQUIRED'     // user must act on this review
  | 'STAGE_UPDATED'       // review stage changed (e.g. moved to APPROVE)
  | 'STATUS_UPDATED'      // review received a final status
  | 'OVERDUE';            // SLA exceeded on a review the user is involved in

export interface Notification {
  id: string;             // review ID
  type: NotificationType;
  title: string;
  body: string;
  review_id: string;
  document_title: string;
  document_number: string;
  section: string;
  project_name: string;
  current_stage: string | null;
  final_status: string | null;
  is_overdue: boolean;
  updated_at: Date;
}

const STATUS_LABEL: Record<string, string> = {
  APPROVED_A: 'Status A — Approved',
  APPROVED_WITH_COMMENTS_B: 'Status B — Approved w/ Comments',
  REJECTED_C: 'Status C — Revise & Resubmit',
  SUPERSEDED: 'Superseded',
};

export async function getNotifications(
  actorId: string,
  actorRole: Role,
): Promise<Notification[]> {
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const notifications: Notification[] = [];

  const buildBase = (r: {
    id: string;
    document?: { title: string; doc_number: string; section: string; boq_item?: { project?: { name: string } | null } | null } | null;
    sla_deadline: Date | null;
    final_status: string | null;
    reviewed_at: Date | null;
    checked_at: Date | null;
    approved_at: Date | null;
    updated_at: Date;
  }) => ({
    review_id: r.id,
    document_title: r.document?.title ?? 'Unknown Document',
    document_number: r.document?.doc_number ?? '',
    section: r.document?.section ?? '',
    project_name: r.document?.boq_item?.project?.name ?? 'Unknown Project',
    current_stage: getCurrentStage(r.reviewed_at, r.checked_at, r.approved_at),
    final_status: r.final_status,
    is_overdue: isOverdue(r.sla_deadline, r.final_status),
    updated_at: r.updated_at,
  });

  const docInclude = {
    document: {
      select: {
        title: true,
        doc_number: true,
        section: true,
        boq_item: { select: { project: { select: { name: true } } } },
      },
    },
  } as const;

  // ── 1. ACTION REQUIRED: reviews where user must act ───────────────────────

  // PIC_CONSULTANT — documents submitted but no reviewer assigned yet
  if (actorRole === Role.PIC_CONSULTANT) {
    const pending = await prisma.documentReview.findMany({
      where: { final_status: null, reviewer_id: null },
      include: docInclude,
      orderBy: { sla_deadline: 'asc' },
    });
    for (const r of pending) {
      notifications.push({
        id: `action-${r.id}`,
        type: r.sla_deadline && new Date() > r.sla_deadline ? 'OVERDUE' : 'ACTION_REQUIRED',
        title: 'Document pending reviewer assignment',
        body: `"${r.document?.title ?? ''}" has been submitted and needs a reviewer assigned.`,
        ...buildBase(r),
      });
    }
  }

  if (actorRole === Role.REVIEWER) {
    const pending = await prisma.documentReview.findMany({
      where: {
        final_status: null,
        OR: [
          { reviewer_id: null },
          { reviewer_id: actorId, reviewed_at: null },
        ],
      },
      include: docInclude,
      orderBy: { sla_deadline: 'asc' },
    });
    for (const r of pending) {
      notifications.push({
        id: `action-${r.id}`,
        type: r.sla_deadline && new Date() > r.sla_deadline ? 'OVERDUE' : 'ACTION_REQUIRED',
        title: r.reviewer_id === actorId ? 'Review in progress' : 'New document awaiting review',
        body: r.reviewer_id === actorId
          ? `Please complete your review comments for "${r.document?.title ?? ''}".`
          : `A document has been submitted and needs a reviewer. Click to claim it.`,
        ...buildBase(r),
      });
    }
  }

  if (actorRole === Role.CHECKER) {
    // ACTION_REQUIRED: it is the checker's turn (reviewer has submitted)
    const actionPending = await prisma.documentReview.findMany({
      where: { final_status: null, checker_id: actorId, checked_at: null, reviewed_at: { not: null } },
      include: docInclude,
      orderBy: { sla_deadline: 'asc' },
    });
    for (const r of actionPending) {
      notifications.push({
        id: `action-${r.id}`,
        type: r.sla_deadline && new Date() > r.sla_deadline ? 'OVERDUE' : 'ACTION_REQUIRED',
        title: 'Check required',
        body: `You are assigned as Checker for "${r.document?.title ?? ''}". Reviewer has submitted their comments.`,
        ...buildBase(r),
      });
    }

    // STAGE_UPDATED: assigned but waiting for the reviewer to finish
    const awaitingReviewer = await prisma.documentReview.findMany({
      where: { final_status: null, checker_id: actorId, checked_at: null, reviewed_at: null },
      include: docInclude,
      orderBy: { sla_deadline: 'asc' },
    });
    for (const r of awaitingReviewer) {
      notifications.push({
        id: `assigned-${r.id}`,
        type: 'STAGE_UPDATED',
        title: 'Assigned as Checker — awaiting reviewer',
        body: `You have been assigned as Checker for "${r.document?.title ?? ''}". Waiting for the reviewer to complete their comments.`,
        ...buildBase(r),
      });
    }
  }

  if (actorRole === Role.APPROVER) {
    // ACTION_REQUIRED: it is the approver's turn (checker has completed)
    const actionPending = await prisma.documentReview.findMany({
      where: { final_status: null, approver_id: actorId, approved_at: null, checked_at: { not: null } },
      include: docInclude,
      orderBy: { sla_deadline: 'asc' },
    });
    for (const r of actionPending) {
      notifications.push({
        id: `action-${r.id}`,
        type: r.sla_deadline && new Date() > r.sla_deadline ? 'OVERDUE' : 'ACTION_REQUIRED',
        title: 'Approval required',
        body: `"${r.document?.title ?? ''}" has been checked and is awaiting your final decision.`,
        ...buildBase(r),
      });
    }

    // STAGE_UPDATED: assigned but waiting for reviewer/checker to finish
    const awaitingProgress = await prisma.documentReview.findMany({
      where: {
        final_status: null,
        approver_id: actorId,
        approved_at: null,
        checked_at: null,
      },
      include: docInclude,
      orderBy: { sla_deadline: 'asc' },
    });
    for (const r of awaitingProgress) {
      if (notifications.some((n) => n.review_id === r.id)) continue;
      const stage = getCurrentStage(r.reviewed_at, r.checked_at, r.approved_at);
      const stageLabel = stage === 'REVIEW' ? 'review' : stage === 'CHECK' ? 'check' : 'processing';
      notifications.push({
        id: `assigned-${r.id}`,
        type: 'STAGE_UPDATED',
        title: `Assigned as Approver — awaiting ${stageLabel} stage`,
        body: `"${r.document?.title ?? ''}" is currently in the ${stageLabel} stage. You will be notified when it's your turn.`,
        ...buildBase(r),
      });
    }
  }

  if (actorRole === Role.VENDOR) {
    // ── ACTION REQUIRED: documents rejected (Status C) needing revision ──────
    const rejectedDocs = await prisma.document.findMany({
      where: {
        uploaded_by: actorId,
        status: 'REJECTED_C',
        is_current: true,
      },
      select: {
        id: true,
        doc_number: true,
        title: true,
        section: true,
        updated_at: true,
        boq_item: { select: { project: { select: { name: true } } } },
        reviews: {
          where: { final_status: 'REJECTED_C' },
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            id: true,
            sla_deadline: true,
            reviewed_at: true,
            checked_at: true,
            approved_at: true,
            final_status: true,
            updated_at: true,
          },
        },
      },
    });

    for (const doc of rejectedDocs) {
      const review = doc.reviews[0];
      if (!review) continue;
      notifications.push({
        id: `action-${review.id}`,
        type: 'ACTION_REQUIRED',
        title: 'Revision required — Status C',
        body: `"${doc.title}" was returned for revision. Please upload a corrected version.`,
        review_id: review.id,
        document_title: doc.title,
        document_number: doc.doc_number,
        section: doc.section,
        project_name: doc.boq_item?.project?.name ?? 'Unknown Project',
        current_stage: getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at),
        final_status: review.final_status,
        is_overdue: false,
        updated_at: review.updated_at,
      });
    }

    // ── STATUS UPDATES: recently updated non-rejected reviews ────────────────
    const recentlyUpdated = await prisma.documentReview.findMany({
      where: {
        updated_at: { gte: since48h },
        document: { uploader: { id: actorId } },
        final_status: { not: 'REJECTED_C' },
      },
      include: docInclude,
      orderBy: { updated_at: 'desc' },
    });
    for (const r of recentlyUpdated) {
      // Skip if already added as ACTION_REQUIRED
      if (notifications.some((n) => n.review_id === r.id)) continue;
      const stage = getCurrentStage(r.reviewed_at, r.checked_at, r.approved_at);
      const notifType: NotificationType = r.final_status ? 'STATUS_UPDATED' : 'STAGE_UPDATED';
      notifications.push({
        id: `update-${r.id}`,
        type: notifType,
        title: r.final_status
          ? `Document received final status: ${STATUS_LABEL[r.final_status ?? ''] ?? r.final_status}`
          : `Document review stage updated: ${stage}`,
        body: `"${r.document?.title ?? ''}" — status has been updated.`,
        ...buildBase(r),
      });
    }
  }

  // ── 2. STAGE / STATUS UPDATES for reviewer/checker/approver ──────────────
  if (actorRole === Role.REVIEWER || actorRole === Role.CHECKER || actorRole === Role.APPROVER) {
    const involvedField =
      actorRole === Role.REVIEWER ? 'reviewer_id'
      : actorRole === Role.CHECKER ? 'checker_id'
      : 'approver_id';

    const recentlyUpdated = await prisma.documentReview.findMany({
      where: {
        [involvedField]: actorId,
        updated_at: { gte: since48h },
        // Exclude reviews already listed in ACTION_REQUIRED section above
        ...(actorRole === Role.REVIEWER
          ? { OR: [{ reviewed_at: { not: null } }, { final_status: { not: null } }] }
          : actorRole === Role.CHECKER
          ? { OR: [{ checked_at: { not: null } }, { final_status: { not: null } }] }
          // APPROVER: show progress updates — ACTION_REQUIRED (checked_at NOT NULL) will be
          // de-duped by the id check below; this also surfaces recent final-status completions
          : { OR: [{ reviewed_at: { not: null } }, { checked_at: { not: null } }, { final_status: { not: null } }] }),
      },
      include: docInclude,
      orderBy: { updated_at: 'desc' },
    });

    for (const r of recentlyUpdated) {
      // Avoid duplicate with ACTION_REQUIRED
      if (notifications.some((n) => n.review_id === r.id)) continue;

      const notifType: NotificationType = r.final_status ? 'STATUS_UPDATED' : 'STAGE_UPDATED';
      const stage = getCurrentStage(r.reviewed_at, r.checked_at, r.approved_at);

      notifications.push({
        id: `update-${r.id}`,
        type: notifType,
        title: r.final_status
          ? `Review completed — ${STATUS_LABEL[r.final_status ?? ''] ?? r.final_status}`
          : `Review advanced to ${stage} stage`,
        body: `"${r.document?.title ?? ''}" in ${r.document?.boq_item?.project?.name ?? 'Unknown Project'}.`,
        ...buildBase(r),
      });
    }
  }

  // Sort: OVERDUE first, then ACTION_REQUIRED, then by updated_at desc
  const priority: Record<NotificationType, number> = {
    OVERDUE: 0,
    ACTION_REQUIRED: 1,
    STAGE_UPDATED: 2,
    STATUS_UPDATED: 3,
  };

  notifications.sort((a, b) => {
    const pd = priority[a.type] - priority[b.type];
    if (pd !== 0) return pd;
    return b.updated_at.getTime() - a.updated_at.getTime();
  });

  return notifications;
}
