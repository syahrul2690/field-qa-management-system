import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InspectionResult, InspectionResultsSection } from './InspectionResultsSection';

const result: InspectionResult = {
  id: 'result-1',
  inspection_report_id: 'QC-REPORT-42',
  revision_no: 3,
  status: 'APPROVED',
  result: 'PASS',
  report_pdf_url: 'https://powerqc.example/reports/42.pdf',
  received_at: '2026-08-27T03:00:00.000Z',
  updated_at: '2026-08-27T03:00:00.000Z',
};

describe('InspectionResultsSection', () => {
  it('shows the latest PowerQC inspection result and report link', () => {
    render(<InspectionResultsSection results={[result]} />);

    expect(screen.getByText('PowerQC inspections')).toBeInTheDocument();
    expect(screen.getByText('1 received')).toBeInTheDocument();
    expect(screen.getByText(/QC-REPORT-42/)).toHaveTextContent('Rev. 3');
    expect(screen.getByText('PASS')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View report' })).toHaveAttribute(
      'href',
      'https://powerqc.example/reports/42.pdf',
    );
  });

  it('shows an explicit empty state before any result is received', () => {
    render(<InspectionResultsSection results={[]} />);

    expect(screen.getByText('No final inspection result has been received.')).toBeInTheDocument();
  });

  it('does not render unsafe report URL schemes', () => {
    render(
      <InspectionResultsSection
        results={[{ ...result, report_pdf_url: 'javascript:alert(1)' }]}
      />,
    );

    expect(screen.queryByRole('link', { name: 'View report' })).not.toBeInTheDocument();
  });
});
