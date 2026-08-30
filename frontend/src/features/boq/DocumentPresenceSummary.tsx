export interface DocumentPresenceRecord {
  section: string;
  is_current?: boolean;
}

const DOCUMENT_SECTIONS = [
  { key: 'FIELD_ITP', label: 'Field ITP' },
  { key: 'PROCEDURE', label: 'Procedure' },
  { key: 'WORK_METHOD', label: 'Work Method' },
] as const;

interface DocumentPresenceSummaryProps {
  documents: DocumentPresenceRecord[];
  isLoading?: boolean;
  isError?: boolean;
}

function stateLabel(section: string, documents: DocumentPresenceRecord[], isLoading: boolean, isError: boolean) {
  if (isLoading) return 'Loading…';
  if (isError) return 'Unavailable';

  const currentCount = documents.filter((document) => (
    document.section === section && document.is_current === true
  )).length;

  return currentCount > 0 ? `${currentCount} current` : 'Empty';
}

export function DocumentPresenceSummary({
  documents,
  isLoading = false,
  isError = false,
}: DocumentPresenceSummaryProps) {
  return (
    <section
      className="border-b border-gray-200 bg-white px-6 py-3"
      aria-labelledby="document-presence-title"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 id="document-presence-title" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Document coverage
        </h3>
        <span className="text-xs text-gray-400">Current versions only</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DOCUMENT_SECTIONS.map((section) => {
          const label = stateLabel(section.key, documents, isLoading, isError);
          const isPresent = !isLoading && !isError && label !== 'Empty';
          return (
            <div key={section.key} className="min-w-0 rounded-md border border-gray-200 px-2.5 py-2">
              <p className="truncate text-xs font-medium text-gray-700">{section.label}</p>
              <span
                className={`mt-1 inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ${
                  isLoading
                    ? 'bg-gray-100 text-gray-500'
                    : isError
                      ? 'bg-red-100 text-red-700'
                      : isPresent
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                }`}
                aria-label={`${section.label}: ${label}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {isLoading && <p className="mt-2 text-xs text-gray-500" role="status">Checking document coverage…</p>}
      {isError && <p className="mt-2 text-xs text-red-600" role="alert">Document coverage could not be loaded.</p>}
    </section>
  );
}
