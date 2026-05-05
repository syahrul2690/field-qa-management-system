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
