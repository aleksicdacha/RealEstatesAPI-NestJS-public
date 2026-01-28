# Server Commands Reference

## Deployment Scripts

### Complete Server Fix and Deployment
```bash
cd ~/RealEstatesAPI-NestJS
chmod +x SERVER_FIX_AND_DEPLOY.sh
./SERVER_FIX_AND_DEPLOY.sh
```
This script handles:
- Git divergence resolution
- Dependency installation
- Building all apps
- Starting Docker + PM2 services
- Verification checks

### DDoS Fix Deployment (After Git is Fixed)
```bash
chmod +x deploy-ddos-fix.sh
./deploy-ddos-fix.sh
```

## Manual Start Commands (After Build)

### Start Docker Services
```bash
docker compose up -d
# OR
docker-compose up -d

# Check status
docker compose ps
docker compose logs -f
```

### Start PM2 Services

**Start all services:**
```bash
cd ~/RealEstatesAPI-NestJS

# API
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production

# Admin-web
cd ../admin-web
pm2 start npm --name "realestates-admin" -- start

# User-web
cd ../user-web
pm2 start npm --name "realestates-user" -- start

cd ../..
pm2 save
```

**PM2 Management:**
```bash
pm2 status              # Show all processes
pm2 logs                # Show logs (live)
pm2 logs --lines 100    # Show last 100 lines
pm2 monit               # Interactive monitoring
pm2 restart all         # Restart all
pm2 stop all            # Stop all
pm2 delete all          # Delete all processes
pm2 save                # Save current process list
pm2 startup             # Enable startup on reboot
```

## Build Commands

### Build All Apps
```bash
cd ~/RealEstatesAPI-NestJS

# Build shared packages first
cd packages/types
npm run build
cd ../..

# Build API
cd apps/api
npm run build
cd ../..

# Build Admin-web
cd apps/admin-web
npm run build
cd ../..

# Build User-web
cd apps/user-web
npm run build
cd ../..
```

### Development Mode (Local Only)
```bash
# From workspace root
npm run dev
```

## Git Management

### Fix Divergent Branches
```bash
cd ~/RealEstatesAPI-NestJS

# Option 1: Merge (recommended)
git config pull.rebase false
git pull origin develop

# Option 2: Rebase
git config pull.rebase true
git pull origin develop

# Option 3: Reset to remote (DANGER - loses local changes)
git fetch origin
git reset --hard origin/develop
```

### Update from Repository
```bash
git fetch origin
git pull origin develop
```

### Check Status
```bash
git status
git branch
git log --oneline -10
```

## Database Management

### Run Migrations
```bash
cd apps/api
npm run migration:run
npm run migration:revert  # Rollback last migration
```

### Generate Migration
```bash
cd apps/api
npm run migration:generate -- src/migrations/MigrationName
```

## Monitoring

### Check for DDoS Connections
```bash
# Count Overpass API connections
sudo netstat -an | grep "92.118.207.21" | wc -l

# Show all Overpass connections
sudo netstat -an | grep "92.118.207.21"

# Monitor in real-time
watch -n 5 'sudo netstat -an | grep "92.118.207.21" | wc -l'
```

### Check Port Usage
```bash
sudo netstat -tulpn | grep :3000  # API
sudo netstat -tulpn | grep :3001  # Admin
sudo netstat -tulpn | grep :3002  # User
sudo netstat -tulpn | grep :5432  # PostgreSQL
sudo netstat -tulpn | grep :6379  # Redis
```

### System Resources
```bash
htop                    # Interactive process viewer
df -h                   # Disk usage
free -h                 # Memory usage
docker stats            # Docker container stats
```

## Testing

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# Test from outside
curl http://46.224.231.217:3000/v1/properties/public?page=1&limit=1
```

### Test Admin-web
```bash
curl http://localhost:3001
curl http://46.224.231.217:3001
```

### Test User-web
```bash
curl http://localhost:3002
curl http://46.224.231.217:3002
```

## Troubleshooting

### Services Won't Start

1. **Check if ports are in use:**
```bash
sudo netstat -tulpn | grep -E ':(3000|3001|3002|5432|6379)'
```

2. **Kill processes on ports:**
```bash
sudo kill -9 $(sudo lsof -t -i:3000)
sudo kill -9 $(sudo lsof -t -i:3001)
sudo kill -9 $(sudo lsof -t -i:3002)
```

3. **Check Docker:**
```bash
docker compose ps
docker compose logs
```

4. **Check PM2:**
```bash
pm2 logs --err
pm2 describe realestates-api
```

### Git Issues

**Divergent branches:**
```bash
git config pull.rebase false
git pull origin develop --no-edit
```

**Merge conflicts:**
```bash
# See conflicts
git status

# Accept their changes
git checkout --theirs <file>
git add <file>
git commit -m "Resolved conflicts"

# Accept our changes
git checkout --ours <file>
git add <file>
git commit -m "Resolved conflicts"
```

### Build Failures

1. **Clear node_modules:**
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

2. **Clear build cache:**
```bash
rm -rf apps/*/dist apps/*/.next
```

3. **Rebuild:**
```bash
npm run build  # From root (if using Turborepo)
# OR build each app individually (see Build Commands above)
```

## Environment Variables

### Check Current Environment
```bash
# API
cat apps/api/.env

# Admin-web
cat apps/admin-web/.env.local

# User-web
cat apps/user-web/.env.local
```

### Required Variables

**apps/api/.env:**
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password>
DB_NAME=estates
JWT_SECRET=<min-32-chars>
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002
GEMINI_API_KEY=<optional>
```

**apps/user-web/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
```

## Quick Health Check

Run this to check everything:
```bash
#!/bin/bash
echo "=== Docker Services ==="
docker compose ps
echo ""

echo "=== PM2 Services ==="
pm2 status
echo ""

echo "=== Port Usage ==="
sudo netstat -tulpn | grep -E ':(3000|3001|3002|5432|6379)'
echo ""

echo "=== DDoS Check ==="
echo "Overpass connections: $(sudo netstat -an | grep '92.118.207.21' | wc -l)"
echo ""

echo "=== API Test ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/v1/properties/public?page=1&limit=1
echo ""

echo "=== Git Status ==="
cd ~/RealEstatesAPI-NestJS
git branch
git log --oneline -1
```

Save this as `health-check.sh` and run with:
```bash
chmod +x health-check.sh
./health-check.sh
```

## Emergency Procedures

### Complete System Reset
```bash
# Stop everything
pm2 delete all
docker compose down

# Clear processes
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3002) 2>/dev/null || true

# Restart Docker
docker compose up -d

# Rebuild and restart
./SERVER_FIX_AND_DEPLOY.sh
```

### Rollback to Previous State
```bash
# List backup branches
git branch | grep backup

# Checkout backup
git checkout server-backup-YYYYMMDD

# Restart services
pm2 restart all
```

## Nginx Configuration (If Applicable)

```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
