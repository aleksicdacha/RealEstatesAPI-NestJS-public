# SERVER DEPLOYMENT COMMANDS

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

### Option A: Skip migrations (if database already has tables)
```bash
# Start PostgreSQL only
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10

# Skip migration step and start all services
docker compose -f docker-compose.prod.yml up -d
```

### Option B: Run migrations manually
```bash
# Ensure PostgreSQL is running
docker compose -f docker-compose.prod.yml up -d postgres
sleep 15

# Try to run migrations
cd apps/api
npm run migration:run
cd ../..

# If successful, start all services
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
