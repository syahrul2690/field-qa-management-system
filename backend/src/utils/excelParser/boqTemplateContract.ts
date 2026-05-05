export const BOQ_SHEET_NAME = 'BoQ';

export const REQUIRED_HEADERS = ['Level', 'Item Code', 'Title', 'Description', 'Parent Code'] as const;

export type RequiredHeader = typeof REQUIRED_HEADERS[number];

export const MAX_LEVEL = 10;
export const MIN_LEVEL = 1;
