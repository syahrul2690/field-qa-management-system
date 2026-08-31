import ExcelJS from 'exceljs';
import { InspectionLevel, ItpPhase, ItpCategory } from '@prisma/client';
import {
  ITP_SHEET_NAME,
  MAX_ITP_ROWS,
  cellText,
  isBlankCell,
  normalizeInspectionLevel,
  normalizePhase,
  normalizeCategory,
} from './itpTemplateContract';

export interface ParsedItpRow {
  activity: string;
  acceptance_criteria?: string;
  reference_standard?: string;
  verifying_document?: string;
  sub_code: InspectionLevel | null;
  pp_code: InspectionLevel | null;
  pln_code: InspectionLevel | null;
  phase: ItpPhase;
  category: ItpCategory;
}

export interface ItpParseError {
  row: number;
  field: string;
  message: string;
}

export interface ItpParseResult {
  success: boolean;
  rows: ParsedItpRow[];
  errors: ItpParseError[];
}

function parseLevelCell(
  errors: ItpParseError[],
  rowNumber: number,
  fieldLabel: string,
  text: string,
  normalize: (t: string) => InspectionLevel | null,
): InspectionLevel | null {
  if (isBlankCell(text)) return null;
  const normalized = normalize(text);
  if (normalized === null) {
    errors.push({ row: rowNumber, field: fieldLabel, message: `"${text}" is not a recognized ${fieldLabel} value.` });
  }
  return normalized;
}

/** Parses an uploaded ITP workbook from a buffer — never touches disk. */
export async function parseItpWorkbook(buffer: Buffer): Promise<ItpParseResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  let sheet = wb.getWorksheet(ITP_SHEET_NAME);
  if (!sheet && wb.worksheets.length > 0) {
    sheet = wb.worksheets[0];
  }

  if (!sheet) {
    return {
      success: false,
      rows: [],
      errors: [{ row: 0, field: 'sheet', message: 'No usable worksheets found in the uploaded file.' }],
    };
  }

  const headerRow = sheet.getRow(1);
  const headerMap = new Map<string, number>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headerMap.set(cellText(cell.value).toLowerCase(), colNumber);
  });

  const activityCol = headerMap.get('activity');
  const categoryCol = headerMap.get('category');
  if (activityCol === undefined || categoryCol === undefined) {
    const errors: ItpParseError[] = [];
    if (activityCol === undefined) errors.push({ row: 1, field: 'Activity', message: 'Required header "Activity" is missing.' });
    if (categoryCol === undefined) errors.push({ row: 1, field: 'Category', message: 'Required header "Category" is missing.' });
    return { success: false, rows: [], errors };
  }

  const acceptanceCol = headerMap.get('acceptance criteria');
  const referenceCol = headerMap.get('reference standard');
  const verifyingCol = headerMap.get('verifying document');
  const subCol = headerMap.get('sub');
  const ppCol = headerMap.get('pp');
  const plnCol = headerMap.get('pln');
  const phaseCol = headerMap.get('phase');

  const errors: ItpParseError[] = [];
  const rows: ParsedItpRow[] = [];
  let dataRowCount = 0;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    let hasAnyValue = false;
    row.eachCell({ includeEmpty: false }, () => {
      hasAnyValue = true;
    });
    if (!hasAnyValue) return;

    dataRowCount += 1;
    if (dataRowCount > MAX_ITP_ROWS) return; // single cap error appended once below

    const activity = cellText(row.getCell(activityCol).value);
    if (isBlankCell(activity)) {
      errors.push({ row: rowNumber, field: 'Activity', message: 'Activity is required.' });
      return;
    }

    const categoryText = cellText(row.getCell(categoryCol).value);
    if (isBlankCell(categoryText)) {
      errors.push({ row: rowNumber, field: 'Category', message: 'Category is required.' });
      return;
    }
    const category = normalizeCategory(categoryText);
    if (category === null) {
      errors.push({ row: rowNumber, field: 'Category', message: `"${categoryText}" is not a recognized Category value.` });
      return;
    }

    const subCode = subCol !== undefined
      ? parseLevelCell(errors, rowNumber, 'Sub', cellText(row.getCell(subCol).value), normalizeInspectionLevel)
      : null;
    const ppCode = ppCol !== undefined
      ? parseLevelCell(errors, rowNumber, 'PP', cellText(row.getCell(ppCol).value), normalizeInspectionLevel)
      : null;
    const plnCode = plnCol !== undefined
      ? parseLevelCell(errors, rowNumber, 'PLN', cellText(row.getCell(plnCol).value), normalizeInspectionLevel)
      : null;

    let phase: ItpPhase = ItpPhase.FIELD;
    if (phaseCol !== undefined) {
      const phaseText = cellText(row.getCell(phaseCol).value);
      if (!isBlankCell(phaseText)) {
        const normalizedPhase = normalizePhase(phaseText);
        if (normalizedPhase === null) {
          errors.push({ row: rowNumber, field: 'Phase', message: `"${phaseText}" is not a recognized Phase value.` });
          return;
        }
        phase = normalizedPhase;
      }
    }

    const optionalText = (col: number | undefined): string | undefined => {
      if (col === undefined) return undefined;
      const text = cellText(row.getCell(col).value);
      return isBlankCell(text) ? undefined : text;
    };

    rows.push({
      activity,
      acceptance_criteria: optionalText(acceptanceCol),
      reference_standard: optionalText(referenceCol),
      verifying_document: optionalText(verifyingCol),
      sub_code: subCode,
      pp_code: ppCode,
      pln_code: plnCode,
      phase,
      category,
    });
  });

  if (dataRowCount > MAX_ITP_ROWS) {
    errors.push({
      row: 0,
      field: 'sheet',
      message: `Sheet has ${dataRowCount} data rows, exceeding the maximum of ${MAX_ITP_ROWS}.`,
    });
  }

  if (errors.length > 0) {
    return { success: false, rows: [], errors };
  }

  return { success: true, rows, errors: [] };
}
