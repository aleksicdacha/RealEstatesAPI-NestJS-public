# 🚨 Emergency Server Clean Commands

## Quick Reference - Copy & Paste Ready

### Option 1: Quick Clean (Keep Packages) ⚡
```bash
ssh root@YOUR_SERVER_IP "cd /root/RealEstatesAPI-NestJS && bash scripts/clean-server-quick.sh"
```

### Option 2: Deep Clean (Remove Everything) 🔥
```bash
ssh root@YOUR_SERVER_IP "cd /root/RealEstatesAPI-NestJS && bash scripts/clean-server-deep.sh"
```

---

## If Scripts Don't Exist (Manual Commands)

### Quick Manual Clean
```bash
ssh root@YOUR_SERVER_IP << 'EOF'
# Stop services
pm2 kill 2>/dev/null || true
docker compose down -v 2>/dev/null || true
systemctl stop nginx filebrowser 2>/dev/null || true

# Remove project
rm -rf /root/RealEstatesAPI-NestJS
rm -rf /root/.pm2

# Clean Docker
docker system prune -af --volumes

# Clean packages
npm cache clean --force 2>/dev/null || true
apt-get clean && apt-get autoremove -y

echo "✅ Quick clean complete!"
EOF
```

### Deep Manual Clean
```bash
ssh root@YOUR_SERVER_IP << 'EOF'
# Stop everything
systemctl stop nginx postgresql redis filebrowser 2>/dev/null || true
pm2 kill 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove project files
rm -rf /root/RealEstatesAPI-NestJS /root/.pm2 /var/www/* /uploads

# Remove Docker
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
rm -rf /var/lib/docker /etc/docker

# Remove Node.js
apt-get purge -y nodejs npm
rm -rf /usr/local/lib/node_modules /root/.npm

# Remove Nginx
apt-get purge -y nginx nginx-common
rm -rf /etc/nginx

# Remove PostgreSQL
apt-get purge -y postgresql postgresql-contrib
rm -rf /var/lib/postgresql

# Clean up
apt-get autoremove -y && apt-get clean

echo "✅ Deep clean complete!"
EOF
```

---

## Pre-Clean Backup (Run First!)

### Backup Everything
```bash
ssh root@YOUR_SERVER_IP << 'EOF'
cd /root
docker exec postgres pg_dump -U postgres estates > backup-$(date +%Y%m%d).sql 2>/dev/null || echo "No DB"
cd /root/RealEstatesAPI-NestJS 2>/dev/null && tar -czf /root/env-backup.tar.gz apps/*/\.env* .env 2>/dev/null || echo "No .env"
tar -czf /root/uploads-backup.tar.gz uploads 2>/dev/null || echo "No uploads"
ls -lh /root/*backup* 2>/dev/null || echo "No backups created"
EOF
```

### Download Backups to Local Machine
```bash
scp root@YOUR_SERVER_IP:~/backup-*.sql .
scp root@YOUR_SERVER_IP:~/*-backup.tar.gz .
```

---

## After Clean: Fresh Deploy

### Quick Deploy (if packages still installed)
```bash
ssh root@YOUR_SERVER_IP << 'EOF'
cd /root
git clone https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
# Copy your .env files here, then:
docker compose up -d
npm run build --workspaces
pm2 start ecosystem.config.js
pm2 save
EOF
```

### Full Deploy (if packages removed)
```bash
ssh root@YOUR_SERVER_IP
# Follow: documentation/HETZNER_DEPLOYMENT_GUIDE.md
```

---

## Check What's Running

```bash
ssh root@YOUR_SERVER_IP << 'EOF'
echo "=== PM2 Processes ==="
pm2 list 2>/dev/null || echo "PM2 not running"

echo -e "\n=== Docker Containers ==="
docker ps 2>/dev/null || echo "Docker not installed"

echo -e "\n=== Services ==="
systemctl status nginx --no-pager 2>/dev/null | head -3 || echo "Nginx not running"
systemctl status postgresql --no-pager 2>/dev/null | head -3 || echo "PostgreSQL not running"

echo -e "\n=== Disk Usage ==="
df -h / | tail -1

echo -e "\n=== Project Directory ==="
ls -la /root/RealEstatesAPI-NestJS 2>/dev/null || echo "Project directory not found"
EOF
```

---

## Nuclear Option (Hetzner Console)

1. Login: https://console.hetzner.cloud
2. Click your server
3. **Power** → **Rebuild**
4. Select **Ubuntu 24.04**
5. Keep SSH key checked
6. Click **Rebuild**
7. Wait 2-3 minutes

---

## Emergency Rollback (If You Have Hetzner Backups)

1. Login: https://console.hetzner.cloud
2. Click your server
3. **Backups** tab
4. Click **Restore from backup**
5. Select date
6. Confirm
7. Wait 5-10 minutes

---

**📚 Full Documentation:** `documentation/HETZNER_CLEAN_START_GUIDE.md`
