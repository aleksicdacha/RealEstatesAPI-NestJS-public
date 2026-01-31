# GitHub Actions Deployment Setup Guide

## Problem
Your GitHub Actions workflow is failing with the error:
```
Error: missing server host
```

This means the required SSH secrets are not configured in your GitHub repository.

---

## Solution: Configure GitHub Secrets

### Required Secrets

You need to add 3 secrets to your GitHub repository:

1. **HETZNER_HOST** - Your server IP address
2. **HETZNER_USERNAME** - SSH username (usually `root`)
3. **HETZNER_SSH_KEY** - Your private SSH key

---

## Step-by-Step Instructions

### 1. Get Your SSH Private Key

On your **local machine**, run this command to display your private SSH key:

```bash
cat ~/.ssh/id_rsa
```

Or if you're using a different key:

```bash
cat ~/.ssh/id_ed25519
```

**Copy the entire output**, including the header and footer:
```
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED-BY-SECURITY-CLEANUP***
```

⚠️ **IMPORTANT**: This is your **PRIVATE** key, keep it secret!

---

### 2. Add Secrets to GitHub Repository

1. Go to your GitHub repository: https://github.com/aleksicdacha/RealEstatesAPI-NestJS

2. Click **Settings** (top menu)

3. In the left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret** button

5. Add each secret one by one:

#### Secret 1: HETZNER_HOST
- **Name**: `HETZNER_HOST`
- **Value**: `46.224.231.217`
- Click **Add secret**

#### Secret 2: HETZNER_USERNAME
- **Name**: `HETZNER_USERNAME`
- **Value**: `root`
- Click **Add secret**

#### Secret 3: HETZNER_SSH_KEY
- **Name**: `HETZNER_SSH_KEY`
- **Value**: Paste your entire private SSH key (from step 1)
- Click **Add secret**

---

### 3. Verify Secrets Are Added

After adding all 3 secrets, you should see them listed on the Actions secrets page:
- ✅ HETZNER_HOST
- ✅ HETZNER_SSH_KEY
- ✅ HETZNER_USERNAME

**Note**: You won't be able to view the secret values after adding them (for security).

---

### 4. Test the Workflow

#### Option A: Push a commit
```bash
git add .
git commit -m "Test deployment"
git push origin develop
```

#### Option B: Manually trigger workflow
1. Go to **Actions** tab in GitHub
2. Click **Deploy to Hetzner Production** workflow
3. Click **Run workflow** button
4. Select branch: `develop`
5. Click **Run workflow**

---

## Troubleshooting

### Issue: "Permission denied (publickey)"

**Cause**: The SSH key doesn't match the one on the server.

**Solution**:
1. Check which public key is on the server:
   ```bash
   ssh root@46.224.231.217 "cat ~/.ssh/authorized_keys"
   ```

2. Check your local public key:
   ```bash
   cat ~/.ssh/id_rsa.pub
   # or
   cat ~/.ssh/id_ed25519.pub
   ```

3. They should match! If not, add your public key to the server:
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub root@46.224.231.217
   ```

### Issue: "Host key verification failed"

**Cause**: Server's host key is not recognized.

**Solution**: 
The workflow should handle this automatically. If it persists, you may need to add `StrictHostKeyChecking=no` to the SSH action (not recommended for production).

### Issue: Deployment runs but fails during build

**Check the logs**:
1. Go to **Actions** tab in GitHub
2. Click on the failed workflow run
3. Click on "Deploy to Production" job
4. Expand the failing step to see detailed logs

Common fixes:
- Ensure `.env` files exist on server
- Check database connection
- Verify PM2 is installed: `npm install -g pm2`

---

## Current Workflow Behavior

When you push to the `develop` branch, the workflow will:

1. ✅ Checkout code from GitHub
2. 🔐 SSH into your server (46.224.231.217)
3. 📥 Pull latest changes (`git pull`)
4. 🐳 Start Docker services (PostgreSQL, Redis)
5. 📦 Install dependencies (`npm ci`)
6. 🔧 Build shared packages
7. 🏗️ Build all apps (API, Admin, User-web)
8. 🗄️ Run database migrations
9. 🔄 Restart PM2 processes
10. ✅ Verify deployment

---

## Environment Files Required on Server

The workflow expects these files to exist on the server:

```
/root/RealEstatesAPI-NestJS/
├── apps/api/.env
├── apps/admin-web/.env.production
└── apps/user-web/.env.production
```

If they don't exist, create them before running the workflow:

### On the server:
```bash
cd /root/RealEstatesAPI-NestJS

# Create API .env
nano apps/api/.env
# Paste content from local apps/api/.env
# Press Ctrl+X, then Y, then Enter

# Create Admin .env
nano apps/admin-web/.env.production
# Paste content from local apps/admin-web/.env.local (adjust URLs)
# Press Ctrl+X, then Y, then Enter

# Create User-web .env
nano apps/user-web/.env.production
# Paste content from local apps/user-web/.env.local (adjust URLs)
# Press Ctrl+X, then Y, then Enter
```

---

## After Successful Deployment

Your services will be available at:
- **API**: http://46.224.231.217:3000
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

---

## Quick Reference Commands

### Check workflow status
```bash
# On GitHub.com
1. Go to repository
2. Click "Actions" tab
3. See latest workflow runs
```

### Check deployment on server
```bash
ssh root@46.224.231.217
pm2 status
pm2 logs
```

### Stop all services on server
```bash
ssh root@46.224.231.217 "pm2 delete all"
```

### Restart services on server
```bash
ssh root@46.224.231.217 "cd /root/RealEstatesAPI-NestJS && pm2 restart all"
```

---

## Security Notes

⚠️ **NEVER commit these to Git:**
- Private SSH keys
- `.env` files with real credentials
- Database passwords
- JWT secrets

✅ **Only store in GitHub Secrets:**
- Server credentials
- SSH keys
- Any sensitive data needed for deployment

---

## Next Steps After Setup

1. ✅ Add the 3 GitHub secrets (see Step 2 above)
2. ✅ Verify `.env` files exist on server
3. ✅ Push a commit to `develop` branch
4. ✅ Watch the workflow run in GitHub Actions tab
5. ✅ Check your server to verify services are running

---

## Need Help?

If the workflow still fails after adding secrets:

1. Check the **Actions** tab logs for specific error messages
2. SSH into your server and check PM2 logs: `pm2 logs`
3. Verify environment files are correctly configured
4. Ensure Docker services are running: `docker compose ps`

---

**Last Updated**: January 28, 2026
