import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { reviewApi } from '../../services/reviewApi';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewItem {
  id: string;
  document_title?: string;
  document_number?: string;
  project_name?: string;
  boq_item_title?: string;
  section?: string;
  status?: string;
  final_status?: string | null;
  sla_deadline?: string;
  approved_at?: string | null;
  created_at: string;
  is_overdue?: boolean;
  current_stage?: string;
  reviewer?: { id: string; name: string } | null;
}

interface QueueData {
  active: ReviewItem[];
  awaiting_ams: ReviewItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d?: string | null) => {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd MMM yyyy'); } catch { return d; }
};

const SECTION_LABEL: Record<string, string> = {
  FIELD_ITP: 'Field ITP',
  PROCEDURE: 'Procedure',
  WORK_METHOD: 'Work Method',
};

const FINAL_STATUS_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  APPROVED_A:               { label: 'Status A — Approved',              bg: 'bg-green-100', text: 'text-green-700' },
  APPROVED_WITH_COMMENTS_B: { label: 'Status B — Approved w/ Comments',  bg: 'bg-teal-100',  text: 'text-teal-700'  },
  REJECTED_C:               { label: 'Status C — Revise & Resubmit',     bg: 'bg-red-100',   text: 'text-red-700'   },
};

// ─── Active Review Card ───────────────────────────────────────────────────────

function ActiveReviewCard({ review }: { review: ReviewItem }) {
  const navigate = useNavigate();
  const isOverdue = review.sla_deadline ? isPast(parseISO(review.sla_deadline)) : false;

  return (
    <div
      onClick={() => navigate(`/reviews/${review.id}`)}
      className={`card p-5 cursor-pointer hover:shadow-md transition-all ${
        isOverdue ? 'border-red-300 bg-red-50' : 'hover:border-primary-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-mono">{review.document_number ?? '—'}</p>
          <h3 className="font-semibold text-gray-900 truncate mt-0.5">
            {review.document_title ?? 'Untitled Document'}
          </h3>
        </div>
        {review.status && <StatusBadge status={review.status} />}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        {review.project_name && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <span className="truncate">{review.project_name}</span>
          </div>
        )}
        {review.boq_item_title && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="truncate">{review.boq_item_title}</span>
          </div>
        )}
        {review.section && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z" />
            </svg>
            <span>{SECTION_LABEL[review.section] ?? review.section}</span>
          </div>
        )}
      </div>

      {review.sla_deadline && (
        <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isOverdue ? 'OVERDUE — ' : 'SLA: '}
          {fmt(review.sla_deadline)}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <span className="text-xs text-primary-600 font-medium">Review now →</span>
      </div>
    </div>
  );
}

// ─── Awaiting AMS Card ────────────────────────────────────────────────────────

function AwaitingAmsCard({ review, isReviewer }: { review: ReviewItem; isReviewer: boolean }) {
  const navigate = useNavigate();
  const finalCfg = review.final_status ? FINAL_STATUS_LABEL[review.final_status] : null;

  return (
    <div
      onClick={() => navigate(`/reviews/${review.id}`)}
      className="card p-5 cursor-pointer hover:shadow-md transition-all border-l-4 border-amber-400 hover:border-amber-500"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-mono">{review.document_number ?? '—'}</p>
          <h3 className="font-semibold text-gray-900 truncate mt-0.5">
            {review.document_title ?? 'Untitled Document'}
          </h3>
        </div>
        {/* Final status chip */}
        {finalCfg && (
          <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded ${finalCfg.bg} ${finalCfg.text}`}>
            {finalCfg.label}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="text-xs text-gray-500 space-y-1">
        {review.project_name && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <span className="truncate">{review.project_name}</span>
          </div>
        )}
        {review.boq_item_title && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="truncate">{review.boq_item_title}</span>
          </div>
        )}
        {review.section && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z" />
            </svg>
            <span>{SECTION_LABEL[review.section] ?? review.section}</span>
          </div>
        )}
        {review.reviewer && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Reviewer: {review.reviewer.name}</span>
          </div>
        )}
      </div>

      {/* Approved at */}
      {review.approved_at && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Decision issued: {fmt(review.approved_at)}
        </div>
      )}

      {/* AMS pending notice + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Aplikasi Manajemen Surat belum diunggah
        </span>
        <span className={`text-xs font-medium ${isReviewer ? 'text-amber-600' : 'text-gray-400'}`}>
          {isReviewer ? 'Unggah sekarang →' : 'Lihat detail →'}
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card p-10 text-center">
      <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReviewDashboard() {
  const { user } = useAuthStore();
  const isReviewer = user?.role === 'REVIEWER';
  const isPic = user?.role === 'PIC_CONSULTANT' || user?.role === 'PIC_PROJECT';

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: () => reviewApi.pending(),
    refetchInterval: 60_000,
  });

  const queue: QueueData = data?.data?.data ?? { active: [], awaiting_ams: [] };
  const { active, awaiting_ams } = queue;

  const pageTitle = isPic ? 'Assignment Queue' : 'Review Queue';
  const pageSubtitle = isPic
    ? 'Documents submitted by vendors that need a review team assigned.'
    : 'Documents awaiting your review action.';

  return (
    <div className="space-y-8 w-full">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{pageSubtitle}</p>
      </div>

      {isLoading && (
        <div className="py-12"><LoadingSpinner size="lg" /></div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
          Failed to load review queue.
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* ── Section 1: Active / In-Progress ─────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  In-Progress Reviews
                  {active.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">({active.length})</span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isPic
                    ? 'Documents submitted by vendors waiting for a reviewer to be assigned.'
                    : 'Documents actively going through the review cycle that require your action or are waiting on another team member.'}
                </p>
              </div>
            </div>

            {active.length === 0 ? (
              <EmptyState message="No active reviews. You're all caught up!" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {active.map((r) => <ActiveReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </section>

          {/* ── Section 2: Completed — Awaiting AMS Upload ──────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Pending Aplikasi Manajemen Surat
                  {awaiting_ams.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">({awaiting_ams.length})</span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isReviewer
                    ? 'Review decisions have been issued. Upload the Aplikasi Manajemen Surat to complete the cycle.'
                    : 'Review decisions have been issued but the Aplikasi Manajemen Surat has not been uploaded yet. The assigned Reviewer is responsible for uploading it.'}
                </p>
              </div>
            </div>

            {awaiting_ams.length === 0 ? (
              <EmptyState message="No pending Aplikasi Manajemen Surat. All completed reviews have their letter uploaded." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {awaiting_ams.map((r) => (
                  <AwaitingAmsCard key={r.id} review={r} isReviewer={isReviewer} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
