#!/bin/bash
# Quick Server Deployment Script
# Run this from your LOCAL machine to deploy to production

set -e

SERVER_IP="46.224.231.217"
SERVER_USER="root"
PROJECT_DIR="~/RealEstatesAPI-NestJS"

echo "🚀 Real Estate Platform - Production Deployment"
echo "================================================"
echo ""

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes!"
    read -p "Do you want to commit them now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        echo "❌ Please commit or stash your changes first"
        exit 1
    fi
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin develop
echo "✅ Code pushed to GitHub"
echo ""

# Deploy to server
echo "🌐 Connecting to server and deploying..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
    set -e

    echo "📁 Navigating to project directory..."
    cd ${PROJECT_DIR}

    echo "🔄 Pulling latest code..."
    # Handle git conflicts
    git fetch origin

    # Check if we have local changes
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  Server has uncommitted changes, stashing them..."
        git stash save "Auto-stash before deployment \$(date +%Y%m%d-%H%M%S)"
    fi

    # Pull latest code
    git checkout develop
    git pull origin develop

    echo "🔨 Running complete setup..."
    chmod +x SERVER_COMPLETE_SETUP.sh
    ./SERVER_COMPLETE_SETUP.sh
ENDSSH

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your applications should be available at:"
echo "   - API:        http://${SERVER_IP}:3000"
echo "   - Admin Web:  http://${SERVER_IP}:3001"
echo "   - User Web:   http://${SERVER_IP}:3002"
echo ""
echo "📊 To check status, run: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "📝 To view logs, run: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs'"
