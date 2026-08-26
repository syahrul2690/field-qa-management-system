# ---- Base stage ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---- Dependencies stage ----
FROM base AS deps
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
COPY shared/package*.json shared/
RUN npm ci

# ---- Builder stage ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared package first
RUN npm run build --workspace=shared

# Build frontend (Vite static assets)
RUN npm run build --workspace=frontend

# ---- Production stage ----
FROM nginx:1.25-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Use 127.0.0.1, not localhost: nginx listens on IPv4 only, but BusyBox wget
# resolves localhost to ::1 first and the probe fails with "connection refused".
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
