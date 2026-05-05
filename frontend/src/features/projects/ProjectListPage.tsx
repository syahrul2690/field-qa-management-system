import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { projectApi } from '../../services/projectApi';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface DocEntry {
  id: string;
  title: string;
  doc_number: string;
  section: string;
}

type DocSummary = Partial<Record<string, DocEntry[]>>;

interface Project {
  id: string;
  name: string;
  project_type: string;
  contract_effective_date?: string;
  duration_days?: number;
  amendment_count?: number;
  boq_item_count?: number;
  doc_summary?: DocSummary;
  owner_unit?: {
    name: string;
    institution?: { name: string };
  };
}

const STATUS_CONFIG: Array<{
  key: string;
  label: string;
  badgeCls: string;
  rowCls: string;
  dotCls: string;
}> = [
  { key: 'IN_REVIEW',                label: 'In Review',      badgeCls: 'bg-amber-100 text-amber-700',  rowCls: 'bg-amber-50',  dotCls: 'bg-amber-500'  },
  { key: 'SUBMITTED',                label: 'Submitted',      badgeCls: 'bg-blue-100 text-blue-700',    rowCls: 'bg-blue-50',   dotCls: 'bg-blue-500'   },
  { key: 'REJECTED_C',               label: 'Revise & Resubmit', badgeCls: 'bg-red-100 text-red-700',      rowCls: 'bg-red-50',    dotCls: 'bg-red-500'    },
  { key: 'APPROVED_WITH_COMMENTS_B', label: 'Approved B',     badgeCls: 'bg-teal-100 text-teal-700',    rowCls: 'bg-teal-50',   dotCls: 'bg-teal-500'   },
  { key: 'APPROVED_A',               label: 'Approved',       badgeCls: 'bg-green-100 text-green-700',  rowCls: 'bg-green-50',  dotCls: 'bg-green-500'  },
  { key: 'DRAFT',                    label: 'Draft',          badgeCls: 'bg-gray-100 text-gray-600',    rowCls: 'bg-gray-50',   dotCls: 'bg-gray-400'   },
  { key: 'SUPERSEDED',               label: 'Superseded',     badgeCls: 'bg-gray-100 text-gray-400',    rowCls: 'bg-gray-50',   dotCls: 'bg-gray-300'   },
];

const SECTION_LABEL: Record<string, string> = {
  FIELD_ITP: 'Field ITP',
  PROCEDURE: 'Procedure',
  WORK_METHOD: 'Work Method',
};

const formatDate = (d?: string) => {
  if (!d) return '—';
  try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
};

export function ProjectListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.list(),
  });

  const projects: Project[] = data?.data?.data ?? [];
  const canCreate = user?.role === 'PIC_PROJECT' || user?.role === 'ADMIN';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">All field QA projects.</p>
        </div>
        {canCreate && (
          <button onClick={() => navigate('/projects/new')} className="btn-primary flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {isLoading && <div className="py-12"><LoadingSpinner size="lg" /></div>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
          Failed to load projects.
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          <p className="text-gray-500">No projects yet.</p>
          {canCreate && (
            <button onClick={() => navigate('/projects/new')} className="btn-primary mt-4">
              Create your first project
            </button>
          )}
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((project) => {
            const summary = project.doc_summary ?? {};
            const totalDocs = Object.values(summary).reduce((acc, docs) => acc + (docs?.length ?? 0), 0);
            const needsAction = (summary['SUBMITTED']?.length ?? 0) + (summary['IN_REVIEW']?.length ?? 0);
            const endDate = project.contract_effective_date && project.duration_days
              ? addDays(new Date(project.contract_effective_date), project.duration_days).toISOString()
              : undefined;

            // Only show status groups that have documents
            const activeGroups = STATUS_CONFIG.filter(s => (summary[s.key]?.length ?? 0) > 0);

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="card cursor-pointer hover:border-primary-300 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                        {project.project_type}
                      </span>
                      {needsAction > 0 && (
                        <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          {needsAction} doc{needsAction > 1 ? 's' : ''} need action
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 leading-snug">{project.name}</h3>
                    {project.owner_unit && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {project.owner_unit.institution?.name ?? project.owner_unit.name}
                        {project.owner_unit.institution && ` — ${project.owner_unit.name}`}
                      </p>
                    )}
                  </div>
                  <svg className="h-5 w-5 text-gray-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Document status detail */}
                <div className="border-t border-gray-100">
                  <div className="px-5 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Documents
                    </span>
                    <span className="text-xs text-gray-400">{totalDocs} total</span>
                  </div>

                  {totalDocs === 0 ? (
                    <div className="px-5 pb-3 text-xs text-gray-400 italic">No documents uploaded yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {activeGroups.map(({ key, label, badgeCls, rowCls, dotCls }) => {
                        const docs = summary[key] ?? [];
                        return (
                          <div key={key} className={`px-5 py-2.5 ${rowCls}`}>
                            {/* Status group header */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}>
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotCls}`}></span>
                                {label}
                                <span className="font-bold ml-0.5">({docs.length})</span>
                              </span>
                            </div>
                            {/* Document list */}
                            <div className="space-y-1 pl-1">
                              {docs.map((doc) => (
                                <div key={doc.id} className="flex items-baseline gap-2">
                                  <span className="text-xs font-mono text-gray-400 flex-shrink-0">{doc.doc_number}</span>
                                  <span className="text-xs text-gray-700 leading-tight">{doc.title}</span>
                                  <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                                    {SECTION_LABEL[doc.section] ?? doc.section}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer: dates + stats */}
                <div className="px-5 py-2.5 border-t border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 bg-gray-50">
                  <div>
                    <span>Effective: </span>
                    <span className="font-medium text-gray-700">{formatDate(project.contract_effective_date)}</span>
                  </div>
                  <div>
                    <span>End: </span>
                    <span className="font-medium text-gray-700">{formatDate(endDate)}</span>
                  </div>
                  {project.boq_item_count !== undefined && (
                    <div>
                      <span>BOQ Items: </span>
                      <span className="font-medium text-gray-700">{project.boq_item_count}</span>
                    </div>
                  )}
                  {!!project.amendment_count && project.amendment_count > 0 && (
                    <div>
                      <span>Amendments: </span>
                      <span className="font-medium text-gray-700">{project.amendment_count}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
