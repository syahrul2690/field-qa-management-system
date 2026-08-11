# ---- Base stage ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---- Dependencies stage ----
FROM base AS deps
# Only copy manifests needed for backend + shared (skip frontend)
COPY package*.json ./
COPY backend/package*.json backend/
COPY shared/package*.json shared/
# Create empty frontend package.json so npm workspaces doesn't complain
RUN mkdir -p frontend && echo '{"name":"@qa-system/frontend","version":"0.0.0","private":true}' > frontend/package.json
RUN npm ci

# ---- Builder stage ----
FROM base AS builder
# Every dependency hoists to the root node_modules. There was previously a
# second COPY for backend/node_modules, which existed only because pdf-parse
# could not be hoisted; that dependency is gone, npm no longer creates the
# directory, and copying it fails the build.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared package first (backend depends on it)
RUN npm run build --workspace=shared

# Generate Prisma client and build backend
RUN npm run generate --workspace=backend
RUN npm run build --workspace=backend

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# config.knowledgeBase resolves a dev-mode relative path (three levels up from
# dist/services) that means nothing in this image's flat /app layout, so it is
# pointed explicitly at the KB directory copied in below. Nothing reads it yet —
# the whole-file injection it used to serve was removed with the old AI features
# — but the corpus is staged here for the chunked search tool.
ENV KNOWLEDGE_BASE_DIR=/app/Knowledge_Base

# Install runtime deps for Prisma (openssl) and healthcheck (curl)
RUN apk add --no-cache openssl curl

# Copy built artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/Knowledge_Base ./Knowledge_Base
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Uploads volume mount point
RUN mkdir -p uploads

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run pending migrations then start server.
# Prisma CLI version is pinned to match package-lock.json (v5.22.0).
# If you upgrade Prisma, update the pin here and in the builder stage.
CMD ["sh", "-c", "npx prisma@5.22.0 migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]
