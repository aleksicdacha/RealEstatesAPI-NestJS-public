# ✅ Hetzner Server Setup Checklist
## Real Estate Platform - Quick Reference

---

## 📋 **Server Creation Checklist**

### **Step 1: Server Type (Screenshot 1)**
- [x] Select **"Regular Performance"** (Shared Resources)
- [x] Choose **CPX22**
  - 2 vCPUs (AMD)
  - 4 GB RAM
  - 80 GB SSD
  - €5.99/mo

### **Step 2: Location & Image**
- [x] Location: **Nuremberg** (or closest to you)
- [x] Image: **Ubuntu 24.04**
- [x] Networking: **IPv4 + IPv6** (default)

### **Step 3: SSH Keys**
- [x] Click "SSH Keys" section
- [x] Display your public key:
  ```bash
  cat ~/.ssh/id_ed25519.pub
  # OR
  cat ~/.ssh/id_rsa.pub
  ```
- [x] Click "Add SSH Key" in Hetzner
- [x] Paste the **entire** public key line
- [x] Name it (e.g., "My Laptop")
- [x] **Make sure it's checked/selected**

### **Step 4: Additional Options (Screenshot 2)**

#### Volumes
- [ ] ❌ **SKIP** - 80GB is enough initially

#### Backups ⭐ **RECOMMENDED**
- [ ] ✅ **ENABLE** - Adds €1.20/mo (20%)
- [ ] Total with backups: **€7.19/mo**

#### Placement Groups
- [ ] ❌ **SKIP** - Only for multi-server setups

#### Labels (Optional)
- [ ] Add if desired:
  - `env` = `production`
  - `project` = `realestates`
  - `stack` = `nestjs-nextjs`

#### Cloud Config
- [ ] ❌ **SKIP** - Use manual deployment instead

#### Name ⭐ **REQUIRED**
- [ ] ✅ Set to: **`realestates-production`**

### **Step 5: Review & Create**
- [ ] Check summary on right panel
- [ ] Verify total cost (€5.99 or €7.19 with backups)
- [ ] Click red **"Create & Buy now"** button

---

## 🚀 **After Server is Created**

### **Immediate Steps**
1. [ ] Wait 1-2 minutes for server to boot
2. [ ] Note the **IP address** shown (e.g., `95.217.123.45`)
3. [ ] Test SSH connection:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```
4. [ ] Type `yes` when prompted about fingerprint

### **Initial Server Setup**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Install Git
apt install git -y

# Verify installations
docker --version
docker compose version
node --version
npm --version
```

### **Security Setup**
```bash
# Create application user
adduser realestates
# (Set strong password)

# Add to docker group
usermod -aG docker realestates

# Grant sudo
usermod -aG sudo realestates

# Switch to app user
su - realestates
```

### **Project Deployment**
```bash
# Clone repository
cd ~
git clone https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS

# Follow detailed deployment guide:
# See documentation/HETZNER_DEPLOYMENT_GUIDE.md
```

---

## 📚 **Documentation Files**

| File | Purpose |
|------|---------|
| **[SSH_QUICK_GUIDE.md](./documentation/SSH_QUICK_GUIDE.md)** | Which SSH file to copy to Hetzner |
| **[HETZNER_SERVER_OPTIONS_EXPLAINED.md](./documentation/HETZNER_SERVER_OPTIONS_EXPLAINED.md)** | Detailed explanation of all server options |
| **[HETZNER_DEPLOYMENT_GUIDE.md](./documentation/HETZNER_DEPLOYMENT_GUIDE.md)** | Complete deployment steps A-Z |

---

## 💰 **Cost Summary**

### Option 1: Basic (Testing)
- Server: €5.99/mo
- **Total: €5.99/mo** (~€72/year)

### Option 2: Production (Recommended) ⭐
- Server: €5.99/mo
- Backups: €1.20/mo
- **Total: €7.19/mo** (~€86/year)

### Option 3: High Storage
- Server: €5.99/mo
- Backups: €1.20/mo
- 100GB Volume: €4.80/mo
- **Total: €12/mo** (~€144/year)

---

## 🆘 **Quick Help**

### SSH Key Issues
```bash
# Find your public key
ls -la ~/.ssh/*.pub

# Display public key
cat ~/.ssh/id_ed25519.pub

# Create new key if needed
ssh-keygen -t ed25519 -C "hetzner-realestates"
```

### After Server Creation
- **Can't SSH?** Wait 2-3 minutes, server may still be booting
- **Connection refused?** Check IP address is correct
- **Permission denied?** Verify SSH key was added and selected

### Resource Monitoring
```bash
# Check disk space
df -h

# Check memory
free -h

# Check running processes
pm2 status

# View application logs
pm2 logs realestates-api
```

---

## 📞 **Support Resources**

- Hetzner Support: https://docs.hetzner.com/
- Project Issues: See `documentation/` folder
- Database Issues: Check `docker logs`
- Application Errors: Check `pm2 logs`

---

**Ready? Let's create your server! 🚀**

1. Go to: https://console.hetzner.com/projects/[YOUR_PROJECT]/servers/create
2. Follow this checklist
3. Click "Create & Buy now"
4. Then follow: `documentation/HETZNER_DEPLOYMENT_GUIDE.md`

**Good luck! 🎉**
