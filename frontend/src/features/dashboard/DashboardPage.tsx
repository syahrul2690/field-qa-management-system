import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../services/projectApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverdueReview {
  review_id: string;
  document_title: string;
  doc_number: string;
  section: string;
  sla_deadline: string | null;
  days_overdue: number;
  stage: string;
}

interface ProjectRow {
  id: string;
  name: string;
  project_type: string;
  urgency: 'NORMAL' | 'RUPTL' | 'KERAWANAN_SISTEM' | 'KINERJA_KORPORAT';
  contract_effective_date: string;
  end_date: string;
  total_docs: number;
  completed_docs: number;
  remaining_docs: number;
  completion_rate: number;
  doc_summary: Record<string, number>;
  overdue_reviews: OverdueReview[];
  avg_review_duration_days: number | null;
  ams_count: number;
}

interface MonthlyDuration {
  month: string;       // "YYYY-MM"
  avg_days: number;
  count: number;
}

interface DashboardData {
  summary: {
    total_projects: number;
    total_docs: number;
    remaining_docs: number;
    overdue_reviews: number;
    completion_rate: number;
    avg_review_duration_days: number | null;
    min_review_duration_days: number | null;
    max_review_duration_days: number | null;
    total_ams_released: number;
    monthly_duration: MonthlyDuration[];
  };
  projects: ProjectRow[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_CONFIG = {
  KINERJA_KORPORAT: { label: 'Kinerja Korporat', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500',    bar: 'bg-green-500' },
  KERAWANAN_SISTEM: { label: 'Kerawanan Sistem', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500', bar: 'bg-green-500' },
  RUPTL:            { label: 'RUPTL',            bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300',   dot: 'bg-blue-500',   bar: 'bg-green-500' },
  NORMAL:           { label: 'Normal Priority',  bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-300',   dot: 'bg-gray-400',   bar: 'bg-green-500' },
};

const DOC_STATUS_CONFIG: Array<{ key: string; label: string; color: string; bg: string }> = [
  { key: 'APPROVED_A',                label: 'Approved A',     color: 'text-green-700',  bg: 'bg-green-100' },
  { key: 'APPROVED_WITH_COMMENTS_B',  label: 'Approved B',     color: 'text-teal-700',   bg: 'bg-teal-100'  },
  { key: 'REJECTED_C',                label: 'Revise & Resubmit', color: 'text-red-700',    bg: 'bg-red-100'   },
  { key: 'IN_REVIEW',                 label: 'In Review',      color: 'text-blue-700',   bg: 'bg-blue-100'  },
  { key: 'SUBMITTED',                 label: 'Submitted',      color: 'text-violet-700', bg: 'bg-violet-100'},
  { key: 'DRAFT',                     label: 'Draft',          color: 'text-gray-600',   bg: 'bg-gray-100'  },
  { key: 'SUPERSEDED',                label: 'Superseded',     color: 'text-gray-500',   bg: 'bg-gray-50'   },
];

const PROJECT_TYPE_LABEL: Record<string, string> = {
  GENERATION: 'Pembangkit', TRANSMISSION: 'Transmisi', SUBSTATION: 'Substation',
  DISTRIBUTION: 'Distribution', OTHER: 'Other',
};

const fmt = (d?: string) => {
  if (!d) return '—';
  try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: keyof typeof URGENCY_CONFIG }) {
  const cfg = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.NORMAL;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const TARGET_DAYS = 5;   // ≤5d on target · 6–7d need concern · >7d overrun


const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MonthlyDurationChart({ monthly }: { monthly: MonthlyDuration[] }) {
  const currentYear = new Date().getFullYear();

  // Index API data by "YYYY-MM" key
  const dataMap: Record<string, MonthlyDuration> = {};
  for (const m of monthly) dataMap[m.month] = m;

  // Fixed 12-slot scaffold: Jan–Dec of the current year
  const slots = MONTH_LABELS.map((label, i) => {
    const key = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    return { key, label, data: dataMap[key] ?? null };
  });

  const hasAnyData = slots.some((s) => s.data !== null);

  // Scale based only on months that have data; fallback to target so chart is non-empty
  const maxVal = hasAnyData
    ? Math.max(...slots.filter((s) => s.data).map((s) => s.data!.avg_days), TARGET_DAYS)
    : TARGET_DAYS;
  const maxScale = Math.ceil((maxVal * 1.25) / 5) * 5;
  const targetPct = (TARGET_DAYS / maxScale) * 100;
  const yLabels = [maxScale, Math.round(maxScale / 2), 0];

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Avg Review Duration — {currentYear}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
          <svg width="20" height="8" viewBox="0 0 20 8" className="flex-shrink-0">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          Target ≤{TARGET_DAYS}d
        </div>
      </div>

      {/* Chart */}
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-right" style={{ width: 28, height: 176 }}>
          {yLabels.map((v) => (
            <span key={v} className="text-[10px] text-gray-400 leading-none">{v}d</span>
          ))}
        </div>

        {/* Chart body */}
        <div className="flex-1 relative" style={{ height: 176 }}>
          {/* Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-gray-100" />
            <div className="border-t border-gray-100" />
            <div className="border-t border-gray-200" />
          </div>

          {/* Target line */}
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none"
            style={{ bottom: `${targetPct}%` }}
          >
            <svg width="100%" height="2" className="overflow-visible">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
            </svg>
          </div>

          {/* Bars */}
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-1 px-0.5">
            {slots.map(({ key, label, data: d }) => {
              const heightPct = d ? Math.min((d.avg_days / maxScale) * 100, 100) : 0;
              const barColor = !d
                ? null
                : d.avg_days <= TARGET_DAYS ? 'bg-green-500'   // ≤5d on target
                : d.avg_days <= 7           ? 'bg-yellow-500'  // 6–7d need concern
                :                             'bg-red-500';    // >7d overrun

              return (
                <div key={key} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 pointer-events-none shadow-lg">
                    <div className="font-semibold">{label} {currentYear}</div>
                    {d ? (
                      <>
                        <div>{d.avg_days}d avg · {d.count} AMS</div>
                        <div className={d.avg_days <= TARGET_DAYS ? 'text-green-400' : d.avg_days <= 7 ? 'text-yellow-400' : 'text-red-400'}>
                          {d.avg_days <= TARGET_DAYS ? 'On target' : d.avg_days <= 7 ? 'Need concern' : 'Overrun'}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400">No data</div>
                    )}
                  </div>

                  {/* Value label inside bar */}
                  {d && heightPct > 14 && (
                    <span
                      className="absolute text-[9px] font-bold text-white z-10 select-none"
                      style={{ bottom: `${heightPct}%`, marginBottom: 2 }}
                    >
                      {d.avg_days}d
                    </span>
                  )}

                  {/* Bar or empty-month stub */}
                  {d ? (
                    <div
                      className={`w-full rounded-t-sm transition-all ${barColor}`}
                      style={{ height: `${heightPct}%`, minHeight: 3 }}
                    />
                  ) : (
                    <div className="w-full rounded-t-sm border border-dashed border-gray-200" style={{ height: 4 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 mt-1.5 ml-9">
        {slots.map(({ key, label }) => (
          <div key={key} className="flex-1 text-center text-[10px] text-gray-400 truncate px-0.5">
            {label}
          </div>
        ))}
      </div>

      {/* Footer */}
      {!hasAnyData ? (
        <p className="text-[11px] text-gray-400 italic mt-3">
          No AMS letters uploaded yet. Duration is measured from vendor submission to AMS letter release.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-500 flex-shrink-0" />
            ≤{TARGET_DAYS}d — on target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500 flex-shrink-0" />
            6–7d — need concern
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500 flex-shrink-0" />
            &gt;7d — overrun
          </span>
        </div>
      )}
    </div>
  );
}

function OverdueList({ reviews }: { reviews: OverdueReview[] }) {
  if (reviews.length === 0) return null;
  return (
    <div className="mt-4 border-t border-red-100 pt-3">
      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        {reviews.length} Overdue Review{reviews.length > 1 ? 's' : ''}
      </p>
      <div className="space-y-1.5">
        {reviews.map((r) => (
          <div key={r.review_id} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-md px-2.5 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                <span className="text-gray-400 mr-1">{r.doc_number}</span>
                {r.document_title}
              </p>
              <p className="text-[11px] text-red-600 mt-0.5">
                <span className="font-semibold">{r.days_overdue}d overdue</span>
                {r.sla_deadline && <span className="text-gray-400 ml-1">· SLA {fmt(r.sla_deadline)}</span>}
                <span className="ml-1 text-gray-500">· {r.stage}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectRow }) {
  const navigate = useNavigate();
  const urgencyCfg = URGENCY_CONFIG[project.urgency] ?? URGENCY_CONFIG.NORMAL;
  const daysLeft = project.end_date
    ? differenceInDays(new Date(project.end_date), new Date())
    : null;

  const presentStatuses = DOC_STATUS_CONFIG.filter(
    (s) => (project.doc_summary[s.key] ?? 0) > 0
  );

  return (
    <div
      className={`card p-0 overflow-hidden border-l-4 cursor-pointer hover:shadow-md transition-shadow ${urgencyCfg.border}`}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-medium mb-0.5">
            {PROJECT_TYPE_LABEL[project.project_type] ?? project.project_type}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{project.name}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {fmt(project.contract_effective_date)} → {fmt(project.end_date)}
            {daysLeft !== null && (
              <span className={`ml-2 font-medium ${daysLeft < 0 ? 'text-red-600' : daysLeft < 30 ? 'text-orange-600' : 'text-gray-500'}`}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </span>
            )}
          </p>
        </div>
        <UrgencyBadge urgency={project.urgency} />
      </div>

      {/* Progress */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-gray-500">Document Completion</p>
          <p className="text-xs font-bold text-gray-700">{project.completion_rate}%</p>
        </div>
        <ProgressBar value={project.completion_rate} colorClass={urgencyCfg.bar} />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400">{project.completed_docs} of {project.total_docs} docs completed</p>
          {project.remaining_docs > 0 && (
            <p className="text-xs text-gray-400">{project.remaining_docs} remaining</p>
          )}
        </div>
      </div>

      {/* Document status breakdown */}
      {presentStatuses.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {presentStatuses.map((s) => (
            <span key={s.key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.color}`}>
              {s.label}
              <span className="font-bold">{project.doc_summary[s.key]}</span>
            </span>
          ))}
        </div>
      )}

      {/* Duration & AMS stats */}
      {project.ams_count > 0 && (
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 rounded px-2.5 py-1.5">
            <svg className="h-3 w-3 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Avg review cycle:</span>
            <span className={`font-bold ${
              (project.avg_review_duration_days ?? 0) <= 14 ? 'text-green-700'
              : (project.avg_review_duration_days ?? 0) <= 30 ? 'text-yellow-700'
              : 'text-red-700'
            }`}>
              {project.avg_review_duration_days}d
            </span>
            <span className="text-gray-400">·</span>
            <span>{project.ams_count} AMS released</span>
          </div>
        </div>
      )}

      {/* Overdue reviews */}
      {project.overdue_reviews.length > 0 && (
        <div className="px-5 pb-4">
          <OverdueList reviews={project.overdue_reviews} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => projectApi.dashboard(),
    refetchInterval: 60_000, // refresh every minute
  });

  const dashboard = data?.data?.data as DashboardData | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { summary, projects } = dashboard;

  // Separate by urgency for display (highest → lowest)
  const kinerjaProjects   = projects.filter((p) => p.urgency === 'KINERJA_KORPORAT');
  const kerawananProjects = projects.filter((p) => p.urgency === 'KERAWANAN_SISTEM');
  const ruptlProjects     = projects.filter((p) => p.urgency === 'RUPTL');
  const normalProjects    = projects.filter((p) => p.urgency === 'NORMAL');

  return (
    <div className="space-y-6 w-full">

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Projects"   value={summary.total_projects} />
        <StatCard label="Total Documents"  value={summary.total_docs} />
        <StatCard label="Remaining Docs"   value={summary.remaining_docs}
          sub="draft / submitted / in review"
          accent={summary.remaining_docs > 0 ? 'text-blue-700' : 'text-gray-900'} />
        <StatCard label="Overdue Reviews"  value={summary.overdue_reviews}
          accent={summary.overdue_reviews > 0 ? 'text-red-600' : 'text-gray-900'} />
        <StatCard label="Completion Rate"  value={`${summary.completion_rate}%`}
          accent={summary.completion_rate >= 80 ? 'text-green-600' : summary.completion_rate >= 50 ? 'text-yellow-600' : 'text-orange-600'}
          sub="across all projects" />
      </div>

      {/* Monthly review duration chart */}
      <MonthlyDurationChart monthly={summary.monthly_duration ?? []} />

      {/* Criticality legend */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Project Criticality</p>
        <div className="flex flex-wrap gap-3">
          {(['KINERJA_KORPORAT', 'KERAWANAN_SISTEM', 'RUPTL', 'NORMAL'] as const).map((u) => {
            const cfg = URGENCY_CONFIG[u];
            const count = projects.filter((p) => p.urgency === u).length;
            return (
              <div key={u} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                <span className={`text-xs font-bold ${cfg.text}`}>{count}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Urgency is set when creating a project and reflects its operational criticality.
          Kinerja Korporat and Kerawanan Sistem projects appear first.
        </p>
      </div>

      {/* Projects — sorted by criticality */}
      {projects.length === 0 && (
        <div className="card p-10 text-center text-gray-400 text-sm">
          No projects found.
        </div>
      )}

      {kinerjaProjects.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide">Kinerja Korporat</h2>
            <span className="text-xs text-gray-400">({kinerjaProjects.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {kinerjaProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {kerawananProjects.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide">Kerawanan Sistem</h2>
            <span className="text-xs text-gray-400">({kerawananProjects.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {kerawananProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {ruptlProjects.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">RUPTL</h2>
            <span className="text-xs text-gray-400">({ruptlProjects.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ruptlProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {normalProjects.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Normal Priority</h2>
            <span className="text-xs text-gray-400">({normalProjects.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {normalProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
