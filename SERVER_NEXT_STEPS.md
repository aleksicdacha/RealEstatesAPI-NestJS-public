# Server Deployment - Next Steps

**Server:** root@46.224.231.217:~/RealEstatesAPI-NestJS

## ✅ What Has Been Fixed

All `.env.production` files are now configured correctly:
- `.env.production` - DB_HOST=postgres, all secrets configured
- `apps/admin-web/.env.production` - API URL configured  
- `apps/user-web/.env.production` - API URL configured

## 📋 Commands to Run on Server NOW

### Option 1: Automated Script (Recommended)

```bash
# Make script executable
chmod +x quick-prod-deploy.sh

# Run deployment
./quick-prod-deploy.sh
```

This will:
1. Start PostgreSQL
2. Wait for it to be ready
3. Build API
4. Run migrations
5. Start all services
6. Check status
7. Test API
8. Check for DDoS

---

### Option 2: Manual Step-by-Step

If you prefer manual control:

```bash
# 1. Start PostgreSQL only
docker compose -f docker-compose.prod.yml up -d postgres

# 2. Wait 15 seconds
sleep 15

# 3. Build API
cd apps/api
npm run build

# 4. Run migrations
npm run migration:run

# 5. Go back to root
cd ../..

# 6. Start all services
docker compose -f docker-compose.prod.yml up -d

# 7. Wait 30 seconds for services to start
sleep 30

# 8. Check status
docker compose -f docker-compose.prod.yml ps

# 9. Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# 10. Check for DDoS
sudo netstat -an | grep "92.118.207.21" | wc -l
```

---

## 📊 Expected Results

### Docker Containers Status
You should see 4 containers running:
- `estates_postgres_prod` (healthy)
- `estates_api_prod` (healthy)
- `estates_admin_prod` (healthy)
- `estates_user_prod` (healthy)

### API Test
Should return JSON with property data

### DDoS Check
Should return `0` or a very low number (1-2 max)

---

## 🔍 View Logs

```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# Just API
docker compose -f docker-compose.prod.yml logs -f api

# Just admin-web
docker compose -f docker-compose.prod.yml logs -f admin-web

# Just user-web
docker compose -f docker-compose.prod.yml logs -f user-web
```

Press `Ctrl+C` to exit logs

---

## 🚀 Access Your Apps

Once all containers are healthy:
- **API:** http://46.224.231.217:3000/v1/properties/public
- **Admin Panel:** http://46.224.231.217:3001
- **User Website:** http://46.224.231.217:3002

---

## ⚠️ If Something Goes Wrong

### PostgreSQL won't start:
```bash
docker compose -f docker-compose.prod.yml logs postgres
```

### Migration fails:
```bash
cd apps/api
cat .env  # Check if it exists, if not create it
cd ../..
```

### API won't start:
```bash
docker compose -f docker-compose.prod.yml logs api
# Look for connection errors or missing env vars
```

### Rebuild from scratch:
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

## 📁 Quick Reference

**Current location:** You should be in `/root/RealEstatesAPI-NestJS`

**Check current directory:**
```bash
pwd
```

**If not in correct directory:**
```bash
cd ~/RealEstatesAPI-NestJS
```

---

**Ready? Run the quick deployment script or follow manual steps!** 🚀
