# 🏗️ Local Development Environment - Complete Setup Guide

## Overview

This guide explains how to set up the complete Real Estate Platform for local development with **one command**. The setup includes PostgreSQL, Redis, NestJS API, and two Next.js frontends.

## Architecture

### Local Development Setup

```
┌─────────────────────────────────────────────────────────┐
│                   Your Computer                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🐳 Docker Containers:                                   │
│     ├── PostgreSQL (port 5432)                           │
│     └── Redis (port 6379)                                │
│                                                           │
│  💻 Running Locally (npm):                               │
│     ├── API (NestJS)         → http://localhost:3000    │
│     ├── Admin Web (Next.js)  → http://localhost:3001    │
│     └── User Web (Next.js)   → http://localhost:3002    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Why This Setup?

- **Docker for databases**: Easy setup, isolated, no conflicts
- **npm for apps**: Hot reload, fast development, easier debugging
- **Consistent enums**: All enum values use lowercase with kebab-case

## Prerequisites

1. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
2. **Node.js 20+** - [Download](https://nodejs.org/)
3. **npm 10+** - Comes with Node.js
4. **Git** - For cloning the repository

### Verify Installation

```bash
docker --version        # Should show Docker version
node --version          # Should show v20.x.x or higher
npm --version           # Should show 10.x.x or higher
```

## 🚀 Quick Start (Automated Setup)

### One-Command Setup

```bash
# Navigate to project root
cd /path/to/RealEstatesAPI-NestJS

# Run setup script
./scripts/setup-local-dev.sh
```

**That's it!** The script will:

1. ✅ Create `.env.development` file
2. ✅ Start PostgreSQL and Redis in Docker
3. ✅ Install all dependencies
4. ✅ Run database migrations
5. ✅ Seed database with sample data
6. ✅ Show you how to start the apps

**Time:** ~5-10 minutes (depending on internet speed)

### After Setup Completes

Start all apps at once:

```bash
npm run dev
```

Or start individually in separate terminals:

```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Admin Web
npm run dev:admin

# Terminal 3 - User Web
npm run dev:user
```

## 📋 Manual Setup (Step by Step)

If you prefer manual setup or the script fails:

### Step 1: Environment Configuration

Create `.env.development` at project root:

```bash
cat > .env.development << 'EOF'
NODE_ENV=development
PORT=3000

BASE_URL='http://localhost:3000'
FILE_UPLOAD_PATH=./uploads

JWT_SECRET=CHANGE_ME_DEV
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME_DEV
JWT_REFRESH_EXPIRES_IN=7d

DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
DB_SYNC=false

REDIS_HOST=localhost
REDIS_PORT=6379

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=Real Estate Admin <noreply@realestates.com>
FRONTEND_URL=http://localhost:3002

CORS_ORIGIN=http://localhost:3001,http://localhost:3002

GEMINI_API_KEY=your-gemini-api-key-here
EOF
```

### Step 2: Start Docker Services

```bash
# Start PostgreSQL and Redis
npm run docker:up

# Wait for PostgreSQL to be ready (about 10 seconds)
docker exec estates_postgres pg_isready -U postgres
```

### Step 3: Install Dependencies

```bash
# Install workspace dependencies
npm install

# Install API dependencies
cd apps/api && npm install && cd ../..

# Install admin-web dependencies
cd apps/admin-web && npm install && cd ../..

# Install user-web dependencies
cd apps/user-web && npm install && cd ../..
```

### Step 4: Run Migrations

```bash
cd apps/api
npm run migration:run
cd ../..
```

### Step 5: Seed Database

```bash
cd apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts
cd ../..
```

### Step 6: Start Applications

```bash
# All at once
npm run dev

# Or individually
npm run dev:api        # Terminal 1
npm run dev:admin      # Terminal 2
npm run dev:user       # Terminal 3
```

## 🗄️ Database Information

### Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** estates
- **Username:** postgres
- **Password:** CHANGE_ME

### Default Admin User

After seeding:

- **Username:** admin
- **Password:** admin123

### Seeded Data

The comprehensive seed creates:

- **10 Users**: Various roles (admin, agents, managers)
- **15 Properties**: Diverse types (apartments, houses, land, offices, etc.)
- **15 Clients**: Linked to properties with various transaction types
- **Property Images**: Auto-linked from `/uploads` folder if available

### Enum Values (Lowercase + Kebab-Case)

All enum values use consistent lowercase formatting:

**PropertyStatus:**
- `active`
- `inactive`
- `deleted`

**PropertyType:**
- `apartment`
- `house`
- `land`
- `office`
- `commercial-space`
- `vacation-home`
- `duplex`
- `apartment-in-house`

**HeatingType:**
- `central`
- `gas-central`
- `solid-fuel-central`
- `electric-central`
- `floor`
- `independent-on-gas`
- `independent-on-solid-fuel`
- `independent-on-electricity`
- `fireplace`
- `air-conditioner`
- `other`

**ClientStatus:**
- `active`
- `inactive`
- `deleted`

**TransactionType:**
- `seller`
- `buyer`
- `rents`
- `rents-out`

**PaymentType:**
- `cash`
- `credit`
- `combined`

## 🌐 Access URLs

After starting all services:

| Service | URL | Description |
|---------|-----|-------------|
| **API** | http://localhost:3000 | NestJS REST API |
| **API Docs** | http://localhost:3000/api | Swagger documentation |
| **Admin Panel** | http://localhost:3001 | PrimeReact admin interface |
| **Public Website** | http://localhost:3002 | Next.js public website |
| **PostgreSQL** | localhost:5432 | Database (use pgAdmin/DBeaver) |
| **Redis** | localhost:6379 | Cache (use Redis CLI) |

## 🔧 Common Development Tasks

### Database Migrations

```bash
# Generate migration after entity changes
cd apps/api
npm run migration:generate -- src/migrations/DescriptiveName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Reset Database

```bash
# Stop Docker services
npm run docker:down

# Start fresh (deletes all data)
docker-compose down -v
npm run docker:up

# Wait for PostgreSQL, then run migrations and seed
cd apps/api
npm run migration:run
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

### View Logs

```bash
# Docker services
npm run docker:logs

# API (if running in terminal)
# Just check the terminal where you ran `npm run dev:api`

# Database logs
docker logs estates_postgres
```

### Database CLI Access

```bash
# Connect to PostgreSQL
docker exec -it estates_postgres psql -U postgres -d estates

# Useful commands inside psql:
\dt                # List tables
\d properties      # Describe properties table
\d+ clients        # Detailed client table info
SELECT * FROM users LIMIT 5;
\q                 # Quit
```

### Stop Everything

```bash
# Stop apps (Ctrl+C in terminal where npm run dev is running)

# Stop Docker services
npm run docker:down

# Or stop and remove volumes (deletes database)
docker-compose down -v
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000, 3001, 3002, or 5432
sudo lsof -i :3000
sudo lsof -i :5432

# Kill the process
sudo kill -9 <PID>
```

### PostgreSQL Won't Start

```bash
# Check Docker is running
docker ps

# View PostgreSQL logs
docker logs estates_postgres

# Reset PostgreSQL
docker-compose down -v
docker-compose up -d postgres
```

### Migration Fails

```bash
# Check database connection
docker exec estates_postgres pg_isready -U postgres

# View migration status
cd apps/api
npx typeorm migration:show -d src/data-source.ts

# If stuck, reset and retry
npm run docker:down
docker-compose down -v
npm run docker:up
# Wait 10 seconds
npm run migration:run
```

### Enum Values Wrong Case

If database has old uppercase values:

```bash
# Connect to database
docker exec -it estates_postgres psql -U postgres -d estates

# Fix property types
UPDATE properties SET "propertyType" = LOWER(REPLACE("propertyType", 'Apartment', 'apartment'));
UPDATE properties SET "propertyType" = LOWER(REPLACE("propertyType", 'House', 'house'));
# ... or just reseed

# Or easier: Reset database
docker-compose down -v
docker-compose up -d
cd apps/api
npm run migration:run
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

### API Can't Connect to Database

Check `apps/api/.env`:

```env
DB_HOST=localhost  # Must be localhost, NOT postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates
```

### Hot Reload Not Working

```bash
# Restart the specific app
# Press Ctrl+C in terminal, then:
npm run dev:api    # or dev:admin or dev:user
```

## 📁 Project Structure

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/              # NestJS REST API
│   │   ├── src/
│   │   │   ├── entities/    # TypeORM entities
│   │   │   ├── migrations/  # Database migrations
│   │   │   └── ...
│   │   └── .env            # API environment (created manually)
│   ├── admin-web/        # Next.js admin panel
│   └── user-web/         # Next.js public website
├── seeds/
│   └── local-comprehensive-seed.ts  # Database seeding script
├── scripts/
│   ├── setup-local-dev.sh          # Automated local setup
│   └── setup-production.sh         # Production deployment
├── uploads/              # Property images
├── .env.development      # Docker environment
├── docker-compose.yml    # Local Docker config
├── package.json          # Workspace root
└── turbo.json           # Turborepo config
```

## 🔐 Security Notes (Local Dev)

- Default credentials are **ONLY** for local development
- Never use these in production:
  - Database password: `CHANGE_ME`
  - JWT secrets: Use the provided long strings
  - Admin password: `admin123`

For production, use strong random values:

```bash
# Generate strong secrets
openssl rand -base64 48   # For JWT secrets
openssl rand -base64 16   # For passwords
```

## 📚 Next Steps

After setup:

1. **Explore API**: http://localhost:3000/api (Swagger docs)
2. **Login to Admin**: http://localhost:3001 (admin/admin123)
3. **View Public Site**: http://localhost:3002
4. **Create Content**: Add properties, clients, users via admin panel
5. **Test API**: Use Postman collection in `/postman/` directory
6. **Read Docs**: Check `/documentation/` for detailed guides

## 📖 Additional Documentation

- `/.github/copilot-instructions.md` - Development guidelines
- `/documentation/MONOREPO_README.md` - Architecture details
- `/documentation/SECURITY-PUBLIC-API.md` - API security patterns
- `/documentation/CHATBOT_GUIDE.md` - Chatbot setup
- `/scripts/SETUP_README.md` - Scripts reference

## 🆘 Need Help?

1. Check `/documentation/` directory
2. Review error logs in terminal
3. Check Docker logs: `npm run docker:logs`
4. Reset everything: `docker-compose down -v && ./scripts/setup-local-dev.sh`
5. Review `AI_PROJECT_CONTEXT.md`

---

**Happy Coding! 🚀**
