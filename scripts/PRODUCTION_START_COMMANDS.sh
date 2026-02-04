#!/bin/bash
# Production Server - Complete Restart Script
# This script fixes migration errors and starts all services

set -e  # Exit on error

echo "========================================"
echo "🚀 Production Server - Complete Restart"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project directory
cd /root/RealEstatesAPI-NestJS

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Stop all running services
echo -e "${YELLOW}Step 1: Stopping all services...${NC}"
pm2 stop all || echo "No PM2 processes to stop"
pm2 delete all || echo "No PM2 processes to delete"
docker compose down || echo "No Docker containers to stop"
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# Step 2: Verify .env files exist
echo -e "${YELLOW}Step 2: Checking .env files...${NC}"
if [ ! -f "apps/api/.env" ]; then
    echo -e "${RED}❌ ERROR: apps/api/.env not found!${NC}"
    echo "Please run: nano apps/api/.env"
    echo "And paste your environment variables from local machine"
    exit 1
fi
if [ ! -f "apps/admin-web/.env.production" ]; then
    echo -e "${RED}❌ ERROR: apps/admin-web/.env.production not found!${NC}"
    echo "Please run: nano apps/admin-web/.env.production"
    exit 1
fi
if [ ! -f "apps/user-web/.env.production" ]; then
    echo -e "${RED}❌ ERROR: apps/user-web/.env.production not found!${NC}"
    echo "Please run: nano apps/user-web/.env.production"
    exit 1
fi
echo -e "${GREEN}✅ All .env files present${NC}"
echo ""

# Step 3: Start PostgreSQL with Docker
echo -e "${YELLOW}Step 3: Starting PostgreSQL...${NC}"
docker compose up -d postgres
echo "Waiting for PostgreSQL to be ready (30 seconds)..."
sleep 30
echo -e "${GREEN}✅ PostgreSQL started${NC}"
echo ""

# Step 4: Test database connection
echo -e "${YELLOW}Step 4: Testing database connection...${NC}"
# Extract DB credentials from .env file
DB_PASSWORD=$(grep "^DB_PASSWORD=" apps/api/.env | cut -d '=' -f2)
export PGPASSWORD="$DB_PASSWORD"

if psql -h localhost -U postgres -d estates -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo "Check your DB_PASSWORD in apps/api/.env"
    echo "It should match the password in docker-compose.yml"
    exit 1
fi
echo ""

# Step 5: Run migrations
echo -e "${YELLOW}Step 5: Running database migrations...${NC}"
cd apps/api
npm run migration:run || {
    echo -e "${YELLOW}⚠️  Migrations failed or already applied${NC}"
}
cd ../..
echo -e "${GREEN}✅ Migrations complete${NC}"
echo ""

# Step 6: Build all applications
echo -e "${YELLOW}Step 6: Building applications...${NC}"

echo "Building API..."
cd apps/api
npm run build
cd ../..
echo -e "${GREEN}✅ API built${NC}"

echo "Building Admin Web..."
cd apps/admin-web
npm run build
cd ../..
echo -e "${GREEN}✅ Admin Web built${NC}"

echo "Building User Web..."
cd apps/user-web
npm run build
cd ../..
echo -e "${GREEN}✅ User Web built${NC}"
echo ""

# Step 7: Start applications with PM2
echo -e "${YELLOW}Step 7: Starting applications with PM2...${NC}"

# Start API
echo "Starting API Backend..."
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production
cd ../..
echo -e "${GREEN}✅ API started on port 3000${NC}"

# Start Admin Web
echo "Starting Admin Web..."
cd apps/admin-web
pm2 start npm --name "realestates-admin" -- start
cd ../..
echo -e "${GREEN}✅ Admin Web started on port 3001${NC}"

# Start User Web
echo "Starting User Web..."
cd apps/user-web
pm2 start npm --name "realestates-user" -- start
cd ../..
echo -e "${GREEN}✅ User Web started on port 3002${NC}"

# Save PM2 configuration
pm2 save
pm2 startup
echo ""

# Step 8: Check status
echo -e "${YELLOW}Step 8: Checking service status...${NC}"
echo ""
pm2 status
echo ""
docker compose ps
echo ""

# Step 9: Health checks
echo -e "${YELLOW}Step 9: Running health checks...${NC}"
echo ""

# Wait for services to start
echo "Waiting for services to initialize (15 seconds)..."
sleep 15

# Check API
echo "Testing API..."
if curl -f http://localhost:3000/v1/properties/public?page=1&limit=1 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is responding${NC}"
else
    echo -e "${RED}⚠️  API might not be ready yet (check logs)${NC}"
fi

# Check Admin Web
echo "Testing Admin Web..."
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Web is responding${NC}"
else
    echo -e "${RED}⚠️  Admin Web might not be ready yet (check logs)${NC}"
fi

# Check User Web
echo "Testing User Web..."
if curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ User Web is responding${NC}"
else
    echo -e "${RED}⚠️  User Web might not be ready yet (check logs)${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "📊 Service URLs:"
echo "   API:       http://46.224.231.217:3000"
echo "   Admin Web: http://46.224.231.217:3001"
echo "   User Web:  http://46.224.231.217:3002"
echo ""
echo "📝 Useful commands:"
echo "   pm2 status          - Check PM2 services"
echo "   pm2 logs            - View all logs"
echo "   pm2 logs api        - View API logs only"
echo "   pm2 restart all     - Restart all services"
echo "   docker compose ps   - Check Docker services"
echo "   docker compose logs postgres - View database logs"
echo ""
echo "⚠️  If services are not responding:"
echo "   1. Check logs: pm2 logs"
echo "   2. Check if ports are open: netstat -tulpn | grep -E '3000|3001|3002'"
echo "   3. Restart specific service: pm2 restart [service-name]"
echo ""
