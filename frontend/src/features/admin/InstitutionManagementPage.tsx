import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institution {
  id: string;
  name: string;
  type: 'OWNER' | 'CONSULTANT' | 'VENDOR';
  address?: string;
  units?: Unit[];
}

interface Unit {
  id: string;
  name: string;
  level: number;
  parent_unit_id?: string | null;
  description?: string;
  children?: Unit[];
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function buildTree(flat: Unit[]): Unit[] {
  const map = new Map<string, Unit>();
  flat.forEach((u) => map.set(u.id, { ...u, children: [] }));
  const roots: Unit[] = [];
  map.forEach((u) => {
    if (u.parent_unit_id && map.has(u.parent_unit_id)) {
      map.get(u.parent_unit_id)!.children!.push(u);
    } else {
      roots.push(u);
    }
  });
  return roots;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<number, { bg: string; text: string }> = {
  0: { bg: '#0e4f65', text: '#ffffff' },
  1: { bg: '#44B8DE', text: '#ffffff' },
  2: { bg: '#A1DBEE', text: '#0e4f65' },
};

const TYPE_BADGE: Record<string, string> = {
  OWNER:      'bg-blue-100 text-blue-700',
  CONSULTANT: 'bg-purple-100 text-purple-700',
  VENDOR:     'bg-orange-100 text-orange-700',
};

const INST_TYPE_OPTIONS = ['OWNER', 'CONSULTANT', 'VENDOR'];

const UNIT_LEVEL_LABELS: Record<number, string> = {
  0: 'Root (Induk)',
  1: 'Child (Pelaksana)',
  2: 'Grandchild (Site Team)',
};

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isPending: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Unit tree node ───────────────────────────────────────────────────────────

function UnitTreeNode({
  unit,
  depth = 0,
  onEdit,
  onDelete,
}: {
  unit: Unit;
  depth?: number;
  onEdit: (u: Unit) => void;
  onDelete: (u: Unit) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = (unit.children?.length ?? 0) > 0;
  const colors = LEVEL_COLOR[unit.level] ?? { bg: '#e5e7eb', text: '#374151' };

  return (
    <li>
      <div
        className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${20 + depth * 20}px` }}
      >
        {/* Toggle */}
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          </span>
        )}

        {/* Level badge */}
        <div
          className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {unit.level}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{unit.name}</p>
          <p className="text-xs text-gray-400">
            {UNIT_LEVEL_LABELS[unit.level] ?? `Level ${unit.level}`}
            {unit.description && ` · ${unit.description}`}
          </p>
        </div>

        {/* Children count */}
        {hasChildren && (
          <span className="badge bg-gray-100 text-gray-500 text-xs">
            {unit.children!.length}
          </span>
        )}

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(unit); }}
            className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit unit"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(unit); }}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete unit"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <ul className="border-l border-gray-100 ml-8">
          {unit.children!.map((child) => (
            <UnitTreeNode key={child.id} unit={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InstitutionManagementPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [selected, setSelected] = useState<Institution | null>(null);

  // ── Institution modal state
  const [showInstModal, setShowInstModal] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [instForm, setInstForm] = useState({ name: '', type: 'OWNER', address: '' });

  // ── Institution delete confirm
  const [deletingInst, setDeletingInst] = useState<Institution | null>(null);

  // ── Unit modal state
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState({ name: '', level: 0, parent_unit_id: '', description: '' });

  // ── Unit delete confirm
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: instData, isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => apiClient.get('/institutions'),
  });

  const { data: unitData } = useQuery({
    queryKey: ['units', selected?.id],
    queryFn: () => apiClient.get(`/institutions/${selected!.id}/units`),
    enabled: !!selected,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────

  const createInstMutation = useMutation({
    mutationFn: (d: typeof instForm) => apiClient.post('/institutions', d),
    onSuccess: () => {
      addToast('success', 'Institution created.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      closeInstModal();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', msg ?? 'Failed to create institution.');
    },
  });

  const updateInstMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof instForm> }) =>
      apiClient.patch(`/institutions/${id}`, data),
    onSuccess: (res) => {
      addToast('success', 'Institution updated.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      // Refresh selected if it's the one we edited
      if (selected && res.data?.data?.institution?.id === selected.id) {
        setSelected(res.data.data.institution);
      }
      closeInstModal();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', msg ?? 'Failed to update institution.');
    },
  });

  const deleteInstMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/institutions/${id}`),
    onSuccess: () => {
      addToast('success', 'Institution deleted.');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      if (selected?.id === deletingInst?.id) setSelected(null);
      setDeletingInst(null);
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', msg ?? 'Failed to delete institution.');
      setDeletingInst(null);
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (d: typeof unitForm) =>
      apiClient.post(`/institutions/${selected!.id}/units`, {
        ...d,
        parent_unit_id: d.parent_unit_id || undefined,
        description: d.description || undefined,
      }),
    onSuccess: () => {
      addToast('success', 'Unit created.');
      queryClient.invalidateQueries({ queryKey: ['units', selected?.id] });
      closeUnitModal();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', msg ?? 'Failed to create unit.');
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: Partial<typeof unitForm> }) =>
      apiClient.patch(`/institutions/${selected!.id}/units/${unitId}`, {
        ...data,
        parent_unit_id: data.parent_unit_id === '' ? null : data.parent_unit_id,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      addToast('success', 'Unit updated.');
      queryClient.invalidateQueries({ queryKey: ['units', selected?.id] });
      closeUnitModal();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', msg ?? 'Failed to update unit.');
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (unitId: string) =>
      apiClient.delete(`/institutions/${selected!.id}/units/${unitId}`),
    onSuccess: () => {
      addToast('success', 'Unit deleted.');
      queryClient.invalidateQueries({ queryKey: ['units', selected?.id] });
      setDeletingUnit(null);
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', msg ?? 'Failed to delete unit.');
      setDeletingUnit(null);
    },
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function openAddInst() {
    setEditingInst(null);
    setInstForm({ name: '', type: 'OWNER', address: '' });
    setShowInstModal(true);
  }

  function openEditInst(inst: Institution) {
    setEditingInst(inst);
    setInstForm({ name: inst.name, type: inst.type, address: inst.address ?? '' });
    setShowInstModal(true);
  }

  function closeInstModal() {
    setShowInstModal(false);
    setEditingInst(null);
    setInstForm({ name: '', type: 'OWNER', address: '' });
  }

  function submitInstForm() {
    if (editingInst) {
      updateInstMutation.mutate({ id: editingInst.id, data: instForm });
    } else {
      createInstMutation.mutate(instForm);
    }
  }

  function openAddUnit() {
    setEditingUnit(null);
    setUnitForm({ name: '', level: 0, parent_unit_id: '', description: '' });
    setShowUnitModal(true);
  }

  function openEditUnit(unit: Unit) {
    setEditingUnit(unit);
    setUnitForm({
      name: unit.name,
      level: unit.level,
      parent_unit_id: unit.parent_unit_id ?? '',
      description: unit.description ?? '',
    });
    setShowUnitModal(true);
  }

  function closeUnitModal() {
    setShowUnitModal(false);
    setEditingUnit(null);
    setUnitForm({ name: '', level: 0, parent_unit_id: '', description: '' });
  }

  function submitUnitForm() {
    if (editingUnit) {
      updateUnitMutation.mutate({ unitId: editingUnit.id, data: unitForm });
    } else {
      createUnitMutation.mutate(unitForm);
    }
  }

  // ─── Derived data ─────────────────────────────────────────────────────────

  const institutions: Institution[] = instData?.data?.data?.institutions ?? [];
  const units: Unit[] = unitData?.data?.data?.units ?? [];
  const unitTree: Unit[] = buildTree(units);

  const instMutPending = createInstMutation.isPending || updateInstMutation.isPending;
  const unitMutPending = createUnitMutation.isPending || updateUnitMutation.isPending;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Institution Management</h1>
          <p className="page-subtitle">Manage institutions and their organisational units.</p>
        </div>
        <button onClick={openAddInst} className="btn-primary flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Institution
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Institutions list ──────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Institutions</h2>
            <span className="badge bg-gray-100 text-gray-600">{institutions.length}</span>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {institutions.map((inst) => (
                <li
                  key={inst.id}
                  onClick={() => setSelected(inst)}
                  className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${
                    selected?.id === inst.id
                      ? 'bg-primary-50 border-l-4 border-primary-400'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: '#A1DBEE' }}>
                    <svg className="h-5 w-5" style={{ color: '#0e4f65' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{inst.name}</p>
                    <p className="text-xs text-gray-400 truncate">{inst.address ?? 'No address'}</p>
                  </div>

                  <span className={`badge ${TYPE_BADGE[inst.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {inst.type}
                  </span>

                  {/* Actions — appear on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditInst(inst); }}
                      className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Edit institution"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingInst(inst); }}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete institution"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}

              {institutions.length === 0 && (
                <li className="py-12 text-center text-sm text-gray-400">No institutions yet</li>
              )}
            </ul>
          )}
        </div>

        {/* ── Units panel ────────────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {selected ? `Units — ${selected.name}` : 'Units'}
              </h2>
              {!selected && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Click an institution to view its units
                </p>
              )}
            </div>
            {selected && (
              <button onClick={openAddUnit} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Unit
              </button>
            )}
          </div>

          {!selected ? (
            <div className="py-16 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
              <p className="text-sm text-gray-400">Select an institution to view units</p>
            </div>
          ) : units.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No units yet — add one above</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {unitTree.map((root) => (
                <UnitTreeNode
                  key={root.id}
                  unit={root}
                  depth={0}
                  onEdit={openEditUnit}
                  onDelete={setDeletingUnit}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Institution modal (add / edit) ───────────────────────────────── */}
      <Modal
        isOpen={showInstModal}
        onClose={closeInstModal}
        title={editingInst ? `Edit Institution — ${editingInst.name}` : 'Add Institution'}
        size="md"
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Institution Name *</label>
            <input
              className="input"
              placeholder="e.g. PLN Unit Induk Transmisi"
              value={instForm.name}
              onChange={(e) => setInstForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="label">Type *</label>
            <select
              className="input"
              value={instForm.type}
              onChange={(e) => setInstForm((f) => ({ ...f, type: e.target.value }))}
            >
              {INST_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Address</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional address"
              value={instForm.address}
              onChange={(e) => setInstForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={closeInstModal}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!instForm.name || instMutPending}
              onClick={submitInstForm}
            >
              {instMutPending
                ? (editingInst ? 'Saving…' : 'Creating…')
                : (editingInst ? 'Save Changes' : 'Create Institution')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Institution delete confirm ───────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={!!deletingInst}
        onClose={() => setDeletingInst(null)}
        onConfirm={() => deletingInst && deleteInstMutation.mutate(deletingInst.id)}
        title="Delete Institution"
        description={`Are you sure you want to delete "${deletingInst?.name}"? This will also delete all of its units. This action cannot be undone.`}
        isPending={deleteInstMutation.isPending}
      />

      {/* ── Unit modal (add / edit) ──────────────────────────────────────── */}
      <Modal
        isOpen={showUnitModal}
        onClose={closeUnitModal}
        title={editingUnit
          ? `Edit Unit — ${editingUnit.name}`
          : `Add Unit to ${selected?.name ?? ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Unit Name *</label>
            <input
              className="input"
              placeholder="e.g. Unit Pelaksana Proyek Jawa Barat"
              value={unitForm.name}
              onChange={(e) => setUnitForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="label">Hierarchy Level *</label>
            <select
              className="input"
              value={unitForm.level}
              onChange={(e) => setUnitForm((f) => ({ ...f, level: Number(e.target.value) }))}
            >
              {Object.entries(UNIT_LEVEL_LABELS).map(([lvl, label]) => (
                <option key={lvl} value={lvl}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Parent Unit (optional)</label>
            <select
              className="input"
              value={unitForm.parent_unit_id}
              onChange={(e) => setUnitForm((f) => ({ ...f, parent_unit_id: e.target.value }))}
            >
              <option value="">— No parent (root unit) —</option>
              {units
                // Don't let a unit be its own parent
                .filter((u) => !editingUnit || u.id !== editingUnit.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {'  '.repeat(u.level)}{u.name} (Level {u.level})
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <input
              className="input"
              placeholder="Optional short description"
              value={unitForm.description}
              onChange={(e) => setUnitForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={closeUnitModal}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!unitForm.name || unitMutPending}
              onClick={submitUnitForm}
            >
              {unitMutPending
                ? (editingUnit ? 'Saving…' : 'Creating…')
                : (editingUnit ? 'Save Changes' : 'Create Unit')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Unit delete confirm ──────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={!!deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={() => deletingUnit && deleteUnitMutation.mutate(deletingUnit.id)}
        title="Delete Unit"
        description={`Are you sure you want to delete "${deletingUnit?.name}"? Units with child units or assigned users cannot be deleted.`}
        isPending={deleteUnitMutation.isPending}
      />
    </div>
  );
}
