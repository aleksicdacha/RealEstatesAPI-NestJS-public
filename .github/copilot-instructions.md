# Real Estate Platform - AI Coding Instructions

## Architecture Overview

This is a **Turborepo monorepo** with three main applications sharing common packages:
- `apps/api` - NestJS 10 REST API (port 3000)
- `apps/admin-web` - Next.js 15 admin panel with PrimeReact (port 3001)
- `apps/user-web` - Next.js 15 public website with next-intl i18n (port 3002)
- `packages/*` - Shared TypeScript types, API client, and utilities

**Database**: PostgreSQL with TypeORM, custom Repository pattern (not DataSource pattern)
**Stack**: TypeScript throughout, PostgreSQL, Redis (optional), Docker Compose for local dev

## Development Workflow

### Running the Stack
```bash
# All apps with Turborepo
npm run dev

# Individual apps
npm run dev:api    # NestJS on :3000
npm run dev:admin  # Admin panel on :3001
npm run dev:user   # Public site on :3002

# Docker (includes PostgreSQL + Redis)
npm run docker:up
```

### Database Operations
```bash
cd apps/api

# Migrations (TypeORM legacy CLI)
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Seeding (custom scripts in seeds/)
npm run seed        # Run final-seed.ts
npm run seed:users  # Individual seed files
```

**Important**: Migrations use TypeORM CLI, not NestJS CLI. Run from `apps/api` directory.

## Critical Conventions

### Backend (NestJS)

#### Repository Pattern
- **Custom repositories** extend TypeORM's `Repository<Entity>`, NOT DataSource pattern
- Inject via `@InjectRepository()` in modules, then use as provider
- Example: `PropertyRepository extends Repository<Property>`

#### Module Structure
```
entities/
  property/
    property.entity.ts        # TypeORM entity
    property.module.ts        # Feature module
    property.service.ts       # Business logic
    property.controller.ts    # Routes
    property.repository.ts    # Custom queries
    dto/                      # DTOs for requests/responses
```

#### Authentication & Authorization
- JWT-based auth with Passport
- Guards: `JwtAuthGuard`, `RolesGuard`
- **Note**: Many controllers have guards commented out (`// @UseGuards(JwtAuthGuard)`) - check before assuming routes are protected
- Role enum: `Role.ADMIN`, `Role.USER` in `auth/enums/role.enum.ts`

#### Public vs Admin API Split
- Admin endpoints: `/v1/properties` (full data including `salePrice`, `comment`, `client`)
- Public endpoints: `/v1/properties/public` (sanitized via `PublicPropertyDto`)
- **Critical**: Public API hides sensitive fields - see `SECURITY-PUBLIC-API.md`

### Frontend (Next.js)

#### User-Web Specifics
- **Next.js 15 App Router** with React Server Components
- **Internationalization**: next-intl (Serbian/English), messages in `messages/sr.json`, `messages/en.json`
- **API client**: `lib/api.ts` - always use public endpoints (`/properties/public`)
- **Google Maps**: `@react-google-maps/api` with `@googlemaps/markerclusterer`
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS 4.0 (PostCSS)

#### Admin-Web Specifics
- PrimeReact components (DataTable, Dialog, Toast)
- Image upload with cropping
- Full Property/Client/User CRUD

### Shared Packages

#### @repo/types
- Build first: `cd packages/types && npm run build`
- Shared interfaces for Property, Client, User, pagination
- Import as `import { Property } from '@repo/types'`

#### @repo/api-client
- Centralized API methods
- Not yet fully implemented across frontends

## Data Model Quirks

### Property Entity
- `guid` is the public identifier (UUIDv4 string), NOT `id` (auto-increment)
- `specialOffer` field (1-20): Order for featured properties on homepage
- `orientation`: ENUM (North, South, East, West, NorthEast, etc.)
- `images`: One-to-many with PropertyImage entity (has `order` and `isFavorite`)
- **Address privacy**: Public API shows only `neighborhood`, not full `address`

### Client Entity
- Represents property owners/sellers
- Has owner fields (`ownerName`, `ownerJmbg`, `ownerIdCardNumber`)
- Optional 1:1 Representative entity (zastupnik) - see `PROPERTY_CLIENT_EXTENSION_PLAN.md`

## Common Pitfalls

1. **Don't use NestJS CLI for migrations** - use TypeORM CLI commands from `apps/api/package.json`
2. **Check if guards are enabled** - many controllers have `// @UseGuards()` commented out
3. **Use public endpoints in user-web** - never call admin endpoints from public site
4. **Build shared packages** - if types change, rebuild `@repo/types` before running apps
5. **Port conflicts** - API (3000), Admin (3001), User (3002), PostgreSQL (5432)
6. **Workspace root vs app root** - some commands need `cd apps/api` first

## Key Files to Reference

- [turbo.json](turbo.json) - Monorepo build orchestration
- [apps/api/src/app.module.ts](apps/api/src/app.module.ts) - NestJS configuration (DB, i18n, throttling)
- [apps/user-web/lib/api.ts](apps/user-web/lib/api.ts) - Frontend API client with public DTOs
- [SECURITY-PUBLIC-API.md](SECURITY-PUBLIC-API.md) - Public/admin API separation
- [MONOREPO_README.md](MONOREPO_README.md) - Detailed monorepo structure
- [docker-compose.yml](docker-compose.yml) - Local development services

## Testing & Debugging

- Postman collection: `postman/Real-Estate-API.postman_collection.json`
- Test scripts: `test-login.js`, `test-upload.js`, `test-api-comprehensive.js` (run with Node.js)
- API logs: Check Docker logs with `npm run docker:logs` or terminal running `npm run dev:api`
