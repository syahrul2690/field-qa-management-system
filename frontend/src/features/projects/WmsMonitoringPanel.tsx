import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../../services/projectApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface WmsRecord {
  id: string;
  code: string;
  title: string;
  qa_boq_item_id: string;
  boq_item_code: string | null;
  boq_item_title: string | null;
  document_revision: number;
  workflow_status: string;
  final_quality_status: string | null;
  finalized_at: string | null;
  monitoring_status: string;
  updated_at: string;
  detail_url: string;
}

interface MonitoringPayload {
  data: WmsRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const WORKFLOW_LABELS: Record<string, string> = {
  UNDER_REVIEW: 'Dalam review Field QC',
  NEEDS_REVISION: 'Menunggu revisi Kontraktor',
  APPROVED: 'Disetujui',
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function WmsMonitoringPanel({ projectId }: { projectId: string }) {
  const [finalStatus, setFinalStatus] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['wms-monitoring', projectId, finalStatus, workflowStatus, page],
    queryFn: () =>
      projectApi.wmsMonitoring(projectId, {
        ...(finalStatus ? { final_quality_status: finalStatus } : {}),
        ...(workflowStatus ? { workflow_status: workflowStatus } : {}),
        page: String(page),
        limit: '20',
      }),
    refetchOnMount: 'always',
    staleTime: 30_000,
  });

  const payload = data?.data?.data as MonitoringPayload | undefined;
  const records = payload?.data ?? [];

  return (
    <section className="card overflow-hidden" aria-labelledby="wms-monitoring-title">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="wms-monitoring-title" className="font-semibold text-gray-900">
              Monitoring WMS
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Status read-only dari Field QC. Seluruh aksi WMS dilakukan di Field QC.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary self-start text-sm disabled:opacity-50"
          >
            {isFetching ? 'Memuat…' : 'Muat ulang'}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={workflowStatus}
            onChange={(event) => {
              setWorkflowStatus(event.target.value);
              setPage(1);
            }}
            className="input text-sm"
          >
            <option value="">Semua status proses</option>
            <option value="UNDER_REVIEW">Dalam review Field QC</option>
            <option value="NEEDS_REVISION">Menunggu revisi</option>
            <option value="APPROVED">Disetujui</option>
          </select>
          <select
            value={finalStatus}
            onChange={(event) => {
              setFinalStatus(event.target.value);
              setPage(1);
            }}
            className="input text-sm"
          >
            <option value="">Semua status final</option>
            <option value="A">Status A</option>
            <option value="B">Status B</option>
            <option value="C">Status C</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <div className="px-4 py-8 text-center sm:px-6" role="alert">
          <p className="text-sm font-medium text-red-700">
            Monitoring Field QC belum dapat dimuat.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Dokumen Field ITP dan Procedure tetap tersedia di Field QA.
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-500 sm:px-6">
          Belum ada WMS Field QC untuk filter ini.
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {records.map((record) => (
              <article key={record.id} className="px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                        {record.code}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Rev. {String(record.document_revision).padStart(2, '0')}
                      </span>
                      {record.final_quality_status && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Status {record.final_quality_status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 break-words text-sm font-semibold text-gray-900">
                      {record.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      BOQ: {record.boq_item_code ?? record.qa_boq_item_id}
                      {record.boq_item_title ? ` · ${record.boq_item_title}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {WORKFLOW_LABELS[record.workflow_status] ?? record.workflow_status} ·{' '}
                      {record.finalized_at ? 'Final' : 'Diperbarui'}{' '}
                      {formatDate(record.finalized_at ?? record.updated_at)}
                    </p>
                  </div>
                  <a
                    href={record.detail_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary shrink-0 self-start text-sm"
                  >
                    Buka di Field QC
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>{payload?.pagination.total ?? 0} WMS ditemukan</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary text-xs"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Sebelumnya
              </button>
              <span>
                Halaman {payload?.pagination.page ?? page} dari{' '}
                {Math.max(1, payload?.pagination.totalPages ?? 1)}
              </span>
              <button
                type="button"
                className="btn-secondary text-xs"
                disabled={page >= (payload?.pagination.totalPages ?? 1) || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
