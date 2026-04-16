# 🏠 Real Estate Management System - Monorepo

A full-stack Real Estate management platform built with **NestJS**, **Next.js**, **PostgreSQL**, and **TypeScript** in a **Turborepo** monorepo architecture.

## 🚀 Quick Start (One Command)

```bash
./fresh-start.sh
```

This will set up everything: Docker, Database, Migrations, Seed Data (10 properties, 5 clients, 4 users).

**Then start development:**
```bash
npm run dev
```

Visit:
- 🔐 **Admin Panel**: http://localhost:3001 (Login: `admin` / `admin123`)
- 🌐 **Public Website**: http://localhost:3002
- 🔌 **API**: http://localhost:3000

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Documentation](#documentation)
- [Deployment](#deployment)

---

## 🎯 Project Overview

### Features

**Admin Panel** (apps/admin-web)
- ✅ Property CRUD with image upload
- ✅ Client management
- ✅ User management
- ✅ Dashboard with statistics
- ✅ Role-based access control (Admin/User)

**Public Website** (apps/user-web)
- ✅ Property listings with filters
- ✅ Interactive Google Maps
- ✅ Property detail pages
- ✅ Contact form with reCAPTCHA
- ✅ AI Chatbot (Google Gemini)
- ✅ Multilingual (Serbian/English)

**Backend API** (apps/api)
- ✅ RESTful API with NestJS
- ✅ JWT Authentication
- ✅ TypeORM with PostgreSQL
- ✅ Public/Admin API separation
- ✅ File upload handling
- ✅ Email notifications
- ✅ WebSocket support (Agent Chat)
- ✅ Rate limiting & throttling

---

## 🏗️ Architecture

### Monorepo Structure

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/              # NestJS REST API (Port 3000)
│   ├── admin-web/        # Next.js Admin Panel (Port 3001)
│   └── user-web/         # Next.js Public Site (Port 3002)
├── packages/
│   ├── types/            # Shared TypeScript interfaces
│   ├── api-client/       # Centralized API methods
│   └── utils/            # Shared utility functions
├── seeds/                # Database seed scripts
├── documentation/        # Comprehensive guides
├── docker-compose.yml    # Docker orchestration
└── turbo.json           # Turborepo configuration
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 10, TypeORM, PostgreSQL, Redis |
| **Frontend** | Next.js 15, React 18, PrimeReact, Tailwind CSS |
| **Language** | TypeScript 5.x |
| **Build** | Turborepo, npm workspaces |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Deployment** | Docker, PM2 |
| **AI** | Google Gemini (Chatbot) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**
- **Linux/macOS** or WSL2 (for scripts)

### Installation

#### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd RealEstatesAPI-NestJS

# Run fresh start (handles everything)
chmod +x fresh-start.sh
./fresh-start.sh

# Start development
npm run dev
```

#### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Docker services
npm run docker:up

# 3. Wait for PostgreSQL (10 seconds)
sleep 10

# 4. Run migrations
cd apps/api
npm run migration:run

# 5. Seed database
cd ../..
npm run seed

# 6. Start development
npm run dev
```

### Environment Setup

Create `.env` files (examples provided):

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Admin Web
cp apps/admin-web/.env.local.example apps/admin-web/.env.local

# User Web
cp apps/user-web/.env.local.example apps/user-web/.env.local
```

Key environment variables:
- `DB_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `GEMINI_API_KEY` - Google Gemini for chatbot (optional)

---

## 💻 Development

### Start All Apps

```bash
npm run dev  # Starts API + Admin + User Web in parallel
```

### Start Individual Apps

```bash
npm run dev:api      # API only (http://localhost:3000)
npm run dev:admin    # Admin only (http://localhost:3001)
npm run dev:user     # User Web only (http://localhost:3002)
```

### Docker Commands

```bash
npm run docker:up     # Start PostgreSQL + Redis
npm run docker:down   # Stop all containers
npm run docker:logs   # View logs
```

### Database Commands

```bash
cd apps/api

# Migrations
npm run migration:generate -- src/migrations/YourName  # Create
npm run migration:run                                  # Apply
npm run migration:revert                               # Rollback

# Seeding
cd ../..
npm run seed                    # Fresh seed (clears data)
npm run seed:comprehensive      # Add to existing data
```

### Code Quality

```bash
npm run lint    # Run linters
npm run test    # Run tests
npm run build   # Build all apps
```

---

## 📚 Documentation

### Essential Guides
- 🔒 **[documentation/SECURITY-PUBLIC-API.md](./documentation/SECURITY-PUBLIC-API.md)** - Public/Admin API separation (CRITICAL)
- 📝 **[documentation/MONOREPO_README.md](./documentation/MONOREPO_README.md)** - Monorepo structure
- 🤖 **[documentation/CHATBOT_GUIDE.md](./documentation/CHATBOT_GUIDE.md)** - AI Chatbot setup
- 📧 **[documentation/NEWSLETTER_HTML_GUIDE.md](./documentation/NEWSLETTER_HTML_GUIDE.md)** - Newsletter feature
- 🌱 **[documentation/SEEDING_GUIDE.md](./documentation/SEEDING_GUIDE.md)** - Database seeding

### Deployment
- 🚀 **[documentation/DEPLOYMENT_MASTER_GUIDE.md](./documentation/DEPLOYMENT_MASTER_GUIDE.md)** - Production deployment
- 🖥️ **[documentation/HETZNER_DEPLOYMENT_GUIDE.md](./documentation/HETZNER_DEPLOYMENT_GUIDE.md)** - Hetzner server setup
- ⚙️ **[documentation/GITHUB_ACTIONS_SETUP.md](./documentation/GITHUB_ACTIONS_SETUP.md)** - CI/CD configuration

### AI Context
- 🤖 **[.github/AGENTS.md](./.github/AGENTS.md)** - Living project context & change log
- 📋 **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - AI coding instructions

---

## 🗄️ Database Schema

### Key Entities

**Property**
- Unique code (e.g., "NIS-001")
- Type: Apartment, House, Office, Commercial, Garage, Land
- Status: Active, Sold, Reserved, Inactive
- Pricing, area, location (lat/lon)
- Multiple images (OneToMany)
- Linked client (OneToOne)

**Client**
- Owner/buyer information
- Transaction type: Buyer, Seller, Rents, RentsOut
- Payment type: Cash, Credit, Combined
- Linked to one property

**User**
- JWT authentication
- Roles: ADMIN, USER
- Bcrypt password hashing

**PropertyImage**
- Multiple per property
- Order and favorite flag
- Relationship to Property

### Sample Data

After seeding, you'll have:
- 👥 **4 Users** (admin, manager, 2 agents)
- 🏠 **10 Properties** (apartments, houses, offices, garage)
- 👤 **5 Clients** (buyers, sellers, renters)
- 🖼️ **20+ Images** (assigned to properties)

---

## 🔐 Security

### Authentication
- JWT tokens (access + refresh)
- Bcrypt password hashing (10 rounds)
- Role-based guards (@Roles decorator)

### API Separation
⚠️ **Critical**: Two separate endpoints:
- **Admin**: `/v1/properties` - Full data including sensitive fields
- **Public**: `/v1/properties/public` - Sanitized data only

Public API **MUST NOT** expose:
- `salePrice` (internal agency price)
- `comment` (internal notes)
- `client` (owner information)
- Full `address` (only `neighborhood`)

See [documentation/SECURITY-PUBLIC-API.md](./documentation/SECURITY-PUBLIC-API.md)

---

## 🚀 Deployment

### Production Build

```bash
# Build all apps
npm run build

# Start production servers
cd apps/api && npm run start:prod
cd apps/admin-web && npm start
cd apps/user-web && npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### PM2 (Recommended)

See [documentation/DEPLOYMENT_MASTER_GUIDE.md](./documentation/DEPLOYMENT_MASTER_GUIDE.md)

---

## 🧪 Testing

### API Testing

```bash
# Test scripts (Node.js)
node test-login.js              # Auth endpoints
node test-upload.js             # File upload
node test-api-comprehensive.js  # Full API test
node test-public-api.js         # Public endpoints
```

### Postman Collection

Import `postman/Real-Estate-API-v2-Complete.postman_collection.json`

### Manual Testing

```bash
# Health check
curl http://localhost:3000

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get properties
curl http://localhost:3000/v1/properties/public
```

---

## 🛠️ Troubleshooting

### Common Issues

**Port already in use**
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

**PostgreSQL won't start**
```bash
docker-compose down -v
docker volume prune
./fresh-start.sh
```

**Migration errors**
```bash
cd apps/api
npm run migration:revert  # Undo last
npm run migration:run     # Try again
```

**Seed fails**
```bash
# Drop and recreate database
docker exec estates_postgres psql -U postgres -c "DROP DATABASE estates;"
docker exec estates_postgres psql -U postgres -c "CREATE DATABASE estates;"
cd apps/api && npm run migration:run
cd ../.. && npm run seed
```

**Dependencies issues**
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

---

## 📦 Project Commands Reference

```bash
# Development
npm run dev              # All apps
npm run dev:api          # API only
npm run dev:admin        # Admin only
npm run dev:user         # User Web only

# Docker
npm run docker:up        # Start services
npm run docker:down      # Stop services
npm run docker:logs      # View logs

# Database
npm run seed             # Seed database
npm run fresh-start      # Complete reset

# Build
npm run build            # Build all apps
npm run lint             # Lint all apps
npm run test             # Test all apps
```

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

---

## 📄 License

[Your License Here]

---

## 👥 Team

[Your Team Information]

---

## 📞 Support

- 📖 Documentation: `documentation/` folder
- 🐛 Issues: [GitHub Issues]
- 💬 Discussions: [GitHub Discussions]

---

## ⭐ Quick Links

- **Fresh Start Guide**: [FRESH_START_GUIDE.md](./FRESH_START_GUIDE.md)
- **Quick Reference**: [QUICK_START.md](./QUICK_START.md)
- **API Documentation**: http://localhost:3000/api (when running)
- **Database Credentials**: `documentation/DATABASE_CREDENTIALS.md`
- **Admin Credentials**: `documentation/ADMIN_CREDENTIALS.md`

---

**Version**: 2.0.0  
**Last Updated**: February 4, 2026  
**Status**: ✅ Production Ready
