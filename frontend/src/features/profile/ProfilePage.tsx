import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const ALL_ROLES = [
  'ADMIN',
  'PIC_PROJECT',
  'VENDOR',
  'REVIEWER',
  'CHECKER',
  'APPROVER',
  'VIEWER',
] as const;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  PIC_PROJECT: 'PIC Project',
  VENDOR: 'Vendor',
  REVIEWER: 'Reviewer',
  CHECKER: 'Checker',
  APPROVER: 'Approver',
  VIEWER: 'Viewer',
};

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
  });

  const profile = data?.data?.data?.user ?? data?.data?.data ?? null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setRole(profile.role ?? '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; phone: string; role?: string }) =>
      authApi.updateProfile(payload),
    onSuccess: (res) => {
      const updated = res.data?.data?.user;
      if (updated && user) {
        setUser({ ...user, name: updated.name, role: updated.role });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast('success', 'Profile updated successfully.');
    },
    onError: () => addToast('error', 'Failed to update profile.'),
  });

  const isAdmin = user?.role === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { name: string; phone: string; role?: string } = { name, phone };
    if (isAdmin) payload.role = role;
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <div className="py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">View and update your personal information.</p>
      </div>

      {/* Read-only identity info */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900 mt-0.5">{profile?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium text-gray-900 mt-0.5 capitalize">{profile?.status?.toLowerCase() ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Institution</p>
            <p className="font-medium text-gray-900 mt-0.5">{profile?.institution?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Unit</p>
            <p className="font-medium text-gray-900 mt-0.5">{profile?.unit?.name ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Edit Profile</h2>

        <div>
          <label className="label">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="e.g. +62 812 3456 7890"
          />
        </div>

        <div>
          <label className="label">
            Role
            {!isAdmin && (
              <span className="ml-2 text-xs text-gray-400 font-normal">(read-only — contact admin to change)</span>
            )}
          </label>
          {isAdmin ? (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          ) : (
            <div className="input bg-gray-50 text-gray-600 cursor-not-allowed select-none">
              {ROLE_LABELS[role] ?? role}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending || !name.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {updateMutation.isPending && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
