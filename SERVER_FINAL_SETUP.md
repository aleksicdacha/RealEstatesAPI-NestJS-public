# 🚀 Server Final Setup - Copy and Paste Commands

## Run these commands on your server (root@46.224.231.217)

```bash
# Navigate to project directory
cd /root/RealEstatesAPI-NestJS

# Pull latest code (including new setup script)
git pull origin develop

# Run the environment setup script
chmod +x setup-production-env.sh
./setup-production-env.sh

# Verify files were created
ls -la .env.production apps/api/.env apps/admin-web/.env.production apps/user-web/.env.production

# Now run the deployment
chmod +x deploy-production-complete.sh
./deploy-production-complete.sh
```

---

## What This Does:

1. **Pulls latest code** - Gets the new environment setup script
2. **Creates all .env files** with proper values including:
   - Database password: `realestates_prod_2026_secure`
   - JWT secrets (you should change these!)
   - CORS origins with your server IP
   - API URLs pointing to your server
3. **Runs deployment** - Starts PostgreSQL, Redis, runs migrations, builds apps, starts PM2

---

## Expected Output:

You should see:
```
✅ Created .env.production
✅ Created apps/api/.env
✅ Created apps/admin-web/.env.production
✅ Created apps/user-web/.env.production
```

Then deployment should succeed without database password errors.

---

## After Deployment:

Check that everything is running:

```bash
pm2 status
docker compose -f docker-compose.prod.yml ps
```

You should see:
- **PostgreSQL**: Running on port 5432
- **Redis**: Running on port 6379
- **PM2 Processes**:
  - `api` - Running
  - `admin-web` - Running
  - `user-web` - Running

Access your apps:
- **API**: http://46.224.231.217:3000
- **Admin**: http://46.224.231.217:3001
- **User Web**: http://46.224.231.217:3002

---

## If You Need to Change JWT Secrets (Recommended):

Edit the files on server:

```bash
nano apps/api/.env
# Change JWT_SECRET and JWT_REFRESH_SECRET to random 32+ character strings
# Save: Ctrl+O, Enter, Ctrl+X

# Restart API
cd /root/RealEstatesAPI-NestJS/apps/api
pm2 restart api
```

---

## Troubleshooting:

### If database password error persists:

```bash
# Stop everything
docker compose -f docker-compose.prod.yml down -v
pm2 delete all

# Remove old database volume (THIS DELETES ALL DATA!)
docker volume rm realestatesapi-nestjs_postgres_data 2>/dev/null || true

# Run setup again
./setup-production-env.sh
./deploy-production-complete.sh
```

### Check logs:

```bash
# PostgreSQL logs
docker compose -f docker-compose.prod.yml logs postgres

# API logs
pm2 logs api --lines 50

# Admin Web logs
pm2 logs admin-web --lines 50
```

---

## ⚠️ IMPORTANT SECURITY NOTES:

1. **Change JWT secrets** in `apps/api/.env` to random strings
2. **Add Google Maps API key** if you need maps functionality
3. **Configure firewall** to only allow necessary ports
4. **Use HTTPS** in production (setup Nginx + Let's Encrypt)
5. **Change database password** after initial setup

---

## All Set! 🎉

Your production environment should now be fully configured and running.
