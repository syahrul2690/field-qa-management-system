# ---- Base stage ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---- Dependencies stage ----
FROM base AS deps
# Copy root and workspace manifests
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
COPY shared/package*.json shared/
# Install all workspace dependencies (hoisted to root)
RUN npm ci

# ---- Builder stage ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
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

# Install runtime deps for Prisma (openssl) and healthcheck (curl)
RUN apk add --no-cache openssl curl

# Copy built artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/node_modules ./node_modules
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
