import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { projectApi } from '../../services/projectApi';
import { useUIStore } from '../../store/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

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

const formatDate = (d?: string) => {
  if (!d) return '—';
  try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
};

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.get(id!),
    enabled: !!id,
  });

  const project = projectData?.data?.data;

  const { data: candidateData } = useQuery({
    queryKey: ['project-consultant-pic-candidates', id],
    queryFn: () => projectApi.consultantPicCandidates(id!),
    enabled: !!id,
  });
  const consultantCandidates = candidateData?.data?.data ?? [];
  const consultantPics = project?.consultant_pics ?? [];
  const [consultantId, setConsultantId] = useState('');

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [description, setDescription] = useState('');
  const [warrantyDays, setWarrantyDays] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name ?? '');
      setProjectType(project.project_type ?? '');
      setUrgency(project.urgency ?? 'NORMAL');
      setDescription(project.description ?? '');
      setWarrantyDays(String(project.warranty_period_days ?? ''));
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data: unknown) => projectApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      addToast('success', 'Project updated successfully.');
      navigate(`/projects/${id}`);
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Failed to update project.');
    },
  });

  const assignPicMutation = useMutation({
    mutationFn: (userId: string) => projectApi.assignConsultantPic(id!, userId),
    onSuccess: () => {
      setConsultantId('');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project-consultant-pic-candidates', id] });
      addToast('success', 'Consultant PIC assigned to this project.');
    },
    onError: () => addToast('error', 'Failed to assign consultant PIC.'),
  });

  const removePicMutation = useMutation({
    mutationFn: (userId: string) => projectApi.removeConsultantPic(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project-consultant-pic-candidates', id] });
      addToast('success', 'Consultant PIC removed from this project.');
    },
    onError: () => addToast('error', 'Failed to remove consultant PIC.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !projectType) {
      setError('Project name and type are required.');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      project_type: projectType,
      urgency,
      description: description.trim() || undefined,
      warranty_period_days: parseInt(warrantyDays, 10) || 0,
    });
  };

  if (isLoading) {
    return <div className="py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (!project) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">Project not found.</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary mt-4">Back to Projects</button>
      </div>
    );
  }

  const endDate = project.contract_effective_date && project.duration_days
    ? addDays(new Date(project.contract_effective_date), project.duration_days).toISOString()
    : undefined;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-3"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-sm text-gray-500 mt-1">{project.name}</p>
      </div>

      {/* Read-only contract fields — changes require amendment */}
      <div className="card p-5 mb-5 bg-gray-50 border-dashed">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Contract Info — read only
        </p>
        <p className="text-xs text-gray-400 mb-4">
          To change contract dates or nominal values, use the Amendment feature on the project page.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Signing Date</p>
            <p className="font-medium text-gray-600">{formatDate(project.contract_signing_date)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Effective Date</p>
            <p className="font-medium text-gray-600">{formatDate(project.contract_effective_date)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">End Date</p>
            <p className="font-medium text-gray-600">{formatDate(endDate)}</p>
          </div>
          {project.nominal_values?.length > 0 && project.nominal_values.map(
            (nv: { currency: string; amount: number }, i: number) => (
              <div key={i}>
                <p className="text-gray-400 text-xs">Nominal ({nv.currency})</p>
                <p className="font-medium text-gray-600">{nv.amount.toLocaleString()}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Editable fields */}
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
              disabled={updateMutation.isPending}
            />
          </div>

          <div>
            <label className="label">Project Type <span className="text-red-500">*</span></label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="input"
              disabled={updateMutation.isPending}
            >
              <option value="">Select type...</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Project Urgency / Criticality</label>
            <div className="grid grid-cols-4 gap-2">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  disabled={updateMutation.isPending}
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
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Optional project description"
              disabled={updateMutation.isPending}
            />
          </div>

          <div>
            <label className="label">Warranty Period (Days)</label>
            <input
              type="number"
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(e.target.value)}
              className="input"
              min="0"
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              className="btn-secondary"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {updateMutation.isPending && <LoadingSpinner size="sm" />}
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6 mt-5">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Project Consultant PICs</h2>
          <p className="text-xs text-gray-500 mt-1">Only assigned consultant PICs can allocate review teams for this project.</p>
        </div>
        <div className="space-y-2 mb-4">
          {consultantPics.length === 0 ? (
            <p className="text-sm text-gray-400">No consultant PIC assigned yet.</p>
          ) : consultantPics.map((assignment: any) => (
            <div key={assignment.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{assignment.consultant?.name}</p>
                <p className="text-xs text-gray-400">{assignment.consultant?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => removePicMutation.mutate(assignment.consultant_id)}
                className="text-xs text-red-600 hover:text-red-700"
                disabled={removePicMutation.isPending}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={consultantId} onChange={(e) => setConsultantId(e.target.value)} className="input flex-1 min-w-[220px]">
            <option value="">Select approved PIC Consultant…</option>
            {consultantCandidates.map((candidate: any) => (
              <option key={candidate.id} value={candidate.id}>{candidate.name} — {candidate.email}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => consultantId && assignPicMutation.mutate(consultantId)}
            disabled={!consultantId || assignPicMutation.isPending}
            className="btn-primary"
          >
            {assignPicMutation.isPending ? 'Assigning…' : 'Assign PIC'}
          </button>
        </div>
      </div>
    </div>
  );
}
