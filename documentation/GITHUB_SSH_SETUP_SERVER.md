# 🔐 GitHub SSH Setup for Hetzner Server

## Problem
GitHub no longer accepts password authentication. You need either:
1. Personal Access Token (PAT)
2. SSH key authentication (recommended)

---

## ✅ **Quick Solution: Personal Access Token**

### 1. Create Token on GitHub
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Settings:
   - Name: `Hetzner Server`
   - Expiration: 90 days
   - Scope: ✅ `repo`
4. Click **"Generate"**
5. **Copy the token** (starts with `ghp_`)

### 2. Clone on Server
```bash
# On your Hetzner server:
cd ~
git clone https://aleksicdacha:YOUR_TOKEN_HERE@github.com/aleksicdacha/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
```

**Replace:**
- `YOUR_TOKEN_HERE` with your actual token
- `aleksicdacha` with your GitHub username (if different)

---

## ✅ **Better Solution: SSH Keys (Recommended)**

### 1. Generate SSH Key on Server

SSH into your Hetzner server and run:

```bash
# Generate new SSH key for GitHub
ssh-keygen -t ed25519 -C "server-github-$(hostname)" -f ~/.ssh/github_deploy -N ""

# Display the public key
cat ~/.ssh/github_deploy.pub
```

**Copy the entire output** (starts with `ssh-ed25519`)

### 2. Add Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Settings:
   - Title: `Hetzner Server - RealEstates`
   - Key type: Authentication Key
   - Key: Paste the public key from above
4. Click **"Add SSH key"**

### 3. Configure Git to Use SSH Key

On your server:

```bash
# Create/edit SSH config
cat > ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF

# Set correct permissions
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub

# Test connection
ssh -T git@github.com
# You should see: "Hi aleksicdacha! You've successfully authenticated..."
```

### 4. Clone Repository

```bash
cd ~
git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
```

---

## 🔧 **If Repository is Private**

Make sure your GitHub account has access to the repository.

### Check Repository URL:
```bash
# If you already cloned with HTTPS, change to SSH:
cd ~/RealEstatesAPI-NestJS
git remote set-url origin git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
```

---

## 🆘 **Troubleshooting**

### "Permission denied (publickey)"

**Solution:** SSH key not added to GitHub correctly.

```bash
# Re-display your public key
cat ~/.ssh/github_deploy.pub

# Test GitHub connection
ssh -T git@github.com -i ~/.ssh/github_deploy
```

### "Repository not found"

**Possible causes:**
1. Repository name is wrong
2. Repository is private and you don't have access
3. Using wrong GitHub username

**Check your repository URL:**
```bash
# List your repos (if public):
curl https://api.github.com/users/aleksicdacha/repos | grep -o '"name": "[^"]*"'

# Or visit in browser:
# https://github.com/aleksicdacha?tab=repositories
```

### Token expired

Personal Access Tokens expire. Generate a new one:
- https://github.com/settings/tokens

---

## 📋 **Complete Setup Script**

Run this on your Hetzner server for SSH setup:

```bash
#!/bin/bash

echo "🔐 Setting up GitHub SSH authentication..."

# Generate SSH key
if [ ! -f ~/.ssh/github_deploy ]; then
    ssh-keygen -t ed25519 -C "github-deploy-$(hostname)" -f ~/.ssh/github_deploy -N ""
    echo "✅ SSH key generated"
else
    echo "⚠️  SSH key already exists"
fi

# Configure SSH
cat > ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub

echo ""
echo "════════════════════════════════════════════════════════"
echo "📋 COPY THIS PUBLIC KEY TO GITHUB:"
echo "════════════════════════════════════════════════════════"
cat ~/.ssh/github_deploy.pub
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "📌 NEXT STEPS:"
echo "1. Go to: https://github.com/settings/keys"
echo "2. Click 'New SSH key'"
echo "3. Paste the key above"
echo "4. Click 'Add SSH key'"
echo "5. Run: ssh -T git@github.com"
echo "6. Run: git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git"
echo ""
```

Save as `setup-github-ssh.sh`, make executable, and run:

```bash
chmod +x setup-github-ssh.sh
./setup-github-ssh.sh
```

---

## 🚀 **Quick Commands Reference**

### Clone with Token (Quick & Easy)
```bash
git clone https://USERNAME:TOKEN@github.com/USERNAME/REPO.git
```

### Clone with SSH (Secure & Long-term)
```bash
git clone git@github.com:USERNAME/REPO.git
```

### Test GitHub SSH Connection
```bash
ssh -T git@github.com
```

### Change Remote URL (HTTPS → SSH)
```bash
git remote set-url origin git@github.com:USERNAME/REPO.git
```

---

## 📚 **Next Steps After Cloning**

Once you successfully clone the repository:

1. ✅ Continue with deployment guide: `documentation/HETZNER_DEPLOYMENT_GUIDE.md`
2. ✅ Configure environment variables
3. ✅ Install dependencies
4. ✅ Deploy applications

---

**Choose your method and let's get your code on the server! 🎉**
