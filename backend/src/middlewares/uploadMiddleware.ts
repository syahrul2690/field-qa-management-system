import multer from 'multer';
import path from 'path';
import fs from 'fs';

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ─── Excel upload (single file, field: boq_file) ─────────────────────────────

export const uploadExcel = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = 'uploads/boq';
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('boq_file');

// ─── ITP Excel import (single file, field: itp_file, in-memory) ──────────────
// Parse-only endpoint — the file is never persisted to disk, so memory
// storage is used instead of the disk-based pattern above.

export const uploadItpExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('itp_file');

// ─── AMS letter upload (single PDF, field: ams_file) ─────────────────────────

export const uploadAmsPdf = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = 'uploads/ams';
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = file.originalname.replace(/\s+/g, '_');
      cb(null, `${unique}-${safeName}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for AMS letters'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}).single('ams_file');

// ─── PDF upload (multiple files, field: files) ────────────────────────────────

export const uploadPdfs = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = 'uploads/documents';
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = file.originalname.replace(/\s+/g, '_');
      cb(null, `${unique}-${safeName}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
    files: 20,
  },
}).array('files', 20);

// ─── Review markup upload (PDF/images, field: files) ─────────────────────────
// Markups are stored outside the public download contract. The API records
// metadata and streams them only after an authenticated scope check.

export const uploadReviewMarkup = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = 'uploads/review-markup';
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${unique}-${safeName}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [
      '.pdf', '.png', '.jpg', '.jpeg', '.webp',
    ];
    if (allowed.includes(ext) && (
      file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')
    )) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, JPG, and WEBP markup files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 20,
  },
}).array('files', 20);
