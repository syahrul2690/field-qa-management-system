# 06 — Review Workflow and SLA Deep Dive

## Overview

The review workflow is the **core business process** of this system. Every document submitted by a vendor must pass through a mandatory 3-stage consultant review before being approved. An AMS (Approval Monitoring Sheet) letter is then issued by the reviewer to formally close the cycle.

---

## Stage Machine

The current stage is **computed from timestamps** — never stored as a column.

```typescript
// slaService.ts
function getCurrentStage(reviewedAt, checkedAt, approvedAt):
  'REVIEW' | 'CHECK' | 'APPROVE' | 'COMPLETE'

if (!reviewedAt) return 'REVIEW';
if (!checkedAt)  return 'CHECK';
if (!approvedAt) return 'APPROVE';
return 'COMPLETE';
```

| Stage | Condition | Actor | DocumentReview field set |
|-------|-----------|-------|--------------------------|
| `REVIEW` | `reviewed_at IS NULL` | REVIEWER | Sets: `reviewed_at`, `reviewer_id`, `checker_id`, `approver_id` |
| `CHECK` | `reviewed_at NOT NULL`, `checked_at IS NULL` | CHECKER | Sets: `checked_at` |
| `APPROVE` | `checked_at NOT NULL`, `approved_at IS NULL` | APPROVER | Sets: `approved_at`, `final_status` |
| `COMPLETE` | all timestamps set | — | — |

---

## Stage 1: REVIEW

**Trigger:** VENDOR calls `POST /reviews` → `document.status = SUBMITTED`, stage = REVIEW

**What REVIEWER does:**
1. Opens `/reviews/:reviewId` — can see all original document PDFs
2. Reads document, adds comments:
   - `page_ref`: which page (optional, e.g., "12" or "3-5")
   - `comment`: text of the comment (required)
   - `disposition`: `MAJOR` | `MINOR` | `INFO`
3. Assigns CHECKER and APPROVER from peer list
4. Calls `POST /reviews/:reviewId/review` with all the above

**Backend processing (`addReviewerAndComments`):**
```
1. Verify reviewer is assigned to this review (or can take it)
2. Validate checker_id and approver_id exist and have correct roles
3. Optimistic lock: updateMany with version check → 409 if concurrent
4. Set reviewed_at = now, version++
5. Create ReviewComment records
6. Update Document.status = IN_REVIEW
```

**Frontend gating:**
```typescript
const canAddComment = isReviewer && review?.status === 'SUBMITTED';
```

---

## Stage 2: CHECK

**What CHECKER does:**
1. Opens review — sees all comments made by reviewer
2. Verifies the review is thorough
3. Optionally adds notes (stored as ReviewComment with no disposition)
4. Calls `POST /reviews/:reviewId/check`

**Frontend gating:**
```typescript
const canCheck = isChecker && review?.current_stage === 'CHECK';
```

**Waiting state:** If checker opens review at REVIEW stage, they see a yellow info box:
> "Waiting for reviewer. The check form will appear here once the reviewer has submitted their comments."

---

## Stage 3: APPROVE

**What APPROVER does:**
1. Opens review — sees all comments from reviewer + checker notes
2. Sets final status:
   - **Status A** (`APPROVED_A`): Fully accepted
   - **Status B** (`APPROVED_WITH_COMMENTS_B`): Accepted but vendor must address feedback
   - **Status C** (`REJECTED_C`): Rejected, full resubmission required
3. Optionally adds approval notes
4. Calls `POST /reviews/:reviewId/approve`

**Backend processing (`approveDocument`):**
```
1. Validate final_status value
2. Optimistic lock: updateMany with version check → 409 if concurrent
3. Set approved_at = now, final_status, version++
4. Update Document.status = final_status
5. IF final_status = APPROVED_A:
   → Generate PDF comment sheet
   → Save to uploads/comment-sheets/{reviewId}.pdf
   → Set DocumentReview.comment_sheet_path
```

**Frontend gating:**
```typescript
const canApprove = isApprover && review?.current_stage === 'APPROVE';
```

**Waiting state:** If approver opens review before CHECK is complete, they see:
> "Waiting for checker. The approval form will appear here once the checker has completed their review."

---

## Stage 4: AMS Letter Upload

**Timing:** REVIEWER can only upload AFTER the Approver has issued a final decision (`final_status IS NOT NULL` / `current_stage === 'COMPLETE'`). The upload button is locked before that.

**Gate conditions:**
```typescript
// Frontend
const isComplete    = review?.current_stage === 'COMPLETE';
const canUploadAms  = isReviewer && isComplete;

// Backend (reviewService.uploadAmsLetter)
if (!review.final_status) {
  throw new AppError('AMS letter can only be uploaded after the document has received a final approval status.', 403);
}
```

**AMS section states on ReviewDetailPage:**

| State | Who sees what |
|-------|--------------|
| Not complete yet | Everyone: locked padlock icon — "Available after Approver issues final decision" |
| Complete, no AMS | REVIEWER: amber warning + "Choose PDF" + "Upload AMS Letter" button |
| Complete, no AMS | Others: "AMS letter not yet uploaded by the reviewer." |
| Complete, AMS exists | Everyone: file name, release date, uploader name, file size, Open button |
| Complete, AMS exists | REVIEWER only: additional "Replace" button |

**What REVIEWER does:**
1. Approver sets final status → `current_stage` becomes `COMPLETE`
2. REVIEWER opens ReviewDetailPage → AMS section unlocks with amber prompt
3. Clicks "Choose PDF" → selects file → clicks "Upload AMS Letter"
4. If replacing: clicks "Replace" → picks new file → uploads immediately

**Backend processing (`uploadAmsLetter`):**
```
1. Verify review exists → 404 if not
2. Verify review.final_status IS NOT NULL → 403 if still in progress
3. Move file from temp (uploads/ams/) to permanent path: uploads/ams/{filename}
4. If existing AmsLetter: delete old file from disk, delete old DB record
5. Create new AmsLetter record
```

**Duration measurement:**
```
Review Cycle Duration = AmsLetter.created_at - DocumentReview.created_at
(in days, rounded to 1 decimal)
```

---

## SLA (Service Level Agreement)

### Deadline Calculation
```typescript
// slaService.ts
function calculateSlaDeadline(submittedAt: Date, slaDays?: number): Date {
  const days = slaDays ?? config.sla.defaultDays; // default: 7 days
  const deadline = new Date(submittedAt);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}
```
- SLA deadline set at `submitForReview()` creation time
- Stored in `DocumentReview.sla_deadline`
- Default: 7 days (configurable via `DEFAULT_SLA_DAYS` env var)

### Overdue Detection
```typescript
function isOverdue(slaDeadline?, finalStatus?): boolean {
  if (finalStatus) return false;  // completed reviews are never overdue
  if (!slaDeadline) return false;
  return new Date() > new Date(slaDeadline);
}
```

### Dashboard Overdue Query
```sql
-- Reviews where deadline passed and not yet complete
SELECT * FROM DocumentReview
WHERE final_status IS NULL
  AND sla_deadline < NOW()
  AND document.boq_item.project_id IN (...)
```

---

## Review Detail Page — UI Components

The `ReviewDetailPage.tsx` shows panels based on user role and review state:

```
┌─────────────────────────────────────────────┐
│ Document Header                              │
│  - doc number, title, project, section      │
│  - status badge                             │
│  - Comment Sheet download (if APPROVED_A)  │
│  - submitted date, SLA deadline             │
├─────────────────────────────────────────────┤
│ Review Team (3 cards)                        │
│  [Reviewer]  [Checker]   [Approver]         │
│  Active stage highlighted in blue           │
├─────────────────────────────────────────────┤
│ Original Documents (PDF links)               │
├─────────────────────────────────────────────┤
│ AMS Letter Panel                             │
│  - If exists: file name, date, uploader,    │
│    Open + Replace (REVIEWER only)           │
│  - If none: "Choose PDF" + Upload button    │
│    (REVIEWER only)                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Comments List                                │
│  Each comment: name, page_ref,              │
│  disposition badge, timestamp, text         │
└─────────────────────────────────────────────┘

[Conditional panels based on role + stage:]

REVIEWER + status=SUBMITTED:
┌─────────────────────────────────────────────┐
│ Add Review Comment                           │
│  - Page Reference input                     │
│  - Disposition select (MAJOR/MINOR/INFO)    │
│  - Comment textarea                         │
│  - Checker dropdown                         │
│  - Approver dropdown                        │
│  [Submit Review Package]                    │
└─────────────────────────────────────────────┘

CHECKER + stage=REVIEW (not yet their turn):
┌─────────────────────────────────────────────┐
│ ⚠ Waiting for reviewer. Check form appears  │
│   once reviewer submits.                    │
└─────────────────────────────────────────────┘

CHECKER + stage=CHECK:
┌─────────────────────────────────────────────┐
│ Checker Action                               │
│  - Notes textarea (optional)                │
│  [Confirm Check]                            │
└─────────────────────────────────────────────┘

APPROVER + stage≠APPROVE (not their turn):
┌─────────────────────────────────────────────┐
│ ⚠ Waiting for checker.                      │
└─────────────────────────────────────────────┘

APPROVER + stage=APPROVE:
┌─────────────────────────────────────────────┐
│ Approver Decision                            │
│  - Status radio (A / B / C)                 │
│  - Notes textarea (optional)                │
│  [Submit Final Decision]                    │
└─────────────────────────────────────────────┘
```

---

## Pending Reviews Queue (`/reviews`)

`GET /reviews/pending` returns different sets per role:

| Role | Returns |
|------|---------|
| REVIEWER | Reviews where `final_status IS NULL` and `reviewer_id = actorId` (or unassigned in REVIEW stage) |
| CHECKER | Reviews where `checker_id = actorId` and `stage = CHECK` |
| APPROVER | Reviews where `approver_id = actorId` and `stage = APPROVE` |
| Other | Empty array |

---

## Comment Sheet PDF (Status A Only)

Generated automatically when Approver selects `APPROVED_A`:
- File: `uploads/comment-sheets/{reviewId}.pdf`
- Contains: document metadata, project name, review team names, all comments with page refs, QR code for verification
- Downloaded via `GET /reviews/:reviewId/comment-sheet` (binary blob)
- Frontend triggers download as `comment-sheet-{reviewId}.xlsx` (note: actually PDF despite .xlsx extension — worth fixing someday)

---

## Optimistic Locking Detail

`DocumentReview.version` prevents two people updating the same review simultaneously:

```typescript
// In addReviewerAndComments, checkDocument, approveDocument:
const result = await prisma.documentReview.updateMany({
  where: { id: reviewId, version: currentVersion },
  data: { ..., version: currentVersion + 1 }
});

if (result.count === 0) {
  throw new AppError('Review was modified concurrently. Please refresh.', 409);
}
```
