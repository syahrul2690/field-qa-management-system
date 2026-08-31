import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoqDocumentBadges, BoqDocumentCounts } from './BoqDocumentBadges';

function counts(overrides: Partial<BoqDocumentCounts>): BoqDocumentCounts {
  return {
    FIELD_ITP: { status: 'empty', count: 0 },
    PROCEDURE: { status: 'empty', count: 0 },
    WORK_METHOD: { status: 'empty', count: 0 },
    ...overrides,
  };
}

describe('BoqDocumentBadges', () => {
  it('only renders sections that have a document, colored by status', () => {
    render(
      <BoqDocumentBadges
        counts={counts({
          FIELD_ITP: { status: 'approved', count: 1 },
          WORK_METHOD: { status: 'rejected', count: 2 },
        })}
      />,
    );

    expect(screen.getByLabelText('Field ITP: 1 current, approved')).toHaveTextContent('ITP 1');
    expect(screen.getByLabelText('Work Method: 2 current, rejected — needs revision')).toHaveTextContent('WM 2');
    expect(screen.queryByText(/Proc/)).not.toBeInTheDocument();
  });

  it('renders nothing when every section is empty, instead of three empty pills', () => {
    const { container } = render(<BoqDocumentBadges counts={counts({})} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows loading and error states instead of implying empty', () => {
    const { rerender } = render(<BoqDocumentBadges isLoading />);
    expect(screen.getByLabelText('Checking documents…')).toHaveTextContent('Docs…');

    rerender(<BoqDocumentBadges isError />);
    expect(screen.getByLabelText('Document status unavailable')).toHaveTextContent('Docs ?');
  });
});
