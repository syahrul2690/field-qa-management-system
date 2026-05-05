import ExcelJS from 'exceljs';
import {
  BOQ_SHEET_NAME,
  REQUIRED_HEADERS,
  MIN_LEVEL,
  MAX_LEVEL,
} from './boqTemplateContract';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; field: string; message: string }>;
}

export async function validateBoqTemplate(filePath: string): Promise<ValidationResult> {
  const errors: Array<{ row: number; field: string; message: string }> = [];

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  let sheet = wb.getWorksheet(BOQ_SHEET_NAME);
  if (!sheet && wb.worksheets.length > 0) {
    sheet = wb.worksheets[0]; // fallback to first sheet
  }

  if (!sheet) {
    errors.push({
      row: 0,
      field: 'sheet',
      message: `No usable worksheets found in the uploaded file.`,
    });
    return { valid: false, errors };
  }

  // Read header row (row 1) and build a case-insensitive index map
  const headerRow = sheet.getRow(1);
  const headerMap = new Map<string, number>(); // normalized header name -> column index (1-based)

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerText = String(cell.value ?? '').trim().toLowerCase();
    headerMap.set(headerText, colNumber);
  });

  // Check all required headers are present
  for (const required of REQUIRED_HEADERS) {
    if (!headerMap.has(required.toLowerCase())) {
      errors.push({
        row: 1,
        field: required,
        message: `Required header "${required}" is missing.`,
      });
    }
  }

  // If headers are missing, skip row validation (column indices won't resolve)
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const levelCol = headerMap.get('level')!;
  const itemCodeCol = headerMap.get('item code')!;
  const titleCol = headerMap.get('title')!;
  const parentCodeCol = headerMap.get('parent code')!;

  // Validate data rows
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    // Check if the row is completely empty
    let hasAnyValue = false;
    row.eachCell({ includeEmpty: false }, () => {
      hasAnyValue = true;
    });
    if (!hasAnyValue) return;

    // Validate Level
    const rawLevel = row.getCell(levelCol).value;
    const levelNum = rawLevel !== null && rawLevel !== undefined ? Number(rawLevel) : NaN;
    if (
      rawLevel === null ||
      rawLevel === undefined ||
      rawLevel === '' ||
      isNaN(levelNum) ||
      !Number.isInteger(levelNum) ||
      levelNum < MIN_LEVEL ||
      levelNum > MAX_LEVEL
    ) {
      errors.push({
        row: rowNumber,
        field: 'Level',
        message: `Level must be an integer between ${MIN_LEVEL} and ${MAX_LEVEL}.`,
      });
    }

    // Validate Item Code
    const rawItemCode = row.getCell(itemCodeCol).value;
    const itemCodeStr = rawItemCode !== null && rawItemCode !== undefined
      ? String(rawItemCode).trim()
      : '';
    if (!itemCodeStr) {
      errors.push({
        row: rowNumber,
        field: 'Item Code',
        message: 'Item Code is required.',
      });
    } else if (/\s/.test(itemCodeStr)) {
      errors.push({
        row: rowNumber,
        field: 'Item Code',
        message: 'Item Code must not contain spaces.',
      });
    }

    // Validate Title
    const rawTitle = row.getCell(titleCol).value;
    const titleStr = rawTitle !== null && rawTitle !== undefined
      ? String(rawTitle).trim()
      : '';
    if (!titleStr) {
      errors.push({
        row: rowNumber,
        field: 'Title',
        message: 'Title is required.',
      });
    }

    // Validate Parent Code — required when Level > 1
    const resolvedLevel = Number.isInteger(levelNum) ? levelNum : null;
    if (resolvedLevel !== null && resolvedLevel > 1) {
      const rawParentCode = row.getCell(parentCodeCol).value;
      const parentCodeStr = rawParentCode !== null && rawParentCode !== undefined
        ? String(rawParentCode).trim()
        : '';
      if (!parentCodeStr) {
        errors.push({
          row: rowNumber,
          field: 'Parent Code',
          message: 'Parent Code is required when Level > 1.',
        });
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
