# 07 — Frontend Structure

## Technology
- React 18 + TypeScript + Vite
- React Router v6 (file: `src/App.tsx`)
- TanStack Query v5 (React Query) for server state
- Zustand for client state (`authStore`, `uiStore`)
- Tailwind CSS with custom utility classes
- Axios with interceptors for auth token refresh

---

## Route Map (`src/App.tsx`)

```
/login                          → LoginPage (public)
/register                       → RegisterPage (public)
/pending-approval               → PendingApprovalPage (public)

/ (AuthGuard → AppLayout)
  /                             → redirects to /dashboard
  /dashboard                    → DashboardPage (all roles)
  /projects                     → ProjectListPage (all roles)
  /projects/new                 → ProjectFormPage (PIC_PROJECT, ADMIN)
  /projects/:id                 → ProjectDetailPage (all roles)
  /projects/:id/edit            → ProjectEditPage (PIC_PROJECT, ADMIN)
  /projects/:id/boq             → BoqTreePage (all roles)
  /reviews                      → ReviewDashboard (REVIEWER, CHECKER, APPROVER)
  /reviews/:reviewId            → ReviewDetailPage (all roles)
  /profile                      → ProfilePage (all roles)
  /admin/users                  → UserManagementPage (ADMIN)
  /admin/institutions           → InstitutionManagementPage (ADMIN)
  *                             → redirects to /
```

---

## Feature Pages

### `/features/auth/`
| File | Purpose |
|------|---------|
| `LoginPage.tsx` | Split-screen login: left dark navy panel (dot-grid, radial glows, logo, headline, 3 bullets), right login form |
| `RegisterPage.tsx` | Registration form with institution/unit selection |
| `PendingApprovalPage.tsx` | Shown to users awaiting admin approval |

### `/features/admin/`
| File | Purpose |
|------|---------|
| `UserManagementPage.tsx` | List all users, pending approvals, approve/reject/suspend actions |
| `InstitutionManagementPage.tsx` | Create/list institutions and units |

### `/features/projects/`
| File | Purpose |
|------|---------|
| `ProjectListPage.tsx` | Full-width edge-to-edge cards, document status strip, group docs by status with pill badges |
| `ProjectDetailPage.tsx` | Project info, vendor access management (PIC/ADMIN), edit button, BOQ link, document sections |
| `ProjectFormPage.tsx` | Create project: name, type, urgency button-group, description, dates, warranty, nominal values |
| `ProjectEditPage.tsx` | Edit project: same fields except contract dates (read-only) + amendment note |

**Urgency Selector (both form pages):**
```typescript
const URGENCY_OPTIONS = [
  { label: 'Normal Priority',  value: 'NORMAL',           cls: 'text-gray-700 bg-gray-50 border-gray-200' },
  { label: 'RUPTL',            value: 'RUPTL',            cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Kerawanan Sistem', value: 'KERAWANAN_SISTEM', cls: 'text-orange-700 bg-orange-50 border-orange-200' },
  { label: 'Kinerja Korporat', value: 'KINERJA_KORPORAT', cls: 'text-red-700 bg-red-50 border-red-200' },
];
```
Default state: `'NORMAL'`

### `/features/boq/`
| File | Purpose |
|------|---------|
| `BoqTreePage.tsx` | Recursive BOQ tree, indentation by level, upload modal trigger, document status per item |
| `BoqItemDetailPanel.tsx` | Side panel for selected BOQ item |
| `BoqUploadModal.tsx` | Excel upload modal with drag-drop |

**BOQ level styles:**
```typescript
const LEVEL_STYLES = {
  1: { font: 'font-bold text-gray-900', padding: 'py-2.5 border-t border-gray-200' },
  2: { font: 'font-normal text-gray-700', padding: 'py-2' },
  default: { font: 'font-normal text-gray-500', padding: 'py-1.5' },
};
```

### `/features/documents/`
| File | Purpose |
|------|---------|
| `DocumentUploadForm.tsx` | Upload form within BOQ item context; VENDOR only; file drag-drop |

### `/features/reviews/`
| File | Purpose |
|------|---------|
| `ReviewDashboard.tsx` | Pending reviews list, filtered by role |
| `ReviewDetailPage.tsx` | Full review lifecycle UI — see `06-review-workflow-and-sla.md` |

### `/features/dashboard/`
| File | Purpose |
|------|---------|
| `DashboardPage.tsx` | Overview: stats row, duration gauge, criticality legend, projects by urgency group |

### `/features/profile/`
| File | Purpose |
|------|---------|
| `ProfilePage.tsx` | Editable name/phone; role dropdown (ADMIN only); email read-only |

---

## Shared Components (`src/components/`)

### Layout
| Component | Purpose |
|-----------|---------|
| `AppLayout.tsx` | Sidebar + header shell, nav items, user footer with sign out |
| `AppLayout.tsx → NAV_ITEMS` | Dashboard, Projects, Review Queue, User Management, Institutions |

### Guards
| Component | Purpose |
|-----------|---------|
| `AuthGuard.tsx` | Redirects to `/login` if not authenticated |
| `RoleGuard.tsx` | Redirects if user lacks required role |

### UI Primitives
| Component | Purpose |
|-----------|---------|
| `LoadingSpinner.tsx` | `size: 'sm' | 'md' | 'lg'` |
| `StatusBadge.tsx` | Colored badge for `ReviewStatus` values |
| `Toast.tsx` | Global toast notifications (from `uiStore`) |

---

## State Management

### `authStore.ts` (Zustand)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser(user: User): void;
  setLoading(loading: boolean): void;
  logout(): void;
}
// Persists: localStorage['access_token']
```

### `uiStore.ts` (Zustand)
```typescript
interface UIState {
  toasts: Toast[];
  addToast(type: 'success' | 'error' | 'info' | 'warning', message: string): void;
  removeToast(id: string): void;
}
```

---

## API Service Files (`src/services/`)

| File | Endpoints Wrapped |
|------|------------------|
| `apiClient.ts` | Axios instance, base URL `/api`, interceptors for auth + refresh |
| `authApi.ts` | register, login, logout, me, updateProfile, listInstitutions, listUnits, listPeers |
| `projectApi.ts` | list, get, create, update, listAmendments, createAmendment, assignVendor, removeVendor, dashboard |
| `reviewApi.ts` | submit, getByDocument, get, pending, addReview, check, approve, downloadSheet, uploadAmsLetter, verifyQR |

---

## Tailwind CSS Custom Classes

Defined in `frontend/src/index.css` or `tailwind.config.js`:

| Class | Usage |
|-------|-------|
| `.card` | White rounded shadow container: `bg-white rounded-xl shadow-sm border border-gray-100` |
| `.btn-primary` | Teal primary button |
| `.btn-secondary` | Gray outlined button |
| `.input` | Styled text input / select / textarea |
| `.label` | Form label style |

---

## Axios Interceptors (apiClient.ts)

### Request Interceptor
```typescript
// Attaches access token from localStorage
config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
```

### Response Interceptor (401 handling)
```typescript
// On 401 from any request:
1. Queue the failed request
2. Call POST /auth/refresh (with credentials: 'include' for cookie)
3. Store new access_token in localStorage
4. Update authStore
5. Retry all queued requests with new token
6. If refresh fails: logout(), redirect to /login
```

---

## App Navigation Structure

```
Sidebar (AppLayout.tsx):
  ┌──────────────────────────────────┐
  │  🛡 Field QA System              │
  │     Management System            │
  ├──────────────────────────────────┤
  │ GENERAL                          │
  │  🏠 Dashboard                    │
  │  📋 Projects                     │
  │  📝 Review Queue (consul. only)  │
  ├──────────────────────────────────┤
  │ ADMINISTRATION (ADMIN only)      │
  │  👥 User Management              │
  │  🏢 Institutions                 │
  ├──────────────────────────────────┤
  │ [Avatar] Name                    │
  │ [Role Badge]                     │
  │  👤 My Profile                   │
  │  🚪 Sign Out                     │
  └──────────────────────────────────┘
```

Sidebar color: `linear-gradient(180deg, #0e4f65 0%, #0a3d50 100%)`  
Active nav item: `background-color: #44B8DE` (teal)  
Text: `#A1DBEE` (light blue)
