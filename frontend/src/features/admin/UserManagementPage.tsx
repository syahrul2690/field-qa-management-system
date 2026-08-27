import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  institution_id: string;
  unit_id: string;
  qc_role?: string | null;
  qc_function?: string | null;
  institution?: { id: string; name: string; type: string };
  unit?: { id: string; name: string; level: number };
  created_at: string;
  approved_at?: string;
}

interface Institution {
  id: string;
  name: string;
  type: string;
}

interface Unit {
  id: string;
  name: string;
  level: number;
}

interface EditForm {
  name: string;
  role: string;
  institution_id: string;
  unit_id: string;
  qc_role: string;
  qc_function: string;
}

type EditUserPayload = Omit<EditForm, 'qc_role' | 'qc_function'> & {
  qc_role: string | null;
  qc_function: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: 'All Users',  value: ''          },
  { label: 'Pending',    value: 'PENDING'   },
  { label: 'Approved',   value: 'APPROVED'  },
  { label: 'Rejected',   value: 'REJECTED'  },
  { label: 'Suspended',  value: 'SUSPENDED' },
];

const STATUS_BADGE: Record<UserStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  APPROVED:  { label: 'Approved',  cls: 'bg-green-100  text-green-700  border border-green-200'  },
  REJECTED:  { label: 'Rejected',  cls: 'bg-red-100    text-red-700    border border-red-200'    },
  SUSPENDED: { label: 'Suspended', cls: 'bg-gray-100   text-gray-600   border border-gray-200'   },
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN:         'bg-purple-100 text-purple-700',
  PIC_PROJECT:   'bg-blue-100   text-blue-700',
  PIC_CONSULTANT:'bg-cyan-100   text-cyan-700',
  REVIEWER:      'bg-yellow-100 text-yellow-700',
  CHECKER:       'bg-orange-100 text-orange-700',
  APPROVER:      'bg-green-100  text-green-700',
  VENDOR:        'bg-pink-100   text-pink-700',
  VIEWER:        'bg-gray-100   text-gray-600',
};

const ALL_ROLES = [
  'ADMIN', 'PIC_PROJECT', 'PIC_CONSULTANT',
  'REVIEWER', 'CHECKER', 'APPROVER', 'VENDOR', 'VIEWER',
];

const QC_ROLES = [
  { value: '', label: 'None (no QC access)' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'INSPECTOR', label: 'Inspector' },
  { value: 'QC_ENGINEER', label: 'QC Engineer' },
  { value: 'QC_LEAD', label: 'QC Lead' },
];

const QC_FUNCTIONS = [
  { value: '', label: 'None (no PowerQC workflow access)' },
  { value: 'MAKER', label: 'Maker' },
  { value: 'CHECKER', label: 'Checker' },
  { value: 'APPROVER', label: 'Approver' },
  { value: 'ADMIN', label: 'Administrator' },
];

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: ManagedUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { addToast } = useUIStore();

  const [form, setForm] = useState<EditForm>({
    name:           user.name,
    role:           user.role,
    institution_id: user.institution_id ?? user.institution?.id ?? '',
    unit_id:        user.unit_id        ?? user.unit?.id         ?? '',
    qc_role:        user.qc_role ?? '',
    qc_function:    user.qc_function ?? '',
  });

  // Institutions list
  const { data: instData } = useQuery({
    queryKey: ['institutions', 'all'],
    queryFn:  () => apiClient.get('/institutions'),
    staleTime: 60_000,
  });
  const institutions: Institution[] = instData?.data?.data?.institutions ?? [];

  // Units for selected institution (refetch when institution changes)
  const { data: unitData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', form.institution_id],
    queryFn:  () => apiClient.get(`/institutions/${form.institution_id}/units`),
    enabled:  !!form.institution_id,
    staleTime: 60_000,
  });
  const units: Unit[] = unitData?.data?.data?.units ?? [];

  // Clear unit when institution changes (unless it's the initial load)
  const prevInstitution = user.institution_id ?? user.institution?.id ?? '';
  useEffect(() => {
    if (form.institution_id !== prevInstitution) {
      setForm((f) => ({ ...f, unit_id: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.institution_id]);

  const updateMutation = useMutation({
    mutationFn: (body: EditUserPayload) =>
      apiClient.patch(`/admin/users/${user.id}`, body),
    onSuccess: () => {
      addToast('success', 'User updated successfully.');
      onSaved();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update user.';
      addToast('error', msg);
    },
  });

  const handleSave = () => {
    if (!form.name.trim())        return addToast('error', 'Name is required.');
    if (!form.role)                return addToast('error', 'Role is required.');
    if (!form.institution_id)      return addToast('error', 'Institution is required.');
    if (!form.unit_id)             return addToast('error', 'Unit is required.');
    updateMutation.mutate({
      ...form,
      qc_role: form.qc_role || null,
      qc_function: form.qc_function || null,
    });
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit User">
      <div className="space-y-4">

        {/* User identity (read-only header) */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: '#44B8DE' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label">Full Name <span className="text-red-500">*</span></label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Full name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="label">Role <span className="text-red-500">*</span></label>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="">Select role…</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">
            Changing role affects what the user can see and do across the system.
          </p>
        </div>

        {/* Legacy QC role retained while older PowerQC clients are upgraded */}
        <div>
          <label className="label">Legacy Field QC Role</label>
          <select
            className="input"
            value={form.qc_role}
            onChange={(e) => setForm((f) => ({ ...f, qc_role: e.target.value }))}
          >
            {QC_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">
            Compatibility field for older PowerQC clients. New workflow authorization uses PowerQC Function below.
          </p>
        </div>

        {/* Canonical PowerQC workflow function */}
        <div>
          <label className="label">PowerQC Function</label>
          <select
            className="input"
            value={form.qc_function}
            onChange={(e) => setForm((f) => ({ ...f, qc_function: e.target.value }))}
          >
            {QC_FUNCTIONS.map((entry) => (
              <option key={entry.value} value={entry.value}>{entry.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">
            Combined with the institution type to authorize Maker, Checker, Approver, or Admin actions in PowerQC.
          </p>
        </div>

        {/* Institution */}
        <div>
          <label className="label">Institution <span className="text-red-500">*</span></label>
          <select
            className="input"
            value={form.institution_id}
            onChange={(e) => setForm((f) => ({ ...f, institution_id: e.target.value, unit_id: '' }))}
          >
            <option value="">Select institution…</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
                <span className="text-gray-400"> ({inst.type})</span>
              </option>
            ))}
          </select>
          {form.institution_id !== prevInstitution && (
            <p className="text-[11px] text-amber-600 mt-1">
              Institution changed — please also select a new unit below.
            </p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="label">Unit <span className="text-red-500">*</span></label>
          {unitsLoading ? (
            <div className="input flex items-center gap-2 text-gray-400 text-sm">
              <LoadingSpinner size="sm" /> Loading units…
            </div>
          ) : (
            <select
              className="input"
              value={form.unit_id}
              onChange={(e) => setForm((f) => ({ ...f, unit_id: e.target.value }))}
              disabled={!form.institution_id}
            >
              <option value="">
                {form.institution_id ? 'Select unit…' : 'Select institution first'}
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {'  '.repeat(Math.max(0, u.level - 1))}{u.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={updateMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="btn-primary"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', activeTab],
    queryFn:  () =>
      apiClient.get('/admin/users', { params: activeTab ? { status: activeTab } : {} }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}/approve`),
    onSuccess:  () => { addToast('success', 'User approved.');   invalidate(); },
    onError:    () => addToast('error', 'Failed to approve user.'),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}/reject`),
    onSuccess:  () => { addToast('success', 'User rejected.');   invalidate(); },
    onError:    () => addToast('error', 'Failed to reject user.'),
  });
  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}/suspend`),
    onSuccess:  () => { addToast('success', 'User suspended.');  invalidate(); },
    onError:    () => addToast('error', 'Failed to suspend user.'),
  });

  const allUsers: ManagedUser[] = data?.data?.data?.users ?? [];
  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const isMutating =
    approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Review registrations and manage account access.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            className="input pl-9 text-sm"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setSearch(''); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Institution / Unit</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Registered</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((user) => {
                  const badge = STATUS_BADGE[user.status];
                  return (
                    <tr key={user.id} className="table-row">
                      {/* User */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: '#44B8DE' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="table-cell">
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${ROLE_BADGE[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {user.role.replace(/_/g, ' ')}
                          </span>
                          {user.qc_role && (
                            <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">
                              QC: {user.qc_role.replace(/_/g, ' ')}
                            </span>
                          )}
                          {user.qc_function && (
                            <span className="badge bg-blue-100 text-blue-700 text-[10px]">
                              PowerQC: {user.qc_function.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Institution / Unit */}
                      <td className="table-cell">
                        <p className="text-sm text-gray-700">{user.institution?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{user.unit?.name ?? ''}</p>
                      </td>

                      {/* Status */}
                      <td className="table-cell">
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>

                      {/* Registered */}
                      <td className="table-cell text-gray-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Edit properties button — always available */}
                          <button
                            onClick={() => setEditingUser(user)}
                            title="Edit user properties"
                            className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Status actions */}
                          {user.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(user.id)}
                                disabled={isMutating}
                                className="btn-primary py-1 px-3 text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(user.id)}
                                disabled={isMutating}
                                className="btn-danger py-1 px-3 text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {user.status === 'APPROVED' && (
                            <button
                              onClick={() => suspendMutation.mutate(user.id)}
                              disabled={isMutating}
                              className="btn-secondary py-1 px-3 text-xs text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              Suspend
                            </button>
                          )}
                          {(user.status === 'REJECTED' || user.status === 'SUSPENDED') && (
                            <button
                              onClick={() => approveMutation.mutate(user.id)}
                              disabled={isMutating}
                              className="btn-primary py-1 px-3 text-xs"
                            >
                              Re-Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}
