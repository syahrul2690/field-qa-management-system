import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi';
import { useAuthStore } from '../../store/authStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DocumentUploadForm } from '../documents/DocumentUploadForm';
import { DocumentDetailModal } from '../documents/DocumentDetailModal';
import { DocumentReviseForm } from '../documents/DocumentReviseForm';

interface BoqItem {
  id: string;
  item_code: string;
  system_tag?: string;
  title: string;
  level: number;
}

interface BoqItemDetailPanelProps {
  item: BoqItem | null;
  onClose: () => void;
}

interface Document {
  id: string;
  doc_number: string;
  title: string;
  section: string;
  status?: string;
  revision_no?: number;
  created_at: string;
}

interface SelectedDoc {
  documentId: string;
  boqItemId: string;
  section: string;
  docNumber: string;
}

interface ReviseDoc {
  documentId: string;
  section: string;
  docNumber: string;
  title: string;
}

const SECTIONS = [
  { key: 'FIELD_ITP', label: 'Field ITP' },
  { key: 'PROCEDURE', label: 'Procedure' },
  { key: 'WORK_METHOD', label: 'Work Method' },
];

export function BoqItemDetailPanel({ item, onClose }: BoqItemDetailPanelProps) {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('FIELD_ITP');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);
  const [reviseDoc, setReviseDoc] = useState<ReviseDoc | null>(null);

  const isVendor = user?.role === 'VENDOR';

  const { data, isLoading } = useQuery({
    queryKey: ['documents', item?.id, activeSection],
    queryFn: () => documentApi.list(item!.id, activeSection),
    enabled: !!item,
  });

  const documents: Document[] = data?.data?.data ?? [];

  if (!item) return null;

  return (
    <>
      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 z-30 w-full max-w-lg bg-white shadow-xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-mono">{item.item_code}</p>
            <h2 className="font-semibold text-gray-900 truncate mt-0.5">{item.title}</h2>
            {item.system_tag && (
              <p className="text-xs text-primary-600 mt-0.5">{item.system_tag}</p>
            )}
            <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              Level {item.level}
            </span>
          </div>
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 flex-shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                activeSection === sec.key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-8"><LoadingSpinner /></div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No documents in this section.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="px-6 py-4 hover:bg-gray-50 flex flex-col gap-3 cursor-pointer transition-colors"
                  onClick={() =>
                    setSelectedDoc({
                      documentId: doc.id,
                      boqItemId: item.id,
                      section: doc.section,
                      docNumber: doc.doc_number,
                    })
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-gray-500">{doc.doc_number}</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{doc.title}</p>
                      {doc.revision_no !== undefined && (
                        <p className="text-xs text-gray-500 mt-0.5">Rev. {doc.revision_no}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {doc.status && <StatusBadge status={doc.status} />}
                      <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Revise & Resubmit for REJECTED_C */}
                  {isVendor && doc.status === 'REJECTED_C' && (
                    <div
                      className="flex justify-end border-t border-red-100 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setReviseDoc({
                          documentId: doc.id,
                          section: doc.section,
                          docNumber: doc.doc_number,
                          title: doc.title,
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Revise & Resubmit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload button for vendors */}
        {isVendor && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setUploadOpen(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 z-20 bg-black bg-opacity-30" onClick={onClose} />

      {/* Upload form */}
      <DocumentUploadForm
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        boqItemId={item.id}
        section={activeSection}
      />

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

      {/* Revise & Resubmit modal */}
      {reviseDoc && (
        <DocumentReviseForm
          isOpen={true}
          onClose={() => setReviseDoc(null)}
          documentId={reviseDoc.documentId}
          boqItemId={item.id}
          section={reviseDoc.section}
          defaultDocNumber={reviseDoc.docNumber}
          defaultTitle={reviseDoc.title}
        />
      )}
    </>
  );
}


