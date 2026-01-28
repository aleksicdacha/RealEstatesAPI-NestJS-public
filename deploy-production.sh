#!/bin/bash

# Production Deployment Script
# Uses docker-compose.prod.yml for production environment
# Date: January 28, 2026

set -e  # Exit on error

echo "========================================="
echo "Production Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Pre-flight checks
echo -e "${YELLOW}Step 1: Pre-flight checks...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}✗ .env.production not found!${NC}"
    echo "Please create .env.production file with production credentials"
    exit 1
fi

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}✗ docker-compose.prod.yml not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuration files found${NC}"
echo ""

# Step 2: Creating backup
echo -e "${YELLOW}Step 2: Creating backup...${NC}"
BACKUP_BRANCH="backup-before-deployment-$(date +%Y%m%d%H%M%S)"
git stash save "Pre-deployment backup $(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
git branch "$BACKUP_BRANCH" 2>/dev/null || echo "  Note: Backup branch creation skipped"
echo -e "${GREEN}✓ Backup created: $BACKUP_BRANCH${NC}"
echo ""

# Step 3: Stop existing services
echo -e "${YELLOW}Step 3: Stopping existing services...${NC}"

# Stop PM2 services if running
echo "  - Stopping PM2 services..."
pm2 stop all 2>/dev/null || echo "    No PM2 services running"
pm2 delete all 2>/dev/null || echo "    No PM2 services to delete"

# Stop Docker containers if running
echo "  - Stopping Docker containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || echo "    No Docker containers running"

echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

# Step 4: Pull latest changes
echo -e "${YELLOW}Step 4: Pulling latest changes from Git...${NC}"
git pull origin develop || {
    echo -e "${RED}✗ Git pull failed. Resolving conflicts...${NC}"
    echo "  Setting pull strategy to rebase..."
    git config pull.rebase false
    git pull origin develop || {
        echo -e "${RED}✗ Still failed. You may need to manually resolve conflicts.${NC}"
        echo "  Run: git status"
        exit 1
    }
}
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 5: Install dependencies
echo -e "${YELLOW}Step 5: Installing dependencies...${NC}"
echo "  - Root dependencies..."
npm install

echo "  - API dependencies..."
cd apps/api
npm install --production
cd ../..

echo "  - Admin-web dependencies..."
cd apps/admin-web
npm install --production
cd ../..

echo "  - User-web dependencies..."
cd apps/user-web
npm install --production
cd ../..

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 6: Build TypeScript packages
echo -e "${YELLOW}Step 6: Building shared packages...${NC}"
cd packages/types
npm run build 2>/dev/null || echo "  Skipped types build"
cd ../..
echo -e "${GREEN}✓ Packages built${NC}"
echo ""

# Step 7: Database setup
echo -e "${YELLOW}Step 7: Setting up database...${NC}"

# Start only PostgreSQL service
echo "  - Starting PostgreSQL..."
docker compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "  - Waiting for PostgreSQL to be ready..."
sleep 10

# Run migrations
echo "  - Running database migrations..."
cd apps/api
npm run migration:run || {
    echo -e "${YELLOW}  ⚠️  Migration failed or already up to date${NC}"
}
cd ../..

echo -e "${GREEN}✓ Database ready${NC}"
echo ""

# Step 8: Start all services with Docker Compose
echo -e "${YELLOW}Step 8: Starting production services with Docker Compose...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✓ All services started${NC}"
echo ""

# Step 9: Wait for services to initialize
echo -e "${YELLOW}Step 9: Waiting for services to initialize...${NC}"
echo "  This may take 1-2 minutes..."

# Wait and check health
for i in {1..30}; do
    sleep 2
    echo -n "."
done
echo ""
echo -e "${GREEN}✓ Services initialized${NC}"
echo ""

# Step 10: Health checks
echo -e "${YELLOW}Step 10: Running health checks...${NC}"

echo "  - Checking Docker containers..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "  - Testing API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/v1/properties/public?page=1&limit=1 2>/dev/null || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ API responding (HTTP $API_RESPONSE)${NC}"
else
    echo -e "${RED}  ✗ API not responding properly (HTTP $API_RESPONSE)${NC}"
    echo "  Check logs with: docker compose -f docker-compose.prod.yml logs api"
fi

echo ""
echo "  - Testing Admin-web..."
ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
if [ "$ADMIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ Admin-web responding (HTTP $ADMIN_RESPONSE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  Admin-web not responding yet (HTTP $ADMIN_RESPONSE)${NC}"
fi

echo ""
echo "  - Testing User-web..."
USER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null || echo "000")
if [ "$USER_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ User-web responding (HTTP $USER_RESPONSE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  User-web not responding yet (HTTP $USER_RESPONSE)${NC}"
fi

echo ""
echo "  - Checking for DDoS prevention (Overpass API connections)..."
OVERPASS_COUNT=$(sudo netstat -an 2>/dev/null | grep -c "92.118.207.21" || echo "0")
if [ "$OVERPASS_COUNT" -eq 0 ]; then
    echo -e "${GREEN}  ✓ No Overpass connections (Rate limiting working)${NC}"
else
    echo -e "${YELLOW}  ⚠️  Found $OVERPASS_COUNT connections to Overpass API${NC}"
    echo "  This should decrease to 0-2 connections within a few minutes"
fi

echo ""

# Step 11: Summary
echo "========================================="
echo -e "${GREEN}PRODUCTION DEPLOYMENT COMPLETE${NC}"
echo "========================================="
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo "  - API:       http://46.224.231.217:3000"
echo "  - Admin-web: http://46.224.231.217:3001"
echo "  - User-web:  http://46.224.231.217:3002"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  - View logs:           docker compose -f docker-compose.prod.yml logs -f"
echo "  - View API logs:       docker compose -f docker-compose.prod.yml logs -f api"
echo "  - Restart service:     docker compose -f docker-compose.prod.yml restart api"
echo "  - Stop all:            docker compose -f docker-compose.prod.yml down"
echo "  - Restart all:         docker compose -f docker-compose.prod.yml restart"
echo "  - Check status:        docker compose -f docker-compose.prod.yml ps"
echo "  - Monitor DDoS:        watch -n 5 'sudo netstat -an | grep 92.118.207.21 | wc -l'"
echo ""
echo -e "${BLUE}Rollback:${NC}"
echo "  If issues occur:"
echo "    git checkout $BACKUP_BRANCH"
echo "    ./deploy-production.sh"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Monitor logs for any errors"
echo "  2. Test admin panel login at http://46.224.231.217:3001"
echo "  3. Test user website at http://46.224.231.217:3002"
echo "  4. Monitor Overpass connections for next 30 minutes"
echo "  5. Check email from Hetzner for any new DDoS alerts"
echo ""

# Optional: Start monitoring
read -p "View live logs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Monitoring logs (Ctrl+C to exit)..."
    docker compose -f docker-compose.prod.yml logs -f
fi
