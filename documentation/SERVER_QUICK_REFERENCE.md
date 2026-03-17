# 🚀 Server Quick Commands Reference

**Server:** 46.224.231.217
**User:** root
**Project Path:** `~/RealEstatesAPI-NestJS`

---

## 🔐 SSH Connection

```bash
# From your local machine
ssh root@46.224.231.217
```

---

## 📁 Navigate to Project

```bash
cd ~/RealEstatesAPI-NestJS
```

---

## 🚀 Deployment & Startup Commands

### Option 1: Automated Deployment (RECOMMENDED)

```bash
# Full deployment with git pull, build, and restart
cd ~/RealEstatesAPI-NestJS
chmod +x scripts/server-deploy.sh
./scripts/server-deploy.sh

# Force deployment (overwrites server changes with remote)
./scripts/server-deploy.sh --force
```

### Option 2: Manual PM2 Commands

```bash
# Navigate to project
cd ~/RealEstatesAPI-NestJS

# Start all applications using ecosystem config
pm2 start ecosystem.config.js

# OR start individually
cd apps/api && pm2 start dist/main.js --name "realestates-api" --env production
cd ../admin-web && pm2 start npm --name "realestates-admin" -- start
cd ../user-web && pm2 start npm --name "realestates-user" -- start

# Save PM2 configuration
pm2 save

# Configure PM2 to start on server reboot
pm2 startup
# Then run the command it outputs
```

---

## 🔄 PM2 Management Commands

### Status & Monitoring

```bash
pm2 status                    # View all processes
pm2 list                      # Alternative to status
pm2 monit                     # Live monitoring dashboard
pm2 show realestates-api      # Detailed info for specific app
```

### Logs

```bash
pm2 logs                      # View all logs (live)
pm2 logs realestates-api      # View API logs only
pm2 logs --lines 50           # Show last 50 lines
pm2 logs --lines 100 --nostream  # Show 100 lines and exit
pm2 flush                     # Clear all logs
```

### Restart/Reload

```bash
pm2 restart all               # Restart all apps
pm2 restart realestates-api   # Restart specific app
pm2 reload all                # Zero-downtime reload
pm2 reload realestates-api    # Zero-downtime reload specific app
```

### Stop/Start

```bash
pm2 stop all                  # Stop all apps
pm2 stop realestates-api      # Stop specific app
pm2 start all                 # Start all apps
pm2 start realestates-api     # Start specific app
pm2 delete all                # Remove all from PM2
pm2 delete realestates-api    # Remove specific app
```

---

## 🔧 Build Commands

### Build Everything

```bash
cd ~/RealEstatesAPI-NestJS

# Build shared packages
cd packages/types && npm run build && cd ../..

# Build all apps
npm run build

# OR build individually
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..
```

---

## 🗃️ Database Commands

### Docker Database Management

```bash
# Start database
docker compose up -d postgres

# Stop database
docker compose stop postgres

# View database logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Check database status
docker compose ps
```

### TypeORM Migrations

```bash
cd ~/RealEstatesAPI-NestJS/apps/api

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- src/migrations/MigrationName
```

---

## 🔍 Testing & Debugging

### Test API Endpoints

```bash
# Test public properties endpoint
curl http://localhost:3000/v1/properties/public

# Test with pretty JSON
curl http://localhost:3000/v1/properties/public | json_pp

# Test from external
curl http://46.224.231.217:3000/v1/properties/public

# Check API health
curl http://localhost:3000/v1
```

### Check Process Ports

```bash
# See what's running on port 3000, 3001, 3002
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :3002

# OR using lsof
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

### Check System Resources

```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU and process monitoring
htop

# Or basic top
top
```

---

## 🐛 Git Commands (Server)

### Check Status

```bash
cd ~/RealEstatesAPI-NestJS
git status
git branch
git log --oneline -5
```

### Handle Conflicts

```bash
# Stash local changes
git stash save "Server changes before pull $(date +%Y%m%d_%H%M%S)"

# View stashed changes
git stash list

# Pull latest
git pull origin develop

# Apply stashed changes (if needed)
git stash pop

# OR discard local changes completely (DESTRUCTIVE)
git reset --hard origin/develop
git clean -fd
```

### Update from Remote

```bash
# Fetch and pull
git fetch origin develop
git pull origin develop --rebase

# Force update (overwrites local changes)
git fetch origin develop
git reset --hard origin/develop
```

---

## 🌐 Application URLs

- **API:** http://46.224.231.217:3000/v1
- **Admin Web:** http://46.224.231.217:3001
- **User Web:** http://46.224.231.217:3002

### Swagger API Documentation

- **Swagger UI:** http://46.224.231.217:3000/api

---

## 🔥 Troubleshooting

### Issue: PM2 "Script not found: dist/main.js"

**Solution:**
```bash
cd ~/RealEstatesAPI-NestJS
cd packages/types && npm run build && cd ../..
cd apps/api && npm run build && cd ../..
pm2 restart realestates-api
```

### Issue: WebSocket/Socket.io CORS Errors

**Verify CORS configuration:**
```bash
# Check API environment
cat apps/api/.env | grep CORS_ORIGIN

# Should include:
# CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002
```

**Restart API:**
```bash
pm2 restart realestates-api
pm2 logs realestates-api --lines 30
```

### Issue: Port Already in Use

```bash
# Find process on port
lsof -i :3000

# Kill process
kill -9 <PID>

# OR let PM2 handle it
pm2 delete all
pm2 start ecosystem.config.js
```

### Issue: Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps

# Start PostgreSQL
docker compose up -d postgres

# Check logs
docker compose logs postgres --tail=50

# Verify .env file
cat apps/api/.env | grep DB_
```

### Issue: Build Failures

```bash
# Clean and rebuild
cd ~/RealEstatesAPI-NestJS

# Clean node modules (if necessary)
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install

# Rebuild shared packages first
cd packages/types && npm run build && cd ../..

# Then rebuild apps
npm run build
```

### Issue: Out of Memory

```bash
# Check memory
free -h

# Restart apps one by one
pm2 restart realestates-api
sleep 5
pm2 restart realestates-admin
sleep 5
pm2 restart realestates-user

# Increase Node.js memory (if needed)
export NODE_OPTIONS="--max-old-space-size=2048"
pm2 restart all
```

---

## 📦 Environment Files

### API Environment

```bash
# Edit API environment
nano ~/RealEstatesAPI-NestJS/apps/api/.env

# Required variables:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=estates_user
# DB_PASSWORD=<your_password>
# DB_NAME=estates_prod
# JWT_SECRET=<min_32_chars>
# NODE_ENV=production
# PORT=3000
# CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002
```

### Frontend Environment

```bash
# Admin Web
nano ~/RealEstatesAPI-NestJS/apps/admin-web/.env.local

# User Web
nano ~/RealEstatesAPI-NestJS/apps/user-web/.env.local

# Required:
# NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
```

---

## 🔄 Complete Restart Procedure

```bash
# 1. Stop everything
pm2 stop all

# 2. Stop database
docker compose stop postgres

# 3. Start database
docker compose up -d postgres
sleep 10

# 4. Start applications
pm2 start ecosystem.config.js

# 5. Verify
pm2 status
pm2 logs --lines 20

# 6. Test
curl http://localhost:3000/v1/properties/public
```

---

## 📊 Monitoring & Logs

### View Real-time Logs

```bash
# All applications
pm2 logs

# Specific application
pm2 logs realestates-api

# Error logs only
pm2 logs --err

# Last N lines
pm2 logs --lines 100
```

### System Monitoring

```bash
# PM2 monitoring dashboard
pm2 monit

# System resources
htop

# Docker logs
docker compose logs -f postgres
```

---

## 🎯 Quick Deploy Checklist

- [ ] SSH to server: `ssh root@46.224.231.217`
- [ ] Navigate: `cd ~/RealEstatesAPI-NestJS`
- [ ] Pull code: `git pull origin develop` or use deploy script
- [ ] Build: `npm run build`
- [ ] Restart: `pm2 restart all`
- [ ] Verify: `pm2 status` and `pm2 logs`
- [ ] Test: `curl http://localhost:3000/v1/properties/public`

---

## 🆘 Emergency Contact Commands

```bash
# Complete restart from scratch
pm2 delete all
docker compose down
docker compose up -d postgres
cd ~/RealEstatesAPI-NestJS
./scripts/server-deploy.sh --force

# Nuclear option (rebuilds everything)
cd ~/RealEstatesAPI-NestJS
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf apps/*/.next apps/*/dist packages/*/dist
npm install
cd packages/types && npm run build && cd ../..
npm run build
pm2 start ecosystem.config.js
```

---

**Last Updated:** January 2026
**Server IP:** 46.224.231.217
**Project:** Real Estate Platform - Monorepo
