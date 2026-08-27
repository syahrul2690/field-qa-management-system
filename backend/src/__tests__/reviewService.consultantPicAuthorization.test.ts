import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../utils/AppError';
import { InstitutionType, Role } from '@prisma/client';

const mockPrisma = vi.hoisted(() => ({
  documentReview: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
  user: { findUnique: vi.fn() },
  projectConsultantPic: { findUnique: vi.fn(), count: vi.fn() },
}));

vi.mock('../config/database', () => ({ prisma: mockPrisma }));

vi.mock('../config', () => ({
  config: {
    sla: { defaultDays: 7 },
    integration: { apiKey: '' },
  },
}));

vi.mock('../utils/pdfEngine/commentSheetGenerator', () => ({
  generateCommentSheet: vi.fn(),
}));

import {
  assignReviewTeam,
  delegateReview,
} from '../services/reviewService';

const review = {
  id: 'review-1',
  version: 1,
  reviewed_at: null,
  reviewer_id: 'reviewer-1',
  document: { boq_item: { project_id: 'project-1' } },
};

const picConsultant = {
  id: 'pic-1',
  role: Role.PIC_CONSULTANT,
  institution: { type: InstitutionType.CONSULTANT },
};

describe('reviewService — PIC Consultant team-setup authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.documentReview.findUnique.mockResolvedValue(review);
    mockPrisma.user.findUnique.mockResolvedValue(picConsultant);
    mockPrisma.documentReview.update.mockResolvedValue({ ...review });
  });

  it('assigns checker/approver with an explicit project PIC assignment', async () => {
    mockPrisma.projectConsultantPic.findUnique.mockResolvedValue({ id: 'assigned' });
    mockPrisma.projectConsultantPic.count.mockResolvedValue(1);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(picConsultant) // actor
      .mockResolvedValueOnce({ id: 'checker-1', role: Role.CHECKER }) // checker
      .mockResolvedValueOnce({ id: 'approver-1', role: Role.APPROVER }); // approver

    await assignReviewTeam('review-1', 'pic-1', {
      checker_id: 'checker-1',
      approver_id: 'approver-1',
    });

    expect(mockPrisma.documentReview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'review-1' },
        data: { checker_id: 'checker-1', approver_id: 'approver-1' },
      }),
    );
  });

  it('keeps the legacy fallback when the project has no explicit PIC assignment', async () => {
    mockPrisma.projectConsultantPic.findUnique.mockResolvedValue(null);
    mockPrisma.projectConsultantPic.count.mockResolvedValue(0);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(picConsultant) // actor
      .mockResolvedValueOnce({ id: 'checker-1', role: Role.CHECKER });

    await expect(
      assignReviewTeam('review-1', 'pic-1', { checker_id: 'checker-1' }),
    ).resolves.toBeDefined();

    expect(mockPrisma.projectConsultantPic.count).toHaveBeenCalledWith({
      where: { project_id: 'project-1' },
    });
  });

  it('rejects a PIC Consultant when the project has assignments for someone else', async () => {
    mockPrisma.projectConsultantPic.findUnique.mockResolvedValue(null);
    mockPrisma.projectConsultantPic.count.mockResolvedValue(1);

    await expect(
      assignReviewTeam('review-1', 'pic-1', { checker_id: 'checker-1' }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'You are not assigned as PIC Consultant for this project',
    });
  });

  it('applies the same fallback to the delegation gate', async () => {
    // No explicit assignment -> passes authorization, then fails on engineer
    // validation (proof the 403 gate was not hit).
    mockPrisma.projectConsultantPic.findUnique.mockResolvedValue(null);
    mockPrisma.projectConsultantPic.count.mockResolvedValue(0);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(picConsultant) // actor
      .mockResolvedValueOnce(null); // engineer

    await expect(
      delegateReview('review-1', 'pic-1', { engineer_id: 'engineer-1' }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Selected engineer must be an approved consultant Reviewer',
    });
  });
});
