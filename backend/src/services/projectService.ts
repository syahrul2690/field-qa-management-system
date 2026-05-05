import { InstitutionType, ProjectType, ProjectUrgency } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

// ============================================================
// Data types
// ============================================================

export interface CreateProjectData {
  name: string;
  description?: string;
  contract_signing_date: Date;
  contract_effective_date: Date;
  duration_days: number;
  warranty_period_days: number;
  project_type: ProjectType;
  urgency: ProjectUrgency;
  nominal_values: Array<{ currency: string; amount: number }>;
}

export interface AmendmentData {
  amendment_reason: string;
  effective_date: Date;
  duration_days?: number;
  nominal_values?: Array<{ currency: string; amount: number }>;
}

// ============================================================
// Service functions
// ============================================================

export async function createProject(
  data: CreateProjectData,
  createdBy: string,
  ownerUnitId: string
) {
  // Validate ownerUnit exists and belongs to an OWNER institution
  const ownerUnit = await prisma.unit.findUnique({
    where: { id: ownerUnitId },
    include: { institution: true },
  });

  if (!ownerUnit) {
    throw new AppError('Owner unit not found', 404);
  }

  if (ownerUnit.institution.type !== InstitutionType.OWNER) {
    throw new AppError('Owner unit must belong to an OWNER institution', 400);
  }

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      contract_signing_date: data.contract_signing_date,
      contract_effective_date: data.contract_effective_date,
      duration_days: data.duration_days,
      warranty_period_days: data.warranty_period_days,
      project_type: data.project_type,
      urgency: data.urgency,
      nominal_values: data.nominal_values,
      owner_unit_id: ownerUnitId,
      created_by: createdBy,
    },
  });
}

export async function listProjects(filters: {
  ownerUnitId?: string;
  vendorInstitutionId?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters.ownerUnitId) {
    where['owner_unit_id'] = filters.ownerUnitId;
  }

  if (filters.vendorInstitutionId) {
    where['vendor_visibility'] = {
      some: { vendor_institution_id: filters.vendorInstitutionId },
    };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner_unit: {
        include: {
          institution: { select: { id: true, name: true } },
        },
      },
      creator: { select: { id: true, name: true } },
      _count: { select: { amendments: true, boq_items: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  // Fetch document details grouped by status for all projects in one query
  const projectIds = projects.map((p) => p.id);
  type DocEntry = { id: string; title: string; doc_number: string; section: string };
  const docSummaryMap: Record<string, Record<string, DocEntry[]>> = {};

  if (projectIds.length > 0) {
    const boqItems = await prisma.boqItem.findMany({
      where: { project_id: { in: projectIds } },
      select: {
        project_id: true,
        documents: {
          where: { is_current: true },
          select: { id: true, title: true, doc_number: true, section: true, status: true },
          orderBy: { doc_number: 'asc' },
        },
      },
    });

    for (const item of boqItems) {
      if (!docSummaryMap[item.project_id]) docSummaryMap[item.project_id] = {};
      for (const doc of item.documents) {
        if (!docSummaryMap[item.project_id][doc.status]) {
          docSummaryMap[item.project_id][doc.status] = [];
        }
        docSummaryMap[item.project_id][doc.status].push({
          id: doc.id,
          title: doc.title,
          doc_number: doc.doc_number,
          section: doc.section,
        });
      }
    }
  }

  return projects.map((p) => ({
    ...p,
    amendment_count: p._count.amendments,
    boq_item_count: p._count.boq_items,
    doc_summary: docSummaryMap[p.id] ?? {},
  }));
}

export async function getProjectById(
  id: string,
  _requesterId: string,
  requesterInstitutionId: string,
  requesterInstitutionType: InstitutionType
) {
  if (requesterInstitutionType === InstitutionType.VENDOR) {
    const visibility = await prisma.projectVendorVisibility.findUnique({
      where: {
        project_id_vendor_institution_id: {
          project_id: id,
          vendor_institution_id: requesterInstitutionId,
        },
      },
    });

    if (!visibility) {
      throw new AppError('Access denied to this project', 403);
    }
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner_unit: {
        include: {
          institution: { select: { id: true, name: true } },
        },
      },
      creator: { select: { id: true, name: true } },
      amendments: { orderBy: { amendment_no: 'asc' } },
      vendor_visibility: {
        include: {
          vendor_institution: { select: { id: true, name: true, type: true } },
        },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    warranty_period_days?: number;
    project_type?: ProjectType;
    urgency?: ProjectUrgency;
  }
) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.warranty_period_days !== undefined && {
        warranty_period_days: data.warranty_period_days,
      }),
      ...(data.project_type !== undefined && { project_type: data.project_type }),
      ...(data.urgency !== undefined && { urgency: data.urgency }),
    },
  });
}

export async function createAmendment(
  projectId: string,
  data: AmendmentData,
  amendedBy: string
) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const existingCount = await tx.projectAmendment.count({
      where: { project_id: projectId },
    });
    const newAmendmentNo = existingCount + 1;

    const amendment = await tx.projectAmendment.create({
      data: {
        project_id: projectId,
        amendment_no: newAmendmentNo,
        amendment_reason: data.amendment_reason,
        effective_date: data.effective_date,
        amended_by: amendedBy,
        // Snapshot previous values (only set if the field is being changed)
        ...(data.duration_days !== undefined && {
          previous_duration_days: project.duration_days,
        }),
        ...(data.nominal_values !== undefined && {
          previous_nominal_values: project.nominal_values as object,
        }),
        // New values (only set if provided)
        ...(data.duration_days !== undefined && { new_duration_days: data.duration_days }),
        ...(data.nominal_values !== undefined && { new_nominal_values: data.nominal_values }),
      },
    });

    // Update the project with new values
    await tx.project.update({
      where: { id: projectId },
      data: {
        ...(data.duration_days !== undefined && { duration_days: data.duration_days }),
        ...(data.nominal_values !== undefined && { nominal_values: data.nominal_values }),
      },
    });

    return amendment;
  });
}

export async function listAmendments(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return prisma.projectAmendment.findMany({
    where: { project_id: projectId },
    orderBy: { amendment_no: 'asc' },
  });
}

export async function assignVendor(
  projectId: string,
  vendorInstitutionId: string,
  assignedBy: string
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const vendorInstitution = await prisma.institution.findUnique({
    where: { id: vendorInstitutionId },
  });

  if (!vendorInstitution) {
    throw new AppError('Vendor institution not found', 404);
  }

  if (vendorInstitution.type !== InstitutionType.VENDOR) {
    throw new AppError('Institution must be of type VENDOR', 400);
  }

  return prisma.projectVendorVisibility.upsert({
    where: {
      project_id_vendor_institution_id: {
        project_id: projectId,
        vendor_institution_id: vendorInstitutionId,
      },
    },
    create: {
      project_id: projectId,
      vendor_institution_id: vendorInstitutionId,
      assigned_by: assignedBy,
    },
    update: {
      assigned_by: assignedBy,
      assigned_at: new Date(),
    },
  });
}

export async function removeVendor(projectId: string, vendorInstitutionId: string) {
  const visibility = await prisma.projectVendorVisibility.findUnique({
    where: {
      project_id_vendor_institution_id: {
        project_id: projectId,
        vendor_institution_id: vendorInstitutionId,
      },
    },
  });

  if (!visibility) {
    throw new AppError('Vendor assignment not found', 404);
  }

  return prisma.projectVendorVisibility.delete({
    where: {
      project_id_vendor_institution_id: {
        project_id: projectId,
        vendor_institution_id: vendorInstitutionId,
      },
    },
  });
}

// ── Dashboard aggregation ─────────────────────────────────────────────────────

export async function getDashboardData(filters: {
  ownerUnitId?: string;
  vendorInstitutionId?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.ownerUnitId) where['owner_unit_id'] = filters.ownerUnitId;
  if (filters.vendorInstitutionId) {
    where['vendor_visibility'] = {
      some: { vendor_institution_id: filters.vendorInstitutionId },
    };
  }

  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      name: true,
      project_type: true,
      urgency: true,
      contract_effective_date: true,
      duration_days: true,
      _count: { select: { boq_items: true } },
    },
    orderBy: [
      { urgency: 'desc' },  // KINERJA_KORPORAT first
      { contract_effective_date: 'asc' },
    ],
  });

  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) {
    return { summary: { total_projects: 0, total_docs: 0, remaining_docs: 0, overdue_reviews: 0, completion_rate: 0 }, projects: [] };
  }

  // Document status breakdown per project
  const boqItems = await prisma.boqItem.findMany({
    where: { project_id: { in: projectIds } },
    select: {
      project_id: true,
      documents: {
        where: { is_current: true },
        select: { id: true, status: true, title: true, doc_number: true, section: true },
      },
    },
  });

  type DocInfo = { id: string; status: string; title: string; doc_number: string; section: string };
  const docsByProject: Record<string, DocInfo[]> = {};
  for (const item of boqItems) {
    if (!docsByProject[item.project_id]) docsByProject[item.project_id] = [];
    for (const doc of item.documents) {
      docsByProject[item.project_id].push(doc as DocInfo);
    }
  }

  // Overdue reviews per project
  const now = new Date();
  const overdueReviews = await prisma.documentReview.findMany({
    where: {
      final_status: null,
      sla_deadline: { lt: now },
      document: { boq_item: { project_id: { in: projectIds } } },
    },
    select: {
      id: true,
      sla_deadline: true,
      reviewed_at: true,
      checked_at: true,
      approved_at: true,
      document: {
        select: {
          title: true,
          doc_number: true,
          section: true,
          boq_item: { select: { project_id: true } },
        },
      },
    },
  });

  // Group overdue reviews by project
  const overdueByProject: Record<string, typeof overdueReviews> = {};
  for (const r of overdueReviews) {
    const pid = r.document.boq_item.project_id;
    if (!overdueByProject[pid]) overdueByProject[pid] = [];
    overdueByProject[pid].push(r);
  }

  const COMPLETE_STATUSES = new Set(['APPROVED_A', 'APPROVED_WITH_COMMENTS_B', 'REJECTED_C', 'SUPERSEDED']);
  const PENDING_STATUSES  = new Set(['DRAFT', 'SUBMITTED', 'IN_REVIEW']);

  const stageLabel = (r: { reviewed_at: Date | null; checked_at: Date | null }) => {
    if (!r.reviewed_at) return 'Waiting for Reviewer';
    if (!r.checked_at) return 'Waiting for Checker';
    return 'Waiting for Approver';
  };

  // Build per-project result
  const projectResults = projects.map((p) => {
    const docs = docsByProject[p.id] ?? [];
    const statusMap: Record<string, number> = {};
    for (const d of docs) statusMap[d.status] = (statusMap[d.status] ?? 0) + 1;

    const totalDocs     = docs.length;
    const completedDocs = docs.filter((d) => COMPLETE_STATUSES.has(d.status)).length;
    const remainingDocs = docs.filter((d) => PENDING_STATUSES.has(d.status)).length;
    const completionRate = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

    const endDate = new Date(p.contract_effective_date);
    endDate.setDate(endDate.getDate() + p.duration_days);

    const overdue = (overdueByProject[p.id] ?? []).map((r) => ({
      review_id: r.id,
      document_title: r.document.title,
      doc_number: r.document.doc_number,
      section: r.document.section,
      sla_deadline: r.sla_deadline,
      days_overdue: r.sla_deadline
        ? Math.ceil((now.getTime() - new Date(r.sla_deadline).getTime()) / 86_400_000)
        : 0,
      stage: stageLabel(r),
    }));

    return {
      id: p.id,
      name: p.name,
      project_type: p.project_type,
      urgency: p.urgency,
      contract_effective_date: p.contract_effective_date,
      end_date: endDate,
      total_docs: totalDocs,
      completed_docs: completedDocs,
      remaining_docs: remainingDocs,
      completion_rate: completionRate,
      doc_summary: statusMap,
      overdue_reviews: overdue,
    };
  });

  // Average review duration: from vendor submission (review.created_at) to AMS letter upload
  // Only count AMS letters for the *current* document revision (is_current: true) so that
  // superseded revisions that also have AMS letters are not double-counted.
  const amsLetters = await prisma.amsLetter.findMany({
    where: {
      review: {
        document: { is_current: true, boq_item: { project_id: { in: projectIds } } },
      },
    },
    select: {
      created_at: true,
      review: {
        select: {
          created_at: true,
          document: { select: { boq_item: { select: { project_id: true } } } },
        },
      },
    },
  });

  // Global average duration in days
  const durations = amsLetters.map((a) => {
    const submittedAt = new Date(a.review.created_at).getTime();
    const releasedAt  = new Date(a.created_at).getTime();
    return Math.max(0, (releasedAt - submittedAt) / 86_400_000);
  });
  const avgDurationDays = durations.length > 0
    ? Math.round((durations.reduce((s, d) => s + d, 0) / durations.length) * 10) / 10
    : null;
  const minDurationDays = durations.length > 0 ? Math.round(Math.min(...durations) * 10) / 10 : null;
  const maxDurationDays = durations.length > 0 ? Math.round(Math.max(...durations) * 10) / 10 : null;

  // Monthly breakdown: group AMS letters by year-month of release date
  const monthlyMap: Record<string, number[]> = {};
  for (const a of amsLetters) {
    const d = new Date(a.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[key]) monthlyMap[key] = [];
    const days = Math.max(0, (new Date(a.created_at).getTime() - new Date(a.review.created_at).getTime()) / 86_400_000);
    monthlyMap[key].push(days);
  }
  const monthly_duration = Object.entries(monthlyMap)
    .map(([month, vals]) => ({
      month,
      avg_days: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
      count: vals.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Per-project average duration
  const durationByProject: Record<string, number[]> = {};
  for (const a of amsLetters) {
    const pid = a.review.document.boq_item.project_id;
    const days = Math.max(0, (new Date(a.created_at).getTime() - new Date(a.review.created_at).getTime()) / 86_400_000);
    if (!durationByProject[pid]) durationByProject[pid] = [];
    durationByProject[pid].push(days);
  }

  const projectResultsWithDuration = projectResults.map((p) => {
    const dList = durationByProject[p.id] ?? [];
    const avg = dList.length > 0 ? Math.round((dList.reduce((s, d) => s + d, 0) / dList.length) * 10) / 10 : null;
    return { ...p, avg_review_duration_days: avg, ams_count: dList.length };
  });

  // Global summary
  const totalDocs     = projectResults.reduce((s, p) => s + p.total_docs, 0);
  const remainingDocs = projectResults.reduce((s, p) => s + p.remaining_docs, 0);
  const completedDocs = projectResults.reduce((s, p) => s + p.completed_docs, 0);

  return {
    summary: {
      total_projects: projects.length,
      total_docs: totalDocs,
      remaining_docs: remainingDocs,
      overdue_reviews: overdueReviews.length,
      completion_rate: totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0,
      avg_review_duration_days: avgDurationDays,
      min_review_duration_days: minDurationDays,
      max_review_duration_days: maxDurationDays,
      total_ams_released: amsLetters.length,
      monthly_duration,
    },
    projects: projectResultsWithDuration,
  };
}

// ── getApprovedDocumentsByProject ─────────────────────────────────────────────

export async function getApprovedDocumentsByProject(projectId: string) {
  const boqItems = await prisma.boqItem.findMany({
    where: { project_id: projectId },
    select: {
      id: true,
      item_code: true,
      title: true,
      documents: {
        where: {
          is_current: true,
          status: { in: ['APPROVED_A', 'APPROVED_WITH_COMMENTS_B', 'REJECTED_C'] },
        },
        select: {
          id: true,
          doc_number: true,
          title: true,
          section: true,
          revision_no: true,
          status: true,
          created_at: true,
          updated_at: true,
          files: {
            select: { id: true, file_name: true, file_path: true, file_size: true, mime_type: true },
          },
          reviews: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id: true,
              final_status: true,
              approved_at: true,
              approver: { select: { id: true, name: true } },
              ams_letter: {
                select: { id: true, file_name: true, file_path: true, created_at: true },
              },
            },
          },
        },
        orderBy: { doc_number: 'asc' },
      },
    },
    orderBy: { item_code: 'asc' },
  });

  // Flatten into a list of docs with boq_item context
  const docs = boqItems.flatMap((item) =>
    item.documents.map((doc) => ({
      ...doc,
      boq_item_id: item.id,
      boq_item_code: item.item_code,
      boq_item_title: item.title,
      latest_review: doc.reviews[0] ?? null,
    })),
  );

  return docs;
}
