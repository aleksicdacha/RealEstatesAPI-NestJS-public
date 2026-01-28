# 🚀 Production Server Deployment - IMMEDIATE ACTIONS

## ⚡ Quick Summary

You have a **migration connection error** because:
- PostgreSQL runs in Docker (accessible via `postgres` hostname inside Docker network)
- Migration script runs on HOST and tries to connect to `localhost:5432`
- PostgreSQL IS exposed on `localhost:5432`, but there might be a timing issue

## 🎯 What to Run on Server NOW

### ⚡ Quick Deployment (Recommended)

```bash
# On server terminal:
cd /root/RealEstatesAPI-NestJS

# 1. Pull latest code with Dockerfile fixes
git pull origin develop

# 2. Make deployment script executable
chmod +x deploy-production-complete.sh

# 3. Run complete deployment
./deploy-production-complete.sh
```

**That's it!** The script will:
1. Stop existing containers
2. Start PostgreSQL and Redis
3. Build all Docker images (API, Admin, User-Web)
4. Run database migrations
5. Start all services
6. Verify deployment

---

### 🛠️ Manual Deployment (If automated fails)

```bash
cd /root/RealEstatesAPI-NestJS

# 1. Stop existing containers
docker compose -f docker-compose.prod.yml down

# 2. Start PostgreSQL
docker compose -f docker-compose.prod.yml up -d postgres redis
sleep 20

# 3. Verify PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# 4. Build all images
docker compose -f docker-compose.prod.yml build

# 5. Start all services
docker compose -f docker-compose.prod.yml up -d

# 6. Wait for API to start
sleep 15

# 7. Run migrations inside API container
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# 8. Restart API
docker compose -f docker-compose.prod.yml restart api

# 9. Verify
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000/v1/properties/public?page=1&limit=1
```

---

## 🔍 Verify Deployment

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                      STATUS
# estates_api_prod          Up
# estates_admin_web_prod    Up
# estates_user_web_prod     Up
# estates_postgres_prod     Up (healthy)
# estates_redis_prod        Up (healthy)

# Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# Check API logs
docker compose -f docker-compose.prod.yml logs -f api

# Check for DDoS connections (should be 0)
sudo netstat -an | grep "92.118.207.21" | wc -l
```

---

## 🌐 Access URLs

Once deployed:
- **API**: http://46.224.231.217:3000/v1
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

---

## ❓ Troubleshooting

### If migration still fails:

**Check PostgreSQL password:**
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d estates -c "SELECT 1"
```

If this fails, your password in `.env.production` is wrong. Fix it and restart.

### If services won't start:

```bash
# Check individual service logs
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs admin-web
docker compose -f docker-compose.prod.yml logs user-web
```

### Nuclear option (complete reset):

```bash
# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v

# Recreate .env files
./create-prod-env.sh

# Deploy fresh
./fix-migration-deploy.sh
```

---

## 📝 Notes

- **Database**: PostgreSQL data persists in Docker volume `postgres_data_prod`
- **Migrations**: Run automatically during deployment or manually inside API container
- **DDoS Fix**: Rate limiting + connection throttling already implemented in code
- **Security**: JWT secrets are production-grade (32+ chars)
- **CORS**: Only allows connections from your server IP addresses

---

## ✅ Success Checklist

- [ ] `.env.production` created
- [ ] All Docker services running (`docker compose -f docker-compose.prod.yml ps`)
- [ ] API responds to curl test
- [ ] Admin panel loads in browser (http://46.224.231.217:3001)
- [ ] User website loads in browser (http://46.224.231.217:3002)
- [ ] No DDoS connections detected
- [ ] API logs show no errors

---

**Need help?** Check `SERVER_COMMANDS.md` for detailed commands and explanations.
