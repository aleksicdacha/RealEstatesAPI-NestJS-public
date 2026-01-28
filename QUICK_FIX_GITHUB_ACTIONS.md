# 🚨 QUICK FIX: GitHub Actions Failing

## Problem
```
Error: missing server host
```

## ⚡ Quick Solution (5 minutes)

### Step 1: Get Your SSH Key
On your **local machine**:
```bash
cat ~/.ssh/id_rsa
```
**Copy the entire output** (including BEGIN and END lines)

---

### Step 2: Add Secrets to GitHub

1. Open browser: https://github.com/aleksicdacha/RealEstatesAPI-NestJS/settings/secrets/actions

2. Click **"New repository secret"** button (green button, top right)

3. Add these 3 secrets:

| Secret Name | Secret Value |
|------------|--------------|
| `HETZNER_HOST` | `46.224.231.217` |
| `HETZNER_USERNAME` | `root` |
| `HETZNER_SSH_KEY` | Paste your SSH private key from Step 1 |

**Click "Add secret" after each one**

---

### Step 3: Verify

After adding all 3 secrets, you should see:

```
Repository secrets (3)
✓ HETZNER_HOST
✓ HETZNER_SSH_KEY  
✓ HETZNER_USERNAME
```

---

### Step 4: Test

Push any commit to `develop` branch:

```bash
git add .
git commit -m "Test auto-deployment"
git push origin develop
```

Then check: https://github.com/aleksicdacha/RealEstatesAPI-NestJS/actions

You should see a green checkmark ✅ instead of red X ❌

---

## 📸 Visual Guide

### Where to find Settings → Secrets:

```
GitHub Repository Page
  │
  ├── Code
  ├── Issues
  ├── Pull requests
  ├── Actions  ← (Here you see workflow runs)
  ├── ...
  └── ⚙️ Settings  ← Click here
         │
         └── Left sidebar:
               ├── General
               ├── ...
               └── Secrets and variables  ← Expand this
                      └── Actions  ← Click here
                            │
                            └── "New repository secret" button ← Click to add
```

---

## 🔑 How to Get Your SSH Key

### If you're using the same SSH key you use to connect to the server:

```bash
# On your local machine
cat ~/.ssh/id_rsa
```

### If that file doesn't exist, try:

```bash
cat ~/.ssh/id_ed25519
```

### Or check which keys you have:

```bash
ls -la ~/.ssh/
```

Look for files like:
- `id_rsa` (private key)
- `id_rsa.pub` (public key)
- `id_ed25519` (private key)
- `id_ed25519.pub` (public key)

**You need the PRIVATE key** (the one WITHOUT `.pub` extension)

---

## ✅ Checklist

- [ ] I found my SSH private key
- [ ] I added `HETZNER_HOST` secret to GitHub
- [ ] I added `HETZNER_USERNAME` secret to GitHub  
- [ ] I added `HETZNER_SSH_KEY` secret to GitHub
- [ ] I can see all 3 secrets listed in GitHub Settings
- [ ] I pushed a commit to test
- [ ] GitHub Actions workflow is running (check Actions tab)

---

## 🆘 Troubleshooting

### "I can't find my SSH key"

**Solution**: Generate a new one and add it to your server:

```bash
# On local machine
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter 3 times (accept defaults, no passphrase)

# Copy to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@46.224.231.217

# Now get the private key
cat ~/.ssh/id_ed25519
# Copy this to HETZNER_SSH_KEY secret
```

### "Workflow runs but deployment fails"

Check that environment files exist on server:

```bash
ssh root@46.224.231.217 "ls -la /root/RealEstatesAPI-NestJS/apps/api/.env"
ssh root@46.224.231.217 "ls -la /root/RealEstatesAPI-NestJS/apps/admin-web/.env.production"
ssh root@46.224.231.217 "ls -la /root/RealEstatesAPI-NestJS/apps/user-web/.env.production"
```

If any are missing, create them (see GITHUB_ACTIONS_SETUP.md)

---

## 📞 Still Having Issues?

1. Check the workflow logs in GitHub Actions tab
2. Look for specific error messages
3. Share the error output for more specific help

---

**That's it! Your GitHub Actions should now work automatically on every push to `develop` branch.**
