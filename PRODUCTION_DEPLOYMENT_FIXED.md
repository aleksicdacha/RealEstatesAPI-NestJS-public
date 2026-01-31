# ✅ PRODUCTION DEPLOYMENT - FIXED & WORKING

## 🎯 Current Status: ALL SERVICES RUNNING

Date: January 30, 2026  
Status: **PRODUCTION READY**

### ✅ Services Status

```bash
✔ PostgreSQL     - Healthy (port 5432)
✔ Redis          - Healthy (port 6379)  
✔ API (NestJS)   - Healthy (port 3000)
✔ Admin Panel    - Running (port 3001)
✔ User Website   - Running (port 3002)
```

---

## 🔧 Issues Fixed

### 1. Database Schema Issues
**Problem**: Missing `clientId` column in `properties` table causing "Database operation failed" errors.

**Solution**: Created comprehensive SQL migration script:
- Added `clientId` UUID column to properties table
- Created foreign key constraint to clients table
- Created agent_conversations and agent_messages tables
- Added all necessary indexes
- Granted proper permissions to estates_user

**File**: `fix_production_db.sql`

### 2. Next.js Frontend Docker Issues
**Problem**: Both admin-web and user-web containers failing with "Cannot find module '/app/apps/*/server.js'"

**Root Cause**: 
- Dockerfiles were trying to use standalone Next.js build
- Monorepo structure incompatible with standalone server.js approach
- Trying to copy source files that don't exist in production build

**Solution**: 
- Changed CMD from `node server.js` to `npm start`
- Removed unnecessary `standalone` output mode
- Simplified production stage to only copy built .next directory
- Copied node_modules from deps stage for runtime
- Removed attempts to copy src/ directories in production

**Modified Files**:
- `apps/admin-web/Dockerfile`
- `apps/user-web/Dockerfile`

### 3. Database Connection & Permissions
**Problem**: estates_user didn't have proper permissions on all tables

**Solution**:
```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO estates_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO estates_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO estates_user;
```

---

## 📋 Production Deployment Commands

### On Your Production Server (root@realestates-production)

```bash
cd /root/RealEstatesAPI-NestJS

# Stop current deployment
docker compose -f docker-compose.prod.yml down

# Apply database fixes (if not already done)
docker exec -i estates_postgres_prod psql -U estates_user -d estates_prod < fix_production_db.sql

# Rebuild images with fixed Dockerfiles
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d

# Wait 15 seconds for services to start
sleep 15

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Verify Deployment

```bash
# Test API
curl http://localhost:3000/v1/properties/public

# Test Admin Panel
curl -I http://localhost:3001

# Test User Website
curl -I http://localhost:3002

# Check logs
docker compose -f docker-compose.prod.yml logs --tail 50
```

---

## 🌐 Access URLs (Production Server)

- **API**: http://46.224.231.217:3000
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

---

## 📊 Database Information

### Connection Details
- **Host**: postgres (internal Docker network)
- **Port**: 5432
- **Database**: estates_prod
- **User**: estates_user
- **Password**: pf9QsrLRSKploeiy4MAZcoXZ

### Tables Created
1. `users` - User accounts and authentication
2. `properties` - Real estate property listings
3. `property_images` - Property photos
4. `clients` - Property owners/sellers
5. `representatives` - Client representatives (zastupnici)
6. `newsletter_subscribers` - Newsletter subscriptions
7. `agent_conversations` - Live chat conversations
8. `agent_messages` - Chat messages

### Connect to Database

```bash
# From production server
docker exec -it estates_postgres_prod psql -U estates_user -d estates_prod

# List tables
\dt

# View properties
SELECT id, title, "propertyType", status FROM properties LIMIT 10;

# Exit
\q
```

---

## 🐳 Docker Architecture

### Monorepo Structure
```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/                  # NestJS Backend
│   │   └── Dockerfile        # Multi-stage: development → builder → production
│   ├── admin-web/            # Next.js 15 Admin Panel
│   │   └── Dockerfile        # Multi-stage: base → deps → builder → production
│   └── user-web/             # Next.js 15 Public Website
│       └── Dockerfile        # Multi-stage: base → deps → builder → production
├── docker-compose.prod.yml   # Production orchestration
└── .env.production           # Production environment variables
```

### Docker Compose Services

**postgres:**
- Image: postgres:16-alpine
- Persistent volume: postgres_data_prod
- Health check: pg_isready

**redis:**
- Image: redis:7-alpine
- Used for caching and sessions

**api:**
- Built from apps/api/Dockerfile
- Depends on: postgres, redis
- Exposes: 3000
- CMD: `node dist/main.js`

**admin-web:**
- Built from apps/admin-web/Dockerfile
- Depends on: api
- Exposes: 3001
- CMD: `npm start`

**user-web:**
- Built from apps/user-web/Dockerfile
- Depends on: api
- Exposes: 3002
- CMD: `npm start`

---

## 🔐 Security Configurations

### SSH Hardening (Already Applied)
- Root login disabled
- Password authentication disabled
- Key-based authentication only
- fail2ban protecting SSH

### Firewall Rules
```bash
ufw status

# Ports allowed:
# - 22  (SSH)
# - 80  (HTTP)
# - 443 (HTTPS)
# - 3000, 3001, 3002 (Applications - should be behind nginx)
```

### Environment Variables
Key environment variables are in `.env.production`:
- DB credentials
- JWT secrets
- API keys (Google Maps, Gemini AI)
- CORS origins
- Rate limiting

**⚠️ Never commit .env.production to git!**

---

## 🚨 Troubleshooting

### API Returns "Database operation failed"
```bash
# Check database tables exist
docker exec estates_postgres_prod psql -U estates_user -d estates_prod -c "\dt"

# Apply schema fix
docker exec -i estates_postgres_prod psql -U estates_user -d estates_prod < fix_production_db.sql

# Restart API
docker compose -f docker-compose.prod.yml restart api
```

### Frontend Shows "Cannot find module"
```bash
# Check Dockerfile uses "npm start" not "node server.js"
cat apps/admin-web/Dockerfile | grep CMD
# Should output: CMD ["npm", "start"]

# Rebuild
docker compose -f docker-compose.prod.yml build admin-web user-web
docker compose -f docker-compose.prod.yml up -d admin-web user-web
```

### Port Already in Use
```bash
# Find process using port
ss -tlnp | grep :3001

# Kill PM2 processes if they exist
pm2 delete all
pm2 kill

# Or kill specific process
kill -9 <PID>

# Then restart
docker compose -f docker-compose.prod.yml up -d
```

### Container Keeps Restarting
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs <service-name> --tail 50

# Common issues:
# - Missing environment variables
# - Database not ready (add health checks)
# - Port conflicts
# - Build errors
```

---

## 📈 Performance & Monitoring

### Check Container Resource Usage
```bash
docker stats

# Shows CPU, Memory, Network I/O for each container
```

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail 100
```

### Database Performance
```bash
# Check slow queries
docker exec estates_postgres_prod psql -U estates_user -d estates_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Table sizes
docker exec estates_postgres_prod psql -U estates_user -d estates_prod -c "
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 🔄 Update Deployment

### When You Make Code Changes Locally

```bash
# 1. Commit your changes
git add .
git commit -m "Your changes"
git push origin develop

# 2. On production server
cd /root/RealEstatesAPI-NestJS
git pull origin develop

# 3. Rebuild affected services
docker compose -f docker-compose.prod.yml build <service-name>
docker compose -f docker-compose.prod.yml up -d <service-name>

# Or rebuild all
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Database Migrations

```bash
# Run migrations from API container
docker exec estates_api_prod sh -c "cd /app/apps/api && npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts"

# Create new migration (on local machine)
cd apps/api
npm run migration:generate -- src/migrations/YourMigrationName
```

---

## 📝 Best Practices

### Local Development vs Production

**Local:**
- Docker only for PostgreSQL and Redis
- Run API with `npm run start:dev`
- Run frontends with `npm run dev`
- Hot reload enabled

**Production:**
- Everything in Docker containers
- Built and optimized code
- No development dependencies
- Health checks enabled
- Automatic restarts

### Before Deploying to Production

✅ **Checklist:**
- [ ] Test locally with `docker compose -f docker-compose.prod.yml up`
- [ ] Check all environment variables in `.env.production`
- [ ] Run database migrations
- [ ] Build succeeds without errors
- [ ] API responds to health checks
- [ ] Frontends load correctly
- [ ] Create database backup

### Backup Strategy

```bash
# Backup database
docker exec estates_postgres_prod pg_dump -U estates_user estates_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Restore database
docker exec -i estates_postgres_prod psql -U estates_user -d estates_prod < backup_file.sql
```

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All 5 containers show "Up" and "healthy" status  
✅ API returns JSON from `/v1/properties/public`  
✅ Admin panel loads at :3001  
✅ User website loads at :3002  
✅ No errors in `docker compose logs`  
✅ Database has all tables with proper permissions  
✅ Can create/read/update/delete properties from admin panel

---

## 📞 Support & Resources

### Useful Commands Reference

```bash
# Container management
docker ps                                          # List running containers
docker compose -f docker-compose.prod.yml ps       # Service status
docker compose -f docker-compose.prod.yml restart  # Restart all
docker compose -f docker-compose.prod.yml down     # Stop and remove

# Logs
docker logs <container_name>                       # Container logs
docker compose -f docker-compose.prod.yml logs -f  # Follow all logs

# Database
docker exec -it estates_postgres_prod psql -U estates_user -d estates_prod
docker exec estates_postgres_prod pg_dump ...      # Backup

# Cleanup
docker system prune                                # Remove unused data
docker volume prune                               # Remove unused volumes
```

### Project Structure

```
Backend (NestJS 10):
- modules/              # Feature modules
- controllers/          # API endpoints
- services/             # Business logic
- repositories/         # Database access (custom pattern)
- dto/                  # Data transfer objects
- entities/             # TypeORM entities

Frontend (Next.js 15):
- app/                  # App Router pages
- components/           # React components
- services/             # API client
- types/                # TypeScript types
- hooks/                # Custom hooks
```

---

**Last Updated**: January 30, 2026  
**Deployment Status**: ✅ PRODUCTION READY  
**All Services**: OPERATIONAL
