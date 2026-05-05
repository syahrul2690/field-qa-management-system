import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface StoredFile {
  file_name: string;
  file_path: string; // relative path under uploads dir, e.g. "documents/abc.pdf"
  file_size: number;
  mime_type: string;
}

/**
 * Move an uploaded multer file into the proper project/document sub-directory.
 * Target: uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev{revisionNo}
 * Returns the StoredFile metadata (with a relative path from the uploads root).
 */
export function storeDocumentFile(
  file: Express.Multer.File,
  projectId: string,
  boqItemId: string,
  docNumber: string,
  revisionNo: number,
): StoredFile {
  // Sanitize doc_number for use as a directory name
  const safeDocNumber = docNumber.replace(/[^a-zA-Z0-9_\-]/g, '_');

  const relativeDir = path.join(
    'documents',
    projectId,
    boqItemId,
    safeDocNumber,
    `rev${revisionNo}`,
  );

  const uploadsRoot = config.upload.dir; // e.g. "uploads"
  const absoluteDir = path.resolve(uploadsRoot, relativeDir);

  if (!fs.existsSync(absoluteDir)) {
    fs.mkdirSync(absoluteDir, { recursive: true });
  }

  // Keep the multer-generated filename (already unique + sanitized by uploadMiddleware)
  const fileName = path.basename(file.path);
  const absoluteDestination = path.join(absoluteDir, fileName);

  // Move from temp location (uploads/documents/<multer-name>) to subdirectory
  fs.renameSync(file.path, absoluteDestination);

  const relativePath = path.join(relativeDir, fileName);

  return {
    file_name: file.originalname,
    file_path: relativePath,
    file_size: file.size,
    mime_type: file.mimetype,
  };
}

/**
 * Resolve a relative stored-file path to its absolute filesystem path.
 */
export function getFilePath(relativePath: string): string {
  return path.resolve(config.upload.dir, relativePath);
}

/**
 * Return a URL-accessible path for a stored file.
 * Assumes the uploads directory is served as /uploads by Express.
 */
export function getFileUrl(relativePath: string): string {
  // Normalise Windows back-slashes to forward slashes for URLs
  const urlPath = relativePath.split(path.sep).join('/');
  return `${config.baseUrl}/uploads/${urlPath}`;
}

/**
 * Delete a stored file from disk (best-effort — never throws).
 */
export function deleteFile(relativePath: string): void {
  try {
    const absolutePath = getFilePath(relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch {
    // intentionally swallow — best-effort deletion
  }
}
