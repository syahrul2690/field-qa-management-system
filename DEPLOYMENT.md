# Deployment Guide

Local → GitHub → VPS deployment workflow for `field-qa-management-system`.

> **Important:** This app is designed to run **alongside an existing app** on the same VPS. It uses alternate ports (`8080` for frontend, `3001` for backend API) so it does not conflict with your existing app on ports `80` and `3000`.

---

## 🖥️ Connect to VPS

SSH alias `qa-vps` is configured in `~/.ssh/config` on the local machine:

```bash
ssh qa-vps
```

| Field | Value |
|---|---|
| Alias | `qa-vps` |
| Host | `103.93.161.157` |
| User | `pusmanpro` |
| Key | `~/.ssh/ruptl-dashboard.pem` |

> `develop4.pem` is the original Biznet Gio key name for this VPS but is not present on this machine. Use `ruptl-dashboard.pem` — it's the same key and already works.

**Useful one-liners (no need to SSH in manually):**

```bash
# Check all QA containers
ssh qa-vps "docker ps --filter name=qa-"

# Tail backend logs
ssh qa-vps "docker logs qa-backend --tail 50"

# Tail frontend logs
ssh qa-vps "docker logs qa-frontend --tail 20"

# Restart backend (e.g. after .env change)
ssh qa-vps "docker compose -f ~/field-qa-management-system/docker-compose.prod.yml restart backend"

# Full restart all containers
ssh qa-vps "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml restart"
```

---

## 🚀 How to Deploy (Normal Flow)

Just push to `main` — CI does the rest automatically:

```bash
git add <files>
git commit -m "your message"
git push origin main
```

To trigger a deploy manually without a code change:
- Go to **GitHub → Actions → Deploy to VPS → Run workflow → Run workflow**

**Pipeline completes in ~8–10 min.** App live at: `http://103.93.161.157:8080`

---

## Infrastructure

| Item | Value |
|---|---|
| VPS IP | `103.93.161.157` |
| VPS user | `pusmanpro` |
| VPS SSH key | `VPS_SSH_KEY` secret (Biznet Gio `.pem`) |
| Project path on VPS | `~/field-qa-management-system` |
| GitHub repo | `syahrul2690/field-qa-management-system` |
| Container registry | `ghcr.io/syahrul2690/field-qa-management-system` |
| Main branch | `main` |
| Access URL | `http://103.93.161.157:8080` |

---

## First-Time Setup (One-Time Only)

### 1. Clone on VPS

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP
mkdir -p ~/field-qa-management-system
cd ~/field-qa-management-system
git clone https://github.com/YOUR_USERNAME/field-qa-management-system.git .
```

### 2. Create `.env` file

```bash
cd ~/field-qa-management-system
cp .env.example .env
nano .env
```

Fill in the **Production (VPS)** section. Minimum required values:

```bash
# JWT — generate strong secrets (64+ chars each)
JWT_ACCESS_SECRET="paste-a-64-char-random-string-here"
JWT_REFRESH_SECRET="paste-another-64-char-random-string-here"

# URLs — use your VPS IP
FRONTEND_URL="http://YOUR_VPS_IP:8080"
BASE_URL="http://YOUR_VPS_IP:8080"

# Database
POSTGRES_PASSWORD="strong-production-password"
POSTGRES_USER=qa_user
POSTGRES_DB=field_qa_db

# Optional
AI_ENABLED=false
DEFAULT_SLA_DAYS=7
MAX_FILE_SIZE_MB=50
```

> **Enabling the chat assistant.** Set `AI_ENABLED=true` and `OPENROUTER_API_KEY` in
> **this root `.env`**, next to `docker-compose.prod.yml`. Compose reads the AI
> variables from here, not from `backend/.env` — that file is gitignored and never
> reaches the image, so a key set only there leaves the assistant reporting
> "not configured" in production. Optionally set `AI_CHAT_MODEL` (defaults to
> `anthropic/claude-3-5-haiku`); it must be a model with reliable tool calling.
>
> The assistant streams over Server-Sent Events. `frontend/nginx.conf` already sets
> `proxy_buffering off` for `/api`, but if you terminate TLS at a **host-level
> nginx** in front of the container, that server block needs the same three
> directives or replies will arrive all at once when the answer completes:
>
> ```nginx
> proxy_buffering off;
> proxy_cache off;
> proxy_read_timeout 300s;
> ```

> Generate secrets with: `openssl rand -base64 48`

### 3. Open firewall port 8080

```bash
sudo ufw allow 8080/tcp
sudo ufw status
```

### 4. Build and start

```bash
cd ~/field-qa-management-system
docker compose -f docker-compose.prod.yml up --build -d
```

### 5. Verify first deploy

```bash
# Frontend health
curl http://localhost:8080/health

# Backend health
curl http://localhost:3001/health

# Container status
docker ps
```

The backend container automatically runs `prisma migrate deploy` on startup, so the database schema is created on first boot.

---

## Standard Deployment (code change)

### 1. Commit and push to GitHub

```bash
git add <files>
git commit -m "your message"
git push origin main
```

### 2. Pull on VPS

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && git pull origin main"
```

### 3. Rebuild and restart the changed service

**Backend only** (most common):
```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml up -d --build backend"
```

**Frontend only:**
```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml up -d --build frontend"
```

**Both backend and frontend:**
```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml up -d --build backend frontend"
```

> **Note:** The `backend` service automatically runs `prisma migrate deploy` on every container start. If you changed the Prisma schema, rebuilding the backend will apply the migration.

### 4. Verify

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "docker ps && docker logs qa-backend --tail 20"
```

The backend is healthy when the logs end with:
```
[DB] Connected to PostgreSQL
[Server] Running on port 3000 (production)
```

---

## Running Containers

| Container | Image | Role | Exposed Port |
|---|---|---|---|
| `qa-db` | `postgres:16-alpine` | PostgreSQL database | *(none — internal only)* |
| `qa-backend` | `field-qa-management-system-backend` | Express API | `3001` (host) → `3000` (container) |
| `qa-frontend` | `field-qa-management-system-frontend` | React SPA via nginx | `8080` (host) → `80` (container) |

**Network isolation:** Each `docker compose` stack creates its own isolated Docker network. The QA project's database is only reachable from within the QA stack. Your existing app's database is unaffected.

---

## GitHub Actions Auto-Deploy

The pipeline is live and fully configured. Every push to `main` triggers it automatically.

### How the Pipeline Works

```
push to main
  │
  ├── detect-changes        which workspace changed? (backend/frontend/both)
  ├── build-backend ──────▶ ghcr.io/.../backend:latest
  ├── build-frontend ─────▶ ghcr.io/.../frontend:latest
  └── deploy
        ├── SCP docker-compose.prod.yml ──▶ VPS ~/field-qa-management-system/
        └── SSH: docker compose pull && docker compose up -d
```

> **Design decision:** The VPS pulls pre-built images from GHCR — it does NOT clone or pull from GitHub. Only `docker-compose.prod.yml` is copied via SCP. This avoids all git-on-VPS complexity.

### Required Repository Secrets (already configured ✅)

| Secret | Purpose |
|---|---|
| `VPS_HOST` | VPS IP — `103.93.161.157` |
| `VPS_USER` | VPS username — `pusmanpro` |
| `VPS_SSH_KEY` | Private key to SSH into VPS (Biznet Gio `.pem`) |

> ⚠️ Do NOT add a `GH_DEPLOY_KEY` — it is not needed and caused issues. The VPS never accesses GitHub directly.

---

## Known Gotchas

### Prisma version must be pinned in the production stage

`prisma` is a **devDependency**. The production Docker stage only copies `node_modules` from the builder, but on container startup we run `npx prisma migrate deploy`. Without a version pin, `npx` downloads the **latest** from npm — which may have breaking schema changes.

The `backend/Dockerfile` pins the version explicitly:
```dockerfile
CMD ["sh", "-c", "npx prisma@5.22.0 migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]
```

**When you upgrade Prisma** (change `^5.x.x` in `backend/package.json`):
1. Run `npm install` locally to update the lockfile.
2. Check the resolved version:
   ```bash
   node -e "console.log(require('./package-lock.json').packages['node_modules/prisma'].version)"
   ```
3. Update the `prisma@x.x.x` pin in `backend/Dockerfile`.
4. Commit, push, and redeploy.

### The builder stage does NOT need a pinned version

The builder stage runs `npm run generate --workspace=backend` which calls `prisma generate`. This uses the locally installed `prisma` from `node_modules` (resolved by the lockfile). No manual pin needed in the builder stage.

### Port 3000 is already taken by your existing app

The QA backend runs internally on port `3000` inside its Docker container, but is mapped to host port `3001` in `docker-compose.prod.yml`:
```yaml
ports:
  - "3001:3000"
```

If your existing app already uses port `3001`, change the left side to another free port (e.g., `3002:3000`).

### Port 80 is already taken by your existing nginx

The QA frontend nginx is mapped to host port `8080`:
```yaml
ports:
  - "8080:80"
```

Users access the QA system at `http://VPS_IP:8080`. If `8080` is taken, change it to any free port.

### Database is internal-only by default

`docker-compose.prod.yml` does **not** expose PostgreSQL to the host. This prevents port conflicts with your existing app's database and improves security.

If you need external DB access (e.g., for pgAdmin or DBeaver), uncomment:
```yaml
ports:
  - "5433:5432"
```
Then connect to `VPS_IP:5433`.

### `docker compose` not `docker-compose`

The VPS should use the modern Docker Compose plugin (`docker compose`). The hyphenated `docker-compose` command may not be available.

---

## Database Operations

Connect to the database directly via the running container:

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "docker exec qa-db psql -U qa_user -d field_qa_db -c '<SQL>'"
```

### Examples

```bash
# Count users
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "docker exec qa-db psql -U qa_user -d field_qa_db -c 'SELECT COUNT(*) FROM \"User\";'"

# Count projects
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "docker exec qa-db psql -U qa_user -d field_qa_db -c 'SELECT COUNT(*) FROM \"Project\";'"

# Run Prisma Studio (temporary, for development/debugging)
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml exec backend npx prisma@5.22.0 studio --port 5555 --hostname 0.0.0.0"
# Then tunnel via SSH: ssh -L 5555:localhost:5555 pusmanpro@YOUR_VPS_IP
```

### Run migrations manually (if needed)

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml exec backend npx prisma@5.22.0 migrate deploy"
```

---

## Environment Variables (.env on VPS)

Located at `~/field-qa-management-system/.env`.

Edit directly on the VPS if values need to change — then restart the affected container (no rebuild needed for env-only changes):

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml restart backend"
```

To reload `.env` into a running container, you must restart it. Docker Compose does **not** hot-reload env files.

---

## Full Restart (no rebuild)

If containers need restarting without a code change (e.g., after editing `.env`):

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml restart"
```

## Full Teardown and Rebuild (last resort)

```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d --build"
```

> The `postgres_data` and `uploads_data` volumes are **preserved** on `down` — database data and uploaded files are not lost.

To wipe everything including volumes (⚠️ **destructive**):
```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cd ~/field-qa-management-system && docker compose -f docker-compose.prod.yml down -v"
```

---

## Running Alongside Your Existing App

Both apps are completely isolated:

| Layer | Existing App | QA System |
|---|---|---|
| Docker network | `ruptl-dashboard_default` | `field-qa-management-system_default` |
| Frontend port | `80` | `8080` |
| Backend port | `3000` | `3001` |
| Database port | `5432` | *(internal only)* |
| Database name | `ruptl_db` | `field_qa_db` |

There is **zero chance** of port or data conflicts as long as the host port mappings in `docker-compose.prod.yml` are unique.

---

## Troubleshooting

### "Bind for 0.0.0.0:8080 failed: port is already allocated"

Port `8080` is in use. Edit `docker-compose.prod.yml` and change the frontend mapping:
```yaml
ports:
  - "8081:80"   # use 8081 instead
```

### "Bind for 0.0.0.0:3001 failed: port is already allocated"

Port `3001` is in use. Edit `docker-compose.prod.yml` and change the backend mapping:
```yaml
ports:
  - "3002:3000"   # use 3002 instead
```

### Backend logs show "Missing required env var: DATABASE_URL"

The `.env` file is missing or the variable is not set. Check:
```bash
ssh -i ~/.ssh/field-qa.pem pusmanpro@YOUR_VPS_IP \
  "cat ~/field-qa-management-system/.env | grep DATABASE_URL"
```

### Frontend shows blank page or 502 error

1. Check backend is running: `docker logs qa-backend --tail 20`
2. Check frontend can reach backend internally: the frontend nginx proxies `/api` to `http://backend:3000` inside the Docker network. This should always work if both containers are up.
3. Verify `FRONTEND_URL` and `BASE_URL` in `.env` match your actual access URL.

### "Error: P1001: Can't reach database"

The backend started before the database was ready. The compose file has `depends_on` with healthcheck, but if the db is slow on first boot, restart the backend:
```bash
docker compose -f docker-compose.prod.yml restart backend
```
