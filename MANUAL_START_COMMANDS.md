# Production Server - Manual Start Commands

## Quick Start (Automated Script)

```bash
cd /root/RealEstatesAPI-NestJS
chmod +x PRODUCTION_START_COMMANDS.sh
./PRODUCTION_START_COMMANDS.sh
```

---

## Manual Commands (Step by Step)

### 1. Stop Everything

```bash
cd /root/RealEstatesAPI-NestJS
pm2 stop all
pm2 delete all
docker compose down
```

### 2. Verify Environment Files

```bash
# Check if .env files exist
ls -la apps/api/.env
ls -la apps/admin-web/.env.production
ls -la apps/user-web/.env.production

# If missing, create them:
nano apps/api/.env
nano apps/admin-web/.env.production
nano apps/user-web/.env.production
```

### 3. Start PostgreSQL

```bash
# Start only PostgreSQL
docker compose up -d postgres

# Wait for it to initialize
sleep 30

# Test connection (replace 'CHANGE_ME' with your password)
export PGPASSWORD='CHANGE_ME'
psql -h localhost -U postgres -d estates -c "SELECT 1"
```

### 4. Run Migrations

```bash
cd apps/api
npm run migration:run
cd ../..
```

**If migration fails with password error:**
- Check `apps/api/.env` - DB_PASSWORD value
- Check `docker-compose.yml` - POSTGRES_PASSWORD value
- They MUST match!

### 5. Build All Applications

```bash
# Build API
cd apps/api
npm run build
cd ../..

# Build Admin Web
cd apps/admin-web
npm run build
cd ../..

# Build User Web
cd apps/user-web
npm run build
cd ../..
```

### 6. Start Applications with PM2

```bash
# Start API Backend
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production
cd ../..

# Start Admin Web
cd apps/admin-web
pm2 start npm --name "realestates-admin" -- start
cd ../..

# Start User Web
cd apps/user-web
pm2 start npm --name "realestates-user" -- start
cd ../..

# Save PM2 configuration
pm2 save
pm2 startup
```

### 7. Check Status

```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Docker containers
docker compose ps
docker compose logs postgres

# Check if ports are listening
netstat -tulpn | grep -E '3000|3001|3002|5432'
```

### 8. Health Checks

```bash
# Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# Test Admin Web
curl http://localhost:3001

# Test User Web
curl http://localhost:3002
```

---

## Troubleshooting

### Migration Error: "password authentication failed"

**Problem:** Database password mismatch

**Solution:**
```bash
# 1. Check password in .env
cat apps/api/.env | grep DB_PASSWORD

# 2. Check password in docker-compose.yml
cat docker-compose.yml | grep POSTGRES_PASSWORD

# 3. If they don't match, fix .env:
nano apps/api/.env

# 4. Restart PostgreSQL
docker compose down
docker compose up -d postgres
sleep 30

# 5. Try migration again
cd apps/api
npm run migration:run
```

### Cannot Find Module Errors

**Problem:** Missing dependencies or tsconfig paths

**Solution:**
```bash
# Reinstall dependencies
npm install

# Build again
cd apps/api
npm run build
cd ../..
```

### Port Already in Use

**Problem:** Another process is using the port

**Solution:**
```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill it
sudo kill -9 <PID>

# Or find all node processes
ps aux | grep node
sudo killall node
```

### PM2 Not Starting

**Problem:** Build files missing or corrupted

**Solution:**
```bash
# Clean and rebuild
cd apps/api
rm -rf dist
npm run build
cd ../..

# Start again
pm2 delete all
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production
```

### CORS Errors

**Problem:** CORS_ORIGIN not set correctly

**Solution:**
```bash
nano apps/api/.env

# Make sure CORS_ORIGIN includes your domain:
# CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

# Restart API
pm2 restart realestates-api
```

---

## Useful Commands

```bash
# View logs
pm2 logs                          # All logs
pm2 logs realestates-api          # API logs only
pm2 logs realestates-admin        # Admin logs only
pm2 logs realestates-user         # User logs only

# Restart services
pm2 restart all                   # Restart all
pm2 restart realestates-api       # Restart API only
pm2 restart realestates-admin     # Restart Admin only

# Stop/Start
pm2 stop all
pm2 start all

# Monitor resources
pm2 monit

# Database
docker compose logs postgres      # View DB logs
docker compose exec postgres psql -U postgres -d estates  # Access DB

# Check connections
sudo netstat -anp | grep LISTEN   # All listening ports
sudo netstat -anp | grep 92.118.207.21  # Check DDoS IP connections
```

---

## Post-Deployment Checklist

- [ ] All PM2 processes running (`pm2 status`)
- [ ] PostgreSQL container running (`docker compose ps`)
- [ ] API responding on port 3000
- [ ] Admin Web responding on port 3001
- [ ] User Web responding on port 3002
- [ ] No errors in logs (`pm2 logs`)
- [ ] No suspicious connections (`sudo netstat -anp | grep 92.118.207.21`)

---

## Environment Files Summary

### apps/api/.env
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME  # MUST MATCH docker-compose.yml
DB_NAME=estates

JWT_SECRET=your_32_chars_minimum_secret_key_here
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=your_refresh_secret_key_minimum_32_chars
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
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
