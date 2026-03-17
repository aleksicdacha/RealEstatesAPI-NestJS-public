# Production Docker Deployment Guide

## Overview

This project supports **two production deployment methods**:

### Method 1: PM2 Deployment (Current/Recommended)
- ✅ Currently used on production server
- ✅ Apps run directly via PM2 process manager
- ✅ Only PostgreSQL runs in Docker
- ✅ Easier debugging and log access
- ✅ Lower resource overhead

### Method 2: Full Docker Deployment (Alternative)
- 🐳 All services containerized
- 🐳 Uses `docker-compose.prod.yml`
- 🐳 Better isolation and portability
- 🐳 Easier scaling and load balancing

---

## Current Setup (PM2 Method)

### Architecture
```
Server (46.224.231.217)
├── Docker Container: PostgreSQL (port 5432)
├── Docker Container: Redis (port 6379) [optional]
└── PM2 Processes:
    ├── realestates-api (port 3000)
    ├── realestates-admin (port 3001)
    └── realestates-user (port 3002)
```

### Deployment Commands

```bash
# On server - full setup
cd ~/RealEstatesAPI-NestJS
chmod +x SERVER_COMPLETE_SETUP.sh
./SERVER_COMPLETE_SETUP.sh

# Or manual deployment
git pull origin develop
npm install
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..
pm2 restart all
pm2 save
```

### Manage Services
```bash
# Status
pm2 status

# Logs
pm2 logs
pm2 logs realestates-api --lines 100

# Restart individual service
pm2 restart realestates-api
pm2 restart realestates-admin
pm2 restart realestates-user

# Stop all
pm2 stop all

# Delete all (careful!)
pm2 delete all
```

---

## Alternative: Full Docker Deployment

### Prerequisites

1. **Create `.env.production` file**:
```bash
cp .env.production.template .env.production
nano .env.production
# Fill in all CHANGE_THIS values with secure credentials
```

2. **Check Dockerfiles exist** for each app:
   - `apps/api/Dockerfile`
   - `apps/admin-web/Dockerfile`
   - `apps/user-web/Dockerfile`

### Deployment Steps

```bash
# 1. Stop PM2 services (if running)
pm2 stop all
pm2 delete all

# 2. Pull latest code
git pull origin develop

# 3. Build and start containers
docker compose -f docker-compose.prod.yml up -d --build

# 4. Check status
docker compose -f docker-compose.prod.yml ps

# 5. View logs
docker compose -f docker-compose.prod.yml logs -f

# 6. Run migrations (first time)
docker exec estates_api_prod npm run migration:run
```

### Docker Management

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f admin-web
docker compose -f docker-compose.prod.yml logs -f user-web

# Restart service
docker compose -f docker-compose.prod.yml restart api

# Stop all
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (DANGEROUS - deletes database!)
docker compose -f docker-compose.prod.yml down -v

# View resource usage
docker stats

# Shell into container
docker exec -it estates_api_prod sh
```

---

## Comparison: PM2 vs Docker

| Feature | PM2 Method | Docker Method |
|---------|-----------|---------------|
| **Complexity** | Simple | Moderate |
| **Resource Usage** | Lower | Higher |
| **Isolation** | Shared host | Containerized |
| **Debugging** | Easier | Requires docker exec |
| **Scaling** | Manual | Docker Swarm/K8s |
| **Portability** | Server-dependent | Highly portable |
| **Current Status** | ✅ In Production | 📦 Available |

---

## Migration: PM2 → Docker

If you want to switch from PM2 to Docker:

```bash
# 1. Backup database
pg_dump -U postgres estates > backup-$(date +%Y%m%d).sql

# 2. Stop PM2
pm2 stop all
pm2 delete all
pm2 save

# 3. Create production env file
cp .env.production.template .env.production
# Edit with your credentials

# 4. Start Docker containers
docker compose -f docker-compose.prod.yml up -d --build

# 5. Restore database (if needed)
docker exec -i estates_postgres_prod psql -U postgres estates < backup.sql
```

---

## Rollback: Docker → PM2

If Docker deployment has issues:

```bash
# 1. Stop Docker
docker compose -f docker-compose.prod.yml down

# 2. Start PostgreSQL only
docker compose up -d postgres

# 3. Restart PM2 services
./SERVER_COMPLETE_SETUP.sh
```

---

## Environment Files Required

### PM2 Method
- `apps/api/.env`
- `apps/admin-web/.env.production`
- `apps/user-web/.env.production`

### Docker Method
- `.env.production` (root level)
- Optionally individual app env files

---

## Troubleshooting

### Database Connection Issues

**PM2:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -h localhost -U postgres -d estates
```

**Docker:**
```bash
# Check all containers
docker compose -f docker-compose.prod.yml ps

# Check network
docker network inspect realestatesapi-nestjs_estates_network
```

### Port Conflicts

```bash
# Check what's using ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3002
sudo netstat -tulpn | grep :5432

# Kill process on port (if needed)
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Migration Issues

**PM2:**
```bash
cd apps/api
npm run migration:run
```

**Docker:**
```bash
docker exec estates_api_prod npm run migration:run
```

---

## Recommendation

**For your current setup, CONTINUE USING PM2 METHOD**:

✅ Already configured and working  
✅ Easier to debug and monitor  
✅ Lower resource usage  
✅ Faster deployment cycles  

Consider Docker when:
- 🔄 You need better isolation
- 📦 You're deploying to multiple servers
- 🎯 You want container orchestration (Kubernetes)
- 🔐 You need stronger security boundaries

---

## Security Notes

1. **Never commit `.env.production`** to git (already in `.gitignore`)
2. **Use strong passwords** for database and JWT secrets
3. **Enable UFW firewall** on production server
4. **Regular security updates**: `apt update && apt upgrade`
5. **Monitor logs** for suspicious activity: `pm2 logs | grep -i error`

---

## Next Steps

1. ✅ Current setup is fine with PM2
2. 📝 Keep `docker-compose.prod.yml` for future use
3. 🔄 Test Docker deployment in staging environment first
4. 📚 Document any custom configurations
5. 🔒 Regular backups of database and uploads folder
