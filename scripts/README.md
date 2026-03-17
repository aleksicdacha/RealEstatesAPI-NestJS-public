# Code Quality & Deployment Scripts

This directory contains scripts to help maintain code quality, identify areas for improvement, and automate server setup tasks.

## Available Scripts

### Deployment Scripts

#### `setup-server-complete.sh` ⭐ (Main Setup Script)
**Complete one-command Hetzner server setup.** Installs everything and deploys your application.

**Usage (on a fresh Ubuntu 24.04 server):**
```bash
# If you already have the repo cloned
cd /root/RealEstatesAPI-NestJS
bash scripts/setup-server-complete.sh

# Or download and run directly
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/RealEstatesAPI-NestJS/develop/scripts/setup-server-complete.sh -o setup.sh
bash setup.sh
```

**What it does:**
- ✅ Updates Ubuntu system
- ✅ Installs Docker, Node.js 20, Nginx, PM2, Git
- ✅ Clones project from GitHub (develop branch)
- ✅ Configures all environment files automatically
- ✅ Starts PostgreSQL and Redis databases
- ✅ Installs dependencies and builds applications
- ✅ Runs database migrations
- ✅ Starts all apps with PM2
- ✅ Configures Nginx reverse proxy
- ✅ Sets up firewall
- ✅ (Optional) Configures SSL with Let's Encrypt
- ✅ Saves all credentials to `/root/.realestates-credentials`

**Time:** ~10-15 minutes  
**Use when:** Setting up a new server from scratch

**See also:** 
- `documentation/COMPLETE_HETZNER_SETUP_GUIDE.md`
- `DEPLOY_QUICK_START.md`

---

#### `setup-filebrowser-secure.sh`
Automated installation of Filebrowser with secure credentials (no default admin/admin).

**Usage:**
```bash
# On your Hetzner server
cd /root/RealEstatesAPI-NestJS
bash scripts/setup-filebrowser-secure.sh
```

**What it does:**
- ✅ Downloads and installs Filebrowser
- ✅ Prompts for secure username and password (no defaults)
- ✅ Configures systemd service for auto-start
- ✅ Sets up firewall rules
- ✅ Displays access URL and credentials
- ✅ Optionally saves credentials to secure file

**See also:** `documentation/HETZNER_FILE_BROWSER_SETUP.md`

#### `clean-server-quick.sh`
Quick clean-up of project files while keeping installed packages.

**Usage:**
```bash
# On your Hetzner server
ssh root@YOUR_SERVER_IP
cd /root/RealEstatesAPI-NestJS
bash scripts/clean-server-quick.sh
```

**What it removes:**
- ❌ Project files in /root/RealEstatesAPI-NestJS
- ❌ Docker containers and volumes
- ❌ PM2 processes and data
- ❌ Uploaded files
- ❌ Nginx site configurations

**What it keeps:**
- ✅ Docker (installed)
- ✅ Node.js & npm (installed)
- ✅ Nginx (installed)
- ✅ All system packages

**Time:** ~2 minutes  
**Use when:** Redeploying the same project fresh

**See also:** `documentation/HETZNER_CLEAN_START_GUIDE.md`

#### `clean-server-deep.sh`
Complete server reset - removes ALL installed packages except Ubuntu base system.

**Usage:**
```bash
# On your Hetzner server
ssh root@YOUR_SERVER_IP
cd /root/RealEstatesAPI-NestJS
bash scripts/clean-server-deep.sh
```

**⚠️ WARNING:** This removes EVERYTHING:
- ❌ All project files
- ❌ Docker + containers + images
- ❌ Node.js + npm
- ❌ Nginx
- ❌ PostgreSQL + all databases
- ❌ Redis
- ❌ SSL certificates
- ❌ Custom services

**What it keeps:**
- ✅ Ubuntu OS
- ✅ SSH keys
- ✅ User accounts

**Confirmation required:** Must type "DELETE EVERYTHING"

**Time:** ~5 minutes  
**Use when:** Starting a completely different project or troubleshooting major issues

**See also:** `documentation/HETZNER_CLEAN_START_GUIDE.md`

---

### Code Quality Scripts

#### `find-console-logs.sh`
Scans the codebase for `console.log`, `console.error`, and other console statements that should be replaced with NestJS Logger.

**Usage:**
```bash
chmod +x scripts/find-console-logs.sh
./scripts/find-console-logs.sh
```

**Purpose:**
- Identifies files using console statements
- Counts occurrences by type
- Helps prioritize migration to proper logging

### Future Scripts (TODO)
- `check-missing-validators.sh` - Find DTOs without validation decorators
- `check-uncommented-guards.sh` - Find controllers with commented auth guards
- `audit-env-variables.sh` - Verify all required env vars are documented

## Best Practices

1. **Run before commits** - Check for console.log usage
2. **Regular audits** - Run monthly to catch regressions
3. **CI Integration** - Add to pre-commit hooks or CI pipeline

## Example Output

```
🔍 Scanning for console.log/console.error usage...

📁 Files with console statements:
  - apps/api/src/entities/user/user.service.ts (12 occurrences)
  - apps/api/src/main.ts (5 occurrences)

📊 Summary by type:
  console.log:   45
  console.error: 8

💡 Recommended fix: Replace with NestJS Logger
```
