#!/bin/bash

# Real Estate Platform — Fresh Start Setup
# Usage:
#   ./fresh-start.sh          Interactive mode (choose Docker or manual)
#   ./fresh-start.sh docker   Docker for databases, apps run via npm
#   ./fresh-start.sh manual   Local PostgreSQL + Redis, apps run via npm
#   ./fresh-start.sh --skip-install  Skip npm install (faster if deps are current)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error()   { echo -e "${RED}✗${NC} $1"; }
log_step()    { echo -e "\n${BLUE}═══ $1${NC}"; }

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

SKIP_INSTALL=false
MODE=""

for arg in "$@"; do
  case "$arg" in
    docker)       MODE="docker" ;;
    manual)       MODE="manual" ;;
    --skip-install) SKIP_INSTALL=true ;;
  esac
done

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Real Estate Platform — Fresh Start                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# ─── Mode selection ──────────────────────────────────────────
if [[ -z "$MODE" ]]; then
  echo "How do you want to run PostgreSQL and Redis?"
  echo ""
  echo "  1) Docker   — PostgreSQL + Redis in Docker containers (recommended)"
  echo "  2) Manual   — Use locally installed PostgreSQL + Redis"
  echo ""
  read -rp "Choose [1/2]: " choice
  case "$choice" in
    1|docker|d) MODE="docker" ;;
    2|manual|m) MODE="manual" ;;
    *)          MODE="docker" ;;
  esac
fi

echo ""
log_info "Mode: $MODE"
echo ""

# ─── Step 1: Check prerequisites ────────────────────────────
log_step "Step 1/6: Checking prerequisites"

command -v node >/dev/null 2>&1 || { log_error "Node.js not found. Install Node.js 20+"; exit 1; }
command -v npm  >/dev/null 2>&1 || { log_error "npm not found"; exit 1; }

NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  log_error "Node.js 20+ required (found v$NODE_MAJOR)"
  exit 1
fi

if [[ "$MODE" == "docker" ]]; then
  command -v docker >/dev/null 2>&1 || { log_error "Docker not found. Install Docker or use manual mode."; exit 1; }
fi

if [[ "$MODE" == "manual" ]]; then
  command -v psql >/dev/null 2>&1 || { log_error "psql not found. Install PostgreSQL or use Docker mode."; exit 1; }
fi

log_success "Prerequisites OK (Node $(node -v), npm $(npm -v))"

# ─── Step 2: Environment files ──────────────────────────────
log_step "Step 2/6: Checking environment files"

if [[ ! -f "apps/api/.env" ]]; then
  log_warning "apps/api/.env not found — creating from template"
  cat > apps/api/.env << 'ENVEOF'
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=estates
JWT_SECRET=local_dev_jwt_secret_change_in_production_min32
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=local_dev_refresh_secret_change_in_prod_min32
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
FRONTEND_URL=http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ENVEOF
  log_success "Created apps/api/.env with dev defaults"
else
  log_success "apps/api/.env exists"
fi

# ─── Step 3: Install dependencies ───────────────────────────
log_step "Step 3/6: Dependencies"

if [[ "$SKIP_INSTALL" == true ]]; then
  log_info "Skipping npm install (--skip-install flag)"
else
  log_info "Installing dependencies..."
  npm install
  log_success "Dependencies installed"
fi

# Build shared packages
log_info "Building shared packages..."
cd "$PROJECT_ROOT/packages/types"
npm run build 2>/dev/null || log_warning "Types package build skipped"
cd "$PROJECT_ROOT"
log_success "Shared packages ready"

# ─── Step 4: Database setup ─────────────────────────────────
log_step "Step 4/6: Database setup ($MODE)"

if [[ "$MODE" == "docker" ]]; then
  # Stop existing containers
  docker compose down -v 2>/dev/null || docker-compose down -v 2>/dev/null || true

  # Start only postgres + redis
  docker compose up -d postgres redis 2>/dev/null || docker-compose up -d postgres redis

  log_info "Waiting for PostgreSQL..."
  RETRY=0
  MAX=30
  until docker exec estates_postgres pg_isready -U postgres > /dev/null 2>&1 || [[ $RETRY -eq $MAX ]]; do
    sleep 2
    RETRY=$((RETRY+1))
    [[ $((RETRY % 5)) -eq 0 ]] && log_info "Still waiting... ($RETRY/$MAX)"
  done

  if [[ $RETRY -eq $MAX ]]; then
    log_error "PostgreSQL failed to start after $MAX attempts"
    exit 1
  fi
  log_success "PostgreSQL + Redis running in Docker"

elif [[ "$MODE" == "manual" ]]; then
  # Read password from .env
  DB_PASSWORD=$(grep -E '^DB_PASSWORD=' apps/api/.env | cut -d'=' -f2-)
  DB_USER=$(grep -E '^DB_USERNAME=' apps/api/.env | cut -d'=' -f2- || echo "postgres")
  DB_NAME=$(grep -E '^DB_NAME=' apps/api/.env | cut -d'=' -f2- || echo "estates")

  log_info "Checking local PostgreSQL..."
  if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    log_error "Local PostgreSQL is not running on port 5432"
    log_info "Start it with: sudo systemctl start postgresql"
    exit 1
  fi

  log_info "Creating database '$DB_NAME' (if not exists)..."
  PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
  PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' 2>/dev/null || true

  log_success "Local PostgreSQL ready (database: $DB_NAME)"

  # Check Redis
  if command -v redis-cli >/dev/null 2>&1 && redis-cli ping > /dev/null 2>&1; then
    log_success "Local Redis running"
  else
    log_warning "Redis not running — API will work without it (caching disabled)"
  fi
fi

# ─── Step 5: Seed database ──────────────────────────────────
log_step "Step 5/6: Seeding database"

cd "$PROJECT_ROOT"
log_info "Running comprehensive seed (users, properties, images, clients, representatives, subscribers)..."
npx ts-node --project tsconfig.seed.json -r tsconfig-paths/register seeds/seed.ts || {
  log_error "Seeding failed! Check the error above."
  exit 1
}
log_success "Database seeded"

# ─── Step 6: Create uploads directory ───────────────────────
log_step "Step 6/6: Final setup"

mkdir -p apps/api/uploads
log_success "uploads/ directory ready"

# ─── Done ────────────────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   FRESH START COMPLETE!                               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "  Database: 5 users, 15 properties, 40+ images, 8 clients,"
echo "            2 representatives, 3 newsletter subscribers"
echo "  Enum coverage: All PropertyType, PropertyStatus, HeatingType,"
echo "            Orientation, TransactionType, PaymentType, ClientStatus"
echo ""
echo "  Login:    admin / admin123"
echo ""
echo "  Start all apps:"
echo "    npm run dev"
echo ""
echo "  Or individually:"
echo "    npm run dev:api      http://localhost:3000"
echo "    npm run dev:admin    http://localhost:3001"
echo "    npm run dev:user     http://localhost:3002"
echo ""
echo ""
echo "   Or start individually:"
echo "   $ npm run dev:api      # API at http://localhost:3000"
echo "   $ npm run dev:admin    # Admin at http://localhost:3001"
echo "   $ npm run dev:user     # User web at http://localhost:3002"
echo ""
echo "   View logs:"
echo "   $ npm run docker:logs"
echo ""
