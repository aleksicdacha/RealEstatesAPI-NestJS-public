# Local Development Guide

Complete guide for setting up, developing, and deploying the Real Estate Platform.

## Architecture

```
Docker Containers:
  PostgreSQL (port 5432)
  Redis (port 6379)

Running via npm:
  API (NestJS)         → http://localhost:3000
  Admin Web (Next.js)  → http://localhost:3001
  User Web (Next.js)   → http://localhost:3002
```

Databases run in Docker (or locally). Apps run via npm for hot reload.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| Docker | Latest | `docker -v` (for Docker mode) |
| PostgreSQL | 16+ | `psql --version` (for manual mode) |

---

## Quick Start (One Command)

```bash
# Interactive — choose Docker or manual DB mode:
./fresh-start.sh

# Or specify directly:
./fresh-start.sh docker     # PostgreSQL + Redis in Docker
./fresh-start.sh manual     # Use local PostgreSQL

# Skip npm install if deps are already current:
./fresh-start.sh docker --skip-install
```

The script will:
1. Check prerequisites (Node 20+, Docker/psql)
2. Create `apps/api/.env` if missing (with safe dev defaults)
3. Install dependencies + build shared packages
4. Start PostgreSQL + Redis (Docker or verify local)
5. Seed all tables (users, properties, images, clients, representatives, subscribers)
6. Report completion with login credentials and URLs

After completion:

```bash
npm run dev    # Starts API + Admin + User via Turborepo
```

---

## Manual Setup (Step by Step)

If you prefer manual control or the script fails.

### 1. Environment File

Create `apps/api/.env`:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your-password>
DB_NAME=estates
JWT_SECRET=<min-32-chars>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<min-32-chars>
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
FRONTEND_URL=http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

Optional (for full features):
```env
GEMINI_API_KEY=<key>           # Chatbot (has fallback without it)
SMTP_HOST=smtp.gmail.com       # Email
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<app-password>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<key>  # Google Maps
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<key>   # reCAPTCHA
RECAPTCHA_SECRET_KEY=<key>
```

### 2. Start Database

**Docker mode:**
```bash
npm run docker:up                  # Starts postgres + redis
# Wait for PostgreSQL:
docker exec estates_postgres pg_isready -U postgres
```

**Manual mode:**
```bash
sudo systemctl start postgresql    # Start PostgreSQL
createdb estates                   # Create database
psql -d estates -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

### 3. Install Dependencies

```bash
npm install                        # Root + all workspaces
cd packages/types && npm run build # Build shared types
cd ../..
```

### 4. Seed Database

```bash
npm run seed
```

This runs `seeds/seed.ts` which:
- Auto-creates all tables (`synchronize: true`)
- Seeds 5 users (2 admin, 3 agent)
- Seeds 15 properties covering all `PropertyType` values
- Seeds 40+ property images
- Seeds 8 clients covering all `TransactionType`, `PaymentType`, `ClientStatus` values
- Seeds 2 representatives
- Seeds 3 newsletter subscribers

### 5. Start Apps

```bash
# All at once:
npm run dev

# Or individually in separate terminals:
npm run dev:api      # API on :3000
npm run dev:admin    # Admin on :3001
npm run dev:user     # User on :3002
```

---

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | — |
| Swagger | http://localhost:3000/api | — |
| Admin Panel | http://localhost:3001 | admin / admin123 |
| Public Website | http://localhost:3002 | — |

---

## Development Commands

```bash
# Start/stop
npm run dev                  # All apps (Turborepo parallel)
npm run dev:api              # API only
npm run dev:admin            # Admin only
npm run dev:user             # User web only
npm run docker:up            # Start Docker DB + Redis
npm run docker:down          # Stop Docker services

# Build
npm run build                # Build all apps
cd packages/types && npm run build   # Rebuild shared types (after interface changes)

# Database
cd apps/api
npm run migration:generate -- src/migrations/DescriptiveName
npm run migration:run
npm run migration:revert

# Seed
npm run seed                 # From project root — comprehensive seed

# Logs
npm run docker:logs          # Docker container logs
docker logs estates_postgres # PostgreSQL logs only

# Database CLI
docker exec -it estates_postgres psql -U postgres -d estates
```

---

## Database Reset

```bash
# Docker mode — full reset:
docker compose down -v       # Remove volumes (deletes all data)
npm run docker:up            # Restart containers
npm run seed                 # Re-seed

# Quick re-seed (keeps containers, truncates + re-seeds):
npm run seed
```

---

## Enum Reference

All enums use lowercase/kebab-case values in the database.

| Enum | Values |
|------|--------|
| **PropertyType** | `apartment`, `house`, `apartment-in-house`, `office`, `commercial-space`, `land`, `vacation-home`, `duplex` |
| **PropertyStatus** | `active`, `inactive`, `deleted` |
| **HeatingType** | `central`, `gas-central`, `solid-fuel-central`, `electric-central`, `floor`, `independent-on-gas`, `independent-on-solid-fuel`, `independent-on-electricity`, `fireplace`, `air-conditioner`, `other` |
| **Orientation** | `north`, `south`, `east`, `west`, `northeast`, `northwest`, `southeast`, `southwest` |
| **TransactionType** | `seller`, `buyer`, `rents`, `rents-out` |
| **PaymentType** | `cash`, `credit`, `combined` |
| **ClientStatus** | `active`, `inactive`, `deleted` |
| **Role** | `ADMIN`, `USER` |

---

## Deployment to Hetzner

### Prerequisites on Server

- Ubuntu 24.04, Docker, Node.js 20+, PM2, Nginx
- SSL certificates (Let's Encrypt)
- Required env files on server (never committed to git):
  - `apps/api/.env` (production DB credentials, JWT secrets)
  - `apps/admin-web/.env.production`
  - `apps/user-web/.env.production`

### Production Docker

```bash
# Start full stack (API + DB + Redis + Frontends):
docker compose -f docker-compose.prod.yml up -d

# Check health:
docker compose -f docker-compose.prod.yml ps
```

All production ports are bound to `127.0.0.1` — Nginx handles external access.

### PM2 Deployment (Current Setup)

The platform uses PM2 for process management on the server:

```bash
# Build everything
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 status
pm2 logs realestates-api
```

PM2 config (`ecosystem.config.js`): 3 processes — api, admin, user — with 450MB memory limit, crash recovery, auto-restart.

### CI/CD (GitHub Actions)

Push to `develop` branch triggers automatic deployment:
1. SSH into server
2. `git pull`
3. `docker compose up -d` (postgres + redis)
4. `npm ci` + build packages + build apps
5. Run migrations
6. PM2 restart all
7. Health check

Required GitHub Secrets: `HETZNER_HOST`, `HETZNER_USERNAME`, `HETZNER_SSH_KEY`

### Deployment Orchestration

All projects are deployed via the portfolio deploy playbook:

```bash
# From portfolio/deploy/
./deploy-playbook.sh deploy-realestate    # Deploy real estate platform
./deploy-playbook.sh run-migrations       # Run DB migrations
./deploy-playbook.sh test                 # Health check
./deploy-playbook.sh status               # PM2 + Docker status
```

### Production Port Mapping

| Service | Internal | External (via Nginx) |
|---------|----------|---------------------|
| API | :3000 | :8090 |
| Admin | :3001 | :8081 |
| User Web | :3002 | :8082 |
| PostgreSQL | :5432 | Internal only |
| Redis | :6379 | Internal only |

### Generate Production Secrets

```bash
openssl rand -base64 48    # JWT secrets
openssl rand -base64 16    # Database password
```

---

## Troubleshooting

### Port in use
```bash
sudo lsof -i :3000 && sudo kill -9 $(sudo lsof -t -i :3000)
```

### PostgreSQL won't start
```bash
docker logs estates_postgres
docker compose down -v && npm run docker:up
```

### Migration fails
```bash
cd apps/api
npx typeorm migration:show -d src/data-source.ts
# If stuck, reset: docker compose down -v, then docker:up + seed
```

### API can't connect to DB
Verify `apps/api/.env` has `DB_HOST=localhost` (not `postgres` — that's only inside Docker network).

### Shared types not found
```bash
cd packages/types && npm run build
```

---

## Project Structure

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/                 NestJS REST API
│   │   ├── src/entities/    TypeORM entities
│   │   ├── src/migrations/  Database migrations
│   │   └── .env             API config (not committed)
│   ├── admin-web/           Next.js admin panel
│   └── user-web/            Next.js public website
├── packages/
│   ├── types/               Shared TypeScript interfaces
│   ├── api-client/          API methods (partial)
│   └── utils/               Shared utilities
├── seeds/
│   └── seed.ts              Canonical seed script
├── fresh-start.sh           One-command setup
├── docker-compose.yml       Dev Docker (postgres + redis)
├── docker-compose.prod.yml  Production Docker (full stack)
├── ecosystem.config.js      PM2 configuration
├── turbo.json               Turborepo config
└── .github/
    ├── AGENTS.md            Living project context
    └── copilot-instructions.md  AI coding instructions
```
