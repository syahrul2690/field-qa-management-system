import { describe, expect, it } from 'vitest';
import {
  cellText,
  isBlankCell,
  normalizeInspectionLevel,
  normalizePhase,
  normalizeCategory,
} from '../utils/excelParser/itpTemplateContract';

describe('cellText', () => {
  it('handles plain strings and numbers', () => {
    expect(cellText('  Hello  ')).toBe('Hello');
    expect(cellText(42)).toBe('42');
    expect(cellText(true)).toBe('true');
  });

  it('flattens rich text runs instead of yielding [object Object]', () => {
    expect(cellText({ richText: [{ text: 'A' }, { text: 'B' }] } as never)).toBe('AB');
  });

  it('unwraps formula results, including nested rich text', () => {
    expect(cellText({ formula: '=A1', result: 42 } as never)).toBe('42');
    expect(cellText({ formula: '=A1', result: { richText: [{ text: 'X' }] } } as never)).toBe('X');
  });

  it('unwraps hyperlink-style { text } cells', () => {
    expect(cellText({ text: 'Visible', hyperlink: 'https://x' } as never)).toBe('Visible');
  });

  it('returns empty string for null/undefined', () => {
    expect(cellText(null)).toBe('');
    expect(cellText(undefined)).toBe('');
  });
});

describe('isBlankCell', () => {
  it.each(['', '-', '—', 'n/a', 'N/A', 'na', 'NA'])('treats %j as blank', (text) => {
    expect(isBlankCell(text)).toBe(true);
  });

  it('does not treat a real value as blank', () => {
    expect(isBlankCell('0')).toBe(false);
    expect(isBlankCell('H')).toBe(false);
  });
});

describe('normalizeInspectionLevel', () => {
  it.each([
    ['H', 'H'], ['h', 'H'], ['Hold', 'H'], ['Hold Point', 'H'],
    ['W', 'W'], ['witness', 'W'],
    ['SW', 'SW'], ['spot witness', 'SW'], ['Spot', 'SW'],
    ['R', 'R'], ['Review', 'R'],
    ['A', 'A'], ['approval', 'A'], ['Approve', 'A'],
    ['P', 'P'], ['perform', 'P'],
  ])('maps %j to %s', (input, expected) => {
    expect(normalizeInspectionLevel(input)).toBe(expected);
  });

  it('returns null for unrecognized text rather than guessing', () => {
    expect(normalizeInspectionLevel('Hold Pointt')).toBeNull();
    expect(normalizeInspectionLevel('X')).toBeNull();
    expect(normalizeInspectionLevel('')).toBeNull();
  });
});

describe('normalizePhase', () => {
  it.each([
    ['SHOP', 'SHOP'], ['Pabrik', 'SHOP'],
    ['FIELD', 'FIELD'], ['Lapangan', 'FIELD'], ['Site', 'FIELD'],
    ['COMMISSIONING', 'COMMISSIONING'], ['Komisioning', 'COMMISSIONING'],
  ])('maps %j to %s', (input, expected) => {
    expect(normalizePhase(input)).toBe(expected);
  });

  it('returns null for unrecognized text', () => {
    expect(normalizePhase('Somewhere')).toBeNull();
  });
});

describe('normalizeCategory', () => {
  it.each([
    ['SIPIL', 'SIPIL'], ['Civil', 'SIPIL'],
    ['ELEKTRIKAL', 'ELEKTRIKAL'], ['Electrical', 'ELEKTRIKAL'],
    ['MEKANIKAL', 'MEKANIKAL'], ['Mechanical', 'MEKANIKAL'],
    ['INSTRUMEN_KONTROL', 'INSTRUMEN_KONTROL'],
    ['Instrumen Kontrol', 'INSTRUMEN_KONTROL'],
    ['Instrument & Control', 'INSTRUMEN_KONTROL'],
    ['I&C', 'INSTRUMEN_KONTROL'],
  ])('maps %j to %s', (input, expected) => {
    expect(normalizeCategory(input)).toBe(expected);
  });

  it('returns null for unrecognized text', () => {
    expect(normalizeCategory('Plumbing')).toBeNull();
  });
});
