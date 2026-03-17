#!/bin/bash

# Real Estate API - Fresh Start Script
# This script performs a complete cleanup and fresh setup

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}▶${NC} $1"
}

# Project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Real Estate API - Fresh Start Setup                 ║"
echo "║   This will clean and reinitialize everything          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Stop and remove all Docker containers
log_step "Step 1/8: Cleaning up Docker containers..."
docker-compose down -v 2>/dev/null || true
docker rm -f estates_postgres estates_redis estates_api 2>/dev/null || true
log_success "Docker containers cleaned"

# Step 2: Remove Docker volumes
log_step "Step 2/8: Removing Docker volumes..."
docker volume rm -f realestatesapi-nestjs_postgres_data 2>/dev/null || true
docker volume ls -q | grep -i estates | xargs -r docker volume rm 2>/dev/null || true
log_success "Docker volumes removed"

# Step 3: Clean PostgreSQL data if exists locally
log_step "Step 3/8: Cleaning local PostgreSQL data..."
if command -v psql &> /dev/null; then
    log_info "Dropping existing database if it exists..."
    PGPASSWORD=CHANGE_ME psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS estates;" 2>/dev/null || true
    PGPASSWORD=CHANGE_ME psql -h localhost -U postgres -c "CREATE DATABASE estates;" 2>/dev/null || true
    log_success "Local PostgreSQL cleaned (if running)"
else
    log_info "PostgreSQL CLI not found, skipping local DB cleanup"
fi

# Step 4: Clean node_modules and reinstall
log_step "Step 4/8: Cleaning and installing dependencies..."
log_info "Removing old node_modules..."
rm -rf node_modules
rm -rf apps/api/node_modules
rm -rf apps/admin-web/node_modules
rm -rf apps/user-web/node_modules
rm -rf packages/*/node_modules

log_info "Installing dependencies (this may take a few minutes)..."
npm install
log_success "Dependencies installed"

# Step 5: Build shared packages
log_step "Step 5/8: Building shared packages..."
cd "$PROJECT_ROOT/packages/types"
npm run build 2>/dev/null || log_warning "Types package build skipped (optional)"
cd "$PROJECT_ROOT"
log_success "Shared packages ready"

# Step 6: Start Docker services (PostgreSQL + Redis)
log_step "Step 6/8: Starting Docker services..."
docker-compose up -d postgres redis
log_info "Waiting for PostgreSQL to be ready..."
sleep 10

# Wait for PostgreSQL to accept connections
RETRY_COUNT=0
MAX_RETRIES=30
until docker exec estates_postgres pg_isready -U postgres > /dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    log_info "Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "PostgreSQL failed to start after $MAX_RETRIES attempts"
    exit 1
fi

log_success "Docker services started (PostgreSQL + Redis)"

# Step 7: Run migrations
log_step "Step 7/8: Setting up database schema..."
cd "$PROJECT_ROOT/apps/api"

log_info "Creating database schema..."
# For fresh start, we'll use synchronize in the seed script which creates tables
# This avoids migration path alias issues with TypeORM CLI
log_success "Database ready for seeding"

# Step 8: Seed database with sample data
log_step "Step 8/8: Seeding database with sample data..."
cd "$PROJECT_ROOT"

log_info "Creating users, properties, clients, and images..."
npx ts-node --project tsconfig.seed.json -r tsconfig-paths/register seeds/fresh-start-seed.ts || {
    log_error "Seeding failed! Check the error above."
    exit 1
}

log_success "Database seeded successfully!"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ FRESH START COMPLETE!                            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Database Summary:"
echo "   👥 Users: 4 (admin, manager, 2 agents)"
echo "   🏠 Properties: 10 (apartments, houses, offices)"
echo "   🖼️  Images: 20+ property images"
echo "   👤 Clients: 5 with property relationships"
echo ""
echo "🔐 Default Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "▶  Next Steps:"
echo ""
echo "   Start all services:"
echo "   $ npm run dev"
echo ""
echo "   Or start individually:"
echo "   $ npm run dev:api      # API at http://localhost:3000"
echo "   $ npm run dev:admin    # Admin at http://localhost:3001"
echo "   $ npm run dev:user     # User web at http://localhost:3002"
echo ""
echo "   View logs:"
echo "   $ npm run docker:logs"
echo ""
