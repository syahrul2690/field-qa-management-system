import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi';
import { useUIStore } from '../../store/uiStore';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export interface ParsedItpRow {
  activity: string;
  acceptance_criteria?: string;
  reference_standard?: string;
  verifying_document?: string;
  sub_code: string | null;
  pp_code: string | null;
  pln_code: string | null;
  phase: string;
  category: string;
}

async function handleTemplateDownload() {
  const res = await documentApi.downloadItpTemplate();
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'itp_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

interface ValidationError {
  row?: number;
  field?: string;
  message: string;
}

interface ItpImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Number of non-empty rows already in the editor — drives the append/replace default. */
  existingCount: number;
  onImported: (rows: ParsedItpRow[], mode: 'append' | 'replace') => void;
}

export function ItpImportModal({ isOpen, onClose, existingCount, onImported }: ItpImportModalProps) {
  const { addToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const importMutation = useMutation({
    mutationFn: (file: File) => documentApi.parseItpExcel(file),
    onSuccess: (res) => {
      const rows: ParsedItpRow[] = res.data?.data?.rows ?? [];
      onImported(rows, existingCount > 0 ? mode : 'replace');
      addToast('success', `${rows.length} row(s) imported into the editor. Review them, then press Save ITP Items to store them.`);
      handleClose();
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { status?: number; data?: { errors?: ValidationError[]; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
        setValidationErrors(axiosError.response.data.errors);
      } else {
        const msg = axiosError.response?.data?.message ?? 'Import failed.';
        addToast('error', msg);
      }
    },
  });

  const handleClose = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    setMode('append');
    onClose();
  };

  const handleFile = (file: File) => {
    setValidationErrors([]);
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      addToast('error', 'Only .xlsx or .xls files are accepted.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (selectedFile) importMutation.mutate(selectedFile);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Inspection Items from Excel" size="lg">
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />
          <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-primary-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB — click to replace</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">Drag & drop your ITP Excel file here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse — .xlsx or .xls only</p>
            </div>
          )}
        </div>

        {/* Template download hint */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>
            Don't have the format?{' '}
            <button
              type="button"
              onClick={handleTemplateDownload}
              className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
            >
              Download example template
            </button>
          </span>
        </div>

        {/* Append / Replace choice — only meaningful when the grid already has rows */}
        {existingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
            <p className="text-xs text-amber-800">
              The editor already has {existingCount} item{existingCount !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={mode === 'append'} onChange={() => setMode('append')} />
                Append to existing items
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
                Replace existing items
              </label>
            </div>
          </div>
        )}

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm font-medium text-red-700 mb-2">Validation errors ({validationErrors.length}):</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {validationErrors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">
                  {err.row !== undefined && err.row > 0 ? `Row ${err.row}: ` : ''}{err.message}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={handleClose} className="btn-secondary" disabled={importMutation.isPending}>
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || importMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {importMutation.isPending ? <LoadingSpinner size="sm" /> : null}
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
