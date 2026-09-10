import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  boqItem: { findMany: vi.fn() },
}));

vi.mock('../config/database', () => ({ prisma: mockPrisma }));
vi.mock('../config', () => ({
  config: {
    fieldQc: {
      apiUrl: 'https://field-qc.example',
      monitoringApiKey: 'shared-secret',
      timeoutMs: 5_000,
    },
  },
}));

import { getProjectWmsMonitoring } from '../services/fieldQcMonitoringService';

describe('fieldQcMonitoringService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPrisma.boqItem.findMany.mockReset();
  });

  it('reads Field QC with project filters and enriches the BOQ labels', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{
          id: 'wms-1',
          code: 'WMS-001',
          title: 'Pekerjaan tanah',
          qa_project_id: 'project-1',
          qa_boq_item_id: 'boq-1',
          document_revision: 0,
          workflow_status: 'UNDER_REVIEW',
          final_quality_status: null,
          finalized_at: null,
          monitoring_status: 'PENDING',
          updated_at: '2026-09-10T00:00:00.000Z',
          detail_url: 'https://field-qc.example/wms-review/wms-1',
        }],
        pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
      }),
    } as Response);
    mockPrisma.boqItem.findMany.mockResolvedValue([
      { id: 'boq-1', item_code: 'A.1.1', title: 'Earthworks' },
    ]);

    const result = await getProjectWmsMonitoring({
      projectId: 'project-1',
      workflowStatus: 'UNDER_REVIEW',
    });

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as URL);
    expect(requestedUrl.pathname).toBe('/integration/wms-monitoring');
    expect(requestedUrl.searchParams.get('qaProjectId')).toBe('project-1');
    expect(requestedUrl.searchParams.get('workflowStatus')).toBe('UNDER_REVIEW');
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      headers: { 'x-api-key': 'shared-secret' },
    }));
    expect(result.data[0]).toMatchObject({
      boq_item_code: 'A.1.1',
      boq_item_title: 'Earthworks',
    });
  });

  it('returns a service-unavailable error when Field QC cannot be reached', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    await expect(getProjectWmsMonitoring({ projectId: 'project-1' })).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('rejects a malformed Field QC response instead of rendering misleading empty data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await expect(getProjectWmsMonitoring({ projectId: 'project-1' })).rejects.toMatchObject({
      statusCode: 503,
    });
    expect(mockPrisma.boqItem.findMany).not.toHaveBeenCalled();
  });
});
