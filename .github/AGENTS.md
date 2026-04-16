# Real Estate Platform — Project Context & Change Log

> **Purpose**: Living document that AI agents and developers scan at the start of every session.
> Contains the **complete project context**, architecture decisions, data model, security rules,
> infrastructure details, and a running log of every significant modification.
>
> **Rule**: Always **append** new changes to the Change Log at the bottom — never overwrite history.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | Olymp Real Estates Platform |
| **Repo** | `aleksicdacha/RealEstatesAPI-NestJS` |
| **Type** | Turborepo monorepo (TypeScript strict) |
| **Owner** | Dalibor Aleksić (`aleksic.dacha@gmail.com`) |
| **Domain** | Real estate agency management — Nis, Serbia |
| **Production** | https://www.olymp-nekretnine.co.rs |
| **Server** | Hetzner VPS `46.224.231.217` (Ubuntu 24.04) |

---

## 2. Architecture

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/            → NestJS 10 REST API (:3000)
│   ├── admin-web/      → Next.js 15 + PrimeReact admin panel (:3001)
│   └── user-web/       → Next.js 15 + next-intl i18n public site (:3002)
├── packages/
│   ├── types/          → Shared TypeScript interfaces (MUST build before use)
│   ├── api-client/     → Centralized API methods (partial)
│   └── utils/          → Shared utility functions
├── seeds/              → TypeScript & SQL seed scripts
├── scripts/            → Setup, deploy, verify shell scripts
├── documentation/      → Essential guides only (cleaned Apr 2026)
└── .github/
    ├── AGENTS.md       → THIS FILE — living project context
    ├── copilot-instructions.md → AI coding instructions
    └── workflows/      → GitHub Actions CI/CD
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS 10, TypeORM, PostgreSQL 16, Redis 7 |
| Frontend (admin) | Next.js 15, React 18, PrimeReact, TypeScript |
| Frontend (public) | Next.js 15, React 18, Tailwind CSS, next-intl (SR/EN) |
| Build | Turborepo, npm workspaces |
| AI | Google Gemini Pro (chatbot with fallback mode) |
| Deployment | Docker Compose, PM2, Nginx, GitHub Actions |

---

## 3. Critical Rules (Must-Know)

### 3.1 Custom Repository Pattern
Repositories extend `Repository<Entity>` and inject `DataSource` in the constructor.
**Never use `@InjectRepository()`** — provide custom repository as a regular NestJS service.

```typescript
// Canonical example: apps/api/src/entities/property/property.repository.ts
@Injectable()
export class PropertyRepository extends Repository<Property> {
  constructor(private dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }
}
```

Register in module as a provider (not via `TypeOrmModule.forFeature()` inject):
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage])],
  providers: [PropertyService, PropertyRepository, PropertyImageRepository],
  exports: [PropertyService, PropertyRepository]
})
```

### 3.2 Public vs Admin API Security

| Field | Admin `/v1/properties` | Public `/v1/properties/public` |
|-------|----------------------|-------------------------------|
| `price` | ✅ | ✅ |
| `salePrice` | ✅ | ❌ Hidden — internal agency price |
| `address` | ✅ | ❌ Hidden — only `neighborhood` shown |
| `comment` | ✅ | ❌ Hidden — internal notes |
| `client` | ✅ Full object | ❌ Hidden — owner privacy |
| `createdAt/updatedAt` | ✅ | ❌ Hidden — admin metadata |
| Images, description, area, type, status | ✅ | ✅ |

- Service uses `transformToPublicDto()` to explicitly map only allowed fields
- `apps/user-web` **MUST NEVER** call admin endpoints — only `/v1/properties/public`
- See `documentation/SECURITY-PUBLIC-API.md` for full implementation details

### 3.3 Property Identifiers
| Identifier | Type | Usage |
|------------|------|-------|
| `id` | Auto-increment UUID PK | Internal only — **never expose in URLs or API responses** |
| `guid` | UUIDv4 string | Public identifier for URLs, API responses, frontend routing |
| `code` | Unique string (e.g. "NIS-001") | Human-readable reference for agents/admin |

### 3.4 Shared Packages
After changing any interface in `packages/types`:
```bash
cd packages/types && npm run build
```
This affects all three apps — they import from `@repo/types`.

### 3.5 Code Style
- TypeScript strict — no `any`
- `const` over `let`, never `var`
- No unnecessary comments or docstrings
- Delete unused code, don't comment it out
- Small focused functions

---

## 4. Data Model

### Property Entity
```
id              UUID PK (internal)
code            String UNIQUE (e.g. "NIS-001")
propertyType    ENUM: apartment | house | land | office | commercial-space | vacation-home | duplex | apartment-in-house
status          ENUM: active | inactive | deleted
price           Decimal (public listing price)
salePrice       Decimal (internal agency price — HIDDEN from public)
area            Float (m²)
address         String (HIDDEN from public)
neighborhood    String (district — shown publicly)
lat, lon        Float (map coordinates)
description     Text
comment         Text (internal notes — HIDDEN from public)
elevator        Boolean
additionalEquipment  JSONB array
constructionYear     Integer
bathrooms, floor     Integer
roomStructure   String (jednosoban, dvosoban, etc.)
heating         ENUM: central | gas-central | electric-central | floor | fireplace | air-conditioner | independent-on-gas | other
orientation     ENUM: North | South | East | West | NorthEast | NorthWest | SouthEast | SouthWest
contractNumber  String
cadastralParcel String
cadastralMunicipality String
youtubeUrl      String (validated)
specialOffer    Integer 1-20 (lower = higher priority on homepage)
createdAt       Timestamp
updatedAt       Timestamp
→ images[]      OneToMany PropertyImage (cascade, eager)
→ client        OneToOne Client (nullable)
```

### Client Entity
```
id              UUID PK
status          ENUM: active | inactive | deleted
name            Text (required)
address         Text
email           Text (unique if provided)
phone           Text (required)
transactionType ENUM: seller | buyer | rents | rents-out
paymentType     ENUM: cash | credit | combined
comment         Text (internal notes)
moneyAmount     Decimal
ownerJmbg       String (13 digits, validated)
ownerBirthplace Text
ownerIdCardNumber    String
ownerIdCardIssuePlace Text
→ property      OneToOne Property (onDelete: SET NULL, cascade, eager)
→ representative OneToOne Representative (cascade, eager, nullable)
```

### User Entity
```
JWT authentication, bcrypt password hashing
Roles: ADMIN, USER
```

### PropertyImage Entity
```
→ property      ManyToOne Property
order           Integer (display order)
isFavorite      Boolean (cover image)
url             String
```

### NewsletterSubscriber
```
HTML content with sanitize-html XSS protection
Allowed tags: h1-h6, p, div, span, strong, em, ul, ol, li, a, img, table
Email via Nodemailer with HTML templates
```

---

## 5. API Module Structure

Root module (`apps/api/src/app.module.ts`) configures:

- **ConfigModule**: Joi validation via `common/config/validation.schema.ts`, loads `.env.local` and `.env`
- **TypeORM**: PostgreSQL async config, auto-load entities, retry 3 attempts / 5s delay
- **I18n**: `nestjs-i18n`, fallback English, resolvers: query `lang`, Accept-Language, X-Lang header
- **Rate Limiting (Throttler)**: 4 tiers — default (200/60s), short (10/1s), medium (50/10s), long (100/60s)
- **Feature Modules**: Auth, User, Property, PropertyImage, Client, Upload, Chatbot, AgentChat, Email, Contact, NewsletterSubscriber
- **Middleware**: OptionsMiddleware on all routes

### Module Pattern
```
entities/{feature}/
  {feature}.module.ts        → TypeOrmModule.forFeature() + providers
  {feature}.service.ts       → Business logic, uses custom repository
  {feature}.controller.ts    → Routes, DTOs, guards
  {feature}.repository.ts    → Extends Repository<Entity>
  dto/                       → CreateDto, UpdateDto, FilterDto, PublicDto
  enums/                     → TypeScript enums
```

---

## 6. Frontend Details

### user-web (Public Website)
- Next.js 15 App Router with React Server Components
- **i18n**: next-intl, middleware routing `matcher: ['/', '/(sr|en)/:path*']`
- **Messages**: `messages/sr.json`, `messages/en.json`
- **API client**: `lib/api.ts` — calls ONLY `/properties/public` endpoints
- **Maps**: `@react-google-maps/api` + `@googlemaps/markerclusterer`
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS v3 with brand colors in `tailwind.config.ts`
  - Change brand color: edit `brand` object hex values in `tailwind.config.ts`
  - Classes: `bg-brand-600`, `text-brand-700`, `hover:bg-brand-700`
- **Font**: `app/config/fonts.ts` using next/font/google (Inter)

### admin-web (Admin Panel)
- Next.js 15 + PrimeReact components (DataTable, Dialog, Toast, FileUpload)
- Full CRUD for Property, Client, User
- Image upload with cropping
- Uses admin endpoints with full data access

---

## 7. Infrastructure & Deployment

### Server Setup
| Component | Detail |
|-----------|--------|
| Server | Hetzner VPS `46.224.231.217` (Ubuntu 24.04) |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| SSL | Let's Encrypt (managed by nginx) |
| Security | fail2ban, UFW firewall, SSH key-only, ClamAV, rkhunter |
| Daily scans | `portfolio/deploy/server-hardening/daily-security-scan.sh` |

### CI/CD (GitHub Actions)
- **Trigger**: Push to `develop` branch OR manual dispatch
- **Process**: SSH into server → git pull → docker up → npm ci → build packages → build apps → migrations → PM2 restart → health check
- **Required Secrets**: `HETZNER_HOST`, `HETZNER_USERNAME`, `HETZNER_SSH_KEY`
- **Required server files**: `apps/api/.env`, `apps/admin-web/.env.production`, `apps/user-web/.env.production`

### Deployment Orchestration
All 3 projects (portfolio, realestate, paper-rock-scissors) are deployed from:
```
portfolio/deploy/deploy-playbook.sh <phase>
```
Phases: `github-setup`, `server-bootstrap`, `deploy-portfolio`, `deploy-nginx`, `deploy-realestate`, `run-migrations`, `test`, `scan`, `status`, `logs`

### Nginx Configs
Located in `portfolio/deploy/nginx/sites-available/`:
- `portfolio.conf` — Angular SPA
- `realestate.conf` — RealEstate platform (API + Admin + User)
- `rps.conf` — Paper Rock Scissors game

### Port Mapping
| Service | Local Dev | Production (behind Nginx) |
|---------|-----------|--------------------------|
| API | :3000 | :8090 |
| Admin | :3001 | :8081 |
| User Web | :3002 | :8082 |
| PostgreSQL | :5432 | :5432 (internal) |
| Redis | :6379 | :6379 (internal) |

---

## 8. Environment Variables

### Backend (`apps/api/.env`)
```env
DB_HOST=localhost          # 'postgres' inside Docker network
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<secret>
DB_NAME=estates            # estates_prod in production
JWT_SECRET=<min 32 chars, 64+ recommended>
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=<secret>
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=<optional>  # Chatbot has fallback without it
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=<email>
MAIL_PASSWORD=<app-password>
```

### Frontend (`apps/user-web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<key>
```

---

## 9. Development Commands

```bash
# Start everything
npm run dev                              # Turborepo parallel: API + Admin + User

# Individual apps
npm run dev:api                          # NestJS on :3000
npm run dev:admin                        # Next.js admin on :3001
npm run dev:user                         # Next.js public on :3002

# Docker (PostgreSQL + Redis)
npm run docker:up
npm run docker:down
npm run docker:logs

# Database
cd apps/api
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert
npm run seed:users

# Build
npm run build                            # Build all apps
cd packages/types && npm run build       # Rebuild shared types

# Reset database completely
docker-compose down -v && npm run docker:up
# Wait 10s, then:
npm run seed                             # Canonical seed — all entities, all enum values
```

---

## 10. File Map (What's Left After Cleanup)

```
Root:
  README.md                  → Main project documentation
  CLAUDE.md                  → AI context (loaded by Claude)
  DOCUMENTATION_INDEX.md     → Navigation to all docs
  LOCAL_DEVELOPMENT_GUIDE.md → Complete dev setup guide
  QUICK_REFERENCE.md         → Daily commands cheat sheet
  fresh-start.sh             → One-command setup script
  ecosystem.config.js        → PM2 configuration
  docker-compose.yml         → Local Docker services
  docker-compose.prod.yml    → Production Docker services
  turbo.json                 → Turborepo task config

.github/:
  AGENTS.md                  → THIS FILE (living context)
  copilot-instructions.md    → AI coding instructions
  BEST_PRACTICES_IMPROVEMENTS.md → Code quality standards
  workflows/                 → GitHub Actions CI/CD

documentation/:
  SECURITY-PUBLIC-API.md     → Public/Admin API separation (CRITICAL)
  MONOREPO_README.md         → Turborepo structure details
  CHATBOT_GUIDE.md           → Gemini AI chatbot setup & testing
  NEWSLETTER_HTML_GUIDE.md   → Newsletter HTML sanitization
  DEPLOYMENT_MASTER_GUIDE.md → Production deployment procedure
  HETZNER_DEPLOYMENT_GUIDE.md → Server-specific deployment
  GITHUB_ACTIONS_SETUP.md    → CI/CD secrets & workflow config
  SEEDING_GUIDE.md           → Database seeding procedures
  PROJECT_SETUP.md           → Initial project setup notes

scripts/:
  setup-local-dev.sh         → Automated local dev setup
  setup-production.sh        → Production environment setup
  setup-database.sh          → Database initialization
  deploy-production.sh       → Production deployment
  create-env-files.sh        → Generate .env files
  reset-and-seed-db.sh       → Database reset + seed
  validate-deployment.sh     → Post-deployment validation
  verify-system.sh           → System health checks
  verify-enum-casing.sh      → Enum value verification
  create-schema.sql          → Complete DB schema (backup)

seeds/:
  seed.ts                    → Canonical comprehensive seed (ALL entities, ALL enum values)
  create-admin.ts            → Production admin user creation (used by seed:users)
  production-seed.sql        → Production SQL seed
```

---

## 11. Common Pitfalls

1. **TypeORM migrations**: Always `cd apps/api` first. Never use `nest generate` for migrations.
2. **Route security**: Many controllers exist but guards may not be applied — always verify `@UseGuards()`.
3. **API endpoints**: user-web must use `/properties/public`, never `/properties`.
4. **Port conflicts**: Check nothing else uses 3000, 3001, 3002, 5432, or 6379.
5. **Shared packages**: Rebuild `@repo/types` after ANY interface change.
6. **specialOffer**: Integer 1-20, lower number = higher priority on homepage.
7. **Enum casing**: Database uses lowercase kebab-case (e.g. `commercial-space`, not `CommercialSpace`).
8. **Credentials in code**: Never commit real passwords, API keys, or JMBG numbers.

---

## Change Log

> Append each modification below. Format:
> `### YYYY-MM-DD — Brief Title`
> - What changed and why
> - Files affected
> - Breaking changes or migrations needed

### 2026-04-16 — Major Documentation Cleanup

- **Removed ~107 files**: obsolete .md fix guides, empty .sql/.sh scripts, test .js files, .txt notes, backup .json files
- **Before**: 103 .md files, 9 .sql files, 32 .sh files scattered across root + documentation/ + scripts/
- **After**: 15 .md files, 3 .sql files, 9 .sh scripts — only essential, actively-used documentation remains
- **Removed directories**: `local-deployment/` (redundant with scripts/)
- **Created**: `.github/AGENTS.md` (this file) as the living project context
- **Updated**: `README.md` documentation links, `DOCUMENTATION_INDEX.md` rewritten
- All removed files recoverable via `git checkout HEAD~1 -- <filename>`

### 2026-04-16 — Comprehensive Setup & Seed Overhaul

- **Created `seeds/seed.ts`**: Single canonical seed covering ALL entities (User, Property, PropertyImage, Client, Representative, NewsletterSubscriber) and ALL enum values (8 PropertyTypes, 3 PropertyStatuses, 11 HeatingTypes, 8 Orientations, 4 TransactionTypes, 3 PaymentTypes, 3 ClientStatuses, 2 Roles). Uses `synchronize: true` for auto-table creation.
- **Rewrote `fresh-start.sh`**: Interactive Docker/manual mode selection, prerequisite checks (Node 20+, Docker/psql), auto-creates `.env` if missing, `--skip-install` flag. Replaces hardcoded `CHANGE_ME` password with `.env`-driven config.
- **Created `init.sql`**: Minimal PostgreSQL init script (`CREATE EXTENSION uuid-ossp`) — was accidentally deleted in previous cleanup but still referenced by both docker-compose files.
- **Updated `package.json`**: Single `seed` script pointing to canonical `seeds/seed.ts` (removed `seed:comprehensive`).
- **Rewrote `LOCAL_DEVELOPMENT_GUIDE.md`**: Comprehensive start/develop/deploy guide with Docker + manual modes, deployment to Hetzner section, PM2 + CI/CD docs, no exposed credentials.
- **Rewrote `QUICK_REFERENCE.md`**: Concise daily cheat sheet — setup, commands, enums, seed data summary, deploy shortcuts.
