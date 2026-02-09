# 🚀 Hetzner Server Deployment Guide
## Real Estate Platform - Production Deployment

> **Server Recommendation:** CPX22 (2 vCPU, 4GB RAM, 80GB SSD) - €5.99/month

---

## 📋 Table of Contents
1. [SSH Key Setup](#ssh-key-setup)
2. [Hetzner Server Creation](#hetzner-server-creation)
3. [Initial Server Configuration](#initial-server-configuration)
4. [Project Deployment](#project-deployment)
5. [Domain & SSL Setup](#domain--ssl-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🔐 SSH Key Setup

### Step 1: Find or Create Your SSH Key

Run this command to check for existing keys:

```bash
ls -la ~/.ssh/*.pub
```

**If you see files like:**
- `id_ed25519.pub`
- `id_rsa.pub`
- Any file ending with `.pub`

✅ **You already have SSH keys!** Proceed to Step 2.

**If you see "No such file":**

Create a new SSH key:

```bash
ssh-keygen -t ed25519 -C "hetzner-realestates" -f ~/.ssh/id_ed25519_hetzner
```

Press Enter for all prompts (no passphrase for automation, or set one for security).

### Step 2: Display Your Public Key

```bash
cat ~/.ssh/id_ed25519.pub
# OR if you have older RSA key:
cat ~/.ssh/id_rsa.pub
```

You'll see something like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... your-email@example.com
```

### Step 3: Copy the ENTIRE Line

**⚠️ IMPORTANT:**
- Copy the **PUBLIC key** (`.pub` file) - the one that starts with `ssh-ed25519` or `ssh-rsa`
- **NEVER** share your private key (the file without `.pub`)

---

## 🖥️ Hetzner Server Creation

### 1. In Hetzner Console

Navigate to: https://console.hetzner.com/projects/[YOUR_PROJECT]/servers/create

### 2. Select Server Configuration

| Setting | Value |
|---------|-------|
| **Type** | Regular Performance (Shared Resources) |
| **Server** | **CPX22** - €5.99/mo |
| **vCPUs** | 2 (AMD) |
| **RAM** | 4 GB |
| **Storage** | 80 GB SSD |
| **Traffic** | 20 TB |
| **Location** | Nuremberg (or closest to your target audience) |
| **Image** | Ubuntu 24.04 |
| **Networking** | IPv4 + IPv6 |

### 3. Add SSH Key

Scroll down to **"SSH Keys"** section:

1. Click **"Add SSH Key"**
2. Paste your **public key** (from Step 2 above)
3. Give it a name: `My Laptop` or `Development Machine`
4. Click **"Add"**
5. Make sure it's **checked/selected** for this server

### 4. Server Name

Set a descriptive name:
```
realestates-production
```

### 5. Create & Buy

Click the red **"Create & Buy now"** button (bottom right).

---

## ⚙️ Initial Server Configuration

### 1. Wait for Server to Start

You'll get an IP address (e.g., `95.217.123.45`). Wait 1-2 minutes for it to fully boot.

### 2. First SSH Connection

```bash
ssh root@YOUR_SERVER_IP
```

Example:
```bash
ssh root@95.217.123.45
```

If prompted about fingerprint, type `yes`.

### 3. Update System

```bash
apt update && apt upgrade -y
```

### 4. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version
```

### 5. Install Git & Node.js

```bash
# Install Git
apt install git -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Verify
node --version
npm --version
```

### 6. Create Application User (Security Best Practice)

```bash
# Create user
adduser realestates
# Set a strong password when prompted

# Add to docker group
usermod -aG docker realestates

# Grant sudo privileges
usermod -aG sudo realestates
```

### 7. Switch to Application User

```bash
su - realestates
```

---

## 📦 Project Deployment

### 1. Set Up GitHub Authentication

**IMPORTANT:** GitHub no longer accepts passwords. Choose one option:

#### Option A: SSH Key (Recommended for long-term)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-deploy-$(hostname)" -f ~/.ssh/github_deploy -N ""

# Display public key to copy
cat ~/.ssh/github_deploy.pub
```

**Then:**
1. Copy the public key (entire output)
2. Go to: https://github.com/settings/keys
3. Click "New SSH key"
4. Paste key, name it "Hetzner Server"
5. Click "Add SSH key"

**Configure SSH:**
```bash
cat > ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub

# Test connection
ssh -T git@github.com
# Should see: "Hi [username]! You've successfully authenticated..."
```

#### Option B: Personal Access Token (Quick method)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Set scope to: ✅ `repo`
4. Copy the token (starts with `ghp_`)

**Use token when cloning:**
```bash
git clone https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git
```

**📚 See detailed guide:** `documentation/GITHUB_SSH_SETUP_SERVER.md`

---

### 2. Clone Repository

**With SSH (recommended):**
```bash
cd ~
git clone git@github.com:YOUR_USERNAME/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
```

**With Token:**
```bash
cd ~
git clone https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

### 3. Configure Environment Variables

#### Backend (`apps/api/.env`)

```bash
nano apps/api/.env
```

Add production configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=estates_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=estates_prod

# Security
JWT_SECRET=YOUR_32_CHAR_MIN_SECRET_KEY_CHANGE_THIS
NODE_ENV=production

# Server
PORT=3000

# CORS - Replace with your actual domain
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# Google APIs (Optional)
GEMINI_API_KEY=your_gemini_key_if_you_have_one
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Email (if using newsletter)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**⚠️ CRITICAL:** Change `JWT_SECRET` and `DB_PASSWORD` to strong random values!

Generate strong secrets:
```bash
openssl rand -base64 32
```

#### User Web (`apps/user-web/.env.local`)

```bash
nano apps/user-web/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

#### Admin Web (`apps/admin-web/.env.local`)

```bash
nano apps/admin-web/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
```

### 4. Update Docker Compose for Production

```bash
nano docker-compose.yml
```

Update PostgreSQL password to match your `.env` file:

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: estates_user
      POSTGRES_PASSWORD: YOUR_STRONG_PASSWORD_HERE  # Same as DB_PASSWORD
      POSTGRES_DB: estates_prod
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
```

### 5. Start Database

```bash
docker compose up -d postgres
```

Wait 10 seconds for PostgreSQL to initialize.

### 6. Install Dependencies

```bash
npm install
```

### 7. Build Shared Packages

```bash
cd packages/types
npm run build
cd ../..
```

### 8. Run Database Migrations

```bash
cd apps/api
npm run migration:run
```

### 9. Seed Initial Data (Admin User)

```bash
npm run seed:users
```

Default admin credentials will be created (see `documentation/ADMIN_CREDENTIALS.md`).

### 10. Build All Applications

```bash
cd ~/RealEstatesAPI-NestJS
npm run build
```

This builds:
- `apps/api` (NestJS)
- `apps/admin-web` (Next.js)
- `apps/user-web` (Next.js)

### 11. Start Applications with PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start API
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production

# Start Admin Web
cd ../admin-web
pm2 start npm --name "realestates-admin" -- start

# Start User Web
cd ../user-web
pm2 start npm --name "realestates-user" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed (copy/paste the command)
```

### 12. Verify Applications

```bash
pm2 status
```

You should see:
```
┌─────┬────────────────────────┬─────────┬─────────┐
│ id  │ name                   │ status  │ restart │
├─────┼────────────────────────┼─────────┼─────────┤
│ 0   │ realestates-api        │ online  │ 0       │
│ 1   │ realestates-admin      │ online  │ 0       │
│ 2   │ realestates-user       │ online  │ 0       │
└─────┴────────────────────────┴─────────┴─────────┘
```

Check logs:
```bash
pm2 logs realestates-api --lines 50
```

---

## 🌐 Domain & SSL Setup

### Option A: Using Nginx Reverse Proxy (Recommended)

#### 1. Install Nginx

```bash
sudo apt install nginx -y
```

#### 2. Install Certbot (for free SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 3. Configure Nginx for API

```bash
sudo nano /etc/nginx/sites-available/realestates-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Configure Nginx for User Web

```bash
sudo nano /etc/nginx/sites-available/realestates-user
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. Configure Nginx for Admin Web

```bash
sudo nano /etc/nginx/sites-available/realestates-admin
```

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. Enable Sites

```bash
sudo ln -s /etc/nginx/sites-available/realestates-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/realestates-user /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/realestates-admin /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. Obtain SSL Certificates

```bash
# For API
sudo certbot --nginx -d api.yourdomain.com

# For User Web
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For Admin Web
sudo certbot --nginx -d admin.yourdomain.com
```

Follow the prompts. Certbot will automatically configure HTTPS and set up auto-renewal.

#### 8. Update CORS in Backend

Update `apps/api/.env`:

```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
```

Restart API:
```bash
pm2 restart realestates-api
```

---

## 📊 Monitoring & Maintenance

### PM2 Monitoring

```bash
# View all processes
pm2 status

# View logs
pm2 logs

# View specific app logs
pm2 logs realestates-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart realestates-api

# Restart all
pm2 restart all
```

### System Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
```

### Database Backup

```bash
# Create backup script
nano ~/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec -t $(docker ps -qf "name=postgres") pg_dump -U estates_user estates_prod > $BACKUP_DIR/estates_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "estates_*.sql" -mtime +7 -delete

echo "Backup completed: estates_$DATE.sql"
```

Make executable and run:

```bash
chmod +x ~/backup-db.sh

# Test it
./backup-db.sh

# Schedule daily backups (3 AM)
crontab -e
# Add this line:
0 3 * * * /home/realestates/backup-db.sh
```

### Security Updates

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Firewall (UFW)

```bash
# Install and configure
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🔧 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs realestates-api --lines 100

# Check if port is in use
sudo lsof -i :3000

# Restart with fresh state
pm2 delete realestates-api
cd ~/RealEstatesAPI-NestJS/apps/api
pm2 start dist/main.js --name "realestates-api"
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Check PostgreSQL logs
docker logs $(docker ps -qf "name=postgres")

# Connect to database manually
docker exec -it $(docker ps -qf "name=postgres") psql -U estates_user -d estates_prod
```

### Out of Memory

```bash
# Check memory usage
free -h
pm2 status

# Restart apps
pm2 restart all
```

### SSL Certificate Renewal

Certbot auto-renews, but you can test:

```bash
sudo certbot renew --dry-run
```

---

## 📚 Additional Resources

- [NestJS Production Deployment](https://docs.nestjs.com/faq/deployment)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Hetzner Docs](https://docs.hetzner.com/)

---

## ✅ Deployment Checklist

- [ ] SSH key added to Hetzner
- [ ] CPX22 server created
- [ ] System updated (`apt update && upgrade`)
- [ ] Docker & Docker Compose installed
- [ ] Node.js 20.x installed
- [ ] Application user created
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Strong passwords set for DB & JWT
- [ ] Database started (`docker compose up -d postgres`)
- [ ] Dependencies installed (`npm install`)
- [ ] Shared packages built
- [ ] Migrations run
- [ ] Admin user seeded
- [ ] All apps built (`npm run build`)
- [ ] PM2 processes started
- [ ] PM2 configured for auto-start
- [ ] Nginx installed and configured
- [ ] Domain DNS records pointed to server IP
- [ ] SSL certificates obtained
- [ ] CORS origins updated
- [ ] Firewall configured
- [ ] Database backups automated
- [ ] Monitoring set up

---

**🎉 Your Real Estate Platform is now live in production!**

For issues or questions, check the troubleshooting section or project documentation.
