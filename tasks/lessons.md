# Lessons Learned

_This file tracks patterns and corrections to prevent repeated mistakes._

## Session: 2026-04-07 — Initial Planning
- No lessons yet. File initialized for tracking.

## Session: 2026-05-05 — Docker, CI/CD & Build Hardening

### Lesson 1: Fix existing build errors BEFORE adding CI/CD
- When adding a CI pipeline, always run `npm run build` on all workspaces locally first.
- The codebase had latent TypeScript errors (unused variable in frontend, OpenAI SDK union type in backend) that passed during dev (`ts-node-dev`) but failed during `tsc` production build.
- Rule: `npm ci && npm run build --workspace=shared && npm run generate --workspace=backend && npm run build --workspace=backend && npm run build --workspace=frontend` must pass before declaring CI ready.

### Lesson 2: OpenAI SDK `stream` typing
- `openai.chat.completions.create()` returns a union type `ChatCompletion | Stream<ChatCompletionChunk>` when `stream` is not explicitly provided.
- Always pass `stream: false` and cast the response to `OpenAI.Chat.ChatCompletion` when using the non-streaming API. Example:
  ```ts
  const response = await ai.chat.completions.create({
    model: config.ai.model,
    stream: false,
    messages: [...],
  } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
  const raw = (response as OpenAI.Chat.ChatCompletion).choices?.[0]?.message?.content ?? '';
  ```

### Lesson 3: Prisma migration SQL files must be tracked
- `.gitignore` originally excluded `prisma/migrations/*.sql`, which breaks team collaboration and `prisma migrate deploy` in CI/CD.
- Rule: Never gitignore migration SQL files. They are the source of truth for schema evolution.

### Lesson 4: Monorepo Docker builds
- For npm workspace monorepos, copy all `package.json` files first, then `npm ci`, then copy source and build.
- The shared package must be built before backend/frontend.
- Backend production image only needs `dist/`, `prisma/`, `node_modules/`, and `package.json`.
- Frontend production image should use nginx to serve static files and proxy `/api` to the backend container.

## Session: 2026-05-05 — Testing Foundation

### Lesson 5: Start testing with pure functions and isolated utilities
- Don't try to integration-test everything on day one. Start with:
  - Backend: pure utility functions (auth crypto, error classes, middleware wrappers)
  - Frontend: presentational components with no side effects (badges, spinners, buttons)
- These tests run fast, require no database mocking, and establish the testing habit.

### Lesson 6: Mock environment-dependent modules in backend tests
- The `config` module reads `.env` via `dotenv` at import time, which breaks in CI if no `.env` exists.
- Use `vi.mock('../config')` at the top of test files to provide deterministic test values.
- Example:
  ```ts
  vi.mock('../config', () => ({
    config: { jwt: { accessSecret: 'test-secret', ... } }
  }));
  ```

### Lesson 7: Vitest + npm workspaces path gotchas
- Running `npx vitest run --config backend/vitest.config.ts` from root fails because `include: ['src/**/*.test.ts']` resolves relative to CWD, not the config file.
- Solution: always run workspace tests from the workspace directory (`cd backend && npx vitest run`), or use absolute paths in the config.
- Root package.json scripts should use `--workspace=backend` which runs in the correct directory.

### Lesson 8: Frontend component testing checklist
- Use `jsdom` environment for React component tests.
- Import `@testing-library/jest-dom/vitest` in a setup file for `.toBeInTheDocument()` matchers.
- Add ARIA roles (`role="status"`, `aria-label`) to components to make them queryable and accessible.
- Keep presentational components pure (no routers, no stores) so they don't need complex wrappers.

## Session: 2026-05-05 — VPS Deployment Guide

### Lesson 9: Always use alternate ports when coexisting on a VPS
- When adding a second Docker Compose stack to a VPS with an existing app, audit every port mapping.
- Default ports to shift: frontend (`80` → `8080`), backend (`3000` → `3001`), database (`5432` → internal-only or `5433`).
- Each `docker compose` stack creates an isolated network, so internal container names (e.g., `backend:3000`) don't conflict across stacks.

### Lesson 10: Pin Prisma version in production Dockerfile CMD
- `prisma` is a devDependency. The production Docker stage may not have it installed.
- `npx prisma migrate deploy` without a version pin downloads the **latest** Prisma CLI, which can break with schema changes.
- Fix: pin the exact version from `package-lock.json`:
  ```dockerfile
  CMD ["sh", "-c", "npx prisma@5.22.0 migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]
  ```
- When upgrading Prisma, update the lockfile, check the resolved version, then update the Dockerfile pin.

### Lesson 11: Database should be internal-only by default
- Exposing PostgreSQL to the host (`5432:5432`) creates port conflict risk and security exposure.
- In `docker-compose.prod.yml`, omit the `ports` section for the `db` service. Only the backend container (same network) can reach it.
- If external DB access is needed (pgAdmin, DBeaver), use an alternate host port like `5433:5432`.

### Lesson 12: Deployment guide structure
- Follow a consistent pattern: Infrastructure table → First-time setup → Standard deploy flow → Container list → Known gotchas → Database ops → Troubleshooting.
- Include copy-pasteable SSH commands for every operation.
- Document both manual deploy (SSH + docker compose) and auto-deploy (GitHub Actions).
- Always explain the "why" for gotchas (e.g., Prisma version pinning, port conflicts) so future maintainers understand the constraint.

### Lesson 13: GitHub Deploy Keys are unique per repository
- If you try to add the same public key as a Deploy Key on a second repo, GitHub rejects it with "Key is already in use".
- Solution: generate a **new** SSH key pair for each repository, then use an SSH host alias in `~/.ssh/config` to tell Git which key to use:
  ```ssh
  Host github-field-qa
      HostName github.com
      User git
      IdentityFile ~/.ssh/field_qa_deploy
      IdentitiesOnly yes
  ```
- Then use `git clone git@github-field-qa:user/repo.git` instead of `git@github.com`.
- This keeps each repo's deploy key isolated while the VPS can still access multiple repos.

### Lesson 14: GitHub Actions auto-deploy workflow must handle first-time clone
- A deploy workflow that does `cd ~/project && git pull` fails on first run because the directory doesn't exist.
- Always add a guard:
  ```bash
  if [ ! -d ~/project ]; then
    git clone git@github-field-qa:user/repo.git ~/project
  fi
  cd ~/project && git pull origin main
  ```

## Session: 2026-05-06 — VPS Firewall, GHCR Pipeline & Responsive Layout

### Lesson 15: Attaching a cloud security group overrides provider defaults
- On Biznet Gio (and most cloud providers), VMs with no security group attached allow all traffic by default.
- The moment you attach a security group, only explicitly listed ports are allowed — everything else is dropped.
- Rule: Before attaching a security group, list ALL ports used by every app on that server (not just the new one).
- In this project: attaching a new security group for the QA system (ports 22, 8080, 3001) silently blocked port 80 used by the existing ruptl-dashboard app.

### Lesson 16: Always open port 22 first in any firewall script
- `vps-first-boot.sh` only opened port 8080 via UFW, not port 22 (SSH).
- If UFW is active or gets enabled later, SSH access is lost immediately.
- Rule: Any script that configures UFW must open port 22 **first**, before any other port.
  ```bash
  sudo ufw allow 22/tcp   # SSH — always first
  sudo ufw allow 8080/tcp
  sudo ufw allow 3001/tcp
  ```

### Lesson 17: Two firewall layers exist on cloud VPS — both must allow the port
- Cloud provider security group (network level, outside the VM)
- UFW / iptables inside the VM (OS level)
- A port must be open in **both** layers. Opening it in only one layer still blocks traffic.
- Diagnose which layer is blocking: `nc -zv <ip> <port>` — hangs = cloud firewall; "Connection refused" = reaches VM but OS firewall or service not running.

### Lesson 18: docker compose pull fails if image never existed in registry
- Switching `docker-compose.prod.yml` from `build:` (local) to `image: ghcr.io/...` requires the image to already exist in GHCR before deploy runs.
- The CI pipeline must push the image at least once before the VPS can pull it.
- Rule: When migrating from local builds to registry-based deploys, either:
  1. Build and push images manually first, OR
  2. Add a fallback in the pipeline: if neither workspace changed, rebuild both images (handles first deploy).

### Lesson 19: GitHub Actions "Re-run" replays the original event, not workflow_dispatch
- Clicking "Re-run jobs" in GitHub Actions replays the same push event that originally triggered the run.
- `github.event.inputs.*` will be empty on a re-run of a push-triggered workflow.
- Any logic gated on `workflow_dispatch` inputs will silently fall back to defaults.
- Rule: To trigger `workflow_dispatch` inputs, always use the **"Run workflow"** button on the Actions tab, not "Re-run jobs".

### Lesson 20: Parallel Docker builds in GitHub Actions cut deploy time ~50%
- Sequential backend + frontend builds: ~14 min total.
- Parallel builds in separate jobs: ~8 min (longest single build wins).
- Use separate GHA cache scopes (`scope=backend`, `scope=frontend`) so parallel jobs don't overwrite each other's cache.
- Only rebuild a service when its workspace files changed (paths-filter); fall back to rebuilding both when no workspace files changed (first deploy / config-only pushes).

## Session: 2026-06-05 — Deploy Pipeline SSH Debugging

### Lesson 21: Never use git-on-VPS for image-based deploys — use SCP instead
- Trying to `git pull` on the VPS requires the VPS to authenticate to GitHub via a separate SSH deploy key.
- Storing a multiline SSH private key in GitHub Actions secrets and writing it to the VPS is unreliable:
  - Inline script expansion (`${{ secrets.KEY }}`) can corrupt newlines
  - `echo` and `base64 -d` failures are common across platforms
  - Even the `envs:` param in appleboy/ssh-action doesn't guarantee the right key was pasted
- **The correct pattern for image-based deploys:**
  1. Build images in CI → push to GHCR
  2. Copy only `docker-compose.prod.yml` to VPS via `appleboy/scp-action` (reuses `VPS_SSH_KEY`)
  3. SSH in and run `docker compose pull && docker compose up -d`
  4. The VPS never needs git, deploy keys, or GitHub access at all
- This uses only the 3 secrets already needed: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

### Lesson 22: When a key fingerprint never matches after multiple attempts — redesign
- If the fingerprint on the VPS consistently doesn't match the expected one, the user is pasting the wrong key each time.
- Do not keep iterating on the same approach (raw paste → base64 → envs).
- Instead, redesign to eliminate the problematic secret entirely.
- In this project: replaced git-on-VPS with SCP of compose file — `GH_DEPLOY_KEY` secret no longer needed.

## Session: 2026-08-11 — Chat assistant review fixes

### Lesson 23: Vitest transpiles without type-checking — a passing suite can still fail CI
- A test file can pass under `vitest run` while `tsc` rejects it (union not
  narrowed, missing import), because Vitest uses esbuild and skips type errors.
- The CI gate that catches this is `npm run build` (tsc), which runs before
  `test:ci` — but only if you actually run it locally before pushing.
- Rule: after adding or editing any test file, run the workspace build
  (`npm run build`) in addition to the test suite.

### Lesson 24: DB-backed integration tests must provision their own fixtures or CI will fail
- A fresh Postgres has no dev data: the scopedRepo integration test originally
  assumed the dev database was populated, so it failed 4/10 on an empty CI DB.
- The seed script only creates institutions/users — it does not create
  projects/documents, so "migrate + seed" is not a substitute for real data.
- Rule: integration tests that need domain rows should create (and tear down)
  their own fixtures in `beforeAll` / `afterAll`, so they are hermetic and can
  run on any database, including a CI service container.

### Lesson 25: Negating a TypeScript type guard does not narrow the union
- `expect(isNotFound(result)).toBe(false)` still leaves `result` as the union,
  because narrowing only happens on the positive branch.
- Rule: when a result can be a discriminated union, assert the impossible
  branch explicitly (`if (isNotFound(result)) throw ...`) so the compiler
  narrows the remaining code.

### Lesson 26: A DB-backed test suite can fail before any test runs — config is imported at module load
- `scopedRepo.integration.test.ts` imports `slaService` → `config/index.ts`,
  which calls `required('JWT_ACCESS_SECRET')` at import time. Locally the
  gitignored `backend/.env` masks the requirement; CI has no `.env`, so the
  suite failed with `Missing required env var` before a single test executed.
- Rule: when adding a suite that imports the real config transitively, either
  mock `config` (as `agentLoop.test.ts` / `authService.test.ts` do) or make
  sure the CI job env supplies every `required()` var. Test-only secret values
  are fine — production secrets never enter the workflow.

### Lesson 27: Verify model slugs against the provider's live model list before defaulting
- The chat assistant shipped with `anthropic/claude-3-5-haiku` as the default,
  which OpenRouter answered with `404 No endpoints found` — the slug either
  never existed or was deprecated, and the failure surfaced only when a real
  user sent the first message.
- Rule: before pinning a model default, query the provider's public model
  list (OpenRouter: `https://openrouter.ai/api/v1/models`) and confirm the
  exact slug and that it supports `tools`. Pin the current family explicitly
  (`anthropic/claude-haiku-4.5`) rather than assuming a product name maps to
  a slug.
