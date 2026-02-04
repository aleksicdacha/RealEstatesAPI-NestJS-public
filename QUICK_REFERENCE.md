# 🎯 Real Estate Platform - Quick Reference Card

## 🚀 Quick Start

```bash
# One command to set up everything:
./scripts/setup-local-dev.sh

# Start all apps:
npm run dev
```

## 📡 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| API Docs | http://localhost:3000/api | - |
| Admin Panel | http://localhost:3001 | admin / admin123 |
| Public Website | http://localhost:3002 | - |

## 🗄️ Database

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | estates |
| Username | postgres |
| Password | CHANGE_ME |

```bash
# Connect via CLI
docker exec -it estates_postgres psql -U postgres -d estates
```

## 🐳 Docker Commands

```bash
npm run docker:up        # Start PostgreSQL + Redis
npm run docker:down      # Stop services
npm run docker:logs      # View logs

docker-compose down -v   # Reset database (⚠️ deletes data)
```

## 💻 Development Commands

```bash
# Start all apps (Turborepo)
npm run dev

# Start individually
npm run dev:api          # API on port 3000
npm run dev:admin        # Admin on port 3001
npm run dev:user         # User on port 3002
```

## 🔄 Database Migrations

```bash
cd apps/api

# Generate migration after entity changes
npm run migration:generate -- src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npx typeorm migration:show -d src/data-source.ts
```

## 🌱 Database Seeding

```bash
cd apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

**Seeds:**
- 10 Users (admin, agents, managers)
- 15 Properties (all property types)
- 15 Clients (linked to properties)
- Property Images (from /uploads folder)

## 📋 Enum Values (All Lowercase)

### PropertyStatus
`active` | `inactive` | `deleted`

### PropertyType
`apartment` | `house` | `land` | `office` | `commercial-space` | `vacation-home` | `duplex` | `apartment-in-house`

### ClientStatus
`active` | `inactive` | `deleted`

### TransactionType
`seller` | `buyer` | `rents` | `rents-out`

### PaymentType
`cash` | `credit` | `combined`

### HeatingType
`central` | `gas-central` | `electric-central` | `floor` | `fireplace` | `air-conditioner` | `independent-on-gas` | `other`

## 🐛 Quick Fixes

### Reset Everything

```bash
docker-compose down -v
./scripts/setup-local-dev.sh
```

### Port Already in Use

```bash
sudo lsof -i :3000        # Find process
sudo kill -9 <PID>        # Kill it
```

### Database Connection Failed

```bash
docker exec estates_postgres pg_isready -U postgres
```

If not ready:
```bash
docker-compose down
docker-compose up -d postgres
# Wait 10 seconds
```

### Migration Failed

```bash
cd apps/api
npx typeorm migration:show -d src/data-source.ts
```

### Wrong Enum Values in DB

```bash
# Reset database
docker-compose down -v
docker-compose up -d
cd apps/api
npm run migration:run
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

## 🔍 Debugging

### View API Logs
Check terminal where `npm run dev:api` is running

### View Database Logs
```bash
docker logs estates_postgres
```

### View All Docker Logs
```bash
npm run docker:logs
```

### Query Database
```bash
docker exec -it estates_postgres psql -U postgres -d estates

# Inside psql:
\dt                           # List tables
\d properties                 # Describe table
SELECT * FROM users LIMIT 5;  # Query
\q                            # Quit
```

## 📁 File Locations

| File | Purpose |
|------|---------|
| `.env.development` | Docker environment (root) |
| `apps/api/.env` | API environment |
| `apps/api/src/entities/` | Database entities |
| `apps/api/src/migrations/` | Database migrations |
| `seeds/local-comprehensive-seed.ts` | Seeding script |
| `uploads/` | Property images |

## 🔐 Default Credentials (Local Only!)

| Service | Username | Password |
|---------|----------|----------|
| Admin Panel | admin | admin123 |
| Database | postgres | CHANGE_ME |

**⚠️ NEVER use these in production!**

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `LOCAL_DEVELOPMENT_GUIDE.md` | Complete setup guide |
| `scripts/SETUP_README.md` | Scripts reference |
| `.github/copilot-instructions.md` | Coding guidelines |
| `documentation/MONOREPO_README.md` | Architecture |
| `documentation/SECURITY-PUBLIC-API.md` | Security patterns |

## 🆘 Help

1. Check logs in terminal
2. Run `npm run docker:logs`
3. Check `/documentation/` folder
4. Reset: `docker-compose down -v && ./scripts/setup-local-dev.sh`

---

**Print this page for quick reference! 📄**
