import ExcelJS from 'exceljs';
import { BOQ_SHEET_NAME } from './boqTemplateContract';

export interface ParsedBoqRow {
  level: number;
  item_code: string;
  title: string;
  description?: string;
  parent_code?: string;
  sort_order: number;
}

export interface ParseResult {
  success: boolean;
  rows?: ParsedBoqRow[];
  errors?: Array<{ row: number; field: string; message: string }>;
}

export async function parseBoqSheet(filePath: string): Promise<ParseResult> {
  const errors: Array<{ row: number; field: string; message: string }> = [];

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  let sheet = wb.getWorksheet(BOQ_SHEET_NAME);
  if (!sheet && wb.worksheets.length > 0) {
    sheet = wb.worksheets[0]; // fallback to first sheet
  }

  if (!sheet) {
    return {
      success: false,
      errors: [{ row: 0, field: 'sheet', message: `No usable worksheets found in the uploaded file.` }],
    };
  }

  // Build header index map from row 1
  const headerRow = sheet.getRow(1);
  const headerMap = new Map<string, number>(); // normalized name -> col number

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = String(cell.value ?? '').trim().toLowerCase();
    headerMap.set(key, colNumber);
  });

  const levelCol = headerMap.get('level');
  const itemCodeCol = headerMap.get('item code');
  const titleCol = headerMap.get('title');
  const descriptionCol = headerMap.get('description');
  const parentCodeCol = headerMap.get('parent code');

  if (
    levelCol === undefined ||
    itemCodeCol === undefined ||
    titleCol === undefined ||
    parentCodeCol === undefined
  ) {
    return {
      success: false,
      errors: [{ row: 0, field: 'headers', message: 'Required headers are missing from the sheet.' }],
    };
  }

  const rows: ParsedBoqRow[] = [];
  let sortOrder = 0;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    // Skip completely empty rows
    let hasAnyValue = false;
    row.eachCell({ includeEmpty: false }, () => {
      hasAnyValue = true;
    });
    if (!hasAnyValue) return;

    sortOrder += 1;

    const rawLevel = row.getCell(levelCol).value;
    const rawItemCode = row.getCell(itemCodeCol).value;
    const rawTitle = row.getCell(titleCol).value;
    const rawDescription = descriptionCol !== undefined ? row.getCell(descriptionCol).value : null;
    const rawParentCode = row.getCell(parentCodeCol).value;

    const levelNum = rawLevel !== null && rawLevel !== undefined ? Number(rawLevel) : NaN;
    const itemCodeStr = rawItemCode !== null && rawItemCode !== undefined
      ? String(rawItemCode).trim()
      : '';
    const titleStr = rawTitle !== null && rawTitle !== undefined
      ? String(rawTitle).trim()
      : '';
    const descriptionStr = rawDescription !== null && rawDescription !== undefined
      ? String(rawDescription).trim()
      : undefined;
    const parentCodeStr = rawParentCode !== null && rawParentCode !== undefined
      ? String(rawParentCode).trim()
      : undefined;

    // Basic validation
    if (isNaN(levelNum) || !Number.isInteger(levelNum)) {
      errors.push({ row: rowNumber, field: 'Level', message: 'Level must be a valid integer.' });
      return;
    }

    if (!itemCodeStr) {
      errors.push({ row: rowNumber, field: 'Item Code', message: 'Item Code is required.' });
      return;
    }

    if (!titleStr) {
      errors.push({ row: rowNumber, field: 'Title', message: 'Title is required.' });
      return;
    }

    rows.push({
      level: levelNum,
      item_code: itemCodeStr,
      title: titleStr,
      description: descriptionStr || undefined,
      parent_code: parentCodeStr || undefined,
      sort_order: sortOrder,
    });
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Parent reference validation
  const codeMap = new Map<string, ParsedBoqRow>();
  for (const row of rows) {
    codeMap.set(row.item_code, row);
  }

  for (const row of rows) {
    if (row.parent_code) {
      if (!codeMap.has(row.parent_code)) {
        errors.push({
          row: 0,
          field: 'Parent Code',
          message: `Item "${row.item_code}" references parent "${row.parent_code}" which does not exist in the sheet.`,
        });
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, rows };
}
