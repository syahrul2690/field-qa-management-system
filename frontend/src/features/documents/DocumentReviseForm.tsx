import { useState, ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi';
import { useUIStore } from '../../store/uiStore';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface DocumentReviseFormProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  boqItemId: string;
  section: string;
  /** Pre-fill the doc number and title from the rejected document */
  defaultDocNumber?: string;
  defaultTitle?: string;
}

const SECTION_LABEL: Record<string, string> = {
  FIELD_ITP: 'Field ITP',
  PROCEDURE: 'Procedure',
  WORK_METHOD: 'Work Method',
};

export function DocumentReviseForm({
  isOpen,
  onClose,
  documentId,
  boqItemId,
  section,
  defaultDocNumber = '',
  defaultTitle = '',
}: DocumentReviseFormProps) {
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const [docNumber, setDocNumber] = useState(defaultDocNumber);
  const [title, setTitle] = useState(defaultTitle);
  const [suratPengantar, setSuratPengantar] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState('');

  const reviseMutation = useMutation({
    mutationFn: (fd: FormData) => documentApi.revise(documentId, fd),
    onSuccess: () => {
      addToast('success', 'Revised document submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['documents', boqItemId, section] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      handleClose();
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message ?? 'Revision submission failed.';
      setError(msg);
    },
  });

  const handleClose = () => {
    setDocNumber(defaultDocNumber);
    setTitle(defaultTitle);
    setSuratPengantar('');
    setFiles(null);
    setError('');
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!docNumber || !title) {
      setError('Document number and title are required.');
      return;
    }
    if (!files || files.length === 0) {
      setError('Please select at least one revised PDF file.');
      return;
    }

    const fd = new FormData();
    fd.append('section', section);
    fd.append('doc_number', docNumber);
    fd.append('title', title);
    if (suratPengantar) fd.append('surat_pengantar_no', suratPengantar);
    Array.from(files).forEach((file) => fd.append('files', file));

    reviseMutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Revise & Resubmit Document" size="lg">
      {/* Banner */}
      <div className="flex items-start gap-3 px-4 py-3 mb-4 rounded-lg bg-amber-50 border border-amber-200">
        <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Status C — Revise & Resubmit</p>
          <p className="text-xs text-amber-600 mt-0.5">
            This document was returned for revision. Please upload the corrected version below.
            A new revision will be created and submitted for review.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="label">Section</label>
          <input type="text" value={SECTION_LABEL[section] ?? section} disabled className="input bg-gray-50 text-gray-500" />
        </div>

        <div>
          <label className="label">Document Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="input"
            placeholder="e.g. ITP-001"
            disabled={reviseMutation.isPending}
          />
        </div>

        <div>
          <label className="label">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Document title"
            disabled={reviseMutation.isPending}
          />
        </div>

        <div>
          <label className="label">Surat Pengantar No. (optional)</label>
          <input
            type="text"
            value={suratPengantar}
            onChange={(e) => setSuratPengantar(e.target.value)}
            className="input"
            placeholder="e.g. SP/001/2024"
            disabled={reviseMutation.isPending}
          />
        </div>

        <div>
          <label className="label">Revised Files (PDF) <span className="text-red-500">*</span></label>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFiles(e.target.files)}
            disabled={reviseMutation.isPending}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
          {files && files.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={reviseMutation.isPending}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={reviseMutation.isPending}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {reviseMutation.isPending ? <LoadingSpinner size="sm" /> : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            {reviseMutation.isPending ? 'Submitting...' : 'Submit Revision'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
