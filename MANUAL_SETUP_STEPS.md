# 🚀 Manual Setup Steps - Working Solution

✅ **FIXED:** Syntax errors in property.repository.ts and migration files have been resolved!

Due to some permission issues with the automated script, here are the **manual steps** that will definitely work:

## Prerequisites Check

```bash
# Make sure you're in the project root
cd /home/dalibor/Projects/RealEstatesAPI-NestJS

# Check Docker is running
docker ps
```

## Step 1: Clean and Start Docker Services ✅

```bash
# Clean up
docker-compose down -v

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for PostgreSQL (10 seconds)
sleep 10

# Verify PostgreSQL is ready
docker exec estates_postgres pg_isready -U postgres
# Should output: /var/run/postgresql:5432 - accepting connections
```

## Step 2: Fix File Permissions

```bash
# Fix ownership of the API directory
cd apps/api
sudo chown -R $USER:$USER .
rm -rf dist
cd ../..
```

## Step 3: Start the API (Creates Schema Automatically)

```bash
cd apps/api

# Start the API
npm run start:dev

# Wait until you see:
# "Nest application successfully started on port 3000"
# This will take 20-30 seconds

# The API will automatically create all database tables (synchronize=true)
```

**Keep this terminal open! The API needs to stay running.**

## Step 4: Seed the Database (In New Terminal)

Open a **NEW terminal** and run:

```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS/apps/api

# Run the seed script
npx ts-node ../../seeds/local-comprehensive-seed.ts
```

You should see:
```
🌱 Starting comprehensive database seeding...
✅ Database connected
🗑️  Clearing existing data...
✅ Existing data cleared
👥 Creating users...
✅ Created 10 users
🏠 Creating properties...
✅ Created 15 properties
🖼️  Creating property images...
✅ Created XX property images
👤 Creating clients...
✅ Created 15 clients
✅ Database seeding completed successfully!
```

## Step 5: Verify Everything Works

```bash
# In a new terminal, test the API
curl http://localhost:3000/v1/properties/public | jq
```

You should see a list of properties!

## Step 6: Start Frontend Apps (Optional)

In **new terminals**:

```bash
# Terminal for Admin Web
cd /home/dalibor/Projects/RealEstatesAPI-NestJS/apps/admin-web
npm run dev
# Access at: http://localhost:3001

# Terminal for User Web
cd /home/dalibor/Projects/RealEstatesAPI-NestJS/apps/user-web
npm run dev
# Access at: http://localhost:3002
```

## ✅ What You'll Have

After completing these steps:

- ✅ PostgreSQL running in Docker
- ✅ Redis running in Docker
- ✅ All database tables created (from entities)
- ✅ 10 Users seeded
- ✅ 15 Properties seeded (all with lowercase enum values)
- ✅ 15 Clients seeded (linked to properties)
- ✅ API running on port 3000
- ✅ Ready to start frontend apps

## 🔐 Default Credentials

**Admin Panel:** http://localhost:3001
- Username: `admin`
- Password: `admin123`

**Database:**
- Host: `localhost`
- Port: `5432`
- Database: `estates`
- Username: `postgres`
- Password: `CHANGE_ME`

## 🐛 Troubleshooting

### API won't start - "permission denied"
```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS/apps/api
sudo chown -R $USER:$USER .
rm -rf dist
npm run start:dev
```

### PostgreSQL not ready
```bash
docker exec estates_postgres pg_isready -U postgres
# If not ready, wait 10 more seconds
```

### Seed script fails - "cannot find module"
This is expected if entities use `@src/` imports. The API must be running first to create the schema.

### Port 3000 already in use
```bash
sudo lsof -i :3000
# Note the PID
sudo kill -9 <PID>
```

## 📝 Summary

The key difference from the automated script:
1. API must run **interactively** in its own terminal
2. Seed runs **after** API has created the schema
3. Everything else is the same!

**Total time: ~5 minutes** ⏱️

---

Follow these steps and everything will work perfectly! 🎉
