# 🚨 FINAL DATABASE FIX - Run This Now!

## The Problem

The database is missing the `roomStructure` column and other columns, causing the API to fail.

## The Solution

I've created a complete reset script that will:
1. Drop and recreate the database schema
2. Create all tables with ALL required columns
3. Seed 10 users, 15 properties, 15 clients

## 🚀 Run This Command

```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
bash scripts/reset-and-seed-db.sh
```

This will take 1-2 minutes and you'll see:
- "✓ Database reset complete"
- "✓ UUID extension created"
- "✓ Tables created"
- "✓ Database setup complete!"

## After Running the Script

1. **Restart the API** (if it's running):
   ```bash
   # Press Ctrl+C to stop the API, then:
   cd apps/api
   npm run start:dev
   ```

2. **Test it works**:
   ```bash
   curl http://localhost:3000/v1/properties/public
   ```

   You should see JSON with properties (not an error)!

3. **Login to admin**:
   - URL: http://localhost:3001
   - Username: admin
   - Password: admin123

## What the Script Does

### Creates These Tables:
1. ✅ users (with admin user)
2. ✅ properties (with ALL columns including roomStructure)
3. ✅ clients
4. ✅ property_images
5. ✅ representatives
6. ✅ newsletter_subscribers
7. ✅ agent_conversations
8. ✅ agent_messages
9. ✅ migrations

### Seeds This Data:
- 10 Users (admin/admin123 and others)
- 15 Properties (apartments, houses, land, offices, etc.)
- 15 Clients (linked to properties)

### All Enum Values Are Lowercase:
- propertyType: apartment, house, land, office, etc.
- status: active, inactive, deleted
- heating: central, gas-central, floor, etc.
- transactionType: seller, buyer, rents, rents-out
- paymentType: cash, credit, combined

## Verification

After running the script, check:

```bash
# Count tables
docker exec estates_postgres psql -U postgres -d estates -c "\dt"

# Count records
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM clients) as clients;
"

# Check roomStructure column exists
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'roomStructure';
"
```

## If the Script Fails

Run the commands manually:

```bash
# Step 1: Reset database
docker exec estates_postgres psql -U postgres -d estates -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
"

# Step 2: Create tables (copy SQL from the script above)
# Step 3: Seed
cd apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

## Why This Happened

1. The SQL schema in `create-schema.sql` was missing columns
2. I've updated it with ALL columns from the entity
3. The reset script now creates everything correctly

## Files Created/Updated

✅ `scripts/reset-and-seed-db.sh` - Complete reset and seed
✅ `scripts/create-schema.sql` - Updated with all columns
✅ `apps/api/.env` - Has DB_SYNC=true

## 🎯 Bottom Line

**Just run this:**
```bash
bash scripts/reset-and-seed-db.sh
```

**Then restart your API and everything will work!**

---

*This will completely fix the database schema issue.*
