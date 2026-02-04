# 📚 Real Estate Platform - Documentation Index

> **Start Here!** Complete guide to all documentation, setup, and resources.

---

## 🎯 Quick Navigation

### New to the project?
1. Read [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) - Complete project analysis
2. Follow [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) - Get started
3. Keep [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Handy for daily use

### Need to deploy?
1. Read [scripts/SETUP_README.md](scripts/SETUP_README.md) - Scripts guide
2. Run `./scripts/setup-local-dev.sh` for local
3. Run `./scripts/setup-production.sh` for production

### Quick reference?
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - All commands and URLs in one page

---

## 📖 Documentation Structure

### 🆕 New Documentation (Feb 2026)

#### Main Guides
| Document | Description | When to Use |
|----------|-------------|-------------|
| **[PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)** | Complete project analysis, issues, and solutions | Understanding the project |
| **[LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)** | Complete local setup guide | Setting up for first time |
| **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** | Summary of all changes and improvements | Quick overview |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Commands, URLs, credentials cheat sheet | Daily development |

#### Scripts & Automation
| Document | Description | When to Use |
|----------|-------------|-------------|
| **[scripts/SETUP_README.md](scripts/SETUP_README.md)** | All scripts explained with examples | Using automation scripts |
| **[scripts/setup-local-dev.sh](scripts/setup-local-dev.sh)** | Automated local setup script | One-command local setup |
| **[scripts/setup-production.sh](scripts/setup-production.sh)** | Automated production deployment | Production deployment |

### 📋 Existing Documentation

#### Development Guidelines
| Document | Description |
|----------|-------------|
| **[.github/copilot-instructions.md](.github/copilot-instructions.md)** | Coding standards and patterns |
| **[AI_PROJECT_CONTEXT.md](AI_PROJECT_CONTEXT.md)** | AI coding instructions |

#### Architecture
| Document | Description |
|----------|-------------|
| **[documentation/MONOREPO_README.md](documentation/MONOREPO_README.md)** | Monorepo structure and architecture |
| **[documentation/SECURITY-PUBLIC-API.md](documentation/SECURITY-PUBLIC-API.md)** | Security patterns for public API |

#### Features
| Document | Description |
|----------|-------------|
| **[documentation/CHATBOT_GUIDE.md](documentation/CHATBOT_GUIDE.md)** | Chatbot setup and testing |
| **[documentation/NEWSLETTER_HTML_GUIDE.md](documentation/NEWSLETTER_HTML_GUIDE.md)** | Newsletter HTML support |

#### Deployment
| Document | Description |
|----------|-------------|
| **[documentation/DEPLOYMENT_MASTER_GUIDE.md](documentation/DEPLOYMENT_MASTER_GUIDE.md)** | Production deployment guide |
| **[documentation/HETZNER_DEPLOYMENT_GUIDE.md](documentation/HETZNER_DEPLOYMENT_GUIDE.md)** | Hetzner-specific deployment |
| **[documentation/AUTOMATED_DEPLOYMENT_GUIDE.md](documentation/AUTOMATED_DEPLOYMENT_GUIDE.md)** | Automated deployment with scripts |

---

## 🚀 Getting Started

### Local Development (Recommended Path)

```bash
# 1. Quick start (automated)
./scripts/setup-local-dev.sh
npm run dev

# 2. Access services
# - API: http://localhost:3000
# - Admin: http://localhost:3001 (admin/admin123)
# - Public: http://localhost:3002
```

**Detailed guide:** [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)

### Production Deployment

```bash
# 1. Create .env.production with strong secrets
# 2. Run automated deployment
./scripts/setup-production.sh

# 3. Configure reverse proxy and SSL
# See: scripts/SETUP_README.md
```

**Detailed guide:** [scripts/SETUP_README.md](scripts/SETUP_README.md)

---

## 📂 Project Structure

```
RealEstatesAPI-NestJS/
│
├── 📚 Documentation (Root Level)
│   ├── PROJECT_ANALYSIS.md              ⭐ Complete project analysis
│   ├── LOCAL_DEVELOPMENT_GUIDE.md       ⭐ Setup guide
│   ├── SETUP_SUMMARY.md                 ⭐ Changes summary
│   ├── QUICK_REFERENCE.md               ⭐ Quick commands
│   ├── DOCUMENTATION_INDEX.md           ⭐ This file
│   ├── README.md                        # Project README
│   └── AI_PROJECT_CONTEXT.md            # AI instructions
│
├── 📱 apps/
│   ├── api/                             # NestJS API
│   ├── admin-web/                       # Next.js Admin
│   └── user-web/                        # Next.js Public Site
│
├── 📦 packages/
│   ├── types/                           # Shared types
│   ├── api-client/                      # API client
│   └── utils/                           # Utilities
│
├── 🌱 seeds/
│   └── local-comprehensive-seed.ts      ⭐ Complete seeding
│
├── 🔧 scripts/
│   ├── setup-local-dev.sh               ⭐ Local setup automation
│   ├── setup-production.sh              ⭐ Production deployment
│   └── SETUP_README.md                  ⭐ Scripts documentation
│
└── 📚 documentation/
    ├── MONOREPO_README.md               # Architecture
    ├── SECURITY-PUBLIC-API.md           # Security patterns
    ├── CHATBOT_GUIDE.md                 # Chatbot setup
    ├── DEPLOYMENT_MASTER_GUIDE.md       # Production deployment
    └── ... (40+ documentation files)
```

---

## 🎓 Learning Path

### Day 1: Understanding the Project
1. Read [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)
2. Review [.github/copilot-instructions.md](.github/copilot-instructions.md)
3. Skim [documentation/MONOREPO_README.md](documentation/MONOREPO_README.md)

### Day 2: Local Setup
1. Follow [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)
2. Run `./scripts/setup-local-dev.sh`
3. Explore API at http://localhost:3000/api
4. Login to admin panel (admin/admin123)

### Day 3: Development
1. Keep [QUICK_REFERENCE.md](QUICK_REFERENCE.md) open
2. Read [documentation/SECURITY-PUBLIC-API.md](documentation/SECURITY-PUBLIC-API.md)
3. Explore entities in `apps/api/src/entities/`
4. Test CRUD operations via admin panel

### Week 2: Advanced Topics
1. Study custom repository pattern
2. Review [documentation/CHATBOT_GUIDE.md](documentation/CHATBOT_GUIDE.md)
3. Understand public vs admin API separation
4. Practice database migrations

---

## 🔑 Key Concepts

### Architecture Patterns

**Custom Repository Pattern:**
```typescript
@Injectable()
export class PropertyRepository extends Repository<Property> {
  constructor(private dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }
  // Custom methods here
}
```

**Public vs Admin API:**
- Public: `/v1/properties/public` - Sanitized data
- Admin: `/v1/properties` - Full data with auth

**Enum Standardization:**
- All enums use lowercase with kebab-case
- Example: `'apartment'`, `'gas-central'`, `'rents-out'`

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 10 + TypeORM |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Admin UI** | Next.js 15 + PrimeReact |
| **Public UI** | Next.js 15 + Tailwind CSS |
| **Monorepo** | Turborepo |
| **Container** | Docker + Docker Compose |

---

## 🛠️ Common Tasks

### Database Operations

```bash
# Generate migration
cd apps/api
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Seed database
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

### Development Workflow

```bash
# Start all services
npm run dev

# Start individually
npm run dev:api        # API only
npm run dev:admin      # Admin only
npm run dev:user       # User Web only

# Docker services
npm run docker:up      # Start PostgreSQL + Redis
npm run docker:down    # Stop services
npm run docker:logs    # View logs
```

### Testing

```bash
# Manual testing
node test-login.js
node test-api-comprehensive.js

# Use Postman
# Import: postman/Real-Estate-API-v2-Complete.postman_collection.json

# Access Swagger
# http://localhost:3000/api
```

---

## 🐛 Troubleshooting

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Setup fails | See [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md#troubleshooting) |
| Port in use | `sudo lsof -i :3000` then `kill -9 <PID>` |
| Database issues | `docker-compose down -v` then restart |
| Enum values wrong | Reset DB and reseed |
| Migration fails | Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md#quick-fixes) |

### Complete Troubleshooting

See dedicated sections in:
- [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md#troubleshooting)
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-quick-fixes)
- [scripts/SETUP_README.md](scripts/SETUP_README.md#troubleshooting)

---

## 📞 Support & Resources

### Documentation Files

**Start here:**
- [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) - If you're new
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - For daily use
- [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) - For setup

**Detailed guides:**
- [scripts/SETUP_README.md](scripts/SETUP_README.md) - Scripts and deployment
- [documentation/MONOREPO_README.md](documentation/MONOREPO_README.md) - Architecture
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Coding standards

### External Resources

- **NestJS Docs:** https://docs.nestjs.com/
- **Next.js Docs:** https://nextjs.org/docs
- **TypeORM Docs:** https://typeorm.io/
- **PrimeReact Docs:** https://primereact.org/

### Getting Help

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Review error logs in terminal
3. Search in `/documentation/` directory
4. Check GitHub Issues
5. Review [AI_PROJECT_CONTEXT.md](AI_PROJECT_CONTEXT.md)

---

## ✅ Checklist for New Developers

### Before You Start
- [ ] Read [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)
- [ ] Install Docker Desktop
- [ ] Install Node.js 20+
- [ ] Clone repository

### Initial Setup
- [ ] Run `./scripts/setup-local-dev.sh`
- [ ] Verify all services start: `npm run dev`
- [ ] Login to admin panel (admin/admin123)
- [ ] Explore API docs at /api
- [ ] Bookmark [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### First Week Goals
- [ ] Read [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [ ] Understand custom repository pattern
- [ ] Create a test property via admin panel
- [ ] Make a simple entity change and migration
- [ ] Review public vs admin API differences

---

## 🎯 Quick Links

### Essential Documents
- 📋 [Project Analysis](PROJECT_ANALYSIS.md)
- 🚀 [Local Setup Guide](LOCAL_DEVELOPMENT_GUIDE.md)
- ⚡ [Quick Reference](QUICK_REFERENCE.md)
- 📦 [Scripts Documentation](scripts/SETUP_README.md)

### Code Guidelines
- 💻 [Coding Instructions](.github/copilot-instructions.md)
- 🏗️ [Architecture](documentation/MONOREPO_README.md)
- 🔒 [Security Patterns](documentation/SECURITY-PUBLIC-API.md)

### Deployment
- 🚀 [Master Guide](documentation/DEPLOYMENT_MASTER_GUIDE.md)
- 🖥️ [Hetzner Guide](documentation/HETZNER_DEPLOYMENT_GUIDE.md)
- 🤖 [Automation](documentation/AUTOMATED_DEPLOYMENT_GUIDE.md)

---

## 📊 Documentation Statistics

- **Total Documentation Files:** 50+
- **New Files (Feb 2026):** 7
- **Updated Files:** 3
- **Code Guidelines:** Complete
- **Setup Automation:** 100%
- **Coverage:** All aspects documented

---

**Last Updated:** February 2, 2026  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

---

**Happy Coding! 🚀**
