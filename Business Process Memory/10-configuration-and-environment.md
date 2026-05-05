# 10 — Configuration and Environment

## Backend Environment Variables (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✓ | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✓ | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✓ | — | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | — | `'15m'` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | — | `'7d'` | Refresh token TTL |
| `PORT` | — | `3000` | Express server port |
| `NODE_ENV` | — | `'development'` | `development` or `production` |
| `FRONTEND_URL` | — | `'http://localhost:5173'` | CORS allowed origin |
| `BASE_URL` | — | `'http://localhost:3000'` | Backend base URL (used in QR links, emails) |
| `UPLOAD_DIR` | — | `'uploads'` | Upload directory path (relative to backend root) |
| `MAX_FILE_SIZE_MB` | — | `50` | Max file size in MB |
| `DEFAULT_SLA_DAYS` | — | `7` | Default SLA window for reviews |

### Example `.env`
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/field_qa_db"
JWT_ACCESS_SECRET="your-very-secret-access-key-change-in-production"
JWT_REFRESH_SECRET="your-very-secret-refresh-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
BASE_URL="http://localhost:3000"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE_MB=50
DEFAULT_SLA_DAYS=7
```

---

## Frontend Environment Variables (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | — | (inferred) | Backend API base URL, e.g., `http://localhost:3000/api` |

### Frontend URL Construction
```typescript
// In any component needing a file URL:
const baseUrl = (import.meta as any).env?.VITE_API_URL?.replace('/api', '')
  ?? 'http://localhost:3000';
const fileUrl = `${baseUrl}/uploads/${relativePath}`;
```

---

## Database

- **Engine:** PostgreSQL (tested with v14+)
- **Database name:** `field_qa_db` (configurable via `DATABASE_URL`)
- **Schema:** managed entirely by Prisma

### Prisma Commands

```bash
# Generate client after schema change
cd backend && npx prisma generate

# Apply existing migrations (production/non-interactive)
cd backend && npx prisma migrate deploy

# View database in browser
cd backend && npx prisma studio

# NEVER use in non-interactive shell (CI, scripts):
# npx prisma migrate dev  ← requires TTY
```

### Manual Migration Process (used when migrate dev fails)
```bash
# 1. Edit schema.prisma
# 2. Create migration directory manually:
mkdir backend/prisma/migrations/{TIMESTAMP}_{name}/
# 3. Write migration.sql manually
# 4. Apply:
cd backend && npx prisma migrate deploy
# 5. Regenerate client:
cd backend && npx prisma generate
```

---

## JWT Authentication

### Token Flow
```
Login → access_token (JWT, 15m) + refresh_token (JWT, 7d, httpOnly cookie)
         │
         ▼
Frontend stores access_token in localStorage
Frontend attaches: Authorization: Bearer {token}
         │
         ▼
Token expires (401) → POST /auth/refresh (cookie auto-sent)
                    → New access_token returned
                    → Retry original request
```

### Token Payload (`TokenPayload`)
```typescript
{
  sub: string,           // user.id
  email: string,
  name: string,
  role: Role,
  status: UserStatus,
  institution_id: string,
  institution_type: InstitutionType,
  unit_id: string,
  unit_level: number,
}
```

### Auth Middleware (`authMiddleware.ts`)
1. Extracts `Authorization: Bearer {token}` header
2. Verifies with `JWT_ACCESS_SECRET`
3. Attaches payload to `req.user`
4. Returns 401 if missing or invalid

---

## CORS Configuration

```typescript
cors({
  origin: config.cors.frontendUrl,   // FRONTEND_URL env var
  credentials: true,                  // Required for cookie-based refresh tokens
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

---

## Static File Serving

```typescript
// In Express app setup (index.ts or app.ts):
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

All files in `backend/uploads/` are publicly accessible at `/uploads/{path}`.
> ⚠ No authentication on file serving — files are publicly accessible if URL is known.

---

## Server Startup

```typescript
// backend/src/index.ts (or server.ts)
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(...));
app.use('/uploads', express.static('uploads'));
app.use('/api', routes);   // all routes mounted under /api
app.use(errorHandler);     // global error handler last

app.listen(PORT);
```

---

## Middleware Execution Order

For a typical protected route:

```
Request
  → express.json() body parser
  → cors()
  → authMiddleware  (verifies JWT, attaches req.user)
  → requireRole()   (checks req.user.role against allowed list)
  → requireInstitution()  (optional — checks institution type)
  → multer middleware  (optional — for file upload routes)
  → controller function
  → asyncHandler catches errors → errorHandler
```

---

## Error Handling

### `AppError` class
```typescript
class AppError extends Error {
  constructor(message: string, statusCode: number) {}
}
```

### `asyncHandler` wrapper
```typescript
// Wraps async route handlers to catch Promise rejections
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

### Global `errorHandler` middleware
```typescript
// Catches AppError and generic errors
// Returns: { success: false, message: string }
// AppError uses its statusCode
// Unknown errors: 500 Internal Server Error
```

---

## Rate Limiting

`rateLimiter.ts` middleware exists (exact config not documented — check source).  
Applied to sensitive routes (login, register).

---

## Development Scripts

```bash
# Backend
cd backend
npm install
npm run dev          # ts-node-dev with hot reload
npm run build        # tsc compile
npm start            # run compiled JS

# Frontend
cd frontend
npm install
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```
