# Server Deployment Guide

## 🚀 Quick Start Commands

### Start Everything on Server
```bash
cd ~/RealEstatesAPI-NestJS
./SERVER_COMPLETE_SETUP.sh
```

### Manual Start (If Script Fails)
```bash
cd ~/RealEstatesAPI-NestJS

# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Install dependencies
npm install

# 3. Build shared packages
cd packages/types && npm run build && cd ../..

# 4. Build all apps
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..

# 5. Create log directories
mkdir -p apps/api/logs
mkdir -p apps/admin-web/logs
mkdir -p apps/user-web/logs

# 6. Stop old PM2 processes
pm2 stop all || true
pm2 delete all || true

# 7. Start PM2 processes
pm2 start ecosystem.config.js

# 8. Save PM2 configuration
pm2 save
```

### PM2 Commands
```bash
# View status of all processes
pm2 status

# View logs
pm2 logs                    # All logs
pm2 logs realestates-api    # API only
pm2 logs realestates-admin  # Admin only
pm2 logs realestates-user   # User only

# Restart services
pm2 restart all
pm2 restart realestates-api

# Stop services
pm2 stop all
pm2 stop realestates-api

# Delete all processes (clean slate)
pm2 delete all

# Monitor processes
pm2 monit
```

## 🔧 Fix CORS WebSocket Error

The CORS error you're seeing is related to Socket.IO configuration in the API.

### Fix in apps/api/src/main.ts
```typescript
// Ensure CORS is properly configured
app.enableCors({
  origin: [
    'http://46.224.231.217:3001',
    'http://46.224.231.217:3002',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
});
```

### Fix in apps/api/src/entities/agent-chat/agent-chat.gateway.ts
Check that the gateway has proper CORS configuration:
```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'http://46.224.231.217:3001',
      'http://46.224.231.217:3002',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  },
})
```

After making changes:
```bash
cd ~/RealEstatesAPI-NestJS
cd apps/api && npm run build && cd ../..
pm2 restart realestates-api
pm2 logs realestates-api
```

## 🔄 Git Branch Issues (Server vs Local)

### Problem: Server has direct changes, can't pull from local

#### Option 1: Stash Server Changes (Keep them)
```bash
# On server
cd ~/RealEstatesAPI-NestJS
git stash save "Server changes before sync"
git pull origin develop
git stash pop  # Reapply your server changes
# Resolve any conflicts manually
```

#### Option 2: Commit Server Changes
```bash
# On server
cd ~/RealEstatesAPI-NestJS
git add .
git commit -m "Server-side changes"
git pull origin develop --rebase
# Resolve any conflicts
git push origin develop
```

#### Option 3: Reset Server to Match Remote (LOSE server changes)
```bash
# On server - WARNING: This discards all local changes
cd ~/RealEstatesAPI-NestJS
git fetch origin
git reset --hard origin/develop
```

#### Option 4: Create New Branch from Server Changes
```bash
# On server
cd ~/RealEstatesAPI-NestJS
git checkout -b server-hotfix
git add .
git commit -m "Server hotfixes"
git push origin server-hotfix

# Then reset develop to remote
git checkout develop
git reset --hard origin/develop
```

### Best Practice: Never Edit Directly on Server
Always:
1. Make changes on local machine
2. Commit to git
3. Push to GitHub
4. Pull on server
5. Rebuild and restart

## 📋 Environment Files Checklist

### apps/api/.env
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=estates

# JWT
JWT_SECRET=your_min_32_chars_secret_key_here

# Server
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

# Optional
GEMINI_API_KEY=your_gemini_key_here
```

### apps/admin-web/.env.production
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=production
PORT=3001
```

### apps/user-web/.env.production
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=production
PORT=3002
```

## 🐳 Docker Commands

### Docker Compose V2 (New Syntax)
All scripts have been updated to use `docker compose` instead of `docker-compose`.

```bash
# Start services
docker compose up -d
docker compose up -d postgres  # Only PostgreSQL

# Stop services
docker compose down
docker compose down -v  # Also remove volumes

# View logs
docker compose logs
docker compose logs -f postgres  # Follow PostgreSQL logs

# Check status
docker ps

# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d estates
```

## 🧪 Database Commands

```bash
cd ~/RealEstatesAPI-NestJS/apps/api

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- src/migrations/YourMigrationName

# Seed users
npm run seed:users
```

## 🌐 Access URLs

- **API**: http://46.224.231.217:3000
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

## 🔍 Troubleshooting

### PM2 Shows "No process found"
```bash
cd ~/RealEstatesAPI-NestJS
pm2 start ecosystem.config.js
pm2 save
```

### Build Failed - dist/main.js not found
```bash
cd ~/RealEstatesAPI-NestJS/apps/api
npm install
npm run build
ls -la dist/  # Verify dist/main.js exists
```

### PostgreSQL Not Running
```bash
docker compose up -d postgres
docker ps  # Verify it's running
docker compose logs postgres  # Check for errors
```

### Port Already in Use
```bash
# Find what's using the port
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002

# Kill the process
sudo kill -9 <PID>

# Or restart PM2
pm2 delete all
pm2 start ecosystem.config.js
```

### WebSocket/CORS Errors
1. Check environment files have correct URLs
2. Verify CORS configuration in `apps/api/src/main.ts`
3. Verify WebSocket gateway CORS in `apps/api/src/entities/agent-chat/agent-chat.gateway.ts`
4. Rebuild API and restart:
   ```bash
   cd apps/api && npm run build && cd ../..
   pm2 restart realestates-api
   ```

## 📝 Deployment Workflow

### Full Deployment (First Time or Major Changes)
```bash
cd ~/RealEstatesAPI-NestJS
./SERVER_COMPLETE_SETUP.sh
```

### Quick Update (Code Changes Only)
```bash
cd ~/RealEstatesAPI-NestJS
git pull origin develop
npm install
cd apps/api && npm run build && cd ../..
pm2 restart realestates-api
```

### Frontend Only Update
```bash
cd ~/RealEstatesAPI-NestJS
git pull origin develop
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..
pm2 restart realestates-admin
pm2 restart realestates-user
```

## 🔒 Security Checklist

- [ ] Environment files have strong passwords
- [ ] JWT_SECRET is at least 32 characters
- [ ] CORS_ORIGIN only includes your domains
- [ ] Database password is strong
- [ ] Firewall rules configured (ports 3000-3002, 5432)
- [ ] PM2 startup configured for auto-restart on reboot

### Setup PM2 Auto-Start on Server Reboot
```bash
pm2 startup
# Run the command it shows you (starts with sudo)
pm2 save
```

## 📊 Monitoring

### Check Application Health
```bash
# API Health
curl http://localhost:3000/health

# Check all services
pm2 status

# Monitor in real-time
pm2 monit

# View resource usage
pm2 list
```

### View Logs
```bash
# Real-time logs
pm2 logs

# Specific service
pm2 logs realestates-api

# Last 100 lines
pm2 logs --lines 100

# Log files location
ls -lah ~/RealEstatesAPI-NestJS/apps/api/logs/
ls -lah ~/RealEstatesAPI-NestJS/apps/admin-web/logs/
ls -lah ~/RealEstatesAPI-NestJS/apps/user-web/logs/
```

## 🆘 Emergency Recovery

### Complete Reset (Nuclear Option)
```bash
# Stop everything
pm2 delete all
docker compose down -v

# Clean builds
cd ~/RealEstatesAPI-NestJS
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf apps/*/.next
rm -rf apps/api/dist
rm -rf packages/*/node_modules
rm -rf packages/*/dist

# Fresh start
git reset --hard origin/develop
git pull origin develop
./SERVER_COMPLETE_SETUP.sh
```

### Restore Database from Backup
```bash
# Stop API
pm2 stop realestates-api

# Drop and recreate database
docker compose exec postgres psql -U postgres -c "DROP DATABASE estates;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE estates;"

# Restore backup
docker compose exec -T postgres psql -U postgres -d estates < backup.sql

# Restart API
pm2 restart realestates-api
```
