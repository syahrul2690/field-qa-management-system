import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentSection, ReviewStatus } from '@prisma/client';

const mockPrisma = vi.hoisted(() => ({
  project: { findMany: vi.fn() },
  boqItem: { findUnique: vi.fn() },
  document: { findMany: vi.fn(), findUnique: vi.fn() },
  boqItemInspectionResult: { findMany: vi.fn(), upsert: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../config/database', () => ({ prisma: mockPrisma }));

import { getQcReadiness, writeBackInspectionResult } from '../services/integrationService';

describe('integrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    );
  });

  it('reports ready only when each required current document is approved', async () => {
    mockPrisma.boqItem.findUnique.mockResolvedValue({
      id: 'boq-1',
      item_code: 'A.1',
      title: 'Power transformer',
    });
    mockPrisma.document.findMany
      .mockResolvedValueOnce([{
        id: 'doc-itp',
        doc_number: 'ITP-001',
        revision_no: 2,
        status: ReviewStatus.APPROVED_A,
        title: 'Field ITP',
      }])
      .mockResolvedValueOnce([{
        id: 'doc-procedure',
        doc_number: 'PROC-001',
        revision_no: 1,
        status: ReviewStatus.APPROVED_WITH_COMMENTS_B,
        title: 'Procedure',
      }]);
    const inspectionResults = [{ id: 'result-1', status: 'APPROVED' }];
    mockPrisma.boqItemInspectionResult.findMany.mockResolvedValue(inspectionResults);

    const result = await getQcReadiness('boq-1');

    expect(result?.ready).toBe(true);
    expect(result?.sections.map((section) => section.section)).toEqual([
      DocumentSection.FIELD_ITP,
      DocumentSection.PROCEDURE,
    ]);
    expect(result?.inspection_results).toBe(inspectionResults);
    expect(mockPrisma.document.findMany).toHaveBeenCalledTimes(2);
    expect(mockPrisma.document.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({ section: DocumentSection.FIELD_ITP, is_current: true }),
      }),
    );
  });

  it('marks a section ambiguous and not ready when multiple current documents exist', async () => {
    mockPrisma.boqItem.findUnique.mockResolvedValue({ id: 'boq-1' });
    mockPrisma.document.findMany
      .mockResolvedValueOnce([{ id: 'doc-1' }, { id: 'doc-2' }])
      .mockResolvedValueOnce([]);
    mockPrisma.boqItemInspectionResult.findMany.mockResolvedValue([]);

    const result = await getQcReadiness('boq-1');

    expect(result?.ready).toBe(false);
    expect(result?.sections[0]).toMatchObject({
      section: DocumentSection.FIELD_ITP,
      ready: false,
      ambiguous: true,
      document: null,
    });
  });

  it('upserts an idempotent inspection ledger row for every BOQ item covered by the QA document', async () => {
    mockPrisma.boqItem.findUnique.mockResolvedValue({ id: 'boq-target' });
    mockPrisma.document.findUnique.mockResolvedValue({
      boq_item_id: 'boq-primary',
      boq_item_links: [{ boq_item_id: 'boq-linked' }, { boq_item_id: 'boq-target' }],
    });
    mockPrisma.boqItemInspectionResult.upsert.mockImplementation(async ({ create }) => create);

    const result = await writeBackInspectionResult('boq-target', {
      inspection_report_id: 'report-42',
      revision_no: 3,
      status: 'APPROVED',
      result: 'PASS',
      report_pdf_url: 'https://powerqc.example/reports/42.pdf',
      payload: { qaDocumentId: 'doc-qa' },
    });

    expect(mockPrisma.boqItemInspectionResult.upsert).toHaveBeenCalledTimes(3);
    expect(mockPrisma.boqItemInspectionResult.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          boq_item_id_inspection_report_id: {
            boq_item_id: 'boq-target',
            inspection_report_id: 'report-42',
          },
        },
        create: expect.objectContaining({
          boq_item_id: 'boq-target',
          revision_no: 3,
          status: 'APPROVED',
          result: 'PASS',
        }),
      }),
    );
    expect(result).toHaveLength(3);
  });

  it('returns null and does not write when the target BOQ item does not exist', async () => {
    mockPrisma.boqItem.findUnique.mockResolvedValue(null);

    await expect(writeBackInspectionResult('missing', {
      inspection_report_id: 'report-42',
      status: 'APPROVED',
    })).resolves.toBeNull();

    expect(mockPrisma.boqItemInspectionResult.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
