import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { documentApi } from '../../services/documentApi';
import { reviewApi } from '../../services/reviewApi';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { ItpItemPanel } from './ItpItemPanel';

// ─── helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = (() => {
  const env = (import.meta as any).env;
  return env?.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000';
})();

const fileUrl = (path: string) =>
  `${BASE_URL}/uploads/${path.replace(/\\/g, '/')}`;

const fmt = (d?: string | Date | null) => {
  if (!d) return '—';
  try {
    return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy HH:mm');
  } catch {
    return String(d);
  }
};

const fmtDate = (d?: string | Date | null) => {
  if (!d) return '—';
  try {
    return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy');
  } catch {
    return String(d);
  }
};

const sectionLabel: Record<string, string> = {
  FIELD_ITP: 'Field ITP',
  PROCEDURE: 'Procedure',
  WORK_METHOD: 'Work Method',
};

const DISPOSITION_COLORS: Record<string, string> = {
  MAJOR: 'bg-red-100 text-red-700',
  MINOR: 'bg-yellow-100 text-yellow-700',
  INFO: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
};

// ─── sub-components ───────────────────────────────────────────────────────────

function FilePill({ name, path }: { name: string; path: string }) {
  return (
    <a
      href={fileUrl(path)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 transition-colors"
    >
      <svg className="h-3.5 w-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {name}
    </a>
  );
}

function ReviewHistorySection({ reviewId }: { reviewId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewApi.get(reviewId),
    staleTime: 60_000,
  });

  const review = data?.data?.data;

  if (isLoading) return <LoadingSpinner size="sm" />;
  if (!review) return <p className="text-xs text-gray-400 italic">No review data available.</p>;

  const comments: any[] = review.comments ?? [];

  return (
    <div className="space-y-4">
      {/* Workflow team */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {(['reviewer', 'checker', 'approver'] as const).map((role) => {
          const person = review[role];
          const labelMap = { reviewer: 'Reviewer', checker: 'Checker', approver: 'Approver' };
          return (
            <div key={role} className="rounded-md border border-gray-200 bg-gray-50 p-2">
              <p className="font-semibold text-gray-500 capitalize">{labelMap[role]}</p>
              <p className="text-gray-800 font-medium mt-0.5">{person?.name ?? <span className="text-gray-400 italic">—</span>}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[
          { label: 'Submitted', date: review.created_at },
          { label: 'Reviewed', date: review.reviewed_at },
          { label: 'Checked', date: review.checked_at },
        ].map(({ label, date }) => (
          <div key={label}>
            <p className="text-gray-400">{label}</p>
            <p className="text-gray-700 font-medium">{fmtDate(date)}</p>
          </div>
        ))}
      </div>

      {/* AMS Letter */}
      {review.ams_letter && (
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-indigo-50 border border-indigo-200">
          <div>
            <p className="text-xs font-medium text-indigo-800">AMS Letter</p>
            <p className="text-xs text-indigo-500 mt-0.5">{review.ams_letter.file_name}</p>
          </div>
          <a
            href={fileUrl(review.ams_letter.file_path)}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Open
          </a>
        </div>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Review Comments ({comments.length})</p>
          <div className="divide-y divide-gray-100 rounded-md border border-gray-200 overflow-hidden">
            {comments.map((c: any) => (
              <div key={c.id} className="px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-800">
                    {c.commenter?.name ?? c.commenter_name ?? 'Unknown'}
                    {c.page_ref && <span className="ml-2 text-gray-400 font-normal">p. {c.page_ref}</span>}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {c.disposition && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DISPOSITION_COLORS[c.disposition] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.disposition}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{fmtDate(c.created_at)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentVersionCard({
  doc,
  isLatest,
  itpDirty = false,
  onItpDirtyChange,
}: {
  doc: any;
  isLatest: boolean;
  itpDirty?: boolean;
  onItpDirtyChange?: (dirty: boolean) => void;
}) {
  const [open, setOpen] = useState(isLatest);
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const submitMutation = useMutation({
    mutationFn: () => documentApi.submit(doc.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-history'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      addToast('success', 'Draft submitted for review.');
    },
    onError: () => addToast('error', 'Failed to submit draft for review.'),
  });

  const lastReview = doc.reviews?.[0] ?? null;

  return (
    <div className={`rounded-lg border ${isLatest ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-white'}`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${isLatest ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
            Rev. {doc.revision_no}
          </span>
          {isLatest && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Current</span>}
          <StatusBadge status={doc.status} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{fmt(doc.created_at)}</span>
          <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Files */}
          {doc.files && doc.files.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mt-3 mb-2">Document Files</p>
              <div className="flex flex-wrap gap-2">
                {doc.files.map((f: any) => (
                  <FilePill key={f.id} name={f.file_name} path={f.file_path} />
                ))}
              </div>
            </div>
          )}

          {/* Review Info */}
          {lastReview && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Review Details</p>
              <ReviewHistorySection reviewId={lastReview.id} />
            </div>
          )}

          {!doc.files?.length && !lastReview && (
            <p className="text-xs text-gray-400 italic pt-2">No files or review data attached to this revision.</p>
          )}
          {isLatest && doc.status === 'DRAFT' && user?.role === 'VENDOR' && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-blue-800">Draft is ready</p>
                <p className="text-xs text-blue-600 mt-0.5">Next: review files → add Inspection Items → save items → submit for review.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (itpDirty) {
                    addToast('error', 'Save the Inspection Items before submitting this draft.');
                    return;
                  }
                  submitMutation.mutate();
                }}
                disabled={submitMutation.isPending}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit for Review'}
              </button>
            </div>
          )}

          {doc.section === 'FIELD_ITP' && (
            <ItpItemPanel
              documentId={doc.id}
              canEdit={isLatest && user?.role === 'VENDOR' && doc.status === 'DRAFT'}
              onDirtyChange={isLatest && user?.role === 'VENDOR' && doc.status === 'DRAFT' ? onItpDirtyChange : undefined}
            />
          )}
          {isLatest && doc.section === 'FIELD_ITP' && doc.status !== 'DRAFT' && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
              Submitted for review. Inspection Items are now locked.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────

export interface DocumentDetailModalProps {
  /** ID of the current (or any) document version to view. If provided alongside boqItemId/section/docNumber, we'll load history too. */
  documentId: string;
  boqItemId: string;
  section: string;
  docNumber: string;
  onClose: () => void;
}

export function DocumentDetailModal({
  documentId,
  boqItemId,
  section,
  docNumber,
  onClose,
}: DocumentDetailModalProps) {
  const [itpDirty, setItpDirty] = useState(false);

  const requestClose = () => {
    if (itpDirty && !window.confirm('You have unsaved Inspection Items. Close without saving?')) return;
    onClose();
  };
  // Load revision history
  const { data: historyData, isLoading: histLoading } = useQuery({
    queryKey: ['doc-history', boqItemId, section, docNumber],
    queryFn: () => documentApi.history(boqItemId, section, docNumber),
    staleTime: 30_000,
  });

  const history: any[] = historyData?.data?.data ?? [];
  // Sort newest-first
  const sorted = [...history].sort((a, b) => b.revision_no - a.revision_no);

  // Find the current document info from history (or fallback)
  const currentDoc = sorted.find((d) => d.id === documentId) ?? sorted[0];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={requestClose} />

      {/* Modal panel — Field ITP carries a wide 10-column grid, so it gets a much
          wider cap than a plain revision-history view needs. */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`w-full ${section === 'FIELD_ITP' ? 'max-w-6xl' : 'max-w-2xl'} max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {currentDoc?.doc_number ?? docNumber}
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                  {sectionLabel[section] ?? section}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {currentDoc?.title ?? 'Document Details'}
              </h2>
            </div>
            <button
              onClick={requestClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {currentDoc?.boq_items?.length > 1 && (
              <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                <p className="text-xs font-semibold text-blue-800">Covers {currentDoc.boq_items.length} BoQ items</p>
                <p className="text-xs text-blue-600 mt-1">{currentDoc.boq_items.map((item: any) => `${item.item_code} — ${item.title}`).join(' · ')}</p>
              </div>
            )}
            {histLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : sorted.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No document history found.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Revision History ({sorted.length} version{sorted.length !== 1 ? 's' : ''})
                </p>
                {sorted.map((doc, idx) => (
                  <DocumentVersionCard
                    key={doc.id}
                    doc={doc}
                    isLatest={idx === 0}
                    itpDirty={itpDirty}
                    onItpDirtyChange={setItpDirty}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
