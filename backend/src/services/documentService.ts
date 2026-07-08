import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { DocumentSection, ReviewStatus } from '@prisma/client';
import { storeDocumentFile } from './fileStorageService';
import { submitForReview } from './reviewService';

// ─── Input Interfaces ─────────────────────────────────────────────────────────

interface CreateDocumentInput {
  boq_item_id: string;
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

    return tx.document.findUnique({
      where: { id: doc.id },
      include: { files: true },
    });
  });

  // Immediately submit the freshly uploaded document for review, so it never
  // sits invisible to reviewers in a DRAFT state the vendor forgot to submit.
  await submitForReview(document!.id, uploaded_by);

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
    include: { boq_item: { select: { project_id: true } } },
  });

  if (!oldDoc) {
    throw new AppError('Document not found', 404);
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

    return tx.document.findUnique({
      where: { id: newDoc.id },
      include: { files: true },
    });
  });

  // Immediately submit the new revision for review, same as a first-time upload.
  await submitForReview(newDocument!.id, uploaded_by);

  return prisma.document.findUnique({
    where: { id: newDocument!.id },
    include: { files: true },
  });
}

// ─── List Documents ───────────────────────────────────────────────────────────

export async function listDocuments(boqItemId: string, section?: DocumentSection) {
  const documents = await prisma.document.findMany({
    where: {
      boq_item_id: boqItemId,
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
      boq_item_id: boqItemId,
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
