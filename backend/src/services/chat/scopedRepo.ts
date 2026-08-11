import { Prisma, DocumentSection, ReviewStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { isOverdue, getCurrentStage } from '../slaService';
import {
  ScopeUser,
  buildProjectScopeWhere,
  buildDocumentScopeWhere,
} from '../accessScopeService';
import { sanitizeUntrusted, LIMITS } from './sanitize';

/**
 * The only module beneath services/chat that touches Prisma.
 *
 * Tool handlers receive a ScopedRepo rather than the client, so a tool cannot
 * issue an unscoped query even by accident. That invariant is enforced
 * mechanically by src/__tests__/chatScopeBoundary.test.ts.
 *
 * Two rules hold throughout:
 *
 *  1. No findUnique. It cannot express a relation filter, which makes it the
 *     one call shape where scope can silently vanish. Single-record reads use
 *     findFirst with the scope ANDed in.
 *
 *  2. Rows the caller may not see are reported as NOT_FOUND, worded exactly as
 *     for a row that does not exist. Distinguishing the two would let a caller
 *     probe for the existence of other institutions' records.
 */

export const NOT_FOUND = {
  error: 'NOT_FOUND' as const,
  message: 'No such record, or it is outside the data you have access to.',
};

export type NotFound = typeof NOT_FOUND;

export function isNotFound(value: unknown): value is NotFound {
  return typeof value === 'object' && value !== null && (value as NotFound).error === 'NOT_FOUND';
}

function clamp(n: number | undefined, fallback: number, max: number): number {
  if (!n || Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(Math.floor(n), max));
}

function endDate(effective: Date | null, durationDays: number | null): string | null {
  if (!effective || !durationDays) return null;
  const d = new Date(effective);
  d.setDate(d.getDate() + durationDays);
  return d.toISOString();
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function createScopedRepo(user: ScopeUser) {
  const projectWhere = buildProjectScopeWhere(user);
  const documentWhere = buildDocumentScopeWhere(user);

  /** Resolves a project id the caller is allowed to see, or null. */
  async function assertProject(projectId: string) {
    return prisma.project.findFirst({
      where: { AND: [{ id: projectId }, projectWhere] },
      select: { id: true, name: true },
    });
  }

  return {
    async listProjects(args: { query?: string; limit?: number }) {
      const take = clamp(args.limit, 20, 50);
      const where: Prisma.ProjectWhereInput = {
        AND: [
          projectWhere,
          ...(args.query ? [{ name: { contains: args.query, mode: 'insensitive' as const } }] : []),
        ],
      };

      const [total, rows] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          take,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            project_type: true,
            urgency: true,
            contract_effective_date: true,
            duration_days: true,
            owner_unit: { select: { name: true, institution: { select: { name: true } } } },
            _count: { select: { boq_items: true } },
          },
        }),
      ]);

      return {
        total,
        truncated: total > rows.length,
        projects: rows.map((p) => ({
          id: p.id,
          name: sanitizeUntrusted(p.name, LIMITS.title),
          project_type: p.project_type,
          urgency: p.urgency,
          contract_effective_date: p.contract_effective_date?.toISOString() ?? null,
          end_date: endDate(p.contract_effective_date, p.duration_days),
          boq_item_count: p._count.boq_items,
          owner_unit: p.owner_unit?.name ?? null,
          owner_institution: p.owner_unit?.institution?.name ?? null,
        })),
      };
    },

    async getProjectStats(projectId: string) {
      const project = await prisma.project.findFirst({
        where: { AND: [{ id: projectId }, projectWhere] },
        select: {
          id: true,
          name: true,
          description: true,
          project_type: true,
          urgency: true,
          contract_effective_date: true,
          duration_days: true,
          owner_unit: { select: { name: true, institution: { select: { name: true } } } },
          _count: { select: { amendments: true, boq_items: true } },
        },
      });
      if (!project) return NOT_FOUND;

      const documents = await prisma.document.findMany({
        where: { boq_item: { project_id: projectId }, is_current: true },
        select: {
          id: true,
          doc_number: true,
          title: true,
          section: true,
          status: true,
          reviews: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              sla_deadline: true,
              final_status: true,
              reviewed_at: true,
              checked_at: true,
              approved_at: true,
              created_at: true,
            },
          },
        },
      });

      const byStatus: Record<string, number> = {};
      const bySection: Record<string, { total: number; completed: number; in_progress: number }> =
        {};
      const outstanding: Array<Record<string, unknown>> = [];
      let overdue = 0;
      const durations: number[] = [];

      for (const doc of documents) {
        byStatus[doc.status] = (byStatus[doc.status] ?? 0) + 1;

        const sec = (bySection[doc.section] ??= { total: 0, completed: 0, in_progress: 0 });
        sec.total += 1;
        const done =
          doc.status === ReviewStatus.APPROVED_A ||
          doc.status === ReviewStatus.APPROVED_WITH_COMMENTS_B;
        if (done) sec.completed += 1;
        else sec.in_progress += 1;

        const review = doc.reviews[0];
        if (!review) continue;

        if (review.approved_at) {
          durations.push(daysBetween(review.created_at, review.approved_at));
        }
        if (isOverdue(review.sla_deadline, review.final_status)) {
          overdue += 1;
          if (outstanding.length < 10) {
            outstanding.push({
              doc_number: doc.doc_number,
              title: sanitizeUntrusted(doc.title, LIMITS.title),
              section: doc.section,
              stage: getCurrentStage(review.reviewed_at, review.checked_at, review.approved_at),
              sla_deadline: review.sla_deadline?.toISOString() ?? null,
              days_overdue: review.sla_deadline
                ? daysBetween(review.sla_deadline, new Date())
                : null,
            });
          }
        }
      }

      const completed = Object.entries(byStatus)
        .filter(([s]) => s === 'APPROVED_A' || s === 'APPROVED_WITH_COMMENTS_B')
        .reduce((n, [, c]) => n + c, 0);

      return {
        id: project.id,
        name: sanitizeUntrusted(project.name, LIMITS.title),
        description: sanitizeUntrusted(project.description, LIMITS.description),
        project_type: project.project_type,
        urgency: project.urgency,
        contract_effective_date: project.contract_effective_date?.toISOString() ?? null,
        end_date: endDate(project.contract_effective_date, project.duration_days),
        boq_item_count: project._count.boq_items,
        amendment_count: project._count.amendments,
        owner_unit: project.owner_unit?.name ?? null,
        total_documents: documents.length,
        completion_percentage:
          documents.length === 0 ? 0 : Math.round((completed / documents.length) * 100),
        documents_by_status: byStatus,
        documents_by_section: bySection,
        overdue_review_count: overdue,
        avg_review_duration_days:
          durations.length === 0
            ? null
            : Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10,
        outstanding_items: outstanding,
      };
    },

    async searchDocuments(args: {
      project_id?: string;
      query?: string;
      section?: DocumentSection;
      status?: ReviewStatus;
      current_only?: boolean;
      limit?: number;
    }) {
      const take = clamp(args.limit, 20, 50);

      if (args.project_id && !(await assertProject(args.project_id))) return NOT_FOUND;

      const filters: Prisma.DocumentWhereInput[] = [documentWhere];
      if (args.project_id) filters.push({ boq_item: { project_id: args.project_id } });
      if (args.section) filters.push({ section: args.section });
      if (args.status) filters.push({ status: args.status });
      if (args.current_only !== false) filters.push({ is_current: true });
      if (args.query) {
        filters.push({
          OR: [
            { doc_number: { contains: args.query, mode: 'insensitive' } },
            { title: { contains: args.query, mode: 'insensitive' } },
          ],
        });
      }

      const where: Prisma.DocumentWhereInput = { AND: filters };
      const [total, rows] = await Promise.all([
        prisma.document.count({ where }),
        prisma.document.findMany({
          where,
          take,
          orderBy: { updated_at: 'desc' },
          select: {
            id: true,
            doc_number: true,
            title: true,
            section: true,
            status: true,
            revision_no: true,
            updated_at: true,
            boq_item: {
              select: {
                id: true,
                item_code: true,
                title: true,
                project: { select: { id: true, name: true } },
              },
            },
          },
        }),
      ]);

      return {
        total,
        truncated: total > rows.length,
        documents: rows.map((d) => ({
          id: d.id,
          doc_number: d.doc_number,
          title: sanitizeUntrusted(d.title, LIMITS.title),
          section: d.section,
          status: d.status,
          revision_no: d.revision_no,
          updated_at: d.updated_at.toISOString(),
          boq_item_code: d.boq_item?.item_code ?? null,
          boq_item_title: sanitizeUntrusted(d.boq_item?.title ?? null, LIMITS.title),
          project_id: d.boq_item?.project?.id ?? null,
          project_name: sanitizeUntrusted(d.boq_item?.project?.name ?? null, LIMITS.title),
        })),
      };
    },

    async getDocumentWorkflow(args: { document_id?: string; doc_number?: string; project_id?: string }) {
      const identity: Prisma.DocumentWhereInput[] = [documentWhere];
      if (args.document_id) {
        identity.push({ id: args.document_id });
      } else {
        identity.push({ doc_number: args.doc_number }, { is_current: true });
        if (args.project_id) identity.push({ boq_item: { project_id: args.project_id } });
      }

      const doc = await prisma.document.findFirst({
        where: { AND: identity },
        orderBy: { revision_no: 'desc' },
        select: {
          id: true,
          doc_number: true,
          title: true,
          section: true,
          status: true,
          revision_no: true,
          is_current: true,
          created_at: true,
          boq_item: {
            select: {
              id: true,
              item_code: true,
              title: true,
              project: { select: { id: true, name: true } },
            },
          },
          reviews: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id: true,
              sla_deadline: true,
              reviewed_at: true,
              checked_at: true,
              approved_at: true,
              final_status: true,
              reviewer: { select: { name: true } },
              checker: { select: { name: true } },
              approver: { select: { name: true } },
              ams_letter: { select: { ams_number: true, ams_date: true } },
              _count: { select: { comments: true, comment_sheet_items: true } },
            },
          },
        },
      });
      if (!doc) return NOT_FOUND;

      const history = await prisma.document.findMany({
        where: {
          AND: [
            documentWhere,
            { doc_number: doc.doc_number, section: doc.section },
            { boq_item: { project_id: doc.boq_item?.project?.id } },
          ],
        },
        orderBy: { revision_no: 'desc' },
        take: 10,
        select: { revision_no: true, status: true, created_at: true },
      });

      const r = doc.reviews[0];

      return {
        id: doc.id,
        doc_number: doc.doc_number,
        title: sanitizeUntrusted(doc.title, LIMITS.title),
        section: doc.section,
        status: doc.status,
        revision_no: doc.revision_no,
        is_current: doc.is_current,
        project: doc.boq_item?.project
          ? {
              id: doc.boq_item.project.id,
              name: sanitizeUntrusted(doc.boq_item.project.name, LIMITS.title),
            }
          : null,
        boq_item: doc.boq_item
          ? {
              id: doc.boq_item.id,
              item_code: doc.boq_item.item_code,
              title: sanitizeUntrusted(doc.boq_item.title, LIMITS.title),
            }
          : null,
        workflow: r
          ? {
              review_id: r.id,
              current_stage: getCurrentStage(r.reviewed_at, r.checked_at, r.approved_at),
              // Names only. Emails and ids of other staff are not the
              // assistant's business.
              reviewer: r.reviewer?.name ?? null,
              checker: r.checker?.name ?? null,
              approver: r.approver?.name ?? null,
              reviewed_at: r.reviewed_at?.toISOString() ?? null,
              checked_at: r.checked_at?.toISOString() ?? null,
              approved_at: r.approved_at?.toISOString() ?? null,
              sla_deadline: r.sla_deadline?.toISOString() ?? null,
              is_overdue: isOverdue(r.sla_deadline, r.final_status),
              days_overdue:
                r.sla_deadline && isOverdue(r.sla_deadline, r.final_status)
                  ? daysBetween(r.sla_deadline, new Date())
                  : null,
              final_status: r.final_status,
              comment_count: r._count.comments,
              comment_sheet_item_count: r._count.comment_sheet_items,
              ams_letter: r.ams_letter
                ? {
                    present: true,
                    ams_number: r.ams_letter.ams_number,
                    ams_date: r.ams_letter.ams_date?.toISOString() ?? null,
                  }
                : { present: false },
            }
          : null,
        revision_history: history.map((h) => ({
          revision_no: h.revision_no,
          status: h.status,
          created_at: h.created_at.toISOString(),
        })),
      };
    },
  };
}

export type ScopedRepo = ReturnType<typeof createScopedRepo>;
