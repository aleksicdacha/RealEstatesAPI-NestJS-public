# 🔄 GitHub Actions Auto-Deploy Setup

## Deploy automatically when you push to `develop` branch

---

## 📋 Quick Setup (5 minutes)

### Step 1: Generate SSH Key on Server

SSH into your Hetzner server and run:

```bash
# Generate key specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions -N ""

# Add to authorized keys (so GitHub can SSH in)
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Display the PRIVATE key (copy this for GitHub)
echo ""
echo "===== COPY EVERYTHING BELOW THIS LINE ====="
cat ~/.ssh/github_actions
echo "===== COPY EVERYTHING ABOVE THIS LINE ====="
echo ""
```

**Copy the entire private key** including `***REMOVED***` and `***REMOVED-BY-SECURITY-CLEANUP***`

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (gear icon in top menu)
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

**Add these 3 secrets:**

| Name | Value |
|------|-------|
| `HETZNER_HOST` | Your server IP (e.g., `95.217.123.45`) |
| `HETZNER_USERNAME` | `root` |
| `HETZNER_SSH_KEY` | Paste the entire private key from Step 1 |

### Step 3: Done! Test It

Push any change to `develop` branch:

```bash
git add .
git commit -m "Test auto-deploy"
git push origin develop
```

Go to GitHub → **Actions** tab → Watch your deployment run!

---

## 📁 Workflow File

The workflow file is located at:
```
.github/workflows/deploy-production.yml
```

### What It Does

When you push to `develop` branch:

1. ✅ Connects to your Hetzner server via SSH
2. ✅ Pulls latest code from `develop` branch
3. ✅ Installs dependencies (`npm ci`)
4. ✅ Builds shared packages and applications
5. ✅ Runs database migrations
6. ✅ Restarts all PM2 processes
7. ✅ Verifies deployment is working

---

## 🔧 Manual Deployment

You can also trigger deployment manually:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **"Deploy to Hetzner Production"** in left sidebar
4. Click **"Run workflow"** button (right side)
5. Select `develop` branch
6. Click green **"Run workflow"** button

---

## 📊 Monitor Deployments

### In GitHub

1. Go to **Actions** tab
2. Click on any workflow run to see details
3. Green ✅ = Success, Red ❌ = Failed

### On Server

```bash
# Check PM2 status
pm2 status

# View recent logs
pm2 logs --lines 50

# View API logs only
pm2 logs api --lines 20
```

---

## 🔍 Troubleshooting

### Deployment fails with "Permission denied"

**Cause:** SSH key not properly configured.

**Fix:**
```bash
# On your server, verify the key is in authorized_keys
cat ~/.ssh/authorized_keys | grep github-actions

# If not there, re-add it
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

Also verify the secret `HETZNER_SSH_KEY` contains the correct **private** key (not public).

### Deployment fails with "Host key verification failed"

**Cause:** First-time connection to server.

**Fix:** The workflow should handle this automatically. If not, SSH into the server manually once from any machine to accept the fingerprint.

### npm ci fails

**Cause:** Corrupted `node_modules` or `package-lock.json`.

**Fix:**
```bash
# On your server
cd /root/RealEstatesAPI-NestJS
rm -rf node_modules package-lock.json
npm install
```

Then push a change to trigger deployment again.

### PM2 processes not starting

**Cause:** Application build failed or port conflict.

**Fix:**
```bash
# On your server
cd /root/RealEstatesAPI-NestJS

# Check for build errors
npm run build

# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Kill everything and restart
pm2 kill
cd apps/api && pm2 start dist/main.js --name "api" && cd ../..
cd apps/admin-web && pm2 start npm --name "admin-web" -- start && cd ../..
cd apps/user-web && pm2 start npm --name "user-web" -- start && cd ../..
pm2 save
```

### Database migration fails

**Cause:** Database not running or migration already applied.

**Fix:**
```bash
# On your server

# Check if database is running
docker ps | grep postgres

# If not running
cd /root/RealEstatesAPI-NestJS
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10

# Try migration again
cd apps/api
npm run migration:run
```

---

## 🔒 Security Notes

### SSH Key Security

- The private key stored in GitHub Secrets is encrypted
- Only repository admins and selected Actions can access it
- Never commit the private key to the repository

### Limiting Access

If you want to restrict the deploy key:

```bash
# On your server, edit authorized_keys
nano ~/.ssh/authorized_keys

# Add command restriction before the key:
command="cd /root/RealEstatesAPI-NestJS && git pull && npm ci && npm run build && pm2 restart all",no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-ed25519 AAAA... github-actions-deploy
```

This restricts the key to only run deployment commands.

---

## 📝 Workflow Configuration

The current workflow deploys on:
- ✅ Push to `develop` branch
- ✅ Manual trigger (workflow_dispatch)

### To Change Trigger Branch

Edit `.github/workflows/deploy-production.yml`:

```yaml
on:
  push:
    branches:
      - main  # Change from 'develop' to 'main'
```

### To Add Production Branch

```yaml
on:
  push:
    branches:
      - develop  # Staging
      - main     # Production
```

### To Deploy Only on Tags

```yaml
on:
  push:
    tags:
      - 'v*'  # Deploy on version tags like v1.0.0
```

---

## 🔄 Rollback

If a deployment breaks something:

### Quick Rollback (Last Working Commit)

```bash
# On your server
cd /root/RealEstatesAPI-NestJS

# Find the last working commit
git log --oneline -10

# Reset to specific commit (replace COMMIT_HASH)
git reset --hard COMMIT_HASH

# Rebuild and restart
npm run build
pm2 restart all
```

### Rollback via GitHub

1. Find the last working commit in GitHub
2. Create a new branch from that commit
3. Push to `develop`:

```bash
git checkout -b hotfix COMMIT_HASH
git push origin hotfix:develop --force
```

---

## 📊 Workflow Status Badge

Add this to your README.md:

```markdown
![Deploy Status](https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS/actions/workflows/deploy-production.yml/badge.svg?branch=develop)
```

This shows a badge indicating the latest deployment status.

---

## ✅ Verification Checklist

- [ ] SSH key generated on server
- [ ] Public key added to `~/.ssh/authorized_keys`
- [ ] `HETZNER_HOST` secret added to GitHub
- [ ] `HETZNER_USERNAME` secret added to GitHub  
- [ ] `HETZNER_SSH_KEY` secret added to GitHub
- [ ] Workflow file exists at `.github/workflows/deploy-production.yml`
- [ ] Push to `develop` triggers deployment
- [ ] Deployment completes successfully
- [ ] Applications restart after deployment
- [ ] Can access website after deployment

---

## 🎯 Quick Commands Reference

### Check Deployment Status

```bash
# On server
pm2 status
pm2 logs --lines 20
curl http://localhost:3000/v1/properties/public
```

### Force Re-deploy

Push an empty commit:
```bash
git commit --allow-empty -m "Force redeploy"
git push origin develop
```

Or use GitHub Actions UI for manual deploy.

### View Workflow Logs

1. GitHub → Actions tab
2. Click on workflow run
3. Click on job name
4. Expand each step to see logs

---

**Your deployments are now automated! 🚀**

Every push to `develop` branch will automatically deploy to your Hetzner server.
