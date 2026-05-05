import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../../services/aiApi';
import { AiLoadingState } from './AiLoadingState';
import { AiErrorState } from './AiErrorState';
import { useUIStore } from '../../store/uiStore';

interface AnalysisData {
  generated_at: string;
  cached: boolean;
  model_used: string;
  analysis: {
    document_summary: string;
    key_findings: Array<{ finding: string; page_ref: string; severity: string }>;
    suggested_comments: Array<{ comment: string; page_ref: string; category: string }>;
    compliance_flags: Array<{ flag: string; standard: string; status: string; details: string }>;
    recommended_disposition: {
      disposition: string;
      reasoning: string;
      confidence: string;
    };
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  PASS: { icon: 'M5 13l4 4L19 7', color: 'text-green-500' },
  FAIL: { icon: 'M6 18L18 6M6 6l12 12', color: 'text-red-500' },
  NEEDS_REVIEW: { icon: 'M12 9v2m0 4h.01', color: 'text-yellow-500' },
};

const DISPOSITION_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-200',
  B: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  C: 'bg-red-100 text-red-800 border-red-200',
};

const DISPOSITION_LABELS: Record<string, string> = {
  A: 'Approved (A)',
  B: 'Approved with Comments (B)',
  C: 'Rejected (C)',
};

const CATEGORY_COLORS: Record<string, string> = {
  COMPLETENESS: 'bg-blue-50 text-blue-600',
  ACCURACY: 'bg-purple-50 text-purple-600',
  COMPLIANCE: 'bg-orange-50 text-orange-600',
  FORMAT: 'bg-gray-100 text-gray-600',
};

const CONFIDENCE_DOTS: Record<string, string> = {
  HIGH: 'text-green-500',
  MEDIUM: 'text-yellow-500',
  LOW: 'text-red-500',
};

export function AiReviewAssistantPanel({ documentId }: { documentId: string }) {
  const [expanded, setExpanded] = useState(false);
  const { addToast } = useUIStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-doc-analysis', documentId],
    queryFn: () => aiApi.getDocumentAnalysis(documentId),
    staleTime: Infinity, // Cached per revision, permanent
    retry: 1,
    enabled: expanded, // Only fetch when panel is opened
  });

  const analysisData: AnalysisData | null = data?.data?.data ?? null;
  const serverMessage: string = data?.data?.message ?? '';
  const notConfigured = serverMessage.toLowerCase().includes('not configured');
  const noText = !notConfigured && serverMessage.toLowerCase().includes('extractable text');

  const copyComment = (comment: string, pageRef: string) => {
    const text = pageRef ? `[${pageRef}] ${comment}` : comment;
    navigator.clipboard.writeText(text).then(
      () => addToast('success', 'Comment copied to clipboard'),
      () => addToast('error', 'Failed to copy'),
    );
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="card-header flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-4.5 w-4.5 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-gray-800">AI Review Assistant</h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
            AI-Generated
          </span>
        </div>

        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 py-4">
          {isLoading ? (
            <AiLoadingState message="Analyzing document content..." />
          ) : isError ? (
            <AiErrorState onRetry={() => refetch()} />
          ) : notConfigured ? (
            <AiErrorState message="AI features are not configured. Set OPENROUTER_API_KEY to enable." />
          ) : noText ? (
            <AiErrorState message="This document is a scanned PDF and exceeds the size limit for image analysis (10 MB). Please upload a smaller or text-based PDF." />
          ) : !analysisData ? (
            <AiErrorState
              message="Could not analyze this document at this time."
              onRetry={() => refetch()}
            />
          ) : (
            <div className="space-y-5">
              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <svg className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-[11px] text-amber-700">
                  AI-generated analysis. Always verify findings against the actual document before submitting your review.
                </p>
              </div>

              {/* Document Summary */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Document Summary
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {analysisData.analysis.document_summary}
                </p>
              </div>

              {/* Recommended Disposition */}
              {analysisData.analysis.recommended_disposition && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Recommended Disposition
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${
                      DISPOSITION_COLORS[analysisData.analysis.recommended_disposition.disposition] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {DISPOSITION_LABELS[analysisData.analysis.recommended_disposition.disposition] ??
                      analysisData.analysis.recommended_disposition.disposition}
                    <span className={`text-[10px] font-medium ${CONFIDENCE_DOTS[analysisData.analysis.recommended_disposition.confidence] ?? 'text-gray-400'}`}>
                      ({analysisData.analysis.recommended_disposition.confidence} confidence)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {analysisData.analysis.recommended_disposition.reasoning}
                  </p>
                </div>
              )}

              {/* Key Findings */}
              {analysisData.analysis.key_findings?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Key Findings
                  </h3>
                  <div className="space-y-1.5">
                    {analysisData.analysis.key_findings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className={`badge text-[10px] mt-0.5 flex-shrink-0 ${SEVERITY_COLORS[f.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                          {f.severity}
                        </span>
                        <div className="min-w-0">
                          <span className="text-gray-700">{f.finding}</span>
                          {f.page_ref && (
                            <span className="text-[10px] text-gray-400 ml-1">({f.page_ref})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Comments */}
              {analysisData.analysis.suggested_comments?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Suggested Review Comments
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Comment</th>
                          <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase w-24">Page</th>
                          <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase w-28">Category</th>
                          <th className="px-3 py-2 w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analysisData.analysis.suggested_comments.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-gray-700">{c.comment}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400">{c.page_ref || '—'}</td>
                            <td className="px-3 py-2.5">
                              <span className={`badge text-[10px] ${CATEGORY_COLORS[c.category] ?? 'bg-gray-100 text-gray-600'}`}>
                                {c.category}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => copyComment(c.comment, c.page_ref)}
                                className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                title="Copy comment"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Compliance Flags */}
              {analysisData.analysis.compliance_flags?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Compliance Checks
                  </h3>
                  <div className="space-y-1.5">
                    {analysisData.analysis.compliance_flags.map((flag, i) => {
                      const statusInfo = STATUS_ICONS[flag.status] ?? STATUS_ICONS.NEEDS_REVIEW;
                      return (
                        <div key={i} className="flex items-start gap-2.5 text-sm">
                          <svg className={`h-4 w-4 flex-shrink-0 mt-0.5 ${statusInfo.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={statusInfo.icon} />
                          </svg>
                          <div className="min-w-0">
                            <span className="text-gray-800 font-medium">{flag.flag}</span>
                            {flag.standard && (
                              <span className="text-[10px] text-gray-400 ml-1">({flag.standard})</span>
                            )}
                            {flag.details && (
                              <p className="text-xs text-gray-500 mt-0.5">{flag.details}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                <span>Model: {analysisData.model_used}</span>
                <span>
                  {analysisData.cached ? 'Cached' : 'Fresh'} · {new Date(analysisData.generated_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
