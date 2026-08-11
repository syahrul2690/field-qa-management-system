import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { projectApi } from '../../services/projectApi';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface NominalValue {
  currency: string;
  amount: string;
}

const PROJECT_TYPES = [
  { label: 'Pembangkit', value: 'GENERATION' },
  { label: 'Transmisi', value: 'TRANSMISSION' },
  { label: 'Substation', value: 'SUBSTATION' },
  { label: 'Distribution', value: 'DISTRIBUTION' },
  { label: 'Other', value: 'OTHER' },
];

const URGENCY_OPTIONS = [
  { label: 'Normal Priority',   value: 'NORMAL',           cls: 'text-gray-700 bg-gray-50 border-gray-200' },
  { label: 'RUPTL',             value: 'RUPTL',            cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Kerawanan Sistem',  value: 'KERAWANAN_SISTEM', cls: 'text-orange-700 bg-orange-50 border-orange-200' },
  { label: 'Kinerja Korporat',  value: 'KINERJA_KORPORAT', cls: 'text-red-700 bg-red-50 border-red-200' },
];

export function ProjectFormPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [contractNumber, setContractNumber] = useState('');
  const [contractSigningDate, setContractSigningDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [warrantyDays, setWarrantyDays] = useState('365');
  const [nominalValues, setNominalValues] = useState<NominalValue[]>([{ currency: 'IDR', amount: '' }]);
  const [error, setError] = useState('');

  // Auto-calculate duration in days
  const durationDays = (() => {
    if (!effectiveDate || !endDate) return null;
    const diff = new Date(endDate).getTime() - new Date(effectiveDate).getTime();
    if (diff < 0) return null;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  })();

  const createMutation = useMutation({
    mutationFn: (data: unknown) => projectApi.create(data),
    onSuccess: (res) => {
      const projectId = res.data?.data?.id;
      addToast('success', 'Project created successfully.');
      navigate(projectId ? `/projects/${projectId}` : '/projects');
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message ?? 'Failed to create project.';
      setError(msg);
    },
  });

  const handleAddNominal = () => {
    setNominalValues([...nominalValues, { currency: 'USD', amount: '' }]);
  };

  const handleRemoveNominal = (index: number) => {
    setNominalValues(nominalValues.filter((_, i) => i !== index));
  };

  const handleNominalChange = (index: number, field: 'currency' | 'amount', value: string) => {
    setNominalValues(nominalValues.map((nv, i) => i === index ? { ...nv, [field]: value } : nv));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !projectType || !contractSigningDate || !effectiveDate || !endDate) {
      setError('Please fill in all required fields including dates.');
      return;
    }

    const validNominals = nominalValues
      .filter((nv) => nv.currency && nv.amount)
      .map((nv) => ({ currency: nv.currency, amount: parseFloat(nv.amount) }));

    if (validNominals.length === 0) {
      setError('At least one valid nominal value is required.');
      return;
    }

    createMutation.mutate({
      name,
      project_type: projectType,
      urgency,
      ...(contractNumber && { contract_number: contractNumber }),
      contract_signing_date: new Date(contractSigningDate).toISOString(),
      contract_effective_date: new Date(effectiveDate).toISOString(),
      duration_days: durationDays || 0,
      warranty_period_days: parseInt(warrantyDays, 10) || 0,
      nominal_values: validNominals,
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate('/projects')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-3">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label">Project Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. PLTU Kaltim Unit 3"
              disabled={createMutation.isPending}
            />
          </div>

          <div>
            <label className="label">Project Type <span className="text-red-500">*</span></label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="input"
              disabled={createMutation.isPending}
            >
              <option value="">Select type...</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Project Urgency / Criticality <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  disabled={createMutation.isPending}
                  className={`py-2 px-3 rounded-md border text-sm font-medium transition-all ${
                    urgency === opt.value ? opt.cls + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Contract Number</label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              className="input"
              placeholder="e.g. 001/PLN/2024"
              disabled={createMutation.isPending}
            />
          </div>

          <div>
            <label className="label">Contract Signing Date</label>
            <input
              type="date"
              value={contractSigningDate}
              onChange={(e) => setContractSigningDate(e.target.value)}
              className="input"
              disabled={createMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Project Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="input"
                disabled={createMutation.isPending}
              />
            </div>
            <div>
              <label className="label">Project End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label className="label">Duration (Days)</label>
            <input
              type="text"
              value={durationDays !== null ? `${durationDays} days` : '—'}
              className="input bg-gray-50 text-gray-500 cursor-not-allowed"
              readOnly
              disabled
            />
            {durationDays === null && effectiveDate && endDate && (
              <p className="text-xs text-red-500 mt-1">End date must be after effective date.</p>
            )}
          </div>

          <div>
            <label className="label">Warranty Period (Days)</label>
            <input
              type="number"
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(e.target.value)}
              className="input"
              min="0"
              disabled={createMutation.isPending}
            />
          </div>

          {/* Nominal values */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Nominal Values</label>
              <button
                type="button"
                onClick={handleAddNominal}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Currency
              </button>
            </div>
            <div className="space-y-2">
              {nominalValues.map((nv, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nv.currency}
                    onChange={(e) => handleNominalChange(index, 'currency', e.target.value)}
                    className="input w-24 flex-shrink-0"
                    placeholder="IDR"
                    disabled={createMutation.isPending}
                  />
                  <input
                    type="number"
                    value={nv.amount}
                    onChange={(e) => handleNominalChange(index, 'amount', e.target.value)}
                    className="input flex-1"
                    placeholder="Amount"
                    min="0"
                    disabled={createMutation.isPending}
                  />
                  {nominalValues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNominal(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary" disabled={createMutation.isPending}>
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
              {createMutation.isPending ? <LoadingSpinner size="sm" /> : null}
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
