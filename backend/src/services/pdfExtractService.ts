import fs from 'fs';
import { getFilePath } from './fileStorageService';

// pdf-parse doesn't ship its own types; use a require-style import.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (
  dataBuffer: Buffer,
) => Promise<{ numpages: number; text: string; info: Record<string, unknown> }>;

/** Maximum characters to return – keeps AI token usage in check (~25K tokens). */
const MAX_CHARS = 100_000;

/** Maximum PDF size to send for vision analysis (10 MB unencoded). */
const MAX_VISION_BYTES = 10 * 1024 * 1024;

/**
 * Extract plain text from a PDF stored on disk.
 *
 * @param relativePath  Path relative to the uploads dir (same as DocumentFile.file_path)
 * @returns Extracted text (truncated to MAX_CHARS), or empty string on failure.
 */
export async function extractTextFromPdf(relativePath: string): Promise<string> {
  try {
    const absolutePath = getFilePath(relativePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[pdfExtract] File not found: ${absolutePath}`);
      return '';
    }

    const buffer = fs.readFileSync(absolutePath);
    const result = await pdfParse(buffer);

    const text = (result.text ?? '').trim();

    if (!text) {
      console.warn(`[pdfExtract] No text extracted from: ${relativePath}`);
      return '';
    }

    // Truncate to avoid blowing up the AI context window
    return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  } catch (err) {
    console.error(`[pdfExtract] Failed to extract text from ${relativePath}:`, err);
    return '';
  }
}

/**
 * Read a PDF as a base64-encoded string for vision model analysis.
 * Returns null if the file is not found, is too large, or cannot be read.
 *
 * @param relativePath  Path relative to the uploads dir
 * @returns Base64-encoded PDF data, or null.
 */
export function readPdfAsBase64(relativePath: string): string | null {
  try {
    const absolutePath = getFilePath(relativePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[pdfExtract] File not found for vision: ${absolutePath}`);
      return null;
    }

    const buffer = fs.readFileSync(absolutePath);

    if (buffer.length > MAX_VISION_BYTES) {
      console.warn(
        `[pdfExtract] PDF too large for vision (${(buffer.length / 1024 / 1024).toFixed(1)} MB): ${relativePath}`,
      );
      return null;
    }

    return buffer.toString('base64');
  } catch (err) {
    console.error(`[pdfExtract] Failed to read PDF for vision: ${relativePath}`, err);
    return null;
  }
}
