export interface InspectionResult {
  id: string;
  inspection_report_id: string;
  revision_no: number | null;
  status: string;
  result: string | null;
  report_pdf_url: string | null;
  received_at: string;
  updated_at: string;
}

interface InspectionResultsSectionProps {
  results: InspectionResult[];
  isLoading?: boolean;
  isError?: boolean;
}

function safeReportUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function formatReceivedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function InspectionResultsSection({
  results,
  isLoading = false,
  isError = false,
}: InspectionResultsSectionProps) {
  return (
    <section className="border-b border-gray-200 bg-slate-50 px-6 py-4" aria-labelledby="inspection-results-title">
      <div className="flex items-center justify-between gap-3">
        <h3 id="inspection-results-title" className="text-sm font-semibold text-gray-900">
          PowerQC inspections
        </h3>
        {!isLoading && !isError && results.length > 0 && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {results.length} received
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="mt-2 text-xs text-gray-500" role="status">Loading inspection results…</p>
      ) : isError ? (
        <p className="mt-2 text-xs text-red-600" role="alert">Inspection results could not be loaded.</p>
      ) : results.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">No final inspection result has been received.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {results.map((inspection) => {
            const reportUrl = safeReportUrl(inspection.report_pdf_url);
            return (
              <article key={inspection.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-mono text-gray-500">
                      {inspection.inspection_report_id}
                      {inspection.revision_no !== null ? ` · Rev. ${inspection.revision_no}` : ''}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {inspection.result || inspection.status}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {inspection.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>Received {formatReceivedAt(inspection.received_at)}</span>
                  {reportUrl && (
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      View report
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
