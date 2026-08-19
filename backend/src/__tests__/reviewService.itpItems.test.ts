import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';

const mockPrisma = vi.hoisted(() => {
  const p = {
    document: { findUnique: vi.fn() },
    documentReview: { findFirst: vi.fn() },
    itpItem: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction: vi.fn(),
  };
  p.$transaction.mockImplementation(async (cb: (tx: typeof p) => unknown) => cb(p));
  return p;
});

vi.mock('../config/database', () => ({ prisma: mockPrisma }));

// reviewService.ts (transitively, via slaService.ts) imports `config` from
// '../config', which reads required env vars (DATABASE_URL, JWT secrets) at
// module-load time and throws if they're unset. There's no .env file in CI,
// so this must be mocked here the same way authService.test.ts does it.
vi.mock('../config', () => ({
  config: {
    sla: { defaultDays: 7 },
    integration: { apiKey: '' },
  },
}));

// Avoid pulling in unrelated modules (pdf-lib, qrcode, etc.) transitively
// required only by other exports of reviewService.
vi.mock('../utils/pdfEngine/commentSheetGenerator', () => ({
  generateCommentSheet: vi.fn(),
}));

import { getItpItems, saveItpItems } from '../services/reviewService';

const SAMPLE_ITEM = {
  seq_no: 1,
  activity: 'Check foundation levelness',
  category: 'SIPIL' as const,
};

describe('reviewService — ITP items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => unknown) =>
      cb(mockPrisma),
    );
  });

  describe('getItpItems', () => {
    it('throws 404 when document does not exist', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);

      await expect(getItpItems('doc-missing')).rejects.toThrow(AppError);
      await expect(getItpItems('doc-missing')).rejects.toThrow('Document not found');
    });

    it('returns items ordered by seq_no when document exists', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1' });
      const items = [{ id: 'i1', seq_no: 1 }, { id: 'i2', seq_no: 2 }];
      mockPrisma.itpItem.findMany.mockResolvedValue(items);

      const result = await getItpItems('doc-1');

      expect(result).toBe(items);
      expect(mockPrisma.itpItem.findMany).toHaveBeenCalledWith({
        where: { document_id: 'doc-1' },
        orderBy: { seq_no: 'asc' },
      });
    });
  });

  describe('saveItpItems', () => {
    it('throws 404 when document does not exist', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);

      await expect(
        saveItpItems('doc-missing', 'user-1', Role.REVIEWER, [SAMPLE_ITEM]),
      ).rejects.toThrow('Document not found');
    });

    it('throws 403 when the document review already has a final status (locked)', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        reviews: [{ id: 'rev-1', final_status: 'APPROVED_A' }],
      });

      await expect(
        saveItpItems('doc-1', 'user-1', Role.REVIEWER, [SAMPLE_ITEM]),
      ).rejects.toThrow('ITP items are locked');

      expect(mockPrisma.itpItem.deleteMany).not.toHaveBeenCalled();
    });

    it('throws 403 for a role other than VENDOR, REVIEWER, or CHECKER', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });

      await expect(
        saveItpItems('doc-1', 'user-1', Role.APPROVER, [SAMPLE_ITEM]),
      ).rejects.toThrow('Only Vendor, Reviewer, or Checker can edit ITP items');
    });

    it('throws 403 when the REVIEWER is not the assigned reviewer', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: 'someone-else',
        checker_id: null,
        final_status: null,
      });

      await expect(
        saveItpItems('doc-1', 'user-1', Role.REVIEWER, [SAMPLE_ITEM]),
      ).rejects.toThrow('You are not the assigned reviewer for this document');
    });

    it('throws 403 when the CHECKER is not the assigned checker', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: null,
        checker_id: 'someone-else',
        final_status: null,
      });

      await expect(
        saveItpItems('doc-1', 'user-1', Role.CHECKER, [SAMPLE_ITEM]),
      ).rejects.toThrow('You are not the assigned checker for this document');
    });

    it('allows the assigned REVIEWER to save items', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: 'user-1',
        checker_id: null,
        final_status: null,
      });
      const saved = [{ id: 'i1', ...SAMPLE_ITEM }];
      mockPrisma.itpItem.findMany.mockResolvedValue(saved);

      const result = await saveItpItems('doc-1', 'user-1', Role.REVIEWER, [SAMPLE_ITEM]);

      expect(mockPrisma.itpItem.deleteMany).toHaveBeenCalledWith({
        where: { document_id: 'doc-1' },
      });
      expect(mockPrisma.itpItem.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            document_id: 'doc-1',
            seq_no: 1,
            activity: SAMPLE_ITEM.activity,
            category: 'SIPIL',
            sub_code: null,
            pp_code: null,
            pln_code: null,
            phase: 'FIELD',
          }),
        ],
      });
      expect(result).toBe(saved);
    });

    it('persists a per-party responsibility matrix (sub/pp/pln each get their own code)', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: 'user-1',
        checker_id: null,
        final_status: null,
      });
      mockPrisma.itpItem.findMany.mockResolvedValue([]);

      await saveItpItems('doc-1', 'user-1', Role.REVIEWER, [
        { ...SAMPLE_ITEM, sub_code: 'P', pp_code: 'R', pln_code: 'H' },
      ]);

      expect(mockPrisma.itpItem.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            sub_code: 'P',
            pp_code: 'R',
            pln_code: 'H',
          }),
        ],
      });
    });

    it('allows a REVIEWER to save when no reviewer has been assigned yet', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: null,
        checker_id: null,
        final_status: null,
      });
      mockPrisma.itpItem.findMany.mockResolvedValue([]);

      await expect(
        saveItpItems('doc-1', 'user-1', Role.REVIEWER, [SAMPLE_ITEM]),
      ).resolves.toEqual([]);
      expect(mockPrisma.itpItem.createMany).toHaveBeenCalled();
    });

    it('allows the assigned CHECKER to save items', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: null,
        checker_id: 'user-2',
        final_status: null,
      });
      mockPrisma.itpItem.findMany.mockResolvedValue([]);

      await expect(
        saveItpItems('doc-1', 'user-2', Role.CHECKER, [SAMPLE_ITEM]),
      ).resolves.toEqual([]);
    });

    it('deletes all items and skips createMany when given an empty list', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', reviews: [] });
      mockPrisma.documentReview.findFirst.mockResolvedValue({
        id: 'rev-1',
        reviewer_id: 'user-1',
        checker_id: null,
        final_status: null,
      });
      mockPrisma.itpItem.findMany.mockResolvedValue([]);

      await saveItpItems('doc-1', 'user-1', Role.REVIEWER, []);

      expect(mockPrisma.itpItem.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.itpItem.createMany).not.toHaveBeenCalled();
    });
  });
});
