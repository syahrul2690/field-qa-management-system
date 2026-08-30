export type BoqDocumentSection = 'FIELD_ITP' | 'PROCEDURE' | 'WORK_METHOD';

export type BoqDocumentCounts = Record<BoqDocumentSection, number>;

const SECTIONS: Array<{ key: BoqDocumentSection; shortLabel: string; label: string }> = [
  { key: 'FIELD_ITP', shortLabel: 'ITP', label: 'Field ITP' },
  { key: 'PROCEDURE', shortLabel: 'Proc', label: 'Procedure' },
  { key: 'WORK_METHOD', shortLabel: 'WM', label: 'Work Method' },
];

interface BoqDocumentBadgesProps {
  counts?: BoqDocumentCounts;
  isLoading?: boolean;
  isError?: boolean;
}

export function BoqDocumentBadges({ counts, isLoading = false, isError = false }: BoqDocumentBadgesProps) {
  if (isLoading || isError || !counts) {
    const state = isLoading ? 'Checking documents…' : 'Document status unavailable';
    return (
      <span
        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
          isError || !counts ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
        }`}
        aria-label={state}
      >
        {isLoading ? 'Docs…' : 'Docs ?'}
      </span>
    );
  }

  return (
    <div className="flex flex-shrink-0 items-center gap-1" aria-label="Current document coverage">
      {SECTIONS.map((section) => {
        const count = counts[section.key];
        const state = count > 0 ? `${count} current` : 'Empty';
        return (
          <span
            key={section.key}
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              count > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
            title={`${section.label}: ${state}`}
            aria-label={`${section.label}: ${state}`}
          >
            {section.shortLabel} {count > 0 ? count : '—'}
          </span>
        );
      })}
    </div>
  );
}
