const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED_A: { label: 'Status A — Approved', className: 'bg-green-100 text-green-700' },
  APPROVED_WITH_COMMENTS_B: { label: 'Status B — Approved w/ Comments', className: 'bg-orange-100 text-orange-700' },
  REJECTED_C: { label: 'Status C — Revise & Resubmit', className: 'bg-red-100 text-red-700' },
  SUPERSEDED: { label: 'Superseded', className: 'bg-gray-100 text-gray-400 line-through' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
