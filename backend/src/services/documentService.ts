import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import {
  DocumentSection,
  InstitutionType,
  ReviewStatus,
  Role,
  ItpCategory,
  InspectionLevel,
  ItpPhase,
} from '@prisma/client';
import { storeDocumentFile } from './fileStorageService';
import { buildDocumentScopeWhere, type ScopeUser } from './accessScopeService';

// ─── Input Interfaces ─────────────────────────────────────────────────────────

interface CreateDocumentInput {
  boq_item_id: string;
  boq_item_ids?: string[];
  section: DocumentSection;
  doc_number: string;
  title: string;
  surat_pengantar_no?: string;
  uploaded_by: string;
}

interface CreateRevisionInput {
  section: DocumentSection;
  doc_number: string;
  title: string;
  surat_pengantar_no?: string;
  uploaded_by: string;
}

type NormalizedItpItem = {
  seq_no: number;
  activity: string;
  acceptance_criteria?: string;
  reference_standard?: string;
  verifying_document?: string;
  sub_code?: InspectionLevel;
  pp_code?: InspectionLevel;
  pln_code?: InspectionLevel;
  phase?: ItpPhase;
  category: ItpCategory;
};

function normalizeItpItems(value: unknown): NormalizedItpItem[] {
  if (!Array.isArray(value)) throw new AppError('items must be an array', 400);
  const levels = new Set(Object.values(InspectionLevel));
  const phases = new Set(Object.values(ItpPhase));
  const categories = new Set(Object.values(ItpCategory));

  return value.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new AppError(`items[${index}] must be an object`, 400);
    }
    const item = raw as Record<string, unknown>;
    if (typeof item.activity !== 'string' || item.activity.trim().length === 0) {
      throw new AppError(`items[${index}].activity is required`, 400);
    }
    if (typeof item.category !== 'string' || !categories.has(item.category as ItpCategory)) {
      throw new AppError(`items[${index}].category is invalid`, 400);
    }
    for (const field of ['sub_code', 'pp_code', 'pln_code'] as const) {
      if (item[field] !== undefined && item[field] !== null && !levels.has(item[field] as InspectionLevel)) {
        throw new AppError(`items[${index}].${field} is invalid`, 400);
      }
    }
    if (item.phase !== undefined && item.phase !== null && !phases.has(item.phase as ItpPhase)) {
      throw new AppError(`items[${index}].phase is invalid`, 400);
    }
    const optionalText = (field: string) => {
      const v = item[field];
      if (v === undefined || v === null || v === '') return undefined;
      if (typeof v !== 'string') throw new AppError(`items[${index}].${field} must be a string`, 400);
      return v;
    };
    return {
      seq_no: index + 1,
      activity: item.activity.trim(),
      acceptance_criteria: optionalText('acceptance_criteria'),
      reference_standard: optionalText('reference_standard'),
      verifying_document: optionalText('verifying_document'),
      sub_code: (item.sub_code ?? undefined) as InspectionLevel | undefined,
      pp_code: (item.pp_code ?? undefined) as InspectionLevel | undefined,
      pln_code: (item.pln_code ?? undefined) as InspectionLevel | undefined,
      phase: (item.phase ?? undefined) as ItpPhase | undefined,
      category: item.category as ItpCategory,
    };
  });
}

export async function getItpItems(documentId: string, actor?: ScopeUser) {
  const document = actor
    ? await prisma.document.findFirst({
      where: { AND: [{ id: documentId }, buildDocumentScopeWhere(actor)] },
    })
    : await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) throw new AppError('Document not found', 404);

  return prisma.itpItem.findMany({
    where: { document_id: documentId },
    orderBy: { seq_no: 'asc' },
  });
}

export async function saveItpItems(
  documentId: string,
  actorId: string,
  actorRole: Role,
  items: unknown,
  actorInstitutionId?: string,
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { reviews: { where: { final_status: { not: null } }, take: 1 } },
  });
  if (!document) throw new AppError('Document not found', 404);

  if (actorRole !== Role.VENDOR) throw new AppError('Only Vendor can edit ITP items', 403);
  if (document.section !== DocumentSection.FIELD_ITP) {
    throw new AppError('Inspection Items can only be edited for FIELD_ITP documents', 400);
  }
  if (!document.is_current || document.status !== ReviewStatus.DRAFT) {
    throw new AppError('Vendor ITP editing is only available on the current document draft', 403);
  }
  if (document.reviews.length > 0) {
    throw new AppError('ITP items are locked — the document review has received a final status.', 403);
  }
  if (!actorInstitutionId || actorInstitutionId !== document.vendor_institution_id) {
    throw new AppError('You can only edit ITP items owned by your Vendor institution', 403);
  }

  const normalizedItems = normalizeItpItems(items);
  await prisma.$transaction(async (tx) => {
    await tx.itpItem.deleteMany({ where: { document_id: documentId } });
    if (normalizedItems.length > 0) {
      await tx.itpItem.createMany({
        data: normalizedItems.map((item) => ({
          document_id: documentId,
          seq_no: item.seq_no,
          activity: item.activity,
          acceptance_criteria: item.acceptance_criteria ?? null,
          reference_standard: item.reference_standard ?? null,
          verifying_document: item.verifying_document ?? null,
          sub_code: item.sub_code ?? null,
          pp_code: item.pp_code ?? null,
          pln_code: item.pln_code ?? null,
          phase: item.phase ?? 'FIELD',
          category: item.category,
        })),
      });
    }
  });

  return prisma.itpItem.findMany({
    where: { document_id: documentId },
    orderBy: { seq_no: 'asc' },
  });
}

async function resolveCoverageIds(primaryId: string, requestedIds?: string[]): Promise<string[]> {
  const ids = Array.from(new Set([primaryId, ...(requestedIds ?? [])].filter(Boolean)));
  const items = await prisma.boqItem.findMany({ where: { id: { in: ids } }, select: { id: true, project_id: true } });
  if (items.length !== ids.length) throw new AppError('One or more BoQ coverage items were not found', 404);
  const projectId = items[0]?.project_id;
  if (items.some((item) => item.project_id !== projectId)) {
    throw new AppError('All BoQ coverage items must belong to the same project', 400);
  }
  return ids;
}

// ─── Phase 1 Prerequisite Check ───────────────────────────────────────────────

/**
 * For WORK_METHOD documents, verify that the BoQ item already has:
 *  - At least one FIELD_ITP document that is APPROVED_A and is_current
 *  - At least one PROCEDURE document that is APPROVED_A and is_current
 */
export async function checkPhase1Prerequisites(boqItemId: string): Promise<void> {
  const [itpApproved, procedureApproved] = await Promise.all([
    prisma.document.findFirst({
      where: {
        boq_item_id: boqItemId,
        section: DocumentSection.FIELD_ITP,
        status: ReviewStatus.APPROVED_A,
        is_current: true,
      },
    }),
    prisma.document.findFirst({
      where: {
        boq_item_id: boqItemId,
        section: DocumentSection.PROCEDURE,
        status: ReviewStatus.APPROVED_A,
        is_current: true,
      },
    }),
  ]);

  if (!itpApproved || !procedureApproved) {
    throw new AppError(
      'Work Method requires approved ITP and Procedure documents (Status A).',
      400,
    );
  }
}

// ─── Create Document (initial upload) ────────────────────────────────────────

export async function createDocument(
  input: CreateDocumentInput,
  files: Express.Multer.File[],
) {
  const { boq_item_id, section, doc_number, title, surat_pengantar_no, uploaded_by } = input;
  const coverageIds = await resolveCoverageIds(boq_item_id, input.boq_item_ids);

  // Snapshot the uploader's institution on the document. Authorization for
  // later draft edits must use this immutable tenant value, not the current
  // project vendor assignment or the identity of the original uploader.
  const uploader = await prisma.user.findUnique({
    where: { id: uploaded_by },
    select: { institution_id: true, institution: { select: { type: true } } },
  });
  if (!uploader) throw new AppError('Uploader not found', 404);
  if (uploader.institution.type !== InstitutionType.VENDOR) {
    throw new AppError('Documents can only be uploaded by a Vendor institution', 403);
  }

  // 1. Verify BoQ item exists and retrieve project_id
  const boqItem = await prisma.boqItem.findUnique({
    where: { id: boq_item_id },
    select: { id: true, project_id: true },
  });

  if (!boqItem) {
    throw new AppError('BoQ item not found', 404);
  }

  // 2. Ensure no current document already exists for this combination
  const existing = await prisma.document.findFirst({
    where: { boq_item_id, section, doc_number, is_current: true },
  });

  if (existing) {
    throw new AppError('Document already exists. Use revision endpoint.', 409);
  }

  // 3. Special prerequisite check for WORK_METHOD section
  if (section === DocumentSection.WORK_METHOD) {
    await checkPhase1Prerequisites(boq_item_id);
  }

  // 4. Transactionally create document + store files + create file records
  const document = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.create({
      data: {
        boq_item_id,
        section,
        doc_number,
        title,
        surat_pengantar_no: surat_pengantar_no ?? null,
        uploaded_by,
        revision_no: 0,
        status: ReviewStatus.DRAFT,
        is_current: true,
        vendor_institution_id: uploader.institution_id,
      },
    });

    for (const file of files) {
      const stored = storeDocumentFile(file, boqItem.project_id, boq_item_id, doc_number, 0);

      await tx.documentFile.create({
        data: {
          document_id: doc.id,
          file_name: stored.file_name,
          file_path: stored.file_path,
          file_size: stored.file_size,
          mime_type: stored.mime_type,
        },
      });
    }

    await tx.documentBoqItem.createMany({
      data: coverageIds.map((boqItemId) => ({ document_id: doc.id, boq_item_id: boqItemId })),
    });

    return tx.document.findUnique({
      where: { id: doc.id },
      include: { files: true },
    });
  });

  // Field ITPs need a vendor preparation phase for Inspection Items. The
  // existing Procedure/Work Method workflow remains immediately submitted.
  if (section !== DocumentSection.FIELD_ITP) {
    const { submitForReview } = await import('./reviewService');
    await submitForReview(document!.id, uploaded_by);
  }

  return prisma.document.findUnique({
    where: { id: document!.id },
    include: { files: true },
  });
}

// ─── Create Revision ──────────────────────────────────────────────────────────

export async function createRevision(
  documentId: string,
  input: CreateRevisionInput,
  files: Express.Multer.File[],
) {
  const { section, doc_number, title, surat_pengantar_no, uploaded_by } = input;

  // 1. Find existing document
  const oldDoc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { boq_item: { select: { project_id: true } }, itp_items: true, boq_item_links: true },
  });

  if (!oldDoc) {
    throw new AppError('Document not found', 404);
  }

  const actor = await prisma.user.findUnique({
    where: { id: uploaded_by },
    select: { institution_id: true, institution: { select: { type: true } } },
  });
  if (!actor || actor.institution.type !== InstitutionType.VENDOR) {
    throw new AppError('Only a Vendor institution can create document revisions', 403);
  }
  if (actor.institution_id !== oldDoc.vendor_institution_id) {
    throw new AppError('You can only revise documents owned by your Vendor institution', 403);
  }

  // 2. Must be the current version
  if (!oldDoc.is_current) {
    throw new AppError('Document is not the current version', 400);
  }

  // 3. Must be in a revisable status
  const revisableStatuses: ReviewStatus[] = [
    ReviewStatus.APPROVED_WITH_COMMENTS_B,
    ReviewStatus.REJECTED_C,
  ];

  if (!revisableStatuses.includes(oldDoc.status)) {
    throw new AppError(
      'Document must be reviewed before revision. Only Status B or C documents can be revised.',
      400,
    );
  }

  const newRevisionNo = oldDoc.revision_no + 1;
  const projectId = oldDoc.boq_item.project_id;

  // 4. Transactionally supersede old + create new revision
  const newDocument = await prisma.$transaction(async (tx) => {
    // Mark old document as superseded and no longer current
    await tx.document.update({
      where: { id: oldDoc.id },
      data: { is_current: false, status: ReviewStatus.SUPERSEDED },
    });

    // Create new revision
    const newDoc = await tx.document.create({
      data: {
        boq_item_id: oldDoc.boq_item_id,
        section,
        doc_number,
        title,
        surat_pengantar_no: surat_pengantar_no ?? null,
        uploaded_by,
        revision_no: newRevisionNo,
        status: ReviewStatus.DRAFT,
        is_current: true,
        vendor_institution_id: oldDoc.vendor_institution_id,
      },
    });

    // Store files and create file records
    for (const file of files) {
      const stored = storeDocumentFile(
        file,
        projectId,
        oldDoc.boq_item_id,
        doc_number,
        newRevisionNo,
      );

      await tx.documentFile.create({
        data: {
          document_id: newDoc.id,
          file_name: stored.file_name,
          file_path: stored.file_path,
          file_size: stored.file_size,
          mime_type: stored.mime_type,
        },
      });
    }

    const inheritedCoverage = oldDoc.boq_item_links.length > 0
      ? oldDoc.boq_item_links.map((link) => link.boq_item_id)
      : [oldDoc.boq_item_id];
    await tx.documentBoqItem.createMany({
      data: inheritedCoverage.map((boqItemId) => ({ document_id: newDoc.id, boq_item_id: boqItemId })),
    });

    if (oldDoc.itp_items.length > 0) {
      await tx.itpItem.createMany({
        data: oldDoc.itp_items.map((item) => ({
          document_id: newDoc.id,
          seq_no: item.seq_no,
          activity: item.activity,
          acceptance_criteria: item.acceptance_criteria,
          reference_standard: item.reference_standard,
          verifying_document: item.verifying_document,
          sub_code: item.sub_code,
          pp_code: item.pp_code,
          pln_code: item.pln_code,
          phase: item.phase,
          category: item.category,
        })),
      });
    }

    return tx.document.findUnique({
      where: { id: newDoc.id },
      include: { files: true },
    });
  });

  // Revisions stay editable DRAFTs so vendors can update copied ITP rows and
  // submit only when the package is complete. SLA starts on explicit submit.
  return prisma.document.findUnique({
    where: { id: newDocument!.id },
    include: { files: true },
  });
}

// ─── List Documents ───────────────────────────────────────────────────────────

export async function listDocuments(boqItemId: string, section?: DocumentSection) {
  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { boq_item_id: boqItemId },
        { boq_item_links: { some: { boq_item_id: boqItemId } } },
      ],
      ...(section ? { section } : {}),
    },
    include: { files: true },
    orderBy: [{ section: 'asc' }, { revision_no: 'desc' }],
  });

  return documents;
}

// ─── Get Single Document ──────────────────────────────────────────────────────

export async function getDocument(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { files: true },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  return document;
}

// ─── Get Document Version History ────────────────────────────────────────────

export async function getDocumentHistory(
  boqItemId: string,
  section: DocumentSection,
  docNumber: string,
) {
  const history = await prisma.document.findMany({
    where: {
      OR: [
        { boq_item_id: boqItemId },
        { boq_item_links: { some: { boq_item_id: boqItemId } } },
      ],
      section,
      doc_number: docNumber,
    },
    include: {
      files: true,
      reviews: {
        include: {
          comments: {
            include: { commenter: { select: { id: true, name: true } } },
            orderBy: { created_at: 'asc' },
          },
          reviewer: { select: { id: true, name: true } },
          checker: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { revision_no: 'asc' },
  });

  return history;
}
