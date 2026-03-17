# 🚀 Real Estate Platform - Unified Deployment System

**Version:** 2.0.0  
**Last Updated:** January 30, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environments](#environments)
- [Prerequisites](#prerequisites)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Management](#management)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This is a **monorepo** containing a complete Real Estate Platform:

- **Backend**: NestJS 10 REST API
- **Admin Panel**: Next.js 15 (PrimeReact UI)
- **Public Website**: Next.js 15 (i18n with next-intl)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

**Key Features:**
- ✅ One-click deployment for local and production
- ✅ Automated database migrations
- ✅ Development seeds with test data
- ✅ Docker Compose orchestration
- ✅ Environment-specific configurations
- ✅ Health checks and monitoring

---

## ⚡ Quick Start

### For Local Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd RealEstatesAPI-NestJS

# 2. Run the deployment script
./deploy.sh

# 3. Select option 1 (LOCAL)

# 4. Access the application
# API:         http://localhost:3000
# Admin Panel: http://localhost:3001  (login: admin/admin123)
# Website:     http://localhost:3002
```

### For Production Deployment

```bash
# 1. SSH into your production server
ssh root@your-server-ip

# 2. Clone the repository
cd /root
git clone <repository-url>
cd RealEstatesAPI-NestJS

# 3. Create .env.production file (see Environment Setup)

# 4. Run the deployment script
./deploy.sh

# 5. Select option 2 (PRODUCTION)
```

---

## 🌍 Environments

### Local Development

**Purpose:** Active development, testing, debugging

**Characteristics:**
- Docker only for PostgreSQL & Redis
- npm dev scripts for API and frontends (hot reload)
- Development seeds (admin user + test data)
- Debug logging enabled
- Source maps enabled
- Default database: `estates`
- Default user: `postgres` / `CHANGE_ME`

**What Gets Created:**
- ✅ Admin user (username: `admin`, password: `admin123`)
- ✅ Agent user (username: `agent`, password: `agent123`)
- ✅ 3 Sample clients
- ℹ️  Properties created manually via admin panel

**Ports:**
- API: 3000
- Admin: 3001
- Website: 3002
- PostgreSQL: 5432
- Redis: 6379

### Production

**Purpose:** Live deployment for end users

**Characteristics:**
- All services in Docker containers
- Production builds (optimized, minified)
- No test data
- Production logging
- PM2 process management (optional)
- Secure database: `estates_prod`
- Secure user: `estates_user` / custom password

**What Gets Created:**
- ✅ Initial admin user (username: `admin`)
- ⚠️  Default password: `ChangeMe123!` (MUST be changed immediately)
- ℹ️  All database tables via migrations
- ✅ Production-ready configuration

**Security Notes:**
- The initial admin user is created ONLY if no admin exists
- Default password should be changed immediately after first login
- You can set custom password via `ADMIN_DEFAULT_PASSWORD` in `.env.production`
- Create additional users through the admin panel
- Consider disabling the default admin after creating your own

**Ports:**
- API: 3000
- Admin: 3001
- Website: 3002
- PostgreSQL: 5432 (internal)
- Redis: 6379 (internal)

---

## 📦 Prerequisites

### For Local Development

- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+
- **Docker**: v20+
- **Docker Compose**: v2+
- **Git**: Latest version

### For Production

- **Ubuntu**: 22.04+ or 24.04 LTS
- **Docker**: v20+
- **Docker Compose**: v2+
- **Git**: Latest version
- **Minimum RAM**: 2GB (4GB recommended)
- **Minimum Disk**: 20GB

**Optional but Recommended:**
- Nginx (reverse proxy)
- SSL certificates (Let's Encrypt)
- Firewall (UFW)
- fail2ban (security)

---

## 🚀 Deployment

### The Master Script: `deploy.sh`

This is the **ONLY** script you need to run. It handles everything:

```bash
./deploy.sh
```

**What it does:**

1. **Environment Selection** - Prompts for LOCAL or PRODUCTION
2. **Pre-flight Checks** - Validates requirements
3. **Environment Setup** - Creates/validates .env files
4. **Cleanup** - Stops existing processes/containers
5. **Dependencies** - Installs npm packages
6. **Database** - Starts PostgreSQL & Redis
7. **Migrations** - Runs database migrations
8. **Seeding** - Seeds data (local only)
9. **Build** - Compiles applications
10. **Start** - Launches all services
11. **Health Checks** - Verifies services are running
12. **Summary** - Shows access URLs and credentials

### Environment Configuration

#### Local (.env files)

The script auto-creates these files if missing:

**`apps/api/.env`** (Backend)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

**`apps/admin-web/.env.local`** (Admin Panel)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
```

**`apps/user-web/.env.local`** (Website)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
```

#### Production (.env.production)

You **MUST** create this file manually before deploying:

```bash
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000

DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=estates_user
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_NAME=estates_prod
DB_SYNC=false

JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_64_CHARS_MINIMUM
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET_KEY_64_CHARS_MINIMUM
JWT_REFRESH_EXPIRES_IN=30d

# Optional: Set custom admin password (default: ChangeMe123!)
ADMIN_DEFAULT_PASSWORD=YourSecureAdminPassword123!

CORS_ORIGIN=http://YOUR_DOMAIN:3001,http://YOUR_DOMAIN:3002
BASE_URL=http://YOUR_DOMAIN:3000
FILE_UPLOAD_PATH=/app/apps/api/uploads

RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY_OPTIONAL

NEXT_PUBLIC_API_URL=http://YOUR_DOMAIN:3000/v1
NEXT_PUBLIC_WS_URL=http://YOUR_DOMAIN:3000
FRONTEND_URL=http://YOUR_DOMAIN:3002
EOF
```

**Replace:**
- `YOUR_SECURE_PASSWORD_HERE` - Strong database password
- `YOUR_SUPER_SECRET_JWT_KEY` - 64+ character random string
- `YOUR_DOMAIN` - Your server IP or domain
- `YourSecureAdminPassword123!` - Custom admin password (optional, defaults to `ChangeMe123!`)

---

## 🏗️ Architecture

### Monorepo Structure

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── src/
│   │   │   ├── entities/     # TypeORM entities
│   │   │   ├── modules/      # Feature modules
│   │   │   └── migrations/   # Database migrations
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin-web/            # Next.js Admin Panel
│   │   ├── app/              # App Router
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── user-web/             # Next.js Public Website
│       ├── app/              # App Router
│       ├── components/       # React components
│       ├── messages/         # i18n translations
│       ├── Dockerfile
│       └── package.json
│
├── seeds/                    # Database seeds
│   └── local-development-seed.ts
│
├── docker-compose.yml        # Local environment
├── docker-compose.prod.yml   # Production environment
├── deploy.sh                 # Master deployment script
├── package.json              # Root workspace config
└── turbo.json                # Turborepo config
```

### Service Communication

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
    ┌────▼──────────────┐
    │   Nginx (prod)    │ ← SSL/Domain/Reverse Proxy
    │   :80 / :443      │
    └────┬──────────────┘
         │
    ┌────▼────────┬──────────────┬──────────────┐
    │             │              │              │
┌───▼──────┐ ┌───▼───────┐ ┌───▼────────┐ ┌───▼─────┐
│   API    │ │Admin Panel│ │User Website│ │ Redis   │
│  :3000   │ │  :3001    │ │   :3002    │ │  :6379  │
└───┬──────┘ └───────────┘ └────────────┘ └─────────┘
    │
    │
┌───▼──────────┐
│  PostgreSQL  │
│    :5432     │
└──────────────┘
```

---

## 🛠️ Management

### Local Development

**Start Services:**
```bash
./deploy.sh  # Select option 1
```

**Stop Services:**
```bash
docker compose down
kill $(cat .dev-api.pid .dev-admin.pid .dev-user.pid 2>/dev/null)
```

**View Logs:**
```bash
# Database logs
docker compose logs -f postgres

# API logs (check terminal)
# Admin/User logs (check terminal)
```

**Restart Individual Service:**
```bash
# Restart API
cd apps/api && npm run start:dev

# Restart Admin
cd apps/admin-web && npm run dev

# Restart Website  
cd apps/user-web && npm run dev
```

### Production

**Start Services:**
```bash
./deploy.sh  # Select option 2
```

**Stop Services:**
```bash
docker compose -f docker-compose.prod.yml down
```

**View Logs:**
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f admin-web
docker compose -f docker-compose.prod.yml logs -f user-web
```

**Restart Services:**
```bash
# All services
docker compose -f docker-compose.prod.yml restart

# Specific service
docker compose -f docker-compose.prod.yml restart api
```

**Check Status:**
```bash
docker compose -f docker-compose.prod.yml ps
```

**Database Backup:**
```bash
# Backup
docker exec estates_postgres_prod pg_dump -U estates_user estates_prod > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i estates_postgres_prod psql -U estates_user estates_prod < backup_20260130.sql
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

**Error:** `address already in use`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or let deploy.sh handle it
./deploy.sh
```

#### Database Connection Failed

**Error:** `password authentication failed`

**Solution:**
```bash
# Check .env file has correct credentials
cat apps/api/.env  # local
cat .env.production  # production

# Restart database
docker compose restart postgres
```

#### Migration Failed

**Error:** `relation already exists`

**Solution:**
```bash
# Migrations may have already run - this is OK
# Check database tables
docker exec -it estates_postgres psql -U postgres -d estates -c "\dt"
```

#### Frontend Not Loading

**Error:** `Cannot find module`

**Solution:**
```bash
# Reinstall dependencies
cd apps/admin-web && rm -rf node_modules .next && npm install
cd apps/user-web && rm -rf node_modules .next && npm install

# Rebuild
./deploy.sh
```

#### Docker Build Failed

**Error:** `failed to solve`

**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild
./deploy.sh
```

### Debug Commands

```bash
# Check all running containers
docker ps

# Check container logs
docker logs <container-name>

# Enter container shell
docker exec -it <container-name> sh

# Check database
docker exec -it estates_postgres psql -U postgres -d estates

# Check Redis
docker exec -it estates_redis redis-cli ping

# Test API
curl http://localhost:3000/v1/properties/public
```

---

## 📚 Additional Documentation

- **[SEEDING_GUIDE.md](./SEEDING_GUIDE.md)** - Database seeding guide
- **[PRODUCTION_DEPLOYMENT_FIXED.md](./PRODUCTION_DEPLOYMENT_FIXED.md)** - Production deployment details
- **[AI_PROJECT_CONTEXT.md](./AI_PROJECT_CONTEXT.md)** - AI coding instructions
- **[documentation/](./documentation/)** - Technical documentation

---

## 🎯 Next Steps After Deployment

### For Local Development

1. ✅ Access admin panel: http://localhost:3001
2. ✅ Login with `admin` / `admin123`
3. ✅ Create your first property
4. ✅ Test public website: http://localhost:3002

### For Production

1. ⚠️ **Setup Nginx reverse proxy with SSL**
2. ⚠️ **Configure firewall (close direct port access)**
3. ⚠️ **Setup automated database backups**
4. ⚠️ **Configure monitoring/alerting**
5. ⚠️ **Setup CI/CD pipeline (optional)**

---

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker compose logs -f`
3. Verify environment variables in `.env` files
4. Check database connectivity
5. Ensure all ports are available

---

## 📝 License

[Your License Here]

---

**Last Updated:** January 30, 2026  
**Maintained By:** Development Team  
**Version:** 2.0.0
