# 🧹 Clean Start Guide - Reset Hetzner Server

## ⚠️ **CRITICAL WARNING**

This guide will **DELETE ALL PROJECT FILES** from your Hetzner server and reset it to a clean state.

**What will be REMOVED:**
- ✅ Project files in `/root/RealEstatesAPI-NestJS`
- ✅ Docker containers and volumes
- ✅ PostgreSQL databases
- ✅ Uploaded files
- ✅ PM2 processes
- ✅ Node modules and build files
- ✅ Nginx site configurations (optional)
- ✅ SSL certificates (optional)

**What will be PRESERVED:**
- ✅ Ubuntu system files
- ✅ Installed packages (Docker, Node.js, Nginx, etc.)
- ✅ System users and SSH keys
- ✅ Firewall rules

---

## 🎯 Choose Your Clean-Up Level

### Option 1: **Quick Clean** (Recommended for Fresh Deployment)
- Remove project files only
- Keep Docker, Node.js, Nginx installed
- **Time:** 2 minutes
- **Use when:** You want to redeploy the same project

### Option 2: **Deep Clean** (Complete Reset)
- Remove everything including Docker data
- Remove all installed packages
- Reset to bare Ubuntu system
- **Time:** 5 minutes
- **Use when:** Starting a completely different project

### Option 3: **Nuclear Clean** (Rebuild Server)
- Delete the server and create a new one
- **Time:** 10 minutes
- **Use when:** You want absolutely fresh start

---

## 🚀 Quick Clean (Recommended)

### Step 1: SSH into Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Download the Clean-Up Script

```bash
# If you have the repo, use the script directly
cd /root/RealEstatesAPI-NestJS
bash scripts/clean-server-quick.sh
```

**OR manually execute:**

```bash
#!/bin/bash

echo "🧹 Quick Server Clean-Up"
echo "========================"
echo ""
echo "⚠️  This will remove project files, Docker containers, and databases."
echo ""
read -p "Are you sure you want to continue? (yes/NO): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted."
    exit 0
fi

echo ""
echo "🛑 Step 1: Stopping all services..."

# Stop PM2 processes
if command -v pm2 &> /dev/null; then
    pm2 kill
    echo "✅ PM2 processes stopped"
fi

# Stop Docker containers
if command -v docker &> /dev/null; then
    docker compose down -v 2>/dev/null || true
    cd /root/RealEstatesAPI-NestJS 2>/dev/null && docker compose down -v 2>/dev/null || true
    echo "✅ Docker containers stopped"
fi

# Stop Nginx (but keep it installed)
systemctl stop nginx 2>/dev/null || true
echo "✅ Nginx stopped"

# Stop Filebrowser if installed
systemctl stop filebrowser 2>/dev/null || true
echo "✅ Filebrowser stopped"

echo ""
echo "🗑️  Step 2: Removing project files..."

# Remove project directory
if [ -d "/root/RealEstatesAPI-NestJS" ]; then
    rm -rf /root/RealEstatesAPI-NestJS
    echo "✅ Project directory removed"
fi

# Remove PM2 data
if [ -d "/root/.pm2" ]; then
    rm -rf /root/.pm2
    echo "✅ PM2 data removed"
fi

echo ""
echo "🐳 Step 3: Cleaning Docker data..."

if command -v docker &> /dev/null; then
    # Stop all containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove all containers
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove all volumes
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    # Remove all images (optional - comment out to keep cached images)
    # docker rmi $(docker images -q) 2>/dev/null || true
    
    # Clean build cache
    docker system prune -af --volumes
    
    echo "✅ Docker data cleaned"
fi

echo ""
echo "📁 Step 4: Removing uploaded files..."

# Remove uploads directory if exists elsewhere
rm -rf /var/www/uploads 2>/dev/null || true
rm -rf /uploads 2>/dev/null || true
echo "✅ Upload directories removed"

echo ""
echo "🌐 Step 5: Removing Nginx site configurations..."

# Remove site configurations (keep Nginx installed)
rm -f /etc/nginx/sites-available/realestates* 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/realestates* 2>/dev/null || true

# Reset to default config
if [ ! -f /etc/nginx/sites-enabled/default ]; then
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true
fi

echo "✅ Nginx configurations removed"

echo ""
echo "🔐 Step 6: Removing SSL certificates (optional)..."

read -p "Remove Let's Encrypt SSL certificates? (y/N): " REMOVE_SSL
if [[ $REMOVE_SSL =~ ^[Yy]$ ]]; then
    rm -rf /etc/letsencrypt/live/* 2>/dev/null || true
    rm -rf /etc/letsencrypt/archive/* 2>/dev/null || true
    rm -rf /etc/letsencrypt/renewal/* 2>/dev/null || true
    echo "✅ SSL certificates removed"
else
    echo "⏭️  SSL certificates preserved"
fi

echo ""
echo "🧹 Step 7: Cleaning package managers..."

# Clean npm cache
if command -v npm &> /dev/null; then
    npm cache clean --force
    echo "✅ npm cache cleaned"
fi

# Clean apt cache
apt-get clean
apt-get autoclean
echo "✅ apt cache cleaned"

echo ""
echo "📊 Step 8: Checking disk space..."

df -h /

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Quick Clean Complete! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 What's still installed:"
echo "   - Docker & Docker Compose"
echo "   - Node.js & npm"
echo "   - Nginx"
echo "   - Git"
echo "   - All system packages"
echo ""
echo "🚀 Ready for fresh deployment!"
echo ""
echo "Next steps:"
echo "   1. Clone your repository: git clone ..."
echo "   2. Follow deployment guide: documentation/HETZNER_DEPLOYMENT_GUIDE.md"
echo ""
```

---

## 🔥 Deep Clean (Complete Reset)

### Warning: This removes ALL installed packages

```bash
#!/bin/bash

echo "🔥 Deep Server Clean-Up"
echo "======================="
echo ""
echo "⚠️⚠️⚠️  THIS WILL REMOVE EVERYTHING!"
echo "   - All project files"
echo "   - Docker + containers + images"
echo "   - Node.js + npm"
echo "   - Nginx"
echo "   - PostgreSQL"
echo "   - All databases"
echo ""
read -p "Type 'DELETE EVERYTHING' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE EVERYTHING" ]; then
    echo "❌ Aborted."
    exit 0
fi

echo ""
echo "🛑 Step 1: Stopping all services..."

# Stop everything
systemctl stop nginx 2>/dev/null || true
systemctl stop postgresql 2>/dev/null || true
systemctl stop redis 2>/dev/null || true
systemctl stop filebrowser 2>/dev/null || true
pm2 kill 2>/dev/null || true
docker compose down -v 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

echo ""
echo "🗑️  Step 2: Removing all project files..."

rm -rf /root/RealEstatesAPI-NestJS
rm -rf /root/.pm2
rm -rf /var/www/*
rm -rf /uploads

echo ""
echo "🐳 Step 3: Removing Docker completely..."

# Remove all Docker data
docker system prune -af --volumes 2>/dev/null || true

# Uninstall Docker
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
apt-get autoremove -y
rm -rf /var/lib/docker
rm -rf /etc/docker

echo ""
echo "📦 Step 4: Removing installed packages..."

# Remove Node.js
apt-get purge -y nodejs npm
rm -rf /usr/local/lib/node_modules
rm -rf /root/.npm

# Remove Nginx
apt-get purge -y nginx nginx-common
rm -rf /etc/nginx
rm -rf /var/log/nginx

# Remove PostgreSQL
apt-get purge -y postgresql postgresql-contrib
rm -rf /var/lib/postgresql
rm -rf /etc/postgresql

# Remove Redis
apt-get purge -y redis-server
rm -rf /var/lib/redis

# Clean up
apt-get autoremove -y
apt-get autoclean

echo ""
echo "🔐 Step 5: Removing SSL certificates..."

rm -rf /etc/letsencrypt

echo ""
echo "🧹 Step 6: Cleaning remaining files..."

# Remove service files
rm -f /etc/systemd/system/filebrowser.service
systemctl daemon-reload

# Clean caches
apt-get clean

echo ""
echo "📊 Disk space:"
df -h /

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deep Clean Complete! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Server is now at bare Ubuntu state"
echo ""
echo "Next steps:"
echo "   1. Update system: apt-get update && apt-get upgrade -y"
echo "   2. Follow full deployment guide from the beginning"
echo "   3. documentation/HETZNER_DEPLOYMENT_GUIDE.md"
echo ""
```

---

## ☢️ Nuclear Option (Rebuild Server)

### Fastest way to get absolutely fresh start:

1. **Go to Hetzner Cloud Console:**
   - https://console.hetzner.cloud

2. **Select your server**

3. **Click "Power" → "Rebuild"**
   - ⚠️ This will DELETE EVERYTHING on the server
   - Choose Ubuntu 24.04
   - Keep your SSH key selected

4. **Wait 2-3 minutes**

5. **Server is now completely fresh!**

**Pros:**
- ✅ Absolutely clean slate
- ✅ No leftover files or configs
- ✅ Fastest method

**Cons:**
- ❌ Deletes EVERYTHING (including system customizations)
- ❌ Need to reconfigure everything from scratch

---

## 📋 Pre-Clean Checklist

Before cleaning, make sure you have backups of:

- [ ] `.env` files (if you customized any values)
- [ ] Database backups (if you need the data)
- [ ] Uploaded images/files (if important)
- [ ] Custom Nginx configurations (if any)
- [ ] SSL certificates (if self-signed or custom)
- [ ] Any custom scripts or modifications

**Download backups:**
```bash
# Backup database
docker exec postgres pg_dump -U postgres estates > backup-$(date +%Y%m%d).sql

# Backup .env files
tar -czf env-backup.tar.gz apps/api/.env apps/admin-web/.env apps/user-web/.env

# Backup uploads
tar -czf uploads-backup.tar.gz uploads/

# Download to local machine (run on local machine)
scp root@YOUR_SERVER_IP:~/backup-*.sql .
scp root@YOUR_SERVER_IP:~/env-backup.tar.gz .
scp root@YOUR_SERVER_IP:~/uploads-backup.tar.gz .
```

---

## 🚀 After Clean-Up: Fresh Deployment

Once cleaned, follow this order:

1. **Update system:**
   ```bash
   apt-get update && apt-get upgrade -y
   ```

2. **Clone repository:**
   ```bash
   cd /root
   git clone https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git
   cd RealEstatesAPI-NestJS
   ```

3. **Follow deployment guide:**
   ```bash
   # See: documentation/HETZNER_DEPLOYMENT_GUIDE.md
   # Or: documentation/PRODUCTION_QUICK_START.md
   ```

---

## 🆘 Recovery (If Something Goes Wrong)

### Restore from Hetzner Backup

If you enabled backups in Hetzner:

1. Go to Hetzner Console
2. Click your server
3. Go to "Backups" tab
4. Click "Restore from backup"
5. Select the backup date
6. Wait 5-10 minutes

### Manual File Recovery

If you have backups:

```bash
# Restore database
cat backup-20260127.sql | docker exec -i postgres psql -U postgres estates

# Restore uploads
tar -xzf uploads-backup.tar.gz -C /root/RealEstatesAPI-NestJS/

# Restore .env files
tar -xzf env-backup.tar.gz
```

---

## 📊 Comparison: Clean Methods

| Method | Time | Removes | Keeps | Best For |
|--------|------|---------|-------|----------|
| **Quick Clean** | 2 min | Project files, Docker data | Installed packages | Redeploying same project |
| **Deep Clean** | 5 min | Everything except OS | Ubuntu system only | Different project |
| **Nuclear (Rebuild)** | 10 min | EVERYTHING | Nothing | Absolute fresh start |

---

## ⚡ Quick Commands Reference

```bash
# Check what's running
docker ps
pm2 list
systemctl status nginx
systemctl status postgresql

# Check disk usage
df -h
du -sh /root/*
docker system df

# List installed packages
dpkg -l | grep -E 'docker|nginx|postgresql|node'

# Check for project files
ls -la /root/
ls -la /var/www/
```

---

## 📚 Related Documentation

- **Fresh Deployment:** `documentation/HETZNER_DEPLOYMENT_GUIDE.md`
- **Quick Start:** `documentation/PRODUCTION_QUICK_START.md`
- **Server Setup:** `HETZNER_SETUP_CHECKLIST.md`

---

**⚠️ Remember: Always backup important data before cleaning!**
