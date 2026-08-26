import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';

const mockPrisma = vi.hoisted(() => ({
  documentReview: { findMany: vi.fn() },
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

import { getPendingReviews } from '../services/reviewService';

describe('reviewService — pending reviews for PIC Consultant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.documentReview.findMany.mockResolvedValue([]);
  });

  it('shows submitted reviews needing reviewer or team setup, including legacy projects', async () => {
    await getPendingReviews('consultant-1', Role.PIC_CONSULTANT, 'unit-1');

    const activeWhere = mockPrisma.documentReview.findMany.mock.calls[0][0].where;

    expect(activeWhere).toEqual({
      final_status: null,
      reviewed_at: null,
      OR: [
        { reviewer_id: null },
        { checker_id: null },
        { approver_id: null },
      ],
      document: {
        boq_item: {
          project: {
            OR: [
              { consultant_pics: { some: { consultant_id: 'consultant-1' } } },
              { consultant_pics: { none: {} } },
            ],
          },
        },
      },
    });
  });

  it('keeps pending AMS visibility scoped with the same legacy fallback', async () => {
    await getPendingReviews('consultant-1', Role.PIC_CONSULTANT, 'unit-1');

    const amsWhere = mockPrisma.documentReview.findMany.mock.calls[1][0].where;

    expect(amsWhere).toEqual({
      final_status: { not: null },
      ams_letter: { is: null },
      document: {
        boq_item: {
          project: {
            OR: [
              { consultant_pics: { some: { consultant_id: 'consultant-1' } } },
              { consultant_pics: { none: {} } },
            ],
          },
        },
      },
    });
  });
});
