import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Registration Pending</h1>
        <p className="text-gray-600 mb-6">
          Your registration is pending admin approval. You will be notified once your account has been activated.
        </p>

        <button onClick={handleLogout} className="btn-secondary w-full">
          Back to Login
        </button>
      </div>
    </div>
  );
}
