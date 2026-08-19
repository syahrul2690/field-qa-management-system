import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ReviewData {
  qr_hash?: string;
  document_title: string;
  doc_number: string;
  revision_no: number;
  project_name: string;
  boq_item_title: string;
  section: string;
  sla_deadline?: Date | null;
  reviewed_at?: Date | null;
  checked_at?: Date | null;
  approved_at?: Date | null;
  final_status?: string | null;
  reviewer_name: string;
  checker_name: string;
  approver_name: string;
  // QR timestamps
  reviewer_qr_at?: Date | null;
  checker_qr_at?: Date | null;
  approver_qr_at?: Date | null;
  // Comment sheet header overrides
  cs_date?: string | null;
  cs_status?: string | null;
}

export interface CommentSheetItemData {
  seq_no: number;
  pln_comment: string;
  contractor_response?: string | null;
  is_edited?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();
}

function formatDateShort(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function statusCode(finalStatus?: string | null, csStatus?: string | null): string {
  if (csStatus) return csStatus.toUpperCase();
  if (!finalStatus) return '—';
  if (finalStatus === 'APPROVED_A') return 'A';
  if (finalStatus === 'APPROVED_WITH_COMMENTS_B') return 'B';
  if (finalStatus === 'REJECTED_C') return 'C';
  return finalStatus.slice(-1);
}

async function makeQrBuffer(content: string): Promise<Buffer> {
  return QRCode.toBuffer(content, {
    type: 'png',
    width: 80,
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

// ── Table drawing helpers ─────────────────────────────────────────────────────

interface CellOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  fillColor?: string;
  borderColor?: string;
  noBorder?: boolean;
}

function drawCell(doc: PDFKit.PDFDocument, opts: CellOpts) {
  const { x, y, w, h, fillColor, borderColor = '#000000', noBorder } = opts;
  if (fillColor) {
    doc.save().fillColor(fillColor).rect(x, y, w, h).fill().restore();
  }
  if (!noBorder) {
    doc.save().strokeColor(borderColor).lineWidth(0.5).rect(x, y, w, h).stroke().restore();
  }
}

interface TextOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize?: number;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  vAlign?: 'top' | 'center' | 'bottom';
  color?: string;
  paddingH?: number;
  paddingV?: number;
  wrap?: boolean;
}

function drawCellText(doc: PDFKit.PDFDocument, opts: TextOpts) {
  const {
    x, y, w, h, text, fontSize = 7.5, bold = false, align = 'left',
    vAlign = 'center', color = '#000000', paddingH = 4, paddingV = 3, wrap = true,
  } = opts;

  doc.save()
    .font(bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(fontSize)
    .fillColor(color);

  const innerW = w - paddingH * 2;
  const textH = doc.heightOfString(text, { width: innerW, lineGap: 1 });

  let textY: number;
  if (vAlign === 'top') {
    textY = y + paddingV;
  } else if (vAlign === 'bottom') {
    textY = y + h - textH - paddingV;
  } else {
    textY = y + Math.max(paddingV, (h - textH) / 2);
  }

  doc.text(text, x + paddingH, textY, {
    width: innerW,
    align,
    lineGap: 1,
    ellipsis: !wrap,
    lineBreak: wrap,
  });

  doc.restore();
}

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateCommentSheet(
  review: ReviewData,
  items: CommentSheetItemData[],
  outputPath: string,
): Promise<void> {
  // A4 Landscape: 841.89 x 595.28 pt
  const PAGE_W = 841.89;
  const PAGE_H = 595.28;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // Column widths (proportional to original DXA values)
  // Scale = CONTENT_W / 15134 ≈ 0.0527
  const S = CONTENT_W / 15134;

  // Header columns [logo, title-span-5-cols, date] -> but we split title into 5 sub-cols
  const COL_LOGO  = Math.round(1292 * S);   // ~68
  const COL_TITLE = Math.round((4345 + 1608 + 1703 + 1416 + 1935) * S); // ~588 (spans 5 sub-cols)
  const COL_DATE  = Math.round(2835 * S);   // ~149
  // Comment table columns
  const CMT_0 = Math.round(1305 * S);   // ~69  comment#
  const CMT_1 = Math.round(7654 * S);   // ~403 PLN comments
  const CMT_2 = Math.round(1418 * S);   // ~75  contractor#
  const CMT_3 = CONTENT_W - CMT_0 - CMT_1 - CMT_2; // ~253 contractor response
  // Signature columns
  const SIG_0 = Math.round(3827 * S);   // ~202 prepared/reviewed/approved by name
  const SIG_1 = Math.round(1985 * S);   // ~105 date
  const SIG_2 = Math.round(3118 * S);   // ~164 sign/QR
  const SIG_3 = Math.round(2518 * S);   // ~133 response by name (spans 3 rows)
  const SIG_4 = Math.round(1843 * S);   // ~97  response date
  const SIG_5 = CONTENT_W - SIG_0 - SIG_1 - SIG_2 - SIG_3 - SIG_4; // ~99 response sign

  // Row heights
  const HDR_ROW1_H = 22;
  const HDR_ROW2_H = 14;
  const HDR_ROW3_H = 14;
  const HDR_ROW4_H = 30;
  const HDR_ROW5_H = 22;  // comment column headers — tall enough for 2-line "COMMENT\nNO."
  const CMT_ROW_H  = 40;  // per comment row
  const SIG_ROW_H  = 30;  // per signature row
  const FOOTER_H   = 14;

  const HEADER_H = HDR_ROW1_H + HDR_ROW2_H + HDR_ROW3_H + HDR_ROW4_H + HDR_ROW5_H;
  const MIN_ITEMS = Math.max(items.length, 5);
  const CMT_TABLE_H = MIN_ITEMS * CMT_ROW_H;
  const SIG_TABLE_H = SIG_ROW_H * 3;

  const totalContent =
    HEADER_H + CMT_TABLE_H + SIG_TABLE_H + FOOTER_H + 8; // 8pt gaps

  // Determine page count (allow multi-page if many comments)
  const availableH = PAGE_H - MARGIN * 2;
  const numPages = Math.ceil(totalContent / availableH);

  // Resolve QR codes
  const reviewIdStr = review.qr_hash ?? 'unknown';

  const preparedQrBuf = review.reviewer_qr_at
    ? await makeQrBuffer(
        `PLN Field QA\nRole: Prepared By (Reviewer)\nName: ${review.reviewer_name}\nDate: ${formatDateShort(review.reviewer_qr_at)}\nRef: ${reviewIdStr}`,
      )
    : null;

  const reviewedQrBuf = review.checker_qr_at
    ? await makeQrBuffer(
        `PLN Field QA\nRole: Reviewed By (Checker)\nName: ${review.checker_name}\nDate: ${formatDateShort(review.checker_qr_at)}\nRef: ${reviewIdStr}`,
      )
    : null;

  const approvedQrBuf = review.approver_qr_at
    ? await makeQrBuffer(
        `PLN Field QA\nRole: Approved By (Approver)\nName: ${review.approver_name}\nDate: ${formatDateShort(review.approver_qr_at)}\nRef: ${reviewIdStr}`,
      )
    : null;

  // Resolve PLN logo
  const logoPath = path.join(__dirname, '../../assets/pln_logo.png');
  const hasLogo = fs.existsSync(logoPath);

  // Header date and status
  const headerDate = review.cs_date
    ? new Date(review.cs_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).toUpperCase()
    : formatDate(review.reviewed_at ?? new Date());
  const docStatus = statusCode(review.final_status, review.cs_status);
  const revision  = String(review.revision_no ?? 0);

  // ── Create PDF document ──────────────────────────────────────────────────────
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  const stream = fs.createWriteStream(outputPath);
  const doc = new PDFDocument({
    layout: 'landscape',
    size:   'A4',
    margin: 0,
    autoFirstPage: true,
    info: {
      Title:   'Review for Approval of Documents',
      Author:  'PLN Field QA Management System',
      Subject: review.document_title,
    },
  });

  doc.pipe(stream);

  // ── Draw page ──────────────────────────────────────────────────────────────
  // We draw everything on one page (expanding via pages if needed)
  let curY = MARGIN;
  const LEFT = MARGIN;

  // ── HEADER TABLE ──────────────────────────────────────────────────────────

  // Row 1: Logo (rowspan 2) | "REVIEW FOR APPROVAL OF DOCUMENTS" | "DATE:"
  const r1y = curY;
  // Logo cell (spans rows 1+2)
  drawCell(doc, { x: LEFT, y: r1y, w: COL_LOGO, h: HDR_ROW1_H + HDR_ROW2_H });
  if (hasLogo) {
    const logoH = (HDR_ROW1_H + HDR_ROW2_H) - 4;
    const logoW = logoH * (38 / 52);
    doc.image(logoPath, LEFT + (COL_LOGO - logoW) / 2, r1y + 2, { width: logoW, height: logoH });
  }
  // Title cell
  drawCell(doc, { x: LEFT + COL_LOGO, y: r1y, w: COL_TITLE, h: HDR_ROW1_H, fillColor: '#E8F4FA' });
  drawCellText(doc, {
    x: LEFT + COL_LOGO, y: r1y, w: COL_TITLE, h: HDR_ROW1_H,
    text: 'REVIEW FOR APPROVAL OF DOCUMENTS',
    fontSize: 9, bold: true, align: 'center', vAlign: 'center',
  });
  // Date label
  drawCell(doc, { x: LEFT + COL_LOGO + COL_TITLE, y: r1y, w: COL_DATE, h: HDR_ROW1_H });
  drawCellText(doc, {
    x: LEFT + COL_LOGO + COL_TITLE, y: r1y, w: COL_DATE, h: HDR_ROW1_H,
    text: 'DATE:', fontSize: 7.5, bold: true, align: 'left',
  });

  // Row 2: Logo (continued) | Company subtitle | Date value
  const r2y = r1y + HDR_ROW1_H;
  drawCell(doc, { x: LEFT + COL_LOGO, y: r2y, w: COL_TITLE, h: HDR_ROW2_H });
  drawCellText(doc, {
    x: LEFT + COL_LOGO, y: r2y, w: COL_TITLE, h: HDR_ROW2_H,
    text: 'PT PLN (PERSERO) — PUSAT MANAJEMEN PROYEK',
    fontSize: 7, bold: false, align: 'center', vAlign: 'center',
  });
  drawCell(doc, { x: LEFT + COL_LOGO + COL_TITLE, y: r2y, w: COL_DATE, h: HDR_ROW2_H });
  drawCellText(doc, {
    x: LEFT + COL_LOGO + COL_TITLE, y: r2y, w: COL_DATE, h: HDR_ROW2_H,
    text: headerDate, fontSize: 7.5, bold: true, align: 'left',
  });

  // Row 3: Column labels — DOC NUMBER | REV | STATUS | DOCUMENT TITLE
  const r3y = r2y + HDR_ROW2_H;
  const DOC_NUM_W = COL_LOGO + Math.round(4345 * S); // logo + first sub-col
  const REV_W     = Math.round(1608 * S);
  const STAT_W    = Math.round(1703 * S);
  const TITL_W    = CONTENT_W - DOC_NUM_W - REV_W - STAT_W;

  const r3Cells = [
    { text: 'DOCUMENT NUMBER', w: DOC_NUM_W },
    { text: 'REV.',             w: REV_W    },
    { text: 'STATUS',           w: STAT_W   },
    { text: 'DOCUMENT TITLE',   w: TITL_W   },
  ];
  let r3x = LEFT;
  for (const c of r3Cells) {
    drawCell(doc, { x: r3x, y: r3y, w: c.w, h: HDR_ROW3_H, fillColor: '#D0E8F5' });
    drawCellText(doc, { x: r3x, y: r3y, w: c.w, h: HDR_ROW3_H, text: c.text, bold: true, align: 'center', fontSize: 7 });
    r3x += c.w;
  }

  // Row 4: Values
  const r4y = r3y + HDR_ROW3_H;
  r3x = LEFT;
  const r4vals = [
    { text: review.doc_number || '—', w: DOC_NUM_W, align: 'center' as const },
    { text: revision,                 w: REV_W,     align: 'center' as const },
    { text: docStatus,                w: STAT_W,    align: 'center' as const },
    { text: `${review.document_title || '—'}\n${review.project_name || ''}`, w: TITL_W, align: 'center' as const },
  ];
  for (const c of r4vals) {
    drawCell(doc, { x: r3x, y: r4y, w: c.w, h: HDR_ROW4_H });
    drawCellText(doc, {
      x: r3x, y: r4y, w: c.w, h: HDR_ROW4_H,
      text: c.text, align: c.align,
      vAlign: 'center',
      fontSize: 7.5, wrap: true,
    });
    r3x += c.w;
  }

  // Row 5: Comment column headers
  const r5y = r4y + HDR_ROW4_H;
  const r5Cells = [
    { text: 'COMMENT\nNO.', w: CMT_0 },
    { text: 'PLN COMMENTS',     w: CMT_1 },
    { text: 'COMMENT\nNO.', w: CMT_2 },
    { text: 'CONTRACTOR RESPONSE', w: CMT_3 },
  ];
  let r5x = LEFT;
  for (const c of r5Cells) {
    drawCell(doc, { x: r5x, y: r5y, w: c.w, h: HDR_ROW5_H, fillColor: '#E8F4FA' });
    drawCellText(doc, { x: r5x, y: r5y, w: c.w, h: HDR_ROW5_H, text: c.text, bold: true, align: 'center', fontSize: 7, vAlign: 'center' });
    r5x += c.w;
  }

  curY = r5y + HDR_ROW5_H;

  // ── COMMENT ROWS ──────────────────────────────────────────────────────────

  for (let i = 0; i < MIN_ITEMS; i++) {
    const item = items[i] ?? null;
    const rowY = curY;

    // Dynamic height: enough for the comment text
    let rowH = CMT_ROW_H;
    if (item) {
      doc.font('Helvetica').fontSize(7.5);
      const commentH = doc.heightOfString(item.pln_comment, { width: CMT_1 - 8, lineGap: 1 }) + 6;
      const responseH = item.contractor_response
        ? doc.heightOfString(item.contractor_response, { width: CMT_3 - 8, lineGap: 1 }) + 6
        : 0;
      rowH = Math.max(CMT_ROW_H, commentH, responseH);
    }

    drawCell(doc, { x: LEFT,                            y: rowY, w: CMT_0, h: rowH });
    drawCell(doc, { x: LEFT + CMT_0,                    y: rowY, w: CMT_1, h: rowH });
    drawCell(doc, { x: LEFT + CMT_0 + CMT_1,            y: rowY, w: CMT_2, h: rowH });
    drawCell(doc, { x: LEFT + CMT_0 + CMT_1 + CMT_2,   y: rowY, w: CMT_3, h: rowH });

    if (item) {
      drawCellText(doc, { x: LEFT, y: rowY, w: CMT_0, h: rowH, text: `${item.seq_no}.`, align: 'center', fontSize: 7.5 });
      const editMarker = item.is_edited ? '\n[EDITED]' : '';
      drawCellText(doc, { x: LEFT + CMT_0, y: rowY, w: CMT_1, h: rowH, text: `${item.pln_comment}${editMarker}`, align: 'left', vAlign: 'top', fontSize: 7.5, wrap: true });
      if (item.contractor_response) {
        drawCellText(doc, { x: LEFT + CMT_0 + CMT_1, y: rowY, w: CMT_2, h: rowH, text: `${item.seq_no}.`, align: 'center', fontSize: 7.5 });
        drawCellText(doc, { x: LEFT + CMT_0 + CMT_1 + CMT_2, y: rowY, w: CMT_3, h: rowH, text: `${item.contractor_response}${item.is_edited ? '\n[EDITED]' : ''}`, align: 'left', vAlign: 'top', fontSize: 7.5, wrap: true });
      }
    }
    curY += rowH;
  }

  // ── SIGNATURE TABLE ───────────────────────────────────────────────────────

  const sigRoles = [
    {
      label:  `Prepared by: ${review.reviewer_name !== 'N/A' ? review.reviewer_name : ''}`,
      date:   `Date: ${formatDateShort(review.reviewed_at)}`,
      qr:     preparedQrBuf,
    },
    {
      label:  `Reviewed by: ${review.checker_name !== 'N/A' ? review.checker_name : ''}`,
      date:   `Date: ${formatDateShort(review.checked_at)}`,
      qr:     reviewedQrBuf,
    },
    {
      label:  `Approved by: ${review.approver_name !== 'N/A' ? review.approver_name : ''}`,
      date:   `Date: ${formatDateShort(review.approved_at)}`,
      qr:     approvedQrBuf,
    },
  ];

  const QR_SIZE = SIG_ROW_H - 4;
  const sigStartY = curY + 2;

  for (let i = 0; i < 3; i++) {
    const role = sigRoles[i];
    const rowY = sigStartY + i * SIG_ROW_H;
    let sx = LEFT;

    // Left side: name | date | sign (QR)
    drawCell(doc, { x: sx, y: rowY, w: SIG_0, h: SIG_ROW_H });
    drawCellText(doc, { x: sx, y: rowY, w: SIG_0, h: SIG_ROW_H, text: role.label, fontSize: 7.5, vAlign: 'top' });
    sx += SIG_0;

    drawCell(doc, { x: sx, y: rowY, w: SIG_1, h: SIG_ROW_H });
    drawCellText(doc, { x: sx, y: rowY, w: SIG_1, h: SIG_ROW_H, text: role.date, fontSize: 7.5, vAlign: 'top' });
    sx += SIG_1;

    drawCell(doc, { x: sx, y: rowY, w: SIG_2, h: SIG_ROW_H });
    if (role.qr) {
      // "Sign:" label + QR code image
      drawCellText(doc, { x: sx, y: rowY, w: SIG_2 - QR_SIZE - 4, h: SIG_ROW_H, text: 'Sign:', fontSize: 7.5, vAlign: 'top' });
      doc.image(role.qr, sx + SIG_2 - QR_SIZE - 2, rowY + 2, { width: QR_SIZE, height: QR_SIZE });
    } else {
      drawCellText(doc, { x: sx, y: rowY, w: SIG_2, h: SIG_ROW_H, text: 'Sign:', fontSize: 7.5, vAlign: 'top' });
    }
    sx += SIG_2;

    // Right side: "Response by:" spans all 3 rows
    if (i === 0) {
      drawCell(doc, { x: sx, y: rowY, w: SIG_3, h: SIG_ROW_H * 3 });
      drawCellText(doc, { x: sx, y: rowY, w: SIG_3, h: SIG_ROW_H * 3, text: 'Response by:', fontSize: 7.5, vAlign: 'top' });
      sx += SIG_3;
      drawCell(doc, { x: sx, y: rowY, w: SIG_4, h: SIG_ROW_H * 3 });
      drawCellText(doc, { x: sx, y: rowY, w: SIG_4, h: SIG_ROW_H * 3, text: 'Date:', fontSize: 7.5, vAlign: 'top' });
      sx += SIG_4;
      drawCell(doc, { x: sx, y: rowY, w: SIG_5, h: SIG_ROW_H * 3 });
      drawCellText(doc, { x: sx, y: rowY, w: SIG_5, h: SIG_ROW_H * 3, text: 'Sign:', fontSize: 7.5, vAlign: 'top' });
    }
  }

  curY = sigStartY + SIG_ROW_H * 3 + 2;

  // ── FOOTER ────────────────────────────────────────────────────────────────
  doc.save()
    .font('Helvetica-Bold').fontSize(7)
    .fillColor('#000000')
    .text('FR.SMT.PUSMANPRO.38.00.02', LEFT, curY, { continued: true })
    .font('Helvetica')
    .text(`${' '.repeat(80)}Page 1 of ${numPages}`, { align: 'right' });
  doc.restore();

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
