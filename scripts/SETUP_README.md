# Scripts Directory - Local Development & Production Deployment

This directory contains automation scripts for development, deployment, and maintenance of the Real Estate Platform.

## 🚀 Quick Start Scripts

### Local Development Setup

**`setup-local-dev.sh`** ⭐ - Complete local development environment setup

```bash
./scripts/setup-local-dev.sh
```

**What it does:**
- ✅ Creates `.env.development` if missing
- ✅ Cleans up existing Docker containers
- ✅ Starts Docker services (PostgreSQL + Redis only)
- ✅ Installs all dependencies (workspace + apps)
- ✅ Runs all database migrations
- ✅ Seeds database with 10+ items per entity (Users, Properties, Clients, Images)
- ✅ Displays configuration summary with credentials

**After running:** Start apps with:
```bash
npm run dev              # All apps via Turborepo
# OR individually:
npm run dev:api          # API on port 3000
npm run dev:admin        # Admin Web on port 3001  
npm run dev:user         # User Web on port 3002
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

### Production Deployment

**`setup-production.sh`** ⭐ - Complete production deployment via Docker

```bash
./scripts/setup-production.sh
```

**What it does:**
- ✅ Checks prerequisites (Docker, Docker Compose)
- ✅ Builds production Docker images (all apps)
- ✅ Starts all services in Docker (PostgreSQL, Redis, API, Admin-Web, User-Web)
- ✅ Waits for database to be ready
- ✅ Runs database migrations
- ✅ Optional database seeding
- ✅ Displays security checklist

**Requirements:**
- `.env.production` file with production settings
- Docker and Docker Compose installed
- Reverse proxy (Nginx/Caddy) for SSL/HTTPS

---

## 📊 Database Management

### Migrations

```bash
# Generate new migration based on entity changes
cd apps/api
npm run migration:generate -- src/migrations/DescriptiveName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npx typeorm migration:show -d src/data-source.ts
```

### Seeding

**Local comprehensive seed:**
```bash
cd apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

**What gets seeded:**
- 10 Users (admin, agents, managers) - all lowercase roles
- 15 Properties (diverse types: apartment, house, land, office, etc.) - lowercase enum values
- 15 Clients (linked to properties) - lowercase statuses and types
- Property Images (linked from `/uploads` folder if available)

**All enum values use lowercase with kebab-case:**
- PropertyStatus: `active`, `inactive`, `deleted`
- PropertyType: `apartment`, `house`, `land`, `office`, `commercial-space`, `vacation-home`, `duplex`, `apartment-in-house`
- HeatingType: `central`, `gas-central`, `electric-central`, `floor`, etc.
- ClientStatus: `active`, `inactive`, `deleted`
- TransactionType: `seller`, `buyer`, `rents`, `rents-out`
- PaymentType: `cash`, `credit`, `combined`

---

## 🔧 Environment Configuration

### Local Development (`.env.development`)

Located at project root. Used by Docker Compose.

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

### API Environment (`apps/api/.env`)

Located in `apps/api/`. Used by NestJS when running locally.

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
JWT_SECRET=estates_jwt_secret_key_min_32_characters_long_2026
PORT=3000
```

### Production (`.env.production`)

**⚠️ SECURITY CRITICAL - Never commit this file!**

```env
NODE_ENV=production
DB_HOST=postgres  # Docker internal network
DB_PASSWORD=STRONG_RANDOM_PASSWORD
JWT_SECRET=MIN_64_CHARS_RANDOM_STRING
CORS_ORIGIN=https://admin.yourdomain.com,https://yourdomain.com
```

---

## 🐳 Docker Architecture

### Local Development
**Docker Compose:** `docker-compose.yml`

Services running in Docker:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)

Services running locally (via npm):
- ✅ API (port 3000) - hot reload enabled
- ✅ Admin Web (port 3001) - hot reload enabled
- ✅ User Web (port 3002) - hot reload enabled

**Why?** Hot reload for frontend/backend development.

### Production
**Docker Compose:** `docker-compose.prod.yml`

All services in Docker:
- ✅ PostgreSQL (internal network)
- ✅ Redis (internal network)
- ✅ API (port 3000)
- ✅ Admin Web (port 3001)
- ✅ User Web (port 3002)

**Why?** Isolation, scalability, easy deployment.

---

## 📦 Common Commands

### Development

```bash
# Start all services (Turborepo parallel)
npm run dev

# Start individual services
npm run dev:api        # NestJS API
npm run dev:admin      # Next.js Admin Panel
npm run dev:user       # Next.js Public Website

# Docker services
npm run docker:up      # Start PostgreSQL + Redis
npm run docker:down    # Stop services
npm run docker:logs    # View logs
```

### Production

```bash
# Build all apps
npm run build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f api

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api

# Stop all
docker-compose -f docker-compose.prod.yml down
```

---

## 🔒 Security Scripts

### `ssh-harden.sh`
Hardens SSH configuration for production servers.

### `server-security-audit.sh`
Performs comprehensive security audit.

### `malware-scan.sh`
Scans for malware and suspicious files.

### `ddos-detection.sh`
Monitors for DDoS attack patterns.

---

## 🛠️ Maintenance Scripts

### `verify-system.sh`
Verifies system health and configuration.

### `verify-enum-casing.sh`
Checks database enum values for correct lowercase casing.

### `verify-data.sh`
Verifies database data integrity.

### `cleanup-obsolete.sh`
Removes obsolete files and dependencies.

---

## 🧪 Testing Scripts

### `test-public-endpoint.sh`
Tests public API endpoints (sanitized data).

### `test-client-transaction-filter.sh`
Tests client transaction type filtering.

### Test files (run with Node.js)

```bash
# From project root
node test-login.js                    # Auth endpoints
node test-upload.js                   # File upload
node test-api-comprehensive.js        # Full API test
node test-public-api.js               # Public endpoints only
```

---

## ❗ Troubleshooting

### PostgreSQL won't start

```bash
# Check logs
docker-compose logs postgres

# Reset database (⚠️ deletes data)
docker-compose down -v
docker-compose up -d postgres
```

### Migration fails

```bash
# Check connection
docker exec estates_postgres pg_isready -U postgres

# View migration history
cd apps/api
npx typeorm migration:show -d src/data-source.ts

# Manually run SQL if needed
docker exec -it estates_postgres psql -U postgres -d estates
```

### Enum casing issues

Database has old uppercase values but code expects lowercase.

```bash
# Option 1: Run enum fix script
./scripts/verify-enum-casing.sh

# Option 2: Manual SQL fix
docker exec -it estates_postgres psql -U postgres -d estates
UPDATE properties SET "propertyType" = LOWER("propertyType");
UPDATE properties SET status = LOWER(status);
UPDATE clients SET status = LOWER(status);
```

### Port already in use

```bash
# Find what's using the port
sudo lsof -i :3000
sudo lsof -i :5432

# Kill the process
sudo kill -9 <PID>
```

### Docker disk space

```bash
# Remove unused images/containers
docker system prune -a

# Remove volumes (⚠️ deletes data)
docker volume prune
```

---

## 📚 Best Practices

### 1. Backup Before Production Deploy

```bash
# Backup database
docker exec estates_postgres_prod pg_dump -U postgres estates > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
docker exec -i estates_postgres_prod psql -U postgres estates < backup.sql
```

### 2. Test Migrations Locally First

```bash
# Always test locally
npm run migration:run

# Check what changed
docker exec -it estates_postgres psql -U postgres -d estates
\dt  # List tables
\d properties  # Describe table
```

### 3. Strong Production Secrets

Generate with:
```bash
# JWT Secret (64 chars)
openssl rand -base64 48

# Database Password (16 chars)
openssl rand -base64 12
```

### 4. Monitor Production Logs

```bash
# Tail all services
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Only API errors
docker-compose -f docker-compose.prod.yml logs -f api | grep ERROR
```

### 5. Regular Security Updates

```bash
# Update Docker images
docker-compose pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📖 Documentation References

- `/documentation/MONOREPO_README.md` - Architecture overview
- `/documentation/SECURITY-PUBLIC-API.md` - API security patterns
- `/documentation/CHATBOT_GUIDE.md` - Chatbot setup
- `/documentation/DEPLOYMENT_MASTER_GUIDE.md` - Production deployment
- `/.github/copilot-instructions.md` - Development guidelines

---

## 🆘 Support

For issues:
1. Check `/documentation/` directory
2. Review error logs: `docker-compose logs`
3. Check GitHub Issues
4. Review `AI_PROJECT_CONTEXT.md`
