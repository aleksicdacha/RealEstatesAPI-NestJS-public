# Manual Production Deployment Steps

**Date:** January 28, 2026  
**Server:** 46.224.231.217

---

## Step 1: Stop All Running Services

```bash
# Stop PM2 if running
pm2 stop all
pm2 delete all

# Stop Docker containers
cd ~/RealEstatesAPI-NestJS
docker compose -f docker-compose.prod.yml down
```

---

## Step 2: Pull Latest Code

```bash
cd ~/RealEstatesAPI-NestJS

# Configure git pull strategy
git config pull.rebase false

# Pull latest changes
git pull origin develop
```

If you get conflicts, run:
```bash
git stash
git pull origin develop
```

---

## Step 3: Install Dependencies

```bash
# Root dependencies
npm install

# API dependencies
cd apps/api
npm install --production
cd ../..

# Admin-web dependencies
cd apps/admin-web
npm install --production
cd ../..

# User-web dependencies
cd apps/user-web
npm install --production
cd ../..
```

---

## Step 4: Create/Update .env Files

### Create API .env file:
```bash
nano apps/api/.env
```

Paste your local `apps/api/.env` content (with production database password)

**Important:** Make sure these values are set:
- `DB_HOST=postgres` (Docker container name)
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=<your-production-password>`
- `DB_NAME=estates`
- `JWT_SECRET=<min-32-chars>`
- `NODE_ENV=production`
- `PORT=3000`
- `CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002`

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Create Admin-web .env.local:
```bash
nano apps/admin-web/.env.local
```

Paste:
```
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=ws://46.224.231.217:3000
```

Save with `Ctrl+X`, `Y`, `Enter`

### Create User-web .env.local:
```bash
nano apps/user-web/.env.local
```

Paste your local `apps/user-web/.env.local` content with:
```
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
```

Save with `Ctrl+X`, `Y`, `Enter`

---

## Step 5: Build Shared Packages

```bash
cd packages/types
npm run build
cd ../..
```

---

## ✅ FIXED: Environment Files Already Configured!

All `.env.production` files already exist and have been updated with correct production settings:
- ✅ `.env.production` (root) - DB_HOST=postgres, CORS, API keys configured
- ✅ `apps/admin-web/.env.production` - Points to production API
- ✅ `apps/user-web/.env.production` - Points to production API

**You can now proceed to Step 6!**

---

## Step 6: Start Database & Run Migrations

```bash
# Start PostgreSQL only
docker compose -f docker-compose.prod.yml up -d postgres

# Wait for it to initialize
sleep 15

# Build API (needed for migrations)
cd apps/api
npm run build

# Run migrations
npm run migration:run

# Go back to root
cd ../..
```

If migration fails with password error, check that `apps/api/.env` has correct `DB_PASSWORD`

---

## Step 7: Start All Services

```bash
# Start all services with Docker Compose
docker compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30
```

---

## Step 8: Verify Everything is Running

```bash
# Check Docker containers
docker compose -f docker-compose.prod.yml ps

# Should show:
# - postgres (healthy)
# - api (healthy)
# - admin-web (healthy)
# - user-web (healthy)

# Check API
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# Check for DDoS connections (should be 0)
sudo netstat -an | grep "92.118.207.21" | wc -l
```

---

## Step 9: View Logs

```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# API logs only
docker compose -f docker-compose.prod.yml logs -f api

# Admin-web logs
docker compose -f docker-compose.prod.yml logs -f admin-web

# User-web logs
docker compose -f docker-compose.prod.yml logs -f user-web
```

Press `Ctrl+C` to exit logs

---

## Step 10: Fix WebSocket CORS (if needed)

If you see WebSocket/Socket.io CORS errors in admin-web, check `apps/api/src/main.ts` has:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',
    'http://46.224.231.217:3001',
    'http://localhost:3002', 
    'http://46.224.231.217:3002'
  ],
  credentials: true
});
```

Then rebuild API:
```bash
cd apps/api
npm run build
cd ../..
docker compose -f docker-compose.prod.yml restart api
```

---

## Useful Commands

### Restart a single service:
```bash
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart admin-web
docker compose -f docker-compose.prod.yml restart user-web
```

### Stop all:
```bash
docker compose -f docker-compose.prod.yml down
```

### Start all:
```bash
docker compose -f docker-compose.prod.yml up -d
```

### View container status:
```bash
docker compose -f docker-compose.prod.yml ps
```

### Monitor DDoS connections:
```bash
watch -n 5 'sudo netstat -an | grep 92.118.207.21 | wc -l'
```

### Check container resource usage:
```bash
docker stats
```

---

## Service URLs

- **API:** http://46.224.231.217:3000
- **Admin Panel:** http://46.224.231.217:3001
- **User Website:** http://46.224.231.217:3002

---

## Troubleshooting

### API won't start:
```bash
docker compose -f docker-compose.prod.yml logs api
# Check for database connection errors, missing env vars
```

### Database connection failed:
- Check `apps/api/.env` has correct `DB_PASSWORD`
- Check PostgreSQL is running: `docker compose -f docker-compose.prod.yml ps postgres`

### WebSocket CORS errors:
- Update `apps/api/src/main.ts` CORS origins
- Rebuild: `cd apps/api && npm run build && cd ../..`
- Restart: `docker compose -f docker-compose.prod.yml restart api`

### Next.js build errors:
```bash
# Rebuild manually
docker compose -f docker-compose.prod.yml build admin-web --no-cache
docker compose -f docker-compose.prod.yml build user-web --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

## Success Checklist

- [ ] All Docker containers running (4 total: postgres, api, admin-web, user-web)
- [ ] API responding at port 3000
- [ ] Admin-web accessible at port 3001
- [ ] User-web accessible at port 3002
- [ ] No DDoS connections to 92.118.207.21 (or max 1-2)
- [ ] No errors in logs
- [ ] Can login to admin panel
- [ ] User website loads correctly

---

**Good luck with the deployment! 🚀**
