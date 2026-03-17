# 🚀 Copy-Paste Commands - GitHub Clone Fix

## ⚡ FASTEST METHOD (Personal Access Token)

### Step 1: Get Token
Open in browser: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Check ✅ `repo`
- Copy token (starts with `ghp_`)

### Step 2: Clone (ON YOUR HETZNER SERVER)
```bash
cd ~
git clone https://aleksicdacha:YOUR_TOKEN_HERE@github.com/aleksicdacha/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
ls  # Verify files are there
```

**REPLACE `YOUR_TOKEN_HERE` with your actual token!**

✅ Done! Continue to Step 3 of deployment guide.

---

## 🔒 BETTER METHOD (SSH Key)

### Complete Copy-Paste Script:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-hetzner-$(date +%Y%m%d)" -f ~/.ssh/github_deploy -N ""

# Display public key (COPY THIS OUTPUT!)
cat ~/.ssh/github_deploy.pub
```

**NOW:** Add the key to GitHub:
- Go to: https://github.com/settings/keys
- Click "New SSH key"
- Paste the key
- Click "Add"

**THEN RUN:**
```bash
# Configure SSH
cat > ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF

# Set permissions
chmod 600 ~/.ssh/config ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub

# Test connection
ssh -T git@github.com
# Should say: "Hi aleksicdacha! You've successfully authenticated..."

# Clone repository
cd ~
git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS
ls  # Verify files are there
```

✅ Done! Continue to Step 3 of deployment guide.

---

## 🤖 AUTOMATED METHOD

```bash
# One-line automated setup
ssh-keygen -t ed25519 -C "github-auto" -f ~/.ssh/github_deploy -N "" && \
echo "Host github.com
  HostName github.com  
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes" >> ~/.ssh/config && \
chmod 600 ~/.ssh/config ~/.ssh/github_deploy && \
chmod 644 ~/.ssh/github_deploy.pub && \
echo "════════════════════════════════════════" && \
echo "📋 COPY THIS TO GITHUB:" && \
echo "════════════════════════════════════════" && \
cat ~/.ssh/github_deploy.pub && \
echo "" && \
echo "════════════════════════════════════════" && \
echo "Then visit: https://github.com/settings/keys"
```

After adding key to GitHub:
```bash
# Test and clone
ssh -T git@github.com && cd ~ && git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
```

---

## ✅ Verify Success

After cloning, run:
```bash
pwd
# Should show: /home/realestates/RealEstatesAPI-NestJS

ls -la
# Should show: apps/, docker-compose.yml, package.json, etc.

git status
# Should show: "On branch main" or similar
```

If you see these, **SUCCESS!** 🎉

---

## 🔄 Already Cloned with HTTPS? Switch to SSH:

```bash
cd ~/RealEstatesAPI-NestJS
git remote set-url origin git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
git remote -v  # Verify
```

---

## 📋 Quick Reference Links

- Create Token: https://github.com/settings/tokens
- Add SSH Key: https://github.com/settings/keys
- Your Repo: https://github.com/aleksicdacha/RealEstatesAPI-NestJS

---

## 🆘 Troubleshooting Commands

```bash
# Test GitHub SSH
ssh -T git@github.com

# Show your public key
cat ~/.ssh/github_deploy.pub

# Check Git config
git config --list

# Verify remote URL
cd ~/RealEstatesAPI-NestJS
git remote -v
```

---

**Pick a method, copy-paste the commands, and you're done! 🚀**

**Recommended for speed:** Token method (2 minutes)
**Recommended for security:** SSH method (5 minutes)
