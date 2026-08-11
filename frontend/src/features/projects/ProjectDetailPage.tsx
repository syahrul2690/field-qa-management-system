import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, parseISO } from 'date-fns';
import { projectApi } from '../../services/projectApi';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DocumentDetailModal } from '../documents/DocumentDetailModal';

interface NominalValue {
  currency: string;
  amount: number;
}

interface Amendment {
  id: string;
  amendment_number: number;
  new_duration_days?: number;
  nominal_values?: NominalValue[];
  notes?: string;
  created_at: string;
}

interface Vendor {
  id: string;
  vendor_institution_id: string;
  vendor_institution?: { id: string; name: string };
}

interface Institution {
  id: string;
  name: string;
}

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy'); } catch { return String(d); }
};

interface SelectedDoc {
  documentId: string;
  boqItemId: string;
  section: string;
  docNumber: string;
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const [expandedAmendment, setExpandedAmendment] = useState<string | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [selectedVendorInstitution, setSelectedVendorInstitution] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.get(id!),
    enabled: !!id,
  });

  const { data: amendmentsData } = useQuery({
    queryKey: ['project-amendments', id],
    queryFn: () => projectApi.listAmendments(id!),
    enabled: !!id,
  });

  const { data: institutionsData } = useQuery({
    queryKey: ['institutions', 'VENDOR'],
    queryFn: () => import('../../services/authApi').then(m => m.authApi.listInstitutions('VENDOR')),
  });

  const { data: approvedDocsData } = useQuery({
    queryKey: ['approved-docs', id],
    queryFn: () => projectApi.approvedDocuments(id!),
    enabled: !!id,
  });

  const addVendorMutation = useMutation({
    mutationFn: (vendorInstitutionId: string) => projectApi.assignVendor(id!, vendorInstitutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      addToast('success', 'Vendor assigned successfully.');
      setVendorModalOpen(false);
      setSelectedVendorInstitution('');
    },
    onError: () => addToast('error', 'Failed to assign vendor.'),
  });

  const removeVendorMutation = useMutation({
    mutationFn: (vendorId: string) => projectApi.removeVendor(id!, vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      addToast('success', 'Vendor removed.');
    },
    onError: () => addToast('error', 'Failed to remove vendor.'),
  });

  const project = projectData?.data?.data;
  const amendments: Amendment[] = amendmentsData?.data?.data ?? [];
  const institutions: Institution[] = institutionsData?.data?.data?.institutions ?? [];
  const vendors: Vendor[] = project?.vendor_visibility ?? [];
  const isPicProject = user?.role === 'PIC_PROJECT' || user?.role === 'ADMIN';
  const approvedDocs: any[] = approvedDocsData?.data?.data ?? [];

  if (isLoading) {
    return <div className="py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (!project) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">Project not found.</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary mt-4">Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <button onClick={() => navigate('/projects')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
      </div>

      {/* Project header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <span className="inline-block mt-1 text-sm bg-gray-100 text-gray-600 px-3 py-0.5 rounded">
              {project.project_type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPicProject && (
              <Link to={`/projects/${id}/edit`} className="btn-secondary text-sm flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
            )}
            <Link to={`/projects/${id}/boq`} className="btn-primary text-sm flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View BoQ
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {project.contract_number && (
            <div>
              <p className="text-gray-500">Contract No.</p>
              <p className="font-medium text-gray-900">{project.contract_number}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Project Effective Date</p>
            <p className="font-medium text-gray-900">{formatDate(project.contract_effective_date)}</p>
          </div>
          <div>
            <p className="text-gray-500">Project End Date</p>
            <p className="font-medium text-gray-900">
              {project.contract_effective_date && project.duration_days
                ? formatDate(addDays(new Date(project.contract_effective_date), project.duration_days).toISOString())
                : '—'}
            </p>
          </div>
          {project.nominal_values && project.nominal_values.length > 0 && (
            <div>
              <p className="text-gray-500">Nominal Values</p>
              <div className="space-y-0.5">
                {project.nominal_values.map((nv: NominalValue, i: number) => (
                  <p key={i} className="font-medium text-gray-900">
                    {nv.currency} {nv.amount.toLocaleString()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amendments accordion */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Amendment History ({amendments.length})</h2>
        </div>
        {amendments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">No amendments.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {amendments.map((am) => (
              <div key={am.id}>
                <button
                  onClick={() => setExpandedAmendment(expandedAmendment === am.id ? null : am.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 text-left"
                >
                  <span className="font-medium text-gray-900">Amendment #{am.amendment_number}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{formatDate(am.created_at)}</span>
                    <svg className={`h-4 w-4 text-gray-400 transition-transform ${expandedAmendment === am.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedAmendment === am.id && (
                  <div className="px-6 pb-4 text-sm text-gray-600 space-y-2 bg-gray-50">
                    {am.new_duration_days !== undefined && am.new_duration_days !== null && (
                      <p>New Duration: {am.new_duration_days} days</p>
                    )}
                    {am.nominal_values && am.nominal_values.length > 0 && (
                      <div>
                        <p className="text-gray-500">Nominal Values:</p>
                        {am.nominal_values.map((nv, i) => (
                          <p key={i}>{nv.currency} {nv.amount.toLocaleString()}</p>
                        ))}
                      </div>
                    )}
                    {am.notes && <p className="italic">{am.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vendor visibility */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Vendor Access ({vendors.length})</h2>
          {isPicProject && (
            <button onClick={() => setVendorModalOpen(true)} className="btn-secondary text-sm flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Vendor
            </button>
          )}
        </div>
        {vendors.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">No vendors assigned.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-gray-900">{vendor.vendor_institution?.name ?? vendor.vendor_institution_id}</span>
                {isPicProject && (
                  <button
                    onClick={() => removeVendorMutation.mutate(vendor.vendor_institution_id)}
                    disabled={removeVendorMutation.isPending}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Documents (Status A, B, C) */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Completed Documents ({approvedDocs.length})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                All documents that have received a final review decision (Status A · B · C)
              </p>
            </div>
          </div>

          {/* Status legend */}
          {approvedDocs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {[
                { status: 'APPROVED_A',               label: 'Status A — Approved',                 bg: 'bg-green-100',  text: 'text-green-700'  },
                { status: 'APPROVED_WITH_COMMENTS_B', label: 'Status B — Approved with Comments',   bg: 'bg-teal-100',   text: 'text-teal-700'   },
                { status: 'REJECTED_C',               label: 'Status C — Rejected',                 bg: 'bg-red-100',    text: 'text-red-700'    },
              ].map(({ status, label, bg, text }) => {
                const count = approvedDocs.filter((d: any) => d.status === status).length;
                if (count === 0) return null;
                return (
                  <span key={status} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${bg} ${text}`}>
                    {label} <span className="font-bold">({count})</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {approvedDocs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">
            No completed documents yet. Documents appear here once the Approver issues a final decision.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {approvedDocs.map((doc: any) => {
              const hasAms = !!doc.latest_review?.ams_letter;
              return (
                <div
                  key={doc.id}
                  className="flex items-start justify-between px-6 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedDoc({
                    documentId: doc.id,
                    boqItemId: doc.boq_item_id,
                    section: doc.section,
                    docNumber: doc.doc_number,
                  })}
                >
                  <div className="min-w-0 flex-1">
                    {/* Top row: doc number, section, revision, AMS badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {doc.doc_number}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                        {doc.section === 'FIELD_ITP' ? 'Field ITP' : doc.section === 'PROCEDURE' ? 'Procedure' : 'Work Method'}
                      </span>
                      <span className="text-xs text-gray-400">Rev. {doc.revision_no}</span>

                      {/* AMS badge — shown when review is complete but no letter uploaded yet */}
                      {!hasAms && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          </svg>
                          Aplikasi Manajemen Surat belum diunggah
                        </span>
                      )}

                      {/* Confirmed AMS uploaded indicator */}
                      {hasAms && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Aplikasi Manajemen Surat tersedia
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium text-gray-900 mt-1 truncate">{doc.title}</p>

                    {/* Sub-line: BOQ context + approval info */}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.boq_item_code} · {doc.boq_item_title}
                      {doc.latest_review?.approved_at && (
                        <> · Reviewed {formatDate(doc.latest_review.approved_at)}</>
                      )}
                      {doc.latest_review?.approver && (
                        <> by {doc.latest_review.approver.name}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4 mt-0.5">
                    <StatusBadge status={doc.status} />
                    <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add vendor modal */}
      <Modal isOpen={vendorModalOpen} onClose={() => setVendorModalOpen(false)} title="Assign Vendor">
        <div className="space-y-4">
          <div>
            <label className="label">Select Institution (Vendor)</label>
            <select
              value={selectedVendorInstitution}
              onChange={(e) => setSelectedVendorInstitution(e.target.value)}
              className="input"
            >
              <option value="">Choose institution...</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setVendorModalOpen(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => selectedVendorInstitution && addVendorMutation.mutate(selectedVendorInstitution)}
              disabled={!selectedVendorInstitution || addVendorMutation.isPending}
              className="btn-primary"
            >
              {addVendorMutation.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Document detail modal */}
      {selectedDoc && (
        <DocumentDetailModal
          documentId={selectedDoc.documentId}
          boqItemId={selectedDoc.boqItemId}
          section={selectedDoc.section}
          docNumber={selectedDoc.docNumber}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
