# 03 — Business Process Flows

## Flow 1: User Onboarding

```
[Anyone]
    │
    ▼
POST /auth/register
  { name, email, password, institution_id, unit_id, role }
    │
    ▼
User created → status: PENDING
    │
    ▼
[ADMIN logs in]
    │
    ▼
GET /admin/users/pending → sees list
    │
    ▼
PATCH /admin/users/:id/approve  OR  PATCH /admin/users/:id/reject
    │
    ▼
User status → APPROVED (can log in) OR REJECTED
```

---

## Flow 2: Project Creation and Setup

```
[PIC_PROJECT or ADMIN]
    │
    ▼
POST /projects
  { name, description, contract_signing_date, contract_effective_date,
    duration_days, warranty_period_days, project_type, urgency,
    nominal_values: [{currency, amount}] }
    │
    ▼
Project created (owner_unit = PIC's unit)
    │
    ├──▶ POST /projects/:id/vendors
    │      { vendor_institution_id }
    │      → Grants VENDOR institution access to see project
    │
    └──▶ POST /projects/:projectId/boq/upload
           (Excel file, field: boq_file)
           → Parses Excel, upserts BoqItem rows with parent-child hierarchy
           → system_tag generated per item

[If contract changes]
    │
    ▼
POST /projects/:id/amendments
  { amendment_reason, effective_date, new_duration_days, new_nominal_values }
    │
    ▼
ProjectAmendment record created, Project.duration_days updated
```

---

## Flow 3: BOQ Excel Upload Format

The Excel file parsed by `boqService.uploadBoq()` expects:

| Column | Meaning |
|--------|---------|
| Item Code | Hierarchical code (e.g., `1`, `1.1`, `1.1.1`) |
| Level | 1, 2, or 3+ |
| System Tag | Unique tag for this BOQ line |
| Title | Display name |
| Description | Optional |
| Sort Order | Integer for ordering |

- Parent-child relationships determined by `parent_item_id` field or level
- Re-upload uses **upsert** on `[project_id, item_code]` composite key — safe to re-upload
- Delete all BOQ: `DELETE /projects/:projectId/boq` — cascades to all documents and reviews

---

## Flow 4: Document Submission by Vendor

```
[VENDOR user — must have visibility on the project]
    │
    ▼
Navigate to BOQ item → Document section (FIELD_ITP / PROCEDURE / WORK_METHOD)
    │
    ▼
Fill DocumentUploadForm:
  { boq_item_id, section, doc_number, title, surat_pengantar_no?, files[] }
    │
    ▼
POST /documents (multipart/form-data, field: files)
    │
    ├── VALIDATION: Is section WORK_METHOD?
    │     YES → Check that FIELD_ITP + PROCEDURE both exist AND are APPROVED_A
    │            If not → 422 error "Phase 1 documents required"
    │     NO → proceed
    │
    ▼
Document created:
  status = DRAFT
  revision_no = 0
  is_current = true
    │
    ▼
DocumentFile records created for each PDF
Files moved to:
  uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev0/{filename}
```

### Document Revision Flow

```
[VENDOR — only if document status is REJECTED_C or APPROVED_WITH_COMMENTS_B]
    │
    ▼
POST /documents/:documentId/revisions
  { section, doc_number, title, surat_pengantar_no?, files[] }
    │
    ▼
Old document → is_current=false, status=SUPERSEDED
New document → revision_no+1, status=DRAFT, is_current=true
Files → uploads/documents/.../rev{N}/{filename}
```

---

## Flow 5: Review Workflow (3-Stage)

This is the core business process. See `06-review-workflow-and-sla.md` for deep detail.

```
[VENDOR]
    │
    ▼
POST /reviews  { document_id }
    → Document status → SUBMITTED
    → DocumentReview created
    → SLA deadline = now + DEFAULT_SLA_DAYS (default: 7)
    → current_stage = REVIEW

─────────────────────────────────────────────────────
STAGE 1: REVIEW  (assigned to REVIEWER)
─────────────────────────────────────────────────────

[REVIEWER opens review at /reviews/:reviewId]
    │
    ▼
Reads original documents (PDF links)
Adds comments:
  POST /reviews/:reviewId/review
    { checker_id, approver_id,
      comments: [{ comment, page_ref?, disposition? }] }
    │
    ▼
DocumentReview.reviewed_at = now
DocumentReview.checker_id, approver_id set
Document status → IN_REVIEW
current_stage = CHECK

─────────────────────────────────────────────────────
STAGE 2: CHECK  (assigned to CHECKER)
─────────────────────────────────────────────────────

[CHECKER opens review]
    │
    ▼
Verifies reviewer comments
POST /reviews/:reviewId/check
  { comments: [{ comment? }] }  ← optional notes
    │
    ▼
DocumentReview.checked_at = now
current_stage = APPROVE

─────────────────────────────────────────────────────
STAGE 3: APPROVE  (assigned to APPROVER)
─────────────────────────────────────────────────────

[APPROVER opens review]
    │
    ▼
Sets final decision:
POST /reviews/:reviewId/approve
  { final_status: 'APPROVED_A' | 'APPROVED_WITH_COMMENTS_B' | 'REJECTED_C',
    comments: [{ comment? }] }
    │
    ▼
DocumentReview.approved_at = now
DocumentReview.final_status = chosen status
Document.status = final_status
current_stage = COMPLETE

IF final_status = APPROVED_A:
  → Generate PDF comment sheet
  → Store at uploads/comment-sheets/{reviewId}.pdf
  → DocumentReview.comment_sheet_path set

─────────────────────────────────────────────────────
STAGE 4: AMS LETTER  (uploaded by REVIEWER)
─────────────────────────────────────────────────────

[REVIEWER — at any point after review is complete]
    │
    ▼
POST /reviews/:reviewId/ams-letter  (multipart, field: ams_file)
    │
    ▼
AmsLetter record created (one per review, replaces previous if exists)
File stored at uploads/ams/{timestamp}-{filename}.pdf
Dashboard duration metric updated
```

---

## Flow 6: Document Status Transitions

```
DRAFT
  │
  └─[VENDOR submits for review]──▶ SUBMITTED
                                        │
                                        └─[REVIEWER adds comments]──▶ IN_REVIEW
                                                                           │
                                          ┌────────────────────────────────┤
                                          ▼                                │
                                    APPROVED_A                    APPROVED_WITH_COMMENTS_B
                                   (no further                          │
                                     action)                  [VENDOR creates revision]
                                                                        │
                                                                        ▼
                                                                      DRAFT (rev N+1)

                                     REJECTED_C ◀── (APPROVER decision)
                                          │
                                 [VENDOR creates revision]
                                          │
                                          ▼
                                     DRAFT (rev N+1)

SUPERSEDED  ←── (old document when revision is created)
```

---

## Flow 7: Project Urgency Classification

When creating or editing a project, PIC assigns urgency:

| Urgency Level | Display Name | Meaning |
|---------------|-------------|---------|
| `KINERJA_KORPORAT` | Kinerja Korporat | Corporate KPI impact — highest priority |
| `KERAWANAN_SISTEM` | Kerawanan Sistem | System vulnerability — high priority |
| `RUPTL` | RUPTL | National electricity plan — medium priority |
| `NORMAL` | Normal Priority | Standard project — lowest priority |

- Default urgency = `NORMAL`
- Dashboard sorts projects: KINERJA_KORPORAT → KERAWANAN_SISTEM → RUPTL → NORMAL
- Each urgency has a color theme (red, orange, blue, gray)

---

## Flow 8: Vendor Access Management

```
[PIC_PROJECT]
    │
    ▼
POST /projects/:id/vendors
  { vendor_institution_id }
    │
    ▼
ProjectVendorVisibility record created
VENDOR users from that institution can now:
  - See the project in their list
  - Upload BOQ
  - Submit documents
    │
    ▼
[If access should be revoked]
    │
    ▼
DELETE /projects/:id/vendors/:vendorInstitutionId
    │
    ▼
VENDOR users can no longer see or access the project
```

---

## Flow 9: QR Code Verification

Every completed review (APPROVED_A) has a `qr_hash` field on DocumentReview.

```
GET /verify/:hash  (public — no auth required)
    │
    ▼
Returns: document info, project name, final status, reviewer/checker/approver names,
         approval date — allows anyone to verify authenticity of printed approval
```

---

## Flow 10: Dashboard Data Flow

```
GET /projects/dashboard  (auth required)
    │
    ▼
Backend aggregates:
  1. All projects (filtered by role context)
  2. Document status breakdown per project (via BoqItem → Document query)
  3. Overdue reviews (final_status IS NULL AND sla_deadline < now)
  4. AMS letters (for duration calculation)
    │
    ▼
Returns:
  summary: { total_projects, total_docs, remaining_docs, overdue_reviews,
             completion_rate, avg_review_duration_days, min/max, total_ams_released }
  projects[]: { ...project data, doc_summary, overdue_reviews[],
                avg_review_duration_days, ams_count }
```
