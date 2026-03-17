# 🚀 Quick Start Reference Card

## One-Command Setup
```bash
./fresh-start.sh
```
**Time**: 5-10 minutes | **Creates**: 10 properties, 5 clients, 4 users, 20+ images

---

## Essential Commands

### Start Development
```bash
npm run dev              # All apps (API + Admin + User Web)
npm run dev:api          # API only (:3000)
npm run dev:admin        # Admin panel only (:3001)
npm run dev:user         # User website only (:3002)
```

### Docker
```bash
npm run docker:up        # Start PostgreSQL + Redis
npm run docker:down      # Stop all containers
npm run docker:logs      # View logs
```

### Database
```bash
cd apps/api
npm run migration:run    # Run migrations
npm run migration:revert # Undo last migration
npm run migration:generate -- src/migrations/Name  # Create new
```

---

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| Admin Panel | http://localhost:3001 | admin / admin123 |
| User Website | http://localhost:3002 | Public access |
| PostgreSQL | localhost:5432 | postgres / CHANGE_ME |
| Redis | localhost:6379 | No auth |

---

## Quick Checks

### Verify Services
```bash
docker ps                                    # Check containers
curl http://localhost:3000                   # API health
curl http://localhost:3000/v1/properties/public  # Properties
```

### Database Status
```bash
docker exec estates_postgres psql -U postgres -d estates -c "SELECT COUNT(*) FROM properties;"
```

---

## Troubleshooting

### Reset Everything
```bash
docker-compose down -v
rm -rf node_modules apps/*/node_modules packages/*/node_modules
./fresh-start.sh
```

### Port Conflicts
```bash
lsof -i :3000  # Find process using port
kill -9 <PID>  # Kill it
```

### Database Issues
```bash
docker logs estates_postgres              # Check logs
docker restart estates_postgres           # Restart DB
docker exec -it estates_postgres psql -U postgres -d estates  # Connect
```

---

## File Structure

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/              # NestJS backend (:3000)
│   ├── admin-web/        # Admin panel (:3001)
│   └── user-web/         # Public website (:3002)
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── api-client/       # API client library
│   └── utils/            # Shared utilities
├── seeds/                # Database seed scripts
├── documentation/        # Guides and docs
├── fresh-start.sh        # 🚀 Main setup script
└── FRESH_START_GUIDE.md  # Full documentation
```

---

## API Endpoints (Key)

### Auth
- POST `/v1/auth/login` - Login
- POST `/v1/auth/register` - Register

### Properties (Admin)
- GET `/v1/properties` - All properties (with sensitive data)
- POST `/v1/properties` - Create property
- PATCH `/v1/properties/:id` - Update property
- DELETE `/v1/properties/:id` - Delete property

### Properties (Public)
- GET `/v1/properties/public` - Public properties (filtered)
- GET `/v1/properties/public/:guid` - Single property

### Clients
- GET `/v1/clients` - All clients
- POST `/v1/clients` - Create client

---

## Development Workflow

1. **Start fresh**: `./fresh-start.sh`
2. **Start dev**: `npm run dev`
3. **Make changes**: Edit code in `apps/` or `packages/`
4. **Test**: Visit http://localhost:3001 (admin) or :3002 (user)
5. **Database changes**: Create migration → Run → Test
6. **Commit**: Git commit your changes

---

## Environment Files

### Required
- `apps/api/.env` - Backend config
- `apps/admin-web/.env.local` - Admin panel config
- `apps/user-web/.env.local` - User website config

### Optional
- `.env.development` - Docker config
- `apps/api/.env.production` - Production config

---

## Database Relations

```
Property ← (1:Many) → PropertyImage
Property ← (1:1) → Client
```

**Key Fields**:
- Property: `id` (internal), `code` (public, e.g., "NIS-001"), `guid` (UUID for URLs)
- Client: Links to one property via OneToOne relation
- Images: Multiple per property, one marked as `isFavorite`

---

## Common Tasks

### Add New Property via API
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:3000/v1/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NIS-011",
    "propertyType": "Apartment",
    "price": 100000,
    "salePrice": 95000,
    "area": 75,
    "address": "Main St 123"
  }'
```

### Check Logs
```bash
docker-compose logs -f api       # API logs
docker-compose logs -f postgres  # Database logs
```

### Backup Database
```bash
docker exec estates_postgres pg_dump -U postgres estates > backup.sql
```

### Restore Database
```bash
docker exec -i estates_postgres psql -U postgres estates < backup.sql
```

---

## Need Help?

📖 **Full Guide**: `FRESH_START_GUIDE.md`
📚 **Documentation**: `documentation/` folder
🔒 **Security**: `documentation/SECURITY-PUBLIC-API.md`
🚀 **Deployment**: `documentation/DEPLOYMENT_MASTER_GUIDE.md`

---

**Last Updated**: February 4, 2026
