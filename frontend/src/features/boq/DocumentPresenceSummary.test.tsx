import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentPresenceSummary } from './DocumentPresenceSummary';

describe('DocumentPresenceSummary', () => {
  it('counts current documents and ignores historical revisions', () => {
    render(
      <DocumentPresenceSummary
        documents={[
          { section: 'FIELD_ITP', is_current: true },
          { section: 'FIELD_ITP', is_current: false },
          { section: 'PROCEDURE', is_current: true },
          { section: 'PROCEDURE', is_current: true },
          { section: 'WORK_METHOD', is_current: false },
        ]}
      />,
    );

    expect(screen.getByLabelText('Field ITP: 1 current')).toBeInTheDocument();
    expect(screen.getByLabelText('Procedure: 2 current')).toBeInTheDocument();
    expect(screen.queryByText('Work Method')).not.toBeInTheDocument();
  });

  it('shows empty state for an item with no documents', () => {
    render(<DocumentPresenceSummary documents={[]} />);

    expect(screen.getByLabelText('Field ITP: Empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Procedure: Empty')).toBeInTheDocument();
  });

  it('distinguishes loading from empty', () => {
    render(<DocumentPresenceSummary documents={[]} isLoading />);

    expect(screen.getAllByText('Loading…')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Checking document coverage');
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('distinguishes an API error from empty', () => {
    render(<DocumentPresenceSummary documents={[]} isError />);

    expect(screen.getAllByText('Unavailable')).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });
});
