import { config } from '../config';

// Calculate SLA deadline from submission date
export function calculateSlaDeadline(submittedAt: Date, slaDays?: number): Date {
  const days = slaDays ?? config.sla.defaultDays;
  const deadline = new Date(submittedAt);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

// Check if a review is overdue
export function isOverdue(
  slaDeadline: Date | null | undefined,
  finalStatus: string | null | undefined,
): boolean {
  if (finalStatus) return false; // completed reviews are not overdue
  if (!slaDeadline) return false;
  return new Date() > slaDeadline;
}

// Get current workflow stage based on timestamps
export function getCurrentStage(
  reviewedAt: Date | null | undefined,
  checkedAt: Date | null | undefined,
  approvedAt: Date | null | undefined,
): 'REVIEW' | 'CHECK' | 'APPROVE' | 'COMPLETE' {
  if (approvedAt) return 'COMPLETE';
  if (checkedAt) return 'APPROVE';
  if (reviewedAt) return 'CHECK';
  return 'REVIEW';
}
