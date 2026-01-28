# SERVER DEPLOYMENT COMMANDS

## 🚨 QUICK FIX FOR MIGRATION ERROR (Run this NOW on server)

```bash
cd /root/RealEstatesAPI-NestJS

# Option A: Simple - Use the fix script
chmod +x fix-migration-deploy.sh
./fix-migration-deploy.sh
```

**If Option A fails, use Option B:**

```bash
# Option B: Manual steps
cd /root/RealEstatesAPI-NestJS

# 1. Start PostgreSQL with exposed port
docker compose -f docker-compose.prod.yml up -d postgres
sleep 15

# 2. Verify PostgreSQL is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# 3. Build all services
docker compose -f docker-compose.prod.yml build

# 4. Start all services (skip migration for now)
docker compose -f docker-compose.prod.yml up -d

# 5. Run migrations INSIDE the API container
sleep 10
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# 6. Restart API to apply changes
docker compose -f docker-compose.prod.yml restart api

# 7. Verify everything is running
docker compose -f docker-compose.prod.yml ps
```

**Check if it worked:**
```bash
# Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1

# Check logs
docker compose -f docker-compose.prod.yml logs -f api
```

---

## CRITICAL: Run these commands on the production server

### Step 1: Pull Latest Code (if not already done)
```bash
cd /root/RealEstatesAPI-NestJS
git pull origin develop
```

### Step 2: Create Environment Files
```bash
cd /root/RealEstatesAPI-NestJS

# Create the script manually since it's in gitignore
cat > server-create-env.sh << 'SCRIPT_EOF'
#!/bin/bash
set -e

echo "Creating .env.production..."
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

echo "Creating apps/api/.env..."
cat > apps/api/.env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates

JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=
EOF

echo "Creating apps/admin-web/.env.production..."
cat > apps/admin-web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NODE_ENV=production
PORT=3001
EOF

echo "Creating apps/user-web/.env.production..."
cat > apps/user-web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NODE_ENV=production
PORT=3002
EOF

echo "✅ All environment files created!"
SCRIPT_EOF

# Make it executable and run
chmod +x server-create-env.sh
./server-create-env.sh
```

### Step 3: Verify Environment Files
```bash
# Check that files were created
ls -la .env.production
ls -la apps/api/.env
ls -la apps/admin-web/.env.production
ls -la apps/user-web/.env.production
```

### Step 4: Deploy
```bash
# Now run the deployment script
chmod +x quick-prod-deploy.sh
./quick-prod-deploy.sh
```

## If deployment fails at migration step:

### CRITICAL FIX: PostgreSQL Connection Issue

The error `ECONNREFUSED ::1:5432` means PostgreSQL is running in Docker but migrations are trying to connect to localhost.

**Solution: Use Docker's PostgreSQL port mapping**

```bash
# First, ensure PostgreSQL container exposes port 5432 to host
# Check docker-compose.prod.yml has this in postgres service:
#   ports:
#     - "5432:5432"

# Step 1: Start PostgreSQL with port exposed
docker compose -f docker-compose.prod.yml up -d postgres

# Step 2: Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 15

# Step 3: Verify PostgreSQL is accessible
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Step 4: Run migrations (now apps/api/.env uses localhost, which will work)
cd apps/api
npm run migration:run
cd ../..

# Step 5: Start all services
docker compose -f docker-compose.prod.yml up -d

# Step 6: Verify all services are running
docker compose -f docker-compose.prod.yml ps
```

### Option B: Run migrations inside Docker container
If port mapping doesn't work, run migrations inside the API container:

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
sleep 15

# Run migrations inside the API container
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# Restart API to apply changes
docker compose -f docker-compose.prod.yml restart api
```

### Option C: Skip migrations (if database already has tables)
```bash
# If your database already has all tables from previous deployment
# Just start all services directly
docker compose -f docker-compose.prod.yml up -d
```

## Verify Deployment
```bash
# Check services status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f api

# Test API
curl http://localhost:3000/v1/properties/public?page=1&limit=1
```

## Check for DDoS connections
```bash
# Should show 0 or very low number
sudo netstat -an | grep "92.118.207.21" | wc -l
```

## Troubleshooting

### If PostgreSQL password is wrong:
```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Edit .env.production and apps/api/.env with correct password
nano .env.production
nano apps/api/.env

# Restart
./quick-prod-deploy.sh
```

### If services won't start:
```bash
# Check logs for each service
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs redis
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs admin-web
docker compose -f docker-compose.prod.yml logs user-web
```

### Nuclear option (complete reset):
```bash
# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v

# Recreate environment files (run Step 2 again)

# Deploy fresh
./quick-prod-deploy.sh
```
