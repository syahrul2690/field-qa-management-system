import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../services/authApi';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const ROLES = [
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'PIC_PROJECT', label: 'PIC Project' },
  { value: 'REVIEWER', label: 'Reviewer' },
  { value: 'CHECKER', label: 'Checker' },
  { value: 'APPROVER', label: 'Approver' },
  { value: 'VIEWER', label: 'Viewer' },
];

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

export function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: institutionsData, isLoading: loadingInstitutions } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => authApi.listInstitutions(),
  });

  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['units', institutionId],
    queryFn: () => authApi.listUnits(institutionId),
    enabled: !!institutionId,
  });

  const institutions: Institution[] = institutionsData?.data?.data?.institutions ?? [];
  const units: Unit[] = unitsData?.data?.data?.units ?? [];

  const handleInstitutionChange = (id: string) => {
    setInstitutionId(id);
    setUnitId('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name || !role || !institutionId || !unitId) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({
        email,
        password,
        name,
        role,
        institution_id: institutionId,
        unit_id: unitId,
        ...(phone ? { phone } : {}),
      });
      addToast('success', 'Registration submitted! Awaiting admin approval.');
      navigate('/pending-approval');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message ?? 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="card w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-700">Pusat Manajemen Proyek</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="label">Full Name <span className="text-red-500">*</span></label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email address <span className="text-red-500">*</span></label>
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
            <label htmlFor="password" className="label">Password <span className="text-red-500">*</span></label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Min. 8 characters"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="label">Phone (optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+62..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="role" className="label">Role <span className="text-red-500">*</span></label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
              disabled={isLoading}
            >
              <option value="">Select a role...</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="institution" className="label">Institution <span className="text-red-500">*</span></label>
            <select
              id="institution"
              value={institutionId}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              className="input"
              disabled={isLoading || loadingInstitutions}
            >
              <option value="">
                {loadingInstitutions ? 'Loading...' : 'Select institution...'}
              </option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unit" className="label">Unit / Department <span className="text-red-500">*</span></label>
            <select
              id="unit"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="input"
              disabled={isLoading || !institutionId || loadingUnits}
            >
              <option value="">
                {!institutionId
                  ? 'Select institution first...'
                  : loadingUnits
                  ? 'Loading...'
                  : 'Select unit...'}
              </option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : null}
            {isLoading ? 'Submitting...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
