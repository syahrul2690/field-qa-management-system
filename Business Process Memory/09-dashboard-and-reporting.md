# 09 — Dashboard and Reporting

## Dashboard Page (`/dashboard`)

The dashboard is the **home page** after login (redirected from `/`). It shows a portfolio-level view of all projects — urgency, document completion, overdue reviews, and review cycle time.

---

## Summary Statistics Row

Five stat cards across the top:

| Card | Value | Color Logic |
|------|-------|-------------|
| Total Projects | Count of all projects | Gray |
| Total Documents | All current documents across all projects | Gray |
| Remaining Docs | Docs in DRAFT / SUBMITTED / IN_REVIEW | Blue if > 0 |
| Overdue Reviews | Reviews with no final_status and past SLA | Red if > 0 |
| Completion Rate | `completedDocs / totalDocs * 100`% | Green ≥80%, Yellow ≥50%, Orange <50% |

**Completed docs** = status in `{APPROVED_A, APPROVED_WITH_COMMENTS_B, REJECTED_C, SUPERSEDED}`  
**Remaining docs** = status in `{DRAFT, SUBMITTED, IN_REVIEW}`

---

## Review Duration Gauge

Shows the average time (in days) from vendor document submission to AMS letter release.

```
[Duration Gauge Component]
────────────────────────────────────────────────────
  Avg Review Duration
  
  14.3d    average · 7 AMS released
  ████████████░░░░░░░░░░░░░░░░░░░░ (bar, 60d scale)
  
  Min: 5d          submission → AMS letter         Max: 28d

  🟢 ≤14d target   🟡 15–30d caution   🔴 >30d overrun
────────────────────────────────────────────────────
```

**Color thresholds:**
- 🟢 Green: avg ≤ 14 days (on target)
- 🟡 Yellow: 15–30 days (caution)
- 🔴 Red: > 30 days (overrun)

**When no AMS letters exist:**
> "No AMS letters uploaded yet. Duration is measured from vendor submission to AMS letter release."

**Duration calculation:**
```
duration_days = (AmsLetter.created_at - DocumentReview.created_at) in days
avg = mean of all durations (for all projects the user can see)
```

---

## Project Criticality Legend

Shows count of projects per urgency level with color badges:

```
[Criticality Legend]
  Project Criticality
  
  🔴 Kinerja Korporat [2]   🟠 Kerawanan Sistem [1]
  🔵 RUPTL [3]              ⚪ Normal Priority [5]
  
  "Kinerja Korporat and Kerawanan Sistem projects appear first."
```

---

## Per-Project Cards

Projects are displayed in four sections, in order: Kinerja Korporat → Kerawanan Sistem → RUPTL → Normal Priority.

Each card has a **colored left border** matching urgency, and is **clickable** (navigates to `/projects/:id`).

### Card Anatomy

```
┌─── [orange left border] ─────────────────────────┐
│ Pembangkit                                        │
│ PLTU Kendari 2x50MW                               │
│ 01 Feb 2025 → 31 Jan 2027   28d left              │
│                          [Kerawanan Sistem badge] │
├───────────────────────────────────────────────────┤
│ Document Completion                          67%  │
│ ████████████████████░░░░░░░░░  (orange bar)       │
│ 32 of 48 docs completed   16 remaining            │
├───────────────────────────────────────────────────┤
│ [Approved A 12] [In Review 8] [Submitted 4]       │
│ [Draft 16] [Rejected C 2]                         │
├───────────────────────────────────────────────────┤
│ ⏱ Avg review cycle: 18.5d · 12 AMS released      │
├───────────────────────────────────────────────────┤
│ ⚠ 3 Overdue Reviews                              │
│ DOC-001 Field ITP Boiler                         │
│   12d overdue · SLA 15 Jan · Waiting for Checker  │
│ DOC-005 Procedure Turbine                        │
│   5d overdue · SLA 22 Jan · Waiting for Reviewer  │
└───────────────────────────────────────────────────┘
```

### Document Status Chips (all statuses shown if count > 0)

| Status | Color |
|--------|-------|
| APPROVED_A | Green |
| APPROVED_WITH_COMMENTS_B | Teal |
| REJECTED_C | Red |
| IN_REVIEW | Blue |
| SUBMITTED | Violet |
| DRAFT | Gray |
| SUPERSEDED | Light Gray |

### Days Remaining Color
- Black: > 30 days left
- Orange: 1–30 days left
- Red: Negative (contract overdue)

### Per-Project Duration Chip
Shown only if `ams_count > 0`:
```
⏱ Avg review cycle: {N}d · {count} AMS released
```
Color: Green (≤14d), Yellow (≤30d), Red (>30d)

---

## Backend Dashboard Endpoint

`GET /projects/dashboard` → `projectController.getDashboard` → `projectService.getDashboardData()`

### Response Shape
```typescript
{
  summary: {
    total_projects: number,
    total_docs: number,
    remaining_docs: number,
    overdue_reviews: number,
    completion_rate: number,           // 0–100
    avg_review_duration_days: number | null,
    min_review_duration_days: number | null,
    max_review_duration_days: number | null,
    total_ams_released: number,
  },
  projects: Array<{
    id: string,
    name: string,
    project_type: string,
    urgency: 'NORMAL' | 'RUPTL' | 'KERAWANAN_SISTEM' | 'KINERJA_KORPORAT',
    contract_effective_date: string,
    end_date: string,                  // computed: effective + duration_days
    total_docs: number,
    completed_docs: number,
    remaining_docs: number,
    completion_rate: number,
    doc_summary: Record<string, number>,  // { 'APPROVED_A': 5, 'DRAFT': 3, ... }
    overdue_reviews: Array<{
      review_id: string,
      document_title: string,
      doc_number: string,
      section: string,
      sla_deadline: string | null,
      days_overdue: number,
      stage: 'Waiting for Reviewer' | 'Waiting for Checker' | 'Waiting for Approver',
    }>,
    avg_review_duration_days: number | null,
    ams_count: number,
  }>
}
```

### Backend Query Strategy
1. Fetch all projects (filtered by role context)
2. Fetch all BoqItems for those projects with nested current documents
3. Fetch all overdue DocumentReviews (final_status NULL + sla_deadline < now)
4. Fetch all AmsLetters with their review.created_at + project
5. Compute all aggregates in memory
6. Return combined result

### Auto-Refresh
Dashboard uses `refetchInterval: 60_000` — refreshes every 60 seconds automatically.

---

## Project List Page

`/projects` — full-width edge-to-edge cards (separate from dashboard):

Each card shows:
- Project name, type badge
- Contract dates (effective → end)
- Document status strip (grouped by status, showing actual document names per status)
- Footer: total doc count

Document strip display:
```typescript
// STATUS_CONFIG defines order: IN_REVIEW first
const STATUS_CONFIG = [
  { key: 'IN_REVIEW', label: 'In Review', ... },
  { key: 'SUBMITTED', ... },
  { key: 'APPROVED_A', ... },
  // ...etc
]
```

Each status group expands to show document names:
```
[In Review 3]
  · DOC-001 Field ITP Boiler Unit 1
  · DOC-005 Procedure Steam Turbine
  · DOC-008 Work Method Commissioning
```
