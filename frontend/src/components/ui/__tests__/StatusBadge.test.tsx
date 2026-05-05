import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders Draft for DRAFT status', () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders Approved A for APPROVED_A status', () => {
    render(<StatusBadge status="APPROVED_A" />);
    expect(screen.getByText('Status A — Approved')).toBeInTheDocument();
  });

  it('renders Rejected C for REJECTED_C status', () => {
    render(<StatusBadge status="REJECTED_C" />);
    expect(screen.getByText('Status C — Revise & Resubmit')).toBeInTheDocument();
  });

  it('falls back to raw status for unknown value', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });
});
