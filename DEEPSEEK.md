# Real Estate Platform — DeepSeek AI Context

> **Purpose**: Complete project context for DeepSeek AI coding sessions.
> **Mirrors**: `CLAUDE.md` (Claude), `.github/copilot-instructions.md` (Copilot), `.github/AGENTS.md` (all agents).
> **Rule**: This file is the single source of truth for AI context. Update it with every significant change.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | Olymp Real Estates Platform |
| **Repo** | `aleksicdacha/RealEstatesAPI-NestJS` |
| **Type** | Turborepo monorepo (TypeScript strict) |
| **Owner** | Dalibor Aleksić (`aleksic.dacha@gmail.com`) |
| **Domain** | Real estate agency management — Niš, Serbia |
| **Production URL** | https://www.olymp-nekretnine.co.rs |
| **Server** | Hetzner VPS `46.224.231.217` (Ubuntu 24.04, CPX22: 2vCPU/4GB/80GB) |
| **Portfolio** | `aleksicdacha/portfolio` — Angular 19 SPA on same server (port 80) |

---

## 2. Full Ecosystem Architecture

### 2.1 Monorepo Structure

```
RealEstatesAPI-NestJS/          ← Turborepo monorepo (npm workspaces)
├── apps/
│   ├── api/                    ← NestJS 10 REST API (:3000)
│   ├── admin-web/              ← Next.js 15.5 + PrimeReact admin panel (:3001)
│   └── user-web/               ← Next.js 15.5 + next-intl i18n public site (:3002)
├── packages/
│   ├── types/                  ← Shared TypeScript interfaces (MUST build before use)
│   ├── api-client/             ← ⚠️ DEAD CODE — broken, unused by any app
│   └── utils/                  ← Shared utility functions
├── seeds/                      ← TypeScript seed scripts
├── scripts/                    ← Setup, deploy, verify shell scripts
├── documentation/              ← Essential guides
├── e2e/                        ← Playwright E2E tests (69 tests)
├── postman/                    ← API testing collection
└── .github/
    ├── AGENTS.md               ← Living project context + change log
    ├── copilot-instructions.md ← AI coding instructions
    └── workflows/              ← GitHub Actions CI/CD

portfolio/                      ← Angular 19 SPA (separate repo, same server)
├── src/app/data/profile.ts     ← ALL personal content (single source)
├── src/app/data/design.config.ts ← Design variant toggle
├── src/styles/_tokens.scss     ← CSS custom properties + accent color HSL
└── deploy/                     ← Nginx configs, server hardening, deploy playbook
```

### 2.2 Production Deployment Architecture

```
Hetzner VPS 46.224.231.217 (Ubuntu 24.04)
│
├── Nginx (reverse proxy)
│   ├── :80         → Portfolio (Angular SPA, /root/Portfolio)
│   ├── :8090       → NestJS API (proxy → 127.0.0.1:3000)
│   ├── :8081       → Admin Web (proxy → 127.0.0.1:3001)
│   └── :8082       → User Web (proxy → 127.0.0.1:3002)
│
├── Docker Compose (docker-compose.prod.yml)
│   ├── postgres:16-alpine     (127.0.0.1:5432)
│   ├── redis:7-alpine         (127.0.0.1:6379)
│   ├── api (NestJS)           (127.0.0.1:3000)
│   ├── admin-web (Next.js)    (127.0.0.1:3001)
│   └── user-web (Next.js)     (127.0.0.1:3002)
│
├── PM2 (alternative/fallback, ecosystem.config.js)
│   ├── realestates-api        (fork, max 450MB)
│   ├── realestates-admin      (fork, max 450MB)
│   └── realestates-user       (fork, max 450MB)
│
├── Security layers
│   ├── UFW (allow 22, 80, 443, 8081, 8082, 8090, 8091)
│   ├── fail2ban (SSH + nginx jails)
│   ├── SSH hardened (key-only, MaxAuthTries 3, no root password)
│   └── Daily security scan (daily-security-scan.sh)
│
└── GitHub Actions CI/CD
    Pipeline: test → e2e → deploy
    Deploy triggers: push to master (auto-deploys to Hetzner)
```

### 2.3 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS 10, TypeORM 0.3, PostgreSQL 16, Redis 7 |
| Frontend (admin) | Next.js 15, React 18, PrimeReact, TypeScript |
| Frontend (public) | Next.js 15, React 18, Tailwind CSS, next-intl (SR/EN) |
| Frontend (portfolio) | Angular 19, standalone components, CSS custom properties |
| Build | Turborepo, npm workspaces |
| AI | Google Gemini Pro (chatbot with fallback mode) |
| Testing | Jest (unit), Playwright (E2E, 69 tests) |
| Deployment | Docker Compose, PM2, Nginx, GitHub Actions |
| Email | Nodemailer, sanitize-html (newsletter) |
| Maps | @react-google-maps/api, @googlemaps/markerclusterer |

---

## 3. Critical Rules (Must-Know)

### 3.1 Custom Repository Pattern (NestJS)
Repositories extend `Repository<Entity>` and inject `DataSource`.
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

### 3.2 Public vs Admin API Security (CRITICAL)

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
- See `documentation/SECURITY-PUBLIC-API.md` for full implementation

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
guid            UUIDv4 (public identifier)
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
createdAt       Timestamp (HIDDEN from public)
updatedAt       Timestamp (HIDDEN from public)
→ images[]      OneToMany PropertyImage (cascade, eager)
→ client        ManyToOne Client (nullable)
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
JWT authentication, bcrypt password hashing. Roles: `ADMIN`, `USER`.

### PropertyImage Entity
→ property ManyToOne, `order` Integer, `isFavorite` Boolean (cover image), `url` String.

### NewsletterSubscriber
HTML content with sanitize-html XSS protection. Allowed tags: h1-h6, p, div, span, strong, em, ul, ol, li, a, img, table. Email via Nodemailer.

### Chatbot (Google Gemini AI)
Located in `apps/api/src/entities/chatbot/`. Uses `@google/generative-ai` with Gemini Pro. Multilingual (SR/EN auto-detect). Fallback mode without `GEMINI_API_KEY`. WebSocket integration via `AgentChatGateway`.

---

## 5. Development Commands

### Local Development (recommended workflow)

```bash
# 1. Start PostgreSQL + Redis only (no API container — runs locally)
docker compose up -d postgres redis

# 2. Clean up root-owned dist/ from previous Docker runs (if EACCES errors)
sudo rm -rf apps/api/dist

# 3. Start all 3 apps in parallel (npm workspaces, NOT Turborepo)
npm run dev
```

**How `npm run dev` works:** Uses npm workspaces to call each app's native dev script directly:
- `npm run start:dev --workspace=apps/api` → `nest start --watch` (:3000)
- `npm run dev --workspace=apps/admin-web` → `next dev -p 3001` (:3001)
- `npm run dev --workspace=apps/user-web` → `next dev -p 3002` (:3002)

Runs in parallel with shell `& wait`. Turborepo is NOT used for dev (packages have `tsc --watch` dev scripts which conflict).

### Fresh Start (kill any running processes first)

```bash
# Kill anything on dev ports
fuser -k 3000/tcp 3001/tcp 3002/tcp 2>/dev/null

# Start DB + apps
docker compose up -d postgres redis
sudo rm -rf apps/api/dist   # Only if Docker previously created dist/
npm run dev
```

### Start Individual Apps
```bash
npm run dev:api               # API only (:3000)
npm run dev:admin             # Admin only (:3001)
npm run dev:user              # User web only (:3002)
```

### Docker
```bash
docker compose up -d postgres redis   # Start DB only (for local dev)
docker compose down                   # Stop all
docker compose logs -f                # View logs
docker compose down -v                # Reset DB (deletes data!)
```

> **⚠️ Docker dist/ permissions:** The Docker API container runs as root. If you previously ran `docker compose up` (with API), the `apps/api/dist/` directory will be root-owned. Running `nest start --watch` locally will fail with `EACCES: permission denied`. Fix: `sudo rm -rf apps/api/dist`.

### Database
```bash
# Seed (from project root)
npm run seed                  # Skip-if-seeded
npm run seed:force            # Force re-seed

# Migrations (from apps/api/)
cd apps/api
npm run migration:generate -- src/migrations/DescriptiveName
npm run migration:run
npm run migration:revert

# CLI access
docker exec -it estates_postgres psql -U postgres -d estates
```

### Build
```bash
npm run build                        # All apps
cd packages/types && npm run build   # Shared types (after interface changes)
```

### URLs
| Service | URL | Auth |
|---------|-----|------|
| API | http://localhost:3000 | — |
| Swagger | http://localhost:3000/api | — |
| Admin | http://localhost:3001 | admin / admin123 |
| User Web | http://localhost:3002 | — |

---

## 6. E2E Testing

```bash
# Run all 69 Playwright tests
npm run test:e2e

# Run with .env.test variables
npx dotenv-cli -e .env.test -- npx playwright test --no-deps

# By project
npm run test:e2e:api
npm run test:e2e:admin
npm run test:e2e:user

# UI mode
npm run test:e2e:ui

# View report
npm run test:e2e:report
```

**Test credentials**: `admin` / `admin123`
**Rate limiting**: Set `THROTTLE_SKIP=true` — `ConfigurableThrottlerGuard` bypasses throttling
**Auth storage**: `e2e/.auth/admin.json` (generated by auth setup test, gitignored)
**Test structure**: `e2e/tests/api/`, `e2e/tests/admin-web/`, `e2e/tests/user-web/`

---

## 7. CI/CD Pipeline

Pipeline: `test → e2e → deploy` (deploy blocked unless both pass)

**Key CI constraints:**
- Only `npm ci` at workspace root — never inside subdirectories (breaks hoisting)
- `@nestjs/cli` must be installed globally: `npm install -g @nestjs/cli@10`
- `CORS_ORIGIN` must include `http://127.0.0.1:*` variants (Playwright uses 127.0.0.1)
- `data-source.ts` has `synchronize: true` — no migrations needed in CI

**GitHub Secrets required:**
- `HETZNER_HOST` — `46.224.231.217`
- `HETZNER_USERNAME` — `root`
- `HETZNER_SSH_KEY` — Private SSH key
- `ALERT_EMAIL_USER` / `ALERT_EMAIL_PASSWORD` — Gmail App Password

---

## 8. Environment Variables

### Backend (`apps/api/.env`)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=estates
JWT_SECRET=min_32_chars_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=min_32_chars_refresh_key
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://127.0.0.1:3001,http://127.0.0.1:3002
FRONTEND_URL=http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
GEMINI_API_KEY=your_key_here      # Optional — chatbot has fallback
THROTTLE_SKIP=true                # For testing
SMTP_HOST=smtp.gmail.com          # Optional — email
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=app_password
```

### User Web (`apps/user-web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_key_here
```

---

## 9. Production Deployment

### Quick Deploy
```bash
# From portfolio/deploy/ directory
./deploy-playbook.sh deploy-realestate    # Push to master → GitHub Actions auto-deploys
./deploy-playbook.sh deploy-portfolio     # Build + rsync Angular to server + reload nginx
./deploy-playbook.sh deploy-nginx         # Sync nginx configs + test + reload
./deploy-playbook.sh run-migrations       # Run TypeORM migrations in Docker container
./deploy-playbook.sh status              # Show live status of all services
./deploy-playbook.sh logs api            # Tail logs (api | admin | user | nginx)
./deploy-playbook.sh test                # Run all verification tests
```

### Docker Compose (Production)
```bash
docker compose -f docker-compose.prod.yml up -d
```

### PM2 (Alternative)
```bash
npm run build && pm2 start ecosystem.config.js
```

### Nginx Public Ports
| App | Internal | Public |
|-----|----------|--------|
| Portfolio | :80 | :80 |
| API | :3000 | :8090 |
| Admin | :3001 | :8081 |
| User Web | :3002 | :8082 |

---

## 10. Portfolio (Angular 19 SPA)

Separate repo: `aleksicdacha/portfolio`. Deployed alongside RealEstates on same Hetzner server.

### Key Files
| File | Purpose |
|------|---------|
| `src/app/data/profile.ts` | **ALL personal content** — name, experience, projects, skills, contact |
| `src/app/data/design.config.ts` | Design variant toggle (EDITORIAL or BRUTALIST) |
| `src/styles/_tokens.scss` | CSS custom properties, spacing scale, accent color HSL |
| `deploy/nginx/` | Nginx configs for all sites on the server |
| `deploy/deploy-playbook.sh` | Unified deploy script for all projects |

### Design System
- **Fonts**: Inter (body/UI), Fraunces variable (display/headlines)
- **Spacing**: 4px base unit scale (space-1 through space-32)
- **Accent color**: HSL variables in `_tokens.scss` — change `--accent-h`, `--accent-s`, `--accent-l`
- **Variants**: `editorial` (clean, rounded) or `brutalist` (thick borders, no radius)
- **Theme**: Light/dark toggle, persisted to localStorage

### Build & Deploy
```bash
npm run build:prod              # Output: dist/portfolio/browser/
# Manual deploy:
./deploy/deploy-playbook.sh deploy-portfolio
```

---

## 11. Common Pitfalls

1. **TypeORM migrations**: Use `cd apps/api && npm run migration:*`, NOT `nest generate`
2. **Route security**: Many controllers exist but guards may not be applied — verify `@UseGuards()` presence
3. **API endpoints**: user-web MUST use `/properties/public`, never `/properties`
4. **Shared packages**: Rebuild `@repo/types` after interface changes (affects all apps)
5. **Port conflicts**: API=3000, Admin=3001, User=3002, PostgreSQL=5432, Redis=6379
6. **Command context**: Some scripts need `cd apps/api` first, others run from workspace root
7. **Property identifiers**: Use `id` (UUID PK) as public `:guid` route param — `code` is human-readable only
8. **npm workspaces**: Never run `npm ci` inside a workspace subdirectory — only at root
9. **CORS in tests**: Include both `localhost` and `127.0.0.1` variants in `CORS_ORIGIN`
10. **Seed is skip-if-seeded** by default — use `npm run seed:force` to re-seed
11. **Database in CI**: `data-source.ts` has `synchronize: true` — no migrations needed
12. **Production DB ports**: Bound to `127.0.0.1` only (loopback) — never internet-exposed
13. **Docker dist/ permissions**: If Docker API container ran before local dev, `sudo rm -rf apps/api/dist`
14. **@repo/types build**: Must run `cd packages/types && npm run build` after any interface change
15. **@repo/api-client is dead code**: Not imported by any app — has import errors, SSR-unsafe localStorage
16. **PropertyImageController has NO guards**: ⚠️ Add `@UseGuards(JwtAuthGuard)` — currently open to public
17. **UserRepository uses wrong pattern**: Uses `@InjectRepository()` instead of DataSource injection

---

## 12. Key Reference Files

| File | Purpose |
|------|---------|
| `.github/AGENTS.md` | Living project context with full change log |
| `.github/copilot-instructions.md` | AI coding instructions and patterns |
| `documentation/SECURITY-PUBLIC-API.md` | Public/admin API separation (CRITICAL) |
| `documentation/DEPLOYMENT_MASTER_GUIDE.md` | Production deployment procedure |
| `documentation/HETZNER_DEPLOYMENT_GUIDE.md` | Hetzner server-specific setup |
| `documentation/GITHUB_ACTIONS_SETUP.md` | CI/CD secrets and workflow config |
| `documentation/CHATBOT_GUIDE.md` | Google Gemini AI chatbot setup & testing |
| `documentation/NEWSLETTER_HTML_GUIDE.md` | Newsletter HTML sanitization |
| `documentation/MONOREPO_README.md` | Turborepo monorepo structure (Serbian) |
| `apps/api/src/app.module.ts` | NestJS root module (DB, i18n, throttling) |
| `apps/api/src/entities/property/property.repository.ts` | Canonical repository pattern |
| `apps/user-web/lib/api.ts` | Frontend API client (public endpoints only) |
| `ecosystem.config.js` | PM2 production process config |
| `docker-compose.prod.yml` | Production Docker orchestration |
| `turbo.json` | Turborepo task pipeline |
| `postman/Real-Estate-API-v2-Complete.postman_collection.json` | API testing |
| `portfolio/deploy/deploy-playbook.sh` | Unified deploy script |
| `portfolio/deploy/SERVER_SETUP.md` | Hetzner server setup guide |

---

## 13. Codebase Health — Deep Analysis (2026-06-14)

Full codebase audit performed. Overall score: **7.5/10** — solid foundation, targeted fixes needed.

### 13.1 🚨 Critical Issues

| Issue | File | Fix |
|-------|------|-----|
| **No guards on PropertyImageController** | `property-image.controller.ts` | Add `@UseGuards(JwtAuthGuard)` — all 5 endpoints exposed |
| **UserRepository broken pattern** | `user.repository.ts` + `user.service.ts` | Repository is empty class; service uses `@InjectRepository()` — refactor to DataSource pattern |

### 13.2 ⚠️ High Priority Issues

| Issue | File | Fix |
|-------|------|-----|
| **PropertyImage missing onDelete: CASCADE** | `property-image.entity.ts` | Add `{ onDelete: 'CASCADE' }` to ManyToOne relation |
| **Property images eager: true (N+1)** | `property.entity.ts` line 120 | Change to `eager: false`, add explicit joins in queries |
| **NewsletterSubscriber migration mismatch** | Entity vs migration `1768240550665` | Entity expects `subscribedAt`/`unsubscribedAt`, migration creates `createdAt` — runtime errors |
| **@repo/types not used by any app** | All 3 apps | Apps define own interfaces locally — shared package is dead code |
| **@repo/api-client broken & unused** | `packages/api-client/` | Broken import (`PropertySearchParams` doesn't exist), SSR-unsafe, not imported anywhere |

### 13.3 📋 Medium Priority Issues

| Issue | Detail |
|-------|--------|
| **Missing DB indexes** | `properties`: status, propertyType, neighborhood, createdAt; `clients`: email; `property_images`: propertyId, order |
| **No dedicated `guid` field** | `id` (UUID PK) serves double duty as route `:guid` param — works but semantically confusing |
| **`data-source.ts` synchronize: true** | Safe for dev/CI but dangerous if accidentally used in production |
| **Agent chat enums in entity files** | `ConversationStatus`, `MessageSenderType` defined inline — should be in `enums/` directories |
| **Tailwind versions out of sync** | admin-web: v4.1.18, user-web: v3.4.19 |
| **Admin-web 100% client-rendered** | Every component has `"use client"` — no React Server Components |
| **@tanstack/react-query installed but unused** | Both frontends have it as dependency but use raw `useEffect` + `fetch`/`axios` |

### 13.4 ✅ What's Excellent

- Custom Repository pattern: 6/7 repos correct
- DTO validation: 70+ field validations with class-validator
- Module structure: 11 clean feature modules
- Auth: JWT + refresh tokens + revocation via `lastLogoutTime`
- Public/Admin API separation: `@Public` decorator + `transformToPublicDto()`
- Rate limiting: Granular per-endpoint (`@Throttle`)
- Security headers: Helmet + HSTS + HPP + CORS allowlist
- Exception handling: TypeORM error codes mapped to HTTP exceptions
- E2E testing: 69 Playwright tests, 3 projects, proper fixtures
- Jest testing: `Test.createTestingModule()`, mock factories
- CI/CD: `test → e2e → deploy` pipeline with PostgreSQL/Redis services
- I18n: Full SR/EN via next-intl (user-web) + nestjs-i18n (API)
- Enum consistency: All lowercase-with-dashes after casing migration

---

## 14. Version Pinning & Security Overrides

Root `package.json` overrides (force resolution across workspace):

```json
"overrides": {
  "axios": "^1.18.0",
  "next": "^15.5.19",
  "uuid": "^11.1.1",
  "socket.io-parser": "4.2.6",
  "multer": "2.1.1",
  "glob": "^10.5.0",
  "lodash": "^4.17.23",
  "tar": "^7.5.3",
  "picomatch": "^4.0.4",
  "tmp": "^0.2.4",
  "test-exclude": "^7.0.1",
  "@swc/helpers": "^0.5.21",
  "fast-safe-stringify": "2.1.1"
}
```

Current resolved versions (2026-06-14):
- `axios`: 1.18.0 (pinned from 1.15.1 — 9 HIGH vulns)
- `next`: 15.5.19 across both apps (from 15.5.15 admin / 15.4.7 user — 13→1 vuln)
- `uuid`: 11.1.1 (from 11.1.0 — 1 HIGH vuln)

---

## 15. Change Log

> **Rule**: Append new changes here. Never overwrite history.

| Date | Change | Description |
|------|--------|-------------|
| 2026-06-08 | DEEPSEEK.md created | Initial DeepSeek AI context file — mirrors CLAUDE.md, copilot-instructions.md, AGENTS.md with full ecosystem view |
| 2026-06-14 | Deep analysis completed | Full codebase audit: NestJS API, TypeORM entities, Next.js apps, shared packages, testing, CI/CD. 17 issues found (2 critical, 5 high, 7 medium). Overall score 7.5/10. |
| 2026-06-14 | Security bumps | axios 1.15.1→1.18.0 (9 HIGH), next 15.5.15→15.5.19 (13→1 MEDIUM), uuid 11.1.0→11.1.1 (1 HIGH). Added root overrides. |
| 2026-06-14 | security-scan.yml fix | Fixed secrets context access warnings — moved from job-level `env:` to step-level `env:` in notify job. Added `continue-on-error: true`. |
