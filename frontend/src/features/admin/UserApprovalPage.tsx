import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institution_name?: string;
  unit_name?: string;
  created_at: string;
}

export function UserApprovalPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'pending-users'],
    queryFn: () => apiClient.get('/admin/users/pending'),
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/approve`),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['admin', 'pending-users'], (old: { data: { data: PendingUser[] } }) => ({
        ...old,
        data: { ...old.data, data: old.data.data.filter((u: PendingUser) => u.id !== userId) },
      }));
      addToast('success', 'User approved successfully.');
    },
    onError: () => addToast('error', 'Failed to approve user.'),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/reject`),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['admin', 'pending-users'], (old: { data: { data: PendingUser[] } }) => ({
        ...old,
        data: { ...old.data, data: old.data.data.filter((u: PendingUser) => u.id !== userId) },
      }));
      addToast('success', 'User rejected.');
    },
    onError: () => addToast('error', 'Failed to reject user.'),
  });

  const users: PendingUser[] = data?.data?.data?.users ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve new user registrations.</p>
      </div>

      {isLoading && (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
          Failed to load pending users.
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500">No pending approvals</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.institution_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.unit_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approveMutation.mutate(user.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(user.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="btn-danger text-xs px-3 py-1.5"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
