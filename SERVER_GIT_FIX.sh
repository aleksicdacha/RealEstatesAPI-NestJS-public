#!/bin/bash
# Git Conflict Resolution on Server
# Run this ON THE SERVER when you have git conflicts

set -e

echo "🔧 Git Conflict Resolution Helper"
echo "=================================="
echo ""

cd ~/RealEstatesAPI-NestJS || { echo "❌ Project directory not found"; exit 1; }

echo "Current git status:"
echo "-------------------"
git status
echo ""

echo "Choose an option:"
echo "1) Stash server changes and pull from origin (RECOMMENDED)"
echo "2) Create backup branch and pull (SAFE)"
echo "3) Force reset to origin (DANGER - loses all server changes)"
echo "4) Cancel and handle manually"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Option 1: Stashing server changes..."
        git stash save "Server changes backup - $(date +%Y%m%d-%H%M%S)"
        echo "✅ Changes stashed"

        echo "Pulling from origin..."
        git pull origin develop
        echo "✅ Code pulled"

        echo ""
        echo "Your server changes are saved in git stash."
        echo "To view stashed changes: git stash list"
        echo "To restore stashed changes: git stash pop"
        echo "To see what was stashed: git stash show -p"
        ;;

    2)
        echo ""
        echo "Option 2: Creating backup branch..."
        backup_branch="server-backup-$(date +%Y%m%d-%H%M%S)"
        git checkout -b "$backup_branch"
        git add -A
        git commit -m "Server backup before pull - $(date)" || true
        echo "✅ Backup branch created: $backup_branch"

        echo "Switching back to develop..."
        git checkout develop

        echo "Resetting to origin..."
        git fetch origin
        git reset --hard origin/develop
        echo "✅ Branch reset to origin"

        echo ""
        echo "Your server changes are saved in branch: $backup_branch"
        echo "To view backup: git checkout $backup_branch"
        echo "To delete backup: git branch -D $backup_branch"
        ;;

    3)
        echo ""
        echo "⚠️  WARNING: This will DELETE all server changes!"
        read -p "Are you sure? Type 'yes' to confirm: " confirm

        if [ "$confirm" = "yes" ]; then
            echo "Force resetting to origin..."
            git fetch origin
            git reset --hard origin/develop
            git clean -fd
            echo "✅ Repository reset to origin"
        else
            echo "❌ Cancelled"
            exit 1
        fi
        ;;

    4)
        echo "❌ Cancelled. Handle conflicts manually with git."
        echo ""
        echo "Useful commands:"
        echo "  git status                    # See status"
        echo "  git diff                      # See changes"
        echo "  git stash                     # Stash changes"
        echo "  git reset --hard HEAD         # Discard changes"
        echo "  git pull origin develop       # Pull from origin"
        exit 0
        ;;

    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Current status after resolution:"
git status
echo ""
echo "✅ Git conflict resolved!"
echo ""
echo "Next steps:"
echo "1. Run: ./SERVER_MANUAL_DEPLOY.sh"
echo "   OR"
echo "2. Run: ./SERVER_COMPLETE_SETUP.sh"
