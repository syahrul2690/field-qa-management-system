import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { DocumentSection, Role } from '@prisma/client';
import * as documentService from '../services/documentService';
import { parseItpWorkbook } from '../utils/excelParser/itpSheetParser';

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
  const { boq_item_id, section, doc_number, title, surat_pengantar_no, boq_item_ids } = req.body as {
    boq_item_id?: string;
    boq_item_ids?: string | string[];
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
  const coverageIds = typeof boq_item_ids === 'string'
    ? (() => { try { return JSON.parse(boq_item_ids) as string[]; } catch { return [boq_item_ids]; } })()
    : boq_item_ids;

  const document = await documentService.createDocument(
    {
      boq_item_id,
      boq_item_ids: coverageIds,
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

// GET /api/documents/:documentId/itp-items
export const getItpItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await documentService.getItpItems(req.params.documentId, req.user);
  res.json({ success: true, data: items });
});

// PUT /api/documents/:documentId/itp-items — Vendor-only current FIELD_ITP draft
export const saveItpItems = asyncHandler(async (req: Request, res: Response) => {
  const { items = [] } = req.body;
  const result = await documentService.saveItpItems(
    req.params.documentId,
    req.user!.id,
    req.user!.role as Role,
    items,
    req.user!.institution_id,
  );
  res.json({ success: true, data: result });
});

// POST /api/documents/itp-items/parse-excel — parses only, writes nothing.
// The vendor reviews staged rows client-side and persists via PUT above.
export const parseItpExcel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded. Use field name "itp_file".', 400);
  }

  const result = await parseItpWorkbook(req.file.buffer);
  if (!result.success) {
    throw new AppError('ITP sheet validation failed', 422, true, result.errors);
  }

  res.json({
    success: true,
    message: `${result.rows.length} row(s) parsed.`,
    data: { rows: result.rows, count: result.rows.length },
  });
});

// GET /api/documents/itp-items/template
export const downloadItpTemplate = asyncHandler(async (_req: Request, res: Response) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Field QA Management System';
  const ws = wb.addWorksheet('ITP');

  ws.columns = [
    { header: 'No.', key: 'no', width: 6 },
    { header: 'Activity', key: 'activity', width: 40 },
    { header: 'Acceptance Criteria', key: 'acceptance_criteria', width: 30 },
    { header: 'Reference Standard', key: 'reference_standard', width: 20 },
    { header: 'Verifying Document', key: 'verifying_document', width: 20 },
    { header: 'Sub', key: 'sub', width: 8 },
    { header: 'PP', key: 'pp', width: 8 },
    { header: 'PLN', key: 'pln', width: 8 },
    { header: 'Phase', key: 'phase', width: 16 },
    { header: 'Category', key: 'category', width: 20 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  const exampleRows = [
    {
      no: 1, activity: 'Check torque on foundation bolts', acceptance_criteria: '150 Nm ± 5%',
      reference_standard: 'IEC 62271', verifying_document: 'Torque Test Report',
      sub: 'P', pp: 'W', pln: 'H', phase: 'Field', category: 'Mechanical',
    },
    {
      no: 2, activity: 'Insulation resistance test', acceptance_criteria: '> 1000 MΩ',
      reference_standard: 'IEEE 43', verifying_document: 'Megger Test Report',
      sub: 'P', pp: 'W', pln: 'W', phase: 'Field', category: 'Electrical',
    },
  ];
  for (const row of exampleRows) ws.addRow(row);

  // Dropdown validation on the enum columns, applied well beyond the example
  // rows so pasted/typed rows stay constrained too.
  const lastRow = 500;
  const applyList = (colLetter: string, values: string[]) => {
    for (let r = 2; r <= lastRow; r += 1) {
      ws.getCell(`${colLetter}${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${values.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Invalid value',
        error: `Must be one of: ${values.join(', ')}`,
      };
    }
  };
  applyList('F', ['H', 'W', 'SW', 'R', 'A', 'P']); // Sub
  applyList('G', ['H', 'W', 'SW', 'R', 'A', 'P']); // PP
  applyList('H', ['H', 'W', 'SW', 'R', 'A', 'P']); // PLN
  applyList('I', ['Shop', 'Field', 'Commissioning']); // Phase
  applyList('J', ['Sipil', 'Elektrikal', 'Mekanikal', 'Instrumen Kontrol']); // Category

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="itp_template.xlsx"');
  res.send(Buffer.from(buffer));
});
