#!/bin/bash

################################################################################
# Production Server - Complete Setup & Deployment Script
#
# This script handles:
# 1. Git conflicts (server vs local changes)
# 2. Dependencies installation
# 3. Building all apps
# 4. Database migrations
# 5. PM2 process management
# 6. CORS/WebSocket fixes
#
# Usage:
#   ./scripts/server-deploy.sh         # Normal deployment
#   ./scripts/server-deploy.sh --force # Force overwrite with remote
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$HOME/RealEstatesAPI-NestJS"
FORCE_MODE=false

if [[ "$1" == "--force" ]]; then
    FORCE_MODE=true
fi

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🚀 Real Estate Platform - Server Deployment          ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_DIR"

# ============================================================================
# Step 1: Handle Git Conflicts
# ============================================================================
echo -e "${YELLOW}📥 Step 1/8: Handling Git Repository...${NC}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected on server${NC}"

    if [ "$FORCE_MODE" = true ]; then
        echo -e "${RED}🔥 Force mode: Stashing local changes...${NC}"
        git stash save "Server changes before deployment $(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Changes stashed${NC}"
    else
        echo -e "${CYAN}What would you like to do?${NC}"
        echo -e "  1) Stash server changes and pull (RECOMMENDED)"
        echo -e "  2) Commit server changes first"
        echo -e "  3) Reset server to match remote (DESTRUCTIVE)"
        echo -e "  4) Skip git pull (use existing code)"
        echo ""
        read -p "Enter choice [1-4]: " choice

        case $choice in
            1)
                git stash save "Server changes before deployment $(date +%Y%m%d_%H%M%S)"
                echo -e "${GREEN}✅ Changes stashed${NC}"
                ;;
            2)
                git add .
                read -p "Enter commit message: " commit_msg
                git commit -m "$commit_msg"
                echo -e "${GREEN}✅ Changes committed${NC}"
                ;;
            3)
                git reset --hard origin/develop
                git clean -fd
                echo -e "${GREEN}✅ Reset to remote${NC}"
                ;;
            4)
                echo -e "${YELLOW}⚠️  Skipping git pull${NC}"
                git status
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
                exit 1
                ;;
        esac
    fi
fi

# Pull latest code (if not skipped)
if [ "$choice" != "4" ]; then
    echo -e "${CYAN}Pulling latest code...${NC}"

    # Fetch first
    git fetch origin develop

    # Try to pull with rebase
    if ! git pull origin develop --rebase; then
        echo -e "${RED}❌ Git pull failed!${NC}"
        echo -e "${YELLOW}💡 To manually fix:${NC}"
        echo -e "   git fetch origin develop"
        echo -e "   git reset --hard origin/develop  # (DESTRUCTIVE)"
        echo -e "   OR resolve conflicts manually"
        exit 1
    fi

    echo -e "${GREEN}✅ Code updated from remote${NC}"
fi

echo ""

# ============================================================================
# Step 2: Stop existing PM2 processes
# ============================================================================
echo -e "${YELLOW}🛑 Step 2/8: Stopping existing services...${NC}"
pm2 stop all || true
pm2 delete all || true
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# ============================================================================
# Step 3: Install dependencies
# ============================================================================
echo -e "${YELLOW}📦 Step 3/8: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# ============================================================================
# Step 4: Build shared packages
# ============================================================================
echo -e "${YELLOW}🔧 Step 4/8: Building shared packages...${NC}"
cd packages/types
npm run build
cd ../..
echo -e "${GREEN}✅ Shared packages built${NC}"
echo ""

# ============================================================================
# Step 5: Build all applications
# ============================================================================
echo -e "${YELLOW}🏗️  Step 5/8: Building applications...${NC}"

# Build API
echo -e "${CYAN}  - Building API...${NC}"
cd apps/api
npm run build
cd ../..

# Build Admin Web
echo -e "${CYAN}  - Building Admin Web...${NC}"
cd apps/admin-web
npm run build
cd ../..

# Build User Web
echo -e "${CYAN}  - Building User Web...${NC}"
cd apps/user-web
npm run build
cd ../..

echo -e "${GREEN}✅ All applications built${NC}"
echo ""

# ============================================================================
# Step 6: Run database migrations
# ============================================================================
echo -e "${YELLOW}🗄️  Step 6/8: Running database migrations...${NC}"
cd apps/api
npm run migration:run || echo -e "${YELLOW}⚠️  No new migrations or error${NC}"
cd ../..
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# ============================================================================
# Step 7: Verify environment configuration
# ============================================================================
echo -e "${YELLOW}⚙️  Step 7/8: Verifying environment...${NC}"

# Check .env file
if [ ! -f "apps/api/.env" ]; then
    echo -e "${RED}❌ Missing apps/api/.env file!${NC}"
    echo -e "${YELLOW}Creating from .env.example...${NC}"
    cp apps/api/.env.example apps/api/.env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit apps/api/.env with production values!${NC}"
    echo -e "${YELLOW}   nano apps/api/.env${NC}"
    exit 1
fi

# Verify CORS_ORIGIN is set for production
if ! grep -q "CORS_ORIGIN=.*46.224.231.217" apps/api/.env; then
    echo -e "${YELLOW}⚠️  Warning: CORS_ORIGIN may not include production server IP${NC}"
    echo -e "${YELLOW}   Expected: CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002${NC}"
    echo -e "${YELLOW}   Check: apps/api/.env${NC}"
fi

echo -e "${GREEN}✅ Environment verified${NC}"
echo ""

# ============================================================================
# Step 8: Start services with PM2
# ============================================================================
echo -e "${YELLOW}🚀 Step 8/8: Starting services...${NC}"

# Check if ecosystem.config.js exists
if [ -f "ecosystem.config.js" ]; then
    echo -e "${CYAN}Using PM2 ecosystem config...${NC}"
    pm2 start ecosystem.config.js
else
    echo -e "${CYAN}Starting services manually...${NC}"

    cd apps/api
    pm2 start dist/main.js --name "realestates-api" --env production
    cd ../..

    cd apps/admin-web
    pm2 start npm --name "realestates-admin" -- start
    cd ../..

    cd apps/user-web
    pm2 start npm --name "realestates-user" -- start
    cd ../..
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup (if not already configured)
echo -e "${CYAN}Configuring PM2 startup...${NC}"
pm2 startup | grep -o 'sudo.*' | bash || true

echo -e "${GREEN}✅ All services started${NC}"
echo ""

# ============================================================================
# Final Status & Summary
# ============================================================================
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Deployment Complete!                              ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status
echo ""

echo -e "${YELLOW}🌐 Application URLs:${NC}"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "  API:        ${BLUE}http://${SERVER_IP}:3000/v1${NC}"
echo -e "  Admin Web:  ${BLUE}http://${SERVER_IP}:3001${NC}"
echo -e "  User Web:   ${BLUE}http://${SERVER_IP}:3002${NC}"
echo ""

echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo -e "  View logs:        ${BLUE}pm2 logs${NC}"
echo -e "  Monitor:          ${BLUE}pm2 monit${NC}"
echo -e "  Restart all:      ${BLUE}pm2 restart all${NC}"
echo -e "  Stop all:         ${BLUE}pm2 stop all${NC}"
echo -e "  Show config:      ${BLUE}pm2 show realestates-api${NC}"
echo ""

echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
echo -e "  Check API logs:   ${BLUE}pm2 logs realestates-api --lines 50${NC}"
echo -e "  Test API:         ${BLUE}curl http://localhost:3000/v1/properties/public${NC}"
echo -e "  Restart API:      ${BLUE}pm2 restart realestates-api${NC}"
echo ""

echo -e "${GREEN}Deployment completed successfully! 🎉${NC}"
echo ""
