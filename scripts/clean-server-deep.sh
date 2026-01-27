#!/bin/bash

# 🔥 Deep Server Clean-Up Script
# Removes EVERYTHING except the base Ubuntu system

set -e  # Exit on error

echo "🔥 Deep Server Clean-Up (Complete Reset)"
echo "========================================"
echo ""
echo "⚠️⚠️⚠️  CRITICAL WARNING ⚠️⚠️⚠️"
echo ""
echo "This script will COMPLETELY REMOVE:"
echo "  ❌ All project files"
echo "  ❌ Docker + all containers + all images"
echo "  ❌ Node.js + npm + all global packages"
echo "  ❌ Nginx + all configurations"
echo "  ❌ PostgreSQL + all databases"
echo "  ❌ Redis"
echo "  ❌ PM2"
echo "  ❌ All SSL certificates"
echo "  ❌ All uploaded files"
echo "  ❌ Custom services"
echo ""
echo "This will KEEP:"
echo "  ✅ Ubuntu operating system"
echo "  ✅ SSH access and keys"
echo "  ✅ User accounts"
echo "  ✅ Firewall rules"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Type 'DELETE EVERYTHING' to confirm (case-sensitive): " CONFIRM

if [ "$CONFIRM" != "DELETE EVERYTHING" ]; then
    echo ""
    echo "❌ Aborted. No changes made."
    echo "   (You must type exactly: DELETE EVERYTHING)"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ Starting in 5 seconds... Press Ctrl+C to cancel!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 Step 1/10: Stopping all services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stop all services
systemctl stop nginx 2>/dev/null || true
systemctl stop postgresql 2>/dev/null || true
systemctl stop redis 2>/dev/null || true
systemctl stop filebrowser 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Stop Docker containers
if command -v docker &> /dev/null; then
    docker compose down -v 2>/dev/null || true
    docker stop $(docker ps -aq) 2>/dev/null || true
fi

echo "✅ All services stopped"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 2/10: Removing all project files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf /root/RealEstatesAPI-NestJS 2>/dev/null || true
rm -rf /root/.pm2 2>/dev/null || true
rm -rf /var/www/* 2>/dev/null || true
rm -rf /uploads 2>/dev/null || true
rm -rf /var/www/uploads 2>/dev/null || true

echo "✅ Project files removed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Step 3/10: Removing Docker completely..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker &> /dev/null; then
    # Remove all Docker resources
    docker system prune -af --volumes 2>/dev/null || true
    docker rm -f $(docker ps -aq) 2>/dev/null || true
    docker rmi -f $(docker images -q) 2>/dev/null || true
    docker volume rm $(docker volume ls -q) 2>/dev/null || true

    # Uninstall Docker
    echo "Uninstalling Docker packages..."
    apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 2>/dev/null || true
    apt-get purge -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Remove Docker directories
    rm -rf /var/lib/docker
    rm -rf /var/lib/containerd
    rm -rf /etc/docker
    rm -rf /var/run/docker.sock

    # Remove Docker repository
    rm -f /etc/apt/sources.list.d/docker.list
    rm -f /etc/apt/keyrings/docker.gpg

    echo "✅ Docker completely removed"
else
    echo "⏭️  Docker not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 4/10: Removing Node.js and npm..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v node &> /dev/null || command -v npm &> /dev/null; then
    # Remove PM2 globally
    npm uninstall -g pm2 2>/dev/null || true

    # Uninstall Node.js
    apt-get purge -y nodejs npm 2>/dev/null || true

    # Remove Node.js directories
    rm -rf /usr/local/lib/node_modules
    rm -rf /usr/local/bin/node
    rm -rf /usr/local/bin/npm
    rm -rf /usr/local/bin/npx
    rm -rf /root/.npm
    rm -rf /root/.node-gyp
    rm -rf /root/.config/yarn

    # Remove NodeSource repository
    rm -f /etc/apt/sources.list.d/nodesource.list

    echo "✅ Node.js and npm removed"
else
    echo "⏭️  Node.js not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Step 5/10: Removing Nginx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v nginx &> /dev/null; then
    # Uninstall Nginx
    apt-get purge -y nginx nginx-common nginx-core 2>/dev/null || true

    # Remove Nginx directories
    rm -rf /etc/nginx
    rm -rf /var/log/nginx
    rm -rf /var/lib/nginx

    echo "✅ Nginx removed"
else
    echo "⏭️  Nginx not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Step 6/10: Removing PostgreSQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v psql &> /dev/null; then
    # Uninstall PostgreSQL
    apt-get purge -y postgresql postgresql-contrib postgresql-* 2>/dev/null || true

    # Remove PostgreSQL directories
    rm -rf /var/lib/postgresql
    rm -rf /etc/postgresql
    rm -rf /var/log/postgresql

    # Remove PostgreSQL user
    deluser postgres 2>/dev/null || true

    echo "✅ PostgreSQL removed"
else
    echo "⏭️  PostgreSQL not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴 Step 7/10: Removing Redis..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v redis-server &> /dev/null; then
    # Uninstall Redis
    apt-get purge -y redis-server redis-tools 2>/dev/null || true

    # Remove Redis directories
    rm -rf /var/lib/redis
    rm -rf /etc/redis

    echo "✅ Redis removed"
else
    echo "⏭️  Redis not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Step 8/10: Removing SSL certificates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "/etc/letsencrypt" ]; then
    # Remove certbot and Let's Encrypt
    apt-get purge -y certbot python3-certbot-nginx 2>/dev/null || true
    rm -rf /etc/letsencrypt
    rm -rf /var/lib/letsencrypt
    echo "✅ SSL certificates removed"
else
    echo "⏭️  No SSL certificates found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 9/10: Removing custom services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove Filebrowser
rm -f /etc/systemd/system/filebrowser.service
rm -rf /etc/filebrowser
rm -f /usr/local/bin/filebrowser

# Remove custom systemd services
rm -f /etc/systemd/system/realestates*

# Reload systemd
systemctl daemon-reload

echo "✅ Custom services removed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Step 10/10: Final cleanup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clean package manager
apt-get autoremove -y
apt-get autoclean
apt-get clean

# Update package list
apt-get update

echo "✅ Final cleanup complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Final Disk Space"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
df -h /
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deep Clean Complete! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Server Status: Bare Ubuntu System"
echo ""
echo "📦 Remaining packages:"
apt list --installed 2>/dev/null | wc -l
echo "   system packages installed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Next Steps: Fresh Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   1. Update system packages:"
echo "      apt-get update && apt-get upgrade -y"
echo ""
echo "   2. Follow the complete deployment guide:"
echo "      - Clone repository"
echo "      - Install Docker"
echo "      - Install Node.js"
echo "      - Install Nginx"
echo "      - Deploy application"
echo ""
echo "   3. See: documentation/HETZNER_DEPLOYMENT_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Your server is now in a clean state."
echo "    All application data has been removed."
echo ""
