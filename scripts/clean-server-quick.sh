#!/bin/bash

# 🧹 Quick Server Clean-Up Script
# Removes project files and Docker data while keeping installed packages

set -e  # Exit on error

echo "🧹 Quick Server Clean-Up"
echo "========================"
echo ""
echo "This script will remove:"
echo "  ❌ Project files in /root/RealEstatesAPI-NestJS"
echo "  ❌ Docker containers and volumes"
echo "  ❌ PostgreSQL databases"
echo "  ❌ PM2 processes and data"
echo "  ❌ Uploaded files"
echo ""
echo "This script will KEEP:"
echo "  ✅ Docker (installed)"
echo "  ✅ Node.js & npm (installed)"
echo "  ✅ Nginx (installed)"
echo "  ✅ System packages"
echo "  ✅ SSH keys"
echo ""
read -p "Are you sure you want to continue? Type 'yes' to confirm: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted. No changes made."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 Step 1/8: Stopping all running services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stop PM2 processes
if command -v pm2 &> /dev/null; then
    echo "Stopping PM2 processes..."
    pm2 kill 2>/dev/null || true
    echo "✅ PM2 processes stopped"
else
    echo "⏭️  PM2 not installed"
fi

# Stop Docker containers
if command -v docker &> /dev/null; then
    echo "Stopping Docker containers..."
    cd /root/RealEstatesAPI-NestJS 2>/dev/null && docker compose down -v 2>/dev/null || true
    docker stop $(docker ps -aq) 2>/dev/null || true
    echo "✅ Docker containers stopped"
else
    echo "⏭️  Docker not installed"
fi

# Stop Nginx (but keep it installed)
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "Stopping Nginx..."
    systemctl stop nginx 2>/dev/null || true
    echo "✅ Nginx stopped"
else
    echo "⏭️  Nginx not running"
fi

# Stop Filebrowser if installed
if systemctl is-active --quiet filebrowser 2>/dev/null; then
    echo "Stopping Filebrowser..."
    systemctl stop filebrowser 2>/dev/null || true
    systemctl disable filebrowser 2>/dev/null || true
    echo "✅ Filebrowser stopped"
else
    echo "⏭️  Filebrowser not running"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 2/8: Removing project files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove project directory
if [ -d "/root/RealEstatesAPI-NestJS" ]; then
    echo "Removing /root/RealEstatesAPI-NestJS..."
    rm -rf /root/RealEstatesAPI-NestJS
    echo "✅ Project directory removed"
else
    echo "⏭️  Project directory not found"
fi

# Remove PM2 data
if [ -d "/root/.pm2" ]; then
    echo "Removing PM2 data..."
    rm -rf /root/.pm2
    echo "✅ PM2 data removed"
else
    echo "⏭️  PM2 data not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Step 3/8: Cleaning Docker data..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker &> /dev/null; then
    echo "Removing all containers..."
    docker rm -f $(docker ps -aq) 2>/dev/null || true

    echo "Removing all volumes..."
    docker volume rm $(docker volume ls -q) 2>/dev/null || true

    echo "Cleaning Docker system..."
    docker system prune -af --volumes

    echo "✅ Docker data cleaned"

    # Show remaining Docker resources
    echo ""
    echo "Remaining Docker resources:"
    docker system df
else
    echo "⏭️  Docker not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Step 4/8: Removing uploaded files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove common upload directories
UPLOAD_DIRS="/var/www/uploads /uploads /var/www/html/uploads"

for DIR in $UPLOAD_DIRS; do
    if [ -d "$DIR" ]; then
        echo "Removing $DIR..."
        rm -rf "$DIR"
        echo "✅ $DIR removed"
    fi
done

echo "✅ Upload directories cleaned"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Step 5/8: Cleaning Nginx configurations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove site configurations (keep Nginx installed)
if [ -d "/etc/nginx" ]; then
    echo "Removing custom Nginx configurations..."
    rm -f /etc/nginx/sites-available/realestates* 2>/dev/null || true
    rm -f /etc/nginx/sites-enabled/realestates* 2>/dev/null || true

    # Reset to default config
    if [ ! -f /etc/nginx/sites-enabled/default ] && [ -f /etc/nginx/sites-available/default ]; then
        ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
        echo "✅ Nginx reset to default configuration"
    fi

    echo "✅ Nginx configurations cleaned"
else
    echo "⏭️  Nginx not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Step 6/8: Handling SSL certificates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "/etc/letsencrypt/live" ] && [ "$(ls -A /etc/letsencrypt/live)" ]; then
    echo ""
    echo "⚠️  Let's Encrypt SSL certificates found."
    read -p "Do you want to remove them? (y/N): " REMOVE_SSL

    if [[ $REMOVE_SSL =~ ^[Yy]$ ]]; then
        echo "Removing SSL certificates..."
        rm -rf /etc/letsencrypt/live/* 2>/dev/null || true
        rm -rf /etc/letsencrypt/archive/* 2>/dev/null || true
        rm -rf /etc/letsencrypt/renewal/* 2>/dev/null || true
        echo "✅ SSL certificates removed"
    else
        echo "✅ SSL certificates preserved"
    fi
else
    echo "⏭️  No SSL certificates found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 7/8: Removing Filebrowser..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove Filebrowser service file
if [ -f "/etc/systemd/system/filebrowser.service" ]; then
    rm -f /etc/systemd/system/filebrowser.service
    echo "✅ Filebrowser service removed"
fi

# Remove Filebrowser config
if [ -d "/etc/filebrowser" ]; then
    rm -rf /etc/filebrowser
    echo "✅ Filebrowser config removed"
fi

# Remove Filebrowser binary
if command -v filebrowser &> /dev/null; then
    rm -f $(which filebrowser) 2>/dev/null || true
    echo "✅ Filebrowser binary removed"
fi

systemctl daemon-reload 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Step 8/8: Cleaning package managers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clean npm cache
if command -v npm &> /dev/null; then
    echo "Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true
    echo "✅ npm cache cleaned"
fi

# Clean apt cache
echo "Cleaning apt cache..."
apt-get clean
apt-get autoclean
apt-get autoremove -y
echo "✅ apt cache cleaned"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Disk Space Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
df -h /
echo ""

# Show what's still installed
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Quick Clean Complete! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 What's still installed and ready to use:"
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    echo "   ✅ Docker: $(docker --version)"
else
    echo "   ❌ Docker: Not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "   ✅ Node.js: $(node --version)"
else
    echo "   ❌ Node.js: Not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "   ✅ npm: $(npm --version)"
else
    echo "   ❌ npm: Not installed"
fi

# Check Nginx
if command -v nginx &> /dev/null; then
    echo "   ✅ Nginx: $(nginx -v 2>&1 | grep -oP 'nginx/\K[0-9.]+')"
else
    echo "   ❌ Nginx: Not installed"
fi

# Check Git
if command -v git &> /dev/null; then
    echo "   ✅ Git: $(git --version | awk '{print $3}')"
else
    echo "   ❌ Git: Not installed"
fi

# Check PM2
if command -v pm2 &> /dev/null; then
    echo "   ✅ PM2: Installed"
else
    echo "   ❌ PM2: Not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Ready for Fresh Deployment!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo ""
echo "   1. Clone your repository:"
echo "      cd /root"
echo "      git clone https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git"
echo ""
echo "   2. Follow deployment guide:"
echo "      cd RealEstatesAPI-NestJS"
echo "      cat documentation/PRODUCTION_QUICK_START.md"
echo ""
echo "   3. Or use the deployment script:"
echo "      bash local-deployment/quick-setup.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
