#!/bin/bash

###############################################################################
# Production Environment Setup Script
# This script sets up the production environment including:
# - Docker services (PostgreSQL, Redis, API, Admin-Web, User-Web)
# - Database migrations
# - Database seeding
# - SSL/HTTPS configuration (optional)
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

print_header "Real Estate Platform - Production Setup"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production with production settings"
    print_info "Template:"
    cat << 'EOF'

NODE_ENV=production
PORT=3000

# Database (use strong credentials in production!)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_NAME=estates
DB_SYNC=false

# JWT (generate strong secrets!)
JWT_SECRET=CHANGE_ME_MIN_64_CHARS_RANDOM_STRING
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME_MIN_64_CHARS_RANDOM_STRING
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=aleksic.dacha@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=Real Estate <aleksic.dacha@gmail.com>
FRONTEND_URL=https://yourdomain.com

# CORS (your production domains)
CORS_ORIGIN=https://admin.yourdomain.com,https://yourdomain.com

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

EOF
    exit 1
fi

# Step 1: Check Docker installation
print_header "Step 1: Checking prerequisites"
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    print_info "Install Docker: https://docs.docker.com/engine/install/"
    exit 1
fi
print_success "Docker is installed"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    print_info "Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
print_success "Docker Compose is installed"

# Step 2: Clean up existing containers (optional - ask user)
print_header "Step 2: Container cleanup"
read -p "Do you want to remove existing containers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Stopping and removing existing containers..."
    docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
    print_success "Cleanup completed"
else
    print_info "Skipping cleanup"
fi

# Step 3: Build and start production containers
print_header "Step 3: Building and starting production services"
print_info "This may take several minutes..."

docker-compose -f docker-compose.prod.yml build --no-cache

if [ $? -ne 0 ]; then
    print_error "Docker build failed!"
    exit 1
fi

print_success "Docker images built successfully"

print_info "Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    print_error "Failed to start containers!"
    exit 1
fi

# Wait for PostgreSQL to be ready
print_info "Waiting for PostgreSQL to be ready..."
sleep 10

MAX_RETRIES=30
RETRY_COUNT=0
until docker exec estates_postgres_prod pg_isready -U postgres > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        print_error "PostgreSQL failed to start after $MAX_RETRIES attempts"
        docker-compose -f docker-compose.prod.yml logs postgres
        exit 1
    fi
    print_info "Waiting for PostgreSQL... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 3
done

print_success "PostgreSQL is ready"

# Step 4: Run database migrations
print_header "Step 4: Running database migrations"
print_info "Executing migrations inside API container..."

docker exec estates_api_prod npm run migration:run

if [ $? -eq 0 ]; then
    print_success "Migrations completed successfully"
else
    print_warning "Migrations may have failed or already been run"
    print_info "Check logs: docker-compose -f docker-compose.prod.yml logs api"
fi

# Step 5: Seed database (optional - ask user)
print_header "Step 5: Database seeding"
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    docker exec estates_api_prod npx ts-node /app/seeds/local-comprehensive-seed.ts

    if [ $? -eq 0 ]; then
        print_success "Database seeded successfully"
    else
        print_warning "Seeding failed, but continuing..."
    fi
else
    print_info "Skipping database seeding"
fi

# Step 6: Display status
print_header "Production Deployment Status"

echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔐 Important Security Notes:"
echo "   1. Change default database password in .env.production"
echo "   2. Generate strong JWT secrets (min 64 characters)"
echo "   3. Configure SSL/TLS for HTTPS"
echo "   4. Set up firewall rules (UFW/iptables)"
echo "   5. Enable automatic security updates"
echo "   6. Regular backups of database"
echo ""

print_header "Setup Complete!"

print_success "Production environment is running!"
echo ""
print_info "Service URLs (configure reverse proxy/nginx):"
echo "  • API:        http://localhost:3000"
echo "  • Admin Web:  http://localhost:3001"
echo "  • User Web:   http://localhost:3002"
echo ""
print_info "Useful commands:"
echo "  • View logs:           ${BLUE}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo "  • Stop services:       ${BLUE}docker-compose -f docker-compose.prod.yml stop${NC}"
echo "  • Restart services:    ${BLUE}docker-compose -f docker-compose.prod.yml restart${NC}"
echo "  • Remove containers:   ${BLUE}docker-compose -f docker-compose.prod.yml down${NC}"
echo ""
print_warning "Next steps:"
echo "  1. Configure reverse proxy (Nginx/Caddy) for SSL"
echo "  2. Set up domain DNS records"
echo "  3. Create admin user account"
echo "  4. Test all functionality"
echo "  5. Set up monitoring (optional)"
echo ""
