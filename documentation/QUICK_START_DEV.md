# 🚀 Quick Start - Local Development

## ⚡ One-Click Setup

```bash
# Run the deployment script
./deploy.sh

# Select option 1 (LOCAL)
```

**That's it!** The script automatically:
- ✅ Starts PostgreSQL & Redis (Docker)
- ✅ Runs database migrations
- ✅ Seeds test data (admin user + clients)
- ✅ Starts API (hot reload)
- ✅ Starts Admin Panel (hot reload)
- ✅ Starts User Website (hot reload)

## 🔐 Login Credentials

```
Admin Panel: http://localhost:3001
Username: admin
Password: admin123
```

## 📊 What Was Created

✅ Admin user (admin/admin123)  
✅ Agent user (agent/agent123)  
✅ 3 Sample clients  
⚠️ No properties (create via admin panel)

## 🌐 Access Points

- **API**: http://localhost:3000
- **Admin**: http://localhost:3001  
- **Website**: http://localhost:3002
- **Database**: localhost:5432 (postgres/CHANGE_ME)

## 🏠 Create First Property

1. Login to admin panel
2. Navigate to "Properties"
3. Click "Create New Property"
4. Fill in all wizard steps:
   - Property details
   - Select client
   - Upload images
   - Set location
5. Click Save

---

## 🛠️ Manual Commands (Advanced)

If you prefer to run services manually:

### Terminal 1 - Database
```bash
docker compose up -d postgres redis
```

### Terminal 2 - API
```bash
cd apps/api
npm run start:dev
```

### Terminal 3 - Admin Panel  
```bash
cd apps/admin-web
npm run dev
```

### Terminal 4 - User Website
```bash
cd apps/user-web
npm run dev
```

---

## 🔄 Stop Services

```bash
# Stop Docker services
docker compose down

# Kill dev processes
kill $(cat .dev-*.pid 2>/dev/null)
```

---

**Need help?** See [DEPLOYMENT_MASTER_GUIDE.md](./DEPLOYMENT_MASTER_GUIDE.md) for full documentation.
