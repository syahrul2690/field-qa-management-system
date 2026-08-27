import { describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  boqItem: { findUnique: vi.fn() },
}));

vi.mock('../config/database', () => ({ prisma: mockPrisma }));

import { getBoqItem } from '../services/boqService';

describe('boqService inspection-result visibility', () => {
  it('returns inspection results newest first with only UI-safe ledger fields', async () => {
    const item = { id: 'boq-1', inspection_results: [{ id: 'result-1' }] };
    mockPrisma.boqItem.findUnique.mockResolvedValue(item);

    await expect(getBoqItem('boq-1')).resolves.toBe(item);

    expect(mockPrisma.boqItem.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'boq-1' },
      include: expect.objectContaining({
        inspection_results: {
          orderBy: { updated_at: 'desc' },
          select: {
            id: true,
            inspection_report_id: true,
            revision_no: true,
            status: true,
            result: true,
            report_pdf_url: true,
            received_at: true,
            updated_at: true,
          },
        },
      }),
    }));
  });
});
