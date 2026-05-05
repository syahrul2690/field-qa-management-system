import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  institution_id: string;
  institution_type: string;
  unit_id: string;
  unit_level: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** true only while the initial token verification (me()) is in flight for new sessions */
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'pln-auth',
      storage: createJSONStorage(() => localStorage),

      // Only persist user identity — never persist isLoading
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      // On hydration: restore user immediately and skip the loading spinner
      // if we already have a valid persisted session (user + isAuthenticated).
      // Otherwise keep isLoading=true so AuthGuard shows a spinner while
      // useInitAuth's me() call is in flight.
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<AuthState>;
        // Guard: reject a corrupted cached user (e.g. { user: {...} } instead
        // of the flat user object).  A valid user must have a string `id`.
        const cachedUser =
          p.user && typeof (p.user as unknown as Record<string, unknown>).id === 'string'
            ? p.user
            : null;
        const hasPersistedSession = !!(p.isAuthenticated && cachedUser);
        return {
          ...currentState,
          user:            cachedUser,
          isAuthenticated: !!cachedUser,
          isLoading:       !hasPersistedSession,
        };
      },
    },
  ),
);
