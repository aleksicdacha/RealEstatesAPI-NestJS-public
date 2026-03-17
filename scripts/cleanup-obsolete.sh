#!/bin/bash

# Script to clean up obsolete documentation and scripts
# This will be run automatically before deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Cleaning up obsolete files...${NC}"

# Obsolete deployment guides (keeping only essential ones)
OBSOLETE_MD=(
    "DEPLOYMENT_README.md"
    "PRODUCTION_DEPLOYMENT_GUIDE.md"
    "SERVER_NEXT_STEPS.md"
    "DDOS_FIX_CHECKLIST.md"
    "MANUAL_PRODUCTION_DEPLOY.md"
    "QUICK_FIX_GITHUB_ACTIONS.md"
    "SERVER_START_COMMANDS.md"
    "SECURITY_QUICK_REFERENCE.md"
    "PRODUCTION_DEPLOYMENT_NOW.md"
    "SERVER_FINAL_SETUP.md"
    "SERVER_DEPLOYMENT_STEPS.md"
    "SERVER_DEPLOYMENT_GUIDE.md"
    "PRODUCTION_COMMANDS.md"
    "MANUAL_START_COMMANDS.md"
    "HETZNER_SETUP_CHECKLIST.md"
    "SERVER_START_NOW.md"
    "DEPLOY_QUICK_START.md"
    "SERVER_DEPLOYMENT_COMMANDS.md"
    "SERVER_COMMANDS.md"
)

# Obsolete scripts
OBSOLETE_SH=(
    "SERVER_MANUAL_DEPLOY.sh"
    "SERVER_FIX_AND_DEPLOY.sh"
    "QUICK_SERVER_START.sh"
    "deploy-ddos-fix.sh"
    "fix-migration-deploy.sh"
    "ssh-harden.sh"
    "SERVER_GIT_FIX.sh"
    "test-ux-features.sh"
    "ddos-detection.sh"
    "emergency-cleanup.sh"
    "SERVER_QUICK_COMMANDS.sh"
    "server-security-audit.sh"
    "ssh-monitor.sh"
    "create-prod-env.sh"
    "quick-prod-deploy.sh"
    "deploy-production-complete.sh"
    "fix-server-git-conflict.sh"
    "setup-production-env.sh"
    "malware-scan.sh"
    "setup-github-actions-ssh.sh"
    "SERVER_COMPLETE_SETUP.sh"
    "server-create-env.sh"
    "deploy-production.sh"
    "monorepo-setup.sh"
    "PRODUCTION_START_COMMANDS.sh"
    "production-verification.sh"
    "start.sh"
)

# Obsolete text files
OBSOLETE_TXT=(
    "DEPLOY_NOW.txt"
    "QUICK_REFERENCE_DDOS_FIX.txt"
    "QUICK_SERVER_START.txt"
    "SERVER_COMMANDS.txt"
)

# Create archive directory
ARCHIVE_DIR="archive/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

# Move obsolete MD files
for file in "${OBSOLETE_MD[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo -e "${YELLOW}Archived: $file${NC}"
    fi
done

# Move obsolete shell scripts
for file in "${OBSOLETE_SH[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo -e "${YELLOW}Archived: $file${NC}"
    fi
done

# Move obsolete text files
for file in "${OBSOLETE_TXT[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo -e "${YELLOW}Archived: $file${NC}"
    fi
done

echo -e "${GREEN}✅ Cleanup complete! Obsolete files moved to $ARCHIVE_DIR${NC}"
echo -e "${GREEN}You can safely delete the archive directory later.${NC}"
