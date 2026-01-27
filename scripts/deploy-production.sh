#!/bin/bash

################################################################################
# Real Estate Platform - Production Deployment Script
#
# This script:
# 1. Pulls latest code from GitHub
# 2. Installs dependencies
# 3. Builds applications
# 4. Runs database migrations
# 5. Restarts services
#
# Usage: ./deploy.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$HOME/RealEstatesAPI-NestJS"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🚀 Real Estate Platform - Production Deployment      ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Step 1: Pull latest code
echo -e "${YELLOW}📥 Step 1/6: Pulling latest code from GitHub...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Step 2/6: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build shared packages
echo -e "${YELLOW}🔧 Step 3/6: Building shared packages...${NC}"
cd packages/types
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Package build failed!${NC}"
    exit 1
fi
cd ../..
echo -e "${GREEN}✅ Shared packages built${NC}"
echo ""

# Step 4: Run database migrations
echo -e "${YELLOW}🗄️  Step 4/6: Running database migrations...${NC}"
cd apps/api
npm run migration:run
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Migration failed or no new migrations${NC}"
fi
cd ../..
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# Step 5: Build all applications
echo -e "${YELLOW}🏗️  Step 5/6: Building applications...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Applications built${NC}"
echo ""

# Step 6: Restart PM2 processes
echo -e "${YELLOW}🔄 Step 6/6: Restarting services...${NC}"

# Check if PM2 is running any processes
PM2_LIST=$(pm2 list | grep -E "realestates-(api|admin|user)")

if [ -z "$PM2_LIST" ]; then
    echo -e "${YELLOW}⚠️  No PM2 processes found. Starting fresh...${NC}"

    # Start API
    cd apps/api
    pm2 start dist/main.js --name "realestates-api" --env production

    # Start Admin Web
    cd ../admin-web
    pm2 start npm --name "realestates-admin" -- start

    # Start User Web
    cd ../user-web
    pm2 start npm --name "realestates-user" -- start

    cd ../..

    # Save PM2 config
    pm2 save
else
    echo -e "${BLUE}Restarting existing PM2 processes...${NC}"
    pm2 restart all
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 restart failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Show status
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Deployment Complete!                              ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📊 Current Status:${NC}"
pm2 status

echo ""
echo -e "${YELLOW}📝 Recent Logs:${NC}"
pm2 logs --lines 10 --nostream

echo ""
echo -e "${BLUE}────────────────────────────────────────────────────────${NC}"
echo -e "${GREEN}Deployment completed successfully! 🎉${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:       ${BLUE}pm2 logs${NC}"
echo -e "  Monitor:         ${BLUE}pm2 monit${NC}"
echo -e "  Status:          ${BLUE}pm2 status${NC}"
echo -e "  Restart all:     ${BLUE}pm2 restart all${NC}"
echo -e "  Stop all:        ${BLUE}pm2 stop all${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────${NC}"
echo ""
