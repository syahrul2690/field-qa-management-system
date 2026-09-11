export type BoqDocumentSection = 'FIELD_ITP' | 'PROCEDURE' | 'WORK_METHOD';

export type BoqDocumentStatus = 'empty' | 'approved' | 'pending' | 'rejected';

export interface BoqSectionFlag {
  status: BoqDocumentStatus;
  count: number;
}

export type BoqDocumentCounts = Record<BoqDocumentSection, BoqSectionFlag>;

const SECTIONS: Array<{ key: BoqDocumentSection; shortLabel: string; label: string }> = [
  { key: 'FIELD_ITP', shortLabel: 'ITP', label: 'Field ITP' },
  { key: 'PROCEDURE', shortLabel: 'Proc', label: 'Procedure' },
];

// Rejected outranks pending outranks approved visually — a row with any
// rejected section should never look calmer than one that's merely pending.
const STATUS_STYLE: Record<Exclude<BoqDocumentStatus, 'empty'>, { pill: string; word: string }> = {
  rejected: { pill: 'bg-red-50 text-red-700', word: 'rejected — needs revision' },
  pending: { pill: 'bg-amber-50 text-amber-700', word: 'awaiting approval' },
  approved: { pill: 'bg-green-50 text-green-700', word: 'approved' },
};

interface BoqDocumentBadgesProps {
  counts?: BoqDocumentCounts;
  isLoading?: boolean;
  isError?: boolean;
}

export function BoqDocumentBadges({ counts, isLoading = false, isError = false }: BoqDocumentBadgesProps) {
  if (isLoading) {
    return (
      <span
        className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
        aria-label="Checking documents…"
      >
        Docs…
      </span>
    );
  }

  if (isError) {
    return (
      <span
        className="flex-shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600"
        aria-label="Document status unavailable"
      >
        Docs ?
      </span>
    );
  }

  // No document anywhere in this item's subtree — say nothing rather than
  // repeating three empty pills on every row. Absence of a badge *is* the
  // "nothing to flag" signal.
  const flagged = counts
    ? SECTIONS.filter((section) => counts[section.key].status !== 'empty')
    : [];
  if (flagged.length === 0) return null;

  return (
    <div className="flex flex-shrink-0 items-center gap-1" aria-label="Document coverage flags">
      {flagged.map((section) => {
        const flag = counts![section.key];
        const style = STATUS_STYLE[flag.status as Exclude<BoqDocumentStatus, 'empty'>];
        const description = `${section.label}: ${flag.count} current, ${style.word}`;
        return (
          <span
            key={section.key}
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${style.pill}`}
            title={description}
            aria-label={description}
          >
            {section.shortLabel} {flag.count}
          </span>
        );
      })}
    </div>
  );
}
