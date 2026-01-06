# 🏠 Real Estate Platform - Monorepo

Moderni real estate platform sa **NestJS API-jem** i **Next.js** frontend aplikacijama organizovan kao **Turborepo monorepo**.

---

## 📁 Monorepo Struktura

```
RealEstatesAPI-NestJS/
├── apps/
│   ├── api/                    # NestJS Backend API (TODO: premestiti src/)
│   ├── admin-web/              # Admin Panel (TODO: premestiti admin-frontend/)
│   └── user-web/               # 🆕 User-facing aplikacija ✅
├── packages/
│   ├── types/                  # ✅ Deljeni TypeScript tipovi
│   ├── api-client/             # ✅ API client
│   ├── utils/                  # ✅ Utility funkcije  
│   ├── ui/                     # TODO: Deljene UI komponente
│   └── config/                 # TODO: Deljene konfiguracije
├── turbo.json                  # ✅ Turborepo konfiguracija
├── pnpm-workspace.yaml         # ✅ Workspace definicija
└── package.json                # ✅ Root package.json
```

---

## 🚀 Quick Start

### Instalacija

```bash
npm install
# ili
pnpm install  # preporučeno
```

### Development - Sve Aplikacije

```bash
npm run dev              # Sve aplikacije
npm run dev:api          # Samo API (port 3000)
npm run dev:admin        # Samo Admin (port 3001)
npm run dev:user         # Samo User Web (port 3002)
```

### Build

```bash
npm run build            # Build sve
npm run build:user       # Build samo user-web
```

---

## 📦 Aplikacije

### 🌐 User Web - http://localhost:3002
**Javna web aplikacija za korisnike**

**Stack:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Google Maps API
- next-intl (SR/EN)

**Features:**
- 🏠 Homepage sa search barom
- 🔍 Napredna pretraga nekretnina
- 🗺️ Interaktivna mapa sa markerima
- 📸 Galerija slika
- 📱 Full responsive (mobile-first)
- 🌍 Multi-language (Srpski/English)
- 💾 Featured properties
- 📞 Kontakt forma

**Inspiracija:** CityExpert.rs UI/UX

---

### 🔐 Admin Web - http://localhost:3001
**Admin panel za upravljanje**

**Stack:**
- Next.js 15
- PrimeReact
- TypeScript

**Features:**
- Property management (CRUD)
- Client management
- User management
- Image upload & crop
- Analytics dashboard
- Role-based access

---

### 🚀 API - http://localhost:3000
**NestJS RESTful API**

**Stack:**
- NestJS 11
- TypeORM
- PostgreSQL
- JWT Auth
- Passport

**Endpoints:**
- `/api/auth` - Authentication
- `/api/properties` - Properties CRUD
- `/api/clients` - Clients management
- `/api/users` - User management
- `/api/uploads` - File uploads

---

## 📚 Shared Packages

### `@repo/types`
TypeScript tipovi za ceo projekat

```typescript
import { Property, PropertyType, TransactionType } from '@repo/types';
```

**Exports:**
- Property, Client, User interfejsi
- Enums (PropertyType, PropertyStatus, etc.)
- API response tipovi
- Pagination tipovi

---

### `@repo/api-client`
Centralizovani type-safe API client

```typescript
import { apiClient } from '@repo/api-client';

const properties = await apiClient.getProperties({
  type: ['APARTMENT'],
  minPrice: 50000,
  maxPrice: 150000
});
```

**Features:**
- Axios sa interceptorima
- Auto JWT token handling
- Type-safe calls
- Error handling

---

### `@repo/utils`
Utility funkcije

```typescript
import { formatPrice, getPropertyTypeLabel } from '@repo/utils';

formatPrice(120000) // "120.000 €"
getPropertyTypeLabel('APARTMENT', 'sr') // "Stan"
```

**Functions:**
- `formatPrice()` - Format cene
- `formatArea()` - Format kvadrature
- `formatDate()` - Format datuma
- `getPropertyTypeLabel()` - Prevodi tipove
- `generatePropertySlug()` - URL slugs
- `calculateMortgage()` - Kalkulacija kredita
- `debounce()` - Debounce helper
- `cn()` - ClassName utility

---

## 🛠️ Development

### Dodavanje Paketa

```bash
# Za aplikaciju
pnpm add axios --filter user-web

# Za workspace package
pnpm add react --filter @repo/ui

# Root dependency
pnpm add -w turbo
```

### Korišćenje Workspace Paketa

```typescript
// U apps/user-web
import { Property } from '@repo/types';
import { formatPrice } from '@repo/utils';
import { apiClient } from '@repo/api-client';

const property: Property = await apiClient.getProperty(1);
const price = formatPrice(property.price);
```

### Kreiranje Komponente

```bash
# U user-web
touch apps/user-web/components/PropertyCard.tsx
```

---

## 🌍 Environment Variables

### User Web (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Admin Web
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### API
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=realestate
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

---

## 📝 Roadmap

### Phase 1: Monorepo Setup ✅
- [x] Turborepo konfiguracija
- [x] Workspace packages (types, api-client, utils)
- [x] User-web Next.js app
- [x] Multi-language support

### Phase 2: User Frontend (In Progress)
- [ ] Property listing stranica
- [ ] Property details stranica
- [ ] Google Maps integracija
- [ ] Advanced filters
- [ ] Contact forma
- [ ] Responsive navigation
- [ ] Footer
- [ ] SEO optimizacija

### Phase 3: Integration
- [ ] API integration
- [ ] Image optimization
- [ ] Performance tuning
- [ ] Error boundaries
- [ ] Loading states

### Phase 4: Refactoring
- [ ] Premesti `src/` → `apps/api/`
- [ ] Premesti `admin-frontend/` → `apps/admin-web/`
- [ ] Kreiraj `@repo/ui` package
- [ ] Docker Compose update
- [ ] CI/CD pipeline

---

## 🎯 Getting Started

### 1. Build Packages
```bash
cd packages/types && npm run build
cd ../api-client && npm run build
cd ../utils && npm run build
```

### 2. Start User Web
```bash
cd apps/user-web
npm install
npm run dev
```

### 3. Open Browser
http://localhost:3002/sr

---

## 🔗 Links

- **User Web:** http://localhost:3002
- **Admin Web:** http://localhost:3001
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs

---

## 📚 Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Radix UI |
| **State** | React Query, Context API |
| **Backend** | NestJS 11, TypeORM |
| **Database** | PostgreSQL |
| **Auth** | JWT, Passport |
| **Monorepo** | Turborepo |
| **Maps** | Google Maps API |
| **i18n** | next-intl |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

Private - All Rights Reserved

---

# Legacy Documentation (Old README)

<details>
<summary>Click to expand original README content...</summary>
