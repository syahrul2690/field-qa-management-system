import { describe, expect, it } from 'vitest';
import { mergeImportedRows, MergeableItpItem } from './itpImportMerge';
import type { ParsedItpRow } from './ItpImportModal';

const BLANK_ROW: MergeableItpItem = {
  seq_no: 1, activity: '', acceptance_criteria: '', reference_standard: '', verifying_document: '',
  sub_code: '', pp_code: '', pln_code: '', phase: 'FIELD', category: 'SIPIL',
};

function existingRow(activity: string, seqNo: number): MergeableItpItem {
  return { ...BLANK_ROW, activity, seq_no: seqNo };
}

function importedRow(activity: string, overrides: Partial<ParsedItpRow> = {}): ParsedItpRow {
  return {
    activity, sub_code: null, pp_code: null, pln_code: null, phase: 'FIELD', category: 'SIPIL',
    ...overrides,
  };
}

describe('mergeImportedRows', () => {
  it('replace mode drops all existing rows', () => {
    const existing = [existingRow('Old activity', 1)];
    const imported = [importedRow('New activity')];

    const result = mergeImportedRows(existing, imported, 'replace');

    expect(result).toEqual([{ ...BLANK_ROW, activity: 'New activity', seq_no: 1 }]);
  });

  it('append mode preserves existing non-blank rows and appends imported ones', () => {
    const existing = [existingRow('Existing 1', 1), existingRow('Existing 2', 2)];
    const imported = [importedRow('Imported 1'), importedRow('Imported 2')];

    const result = mergeImportedRows(existing, imported, 'append');

    expect(result.map((r) => r.activity)).toEqual(['Existing 1', 'Existing 2', 'Imported 1', 'Imported 2']);
    expect(result.map((r) => r.seq_no)).toEqual([1, 2, 3, 4]);
  });

  it('append mode drops the panel-seeded blank row before appending', () => {
    const existing = [BLANK_ROW]; // the empty-grid placeholder row
    const imported = [importedRow('Imported 1')];

    const result = mergeImportedRows(existing, imported, 'append');

    expect(result).toEqual([{ ...BLANK_ROW, activity: 'Imported 1', seq_no: 1 }]);
  });

  it('renumbers seq_no contiguously from 1 in both modes', () => {
    const existing = [existingRow('A', 5), existingRow('B', 9)];
    const imported = [importedRow('C'), importedRow('D'), importedRow('E')];

    const appended = mergeImportedRows(existing, imported, 'append');
    expect(appended.map((r) => r.seq_no)).toEqual([1, 2, 3, 4, 5]);

    const replaced = mergeImportedRows(existing, imported, 'replace');
    expect(replaced.map((r) => r.seq_no)).toEqual([1, 2, 3]);
  });

  it('maps null inspection-level codes to empty strings for the select inputs', () => {
    const imported = [importedRow('A', { sub_code: 'H', pp_code: null, pln_code: 'W' })];

    const [result] = mergeImportedRows([], imported, 'replace');

    expect(result.sub_code).toBe('H');
    expect(result.pp_code).toBe('');
    expect(result.pln_code).toBe('W');
  });

  it('carries optional text fields through, defaulting missing ones to empty string', () => {
    const imported = [importedRow('A', { acceptance_criteria: '150 Nm' })];

    const [result] = mergeImportedRows([], imported, 'replace');

    expect(result.acceptance_criteria).toBe('150 Nm');
    expect(result.reference_standard).toBe('');
    expect(result.verifying_document).toBe('');
  });
});
