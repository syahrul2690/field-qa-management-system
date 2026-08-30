import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

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

const INSPECTION_LEVELS = [
  { value: '', label: '—' }, { value: 'H', label: 'H' }, { value: 'W', label: 'W' },
  { value: 'SW', label: 'SW' }, { value: 'R', label: 'R' }, { value: 'A', label: 'A' },
  { value: 'P', label: 'P' },
] as const;

const INSPECTION_LEVEL_MEANING: Record<string, string> = {
  H: 'Hold Point', W: 'Witness', SW: 'Spot Witness', R: 'Review Doc', A: 'Approval', P: 'Perform',
};

const LEVEL_BADGE_CLASS: Record<string, string> = {
  H: 'bg-red-100 text-red-700', W: 'bg-yellow-100 text-yellow-700', SW: 'bg-orange-100 text-orange-700',
  R: 'bg-blue-100 text-blue-700', A: 'bg-purple-100 text-purple-700', P: 'bg-gray-100 text-gray-600',
};

const ITP_PHASES = [
  { value: 'SHOP', label: 'Shop' }, { value: 'FIELD', label: 'Field' },
  { value: 'COMMISSIONING', label: 'Commissioning' },
] as const;

const ITP_CATEGORIES = [
  { value: 'SIPIL', label: 'Sipil' }, { value: 'ELEKTRIKAL', label: 'Elektrikal' },
  { value: 'MEKANIKAL', label: 'Mekanikal' }, { value: 'INSTRUMEN_KONTROL', label: 'Instrumen & Kontrol' },
] as const;

const EMPTY_ITP_ITEM: ItpItem = {
  seq_no: 1, activity: '', acceptance_criteria: '', reference_standard: '', verifying_document: '',
  sub_code: '', pp_code: '', pln_code: '', phase: 'FIELD', category: 'SIPIL',
};

export interface ItpItemPanelProps {
  documentId: string;
  canEdit: boolean;
  /** Called when the editor has unsaved changes, allowing the containing modal to guard close. */
  onDirtyChange?: (dirty: boolean) => void;
}

export function ItpItemPanel({ documentId, canEdit, onDirtyChange }: ItpItemPanelProps) {
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
    if (isLoading || isError || itemsData === undefined || dirty) return;
    const serverItems = itemsData?.data?.data ?? [];
    setLocalItems(serverItems.length > 0 ? serverItems.map((i: any) => ({
      seq_no: i.seq_no, activity: i.activity, acceptance_criteria: i.acceptance_criteria ?? '',
      reference_standard: i.reference_standard ?? '', verifying_document: i.verifying_document ?? '',
      sub_code: i.sub_code ?? '', pp_code: i.pp_code ?? '', pln_code: i.pln_code ?? '',
      phase: i.phase ?? 'FIELD', category: i.category ?? 'SIPIL',
    })) : (canEdit ? [{ ...EMPTY_ITP_ITEM }] : []));
  }, [itemsData, isLoading, isError, canEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onDirtyChange?.(dirty);
    if (!canEdit || !dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [canEdit, dirty, onDirtyChange]);

  const saveMutation = useMutation({
    mutationFn: () => documentApi.saveItpItems(documentId, (localItems ?? [])
      .filter((i) => i.activity.trim())
      .map(({ sub_code, pp_code, pln_code, ...rest }) => ({
        ...rest, sub_code: sub_code || undefined, pp_code: pp_code || undefined, pln_code: pln_code || undefined,
      }))),
    onSuccess: () => {
      setDirty(false);
      queryClient.refetchQueries({ queryKey: ['itp-items', documentId] });
      addToast('success', 'ITP items saved.');
    },
    onError: () => addToast('error', 'Failed to save ITP items.'),
  });

  function addRow() {
    setLocalItems((prev) => [...(prev ?? []), { ...EMPTY_ITP_ITEM, seq_no: (prev?.length ?? 0) + 1 }]);
    setDirty(true);
  }
  function removeRow(idx: number) {
    setLocalItems((prev) => {
      const next = (prev ?? []).filter((_, i) => i !== idx).map((item, i) => ({ ...item, seq_no: i + 1 }));
      return next.length > 0 ? next : [{ ...EMPTY_ITP_ITEM }];
    });
    setDirty(true);
  }
  function updateRow(idx: number, field: keyof ItpItem, value: string) {
    setLocalItems((prev) => (prev ?? []).map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setDirty(true);
  }

  return (
    <div className="card overflow-hidden border-l-4 border-amber-400">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 01-2 2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          <h2 className="font-semibold text-gray-900">ITP Inspection Items</h2>
          <span className="badge bg-amber-100 text-amber-700 text-xs">{savedItems.length} item{savedItems.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {canEdit && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
          <p className="text-xs text-amber-700">Complete the inspection items, save your changes, then submit this draft for review. Items are locked after submission.</p>
        </div>
      )}

      {isError ? <div className="py-8 flex flex-col items-center gap-3"><p className="text-sm text-red-600">Failed to load ITP items.</p><button onClick={() => refetch()} className="btn-secondary text-xs py-1.5 px-3">Retry</button></div>
        : localItems === null ? <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        : localItems.length === 0 ? <div className="py-8 text-center text-sm text-gray-400">No ITP inspection items yet.</div>
        : <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-amber-50 text-xs font-semibold text-amber-800 border-b border-amber-200">
              <th className="px-2 py-2 w-10 text-center border-r border-amber-200">No.</th><th className="px-2 py-2 text-left border-r border-amber-200 min-w-[180px]">Activity</th><th className="px-2 py-2 text-left border-r border-amber-200 min-w-[140px]">Acceptance Criteria</th><th className="px-2 py-2 text-left border-r border-amber-200 min-w-[120px]">Reference Standard</th><th className="px-2 py-2 text-left border-r border-amber-200 min-w-[120px]">Verifying Document</th><th className="px-2 py-2 text-center border-r border-amber-200 w-20" title="Subcontractor">Sub</th><th className="px-2 py-2 text-center border-r border-amber-200 w-20" title="Main Contractor (PP)">PP</th><th className="px-2 py-2 text-center border-r border-amber-200 w-20" title="PLN (Client)">PLN</th><th className="px-2 py-2 text-center border-r border-amber-200 w-28">Phase</th><th className="px-2 py-2 text-center border-r border-amber-200 w-32">Category</th>{canEdit && <th className="px-2 py-2 w-10" />}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">{localItems.map((item, idx) => <tr key={idx} className="hover:bg-gray-50 align-top">
              <td className="px-2 py-2 text-center text-gray-500 font-mono border-r border-gray-100 w-10">{item.seq_no}.</td>
              <td className="px-2 py-2 border-r border-gray-100">{canEdit ? <textarea value={item.activity} onChange={(e) => updateRow(idx, 'activity', e.target.value)} className="input text-sm resize-none w-full min-h-[50px]" placeholder="Inspection activity..." rows={2} /> : <p className="text-gray-800 whitespace-pre-wrap">{item.activity || <span className="text-gray-400 italic">—</span>}</p>}</td>
              <td className="px-2 py-2 border-r border-gray-100">{canEdit ? <textarea value={item.acceptance_criteria} onChange={(e) => updateRow(idx, 'acceptance_criteria', e.target.value)} className="input text-sm resize-none w-full min-h-[50px]" placeholder="Criteria..." rows={2} /> : <p className="text-gray-600 whitespace-pre-wrap">{item.acceptance_criteria || <span className="text-gray-400 italic">—</span>}</p>}</td>
              <td className="px-2 py-2 border-r border-gray-100">{canEdit ? <input type="text" value={item.reference_standard} onChange={(e) => updateRow(idx, 'reference_standard', e.target.value)} className="input text-sm w-full" placeholder="e.g. IEC 62271" /> : <p className="text-gray-600">{item.reference_standard || <span className="text-gray-400 italic">—</span>}</p>}</td>
              <td className="px-2 py-2 border-r border-gray-100">{canEdit ? <input type="text" value={item.verifying_document} onChange={(e) => updateRow(idx, 'verifying_document', e.target.value)} className="input text-sm w-full" placeholder="e.g. FAT Report" /> : <p className="text-gray-600">{item.verifying_document || <span className="text-gray-400 italic">—</span>}</p>}</td>
              {(['sub_code', 'pp_code', 'pln_code'] as const).map((field) => <td key={field} className="px-1 py-2 border-r border-gray-100 text-center">{canEdit ? <select value={item[field]} onChange={(e) => updateRow(idx, field, e.target.value)} title={item[field] ? INSPECTION_LEVEL_MEANING[item[field]] : 'Not applicable'} className="input text-xs w-full px-1">{INSPECTION_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</select> : item[field] ? <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${LEVEL_BADGE_CLASS[item[field]] ?? 'bg-gray-100 text-gray-600'}`}>{item[field]}</span> : <span className="text-gray-300">—</span>}</td>)}
              <td className="px-2 py-2 border-r border-gray-100 text-center">{canEdit ? <select value={item.phase} onChange={(e) => updateRow(idx, 'phase', e.target.value)} className="input text-xs w-full">{ITP_PHASES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select> : <span className="text-xs text-gray-600">{item.phase}</span>}</td>
              <td className="px-2 py-2 border-r border-gray-100 text-center">{canEdit ? <select value={item.category} onChange={(e) => updateRow(idx, 'category', e.target.value)} className="input text-xs w-full">{ITP_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select> : <span className="text-xs text-gray-600">{ITP_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category}</span>}</td>
              {canEdit && <td className="px-1 py-2 w-10"><button onClick={() => removeRow(idx)} className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Remove row"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></td>}
            </tr>)}</tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">{INSPECTION_LEVELS.filter((l) => l.value).map((l) => <span key={l.value} className="flex items-center gap-1"><span className={`inline-block px-1.5 rounded font-semibold ${LEVEL_BADGE_CLASS[l.value]}`}>{l.value}</span>{INSPECTION_LEVEL_MEANING[l.value]}</span>)}</div>
          {canEdit && <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between"><button onClick={addRow} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1.5 font-medium"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Inspection Item</button><button onClick={() => saveMutation.mutate()} disabled={!dirty || saveMutation.isPending || localItems === null} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2">{saveMutation.isPending ? <LoadingSpinner size="sm" /> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}{saveMutation.isPending ? 'Saving...' : dirty ? 'Save ITP Items' : 'Saved'}</button></div>}
        </div>}
    </div>
  );
}
