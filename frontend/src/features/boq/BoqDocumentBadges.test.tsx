import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoqDocumentBadges } from './BoqDocumentBadges';

describe('BoqDocumentBadges', () => {
  it('shows section counts and explicit empty states', () => {
    render(
      <BoqDocumentBadges counts={{ FIELD_ITP: 1, PROCEDURE: 0, WORK_METHOD: 2 }} />,
    );

    expect(screen.getByLabelText('Field ITP: 1 current')).toHaveTextContent('ITP 1');
    expect(screen.getByLabelText('Procedure: Empty')).toHaveTextContent('Proc —');
    expect(screen.getByLabelText('Work Method: 2 current')).toHaveTextContent('WM 2');
  });

  it('shows loading and error states instead of implying empty', () => {
    const { rerender } = render(<BoqDocumentBadges isLoading />);
    expect(screen.getByLabelText('Checking documents…')).toHaveTextContent('Docs…');
    expect(screen.queryByText('ITP —')).not.toBeInTheDocument();

    rerender(<BoqDocumentBadges isError />);
    expect(screen.getByLabelText('Document status unavailable')).toHaveTextContent('Docs ?');
    expect(screen.queryByText('ITP —')).not.toBeInTheDocument();
  });
});
