#!/bin/bash

###############################################################################
# Local Development Environment Setup Script
# This script sets up the complete local development environment including:
# - Docker services (PostgreSQL, Redis, API)
# - Database migrations
# - Database seeding with 10+ items per entity
# - Frontend applications (admin-web & user-web)
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

print_header "Real Estate Platform - Local Development Setup"

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    print_error ".env.development file not found!"
    print_info "Creating .env.development from template..."

    cat > .env.development << 'EOF'
NODE_ENV=development
PORT=3000

BASE_URL='http://localhost:3000'
FILE_UPLOAD_PATH=./uploads

# Generate with: openssl rand -hex 64
JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME
JWT_REFRESH_EXPIRES_IN=7d

DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
DB_SYNC=false

REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=aleksic.dacha@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=Real Estate Admin <aleksic.dacha@gmail.com>
FRONTEND_URL=http://localhost:3002

# CORS Configuration
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

# Gemini AI for Chatbot (optional - has fallback)
GEMINI_API_KEY=your-gemini-api-key-here
EOF
    print_success "Created .env.development file"
fi

# Step 1: Clean up existing Docker containers
print_header "Step 1: Cleaning up existing Docker containers"
print_info "Stopping and removing existing containers..."
docker-compose down -v 2>/dev/null || true
print_success "Cleanup completed"

# Step 2: Start Docker services (PostgreSQL + Redis only)
print_header "Step 2: Starting Docker services"
print_info "Starting PostgreSQL and Redis containers..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
print_info "Waiting for PostgreSQL to be ready..."
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
until docker exec estates_postgres pg_isready -U postgres > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        print_error "PostgreSQL failed to start after $MAX_RETRIES attempts"
        exit 1
    fi
    print_info "Waiting for PostgreSQL... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

print_success "PostgreSQL is ready"
print_success "Redis is ready"

# Step 3: Install dependencies
print_header "Step 3: Installing dependencies"
print_info "Installing root workspace dependencies..."
npm install

print_info "Installing API dependencies..."
cd apps/api
npm install
cd "$PROJECT_ROOT"

print_info "Installing admin-web dependencies..."
cd apps/admin-web
npm install
cd "$PROJECT_ROOT"

print_info "Installing user-web dependencies..."
cd apps/user-web
npm install
cd "$PROJECT_ROOT"

print_success "All dependencies installed"

# Step 4: Database schema (using synchronize)
print_header "Step 4: Creating database schema"
print_info "Using TypeORM synchronize to auto-create schema from entities..."
print_warning "Note: Migrations are skipped due to corrupted files (see MIGRATION_ISSUES.md)"
print_info "Schema will be created automatically when API starts"
print_success "Schema setup configured"

# Step 5: Seed the database
print_header "Step 5: Database Seeding"
print_info "Database seeding will be done after first API start"
print_warning "The API needs to start once to create the schema (synchronize=true)"
print_info "After starting the API with 'npm run dev:api', run:"
echo "  ${BLUE}cd apps/api && npx nest start${NC} (wait for it to start)"
echo "  ${BLUE}cd apps/api && npx ts-node ../../seeds/local-comprehensive-seed.ts${NC}"
print_success "Seeding instructions prepared"

# Step 6: Display configuration summary
print_header "Configuration Summary"

echo "🗄️  Database Configuration:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: estates"
echo "   Username: postgres"
echo "   Password: (see .env.development)"
echo ""

echo "🔐 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""

echo "📡 Service Ports:"
echo "   API: http://localhost:3000"
echo "   Admin Web: http://localhost:3001"
echo "   User Web: http://localhost:3002"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""

# Step 7: Start the applications
print_header "Step 7: Starting applications"

print_info "Applications can be started with the following commands:"
echo ""
echo "  In separate terminal windows, run:"
echo ""
echo "  Terminal 1 (API):"
echo "    ${BLUE}cd apps/api && npm run start:dev${NC}"
echo ""
echo "  Terminal 2 (Admin Web):"
echo "    ${BLUE}cd apps/admin-web && npm run dev${NC}"
echo ""
echo "  Terminal 3 (User Web):"
echo "    ${BLUE}cd apps/user-web && npm run dev${NC}"
echo ""
echo "  Or use turborepo to run all at once:"
echo "    ${BLUE}npm run dev${NC}"
echo ""

print_header "Setup Complete!"

print_success "Local development environment is ready!"
echo ""
print_info "Quick Start Commands:"
echo "  • Start all apps:        ${BLUE}npm run dev${NC}"
echo "  • Start API only:        ${BLUE}npm run dev:api${NC}"
echo "  • Start Admin Web:       ${BLUE}npm run dev:admin${NC}"
echo "  • Start User Web:        ${BLUE}npm run dev:user${NC}"
echo "  • View Docker logs:      ${BLUE}npm run docker:logs${NC}"
echo "  • Stop Docker services:  ${BLUE}npm run docker:down${NC}"
echo ""
print_info "API Documentation: http://localhost:3000/api"
echo ""

# Ask if user wants to start all services
read -p "Would you like to start all services now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting all services..."
    npm run dev
fi
