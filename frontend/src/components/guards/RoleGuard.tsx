import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const { addToast } = useUIStore();

  const blocked = !isLoading && (!user || !roles.includes(user.role));

  // Redirecting silently makes a permission boundary look like a broken link.
  // Side effect (not render logic) so it fires once per blocked navigation.
  useEffect(() => {
    if (blocked) {
      addToast('error', "You don't have access to that page.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  // While auth is being initialized (e.g. on page refresh), don't redirect yet
  if (isLoading) {
    return null;
  }

  if (blocked) {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
}
