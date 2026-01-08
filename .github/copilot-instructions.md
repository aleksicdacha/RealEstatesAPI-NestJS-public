# Real Estate Platform - AI Coding Instructions

## Architecture Overview

**Turborepo monorepo** with three applications sharing TypeScript packages:
- `apps/api` - NestJS 10 REST API (:3000)
- `apps/admin-web` - Next.js 15 admin panel with PrimeReact (:3001)
- `apps/user-web` - Next.js 15 public website with next-intl i18n (:3002)
- `packages/types` - Shared TypeScript interfaces (Property, Client, User)
- `packages/api-client` - Centralized API methods (partial implementation)
- `packages/utils` - Shared utility functions

**Database**: PostgreSQL with TypeORM using custom Repository pattern (NOT DataSource pattern)
**Stack**: TypeScript, PostgreSQL, Redis (optional), Docker Compose, Google Gemini AI (chatbot)

## Development Commands

```bash
# Run all apps (from workspace root)
npm run dev              # Turborepo runs all apps in parallel

# Individual apps
npm run dev:api          # NestJS on :3000
npm run dev:admin        # Admin panel on :3001
npm run dev:user         # Public site on :3002

# Docker services (PostgreSQL + Redis)
npm run docker:up
npm run docker:down
npm run docker:logs      # View logs
```

### Database Operations (CRITICAL)
**Must run from `apps/api` directory** - migrations use TypeORM CLI, NOT NestJS CLI:
```bash
cd apps/api

# Migrations
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Seeding
npm run seed             # Runs seeds/final-seed.ts
npm run seed:users       # Individual seed scripts
```

**Never use** `nest generate` for migrations - it won't work.

## Backend (NestJS) Patterns

### Custom Repository Pattern
**Critical**: Repositories extend TypeORM's `Repository<Entity>` and inject `DataSource`:
```typescript
// property.repository.ts
@Injectable()
export class PropertyRepository extends Repository<Property> {
  constructor(private readonly dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }
  
  async findFilteredProperties(options: FilterPropertyDto): Promise<[Property[], number]> {
    const qb = this.createQueryBuilder('property');
    // Custom queries here
  }
}

// property.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage])],
  providers: [PropertyService, PropertyRepository, PropertyImageRepository],
  exports: [PropertyService, PropertyRepository]
})
```

**Do NOT** use `@InjectRepository(Property)` - provide custom repository as service directly.

### Module Structure
All feature modules follow this pattern:
```
entities/
  property/
    property.entity.ts        # @Entity('properties') with TypeORM decorators
    property.module.ts        # Feature module with TypeOrmModule.forFeature()
    property.service.ts       # Business logic, uses repositories
    property.controller.ts    # Routes, DTOs, guards
    property.repository.ts    # Custom queries extending Repository<T>
    dto/                      # CreatePropertyDto, UpdatePropertyDto, etc.
    enums/                    # PropertyType, PropertyStatus, etc.
```

See: `apps/api/src/entities/property/` for canonical example.

### Public vs Admin API Split ⚠️
**Security critical** - two separate endpoints for same data:
- **Admin** `/v1/properties` - Full data including `salePrice`, `comment`, `client`, timestamps
- **Public** `/v1/properties/public` - Sanitized via `PublicPropertyDto` (hides sensitive fields)

**Public API MUST hide**:
- `address` (only `neighborhood` shown)
- `salePrice` (internal agency price)
- `comment` (internal notes)
- `client` (owner information)
- `createdAt`, `updatedAt` (metadata)

See `documentation/SECURITY-PUBLIC-API.md` for implementation details.

### Authentication & Authorization
- JWT with Passport: `JwtAuthGuard`, `LocalAuthGuard`, `RolesGuard`
- Role enum: `Role.ADMIN`, `Role.USER` in `auth/enums/role.enum.ts`
- **Many routes are unprotected** - guards exist but some are NOT applied (check controllers)
- Pattern: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)`

### Configuration & Modules
`apps/api/src/app.module.ts` shows critical setup:
- ConfigModule with Joi validation (`common/config/validation.schema.ts`)
- TypeORM async configuration from environment
- I18n module (`nestjs-i18n`) with SR/EN support
- ThrottlerModule for rate limiting
- Feature modules: Property, Client, User, Chatbot, AgentChat, Upload, Email, Contact

## Frontend (Next.js) Patterns

### User-Web (apps/user-web)
**Next.js 15 App Router** with React Server Components:
- **Internationalization**: next-intl with `middleware.ts` routing (`matcher: ['/', '/(sr|en)/:path*']`)
- **Messages**: `messages/sr.json`, `messages/en.json` - chatbot fully translated
- **API client**: `lib/api.ts` - ONLY uses `/properties/public` endpoints
- **Google Maps**: `@react-google-maps/api` with `@googlemaps/markerclusterer`
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS 4.0 (PostCSS config)

**Never call admin endpoints** from user-web - use public API or face security vulnerabilities.

Example API call pattern:
```typescript
// lib/api.ts
const url = `${API_BASE_URL}/properties/public?${queryParams}`;
const response = await fetch(url);
```

### Admin-Web (apps/admin-web)
- PrimeReact components: DataTable, Dialog, Toast, FileUpload
- Full CRUD for Property/Client/User
- Image upload with cropping library
- Uses admin endpoints with full data

### Chatbot Feature (Google Gemini AI)
- Lives in `apps/api/src/entities/chatbot/`
- Uses `@google/generative-ai` with Gemini Pro model
- **Multilingual**: Automatically detects SR/EN from request, responds in same language
- **Fallback mode**: Works without `GEMINI_API_KEY` using predefined responses
- WebSocket integration via `AgentChatGateway` for live agent handoff
- See `documentation/CHATBOT_GUIDE.md` for test cases

Environment variable: `GEMINI_API_KEY` (optional - has fallback system)

## Data Model Quirks ⚠️

### Property Entity (`apps/api/src/entities/property/property.entity.ts`)
- **`id`**: Auto-increment UUID (PK) - **NOT** used in URLs
- **`guid`**: UUIDv4 string - **THIS** is public identifier in URLs/API responses
- **`code`**: Unique human-readable code (e.g., "NIS-001")
- `specialOffer`: Integer 1-20, determines order on homepage (lower = higher priority)
- `orientation`: ENUM (North, South, East, West, NorthEast, NorthWest, SouthEast, SouthWest)
- `propertyType`: ENUM (Apartment, House, Land, Commercial, Garage)
- `status`: ENUM (Active, Sold, Reserved, Inactive)
- Relations:
  - `images`: OneToMany PropertyImage (has `order` and `isFavorite` fields)
  - `client`: ManyToOne Client

### Client Entity
- Represents property owners/sellers
- Fields: `ownerName`, `ownerJmbg`, `ownerIdCardNumber`, `clientTransactionType` (Sale/Rent)
- Optional 1:1 `representative` relation (zastupnik) - see `entities/representative/`
- See `documentation/PROPERTY_CLIENT_EXTENSION_PLAN.md`

### Shared Packages (@repo/types)
**Must build before using**:
```bash
cd packages/types && npm run build
```
Import in other packages: `import { Property, Client, User } from '@repo/types'`

## Common Pitfalls

1. **TypeORM migrations**: Use `cd apps/api && npm run migration:*`, NOT `nest generate`
2. **Route security**: Many controllers exist but guards may not be applied - verify `@UseGuards()` presence
3. **API endpoints**: user-web MUST use `/properties/public`, not `/properties`
4. **Shared packages**: Rebuild `@repo/types` after interface changes (affects all apps)
5. **Port conflicts**: API=3000, Admin=3001, User=3002, PostgreSQL=5432, Redis=6379
6. **Command context**: Some scripts need `cd apps/api` first, others run from workspace root
7. **Property identifiers**: Use `guid` for public APIs, `id` is internal only

## Key Reference Files

- `documentation/SECURITY-PUBLIC-API.md` - Public/admin API separation (CRITICAL for security)
- `documentation/MONOREPO_README.md` - Detailed monorepo structure and Serbian docs
- `documentation/CHATBOT_GUIDE.md` - Chatbot setup, testing, multilingual support
- `turbo.json` - Turborepo task orchestration and caching
- `apps/api/src/app.module.ts` - NestJS root module (DB, i18n, throttling config)
- `apps/user-web/lib/api.ts` - Frontend API client with PublicPropertyDto types
- `apps/api/src/entities/property/property.repository.ts` - Custom repository pattern example
- `postman/Real-Estate-API-v2-Complete.postman_collection.json` - API testing

## Testing & Debugging

```bash
# Test scripts (run with Node.js from root)
node test-login.js              # Auth endpoints
node test-upload.js             # File upload
node test-api-comprehensive.js  # Full API test

# View API logs
npm run docker:logs             # Docker logs
# OR check terminal running npm run dev:api

# Postman collection
# Import: postman/Real-Estate-API-v2-Complete.postman_collection.json
```

## Environment Variables (Critical)

Backend (`apps/api/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=estates
JWT_SECRET=min_32_chars_secret_key
GEMINI_API_KEY=your_key_here  # Optional - chatbot has fallback
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

Frontend (`apps/user-web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```
