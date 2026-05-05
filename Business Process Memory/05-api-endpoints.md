# 05 — API Endpoints Reference

> Base URL: `http://localhost:3000/api`  
> All protected routes require `Authorization: Bearer {access_token}` header  
> All responses: `{ success: boolean, data?: any, message?: string }`

---

## Auth Routes — `/api/auth`

| Method | Path | Auth | Role | Body / Query | Description |
|--------|------|------|------|--------------|-------------|
| POST | `/auth/register` | — | — | `{name, email, password, institution_id, unit_id, role}` | Register new user (status=PENDING) |
| POST | `/auth/login` | — | — | `{email, password}` | Returns `access_token`, sets refresh cookie |
| POST | `/auth/refresh` | — | — | (refresh cookie) | Returns new `access_token` |
| POST | `/auth/logout` | ✓ | — | — | Clears refresh token |
| GET | `/auth/me` | ✓ | — | — | Current user profile |
| PATCH | `/auth/me` | ✓ | — | `{name?, phone?, role?}` | Update profile (role: ADMIN only) |
| GET | `/auth/peers` | ✓ | — | `?role=CHECKER` | List users with given role |

---

## Admin Routes — `/api/admin`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/admin/users/pending` | ✓ | ADMIN | List users with status=PENDING |
| GET | `/admin/users` | ✓ | ADMIN | List all users |
| PATCH | `/admin/users/:id/approve` | ✓ | ADMIN | Approve user registration |
| PATCH | `/admin/users/:id/reject` | ✓ | ADMIN | Reject user registration |
| PATCH | `/admin/users/:id/suspend` | ✓ | ADMIN | Suspend active user |

---

## Institution Routes — `/api/institutions`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/institutions` | — | — | List all institutions (optional `?type=OWNER`) |
| GET | `/institutions/:id` | — | — | Get institution by ID |
| GET | `/institutions/:id/units` | — | — | List units of institution |
| POST | `/institutions` | ✓ | ADMIN | Create institution |
| POST | `/institutions/:id/units` | ✓ | ADMIN | Create unit within institution |

---

## Project Routes — `/api/projects`

| Method | Path | Auth | Role | Institution | Description |
|--------|------|------|------|-------------|-------------|
| POST | `/projects` | ✓ | PIC_PROJECT or ADMIN | OWNER | Create project |
| GET | `/projects/dashboard` | ✓ | — | — | Dashboard aggregation (see `09-dashboard-and-reporting.md`) |
| GET | `/projects` | ✓ | — | — | List projects (filtered by role context) |
| GET | `/projects/:id` | ✓ | — | — | Get project detail with vendor_visibility |
| PATCH | `/projects/:id` | ✓ | PIC_PROJECT or ADMIN | — | Update project metadata + urgency |
| POST | `/projects/:id/amendments` | ✓ | PIC_PROJECT or ADMIN | OWNER | Create contract amendment |
| GET | `/projects/:id/amendments` | ✓ | — | — | List amendments for project |
| POST | `/projects/:id/vendors` | ✓ | PIC_PROJECT | — | Grant vendor institution access |
| DELETE | `/projects/:id/vendors/:vendorId` | ✓ | PIC_PROJECT | — | Revoke vendor access |

> **IMPORTANT:** `GET /projects/dashboard` is registered BEFORE `GET /projects/:id` in routes file to prevent path shadowing.

---

## BOQ Routes — `/api/projects/:projectId/boq` and `/api/boq`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/projects/:projectId/boq/upload` | ✓ | VENDOR, PIC_PROJECT, ADMIN | Upload Excel BOQ (field: `boq_file`) |
| GET | `/projects/:projectId/boq` | ✓ | — | Get full BOQ tree |
| DELETE | `/projects/:projectId/boq` | ✓ | PIC_PROJECT, ADMIN | Delete all BOQ items (cascades to documents) |
| GET | `/boq/:itemId` | ✓ | — | Get single BOQ item |
| GET | `/boq/:itemId/children` | ✓ | — | Get child items |

---

## Document Routes — `/api/documents`

| Method | Path | Auth | Role | Institution | Description |
|--------|------|------|------|-------------|-------------|
| POST | `/documents` | ✓ | VENDOR | VENDOR | Upload new document (multipart, field: `files`) |
| POST | `/documents/:documentId/revisions` | ✓ | VENDOR | VENDOR | Create revision (multipart, field: `files`) |
| GET | `/documents` | ✓ | — | — | List documents `?boq_item_id=&section=` |
| GET | `/documents/history` | ✓ | — | — | Version history `?boq_item_id=&section=&doc_number=` |
| GET | `/documents/:documentId` | ✓ | — | — | Get single document with files |

> **IMPORTANT:** `GET /documents/history` is registered BEFORE `GET /documents/:documentId` to prevent shadowing.

---

## Review Routes — `/api/reviews`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/reviews/pending` | ✓ | — | My pending reviews (filtered by role) |
| GET | `/reviews` | ✓ | — | Review for document `?document_id=` |
| POST | `/reviews` | ✓ | VENDOR | Submit document for review `{document_id}` |
| GET | `/reviews/:reviewId` | ✓ | — | Full review detail with comments, files, ams_letter |
| POST | `/reviews/:reviewId/review` | ✓ | REVIEWER | Add reviewer comments + assign checker/approver |
| POST | `/reviews/:reviewId/check` | ✓ | CHECKER | Confirm check (optional comments) |
| POST | `/reviews/:reviewId/approve` | ✓ | APPROVER | Final approval `{final_status, comments[]}` |
| GET | `/reviews/:reviewId/comment-sheet` | ✓ | — | Download comment sheet PDF (binary blob) |
| POST | `/reviews/:reviewId/ams-letter` | ✓ | REVIEWER | Upload AMS letter PDF (field: `ams_file`) |

> **IMPORTANT:** `GET /reviews/pending` registered BEFORE `GET /reviews/:reviewId`.

---

## Verify Routes — `/api/verify`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/verify/:hash` | — | QR code verification (public) — returns document approval info |

---

## Request/Response Examples

### POST /auth/login
```json
// Request
{ "email": "pic@pln.co.id", "password": "secret123" }

// Response
{ "success": true, "data": { "access_token": "eyJ...", "user": { "id": "...", "name": "...", "role": "PIC_PROJECT", ... } } }
```

### POST /projects
```json
// Request
{
  "name": "PLTU Kendari 2x50MW",
  "description": "...",
  "contract_signing_date": "2025-01-15T00:00:00.000Z",
  "contract_effective_date": "2025-02-01T00:00:00.000Z",
  "duration_days": 730,
  "warranty_period_days": 365,
  "project_type": "GENERATION",
  "urgency": "KINERJA_KORPORAT",
  "nominal_values": [{ "currency": "IDR", "amount": 500000000000 }]
}
```

### POST /reviews/:reviewId/review
```json
{
  "checker_id": "uuid-of-checker",
  "approver_id": "uuid-of-approver",
  "comments": [
    { "comment": "Section 3.2 needs revision", "page_ref": "12", "disposition": "MAJOR" },
    { "comment": "Minor formatting issue", "page_ref": "5", "disposition": "MINOR" }
  ]
}
```

### POST /reviews/:reviewId/approve
```json
{
  "final_status": "APPROVED_A",
  "comments": [{ "comment": "Approved. Well prepared document." }]
}
```

---

## Static File Serving

All uploaded files served at:
```
GET /uploads/{relativePath}
```

Examples:
```
/uploads/documents/proj-id/boq-id/DOC-001/rev0/1234567890-document.pdf
/uploads/ams/1234567890-123456789-AMS_Letter.pdf
/uploads/comment-sheets/review-uuid.pdf
/uploads/boq/1234567890-123.xlsx
```

Frontend constructs URLs as:
```typescript
const baseUrl = env?.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000';
const fileUrl = `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/')}`;
```
