# ⚡ Quick Start Guide - Production Server

## Files are on server - Start applications NOW!

---

## 🚀 Method 1: Quick Start (Copy-Paste Commands)

### On Your Hetzner Server:

```bash
# 1. Navigate to project
cd ~/RealEstatesAPI-NestJS

# 2. Create production environment file
cp apps/api/.env.example apps/api/.env

# 3. Generate secrets
echo "JWT_SECRET=$(openssl rand -base64 32)" >> apps/api/.env
echo "DB_PASSWORD=$(openssl rand -base64 24)" >> apps/api/.env

# 4. Edit environment file
nano apps/api/.env
```

**In nano, configure these lines:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=estates_user
DB_PASSWORD=<use the generated password above>
DB_NAME=estates_prod
DB_SYNC=false
JWT_SECRET=<use the generated secret above>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

Press `Ctrl+O` to save, `Enter`, then `Ctrl+X` to exit.

```bash
# 5. Start database
docker compose up -d postgres
sleep 10

# 6. Install dependencies
npm install

# 7. Build shared packages
cd packages/types
npm run build
cd ../..

# 8. Run migrations and seed data
cd apps/api
npm run migration:run
npm run seed:users
cd ../..

# 9. Build all applications
npm run build

# 10. Install PM2
sudo npm install -g pm2

# 11. Start applications
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production

cd ../admin-web
pm2 start npm --name "realestates-admin" -- start

cd ../user-web
pm2 start npm --name "realestates-user" -- start

# 12. Save PM2 config
pm2 save

# 13. Setup PM2 to start on boot
pm2 startup
# Run the command it shows you!

# 14. Check status
pm2 status
pm2 logs --lines 20
```

---

## ✅ Verify Everything Works

```bash
# Check PM2 status
pm2 status
# Should show 3 processes: realestates-api, realestates-admin, realestates-user

# Test API
curl http://localhost:3000/v1/properties/public

# Test Admin (should return HTML)
curl http://localhost:3001 | head -20

# Test User Web (should return HTML)
curl http://localhost:3002 | head -20

# View logs
pm2 logs realestates-api --lines 50
```

**Expected PM2 output:**
```
┌────┬────────────────────┬─────────┬─────────┐
│ id │ name               │ status  │ restart │
├────┼────────────────────┼─────────┼─────────┤
│ 0  │ realestates-api    │ online  │ 0       │
│ 1  │ realestates-admin  │ online  │ 0       │
│ 2  │ realestates-user   │ online  │ 0       │
└────┴────────────────────┴─────────┴─────────┘
```

---

## 🌐 Access Applications

Once running, applications are available at:

- **API:** `http://YOUR_SERVER_IP:3000`
- **Admin Panel:** `http://YOUR_SERVER_IP:3001`
- **User Website:** `http://YOUR_SERVER_IP:3002`

**Default admin login:**
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change password immediately after first login!**

---

## 🔧 Method 2: Using Deployment Script

```bash
# Copy deployment script to home directory
cd ~/RealEstatesAPI-NestJS
cp scripts/deploy-production.sh ~/deploy.sh
chmod +x ~/deploy.sh

# Run it
~/deploy.sh
```

This script does everything automatically!

---

## 🎯 Daily Operations

### View Logs:
```bash
pm2 logs                          # All logs
pm2 logs realestates-api          # API only
pm2 logs --lines 100              # Last 100 lines
```

### Restart Services:
```bash
pm2 restart all                   # Restart everything
pm2 restart realestates-api       # Restart API only
pm2 restart realestates-admin     # Restart admin only
```

### Stop Services:
```bash
pm2 stop all                      # Stop everything
pm2 stop realestates-api          # Stop API only
```

### Monitor Resources:
```bash
pm2 monit                         # Real-time monitoring
pm2 status                        # Current status
```

---

## 🔄 Deploy Updates

### Manual deployment:
```bash
cd ~/RealEstatesAPI-NestJS
git pull origin main
npm install
cd packages/types && npm run build && cd ../..
npm run build
pm2 restart all
```

### Or use deployment script:
```bash
~/deploy.sh
```

---

## 🆘 Troubleshooting

### Applications won't start:
```bash
# Check logs
pm2 logs realestates-api --lines 100

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002

# Delete and restart
pm2 delete all
# Then re-run start commands from Quick Start section
```

### Database connection errors:
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker compose restart postgres

# Check database logs
docker logs $(docker ps -qf "name=postgres")
```

### Build errors:
```bash
# Clean and rebuild
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf apps/*/.next apps/*/dist packages/*/dist
npm install
npm run build
```

### Out of memory:
```bash
# Check memory
free -h

# Increase Node.js memory limit
pm2 delete all

# Start with more memory
cd ~/RealEstatesAPI-NestJS/apps/api
pm2 start dist/main.js --name "realestates-api" --node-args="--max-old-space-size=2048"

cd ../admin-web
pm2 start npm --name "realestates-admin" --node-args="--max-old-space-size=2048" -- start

cd ../user-web
pm2 start npm --name "realestates-user" --node-args="--max-old-space-size=2048" -- start
```

---

## 📊 Production Checklist

**Before going live:**
- [ ] Environment variables configured
- [ ] Strong JWT_SECRET set
- [ ] Strong DB_PASSWORD set
- [ ] Database running and migrated
- [ ] Admin user created
- [ ] All 3 applications running (PM2 status shows "online")
- [ ] Nginx configured (see HETZNER_DEPLOYMENT_GUIDE.md)
- [ ] Domain DNS pointed to server
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Backups enabled
- [ ] Default admin password changed
- [ ] CORS configured for your domain

---

## 🚀 Next Steps

1. **Configure Nginx** (reverse proxy + SSL)
   - See: `documentation/HETZNER_DEPLOYMENT_GUIDE.md` - Part "Domain & SSL Setup"

2. **Set up automated deployments**
   - See: `documentation/AUTOMATED_DEPLOYMENT_GUIDE.md`

3. **Configure monitoring**
   - PM2 monitoring
   - Database backups
   - Log rotation

4. **Security hardening**
   - Change default admin password
   - Configure firewall (UFW)
   - Set up fail2ban
   - Enable automatic security updates

---

## 📚 Related Documentation

- **Full deployment:** `documentation/HETZNER_DEPLOYMENT_GUIDE.md`
- **Automated deployments:** `documentation/AUTOMATED_DEPLOYMENT_GUIDE.md`
- **GitHub setup:** `documentation/GITHUB_AUTH_ERROR_FIX.md`
- **Server options:** `documentation/HETZNER_SERVER_OPTIONS_EXPLAINED.md`

---

**Your applications should now be running! 🎉**

Check status: `pm2 status`

View logs: `pm2 logs`

Monitor: `pm2 monit`
