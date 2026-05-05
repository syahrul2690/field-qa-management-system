import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import plnLogo from '../../assets/Logo_PLN.svg';

function HeroBrand() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0b1f3a 0%, #0d2d50 50%, #0a3d63 100%)' }}
    >
      {/* Subtle dot-grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Large faint circle accent (top-right) */}
      <div
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #44B8DE 0%, transparent 70%)' }}
      />
      {/* Small circle accent (bottom-left) */}
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #44B8DE 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full px-12 py-12">

        {/* Logo */}
        <div className="flex flex-col items-start gap-1.5">
          <img src={plnLogo} alt="PLN Logo" className="h-10 w-auto mb-1" />
          <span className="text-white font-semibold text-base tracking-wide leading-tight">Pusat Manajemen Proyek</span>
          <span className="text-xs tracking-wide" style={{ color: '#A1DBEE', opacity: 0.75 }}>Field QA Management</span>
        </div>

        {/* Headline + tagline */}
        <div>
          <h2 className="text-4xl font-bold leading-snug text-white mb-4">
            Quality Assurance<br />
            <span style={{ color: '#44B8DE' }}>Built for the Field</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#A1DBEE', opacity: 0.8 }}>
            Streamline document review, track inspection milestones, and ensure project compliance — all in one platform.
          </p>

          {/* Divider */}
          <div className="mt-10 mb-8 w-10 h-0.5 rounded" style={{ background: '#44B8DE', opacity: 0.5 }} />

          {/* Three feature points */}
          <ul className="space-y-4">
            {[
              { label: 'Real-time document tracking',     desc: 'Monitor every submission and review stage.' },
              { label: 'Multi-role approval workflow',    desc: 'Reviewer, Checker, and Approver in one flow.' },
              { label: 'Complete audit trail',            desc: 'Every action logged and traceable.' },
            ].map(({ label, desc }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="mt-1 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(68,184,222,0.2)', border: '1px solid rgba(68,184,222,0.4)' }}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#44B8DE' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7BBDD8' }}>{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: '#44B8DE', opacity: 0.4 }}>
          © {new Date().getFullYear()} PLN Pusmanpro
        </p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { access_token, user } = res.data.data;
      localStorage.setItem('access_token', access_token);
      setUser(user);
      addToast('success', `Welcome back, ${user.name}!`);
      navigate('/projects');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message ?? 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f8' }}>
      {/* Left — hero / illustration */}
      <HeroBrand />

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo (only visible when hero is hidden) */}
        <div className="lg:hidden mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-700">Pusat Manajemen Proyek</h1>
          <p className="text-gray-500 text-sm mt-1">Quality Assurance Built for the Field</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the system.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
