import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { parseItpWorkbook } from '../utils/excelParser/itpSheetParser';
import { MAX_ITP_ROWS } from '../utils/excelParser/itpTemplateContract';

const HEADERS = [
  'No.', 'Activity', 'Acceptance Criteria', 'Reference Standard', 'Verifying Document',
  'Sub', 'PP', 'PLN', 'Phase', 'Category',
];

async function buildWorkbookBuffer(rows: Array<Record<string, string | number>>): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('ITP');
  sheet.addRow(HEADERS);
  for (const row of rows) {
    sheet.addRow(HEADERS.map((h) => row[h] ?? ''));
  }
  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

describe('parseItpWorkbook', () => {
  it('parses a valid sheet end to end', async () => {
    const buffer = await buildWorkbookBuffer([
      {
        'No.': 1, Activity: 'Check torque on bolts', 'Acceptance Criteria': '150 Nm ± 5%',
        'Reference Standard': 'IEC 62271', 'Verifying Document': 'Torque Log',
        Sub: 'P', PP: 'W', PLN: 'H', Phase: 'Field', Category: 'Mechanical',
      },
      {
        'No.': 2, Activity: 'Insulation resistance test', Category: 'Electrical',
      },
    ]);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      {
        activity: 'Check torque on bolts',
        acceptance_criteria: '150 Nm ± 5%',
        reference_standard: 'IEC 62271',
        verifying_document: 'Torque Log',
        sub_code: 'P',
        pp_code: 'W',
        pln_code: 'H',
        phase: 'FIELD',
        category: 'MEKANIKAL',
      },
      {
        activity: 'Insulation resistance test',
        acceptance_criteria: undefined,
        reference_standard: undefined,
        verifying_document: undefined,
        sub_code: null,
        pp_code: null,
        pln_code: null,
        phase: 'FIELD', // blank Phase defaults to FIELD
        category: 'ELEKTRIKAL',
      },
    ]);
  });

  it('errors when the Activity header is missing, without cascading row errors', async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('ITP');
    sheet.addRow(['No.', 'Category']);
    sheet.addRow([1, 'Sipil']);
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.rows).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({ field: 'Activity' });
  });

  it('reports a blank Activity with the correct sheet row number', async () => {
    const buffer = await buildWorkbookBuffer([
      { Activity: 'Row 2 activity', Category: 'Sipil' },
      { Activity: '', Category: 'Sipil' }, // row 3 in the sheet (row 1 is header)
    ]);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([{ row: 3, field: 'Activity', message: 'Activity is required.' }]);
  });

  it('reports a blank Category with the correct sheet row number', async () => {
    const buffer = await buildWorkbookBuffer([
      { Activity: 'Some activity', Category: '' },
    ]);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([{ row: 2, field: 'Category', message: 'Category is required.' }]);
  });

  it('reports an unrecognized Category value distinctly from a blank one', async () => {
    const buffer = await buildWorkbookBuffer([
      { Activity: 'Some activity', Category: 'Plumbing' },
    ]);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      { row: 2, field: 'Category', message: '"Plumbing" is not a recognized Category value.' },
    ]);
  });

  it('skips fully blank rows without shifting subsequent row numbers', async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('ITP');
    sheet.addRow(HEADERS);
    // Row 2 is left completely untouched (no cell ever assigned a value) —
    // that's what "fully blank" means to ExcelJS's includeEmpty:false iteration.
    const row3 = sheet.getRow(3);
    row3.getCell(HEADERS.indexOf('Category') + 1).value = 'Sipil'; // row 3: blank Activity, present Category
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([{ row: 3, field: 'Activity', message: 'Activity is required.' }]);
  });

  it('rejects an unrecognized inspection level for Sub/PP/PLN', async () => {
    const buffer = await buildWorkbookBuffer([
      { Activity: 'Test', Category: 'Sipil', Sub: 'Z' },
    ]);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      { row: 2, field: 'Sub', message: '"Z" is not a recognized Sub value.' },
    ]);
  });

  it('caps at MAX_ITP_ROWS with a single error, not one per row', async () => {
    const rows = Array.from({ length: MAX_ITP_ROWS + 1 }, (_, i) => ({
      Activity: `Activity ${i + 1}`,
      Category: 'Sipil',
    }));
    const buffer = await buildWorkbookBuffer(rows);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('sheet');
    expect(result.errors[0].message).toContain(String(MAX_ITP_ROWS));
  });

  it('is all-or-nothing: any error means zero rows are returned', async () => {
    const buffer = await buildWorkbookBuffer([
      { Activity: 'Valid row', Category: 'Sipil' },
      { Activity: '', Category: 'Sipil' },
    ]);

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(false);
    expect(result.rows).toEqual([]);
  });

  it('falls back to the first worksheet when no sheet is named ITP', async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Sheet1');
    sheet.addRow(HEADERS);
    sheet.addRow(HEADERS.map((h) => (h === 'Activity' ? 'Fallback activity' : h === 'Category' ? 'Sipil' : '')));
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());

    const result = await parseItpWorkbook(buffer);

    expect(result.success).toBe(true);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].activity).toBe('Fallback activity');
  });
});
