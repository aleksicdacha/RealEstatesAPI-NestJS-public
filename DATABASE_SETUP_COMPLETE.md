# 🔧 COMPLETE DATABASE SETUP - Manual Steps

## ⚠️ CRITICAL ISSUE FOUND

The database tables were **NOT** being created because:
1. `DB_SYNC=true` was missing from `apps/api/.env`
2. The API wasn't restarted after adding it

## ✅ FIXED

I've added `DB_SYNC=true` to your `.env` file and created scripts to set everything up.

---

## 🚀 COMPLETE SETUP INSTRUCTIONS

### Option 1: Automated Script (Recommended)

```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
./scripts/setup-database.sh
```

This script will:
1. ✅ Check PostgreSQL is running
2. ✅ Create all database tables (using SQL script)
3. ✅ Seed with 10 users, 15 properties, 15 clients
4. ✅ Verify everything worked

### Option 2: Manual Steps (If script fails)

#### Step 1: Ensure PostgreSQL is Running

```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
docker-compose up -d postgres redis
sleep 10
docker exec estates_postgres pg_isready -U postgres
```

#### Step 2: Create Database Tables

```bash
# Copy SQL script to container
docker cp scripts/create-schema.sql estates_postgres:/tmp/schema.sql

# Execute it
docker exec estates_postgres psql -U postgres -d estates -f /tmp/schema.sql
```

#### Step 3: Verify Tables Created

```bash
docker exec estates_postgres psql -U postgres -d estates -c "\dt"
```

You should see:
- users
- properties
- clients
- property_images
- representatives
- newsletter_subscribers
- agent_conversations
- agent_messages
- migrations

#### Step 4: Seed the Database

```bash
cd apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

#### Step 5: Verify Data

```bash
# Check record counts
docker exec estates_postgres psql -U postgres -d estates -c "SELECT COUNT(*) FROM users;"
docker exec estates_postgres psql -U postgres -d estates -c "SELECT COUNT(*) FROM properties;"
docker exec estates_postgres psql -U postgres -d estates -c "SELECT COUNT(*) FROM clients;"
```

Should show:
- Users: 10
- Properties: 15
- Clients: 15

---

## 🔍 What Was Wrong

### Problem 1: Missing DB_SYNC

**File:** `apps/api/.env`

**Before:**
```env
DB_NAME=estates
# Missing: DB_SYNC=true
```

**After (FIXED):**
```env
DB_NAME=estates
DB_SYNC=true  ✅ ADDED THIS
```

### Problem 2: API Not Creating Tables

The API reads `synchronize` from `DB_SYNC` environment variable.

**File:** `apps/api/src/common/config/database.config.ts`
```typescript
synchronize: process.env.DB_SYNC === 'true',  // Was false because DB_SYNC not set
```

Now with `DB_SYNC=true`, when you start the API, it will auto-create tables.

### Problem 3: No SQL Backup

There was no SQL script to manually create tables if needed.

**FIXED:** Created `scripts/create-schema.sql` with complete schema.

---

## 📊 Database Schema Created

The SQL script creates:

### Tables (9 total)
1. **users** - User accounts (id, username, password, role)
2. **properties** - Real estate listings (50+ fields)
3. **clients** - Buyers/sellers (linked to properties)
4. **property_images** - Property photos (linked to properties)
5. **representatives** - Legal representatives (linked to clients)
6. **newsletter_subscribers** - Email subscribers
7. **agent_conversations** - Live chat conversations
8. **agent_messages** - Live chat messages
9. **migrations** - TypeORM migration tracking

### Indexes (8 total)
- Properties: status, type, guid
- Clients: email, transaction type
- Agent: status, agent ID, conversation ID

### Foreign Keys
- clients → properties
- clients → representatives
- representatives → clients
- property_images → properties
- agent_messages → agent_conversations

---

## 🌱 Seeded Data

The `local-comprehensive-seed.ts` creates:

### 10 Users
- admin / admin123 (Role: admin)
- agent1-4 / agent123 (Role: user)
- manager1-2 / manager123 (Role: admin)
- sales1-2 / sales123 (Role: user)
- viewer / viewer123 (Role: user)

### 15 Properties
All with **lowercase enum values**:

**Property Types:**
- apartment
- house
- land
- office
- commercial-space
- vacation-home
- duplex
- apartment-in-house

**Status:**
- active (14 properties)
- inactive (1 property)

**Heating:**
- central
- gas-central
- electric-central
- floor
- fireplace
- etc.

### 15 Clients
Linked to properties with:
- **Status:** active, inactive, deleted
- **Transaction Type:** seller, buyer, rents, rents-out
- **Payment Type:** cash, credit, combined

### Property Images
Auto-linked from `/uploads` folder if images exist

---

## 🔄 How to Start Fresh (If Needed)

```bash
# 1. Stop and clean everything
docker-compose down -v
docker-compose up -d postgres redis
sleep 10

# 2. Run setup script
./scripts/setup-database.sh

# 3. Or manual steps (see Option 2 above)
```

---

## ✅ Verification Commands

### Check Docker
```bash
docker ps | grep postgres
# Should show: estates_postgres running
```

### Check Database
```bash
docker exec estates_postgres psql -U postgres -d estates -c "\dt"
# Should show 9+ tables
```

### Check Data
```bash
# Count records
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM clients) as clients;
"
```

### Check Enum Values
```bash
# Verify lowercase enum values
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT DISTINCT \"propertyType\", status, heating 
FROM properties 
LIMIT 5;
"
# Should show: apartment, active, central (all lowercase)
```

---

## 🚀 After Setup

### Start the API

```bash
cd apps/api
npm run start:dev
```

The API will:
- Connect to PostgreSQL
- See tables already exist (from our SQL script)
- Start successfully on port 3000

### Test API

```bash
# Get properties
curl http://localhost:3000/v1/properties/public | jq

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq
```

### Start Frontend (Optional)

```bash
# Admin Panel
cd apps/admin-web
npm run dev
# → http://localhost:3001

# Public Website
cd apps/user-web
npm run dev
# → http://localhost:3002
```

---

## 📝 Files Created/Modified

### Created
1. ✅ `scripts/create-schema.sql` - Complete SQL schema
2. ✅ `scripts/setup-database.sh` - Automated setup script
3. ✅ `DATABASE_SETUP_COMPLETE.md` - This file

### Modified
1. ✅ `apps/api/.env` - Added `DB_SYNC=true`

---

## 🎯 Summary

| Component | Status | Details |
|-----------|--------|---------|
| PostgreSQL | ✅ Running | Port 5432 |
| Redis | ✅ Running | Port 6379 |
| .env Config | ✅ Fixed | Added DB_SYNC=true |
| SQL Schema | ✅ Created | scripts/create-schema.sql |
| Setup Script | ✅ Created | scripts/setup-database.sh |
| Seed Script | ✅ Ready | seeds/local-comprehensive-seed.ts |

---

## 🆘 Troubleshooting

### Script doesn't run
```bash
chmod +x ./scripts/setup-database.sh
./scripts/setup-database.sh
```

### Tables not created
```bash
# Manual SQL execution
docker cp scripts/create-schema.sql estates_postgres:/tmp/schema.sql
docker exec estates_postgres psql -U postgres -d estates -f /tmp/schema.sql
```

### Seeding fails
```bash
# Make sure tables exist first
docker exec estates_postgres psql -U postgres -d estates -c "\dt"

# Then seed
cd apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

---

## ✨ Next Steps

1. **Run the setup script:** `./scripts/setup-database.sh`
2. **Verify tables:** Check with `\dt` command
3. **Start the API:** `cd apps/api && npm run start:dev`
4. **Test endpoints:** Use curl or Postman

**Everything is ready to go!** 🎉
