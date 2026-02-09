#!/bin/bash

# Quick validation script to ensure deployment system is ready
# Run this before committing to verify everything is in place

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Validating Deployment System..."
echo ""

ERRORS=0

# Check main deployment script
if [ -x "deploy.sh" ]; then
    echo -e "${GREEN}✅ deploy.sh is executable${NC}"
else
    echo -e "${RED}❌ deploy.sh is missing or not executable${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check documentation
DOCS=(
    "DEPLOYMENT_MASTER_GUIDE.md"
    "SEEDING_GUIDE.md"
    "QUICK_START_DEV.md"
    "AI_PROJECT_CONTEXT.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc exists${NC}"
    else
        echo -e "${RED}❌ $doc is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check seed script
if [ -f "seeds/local-development-seed.ts" ]; then
    echo -e "${GREEN}✅ Local seed script exists${NC}"
else
    echo -e "${RED}❌ Local seed script is missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "seeds/production-seed.ts" ]; then
    echo -e "${GREEN}✅ Production seed script exists${NC}"
else
    echo -e "${RED}❌ Production seed script is missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Docker Compose files
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.yml exists (local)${NC}"
else
    echo -e "${RED}❌ docker-compose.yml is missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "docker-compose.prod.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.prod.yml exists (production)${NC}"
else
    echo -e "${RED}❌ docker-compose.prod.yml is missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check package.json has seed scripts
if grep -q "seed:dev" apps/api/package.json; then
    echo -e "${GREEN}✅ seed:dev script configured${NC}"
else
    echo -e "${RED}❌ seed:dev script not found in apps/api/package.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "seed:prod" apps/api/package.json; then
    echo -e "${GREEN}✅ seed:prod script configured${NC}"
else
    echo -e "${RED}❌ seed:prod script not found in apps/api/package.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check cleanup script
if [ -x "cleanup-obsolete.sh" ]; then
    echo -e "${GREEN}✅ cleanup-obsolete.sh is executable${NC}"
else
    echo -e "${YELLOW}⚠️  cleanup-obsolete.sh not executable (optional)${NC}"
fi

# Check production management script
if [ -x "production-commands.sh" ]; then
    echo -e "${GREEN}✅ production-commands.sh is executable${NC}"
else
    echo -e "${YELLOW}⚠️  production-commands.sh not executable (optional)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - DEPLOYMENT SYSTEM READY!${NC}"
    echo ""
    echo "You can now:"
    echo "  • Run './deploy.sh' for local development"
    echo "  • Run './deploy.sh' on production server"
    echo "  • Commit and push changes to Git"
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERRORS FOUND - PLEASE FIX BEFORE DEPLOYING${NC}"
    exit 1
fi
