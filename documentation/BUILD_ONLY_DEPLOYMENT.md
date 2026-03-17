# 🏗️ Build-Only Production Deployment Guide

## When to Use This

Use build-only deployment when:
- Security is critical (don't want source code on server)
- Disk space is limited
- Using CI/CD with Docker
- Running serverless/containerized deployments
- Want fastest possible deployments

**For your Hetzner server with 80GB:** Full source deployment is fine and easier!

---

## 📦 Option 1: Local Build + Transfer

### Step 1: Build Locally

**On your LOCAL machine:**

```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS

# Install production dependencies only
npm ci --production

# Build shared packages
cd packages/types
npm run build
cd ../..

# Build API
cd apps/api
npm run build
cd ../..

# Build Admin Web
cd apps/admin-web
npm run build
cd ../..

# Build User Web
cd apps/user-web
npm run build
cd ../..
```

### Step 2: Create Production Archive

```bash
# Create deployment package
tar --exclude='node_modules' \
    --exclude='apps/*/node_modules' \
    --exclude='packages/*/node_modules' \
    --exclude='.git' \
    --exclude='.turbo' \
    --exclude='src' \
    --exclude='apps/*/src' \
    --exclude='packages/*/src' \
    -czf realestates-production.tar.gz \
    apps/api/dist/ \
    apps/api/package.json \
    apps/admin-web/.next/ \
    apps/admin-web/package.json \
    apps/admin-web/public/ \
    apps/user-web/.next/ \
    apps/user-web/package.json \
    apps/user-web/public/ \
    packages/types/dist/ \
    packages/types/package.json \
    package.json \
    package-lock.json \
    turbo.json \
    apps/api/.env
```

### Step 3: Transfer and Extract

```bash
# Copy to server
scp realestates-production.tar.gz realestates@YOUR_SERVER_IP:~/

# On server
ssh realestates@YOUR_SERVER_IP
cd ~
mkdir -p RealEstatesAPI-NestJS-prod
cd RealEstatesAPI-NestJS-prod
tar -xzf ~/realestates-production.tar.gz

# Install production dependencies only
npm ci --production

# Start with PM2
cd apps/api
pm2 start dist/main.js --name "realestates-api"

cd ../admin-web
pm2 start npm --name "realestates-admin" -- start

cd ../user-web
pm2 start npm --name "realestates-user" -- start
```

---

## 📦 Option 2: CI/CD Build Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy-build-only.yml`:

```yaml
name: Build and Deploy (Build-Only)

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build shared packages
        run: |
          cd packages/types
          npm run build
          cd ../..
      
      - name: Build API
        run: |
          cd apps/api
          npm run build
          cd ../..
      
      - name: Build Admin Web
        run: |
          cd apps/admin-web
          npm run build
          cd ../..
      
      - name: Build User Web
        run: |
          cd apps/user-web
          npm run build
          cd ../..
      
      - name: Create deployment package
        run: |
          tar --exclude='node_modules' \
              --exclude='apps/*/node_modules' \
              --exclude='packages/*/node_modules' \
              --exclude='.git' \
              --exclude='src' \
              --exclude='apps/*/src' \
              --exclude='packages/*/src' \
              -czf deploy.tar.gz \
              apps/api/dist/ \
              apps/api/package.json \
              apps/admin-web/.next/ \
              apps/admin-web/package.json \
              apps/admin-web/public/ \
              apps/user-web/.next/ \
              apps/user-web/package.json \
              apps/user-web/public/ \
              packages/types/dist/ \
              packages/types/package.json \
              package.json \
              package-lock.json \
              turbo.json
      
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          source: "deploy.tar.gz"
          target: "/home/realestates/"
      
      - name: Extract and restart
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/RealEstatesAPI-NestJS-prod
            tar -xzf ~/deploy.tar.gz
            npm ci --production
            pm2 restart all
```

---

## 📦 Option 3: Docker Container (Most Advanced)

### Dockerfile (Multi-stage build)

Create `Dockerfile`:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/admin-web/package*.json ./apps/admin-web/
COPY apps/user-web/package*.json ./apps/user-web/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN cd packages/types && npm run build && cd ../..
RUN cd apps/api && npm run build && cd ../..
RUN cd apps/admin-web && npm run build && cd ../..
RUN cd apps/user-web && npm run build && cd ../..

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/admin-web/package*.json ./apps/admin-web/
COPY apps/user-web/package*.json ./apps/user-web/
COPY packages/types/package*.json ./packages/types/

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/admin-web/.next ./apps/admin-web/.next
COPY --from=builder /app/apps/admin-web/public ./apps/admin-web/public
COPY --from=builder /app/apps/user-web/.next ./apps/user-web/.next
COPY --from=builder /app/apps/user-web/public ./apps/user-web/public
COPY --from=builder /app/packages/types/dist ./packages/types/dist

EXPOSE 3000 3001 3002

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

**Size comparison:**
- Full image: ~1.5GB
- Build-only image: ~400MB

---

## 📊 Comparison Table

| Aspect | Full Source | Build-Only |
|--------|-------------|------------|
| **Disk space** | ~1-1.5GB | ~100-200MB |
| **Deployment speed** | Fast (git pull) | Faster (smaller transfer) |
| **Updates** | git pull + rebuild | Must rebuild locally/CI |
| **Debugging** | Full source available | Limited (built code only) |
| **Security** | Source visible | No source on server |
| **Migrations** | Can run on server | Must handle separately |
| **Complexity** | Simple | More complex |
| **Best for** | Small-medium projects | Large-scale/containerized |

---

## 🎯 Recommendation for Your Project

### **Stick with Full Source (Current Setup)** ✅

**Reasons:**
1. **80GB disk available** - space is NOT a concern
2. **Easy updates** - `git pull` and rebuild
3. **Flexibility** - can run migrations, make hotfixes
4. **Debugging** - full source for troubleshooting
5. **Simplicity** - standard workflow

**Current usage:**
- Project files: ~1.5GB
- That's only **1.8%** of 80GB disk
- You have **78.5GB free** - plenty of room!

---

## 🔄 When to Consider Build-Only

Switch to build-only deployment when:
- [ ] Running 10+ projects on same server (disk space matters)
- [ ] Using Docker/Kubernetes (containerization)
- [ ] Serverless deployment (AWS Lambda, etc.)
- [ ] Security audit requires no source on server
- [ ] Need sub-second deployments
- [ ] CI/CD pipeline is fully automated

**For now:** Your current setup is perfect! 🎉

---

## 📋 What Files Are Actually Used in Production

### **Required for Running:**
```
apps/api/dist/              # Compiled NestJS (REQUIRED)
apps/admin-web/.next/       # Compiled Next.js (REQUIRED)
apps/user-web/.next/        # Compiled Next.js (REQUIRED)
packages/types/dist/        # Compiled shared types (REQUIRED)
node_modules/               # Dependencies (REQUIRED)
package.json                # Dependency list (REQUIRED)
apps/*/package.json         # App-specific deps (REQUIRED)
.env files                  # Configuration (REQUIRED)
```

### **NOT Required (But Useful):**
```
src/                        # Source code (for rebuilding)
.git/                       # Git history (for git pull)
apps/*/src/                 # App source (for rebuilding)
packages/*/src/             # Package source (for rebuilding)
tsconfig.json               # TypeScript config (for rebuilding)
```

### **Never Used:**
```
.turbo/                     # Build cache
.next/cache/                # Next.js cache
node_modules/.cache/        # npm cache
```

---

## 💡 Optimize Current Setup (Keep Full Source)

### Clean unnecessary files:

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# Remove build caches (safe to delete)
rm -rf .turbo/
rm -rf apps/*/.next/cache/
rm -rf node_modules/.cache/

# Remove dev dependencies (optional, breaks rebuilding!)
# npm prune --production

# Check disk usage
du -sh ~/RealEstatesAPI-NestJS
```

**You'll save maybe 100-200MB, but it's not worth the complexity!**

---

## ✅ Summary

**For your Hetzner CPX22 server:**

- ✅ **Current setup (full source) is PERFECT**
- ✅ You're using <2% of disk space
- ✅ Easy to update and maintain
- ✅ Standard industry practice
- ❌ **Don't switch to build-only** - adds complexity with no benefit

**Only consider build-only if:**
- Running 10+ projects
- Using containers
- Disk space < 10GB
- Security audit requires it

---

**Keep your current setup! It's the right choice! 🎉**
