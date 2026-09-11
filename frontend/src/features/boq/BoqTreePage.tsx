import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { boqApi } from '../../services/boqApi';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BoqUploadModal } from './BoqUploadModal';
import { BoqItemDetailPanel } from './BoqItemDetailPanel';
import { BoqDocumentBadges, BoqDocumentCounts } from './BoqDocumentBadges';

interface BoqItem {
  id: string;
  item_code: string;
  system_tag?: string;
  title: string;
  level: number;
  children?: BoqItem[];
  document_counts?: BoqDocumentCounts;
}

interface BoqNodeProps {
  item: BoqItem;
  depth: number;
  onSelect: (item: BoqItem) => void;
  selectedId: string | null;
}

// Per-level style config
const LEVEL_STYLES: Record<number, { row: string; title: string; code: string }> = {
  1: {
    row:   'py-2.5 border-t border-gray-200 first:border-t-0',
    title: 'text-sm font-bold text-gray-900',
    code:  'text-xs font-mono text-gray-500 flex-shrink-0 w-20 truncate',
  },
  2: {
    row:   'py-2',
    title: 'text-sm font-normal text-gray-700',
    code:  'text-xs font-mono text-gray-400 flex-shrink-0 w-20 truncate',
  },
};
const DEFAULT_LEVEL_STYLE = {
  row:   'py-1.5',
  title: 'text-sm font-normal text-gray-500',
  code:  'text-xs font-mono text-gray-400 flex-shrink-0 w-20 truncate',
};

function BoqNode({ item, depth, onSelect, selectedId }: BoqNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = item.id === selectedId;
  const lvl = LEVEL_STYLES[item.level] ?? DEFAULT_LEVEL_STYLE;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 rounded-md cursor-pointer transition-colors hover:bg-gray-100 ${lvl.row} ${
          isSelected ? 'bg-primary-50 border border-primary-200' : ''
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => onSelect(item)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        <span className={lvl.code}>
          {item.item_code}
        </span>

        {item.system_tag && (
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex-shrink-0">
            {item.system_tag}
          </span>
        )}

        <span className={`flex-1 truncate ${isSelected ? 'text-primary-700' : ''} ${lvl.title}`}>
          {item.title}
        </span>

        <BoqDocumentBadges counts={item.document_counts} />
      </div>

      {expanded && hasChildren && (
        <div>
          {item.children!.map((child) => (
            <BoqNode
              key={child.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BoqTreePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BoqItem | null>(null);

  const canUploadBoq = user?.role === 'PIC_PROJECT' || user?.role === 'ADMIN';

  const { data, isLoading, error } = useQuery({
    queryKey: ['boq-tree', projectId],
    queryFn: () => boqApi.getTree(projectId!),
    enabled: !!projectId,
  });

  const tree: BoqItem[] = data?.data?.data ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl font-bold text-gray-900">Bill of Quantities</h1>
        </div>

        {canUploadBoq && (
          <button
            onClick={() => setUploadOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Excel
          </button>
        )}
      </div>

      {/* Legend — the tree badges have no other explanation, so keep this visible rather than hover-only */}
      {!isLoading && !error && tree.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-600">ITP / Proc</span> = Field ITP and Procedure — WMS is monitored from Field QC on the project page
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Approved
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Awaiting review
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Rejected — needs revision
          </span>
        </div>
      )}

      {/* Tree */}
      {isLoading && (
        <div className="py-12"><LoadingSpinner size="lg" /></div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
          Failed to load BoQ.
        </div>
      )}

      {!isLoading && !error && tree.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-gray-500">No BoQ items yet.</p>
          {canUploadBoq && (
            <button onClick={() => setUploadOpen(true)} className="btn-primary mt-4">
              Upload BoQ Excel
            </button>
          )}
        </div>
      )}

      {!isLoading && tree.length > 0 && (
        <div className="card flex-1 overflow-y-auto p-2">
          {tree.map((item) => (
            <BoqNode
              key={item.id}
              item={item}
              depth={0}
              onSelect={setSelectedItem}
              selectedId={selectedItem?.id ?? null}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <BoqUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projectId={projectId!}
      />

      {/* Detail panel */}
      {selectedItem && (
        <BoqItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
