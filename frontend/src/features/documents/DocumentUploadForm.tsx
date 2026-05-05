import { useState, ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi';
import { useUIStore } from '../../store/uiStore';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface DocumentUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  boqItemId: string;
  section: string;
}

export function DocumentUploadForm({ isOpen, onClose, boqItemId, section }: DocumentUploadFormProps) {
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const [docNumber, setDocNumber] = useState('');
  const [title, setTitle] = useState('');
  const [suratPengantar, setSuratPengantar] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState('');

  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => documentApi.upload(fd),
    onSuccess: () => {
      addToast('success', 'Document uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['documents', boqItemId] });
      handleClose();
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message ?? 'Upload failed.';
      setError(msg);
    },
  });

  const handleClose = () => {
    setDocNumber('');
    setTitle('');
    setSuratPengantar('');
    setFiles(null);
    setError('');
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!docNumber || !title) {
      setError('Document number and title are required.');
      return;
    }
    if (!files || files.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    const fd = new FormData();
    fd.append('boq_item_id', boqItemId);
    fd.append('section', section);
    fd.append('doc_number', docNumber);
    fd.append('title', title);
    if (suratPengantar) fd.append('surat_pengantar_no', suratPengantar);
    Array.from(files).forEach((file) => fd.append('files', file));

    uploadMutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="label">Section</label>
          <input type="text" value={section} disabled className="input bg-gray-50 text-gray-500" />
        </div>

        <div>
          <label className="label">Document Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="input"
            placeholder="e.g. ITP-001"
            disabled={uploadMutation.isPending}
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
            disabled={uploadMutation.isPending}
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
            disabled={uploadMutation.isPending}
          />
        </div>

        <div>
          <label className="label">Files (PDF) <span className="text-red-500">*</span></label>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {files && files.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={uploadMutation.isPending}>
            Cancel
          </button>
          <button type="submit" disabled={uploadMutation.isPending} className="btn-primary flex items-center gap-2">
            {uploadMutation.isPending ? <LoadingSpinner size="sm" /> : null}
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
