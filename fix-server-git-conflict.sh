#!/bin/bash

# Fix Git Conflict on Production Server
# Run this ON THE SERVER

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║ FIXING GIT CONFLICT ON SERVER                                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"

cd ~/RealEstatesAPI-NestJS

# 1. Show current status
echo ""
echo "📊 Current status:"
git status

# 2. Create backup of local changes
echo ""
echo "💾 Creating backup of local changes..."
BACKUP_BRANCH="server-local-changes-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Backup created: $BACKUP_BRANCH"

# 3. Stash any uncommitted changes
echo ""
echo "📦 Stashing uncommitted changes..."
git stash save "Server changes before merge $(date)"

# 4. Configure merge strategy
echo ""
echo "⚙️  Configuring merge strategy..."
git config pull.rebase false

# 5. Pull and merge
echo ""
echo "🔄 Pulling changes from develop..."
git pull origin develop

# 6. Check if stash exists and apply
echo ""
echo "📤 Checking for stashed changes..."
if git stash list | grep -q "Server changes"; then
    echo "⚠️  You have stashed changes. Review them with:"
    echo "    git stash list"
    echo "    git stash show -p stash@{0}"
    echo "    git stash pop (to apply them back)"
fi

# 7. Show final status
echo ""
echo "✅ Git conflict resolved!"
echo ""
echo "📊 Final status:"
git status
git log --oneline -5

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║ NEXT STEP: Run ./deploy-ddos-fix.sh                                      ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
