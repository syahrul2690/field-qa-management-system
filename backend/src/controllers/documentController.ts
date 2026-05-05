import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { DocumentSection } from '@prisma/client';
import * as documentService from '../services/documentService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidDocumentSection(value: string): value is DocumentSection {
  return Object.values(DocumentSection).includes(value as DocumentSection);
}

// ─── POST /api/documents ──────────────────────────────────────────────────────

/**
 * Upload a new document (VENDOR role + VENDOR institution required).
 * Expects multipart/form-data with:
 *   - boq_item_id, section, doc_number, title, surat_pengantar_no? (body)
 *   - files[] (PDFs)
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const { boq_item_id, section, doc_number, title, surat_pengantar_no } = req.body as {
    boq_item_id?: string;
    section?: string;
    doc_number?: string;
    title?: string;
    surat_pengantar_no?: string;
  };

  // Validate required fields
  if (!boq_item_id) throw new AppError('boq_item_id is required', 400);
  if (!section) throw new AppError('section is required', 400);
  if (!doc_number) throw new AppError('doc_number is required', 400);
  if (!title) throw new AppError('title is required', 400);

  // Validate section enum
  if (!isValidDocumentSection(section)) {
    throw new AppError(
      `Invalid section. Must be one of: ${Object.values(DocumentSection).join(', ')}`,
      400,
    );
  }

  const files = (req.files as Express.Multer.File[]) ?? [];

  const document = await documentService.createDocument(
    {
      boq_item_id,
      section,
      doc_number,
      title,
      surat_pengantar_no,
      uploaded_by: req.user!.id,
    },
    files,
  );

  res.status(201).json({ success: true, data: document });
});

// ─── POST /api/documents/:documentId/revisions ────────────────────────────────

/**
 * Create a new revision of an existing document (VENDOR role required).
 * Expects same multipart/form-data as uploadDocument.
 */
export const createRevision = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;

  const { section, doc_number, title, surat_pengantar_no } = req.body as {
    section?: string;
    doc_number?: string;
    title?: string;
    surat_pengantar_no?: string;
  };

  // Validate required fields
  if (!section) throw new AppError('section is required', 400);
  if (!doc_number) throw new AppError('doc_number is required', 400);
  if (!title) throw new AppError('title is required', 400);

  // Validate section enum
  if (!isValidDocumentSection(section)) {
    throw new AppError(
      `Invalid section. Must be one of: ${Object.values(DocumentSection).join(', ')}`,
      400,
    );
  }

  const files = (req.files as Express.Multer.File[]) ?? [];

  const document = await documentService.createRevision(
    documentId,
    {
      section,
      doc_number,
      title,
      surat_pengantar_no,
      uploaded_by: req.user!.id,
    },
    files,
  );

  res.status(201).json({ success: true, data: document });
});

// ─── GET /api/documents?boq_item_id=&section= ────────────────────────────────

/**
 * List documents for a BoQ item, optionally filtered by section.
 * Requires authentication.
 */
export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { boq_item_id, section } = req.query as { boq_item_id?: string; section?: string };

  if (!boq_item_id) throw new AppError('boq_item_id query parameter is required', 400);

  let sectionFilter: DocumentSection | undefined;
  if (section) {
    if (!isValidDocumentSection(section)) {
      throw new AppError(
        `Invalid section. Must be one of: ${Object.values(DocumentSection).join(', ')}`,
        400,
      );
    }
    sectionFilter = section;
  }

  const documents = await documentService.listDocuments(boq_item_id, sectionFilter);

  res.json({ success: true, data: documents });
});

// ─── GET /api/documents/:documentId ──────────────────────────────────────────

/**
 * Get a single document by ID.
 * Requires authentication.
 */
export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const document = await documentService.getDocument(documentId);

  res.json({ success: true, data: document });
});

// ─── GET /api/documents/history?boq_item_id=&section=&doc_number= ────────────

/**
 * Get the full version history of a document series.
 * Requires authentication.
 */
export const getDocumentHistory = asyncHandler(async (req: Request, res: Response) => {
  const { boq_item_id, section, doc_number } = req.query as {
    boq_item_id?: string;
    section?: string;
    doc_number?: string;
  };

  if (!boq_item_id) throw new AppError('boq_item_id query parameter is required', 400);
  if (!section) throw new AppError('section query parameter is required', 400);
  if (!doc_number) throw new AppError('doc_number query parameter is required', 400);

  if (!isValidDocumentSection(section)) {
    throw new AppError(
      `Invalid section. Must be one of: ${Object.values(DocumentSection).join(', ')}`,
      400,
    );
  }

  const history = await documentService.getDocumentHistory(boq_item_id, section, doc_number);

  res.json({ success: true, data: history });
});
