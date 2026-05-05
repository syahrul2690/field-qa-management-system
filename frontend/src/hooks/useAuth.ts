import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/authApi';

// Called once in App.tsx.
//
// Behaviour:
// • Returning user  (persisted session in pln-auth + access_token present)
//     → store already has user / isAuthenticated=true / isLoading=false on first
//       render.  me() runs silently in the background to refresh user data and
//       keep the session alive.  No spinner, no flash.
//
// • New / cleared session (no pln-auth but access_token present)
//     → store starts with isLoading=true (spinner shown by AuthGuard).
//       me() resolves → setUser() → isLoading=false → app renders.
//
// • No token at all
//     → setUser(null) → isAuthenticated=false → AuthGuard redirects to /login.
export function useInitAuth() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      // No token — make sure state is fully cleared (handles edge cases)
      setUser(null);
      return;
    }

    // Token found — verify it with the server.
    // For returning users this is a silent background call (isLoading is already
    // false because of the persisted session).  For new sessions it is the
    // blocking call that resolves the spinner.
    authApi
      .me()
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        localStorage.removeItem('access_token');
        setUser(null);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount
}
