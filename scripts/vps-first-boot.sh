#!/bin/bash
set -e

# =============================================================================
# Field QA Management System — VPS First Boot Setup
# =============================================================================
# Run this script ON THE VPS after cloning the repo.
# It creates .env, opens firewall, and starts the app.
#
# Usage:
#   cd ~/field-qa-management-system
#   chmod +x scripts/vps-first-boot.sh
#   ./scripts/vps-first-boot.sh
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Field QA Management System — VPS First Boot Setup          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

# ─── Prerequisites Check ─────────────────────────────────────────────────────

echo -e "${BLUE}▶ Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✖ Docker is not installed.${NC}"
    echo "  Install: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    echo -e "${RED}✖ Docker Compose is not installed.${NC}"
    echo "  Install: https://docs.docker.com/compose/install/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}✖ Git is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo

# ─── Detect Docker Compose Command ───────────────────────────────────────────

if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# ─── Get VPS IP ──────────────────────────────────────────────────────────────

echo -e "${BLUE}▶ Detecting VPS IP...${NC}"
VPS_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || echo "")

if [ -z "$VPS_IP" ]; then
    read -rp "Could not auto-detect VPS IP. Enter your VPS IP: " VPS_IP
else
    echo -e "  Detected IP: ${YELLOW}$VPS_IP${NC}"
    read -rp "Is this correct? [Y/n]: " CONFIRM
    if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
        read -rp "Enter your VPS IP: " VPS_IP
    fi
fi

echo

# ─── Create .env file ────────────────────────────────────────────────────────

echo -e "${BLUE}▶ Setting up environment...${NC}"

if [ -f "$ENV_FILE" ]; then
    echo -e "  ${YELLOW}.env already exists.${NC}"
    read -rp "Overwrite with new production values? [y/N]: " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo -e "  Keeping existing .env"
    else
        CREATE_ENV=true
    fi
else
    CREATE_ENV=true
fi

if [ "$CREATE_ENV" = true ]; then
    echo -e "  Generating production .env..."

    # Generate random secrets
    JWT_ACCESS_SECRET=$(openssl rand -base64 48 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 48 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '\n')

    # Prompt for DB password
    read -rsp "Enter PostgreSQL password (or press Enter to auto-generate): " DB_PASS
    echo
    if [ -z "$DB_PASS" ]; then
        DB_PASS=$(openssl rand -base64 24 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 24)
        echo -e "  ${GREEN}Auto-generated password: $DB_PASS${NC}"
        echo -e "  ${YELLOW}⚠ Save this password — it will not be shown again!${NC}"
    fi

    cat > "$ENV_FILE" <<EOF
# ============================================================
# PRODUCTION ENVIRONMENT — Field QA Management System
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# VPS IP: $VPS_IP
# ============================================================

# Database
POSTGRES_USER=qa_user
POSTGRES_PASSWORD=$DB_PASS
POSTGRES_DB=field_qa_db

# JWT Secrets
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# URLs (use VPS IP + alternate ports to avoid conflict with existing app)
FRONTEND_URL=http://$VPS_IP:8080
BASE_URL=http://$VPS_IP:8080

# Server
PORT=3000
NODE_ENV=production

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=50

# SLA
DEFAULT_SLA_DAYS=7

# AI (disabled by default — enable when ready)
AI_ENABLED=false
OPENROUTER_API_KEY=
AI_MODEL=qwen/qwen3-235b-a22b
EOF

    echo -e "  ${GREEN}✓ .env created at $ENV_FILE${NC}"
    echo
fi

# ─── Open Firewall ───────────────────────────────────────────────────────────

echo -e "${BLUE}▶ Configuring firewall...${NC}"

if command -v ufw &> /dev/null; then
    if ! sudo ufw status | grep -q "8080/tcp"; then
        sudo ufw allow 8080/tcp
        echo -e "  ${GREEN}✓ Port 8080 opened via UFW${NC}"
    else
        echo -e "  ${GREEN}✓ Port 8080 already open${NC}"
    fi
    sudo ufw status | grep -E "(Status|8080)"
else
    echo -e "  ${YELLOW}⚠ UFW not installed. Skipping firewall config.${NC}"
    echo "  If using another firewall (iptables, firewalld), manually open port 8080."
fi
echo

# ─── Docker Compose Build & Start ────────────────────────────────────────────

echo -e "${BLUE}▶ Building and starting containers...${NC}"
echo -e "  This may take a few minutes on first run."
echo

cd "$PROJECT_DIR"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up --build -d

echo
echo -e "${GREEN}✓ Containers started${NC}"
echo

# ─── Wait for Backend ────────────────────────────────────────────────────────

echo -e "${BLUE}▶ Waiting for backend to be ready (migrations running)...${NC}"
RETRIES=30
COUNT=0
while [ $COUNT -lt $RETRIES ]; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    COUNT=$((COUNT + 1))
    echo -n "."
    sleep 2
done

if [ $COUNT -eq $RETRIES ]; then
    echo
    echo -e "  ${YELLOW}⚠ Backend health check timed out.${NC}"
    echo "  Checking logs..."
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs --tail 20 backend
fi
echo

# ─── Health Checks ───────────────────────────────────────────────────────────

echo -e "${BLUE}▶ Running health checks...${NC}"

# Frontend
if curl -s http://localhost:8080/health | grep -q "healthy"; then
    echo -e "  ${GREEN}✓ Frontend (port 8080) — healthy${NC}"
else
    echo -e "  ${RED}✖ Frontend (port 8080) — not responding${NC}"
fi

# Backend
BACKEND_HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null || echo "")
if echo "$BACKEND_HEALTH" | grep -q '"status":"ok"'; then
    echo -e "  ${GREEN}✓ Backend (port 3001) — healthy${NC}"
else
    echo -e "  ${RED}✖ Backend (port 3001) — not responding${NC}"
fi

# Database
if $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec -T db pg_isready -U qa_user > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Database — accepting connections${NC}"
else
    echo -e "  ${RED}✖ Database — not ready${NC}"
fi

echo

# ─── Summary ─────────────────────────────────────────────────────────────────

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete!                                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "  Access URL:       ${YELLOW}http://$VPS_IP:8080${NC}"
echo -e "  Backend Health:   ${YELLOW}http://$VPS_IP:3001/health${NC}"
echo -e "  Frontend Health:  ${YELLOW}http://$VPS_IP:8080/health${NC}"
echo
echo -e "  Running containers:"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo
echo -e "  ${BLUE}Useful commands:${NC}"
echo -e "    View logs:        ${YELLOW}cd ~/field-qa-management-system && $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f${NC}"
echo -e "    Restart:          ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml restart${NC}"
echo -e "    Stop:             ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml down${NC}"
echo -e "    Database shell:   ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml exec db psql -U qa_user -d field_qa_db${NC}"
echo
echo -e "  ${GREEN}✅ Every future push to 'main' will auto-deploy via GitHub Actions.${NC}"
echo
