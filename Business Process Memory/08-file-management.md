# 08 — File Management

## Upload Directory Structure

All files stored under `backend/uploads/` (relative to backend working directory).  
Served statically at `http://localhost:3000/uploads/{relativePath}`.

```
uploads/
├── boq/
│   └── {timestamp}-{random}.xlsx          ← BOQ Excel files (temp landing)
│
├── documents/
│   └── {projectId}/
│       └── {boqItemId}/
│           └── {docNumber-sanitized}/
│               ├── rev0/
│               │   └── {timestamp}-{random}-{originalname}.pdf
│               ├── rev1/
│               │   └── {timestamp}-{random}-{originalname}.pdf
│               └── rev2/...
│
├── ams/
│   └── {timestamp}-{random}-{originalname}.pdf   ← AMS Letters
│
└── comment-sheets/
    └── {reviewId}.pdf                             ← Auto-generated approval PDFs
```

---

## Upload Middleware (`backend/src/middlewares/uploadMiddleware.ts`)

### 1. `uploadExcel` — BOQ Excel Upload
```typescript
multer({ storage: diskStorage → 'uploads/boq/' })
  .single('boq_file')
  // Accepts: .xlsx, .xls only
  // Limit: 10 MB
  // Field name: boq_file
```
Used by: `POST /projects/:projectId/boq/upload`

### 2. `uploadPdfs` — Document PDFs
```typescript
multer({ storage: diskStorage → 'uploads/documents/' })
  .array('files', 20)
  // Accepts: .pdf, application/pdf only
  // Limit: 50 MB per file, max 20 files
  // Field name: files (array)
```
After multer saves to `uploads/documents/`, the `fileStorageService` moves each file to the structured path `uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev{N}/`.

Used by:
- `POST /documents`
- `POST /documents/:documentId/revisions`

### 3. `uploadAmsPdf` — AMS Letter
```typescript
multer({ storage: diskStorage → 'uploads/ams/' })
  .single('ams_file')
  // Accepts: .pdf, application/pdf only
  // Limit: 50 MB
  // Field name: ams_file
```
Used by: `POST /reviews/:reviewId/ams-letter`

---

## File Storage Service (`backend/src/services/fileStorageService.ts`)

### `storeDocumentFile(file, projectId, boqItemId, docNumber, revisionNo)`
1. Sanitizes `docNumber` for filesystem safety (replaces `/`, spaces, etc.)
2. Creates directory: `uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev{N}/`
3. Moves file from temp multer path to structured path (`fs.renameSync`)
4. Returns relative path (e.g., `documents/proj-abc/boq-xyz/DOC-001/rev0/filename.pdf`)

### `getFilePath(relativePath)`
- Returns absolute path: `path.join('uploads', relativePath)`

### `getFileUrl(relativePath)`
- Returns public URL: `/uploads/{relativePath}`

### `deleteFile(relativePath)`
- Best-effort: silently swallows errors if file not found

---

## AMS Letter File Lifecycle

```
1. REVIEWER uploads via POST /reviews/:reviewId/ams-letter (field: ams_file)

2. multer saves to: uploads/ams/{timestamp}-{random}-{safeName}.pdf
   (this is already the final location — no move needed)

3. Service checks for existing AmsLetter:
   IF exists:
     - Delete old file from disk (path.join('uploads', existing.file_path))
     - Delete old AmsLetter DB record
   
4. Create new AmsLetter record:
   { review_id, file_name: originalname, file_path: 'ams/{filename}',
     file_size, mime_type, uploaded_by }

5. Frontend URL: {baseUrl}/uploads/ams/{filename}
```

---

## Document File Lifecycle

```
1. VENDOR uploads via POST /documents (field: files, multipart)

2. multer saves all files to: uploads/documents/{timestamp}-{name}.pdf (flat)

3. For each file, fileStorageService.storeDocumentFile():
   - Creates dir: uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev0/
   - Moves: uploads/documents/{filename} → above path/{filename}
   - Returns relative path for DocumentFile DB record

4. When revision is created (POST /documents/:id/revisions):
   - Old doc: is_current=false, status=SUPERSEDED (file NOT deleted)
   - New doc: revision_no+1, files go to rev{N}/ directory
   
5. Frontend URL: {baseUrl}/uploads/documents/{projectId}/.../{filename}
```

---

## Comment Sheet PDF Lifecycle

```
1. Triggered automatically when Approver selects APPROVED_A

2. pdfEngine/commentSheetGenerator generates PDF:
   - Document metadata
   - Project name  
   - Reviewer / Checker / Approver names
   - All ReviewComments with page_ref, disposition
   - QR code linking to GET /verify/{qr_hash}

3. Saved to: uploads/comment-sheets/{reviewId}.pdf

4. Path stored in: DocumentReview.comment_sheet_path

5. Downloaded via: GET /reviews/:reviewId/comment-sheet
   → returns binary blob
   → frontend saves as comment-sheet-{reviewId}.xlsx
     (note: file extension mismatch — actually a PDF)
```

---

## Frontend File URL Pattern

```typescript
// In any component that shows a file download:
const env = (import.meta as any).env;
const baseUrl = env?.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000';
const fileUrl = `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/')}`;
```

> The `.replace(/\\/g, '/')` is needed because Windows paths may use backslashes in stored relative paths.

---

## Upload Limits Summary

| Type | Field | Max Size | Max Count | Format |
|------|-------|----------|-----------|--------|
| BOQ Excel | `boq_file` | 10 MB | 1 | `.xlsx`, `.xls` |
| Document PDFs | `files` | 50 MB each | 20 | `.pdf` |
| AMS Letter | `ams_file` | 50 MB | 1 | `.pdf` |

---

## Disk Space Considerations

- Old document revisions are **never deleted** — accumulate on disk
- AMS letter replacement **does** delete the old file
- Comment sheets are overwritten if regenerated
- BOQ Excel files in `uploads/boq/` are kept after parsing (no cleanup)
- No file size enforcement beyond upload time; no virus scanning
