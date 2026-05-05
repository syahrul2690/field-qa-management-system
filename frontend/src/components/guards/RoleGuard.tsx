import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  // While auth is being initialized (e.g. on page refresh), don't redirect yet
  if (isLoading) {
    return null;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
}
