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
COPY --from=deps /app/node_modules ./node_modules
# Copy workspace-level packages that npm didn't hoist (e.g. pdf-parse)
COPY --from=deps /app/backend/node_modules ./backend/node_modules
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
# knowledgeBaseService's dev-mode relative path (three levels up from dist/services)
# doesn't resolve to anything meaningful in this image's flat /app layout, so point
# it explicitly at the KB directory copied in below.
ENV KNOWLEDGE_BASE_DIR=/app/Knowledge_Base

# Install runtime deps for Prisma (openssl) and healthcheck (curl)
RUN apk add --no-cache openssl curl

# Copy built artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/Knowledge_Base ./Knowledge_Base
# Root node_modules first, then merge workspace-level packages on top
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./node_modules
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
