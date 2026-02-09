# 🤖 Automated Deployment Setup Guide

## GitHub Actions CI/CD for Production Deployment

This guide sets up automated deployment from GitHub to your Hetzner server.

---

## 📋 How It Works

```
Local Development → Push to GitHub → GitHub Actions → Auto Deploy to Server
```

**Workflow:**
1. You push code to `main` branch on GitHub
2. GitHub Actions automatically triggers
3. Connects to your server via SSH
4. Pulls latest code
5. Builds applications
6. Restarts services
7. ✅ Done!

---

## ⚙️ Setup Steps

### Step 1: Configure GitHub Secrets

GitHub Actions needs SSH access to your server.

#### 1.1: Generate Deploy Key on Server

**On your Hetzner server:**

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""

# Display private key (copy this)
cat ~/.ssh/github_actions_deploy

# Add public key to authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Copy the PRIVATE key** (entire content of `~/.ssh/github_actions_deploy`)

#### 1.2: Add Secrets to GitHub

1. Go to: `https://github.com/aleksicdacha/RealEstatesAPI-NestJS/settings/secrets/actions`

2. Click **"New repository secret"** and add these:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `SERVER_HOST` | Your server IP | `95.217.123.45` |
| `SERVER_USER` | SSH username | `realestates` |
| `SERVER_SSH_KEY` | Private key from above | Contents of `github_actions_deploy` |

**To add each secret:**
- Click "New repository secret"
- Name: `SERVER_HOST`
- Value: Your server IP
- Click "Add secret"
- Repeat for `SERVER_USER` and `SERVER_SSH_KEY`

---

### Step 2: Enable GitHub Actions

The workflow file is already created at `.github/workflows/deploy.yml`

**Commit and push it:**

```bash
# On your LOCAL machine
cd /home/dalibor/Projects/RealEstatesAPI-NestJS

git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

### Step 3: Test Deployment

#### Manual Trigger Test:

1. Go to: `https://github.com/aleksicdacha/RealEstatesAPI-NestJS/actions`
2. Click on **"Deploy to Production"** workflow
3. Click **"Run workflow"** button
4. Select `main` branch
5. Click **"Run workflow"**
6. Watch it deploy! 🎉

#### Automatic Trigger:

```bash
# On your LOCAL machine
# Make any change
echo "# Deployment test" >> README.md
git add README.md
git commit -m "Test automated deployment"
git push origin main

# Go to GitHub Actions tab and watch it deploy automatically!
```

---

## 🌿 Part 4: Development Branch → Production Workflow

### Strategy 1: Develop → Main Branch Protection

**Recommended workflow:**

```
feature branch → develop branch → main branch (production)
     ↓               ↓                ↓
   Local         Staging/Test      Production
```

#### Setup:

**1. Create branch structure:**

```bash
# On your LOCAL machine
cd /home/dalibor/Projects/RealEstatesAPI-NestJS

# Create develop branch
git checkout -b develop
git push -u origin develop

# Create feature branch
git checkout -b feature/my-feature
# Work on feature...
git add .
git commit -m "Add new feature"
git push -u origin feature/my-feature
```

**2. Merge workflow:**

```bash
# After feature is done, merge to develop
git checkout develop
git merge feature/my-feature
git push origin develop

# Test on staging/local

# When ready for production, merge to main
git checkout main
git merge develop
git push origin main
# 🚀 Auto-deploys to production!
```

---

### Strategy 2: Separate Deploy Branches

**Setup different branches for different environments:**

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/RealEstatesAPI-NestJS
            git checkout develop
            git pull origin develop
            npm install
            cd packages/types && npm run build && cd ../..
            npm run build
            pm2 restart all
```

**Then:**
- Push to `develop` → deploys to staging server
- Push to `main` → deploys to production server

---

### Strategy 3: Manual Approval for Production

Require manual approval before production deployment:

`.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      confirm:
        description: 'Type "deploy" to confirm'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'deploy'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/RealEstatesAPI-NestJS
            git pull origin main
            npm install
            cd packages/types && npm run build && cd ../..
            cd apps/api && npm run migration:run && cd ../..
            npm run build
            pm2 restart all
            pm2 status
```

**Use:**
1. Go to Actions tab
2. Click "Run workflow"
3. Type "deploy" in confirmation
4. Click "Run"

---

## 🔧 Advanced: Environment-Specific Builds

### Handle different .env files per environment:

**.env.production** (on server):
```env
NODE_ENV=production
DB_HOST=localhost
# ... production settings
```

**.env.development** (local):
```env
NODE_ENV=development
DB_HOST=localhost
# ... development settings
```

**In deployment script:**

```bash
# On server, copy production env
cp .env.production apps/api/.env
npm run build
pm2 restart all
```

---

## 📊 Part 5: Monitoring & Rollback

### Monitor Deployments:

```bash
# On server, view PM2 logs
pm2 logs realestates-api --lines 100

# Monitor in real-time
pm2 monit

# Check status
pm2 status

# View process info
pm2 info realestates-api
```

### Rollback if Deployment Fails:

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# See commit history
git log --oneline -10

# Rollback to previous commit
git checkout HEAD~1

# Rebuild and restart
npm run build
pm2 restart all

# Or rollback to specific commit
git checkout abc123def
npm run build
pm2 restart all
```

---

## 🚀 Quick Reference Commands

### On Server:

```bash
# Deploy manually
cd ~/RealEstatesAPI-NestJS && git pull && npm install && npm run build && pm2 restart all

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Start all
pm2 start all

# Check status
pm2 status

# Monitor
pm2 monit
```

### On Local Machine:

```bash
# Deploy to production (auto)
git add .
git commit -m "Your changes"
git push origin main  # Triggers auto-deployment

# Deploy to develop/staging
git push origin develop
```

---

## ✅ Deployment Checklist

**Before First Deployment:**
- [ ] Environment variables configured on server
- [ ] Database running (`docker compose up -d postgres`)
- [ ] Dependencies installed (`npm install`)
- [ ] Shared packages built (`cd packages/types && npm run build`)
- [ ] Migrations run (`cd apps/api && npm run migration:run`)
- [ ] Admin user created (`npm run seed:users`)
- [ ] PM2 installed (`sudo npm install -g pm2`)
- [ ] GitHub secrets configured (if using CI/CD)

**For Each Deployment:**
- [ ] Code pushed to GitHub
- [ ] GitHub Actions succeeded (if using CI/CD)
- [ ] PM2 processes restarted
- [ ] Applications responding (check logs)
- [ ] Database migrations applied
- [ ] No errors in logs

---

## 🆘 Troubleshooting

### Deployment fails:

```bash
# Check GitHub Actions logs
# Go to: https://github.com/aleksicdacha/RealEstatesAPI-NestJS/actions

# Check server logs
pm2 logs --lines 100

# Check if processes are running
pm2 status

# Restart manually
pm2 restart all

# Check disk space
df -h

# Check memory
free -h
```

### PM2 issues:

```bash
# Delete and recreate processes
pm2 delete all

# Restart deployment
cd ~/RealEstatesAPI-NestJS/apps/api
pm2 start dist/main.js --name "realestates-api"

cd ~/RealEstatesAPI-NestJS/apps/admin-web
pm2 start npm --name "realestates-admin" -- start

cd ~/RealEstatesAPI-NestJS/apps/user-web
pm2 start npm --name "realestates-user" -- start

pm2 save
```

---

## 📚 Summary

**Development Workflow:**
```
Local → Develop Branch → Test → Main Branch → Auto-Deploy → Production
```

**Manual Deploy:**
```bash
./deploy.sh
```

**Auto Deploy:**
```bash
git push origin main  # Triggers GitHub Actions
```

**Monitor:**
```bash
pm2 logs
pm2 monit
```

**Rollback:**
```bash
git checkout <previous-commit>
npm run build
pm2 restart all
```

---

**Your deployment is now automated! 🎉**

Push to `main` branch and watch it deploy automatically!
