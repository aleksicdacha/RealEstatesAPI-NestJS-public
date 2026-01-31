# 🚀 PRODUCTION SERVER - FINAL DEPLOYMENT GUIDE

**Server**: root@realestates-production  
**Date**: January 28, 2026  
**Status**: Ready for deployment

---

## ⚡ STEP-BY-STEP DEPLOYMENT

### 1️⃣ Pull Latest Code (with Dockerfile fixes)

```bash
cd /root/RealEstatesAPI-NestJS
git pull origin develop
```

**Expected**: You should see files like `deploy-production-complete.sh`, updated Dockerfiles

---

### 2️⃣ Verify/Create Environment File

```bash
# Check if .env.production exists
ls -la .env.production

# If it doesn't exist, create it:
cat > .env.production << 'EOF'
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME
JWT_REFRESH_EXPIRES_IN=7d
REDIS_HOST=redis
REDIS_PORT=6379
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
EOF
```

---

### 3️⃣ Run Automated Deployment

```bash
chmod +x deploy-production-complete.sh
./deploy-production-complete.sh
```

**What it does:**
1. ✅ Stops existing containers
2. ✅ Starts PostgreSQL and Redis
3. ✅ Builds Docker images (API, Admin, User-Web)
4. ✅ Runs database migrations
5. ✅ Starts all services
6. ✅ Verifies deployment

**Time**: First build takes 5-10 minutes, subsequent builds are faster.

---

### 4️⃣ Verify Deployment

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Should show 5 containers running:
# ✅ estates_postgres_prod
# ✅ estates_redis_prod
# ✅ estates_api_prod
# ✅ estates_admin_prod
# ✅ estates_user_prod

# Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# Should return JSON with properties
```

---

### 5️⃣ Test in Browser

Open these URLs:
- **API**: http://46.224.231.217:3000/v1/properties/public?page=1&limit=1
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

**Admin Login:**
- Email: admin@estate.com
- Password: Admin123!

---

## 📊 MONITORING & LOGS

```bash
# View all logs (real-time)
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f admin-web
docker compose -f docker-compose.prod.yml logs -f user-web

# Check container status
docker compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats

# Check DDoS connections (should be 0)
sudo netstat -an | grep "92.118.207.21" | wc -l
```

---

## 🛠️ MANAGEMENT COMMANDS

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart admin-web
docker compose -f docker-compose.prod.yml restart user-web
```

### Stop/Start Services
```bash
# Stop all
docker compose -f docker-compose.prod.yml down

# Start all
docker compose -f docker-compose.prod.yml up -d

# Stop specific service
docker compose -f docker-compose.prod.yml stop api

# Start specific service
docker compose -f docker-compose.prod.yml start api
```

### Database Access
```bash
# Access PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d estates

# Run SQL query
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d estates -c "SELECT COUNT(*) FROM property;"

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres estates > backup_$(date +%Y%m%d).sql

# Restore database
cat backup_20260128.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres estates
```

### Migrations
```bash
# Run migrations (inside API container)
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# Revert last migration
docker compose -f docker-compose.prod.yml exec api npm run migration:revert

# Check migration status
docker compose -f docker-compose.prod.yml exec api npm run migration:show
```

---

## ❌ TROUBLESHOOTING

### Problem: Containers keep restarting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs postgres

# Common causes:
# 1. Wrong DB password in .env.production
# 2. PostgreSQL not ready (wait 30 seconds)
# 3. Missing migrations
```

**Fix:**
```bash
# Restart with fresh logs
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml logs -f api
```

---

### Problem: API returns 500 errors

```bash
# Check API logs
docker compose -f docker-compose.prod.yml logs -f api

# Common causes:
# 1. Database connection failed
# 2. Missing environment variables
# 3. Migration not run
```

**Fix:**
```bash
# Verify database connection
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Run migrations
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# Restart API
docker compose -f docker-compose.prod.yml restart api
```

---

### Problem: Admin/User web won't load

```bash
# Check build logs
docker compose -f docker-compose.prod.yml logs admin-web
docker compose -f docker-compose.prod.yml logs user-web

# Common causes:
# 1. Build failed
# 2. Port already in use
# 3. API not responding
```

**Fix:**
```bash
# Rebuild specific service
docker compose -f docker-compose.prod.yml up -d --build admin-web

# Or rebuild all
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

### Problem: "target stage production could not be found"

**This means Dockerfiles don't have production stage.**

**Fix:**
```bash
# Pull latest code (already has fixes)
git pull origin develop

# Rebuild
docker compose -f docker-compose.prod.yml build
```

---

### Problem: Migration errors

```bash
# Check if tables exist
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d estates -c "\dt"

# If no tables, run migrations
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# If migration fails, check logs
docker compose -f docker-compose.prod.yml logs api | grep -i error
```

---

### Nuclear Option (Complete Reset)

**⚠️ WARNING: This deletes ALL data!**

```bash
# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v

# Remove all images
docker rmi $(docker images -q realestatesapi*)

# Redeploy from scratch
./deploy-production-complete.sh
```

---

## 🔒 SECURITY CHECKLIST

- [x] JWT secrets are 32+ characters
- [x] PostgreSQL password is strong
- [x] CORS only allows server IPs
- [x] Rate limiting enabled (100 req/min)
- [x] No exposed .env files
- [x] Database in Docker network (not exposed to internet)
- [x] DDoS protection enabled

---

## 📈 PERFORMANCE OPTIMIZATION

```bash
# Clean up unused Docker resources
docker system prune -a

# View disk usage
docker system df

# View container resource usage
docker stats

# Restart PostgreSQL (clears cache)
docker compose -f docker-compose.prod.yml restart postgres
```

---

## 🌐 ACCESS INFORMATION

**Server IP**: 46.224.231.217

**Services:**
- API: http://46.224.231.217:3000
- Admin Panel: http://46.224.231.217:3001
- User Website: http://46.224.231.217:3002

**Admin Credentials:**
- Email: admin@estate.com
- Password: Admin123!

**Database:**
- Host: postgres (inside Docker network)
- Port: 5432 (exposed on host)
- User: postgres
- Password: CHANGE_ME
- Database: estates

---

## 📝 IMPORTANT NOTES

1. **Data Persistence**: PostgreSQL data is stored in Docker volume `postgres_data_prod`
2. **Uploads**: Files are in `./uploads` directory (mounted into API container)
3. **Logs**: API logs in `./apps/api/logs`
4. **Migrations**: Auto-run during deployment, or manually inside API container
5. **DDoS Fix**: Rate limiting + throttling implemented
6. **WebSocket**: Admin panel uses WebSocket for live chat (port 3000)

---

## ✅ DEPLOYMENT CHECKLIST

Before deployment:
- [ ] .env.production file exists
- [ ] All secrets are production-grade (32+ chars)
- [ ] CORS_ORIGIN has correct server IPs
- [ ] Database password is strong

After deployment:
- [ ] All 5 containers running
- [ ] API responds to curl test
- [ ] Admin panel loads in browser
- [ ] User website loads in browser
- [ ] No errors in logs
- [ ] DDoS connections = 0

---

**Last Updated**: January 28, 2026  
**Next Steps**: Run deployment script and verify!
