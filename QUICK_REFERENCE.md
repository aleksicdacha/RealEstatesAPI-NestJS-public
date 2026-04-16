# Quick Reference

## Setup

```bash
./fresh-start.sh              # Interactive (Docker or manual)
./fresh-start.sh docker       # Docker DB mode
./fresh-start.sh manual       # Local PostgreSQL mode
```

## Start

```bash
npm run dev                   # All apps (Turborepo)
npm run dev:api               # API only (:3000)
npm run dev:admin             # Admin only (:3001)
npm run dev:user              # User web only (:3002)
```

## URLs

| Service | URL | Auth |
|---------|-----|------|
| API | http://localhost:3000 | — |
| Swagger | http://localhost:3000/api | — |
| Admin | http://localhost:3001 | admin / admin123 |
| User Web | http://localhost:3002 | — |

## Docker

```bash
npm run docker:up             # Start PostgreSQL + Redis
npm run docker:down           # Stop
npm run docker:logs           # View logs
docker compose down -v        # Reset DB (deletes data!)
```

## Database

```bash
# Seed (from project root)
npm run seed

# Migrations (from apps/api/)
cd apps/api
npm run migration:generate -- src/migrations/Name
npm run migration:run
npm run migration:revert

# CLI access
docker exec -it estates_postgres psql -U postgres -d estates
```

## Build

```bash
npm run build                        # All apps
cd packages/types && npm run build   # Shared types (after interface changes)
```

## Reset Everything

```bash
docker compose down -v        # Wipe DB
npm run docker:up             # Restart containers
npm run seed                  # Re-seed all data
```

## Enums

| Enum | Values |
|------|--------|
| PropertyType | `apartment` `house` `apartment-in-house` `office` `commercial-space` `land` `vacation-home` `duplex` |
| PropertyStatus | `active` `inactive` `deleted` |
| HeatingType | `central` `gas-central` `solid-fuel-central` `electric-central` `floor` `independent-on-gas` `independent-on-solid-fuel` `independent-on-electricity` `fireplace` `air-conditioner` `other` |
| Orientation | `north` `south` `east` `west` `northeast` `northwest` `southeast` `southwest` |
| TransactionType | `seller` `buyer` `rents` `rents-out` |
| PaymentType | `cash` `credit` `combined` |
| ClientStatus | `active` `inactive` `deleted` |
| Role | `ADMIN` `USER` |

## Seed Data

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 5 | 2 admin, 3 agent |
| Properties | 15 | All 8 PropertyTypes, all 3 statuses |
| Images | ~40 | 2-4 per property |
| Clients | 8 | All TransactionTypes, PaymentTypes, ClientStatuses |
| Representatives | 2 | Linked to clients |
| Newsletter | 3 | 2 active, 1 unsubscribed |

## Troubleshooting

```bash
# Port in use
sudo lsof -i :3000

# DB not ready
docker exec estates_postgres pg_isready -U postgres

# Types package missing
cd packages/types && npm run build

# Full reset
docker compose down -v && npm run docker:up && npm run seed
```

## File Locations

| File | Purpose |
|------|---------|
| `apps/api/.env` | API environment (not committed) |
| `apps/api/src/entities/` | TypeORM entities |
| `apps/api/src/migrations/` | Database migrations |
| `seeds/seed.ts` | Canonical seed script |
| `fresh-start.sh` | One-command setup |
| `ecosystem.config.js` | PM2 production config |
| `.github/AGENTS.md` | Living project context |

## Deploy

```bash
# Production Docker
docker compose -f docker-compose.prod.yml up -d

# PM2
npm run build && pm2 start ecosystem.config.js

# Via deploy playbook (from portfolio/deploy/)
./deploy-playbook.sh deploy-realestate
```
