import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../services/aiApi';
import { AiLoadingState } from './AiLoadingState';
import { AiErrorState } from './AiErrorState';

interface SummaryData {
  generated_at: string;
  cached: boolean;
  model_used: string;
  summary: {
    overall_status: string;
    document_progress: {
      total: number;
      by_status: Record<string, number>;
      by_section: Record<string, { total: number; completed: number; in_progress: number }>;
      completion_percentage: number;
    };
    review_trends: string;
    sla_compliance: {
      on_time_percentage: number;
      overdue_count: number;
      avg_review_days: number;
      details: string;
    };
    outstanding_items: Array<{ doc_number: string; title: string; issue: string; priority: string }>;
    risk_areas: Array<{ area: string; risk_level: string; description: string }>;
    recommendations: string[];
  };
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const RISK_COLORS: Record<string, string> = {
  HIGH: 'border-red-200 bg-red-50',
  MEDIUM: 'border-yellow-200 bg-yellow-50',
  LOW: 'border-green-200 bg-green-50',
};

const SECTION_LABELS: Record<string, string> = {
  FIELD_ITP: 'Field ITP',
  PROCEDURE: 'Procedure',
  WORK_METHOD: 'Work Method',
};

export function AiProjectSummaryCard({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-project-summary', projectId],
    queryFn: () => aiApi.getProjectSummary(projectId),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });

  const summaryData: SummaryData | null = data?.data?.data ?? null;
  const serverMessage: string = data?.data?.message ?? '';
  const notConfigured = serverMessage.toLowerCase().includes('not configured');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await aiApi.getProjectSummary(projectId, true);
      queryClient.setQueryData(['ai-project-summary', projectId], res);
    } catch { /* ignore */ }
    setRefreshing(false);
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
          <h2 className="text-sm font-semibold text-gray-800">AI Project Summary</h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
            AI-Generated
          </span>
        </div>

        <div className="flex items-center gap-2">
          {summaryData && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
              disabled={refreshing}
              className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
              title="Refresh AI summary"
            >
              <svg
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
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
      </div>

      {/* Body — only when expanded */}
      {expanded && (
        <div className="px-5 py-4">
          {isLoading || refreshing ? (
            <AiLoadingState message="Generating project summary..." />
          ) : isError ? (
            <AiErrorState onRetry={() => refetch()} />
          ) : notConfigured ? (
            <AiErrorState message="AI features are not configured. Set OPENROUTER_API_KEY to enable." />
          ) : !summaryData ? (
            <AiErrorState message="Could not generate summary for this project." onRetry={() => refetch()} />
          ) : (
            <SummaryContent data={summaryData} />
          )}
        </div>
      )}
    </div>
  );
}

function SummaryContent({ data }: { data: SummaryData }) {
  const { summary } = data;

  // Determine overall color from completion percentage
  const pct = summary.document_progress?.completion_percentage ?? 0;
  const statusColor =
    pct >= 75 ? 'bg-green-50 border-green-200 text-green-800'
    : pct >= 40 ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
    : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div className="space-y-5">
      {/* Overall status banner */}
      <div className={`p-3 rounded-lg border text-sm font-medium ${statusColor}`}>
        {summary.overall_status}
      </div>

      {/* Document progress */}
      {summary.document_progress && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Document Progress
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <MetricCard
              label="Total Documents"
              value={summary.document_progress.total}
            />
            <MetricCard
              label="Completion"
              value={`${Math.round(summary.document_progress.completion_percentage)}%`}
              color="text-primary-600"
            />
            <MetricCard
              label="Approved (A)"
              value={summary.document_progress.by_status?.APPROVED_A ?? 0}
              color="text-green-600"
            />
            <MetricCard
              label="Rejected (C)"
              value={summary.document_progress.by_status?.REJECTED_C ?? 0}
              color="text-red-600"
            />
          </div>

          {/* Section breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(summary.document_progress.by_section ?? {}).map(([section, stats]) => (
              <div key={section} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {SECTION_LABELS[section] ?? section}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-800">{stats.completed}</span>
                  <span className="text-xs text-gray-400">/ {stats.total} completed</span>
                </div>
                {stats.in_progress > 0 && (
                  <p className="text-xs text-yellow-600 mt-0.5">{stats.in_progress} in progress</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLA Compliance */}
      {summary.sla_compliance && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            SLA Compliance
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <MetricCard
              label="On-Time"
              value={`${summary.sla_compliance.on_time_percentage}%`}
              color={summary.sla_compliance.on_time_percentage >= 80 ? 'text-green-600' : 'text-red-600'}
            />
            <MetricCard
              label="Overdue"
              value={summary.sla_compliance.overdue_count}
              color={summary.sla_compliance.overdue_count > 0 ? 'text-red-600' : 'text-green-600'}
            />
            <MetricCard
              label="Avg. Days"
              value={summary.sla_compliance.avg_review_days}
            />
          </div>
          {summary.sla_compliance.details && (
            <p className="text-xs text-gray-500 mt-1">{summary.sla_compliance.details}</p>
          )}
        </div>
      )}

      {/* Review Trends */}
      {summary.review_trends && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Review Trends
          </h3>
          <p className="text-sm text-gray-600">{summary.review_trends}</p>
        </div>
      )}

      {/* Outstanding Items */}
      {summary.outstanding_items && summary.outstanding_items.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Outstanding Items
          </h3>
          <div className="space-y-1.5">
            {summary.outstanding_items.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`badge text-[10px] mt-0.5 ${PRIORITY_COLORS[item.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                  {item.priority}
                </span>
                <div className="min-w-0">
                  <span className="font-medium text-gray-800">{item.doc_number}</span>
                  <span className="text-gray-400 mx-1">—</span>
                  <span className="text-gray-600">{item.issue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Areas */}
      {summary.risk_areas && summary.risk_areas.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Risk Areas
          </h3>
          <div className="space-y-2">
            {summary.risk_areas.map((risk, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${RISK_COLORS[risk.risk_level] ?? 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge text-[10px] ${PRIORITY_COLORS[risk.risk_level] ?? 'bg-gray-100 text-gray-600'}`}>
                    {risk.risk_level}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{risk.area}</span>
                </div>
                <p className="text-xs text-gray-600">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Recommendations
          </h3>
          <ul className="space-y-1.5">
            {summary.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-primary-400 mt-1 flex-shrink-0">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
        <span>Model: {data.model_used}</span>
        <span>
          {data.cached ? 'Cached' : 'Fresh'} · {new Date(data.generated_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color = 'text-gray-800',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
    </div>
  );
}
