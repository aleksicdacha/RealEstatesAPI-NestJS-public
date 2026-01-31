# 🌱 Database Seeding Guide - Local Development

## Quick Start

### Run Complete Seed (Recommended)
```bash
cd apps/api
npm run seed:dev
```

This will create:
- ✅ Default admin user (username: `admin`, password: `admin123`)
- ✅ Default agent user (username: `agent`, password: `agent123`)
- ✅ 3 sample clients (with contact info and JMBG)
- ℹ️  Properties can be created via admin panel

**Note**: The seed script is idempotent - it won't duplicate existing data.

---

## ⚡ Fast Setup (3 Commands)

```bash
# 1. Make sure PostgreSQL is running
docker compose up -d postgres redis

# 2. Run migrations to create tables
cd apps/api
npm run migration:run

# 3. Seed the database
npm run seed:dev
```

---

## 🔐 Default Credentials

### Admin User
```
Username: admin
Email: admin@realestates.com
Password: admin123
Role: admin
```

### Agent User
```
Username: agent
Email: agent@realestates.com
Password: agent123
Role: user
```

---

## 📊 What Gets Created

### Users (2)
- **admin** - Full admin access to all features
- **agent** - Regular user/agent access

### Clients (3)
1. Marko Marković - Seller, with JMBG and contact details
2. Ana Petrović - Seller, with JMBG and contact details
3. Nikola Jovanović - Seller, with JMBG and contact details

### Properties
Properties are NOT seeded automatically. You can:
- Create them manually via the admin panel (recommended)
- Or modify the seed script to add sample properties matching your schema

**Why no property seeding?**
The Property entity has a complex schema with many fields, enums, and relationships. It's better to create your first properties through the admin panel wizard which handles all validations, required fields, and relationships correctly.

---

## 🛠️ Available Seed Scripts

### Full Development Seed (Recommended)
```bash
npm run seed:dev
```
Creates users, clients, and properties with realistic data.

### Admin User Only
```bash
npm run seed:users
```
Creates only the admin user (from old script).

---

## 🔄 Re-running Seeds

The seed script is **idempotent** - it checks if data already exists:

- If admin user exists → Skips user creation
- If clients exist → Skips client creation  
- If properties exist → Skips property creation

To completely reset the database:

```bash
# Option 1: Revert migrations and re-run
cd apps/api
npm run migration:revert  # Run multiple times to revert all
npm run migration:run
npm run seed:dev

# Option 2: Drop and recreate database (PostgreSQL)
docker exec -it estates_postgres psql -U postgres -c "DROP DATABASE estates;"
docker exec -it estates_postgres psql -U postgres -c "CREATE DATABASE estates;"
cd apps/api
npm run migration:run
npm run seed:dev
```

---

## 🧪 Testing the Seed

### 1. Check Users
```bash
# Via API
curl http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Via Database
docker exec -it estates_postgres psql -U postgres -d estates -c "SELECT id, username, email, role FROM users;"
```

### 2. Check Properties
Since properties aren't seeded, create your first one:
1. Login to admin panel: http://localhost:3001
2. Navigate to Properties
3. Click "Create New Property"
4. Fill in the wizard form (Property → Client → Images → Location)
5. Save

Then check via API:
```bash
# Via API (Public endpoint - will be empty until you create properties)
curl http://localhost:3000/v1/properties/public

# Via Database
docker exec -it estates_postgres psql -U postgres -d estates -c "SELECT code, description, price FROM properties;"
```

### 3. Login to Admin Panel
1. Navigate to http://localhost:3001
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. You should see the dashboard with 5 properties

---

## 📝 Customizing Seed Data

Edit `/seeds/local-development-seed.ts` to:

- Add more users
- Change passwords
- Add more clients
- Customize properties
- Add different property types

Example - Add a new user:

```typescript
const newUser = userRepository.create({
  username: 'yourname',
  email: 'yourname@example.com',
  password: await bcrypt.hash('yourpassword', 10),
  role: 'admin',
});
await userRepository.save(newUser);
```

---

## 🚨 Troubleshooting

### "Cannot find module" error
```bash
# Make sure you're in the right directory
cd apps/api

# Install dependencies if needed
npm install
```

### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start it if not running
docker compose up -d postgres

# Verify .env file exists
ls -la apps/api/.env
```

### "Tables don't exist"
```bash
# Run migrations first
cd apps/api
npm run migration:run
```

### "Duplicate key error"
```bash
# Data already exists, that's okay!
# The seed script will skip existing records
# Check output for "⚠️ already exists" messages
```

### Want to start fresh?
```bash
# Drop all tables and recreate
cd apps/api
npm run migration:revert  # Run until "No migrations to revert"
npm run migration:run
npm run seed:dev
```

---

## 🎯 Production vs Development

### ⚠️ IMPORTANT: This seed is for LOCAL DEVELOPMENT ONLY!

**DO NOT run `seed:dev` on production server!**

For production:
- Create admin user manually through API
- Or use a dedicated production seed with secure passwords
- Never commit passwords to git

---

## 📦 Seed File Location

```
RealEstatesAPI-NestJS/
└── seeds/
    ├── local-development-seed.ts  ← Main seed (USE THIS)
    ├── create-admin.ts            ← Admin only (legacy)
    ├── seed-users.ts              ← Old script
    ├── seed-clients.ts            ← Old script
    └── seed-properties.ts         ← Old script
```

---

## ✅ Success Checklist

After running the seed, verify:

- [ ] Seed script completed without errors
- [ ] Can login to admin panel with admin/admin123
- [ ] Dashboard loads successfully
- [ ] Can navigate to Clients section and see 3 clients
- [ ] Can navigate to Properties section (will be empty)
- [ ] Can create a new property via the wizard
- [ ] Database has 2 users, 3 clients
- [ ] User table has admin and agent accounts

---

## 🎓 Next Steps After Seeding

1. **Start the backend**:
   ```bash
   cd apps/api
   npm run start:dev
   ```

2. **Start the admin panel**:
   ```bash
   cd apps/admin-web
   npm run dev
   ```

3. **Login to admin panel**:
   - URL: http://localhost:3001
   - Username: admin
   - Password: admin123

4. **Create your first property**:
   - Click on "Properties" in the sidebar
   - Click "Create New Property"
   - Follow the wizard (all steps are required)
   - Select one of the seeded clients as the owner

5. **Test the public website**:
   ```bash
   cd apps/user-web
   npm run dev
   ```
   - URL: http://localhost:3002
   - Should show properties you created in admin panel

---

**Happy coding! 🚀**
