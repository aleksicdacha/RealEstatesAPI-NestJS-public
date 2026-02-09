# 📋 Quick Reference Card - Real Estate Platform

## 🚀 Start Applications (Production)

```bash
cd ~/RealEstatesAPI-NestJS
./scripts/deploy-production.sh
```

**OR manual:**
```bash
cd ~/RealEstatesAPI-NestJS
git pull origin main && npm install && npm run build && pm2 restart all
```

---

## 📊 PM2 Commands

| Action | Command |
|--------|---------|
| **Status** | `pm2 status` |
| **Logs (all)** | `pm2 logs` |
| **Logs (API)** | `pm2 logs realestates-api` |
| **Monitor** | `pm2 monit` |
| **Restart all** | `pm2 restart all` |
| **Stop all** | `pm2 stop all` |
| **Start all** | `pm2 start all` |
| **Delete all** | `pm2 delete all` |
| **Save config** | `pm2 save` |
| **Startup script** | `pm2 startup` |

---

## 🗄️ Database Commands

```bash
# Start PostgreSQL
docker compose up -d postgres

# Stop
docker compose stop postgres

# Restart
docker compose restart postgres

# View logs
docker logs $(docker ps -qf "name=postgres")

# Connect to DB
docker exec -it $(docker ps -qf "name=postgres") psql -U estates_user -d estates_prod

# Run migrations
cd ~/RealEstatesAPI-NestJS/apps/api && npm run migration:run

# Backup database
docker exec -t $(docker ps -qf "name=postgres") pg_dump -U estates_user estates_prod > backup_$(date +%Y%m%d).sql
```

---

## 🔄 Development Workflow

### Local (Development):
```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
npm run dev  # Hot reload enabled
```

### Deploy to Production:
```bash
# Option 1: Automated (GitHub Actions)
git push origin main  # Auto-deploys

# Option 2: Manual
ssh realestates@YOUR_SERVER_IP
cd ~/RealEstatesAPI-NestJS
./scripts/deploy-production.sh
```

---

## 🌐 Access URLs

| Service | Development | Production |
|---------|-------------|------------|
| **API** | http://localhost:3000 | http://YOUR_IP:3000 |
| **Admin** | http://localhost:3001 | http://YOUR_IP:3001 |
| **User Web** | http://localhost:3002 | http://YOUR_IP:3002 |

**With Nginx/Domain:**
- API: https://api.yourdomain.com
- Admin: https://admin.yourdomain.com
- User: https://yourdomain.com

---

## 🔧 Troubleshooting

### Apps won't start:
```bash
pm2 logs --lines 100
pm2 delete all
# Re-run start commands from PRODUCTION_QUICK_START.md
```

### Database errors:
```bash
docker ps  # Check if postgres is running
docker restart $(docker ps -qf "name=postgres")
docker logs $(docker ps -qf "name=postgres")
```

### Out of memory:
```bash
free -h  # Check memory
pm2 restart all --node-args="--max-old-space-size=2048"
```

### Disk space:
```bash
df -h  # Check disk
docker system prune -a  # Clean Docker
npm cache clean --force
```

---

## 🔒 Security

### Change default admin password:
1. Login to admin panel
2. Go to Users
3. Edit admin user
4. Change password
5. Save

### Environment variables:
```bash
nano ~/RealEstatesAPI-NestJS/apps/api/.env
# Change JWT_SECRET and DB_PASSWORD
pm2 restart all
```

### Firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 📦 Useful Commands

### Server info:
```bash
# Check resources
free -h       # Memory
df -h         # Disk
top           # CPU
htop          # Better top (install: sudo apt install htop)

# Check ports
sudo lsof -i :3000  # API
sudo lsof -i :3001  # Admin
sudo lsof -i :3002  # User Web
```

### Git:
```bash
git status
git log --oneline -10
git branch -a
git checkout main
git pull origin main
```

### npm:
```bash
npm install
npm run build
npm run migration:run
npm run seed:users
```

---

## 📚 Documentation Quick Links

| Guide | Purpose |
|-------|---------|
| **PRODUCTION_QUICK_START.md** | Start apps on server |
| **AUTOMATED_DEPLOYMENT_GUIDE.md** | CI/CD setup |
| **HETZNER_DEPLOYMENT_GUIDE.md** | Full deployment |
| **GITHUB_AUTH_ERROR_FIX.md** | Fix Git auth |
| **HETZNER_DEPLOYMENT_INDEX.md** | Navigate all docs |

---

## 🆘 Emergency Contacts

- **Server IP:** _________________
- **Admin Email:** admin@example.com (default)
- **Admin Password:** _________________ (change from default!)
- **Database Password:** _________________ (from .env)
- **GitHub Repo:** github.com/aleksicdacha/RealEstatesAPI-NestJS

---

## 💾 Backup Checklist

- [ ] Database backup (weekly)
- [ ] Environment files backup
- [ ] Uploaded images backup
- [ ] Git repository pushed
- [ ] Hetzner server backups enabled

---

**Quick Start:** `documentation/PRODUCTION_QUICK_START.md`

**Deploy:** `./scripts/deploy-production.sh`

**Logs:** `pm2 logs`

**Status:** `pm2 status`
