import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { reviewApi } from '../../services/reviewApi';
import { documentApi } from '../../services/documentApi';
import { getPublicFileUrl } from '../../services/fileUrl';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  commenter?: { id: string; name: string };
  commenter_name?: string;
  page_ref?: string;
  comment: string;
  disposition?: string;
  created_at: string;
}

interface CommentSheetItem {
  id?: string;
  seq_no: number;
  pln_comment: string;
  contractor_response?: string;
  version?: number;
}

interface ReviewMarkupFile {
  id: string;
  stage: 'REVIEW' | 'CHECK' | 'APPROVE';
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface Review {
  id: string;
  status: string;
  document_id: string;
  document_title?: string;
  document_number?: string;
  project_name?: string;
  boq_item_title?: string;
  section?: string;
  current_stage?: string;
  reviewer_id?: string;
  checker_id?: string;
  approver_id?: string;
  delegated_at?: string | null;
  delegated_engineer?: { id: string; name: string } | null;
  delegator?: { id: string; name: string } | null;
  reviewer?: { id: string; name: string };
  checker?: { id: string; name: string };
  approver?: { id: string; name: string };
  comments?: Comment[];
  files?: Array<{ id: string; file_name: string; file_path: string }>;
  ams_letter?: {
    id: string;
    ams_number?: string | null;
    ams_date?: string | null;
    ams_title?: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    created_at: string;
    uploader?: { id: string; name: string };
  } | null;
  created_at: string;
  sla_deadline?: string;
  // QR stamps
  reviewer_qr_at?: string | null;
  checker_qr_at?: string | null;
  approver_qr_at?: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_LABEL: Record<string, string> = {
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

const FINAL_STATUSES = [
  { value: 'APPROVED_A',               label: 'Status A — Approved without comments' },
  { value: 'APPROVED_WITH_COMMENTS_B', label: 'Status B — Approved with comments' },
  { value: 'REJECTED_C',               label: 'Status C — Revise & Resubmit' },
];

const formatDate = (d?: string | null) => {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd MMM yyyy HH:mm'); } catch { return d; }
};

// ── CommentSheetPanel ─────────────────────────────────────────────────────────

function QrStamp({ label, stampedAt, name }: { label: string; stampedAt?: string | null; name?: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${stampedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${stampedAt ? 'bg-green-500' : 'bg-gray-300'}`}>
        {stampedAt ? (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-8v4" />
          </svg>
        )}
      </div>
      <div>
        <p className={`font-semibold ${stampedAt ? 'text-green-800' : 'text-gray-500'}`}>{label}</p>
        {stampedAt ? (
          <p className="text-green-600">{name} · {formatDate(stampedAt)}</p>
        ) : (
          <p className="text-gray-400">QR pending</p>
        )}
      </div>
    </div>
  );
}

interface CommentSheetPanelProps {
  reviewId: string;
  review: Review;
  canEdit: boolean; // true for REVIEWER (REVIEW stage) and CHECKER (CHECK stage)
  role: string;
}

function CommentSheetPanel({ reviewId, review, canEdit, role }: CommentSheetPanelProps) {
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: itemsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['comment-sheet-items', reviewId],
    queryFn: () => reviewApi.getCommentSheetItems(reviewId),
  });

  const savedItems: CommentSheetItem[] = itemsData?.data?.data ?? [];

  // null = not yet loaded from server; [] = loaded but empty
  const [localItems, setLocalItems] = useState<CommentSheetItem[] | null>(null);
  const [dirty, setDirty] = useState(false);

  // Sync server → local only when data actually arrives (itemsData defined + not loading).
  // Skip if the user has unsaved edits in progress.
  useEffect(() => {
    if (isLoading || isError || itemsData === undefined) return;
    if (dirty) return;
    const serverItems: CommentSheetItem[] = itemsData?.data?.data ?? [];
    if (serverItems.length > 0) {
      setLocalItems(serverItems.map(i => ({
        id: i.id,
        seq_no: i.seq_no,
        pln_comment: i.pln_comment,
        contractor_response: i.contractor_response ?? '',
        version: i.version,
      })));
    } else {
      // Only seed a blank editable row when the viewer can actually fill it in —
      // otherwise a read-only viewer sees a fake "1." row of em-dashes instead
      // of an honest empty state.
      setLocalItems(canEdit ? [{ seq_no: 1, pln_comment: '', contractor_response: '' }] : []);
    }
  }, [itemsData, isLoading, isError, canEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveMutation = useMutation({
    mutationFn: () =>
      reviewApi.saveCommentSheetItems(
        reviewId,
        (localItems ?? []).filter(i => i.pln_comment.trim()),
      ),
    onSuccess: () => {
      setDirty(false); // reset dirty BEFORE refetch so effect re-populates from server
      queryClient.refetchQueries({ queryKey: ['comment-sheet-items', reviewId] });
      addToast('success', 'Comment sheet saved.');
    },
    onError: () => addToast('error', 'Failed to save comment sheet.'),
  });

  const downloadMutation = useMutation({
    mutationFn: () => reviewApi.downloadSheet(reviewId),
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `comment-sheet-${reviewId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: () => addToast('error', 'Failed to download comment sheet.'),
  });

  function addRow() {
    setLocalItems(prev => {
      const base = prev ?? [];
      return [...base, { seq_no: base.length + 1, pln_comment: '', contractor_response: '' }];
    });
    setDirty(true);
  }

  function removeRow(idx: number) {
    setLocalItems(prev => {
      const next = (prev ?? []).filter((_, i) => i !== idx).map((item, i) => ({ ...item, seq_no: i + 1 }));
      return next.length > 0 ? next : [{ seq_no: 1, pln_comment: '', contractor_response: '' }];
    });
    setDirty(true);
  }

  function updateRow(idx: number, field: keyof CommentSheetItem, value: string) {
    setLocalItems(prev => (prev ?? []).map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setDirty(true);
  }

  return (
    <div className="card overflow-hidden border-l-4 border-teal-400">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="font-semibold text-gray-900">Comment Sheet</h2>
          <span className="badge bg-teal-100 text-teal-700 text-xs">{savedItems.length} item{savedItems.length !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloadMutation.isPending ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {/* QR Signature stamps */}
      <div className="px-6 pt-4 pb-3 bg-gray-50 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2">Digital Signatures (QR Code)</p>
        <div className="grid grid-cols-3 gap-2">
          <QrStamp label="Prepared By" stampedAt={review.reviewer_qr_at} name={review.reviewer?.name} />
          <QrStamp label="Reviewed By" stampedAt={review.checker_qr_at}  name={review.checker?.name} />
          <QrStamp label="Approved By" stampedAt={review.approver_qr_at} name={review.approver?.name} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          QR codes are automatically embedded in the PDF when each stage is completed (Reviewer submits → Prepared By; Checker confirms → Reviewed By; Approver decides → Approved By).
        </p>
      </div>

      {/* Items table — spinner until localItems is populated from server */}
      {isError ? (
        <div className="py-8 flex flex-col items-center gap-3">
          <p className="text-sm text-red-600">Failed to load the comment sheet.</p>
          <button onClick={() => refetch()} className="btn-secondary text-xs py-1.5 px-3">
            Retry
          </button>
        </div>
      ) : localItems === null ? (
        <div className="py-8 flex justify-center"><LoadingSpinner /></div>
      ) : localItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No comment sheet items yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-teal-50 text-xs font-semibold text-teal-800 border-b border-teal-200">
                <th className="px-3 py-2 w-12 text-center border-r border-teal-200">No.</th>
                <th className="px-3 py-2 text-left border-r border-teal-200">PLN Comments</th>
                <th className="px-3 py-2 text-left border-r border-teal-200">Contractor Response</th>
                {canEdit && <th className="px-3 py-2 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {localItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 align-top">
                  <td className="px-3 py-2 text-center text-gray-500 font-mono border-r border-gray-100 w-12">
                    {item.seq_no}.
                    {!!item.version && item.version > 0 && (
                      <span className="block mt-1 text-[10px] font-sans text-indigo-600" title="This row has edit history">Edited</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-100">
                    {canEdit ? (
                      <textarea
                        value={item.pln_comment}
                        onChange={(e) => updateRow(idx, 'pln_comment', e.target.value)}
                        className="input text-sm resize-none w-full min-h-[60px]"
                        placeholder="Enter PLN review comment…"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap">{item.pln_comment || <span className="text-gray-400 italic">—</span>}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-100">
                    {canEdit ? (
                      <textarea
                        value={item.contractor_response ?? ''}
                        onChange={(e) => updateRow(idx, 'contractor_response', e.target.value)}
                        className="input text-sm resize-none w-full min-h-[60px]"
                        placeholder="Contractor response (optional)…"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-600 whitespace-pre-wrap">{item.contractor_response || <span className="text-gray-400 italic">—</span>}</p>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-2 py-2 w-10">
                      <button
                        onClick={() => removeRow(idx)}
                        className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove row"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {canEdit && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={addRow}
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1.5 font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Comment Row
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!dirty || saveMutation.isPending || localItems === null}
                className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
              >
                {saveMutation.isPending ? <LoadingSpinner size="sm" /> : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {saveMutation.isPending ? 'Saving…' : dirty ? 'Save Comment Sheet' : 'Saved'}
              </button>
            </div>
          )}
        </div>
      )}

      {canEdit && (
        <div className="px-6 py-3 bg-teal-50 border-t border-teal-100">
          <p className="text-xs text-teal-700">
            {role === 'REVIEWER'
              ? 'As Reviewer, fill in PLN Comments for each point. Click "Save Comment Sheet" to preserve your entries. A QR code for "Prepared By" will be added to the PDF when you submit your review.'
              : role === 'CHECKER'
                ? 'As Checker, you can edit the comment sheet rows before confirming your check. A QR code for "Reviewed By" will be added when you confirm.'
                : 'As Approver, you can make final comment-sheet corrections during approval. Your edits are recorded in the audit history.'}
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewMarkupPanel({
  reviewId,
  role,
  currentStage,
}: {
  reviewId: string;
  role?: string;
  currentStage?: string;
}) {
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const stage = role === 'REVIEWER' ? 'REVIEW' : role === 'CHECKER' ? 'CHECK' : 'APPROVE';
  const canManage = role === 'REVIEWER' || role === 'CHECKER' || role === 'APPROVER';
  const stageIsOpen = currentStage === stage;

  const { data, isLoading } = useQuery({
    queryKey: ['review-markup-files', reviewId],
    queryFn: () => reviewApi.listMarkupFiles(reviewId),
  });
  const markupFiles: ReviewMarkupFile[] = data?.data?.data ?? [];

  const uploadMutation = useMutation({
    mutationFn: () => reviewApi.uploadMarkupFiles(reviewId, stage, files),
    onSuccess: () => {
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ['review-markup-files', reviewId] });
      addToast('success', 'Markup files uploaded.');
    },
    onError: () => addToast('error', 'Failed to upload markup files.'),
  });

  const download = async (file: ReviewMarkupFile) => {
    try {
      const response = await reviewApi.downloadMarkupFile(file.id);
      const url = URL.createObjectURL(new Blob([response.data], { type: file.mime_type }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.file_name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast('error', 'Failed to download markup file.');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => reviewApi.deleteMarkupFile(fileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['review-markup-files', reviewId] }),
    onError: () => addToast('error', 'Failed to delete markup file.'),
  });

  return (
    <div className="card overflow-hidden border-l-4 border-indigo-400">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Review Markups</h2>
          <p className="text-xs text-gray-500 mt-1">Attach annotated PDF or image evidence to the current review stage.</p>
        </div>
        <span className="badge bg-indigo-100 text-indigo-700 text-xs">Authenticated downloads</span>
      </div>
      {isLoading ? (
        <div className="py-6 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="p-6 space-y-4">
          {markupFiles.length === 0 ? (
            <p className="text-sm text-gray-400">No markup files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {markupFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.file_name}</p>
                    <p className="text-xs text-gray-400">{file.stage} · {Math.ceil(file.file_size / 1024)} KB</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={() => download(file)} className="btn-secondary py-1 px-2 text-xs">Download</button>
                    {canManage && stageIsOpen && file.stage === stage && (
                      <button type="button" onClick={() => deleteMutation.mutate(file.id)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {canManage && stageIsOpen && (
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => uploadMutation.mutate()}
                disabled={files.length === 0 || uploadMutation.isPending}
                className="btn-primary py-1.5 px-3 text-sm"
              >
                {uploadMutation.isPending ? 'Uploading…' : `Upload to ${stage}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ItpItemPanel ─────────────────────────────────────────────────────────────

// PLN hold-point authority codes. Each ITP row can carry a different code per
// responsible party (Sub / PP / PLN) — e.g. Sub: P, PP: R, PLN: H.
type InspectionLevelCode = 'H' | 'W' | 'SW' | 'R' | 'A' | 'P' | '';

interface ItpItem {
  seq_no: number;
  activity: string;
  acceptance_criteria: string;
  reference_standard: string;
  verifying_document: string;
  sub_code: InspectionLevelCode;
  pp_code: InspectionLevelCode;
  pln_code: InspectionLevelCode;
  phase: 'SHOP' | 'FIELD' | 'COMMISSIONING';
  category: 'SIPIL' | 'ELEKTRIKAL' | 'MEKANIKAL' | 'INSTRUMEN_KONTROL';
}

// Short codes only — these render inside a narrow table select, which clips to
// whatever the closed box's own width is regardless of column width, so the
// descriptive text lives in INSPECTION_LEVEL_MEANING (shown in badges/legend)
// instead of the option label.
const INSPECTION_LEVELS = [
  { value: '', label: '—' },
  { value: 'H', label: 'H' },
  { value: 'W', label: 'W' },
  { value: 'SW', label: 'SW' },
  { value: 'R', label: 'R' },
  { value: 'A', label: 'A' },
  { value: 'P', label: 'P' },
] as const;

const INSPECTION_LEVEL_MEANING: Record<string, string> = {
  H: 'Hold Point',
  W: 'Witness',
  SW: 'Spot Witness',
  R: 'Review Doc',
  A: 'Approval',
  P: 'Perform',
};

const LEVEL_BADGE_CLASS: Record<string, string> = {
  H: 'bg-red-100 text-red-700',
  W: 'bg-yellow-100 text-yellow-700',
  SW: 'bg-orange-100 text-orange-700',
  R: 'bg-blue-100 text-blue-700',
  A: 'bg-purple-100 text-purple-700',
  P: 'bg-gray-100 text-gray-600',
};

const ITP_PHASES = [
  { value: 'SHOP', label: 'Shop' },
  { value: 'FIELD', label: 'Field' },
  { value: 'COMMISSIONING', label: 'Commissioning' },
] as const;

const ITP_CATEGORIES = [
  { value: 'SIPIL', label: 'Sipil' },
  { value: 'ELEKTRIKAL', label: 'Elektrikal' },
  { value: 'MEKANIKAL', label: 'Mekanikal' },
  { value: 'INSTRUMEN_KONTROL', label: 'Instrumen & Kontrol' },
] as const;

const EMPTY_ITP_ITEM: ItpItem = {
  seq_no: 1,
  activity: '',
  acceptance_criteria: '',
  reference_standard: '',
  verifying_document: '',
  sub_code: '',
  pp_code: '',
  pln_code: '',
  phase: 'FIELD',
  category: 'SIPIL',
};

interface ItpItemPanelProps {
  documentId: string;
  canEdit: boolean;
  role: string;
}

function ItpItemPanel({ documentId, canEdit, role }: ItpItemPanelProps) {
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: itemsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['itp-items', documentId],
    queryFn: () => documentApi.getItpItems(documentId),
  });

  const savedItems: ItpItem[] = itemsData?.data?.data ?? [];

  const [localItems, setLocalItems] = useState<ItpItem[] | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isLoading || isError || itemsData === undefined) return;
    if (dirty) return;
    const serverItems = itemsData?.data?.data ?? [];
    if (serverItems.length > 0) {
      setLocalItems(serverItems.map((i: any) => ({
        seq_no: i.seq_no,
        activity: i.activity,
        acceptance_criteria: i.acceptance_criteria ?? '',
        reference_standard: i.reference_standard ?? '',
        verifying_document: i.verifying_document ?? '',
        sub_code: i.sub_code ?? '',
        pp_code: i.pp_code ?? '',
        pln_code: i.pln_code ?? '',
        phase: i.phase ?? 'FIELD',
        category: i.category ?? 'SIPIL',
      })));
    } else {
      // Only seed a blank editable row when the viewer can actually fill it in —
      // otherwise a read-only viewer sees a fake "1." row of em-dashes instead
      // of an honest empty state.
      setLocalItems(canEdit ? [{ ...EMPTY_ITP_ITEM }] : []);
    }
  }, [itemsData, isLoading, isError, canEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveMutation = useMutation({
    mutationFn: () =>
      documentApi.saveItpItems(
        documentId,
        (localItems ?? [])
          .filter(i => i.activity.trim())
          .map(({ sub_code, pp_code, pln_code, ...rest }) => ({
            ...rest,
            sub_code: sub_code || undefined,
            pp_code: pp_code || undefined,
            pln_code: pln_code || undefined,
          })),
      ),
    onSuccess: () => {
      setDirty(false);
      queryClient.refetchQueries({ queryKey: ['itp-items', documentId] });
      addToast('success', 'ITP items saved.');
    },
    onError: () => addToast('error', 'Failed to save ITP items.'),
  });

  function addRow() {
    setLocalItems(prev => {
      const base = prev ?? [];
      return [...base, { ...EMPTY_ITP_ITEM, seq_no: base.length + 1 }];
    });
    setDirty(true);
  }

  function removeRow(idx: number) {
    setLocalItems(prev => {
      const next = (prev ?? []).filter((_, i) => i !== idx).map((item, i) => ({ ...item, seq_no: i + 1 }));
      return next.length > 0 ? next : [{ ...EMPTY_ITP_ITEM }];
    });
    setDirty(true);
  }

  function updateRow(idx: number, field: keyof ItpItem, value: string) {
    setLocalItems(prev => (prev ?? []).map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setDirty(true);
  }

  return (
    <div className="card overflow-hidden border-l-4 border-amber-400">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h2 className="font-semibold text-gray-900">ITP Inspection Items</h2>
          <span className="badge bg-amber-100 text-amber-700 text-xs">{savedItems.length} item{savedItems.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {isError ? (
        <div className="py-8 flex flex-col items-center gap-3">
          <p className="text-sm text-red-600">Failed to load ITP items.</p>
          <button onClick={() => refetch()} className="btn-secondary text-xs py-1.5 px-3">Retry</button>
        </div>
      ) : localItems === null ? (
        <div className="py-8 flex justify-center"><LoadingSpinner /></div>
      ) : localItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No ITP inspection items yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-amber-50 text-xs font-semibold text-amber-800 border-b border-amber-200">
                <th className="px-2 py-2 w-10 text-center border-r border-amber-200">No.</th>
                <th className="px-2 py-2 text-left border-r border-amber-200 min-w-[180px]">Activity</th>
                <th className="px-2 py-2 text-left border-r border-amber-200 min-w-[140px]">Acceptance Criteria</th>
                <th className="px-2 py-2 text-left border-r border-amber-200 min-w-[120px]">Reference Standard</th>
                <th className="px-2 py-2 text-left border-r border-amber-200 min-w-[120px]">Verifying Document</th>
                <th className="px-2 py-2 text-center border-r border-amber-200 w-20" title="Subcontractor">Sub</th>
                <th className="px-2 py-2 text-center border-r border-amber-200 w-20" title="Main Contractor (PP)">PP</th>
                <th className="px-2 py-2 text-center border-r border-amber-200 w-20" title="PLN (Client)">PLN</th>
                <th className="px-2 py-2 text-center border-r border-amber-200 w-28">Phase</th>
                <th className="px-2 py-2 text-center border-r border-amber-200 w-32">Category</th>
                {canEdit && <th className="px-2 py-2 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {localItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 align-top">
                  <td className="px-2 py-2 text-center text-gray-500 font-mono border-r border-gray-100 w-10">
                    {item.seq_no}.
                  </td>
                  <td className="px-2 py-2 border-r border-gray-100">
                    {canEdit ? (
                      <textarea
                        value={item.activity}
                        onChange={(e) => updateRow(idx, 'activity', e.target.value)}
                        className="input text-sm resize-none w-full min-h-[50px]"
                        placeholder="Inspection activity..."
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap">{item.activity || <span className="text-gray-400 italic">—</span>}</p>
                    )}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-100">
                    {canEdit ? (
                      <textarea
                        value={item.acceptance_criteria}
                        onChange={(e) => updateRow(idx, 'acceptance_criteria', e.target.value)}
                        className="input text-sm resize-none w-full min-h-[50px]"
                        placeholder="Criteria..."
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-600 whitespace-pre-wrap">{item.acceptance_criteria || <span className="text-gray-400 italic">—</span>}</p>
                    )}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-100">
                    {canEdit ? (
                      <input
                        type="text"
                        value={item.reference_standard}
                        onChange={(e) => updateRow(idx, 'reference_standard', e.target.value)}
                        className="input text-sm w-full"
                        placeholder="e.g. IEC 62271"
                      />
                    ) : (
                      <p className="text-gray-600">{item.reference_standard || <span className="text-gray-400 italic">—</span>}</p>
                    )}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-100">
                    {canEdit ? (
                      <input
                        type="text"
                        value={item.verifying_document}
                        onChange={(e) => updateRow(idx, 'verifying_document', e.target.value)}
                        className="input text-sm w-full"
                        placeholder="e.g. FAT Report"
                      />
                    ) : (
                      <p className="text-gray-600">{item.verifying_document || <span className="text-gray-400 italic">—</span>}</p>
                    )}
                  </td>
                  {(['sub_code', 'pp_code', 'pln_code'] as const).map((field) => (
                    <td key={field} className="px-1 py-2 border-r border-gray-100 text-center">
                      {canEdit ? (
                        <select
                          value={item[field]}
                          onChange={(e) => updateRow(idx, field, e.target.value)}
                          title={item[field] ? INSPECTION_LEVEL_MEANING[item[field]] : 'Not applicable'}
                          className="input text-xs w-full px-1"
                        >
                          {INSPECTION_LEVELS.map(l => (
                            <option key={l.value} value={l.value} title={l.value ? INSPECTION_LEVEL_MEANING[l.value] : 'Not applicable'}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      ) : item[field] ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${LEVEL_BADGE_CLASS[item[field]] ?? 'bg-gray-100 text-gray-600'}`}>
                          {item[field]}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2 border-r border-gray-100 text-center">
                    {canEdit ? (
                      <select
                        value={item.phase}
                        onChange={(e) => updateRow(idx, 'phase', e.target.value)}
                        className="input text-xs w-full"
                      >
                        {ITP_PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-600">{item.phase}</span>
                    )}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-100 text-center">
                    {canEdit ? (
                      <select
                        value={item.category}
                        onChange={(e) => updateRow(idx, 'category', e.target.value)}
                        className="input text-xs w-full"
                      >
                        {ITP_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-600">{ITP_CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-1 py-2 w-10">
                      <button
                        onClick={() => removeRow(idx)}
                        className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove row"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
            {INSPECTION_LEVELS.filter(l => l.value).map(l => (
              <span key={l.value} className="flex items-center gap-1">
                <span className={`inline-block px-1.5 rounded font-semibold ${LEVEL_BADGE_CLASS[l.value]}`}>{l.value}</span>
                {INSPECTION_LEVEL_MEANING[l.value]}
              </span>
            ))}
          </div>

          {canEdit && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={addRow}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1.5 font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Inspection Item
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!dirty || saveMutation.isPending || localItems === null}
                className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
              >
                {saveMutation.isPending ? <LoadingSpinner size="sm" /> : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {saveMutation.isPending ? 'Saving...' : dirty ? 'Save ITP Items' : 'Saved'}
              </button>
            </div>
          )}
        </div>
      )}

      {canEdit && (
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
          <p className="text-xs text-amber-700">
            {role === 'REVIEWER'
              ? 'As Reviewer, define the inspection items from the ITP document. Each item will become a checklist entry for field QC inspections.'
              : 'As Checker, you can review and edit ITP items before confirming your check.'}
          </p>
        </div>
      )}
    </div>
  );
}

// ── ReviewDetailPage ──────────────────────────────────────────────────────────

export function ReviewDetailPage() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const [reviewerComment, setReviewerComment] = useState('');
  const [checkerId, setCheckerId] = useState('');
  const [approverId, setApproverId] = useState('');

  const [checkerComment, setCheckerComment] = useState('');
  const [finalStatus, setFinalStatus] = useState('APPROVED_A');
  const [approverNotes, setApproverNotes] = useState('');
  const [amsFile, setAmsFile] = useState<File | null>(null);
  const amsFileRef = useRef<HTMLInputElement>(null);
  const [amsNumber, setAmsNumber] = useState('');
  const [amsDate, setAmsDate] = useState('');
  const [amsTitle, setAmsTitle] = useState('');

  // PIC_CONSULTANT — team assignment state
  const [picReviewerId, setPicReviewerId] = useState('');
  const [picCheckerId, setPicCheckerId] = useState('');
  const [picApproverId, setPicApproverId] = useState('');

  const isPicConsultant = user?.role === 'PIC_CONSULTANT';
  const canDelegateReview = user?.role === 'PIC_ENGINEER' || user?.role === 'PIC_CONSULTANT';
  const isReviewerRole = user?.role === 'REVIEWER';

  const { data: checkersData } = useQuery({
    queryKey: ['peers', 'CHECKER'],
    queryFn: () => import('../../services/authApi').then(m => m.authApi.listPeers('CHECKER')),
    enabled: isReviewerRole || isPicConsultant,
  });

  const { data: approversData } = useQuery({
    queryKey: ['peers', 'APPROVER'],
    queryFn: () => import('../../services/authApi').then(m => m.authApi.listPeers('APPROVER')),
    enabled: isReviewerRole || isPicConsultant,
  });

  const { data: delegationCandidatesData } = useQuery({
    queryKey: ['review-delegation-candidates', reviewId],
    queryFn: () => reviewApi.delegateCandidates(reviewId!),
    enabled: canDelegateReview && !!reviewId,
  });

  const availableCheckers  = checkersData?.data?.data ?? [];
  const availableApprovers = approversData?.data?.data ?? [];
  const availableDelegationCandidates = delegationCandidatesData?.data?.data ?? [];

  const { data, isLoading, error } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewApi.get(reviewId!),
    enabled: !!reviewId,
  });

  const addReviewMutation = useMutation({
    mutationFn: (payload: unknown) => reviewApi.addReview(reviewId!, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['review', reviewId] });
      queryClient.refetchQueries({ queryKey: ['comment-sheet-items', reviewId] });
      setReviewerComment('');
      addToast('success', 'Review submitted. QR code stamped on "Prepared By".');
    },
    onError: () => addToast('error', 'Failed to submit review.'),
  });

  const checkMutation = useMutation({
    mutationFn: (payload: unknown) => reviewApi.check(reviewId!, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['review', reviewId] });
      queryClient.refetchQueries({ queryKey: ['comment-sheet-items', reviewId] });
      setCheckerComment('');
      addToast('success', 'Check completed. QR code stamped on "Reviewed By".');
    },
    onError: () => addToast('error', 'Failed to submit check.'),
  });

  const approveMutation = useMutation({
    mutationFn: (payload: unknown) => reviewApi.approve(reviewId!, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['review', reviewId] });
      queryClient.refetchQueries({ queryKey: ['comment-sheet-items', reviewId] });
      addToast('success', 'Review approved. QR code stamped on "Approved By".');
    },
    onError: () => addToast('error', 'Failed to approve review.'),
  });

  const submitFinalDecision = () => {
    if (approveMutation.isPending) return;

    approveMutation.mutate({
      final_status: finalStatus,
      comments: approverNotes.trim() ? [{ comment: approverNotes.trim() }] : [],
    });
  };

  const amsUploadMutation = useMutation({
    mutationFn: (file: File) =>
      reviewApi.uploadAmsLetter(reviewId!, file, {
        ams_number: amsNumber || undefined,
        ams_date:   amsDate   || undefined,
        ams_title:  amsTitle  || undefined,
      }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['review', reviewId] });
      setAmsFile(null);
      setAmsNumber('');
      setAmsDate('');
      setAmsTitle('');
      if (amsFileRef.current) amsFileRef.current.value = '';
      addToast('success', 'AMS letter uploaded successfully.');
    },
    onError: () => addToast('error', 'Failed to upload AMS letter.'),
  });

  const assignTeamMutation = useMutation({
    mutationFn: (payload: { checker_id?: string; approver_id?: string }) =>
      reviewApi.assignTeam(reviewId!, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['review', reviewId] });
      setPicReviewerId('');
      setPicCheckerId('');
      setPicApproverId('');
      addToast('success', 'Review team assigned successfully.');
    },
    onError: () => addToast('error', 'Failed to assign review team.'),
  });

  const delegateMutation = useMutation({
    mutationFn: () => reviewApi.delegate(reviewId!, picReviewerId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['review', reviewId] });
      setPicReviewerId('');
      addToast('success', 'Review delegated to the selected engineer.');
    },
    onError: () => addToast('error', 'Failed to delegate review.'),
  });

  const review: Review | null = data?.data?.data ?? null;
  const comments: Comment[] = review?.comments ?? [];
  const isReviewer = user?.role === 'REVIEWER';
  const isChecker  = user?.role === 'CHECKER';
  const isApprover = user?.role === 'APPROVER';

  const isAssignedOrOpenReviewer =
    !review?.reviewer_id || review?.reviewer?.id === user?.id;
  const canAddComment = isReviewer && review?.current_stage === 'REVIEW' && isAssignedOrOpenReviewer;
  const canCheck  = isChecker  && review?.current_stage === 'CHECK'   && review?.checker?.id  === user?.id;
  const canApprove = isApprover && review?.current_stage === 'APPROVE' && review?.approver?.id === user?.id;

  const isComplete =
    FINAL_STATUSES.map(s => s.value).includes(review?.status ?? '') ||
    review?.current_stage === 'COMPLETE';
  const canUploadAms = isReviewer && isComplete;

  // Comment sheet edit permission
  const canEditSheet =
    (isReviewer && review?.current_stage === 'REVIEW' && isAssignedOrOpenReviewer) ||
    (isChecker  && review?.current_stage === 'CHECK'  && review?.checker?.id === user?.id) ||
    (isApprover && review?.current_stage === 'APPROVE' && review?.approver?.id === user?.id);

  // Show comment sheet panel to all review participants + PIC
  const showCommentSheet =
    isReviewer || isChecker || isApprover || isPicConsultant ||
    user?.role === 'PIC_PROJECT' || user?.role === 'VIEWER';

  // ITP Items panel — only for FIELD_ITP documents
  const isItpDocument = review?.section === 'FIELD_ITP';
  // Inspection Items are authored by the Vendor while the document is a draft.
  // Review participants can inspect the rows here, but cannot edit them.
  const canEditItpItems = false;
  const showItpPanel = isItpDocument && showCommentSheet;

  if (isLoading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  if (error || !review) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">
          {error ? 'Unable to load this review. The server may be unavailable or the request timed out.' : 'Review not found.'}
        </p>
        {error && (
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['review', reviewId] })} className="btn-primary mt-4">
            Retry
          </button>
        )}
        <button onClick={() => navigate('/reviews')} className="btn-secondary mt-4">Back to Queue</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/reviews')}
        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Review Queue
      </button>

      {/* Document info header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-gray-500">{review.document_number ?? '—'}</p>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              {review.document_title ?? 'Untitled Document'}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
              {review.project_name     && <span>Project: {review.project_name}</span>}
              {review.boq_item_title   && <span>• Item: {review.boq_item_title}</span>}
              {review.section          && <span>• Section: {SECTION_LABEL[review.section] ?? review.section}</span>}
            </div>
          </div>
          <StatusBadge status={review.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div>
            <span>Submitted: </span>
            <span className="text-gray-700 font-medium">{formatDate(review.created_at)}</span>
          </div>
          {review.sla_deadline && (
            <div>
              <span>SLA Deadline: </span>
              <span className="text-gray-700 font-medium">{formatDate(review.sla_deadline)}</span>
            </div>
          )}
        </div>

        {/* Workflow assignments */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Review Team</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['reviewer', 'checker', 'approver'] as const).map((role) => {
              const person = review[role];
              const stageMap = { reviewer: 'REVIEW', checker: 'CHECK', approver: 'APPROVE' };
              const labelMap = { reviewer: 'Reviewer', checker: 'Checker', approver: 'Approver' };
              const isCurrentStage = review.current_stage === stageMap[role];
              return (
                <div key={role} className={`rounded-md border p-2.5 text-xs ${isCurrentStage ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className={`font-semibold mb-0.5 ${isCurrentStage ? 'text-blue-700' : 'text-gray-500'}`}>
                    {labelMap[role]}{isCurrentStage && <span className="ml-1 text-blue-500">(active)</span>}
                  </p>
                  <p className="text-gray-800 font-medium">{person?.name ?? <span className="text-gray-400 italic">Not yet assigned</span>}</p>
                </div>
              );
            })}
          </div>
        </div>

        {review.files && review.files.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Original Documents</h3>
            <div className="flex flex-wrap gap-2">
              {review.files.map(file => {
                const env = (import.meta as any).env;
                return (
                  <a
                    key={file.id}
                    href={getPublicFileUrl(file.file_path, env?.VITE_API_URL, window.location.origin)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {file.file_name}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Comment Sheet Panel ── */}
      {showCommentSheet && reviewId && (
        <CommentSheetPanel
          reviewId={reviewId}
          review={review}
          canEdit={canEditSheet}
          role={user?.role ?? ''}
        />
      )}

      {showCommentSheet && reviewId && (
        <ReviewMarkupPanel
          reviewId={reviewId}
          role={user?.role}
          currentStage={review.current_stage}
        />
      )}

      {/* ── ITP Inspection Items Panel ── */}
      {showItpPanel && review.document_id && (
        <ItpItemPanel
          documentId={review.document_id}
          canEdit={!!canEditItpItems}
          role={user?.role ?? ''}
        />
      )}

      {/* AMS Letter — standalone card */}
      <div className="card p-6 border-l-4 border-indigo-400">
        <div className="flex items-center gap-2 mb-4">
          <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="font-semibold text-gray-900">Aplikasi Manajemen Surat (AMS)</h2>
        </div>

        {!isComplete && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
            <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-500">Upload Locked</p>
              <p className="text-xs text-gray-400 mt-0.5">
                AMS letter upload will be available after the Approver issues a final decision.
              </p>
            </div>
          </div>
        )}

        {isComplete && (
          <>
            {review.ams_letter ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-indigo-50 rounded-md px-3 py-2 border border-indigo-100">
                    <p className="text-xs text-indigo-400 font-medium mb-0.5">AMS Number</p>
                    <p className="text-indigo-900 font-semibold">{review.ams_letter.ams_number ?? '—'}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-md px-3 py-2 border border-indigo-100">
                    <p className="text-xs text-indigo-400 font-medium mb-0.5">AMS Date</p>
                    <p className="text-indigo-900 font-semibold">
                      {review.ams_letter.ams_date ? formatDate(review.ams_letter.ams_date) : '—'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-md px-3 py-2 border border-indigo-100">
                    <p className="text-xs text-indigo-400 font-medium mb-0.5">AMS Title</p>
                    <p className="text-indigo-900 font-semibold truncate">{review.ams_letter.ams_title ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="h-8 w-8 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-indigo-900 truncate">{review.ams_letter.file_name}</p>
                      <p className="text-xs text-indigo-500 mt-0.5">
                        Released {formatDate(review.ams_letter.created_at)}
                        {review.ams_letter.uploader && ` · by ${review.ams_letter.uploader.name}`}
                        {' · '}{(review.ams_letter.file_size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <a
                      href={getPublicFileUrl(review.ams_letter.file_path, (import.meta as any).env?.VITE_API_URL, window.location.origin)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1.5"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Open AMS Letter
                    </a>
                    {canUploadAms && (
                      <label className="btn-secondary py-1.5 px-3 text-sm cursor-pointer flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Replace
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) amsUploadMutation.mutate(f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ) : canUploadAms ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">AMS Letter Required</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Fill in the AMS letter details and upload the PDF to record the completion of this review cycle.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label text-amber-800">AMS Number</label>
                    <input type="text" value={amsNumber} onChange={e => setAmsNumber(e.target.value)} className="input" placeholder="e.g. AMS/2026/001" />
                  </div>
                  <div>
                    <label className="label text-amber-800">Date of AMS Letter</label>
                    <input type="date" value={amsDate} onChange={e => setAmsDate(e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label text-amber-800">Title / Subject</label>
                    <input type="text" value={amsTitle} onChange={e => setAmsTitle(e.target.value)} className="input" placeholder="AMS letter title" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input ref={amsFileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => setAmsFile(e.target.files?.[0] ?? null)} />
                  <button type="button" onClick={() => amsFileRef.current?.click()} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {amsFile ? amsFile.name : 'Choose PDF File'}
                  </button>
                  {amsFile && (
                    <button type="button" disabled={amsUploadMutation.isPending} onClick={() => amsUploadMutation.mutate(amsFile)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                      {amsUploadMutation.isPending ? <LoadingSpinner size="sm" /> : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                      )}
                      Upload AMS Letter
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                <svg className="h-5 w-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-400 italic">AMS letter not yet uploaded by the reviewer.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comments list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Review Comments ({comments.length})</h2>
        </div>
        {comments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">No comments yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div key={comment.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.commenter?.name ?? comment.commenter_name ?? 'Unknown'}
                    </span>
                    {comment.page_ref && (
                      <span className="text-xs text-gray-500">p. {comment.page_ref}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {comment.disposition && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DISPOSITION_COLORS[comment.disposition] ?? 'bg-gray-100 text-gray-600'}`}>
                        {comment.disposition}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PIC_CONSULTANT — assign review team */}
      {isPicConsultant && review?.current_stage === 'REVIEW' && review?.reviewer_id && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="font-semibold text-gray-900">
              {review.checker_id && review.approver_id ? 'Review Team Assignment' : 'Assign Review Team'}
            </h2>
          </div>
          {review?.reviewer && (!review.checker_id || !review.approver_id) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Checker <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                  <select value={picCheckerId} onChange={e => setPicCheckerId(e.target.value)} className="input">
                    <option value="">Select Checker...</option>
                    {availableCheckers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Approver <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                  <select value={picApproverId} onChange={e => setPicApproverId(e.target.value)} className="input">
                    <option value="">Select Approver...</option>
                    {availableApprovers.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => assignTeamMutation.mutate({
                    ...(picCheckerId  ? { checker_id:  picCheckerId  } : {}),
                    ...(picApproverId ? { approver_id: picApproverId } : {}),
                  })}
                  disabled={(!picCheckerId && !picApproverId) || assignTeamMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {assignTeamMutation.isPending ? <LoadingSpinner size="sm" /> : null}
                  Assign Review Team
                </button>
              </div>
            </div>
          ) : review?.reviewer ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                {(['reviewer', 'checker', 'approver'] as const).map((role) => {
                  const person = review[role];
                  const label = { reviewer: 'Reviewer', checker: 'Checker', approver: 'Approver' }[role];
                  return (
                    <div key={role} className="rounded-md border border-green-200 bg-green-50 p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">{label}</p>
                      <p className="text-sm text-gray-900">{person?.name ?? <span className="text-gray-400 italic">Not assigned</span>}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">Team assigned. Reviewer is preparing their comments.</p>
            </div>
          ) : review?.delegated_at ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Checker <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                  <select value={picCheckerId} onChange={e => setPicCheckerId(e.target.value)} className="input">
                    <option value="">Select Checker...</option>
                    {availableCheckers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Approver <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                  <select value={picApproverId} onChange={e => setPicApproverId(e.target.value)} className="input">
                    <option value="">Select Approver...</option>
                    {availableApprovers.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => assignTeamMutation.mutate({
                    ...(picCheckerId  ? { checker_id:  picCheckerId  } : {}),
                    ...(picApproverId ? { approver_id: picApproverId } : {}),
                  })}
                  disabled={(!picCheckerId && !picApproverId) || assignTeamMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {assignTeamMutation.isPending ? <LoadingSpinner size="sm" /> : null}
                  Assign Review Team
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {canDelegateReview && review?.current_stage === 'REVIEW' && !review?.delegated_at && (
        <div className="card p-6 border-l-4 border-blue-400">
          <h2 className="font-semibold text-gray-900">Delegate Review</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">Choose the eligible consultant Reviewer for this project. Delegation does not change the original SLA deadline.</p>
          <div className="flex flex-wrap gap-3">
            <select value={picReviewerId} onChange={(e) => setPicReviewerId(e.target.value)} className="input flex-1 min-w-[240px]">
              <option value="">Select eligible Reviewer…</option>
              {availableDelegationCandidates.map((candidate: any) => <option key={candidate.id} value={candidate.id}>{candidate.name} — {candidate.email}</option>)}
            </select>
            <button type="button" onClick={() => delegateMutation.mutate()} disabled={!picReviewerId || delegateMutation.isPending} className="btn-primary">
              {delegateMutation.isPending ? 'Delegating…' : 'Delegate Review'}
            </button>
          </div>
        </div>
      )}

      {/* Reviewer action area */}
      {canAddComment && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Submit Review</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Review Notes <span className="text-red-500">*</span></label>
              <textarea
                value={reviewerComment}
                onChange={e => setReviewerComment(e.target.value)}
                className="input"
                rows={4}
                placeholder="Write your overall review notes here. Use the Comment Sheet above to list individual comment items."
              />
            </div>
            {!review?.checker_id && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Assign Checker <span className="text-red-500">*</span></label>
                  <select value={checkerId} onChange={e => setCheckerId(e.target.value)} className="input">
                    <option value="">Select Checker...</option>
                    {availableCheckers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Assign Approver <span className="text-red-500">*</span></label>
                  <select value={approverId} onChange={e => setApproverId(e.target.value)} className="input">
                    <option value="">Select Approver...</option>
                    {availableApprovers.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
            )}
            {review?.checker_id && (
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 bg-gray-50 rounded-md p-3 border border-gray-200">
                <div><span className="font-semibold text-gray-600">Checker: </span>{review.checker?.name ?? '—'}</div>
                <div><span className="font-semibold text-gray-600">Approver: </span>{review.approver?.name ?? '—'}</div>
              </div>
            )}
            <div className="rounded-md bg-teal-50 border border-teal-200 px-4 py-3 text-xs text-teal-700">
              After submitting, a QR code will be automatically stamped in the <strong>"Prepared By"</strong> field of the Comment Sheet PDF.
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => addReviewMutation.mutate({
                  ...(checkerId  ? { checker_id:  checkerId  } : {}),
                  ...(approverId ? { approver_id: approverId } : {}),
                  comments: reviewerComment.trim() ? [{ comment: reviewerComment }] : [],
                })}
                disabled={
                  !reviewerComment ||
                  (!review?.checker_id && (!checkerId || !approverId)) ||
                  addReviewMutation.isPending
                }
                className="btn-primary flex items-center gap-2"
              >
                {addReviewMutation.isPending ? <LoadingSpinner size="sm" /> : null}
                Submit Review Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checker waiting state */}
      {isChecker && !canCheck && review?.current_stage !== 'COMPLETE' && (
        <div className="card p-6 border border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">
              {review?.current_stage === 'REVIEW'
                ? 'Waiting for reviewer.'
                : review?.current_stage === 'APPROVE'
                ? 'Check already completed.'
                : 'Not available.'}
            </span>{' '}
            {review?.current_stage === 'REVIEW'
              ? 'The check form will appear once the reviewer submits. You can still edit the Comment Sheet above.'
              : ''}
            {' '}Current stage: <span className="font-mono font-medium">{review?.current_stage}</span>
          </p>
        </div>
      )}

      {/* Checker action area */}
      {canCheck && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Checker Action</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={checkerComment} onChange={e => setCheckerComment(e.target.value)} className="input" rows={3} placeholder="Any notes for the approver..." />
            </div>
            <div className="rounded-md bg-teal-50 border border-teal-200 px-4 py-3 text-xs text-teal-700">
              Confirming check will stamp a QR code in the <strong>"Reviewed By"</strong> field of the Comment Sheet PDF.
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => checkMutation.mutate({ comments: checkerComment ? [{ comment: checkerComment }] : [] })}
                disabled={checkMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {checkMutation.isPending ? <LoadingSpinner size="sm" /> : null}
                Confirm Check
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approver waiting state */}
      {isApprover && !canApprove && review?.current_stage !== 'COMPLETE' && (
        <div className="card p-6 border border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Waiting for checker.</span> The approval form will appear once the checker has completed their review.
            Current stage: <span className="font-mono font-medium">{review?.current_stage}</span>
          </p>
        </div>
      )}

      {/* Approver action area */}
      {canApprove && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Approver Decision</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Final Status <span className="text-red-500">*</span></label>
              <div className="space-y-2 mt-1">
                {FINAL_STATUSES.map(s => (
                  <label key={s.value} className="flex items-start gap-3 p-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="finalStatus" value={s.value} checked={finalStatus === s.value} onChange={e => setFinalStatus(e.target.value)} className="mt-0.5" />
                    <span className="text-sm text-gray-800">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Approval Notes (optional)</label>
              <textarea value={approverNotes} onChange={e => setApproverNotes(e.target.value)} className="input" rows={3} placeholder="Additional notes..." />
            </div>
            <div className="rounded-md bg-teal-50 border border-teal-200 px-4 py-3 text-xs text-teal-700">
              Issuing the final decision will stamp a QR code in the <strong>"Approved By"</strong> field of the Comment Sheet PDF.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitFinalDecision}
                disabled={approveMutation.isPending}
                aria-busy={approveMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {approveMutation.isPending ? <LoadingSpinner size="sm" /> : null}
                Submit Final Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
