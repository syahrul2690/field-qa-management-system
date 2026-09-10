import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projectApi } from '../../services/projectApi';
import { WmsMonitoringPanel } from './WmsMonitoringPanel';

vi.mock('../../services/projectApi', () => ({
  projectApi: { wmsMonitoring: vi.fn() },
}));

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <WmsMonitoringPanel projectId="project-1" />
    </QueryClientProvider>,
  );
}

describe('WmsMonitoringPanel', () => {
  it('renders linked WMS records returned by Field QC', async () => {
    vi.mocked(projectApi.wmsMonitoring).mockResolvedValue({
      data: {
        success: true,
        data: {
          data: [{
            id: 'wms-1',
            code: 'WMS-2026-0001',
            title: 'Pekerjaan tanah',
            qa_boq_item_id: 'boq-1',
            boq_item_code: 'A.1.1',
            boq_item_title: 'Earthworks',
            document_revision: 0,
            workflow_status: 'UNDER_REVIEW',
            final_quality_status: null,
            finalized_at: null,
            monitoring_status: 'PENDING',
            updated_at: '2026-09-10T00:00:00.000Z',
            detail_url: 'https://field-qc.example/wms-review/wms-1',
          }],
          pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
        },
      },
    } as never);

    renderPanel();

    expect(await screen.findByText('Pekerjaan tanah')).toBeInTheDocument();
    expect(screen.getByText(/A\.1\.1/)).toHaveTextContent('Earthworks');
    expect(screen.getByRole('link', { name: 'Buka di Field QC' })).toHaveAttribute(
      'href',
      'https://field-qc.example/wms-review/wms-1',
    );
    expect(projectApi.wmsMonitoring).toHaveBeenCalledWith('project-1', {
      page: '1',
      limit: '20',
    });
  });
});
