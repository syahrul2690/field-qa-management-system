# 11 — Key Decisions, Gotchas, and Lessons Learned

> This file records non-obvious decisions, bugs that were fixed, and patterns to avoid repeating. Read this before making any changes to existing features.

---

## AMS Letter Upload Gate

AMS letter upload is **locked until the Approver issues a final decision**.

- Before `current_stage === 'COMPLETE'`: the AMS section shows a padlock icon with an explanatory message. No upload controls are rendered for any role.
- After `COMPLETE`: REVIEWER sees an amber prompt to upload; all other roles see a neutral "not yet uploaded" message.
- Backend double-checks: `reviewService.uploadAmsLetter()` throws 403 if `review.final_status IS NULL`.

**Why:** AMS letter records the date the full review cycle closes (vendor submission → approver decision → AMS release). It must only be uploadable after the cycle is genuinely complete, so the duration metric is meaningful.

**Do not** remove the `!isComplete` guard from the frontend or the `!review.final_status` check from the backend — they are intentional business logic gates, not defensive programming.

---

## Schema / Migration Gotchas

### ❌ Never use `prisma migrate dev` in scripts or non-interactive shells
It requires a TTY. It will always fail with "non-interactive environment" error.  
**✅ Do instead:** Create migration SQL manually → `prisma migrate deploy`

### Renaming enum values requires a manual migration
PostgreSQL does not support `ALTER TYPE ... RENAME VALUE` in all versions.  
The safe pattern used in this project:
```sql
-- 1. Drop column default (it depends on the enum)
ALTER TABLE "Project" ALTER COLUMN "urgency" DROP DEFAULT;
-- 2. Cast to text
ALTER TABLE "Project" ALTER COLUMN "urgency" TYPE TEXT;
-- 3. Remap values
UPDATE "Project" SET "urgency" = 'NEW_VALUE' WHERE "urgency" = 'OLD_VALUE';
-- 4. Drop old enum
DROP TYPE "ProjectUrgency";
-- 5. Create new enum
CREATE TYPE "ProjectUrgency" AS ENUM ('NEW_VALUE', ...);
-- 6. Cast back
ALTER TABLE "Project" ALTER COLUMN "urgency" TYPE "ProjectUrgency" USING "urgency"::"ProjectUrgency";
-- 7. Restore default
ALTER TABLE "Project" ALTER COLUMN "urgency" SET DEFAULT 'NEW_VALUE'::"ProjectUrgency";
ALTER TABLE "Project" ALTER COLUMN "urgency" SET NOT NULL;
```

### After any failed migration, mark it rolled back before retrying
```bash
npx prisma migrate resolve --rolled-back {migration_name}
npx prisma migrate deploy
```

### Always run `prisma generate` after schema changes
The Prisma Client is not automatically updated. Run:
```bash
cd backend && npx prisma generate
```

---

## Route Registration Order (Critical)

Express matches routes top-to-bottom. **Specific paths must always be registered BEFORE parametric paths.**

```typescript
// ✅ CORRECT
router.get('/pending', handler);        // must come before /:reviewId
router.get('/dashboard', handler);      // must come before /:id
router.get('/history', handler);        // must come before /:documentId
router.get('/:id', handler);            // parametric last

// ❌ WRONG — /:id will shadow /pending, /dashboard, /history
router.get('/:id', handler);
router.get('/pending', handler);
```

This applies to:
- `GET /projects/dashboard` before `GET /projects/:id`
- `GET /reviews/pending` before `GET /reviews/:reviewId`
- `GET /documents/history` before `GET /documents/:documentId`

---

## Review Workflow Logic

### Stage is computed, not stored
```typescript
// currentStage derived in slaService.getCurrentStage()
// NOT a database column — computed on every getReviewById() call
```

### Checker and Approver are assigned by Reviewer, not by system
The REVIEWER selects specific users for checker and approver at the time of submitting their comments. Those users are stored in `DocumentReview.checker_id` and `DocumentReview.approver_id`.

### Approver can only act after Checker completes
Even if approver_id is set, the APPROVE stage only activates when `checked_at IS NOT NULL`.

### AMS letter can be uploaded at any time by REVIEWER
Not gated behind final_status. Can upload before or after completion.

### Comment sheet only generated for Status A (APPROVED_A)
Status B and C approvals do NOT auto-generate a PDF.

---

## File Upload Gotchas

### Document files: multer lands in flat directory, service moves them
```
multer saves to:  uploads/documents/{filename}
service moves to: uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev{N}/{filename}
```
If `fileStorageService.storeDocumentFile()` is not called, files pile up in the flat directory.

### AMS letter replacement deletes old file from disk
```typescript
// reviewService.uploadAmsLetter() deletes old file before creating new record
if (existing) {
  fs.unlinkSync(path.join('uploads', existing.file_path)); // ← hard delete
  await prisma.amsLetter.delete({ where: { review_id: reviewId } });
}
```

### Windows path separators in stored paths
Stored paths may have `\` on Windows. Always normalize before use:
```typescript
file.file_path.replace(/\\/g, '/')
```

### Static file serving has no authentication
Anyone with the URL can access any uploaded file. Not suitable for sensitive documents in production without adding auth middleware to `/uploads`.

---

## BOQ Upload Gotchas

### Re-upload uses upsert to avoid unique constraint violation
The original implementation used `create()` which threw `P2002` on re-upload.  
**Fixed:** Changed to `upsert()` on composite key `[project_id, item_code]`.

```typescript
// Safe for re-upload:
await tx.boqItem.upsert({
  where: { project_id_item_code: { project_id, item_code } },
  create: { ...allFields },
  update: { parent_item_id, level, system_tag, title, description, sort_order },
});
```

---

## Frontend API Response Shape

All API responses are:
```json
{ "success": true, "data": { ... } }
```

In React Query:
```typescript
const result = useQuery({ queryFn: () => projectApi.get(id) });
const project = result.data?.data?.data;  // triple .data
//                          ^^^   ^^^
//                   axios resp  API wrapper
```

---

## Vendor Display (ProjectDetailPage)

The project detail page shows vendors via `project.vendor_visibility` (not `project.vendors`).

```typescript
// ✅ CORRECT
project?.vendor_visibility?.map(v => v.vendor_institution?.name)
// ❌ WRONG
project?.vendors?.map(v => v.vendor_name)
```

To remove a vendor:
```typescript
removeVendorMutation.mutate(vendor.vendor_institution_id)
// ❌ NOT vendor.id — that's the visibility join table record ID
```

---

## BOQ Level Display

Level 1 items are BOLD. Level 2 and 3+ are normal weight. This was iterated multiple times:

```typescript
const LEVEL_STYLES = {
  1: { font: 'font-bold text-gray-900', padding: 'py-2.5 border-t border-gray-200' },
  2: { font: 'font-normal text-gray-700', padding: 'py-2' },
  // 3 and beyond:
  default: { font: 'font-normal text-gray-500', padding: 'py-1.5' },
};
```
**Rule: Only Level 1 is bold. All others are normal weight.**

---

## Profile Page / Role Change

- Role field is a `<select>` for ADMIN users only
- For all other roles, role is shown as a plain `<div>` (not editable)
- Backend guards: only ADMIN can change role via `PATCH /auth/me`

---

## PDF Attachment URLs (ReviewDetailPage)

The PDF URL must include `/uploads/` prefix and normalize backslashes:
```typescript
const url = `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/')}`;
// ❌ Missing /uploads/ was a bug — produced 404 for file downloads
```

---

## Approval Payload Field Names

The approve endpoint requires specific field names:
```typescript
// ✅ CORRECT
{ final_status: 'APPROVED_A', comments: [{ comment: '...' }] }
// ❌ WRONG (old bug)
{ status: 'APPROVED_A', notes: '...' }
```

The check endpoint:
```typescript
// ✅ CORRECT
{ comments: [{ comment: '...' }] }
// ❌ WRONG (old bug)
{ notes: '...' }
```

---

## Urgency Enum History

The urgency levels were originally named LOW/MEDIUM/HIGH/CRITICAL (English).  
They were **renamed** to Indonesian terms:

| Old | New |
|-----|-----|
| `LOW` | `NORMAL` |
| `MEDIUM` | `RUPTL` |
| `HIGH` | `KERAWANAN_SISTEM` |
| `CRITICAL` | `KINERJA_KORPORAT` |

This required a manual SQL migration (see migration `20260408180000`).  
The default urgency value is `NORMAL`.

---

## Default Navigation

The root URL `/` redirects to `/dashboard` (not `/projects`).  
This was changed when the Dashboard feature was added (previously `/projects`).

---

## Comment Sheet Download Extension Mismatch

The frontend saves the comment sheet as `.xlsx` despite it being a PDF:
```typescript
a.download = `comment-sheet-${reviewId}.xlsx`; // should be .pdf someday
```
This is a known inconsistency — the file opens correctly in PDF viewers regardless.
