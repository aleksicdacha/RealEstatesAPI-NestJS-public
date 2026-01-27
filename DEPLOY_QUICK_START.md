# 🚀 Quick Start Commands - Deploy to Hetzner

## One-Command Fresh Server Setup

### Option 1: If Repository is PUBLIC

On a **fresh Hetzner Ubuntu 24.04 server**, run:

```bash
apt update && apt install -y curl git && \
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/RealEstatesAPI-NestJS/develop/scripts/setup-server-complete.sh -o setup.sh && \
chmod +x setup.sh && \
bash setup.sh
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

### Option 2: If Repository is PRIVATE

```bash
apt update && apt install -y git && \
git clone --branch develop https://YOUR_TOKEN@github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git && \
cd RealEstatesAPI-NestJS && \
bash scripts/setup-server-complete.sh
```

**Replace:**
- `YOUR_TOKEN` - Your GitHub Personal Access Token
- `YOUR_USERNAME` - Your GitHub username

---

## After Setup - Enable GitHub Auto-Deploy

### On Your Server:

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Display private key (copy this to GitHub)
cat ~/.ssh/github_actions
```

### On GitHub:

1. Go to: **Repository → Settings → Secrets → Actions**
2. Add these secrets:

| Secret | Value |
|--------|-------|
| `HETZNER_HOST` | Your server IP (e.g., `95.217.123.45`) |
| `HETZNER_USERNAME` | `root` |
| `HETZNER_SSH_KEY` | Paste entire private key from above |

### Test It:

```bash
git add . && git commit -m "Test deploy" && git push origin develop
```

Watch GitHub Actions tab - your server auto-updates! 🎉

---

## Quick Server Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart apps
pm2 restart all

# Manual update
cd /root/RealEstatesAPI-NestJS && git pull && npm run build && pm2 restart all

# Check database
docker ps

# View credentials
cat /root/.realestates-credentials
```

---

## Access URLs

**Without Domain:**
- User Website: `http://YOUR_SERVER_IP`
- Admin Panel: `http://YOUR_SERVER_IP:81`
- API: `http://YOUR_SERVER_IP:3000/v1`

**Default Admin Login:**
- Email: `admin@google.com`
- Password: `admin123` (CHANGE THIS!)

---

## Full Documentation

See: `documentation/COMPLETE_HETZNER_SETUP_GUIDE.md`
