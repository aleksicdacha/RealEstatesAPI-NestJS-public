# Production Deployment - Docker Compose Commands

**Server:** 46.224.231.217  
**Mode:** Docker Compose (Production)  
**Date:** January 28, 2026

---

## 🚀 QUICK START (Run on Server)

```bash
cd ~/RealEstatesAPI-NestJS
chmod +x deploy-production.sh
./deploy-production.sh
```

This script does everything automatically. If it works, you're done!

---

## 📋 MANUAL COMMANDS (If Automatic Script Fails)

### 1. Navigate to Project
```bash
cd ~/RealEstatesAPI-NestJS
```

### 2. Pull Latest Code
```bash
git config pull.rebase false
git pull origin develop
```

### 3. Create/Edit Environment Files
```bash
# Create files
nano .env.production
nano apps/api/.env
nano apps/admin-web/.env.production
nano apps/user-web/.env.production
```

**Copy content from local files and update for production!**

### 4. Stop Old Services
```bash
# Stop PM2
pm2 stop all
pm2 delete all

# Stop Docker
docker compose -f docker-compose.prod.yml down
```

### 5. Install Dependencies
```bash
npm install
cd apps/api && npm install --production && cd ../..
cd apps/admin-web && npm install --production && cd ../..
cd apps/user-web && npm install --production && cd ../..
```

### 6. Build Shared Packages
```bash
cd packages/types
npm run build
cd ../..
```

### 7. Start PostgreSQL & Run Migrations
```bash
# Start PostgreSQL only
docker compose -f docker-compose.prod.yml up -d postgres

# Wait for it to be ready
sleep 15

# Run migrations
cd apps/api
npm run migration:run
cd ../..
```

### 8. Start All Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 9. Check Status
```bash
# View containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1
```

---

## 🔧 TROUBLESHOOTING

### Migration Error: "Cannot find module @src/..."

**Fix the TypeScript paths issue:**
```bash
cd apps/api

# The issue is tsconfig.json paths aren't working
# Just build first, then migrate
npm run build
npm run migration:run

cd ../..
```

### Database Password Authentication Failed

**Check and fix .env files:**
```bash
# Check current .env
cat apps/api/.env | grep DB_PASSWORD

# Edit if wrong
nano apps/api/.env
# Update: DB_PASSWORD=CHANGE_ME

# Also check root .env.production
nano .env.production
# Update: DB_PASSWORD=CHANGE_ME

# Restart PostgreSQL
docker compose -f docker-compose.prod.yml restart postgres
sleep 10

# Try migration again
cd apps/api
npm run migration:run
cd ../..
```

### Docker Compose Command Not Found

**Use Docker Compose V2:**
```bash
# NOT: docker-compose (v1 - old)
# USE: docker compose (v2 - new)

docker compose -f docker-compose.prod.yml up -d
```

### Port Already in Use

**Find and kill process:**
```bash
# Find what's using port 3000, 3001, 3002
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3002

# Kill PM2
pm2 stop all
pm2 delete all

# Or kill specific process
sudo kill -9 <PID>
```

---

## 📊 MONITORING

### View Logs
```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f admin-web
docker compose -f docker-compose.prod.yml logs -f user-web
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Check DDoS Prevention
```bash
# Should return 0 or very low number (1-2)
sudo netstat -an | grep "92.118.207.21" | wc -l

# Monitor in real-time
watch -n 5 'sudo netstat -an | grep 92.118.207.21 | wc -l'
```

### Container Status
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 🔄 MANAGEMENT COMMANDS

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart admin-web
docker compose -f docker-compose.prod.yml restart user-web
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Rebuild and Restart
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### View Service Health
```bash
docker compose -f docker-compose.prod.yml ps
docker stats
```

---

## 🌐 SERVICE URLs

- **API:** http://46.224.231.217:3000
- **Admin Panel:** http://46.224.231.217:3001
- **User Website:** http://46.224.231.217:3002

---

## ⚠️ IMPORTANT NOTES

1. **Always use `docker-compose.prod.yml` in production**
2. **Never use `docker-compose.yml` (that's for local development)**
3. **Database password must match in all .env files**
4. **JWT secrets must be at least 32 characters**
5. **CORS must include frontend URLs**

---

## 🆘 EMERGENCY ROLLBACK

```bash
# Find backup branch
git branch | grep backup

# Checkout
git checkout backup-before-deployment-20260128

# Redeploy
./deploy-production.sh
```

---

## 📝 COMPLETE COMMAND SEQUENCE

Here's the exact sequence that should work:

```bash
# 1. Navigate
cd ~/RealEstatesAPI-NestJS

# 2. Backup
git stash save "backup-$(date +%Y%m%d)"
git branch backup-$(date +%Y%m%d)

# 3. Pull
git config pull.rebase false
git pull origin develop

# 4. Stop old services
pm2 stop all || true
pm2 delete all || true
docker compose -f docker-compose.prod.yml down || true

# 5. Install
npm install
cd apps/api && npm install --production && cd ../..
cd apps/admin-web && npm install --production && cd ../..
cd apps/user-web && npm install --production && cd ../..

# 6. Build packages
cd packages/types && npm run build && cd ../..

# 7. Start PostgreSQL
docker compose -f docker-compose.prod.yml up -d postgres
sleep 15

# 8. Run migrations
cd apps/api
npm run build
npm run migration:run
cd ../..

# 9. Start all services
docker compose -f docker-compose.prod.yml up -d

# 10. Wait
sleep 30

# 11. Check
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50

# 12. Test
curl http://localhost:3000/v1/properties/public?page=1&limit=1
curl http://localhost:3001
curl http://localhost:3002

# 13. Monitor DDoS
sudo netstat -an | grep "92.118.207.21" | wc -l
```

---

**Last Updated:** January 28, 2026
