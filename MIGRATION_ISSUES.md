# 🚨 Migration Issues - Quick Fix Guide

## Problem

Several migration files are corrupted and preventing the setup from completing:
1. `1768240550665-CreateNewsletterSubscriber.ts` - Incomplete
2. `1766761605636-CreateRepresentativeEntity.ts` - Corrupted syntax
3. `1736189000000-CreateAgentChatTables.ts` - Syntax errors

## Temporary Solution (Quick Fix)

Since this is for **local development only**, we can use TypeORM's `synchronize` feature to automatically create the database schema from entities.

### Step 1: Enable Synchronization

Edit `apps/api/src/data-source.ts`:

```typescript
export const AppDataSource = new DataSource({
  // ... other config ...
  synchronize: true,  // Change from false to true
  //...
});
```

### Step 2: Run Setup

```bash
# Clean database
docker-compose down -v
docker-compose up -d postgres redis

# Wait for PostgreSQL
sleep 10

# Start API (it will auto-create tables)
cd apps/api
npm run start:dev
```

The API will automatically create all tables based on your entities.

### Step 3: Run Seeds

```bash
cd apps/api
npx ts-node -r tsconfig-paths/register ../../seeds/local-comprehensive-seed.ts
```

## Permanent Solution (For Production)

### Option 1: Fix Corrupted Migrations

Manually fix each corrupted migration file (time-consuming).

### Option 2: Create Fresh Migration

```bash
# 1. Reset database
docker-compose down -v
docker-compose up -d postgres

# 2. Generate new migration from entities
cd apps/api
npm run migration:generate -- src/migrations/InitialSchema

# 3. Run it
npm run migration:run
```

### Option 3: Use Working Initial Migration

The `1700000000000-InitialSchema.ts` migration might already have the basic schema.

## Why Migrations Failed

1. **TypeScript Path Aliases**: The `@src/` imports in entities weren't resolving properly
2. **Corrupted Files**: Some migration files have syntax errors
3. **Missing Imports**: Migration files missing proper TypeORM imports

## Fixes Applied

1. ✅ Added `tsconfig-paths/register` to data-source.ts
2. ✅ Fixed migration scripts in package.json
3. ✅ Created proper tsconfig for migrations
4. ✅ Fixed some corrupted migrations

## Still TODO

- [ ] Fix remaining corrupted migrations OR
- [ ] Use synchronize for local dev
- [ ] Generate fresh migration for production

## Recommendation

**For local development**: Use `synchronize: true`  
**For production**: Fix migrations properly or generate fresh one

---

*This is a quick reference for the migration issues encountered during setup.*
