# 🚀 Complete Hetzner Server Setup & GitHub Auto-Deploy Guide

## Real Estate Platform - From Zero to Production

**Last Updated:** January 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Create Hetzner Server](#part-1-create-hetzner-server)
4. [Part 2: One-Command Setup](#part-2-one-command-setup)
5. [Part 3: GitHub Auto-Deploy](#part-3-github-auto-deploy)
6. [Part 4: Domain & SSL Setup](#part-4-domain--ssl-setup)
7. [Part 5: Maintenance & Troubleshooting](#part-5-maintenance--troubleshooting)
8. [Quick Reference](#quick-reference)

---

## Overview

This guide will help you:
- ✅ Create a fresh Hetzner server
- ✅ Deploy the Real Estate Platform with **one command**
- ✅ Set up GitHub Actions for **automatic deployment** on push to `develop` branch
- ✅ Configure domain and SSL (optional)

**Time Required:**
- Server creation: ~5 minutes
- Automated setup: ~10 minutes
- GitHub Actions: ~5 minutes
- **Total: ~20 minutes**

---

## Prerequisites

Before you start, you need:

- [ ] **Hetzner Cloud Account** - https://console.hetzner.cloud
- [ ] **GitHub Account** with your repository
- [ ] **SSH Key** on your local machine
- [ ] **(Optional)** Domain name pointed to your server

### Check for SSH Key

```bash
# On your LOCAL machine (not the server)
ls -la ~/.ssh/*.pub
```

If you see `id_ed25519.pub` or `id_rsa.pub`, you have SSH keys. If not, create one:

```bash
ssh-keygen -t ed25519 -C "hetzner-server"
# Press Enter for all prompts
```

### Display Your Public Key

```bash
cat ~/.ssh/id_ed25519.pub
# OR
cat ~/.ssh/id_rsa.pub
```

**Copy this entire line** - you'll paste it in Hetzner Console.

---

## Part 1: Create Hetzner Server

### Step 1.1: Open Hetzner Console

Go to: https://console.hetzner.cloud

### Step 1.2: Create New Server

Click **"Add Server"** or the **"+"** button.

### Step 1.3: Configure Server

| Setting | Value |
|---------|-------|
| **Location** | Nuremberg (EU), or closest to your users |
| **Image** | **Ubuntu 24.04** |
| **Type** | Shared vCPU → **CPX21** (€4.35/mo) or **CPX22** (€5.99/mo) |
| **Networking** | Public IPv4 ✅, IPv6 ✅ |
| **SSH Keys** | Click "Add SSH Key" → Paste your public key |
| **Name** | `realestates-production` |

### Step 1.4: Create Server

Click **"Create & Buy now"**

### Step 1.5: Get Your Server IP

Once created, you'll see the **IPv4 address** (e.g., `95.217.123.45`).

**Copy this IP address** - you'll need it.

### Step 1.6: Wait 1-2 Minutes

Let the server fully boot before continuing.

---

## Part 2: One-Command Setup

### Step 2.1: SSH Into Your Server

```bash
ssh root@YOUR_SERVER_IP
```

Example:
```bash
ssh root@95.217.123.45
```

If asked about fingerprint, type `yes`.

### Step 2.2: Download and Run Setup Script

**Option A: If you have the repository public:**

```bash
# Download the setup script directly
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/RealEstatesAPI-NestJS/develop/scripts/setup-server-complete.sh -o setup.sh

# Make it executable
chmod +x setup.sh

# Run it
bash setup.sh
```

**Option B: Manual setup script download:**

```bash
# Update system first
apt update && apt upgrade -y

# Install git
apt install -y git curl

# Clone your repository (develop branch)
git clone --branch develop https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS

# Run the setup script
bash scripts/setup-server-complete.sh
```

### Step 2.3: Follow the Prompts

The script will ask you for:

1. **GitHub repository URL** - e.g., `https://github.com/yourusername/RealEstatesAPI-NestJS.git`
2. **Is it private?** - If yes, provide your GitHub Personal Access Token
3. **Domain name** - Leave empty if you don't have one yet
4. **Database password** - Accept generated or enter your own
5. **Google Maps API Key** - Optional, for maps functionality
6. **Gemini API Key** - Optional, for chatbot

### Step 2.4: Wait for Setup (~10 minutes)

The script will:
- ✅ Update system
- ✅ Install Docker, Node.js 20, Nginx, PM2
- ✅ Clone your repository (develop branch)
- ✅ Configure all environment files
- ✅ Start PostgreSQL database
- ✅ Install dependencies
- ✅ Build all applications
- ✅ Run database migrations
- ✅ Start applications with PM2
- ✅ Configure Nginx
- ✅ Setup firewall

### Step 2.5: Access Your Application

When complete, you'll see:

```
╔═══════════════════════════════════════════════════════════════╗
║   ✅ SETUP COMPLETE! Your server is ready!                   ║
╚═══════════════════════════════════════════════════════════════╝

📌 Access Your Applications:

   🌐 User Website:  http://YOUR_SERVER_IP
   🔐 Admin Panel:   http://YOUR_SERVER_IP:81
   📡 API:           http://YOUR_SERVER_IP:3000/v1

🔑 Default Admin Login:
   Email:    admin@google.com
   Password: admin123
   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!
```

**Open these URLs in your browser to verify everything works!**

---

## Part 3: GitHub Auto-Deploy

Set up automatic deployment whenever you push to the `develop` branch.

### Step 3.1: Generate SSH Key on Server (for GitHub Actions)

```bash
# On your Hetzner server
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Display the private key (you'll add this to GitHub Secrets)
cat ~/.ssh/github_actions

# Add public key to authorized keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

**Copy the entire private key** (including `-----BEGIN` and `-----END-----` lines).

### Step 3.2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `HETZNER_HOST` | Your server IP (e.g., `95.217.123.45`) |
| `HETZNER_USERNAME` | `root` |
| `HETZNER_SSH_KEY` | Paste the private key from Step 3.1 |

### Step 3.3: Verify Workflow File

The workflow file is already in your repository at:
`.github/workflows/deploy-production.yml`

### Step 3.4: Test Auto-Deploy

1. Make any small change to your code
2. Commit and push to `develop` branch:

```bash
git add .
git commit -m "Test auto-deploy"
git push origin develop
```

3. Go to your GitHub repository → **Actions** tab
4. Watch the deployment run!

### Step 3.5: Manual Deploy (Optional)

You can also trigger deployment manually:

1. Go to **Actions** → **"Deploy to Hetzner Production"**
2. Click **"Run workflow"**
3. Select `develop` branch
4. Click **"Run workflow"** button

---

## Part 4: Domain & SSL Setup

### Step 4.1: Point Domain to Server

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

Add these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 300 |
| A | www | YOUR_SERVER_IP | 300 |
| A | admin | YOUR_SERVER_IP | 300 |

Wait 5-30 minutes for DNS to propagate.

### Step 4.2: Verify DNS

```bash
# Check if domain points to your server
ping yourdomain.com
# Should show your server IP

# Or use dig
dig yourdomain.com +short
```

### Step 4.3: Run Domain Setup

If you didn't configure domain during initial setup:

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Run domain setup script
cd /root/RealEstatesAPI-NestJS
bash scripts/setup-domain.sh
```

Or manually configure:

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Update Nginx config with your domain
nano /etc/nginx/sites-available/realestates

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com

# Certbot will automatically update Nginx config
```

### Step 4.4: Update Environment Files

```bash
# Update API CORS
nano /root/RealEstatesAPI-NestJS/apps/api/.env
# Change CORS_ORIGIN to include your domain

# Update frontend API URL
nano /root/RealEstatesAPI-NestJS/apps/user-web/.env.local
# Change to: NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1

# Rebuild and restart
cd /root/RealEstatesAPI-NestJS
npm run build
pm2 restart all
```

---

## Part 5: Maintenance & Troubleshooting

### Check Application Status

```bash
# PM2 status
pm2 status

# Expected output:
┌────┬──────────┬─────────┬─────────┬──────────┐
│ id │ name     │ status  │ restart │ cpu      │
├────┼──────────┼─────────┼─────────┼──────────┤
│ 0  │ api      │ online  │ 0       │ 0%       │
│ 1  │ admin-web│ online  │ 0       │ 0%       │
│ 2  │ user-web │ online  │ 0       │ 0%       │
└────┴──────────┴─────────┴─────────┴──────────┘
```

### View Logs

```bash
# All logs
pm2 logs

# API logs only
pm2 logs api

# Last 100 lines
pm2 logs --lines 100

# Follow logs in real-time
pm2 logs -f
```

### Restart Applications

```bash
# Restart all
pm2 restart all

# Restart specific app
pm2 restart api
pm2 restart admin-web
pm2 restart user-web
```

### Check Database

```bash
# Is PostgreSQL running?
docker ps

# Connect to database
docker exec -it estates_postgres psql -U postgres -d estates

# List tables
\dt

# Exit
\q
```

### Check Disk Space

```bash
df -h /
```

### Check Memory

```bash
free -h
```

### Update Application Manually

```bash
cd /root/RealEstatesAPI-NestJS

# Pull latest changes
git fetch origin develop
git reset --hard origin/develop

# Install dependencies
npm ci

# Build
npm run build

# Run migrations
cd apps/api && npm run migration:run && cd ../..

# Restart
pm2 restart all
```

### Common Issues

#### Application not responding

```bash
# Check if PM2 is running
pm2 status

# Check logs for errors
pm2 logs api --lines 50

# Restart
pm2 restart all
```

#### Database connection error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
cd /root/RealEstatesAPI-NestJS
docker compose -f docker-compose.prod.yml up -d postgres

# Check database logs
docker logs estates_postgres
```

#### Nginx not working

```bash
# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

# Check Nginx status
systemctl status nginx
```

#### Port already in use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
pm2 kill
pm2 start ecosystem.config.js
```

### Backup Database

```bash
# Create backup
docker exec estates_postgres pg_dump -U postgres estates > /root/backup-$(date +%Y%m%d).sql

# Download to local machine (run on YOUR computer)
scp root@YOUR_SERVER_IP:/root/backup-*.sql .
```

### Restore Database

```bash
# Upload backup to server (from YOUR computer)
scp backup-20260127.sql root@YOUR_SERVER_IP:/root/

# Restore on server
docker exec -i estates_postgres psql -U postgres estates < /root/backup-20260127.sql
```

---

## Quick Reference

### Server Information

```
# View saved credentials
cat /root/.realestates-credentials

# Project directory
cd /root/RealEstatesAPI-NestJS

# Environment files
apps/api/.env
apps/user-web/.env.local
apps/admin-web/.env.local
```

### URLs (Without Domain)

| Service | URL |
|---------|-----|
| User Website | http://YOUR_SERVER_IP |
| Admin Panel | http://YOUR_SERVER_IP:81 |
| API | http://YOUR_SERVER_IP:3000/v1 |

### URLs (With Domain)

| Service | URL |
|---------|-----|
| User Website | https://yourdomain.com |
| Admin Panel | https://admin.yourdomain.com |
| API | https://yourdomain.com/api/v1 |

### Default Admin Credentials

```
Email: admin@google.com
Password: admin123
⚠️ CHANGE THIS IMMEDIATELY!
```

### Essential Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart apps
pm2 restart all

# Check database
docker ps

# Update from GitHub
cd /root/RealEstatesAPI-NestJS && git pull origin develop && npm run build && pm2 restart all

# Check disk space
df -h /

# Check memory
free -h
```

### GitHub Actions Workflow

**Automatic deploy:** Push to `develop` branch triggers deployment.

**Manual deploy:** GitHub → Actions → Deploy to Hetzner Production → Run workflow

### File Locations

```
/root/RealEstatesAPI-NestJS/          # Project root
├── apps/
│   ├── api/                          # NestJS API (port 3000)
│   ├── admin-web/                    # Admin panel (port 3001)
│   └── user-web/                     # User website (port 3002)
├── packages/
│   └── types/                        # Shared TypeScript types
├── docker-compose.prod.yml           # Database containers
└── .env.development                  # Docker environment

/root/.realestates-credentials        # Saved credentials
/etc/nginx/sites-available/realestates # Nginx config
```

---

## Support & Documentation

### Related Documentation

- `documentation/HETZNER_DEPLOYMENT_GUIDE.md` - Original deployment guide
- `documentation/PRODUCTION_QUICK_START.md` - Quick start reference
- `documentation/ADMIN_CREDENTIALS.md` - Admin login info
- `documentation/DATABASE_CREDENTIALS.md` - Database credentials
- `documentation/CHATBOT_GUIDE.md` - AI chatbot setup

### Troubleshooting Guides

- `documentation/GITHUB_AUTH_ERROR_FIX.md` - GitHub authentication issues
- `documentation/HETZNER_CLEAN_START_GUIDE.md` - Reset server

---

## Checklist

### Initial Setup
- [ ] Created Hetzner server with Ubuntu 24.04
- [ ] Added SSH key to server
- [ ] Ran setup script successfully
- [ ] Can access User Website in browser
- [ ] Can access Admin Panel in browser
- [ ] Logged into Admin Panel and changed password

### GitHub Actions
- [ ] Created SSH key on server for GitHub Actions
- [ ] Added `HETZNER_HOST` secret to GitHub
- [ ] Added `HETZNER_USERNAME` secret to GitHub
- [ ] Added `HETZNER_SSH_KEY` secret to GitHub
- [ ] Tested deployment by pushing to `develop`

### Domain (Optional)
- [ ] DNS records pointing to server
- [ ] SSL certificate installed
- [ ] Environment files updated with domain
- [ ] Applications rebuilt and restarted

---

## Congratulations! 🎉

Your Real Estate Platform is now:
- ✅ Running on Hetzner Cloud
- ✅ Automatically deploying from GitHub
- ✅ Secured with firewall
- ✅ (Optional) Using your custom domain with SSL

**Every time you push to `develop` branch, your server automatically updates!**

---

*Need help? Check the documentation files or create a GitHub issue.*
