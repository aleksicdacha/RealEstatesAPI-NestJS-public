# 🖥️ Hetzner Server Options Explained - Screenshot 2

## Overview of Additional Server Options

After selecting your server type (CPX22) and SSH keys, you'll see these optional configurations:

---

## 📦 **Volumes**

### What is it?
Additional SSD-based storage that can be attached to your server (up to 10 TB).

### Do you need it?
**❌ NO - Not needed initially**

**Reason:**
- CPX22 comes with **80 GB SSD** built-in
- Your project needs:
  - ~5-10 GB for OS + Docker images
  - ~5-10 GB for PostgreSQL database
  - ~10-20 GB for uploaded property images
  - ~40 GB remaining for growth

**When to add:**
- If you expect **thousands** of high-res property images
- If database grows beyond 50 GB
- You can add volumes **later** without recreating the server

**Recommendation:** Skip this for now. Monitor disk usage with `df -h` after deployment.

---

## 💾 **Backups**

### What is it?
Automated daily snapshots of your **entire server** (OS + all data).

**Cost:** +20% of server price
- CPX22 = €5.99/mo → Backups add €1.20/mo → **Total: €7.19/mo**

### Do you need it?
**✅ YES - Highly Recommended**

**Benefits:**
- Daily automatic backups
- Restore entire server in case of:
  - Accidental deletion
  - Hacked server
  - Failed updates
  - Database corruption
- Point-in-time recovery
- One-click restore

**Alternatives:**
- Manual database backups via scripts (see `HETZNER_DEPLOYMENT_GUIDE.md`)
- Custom snapshot scripts
- But Hetzner backups are **easiest** and include everything

**Recommendation:** ✅ **Enable Backups** - €1.20/mo is cheap insurance for production data.

---

## 🏗️ **Placement Groups**

### What is it?
Controls how multiple servers are distributed across physical hardware in data centers.

**Use cases:**
- **High Availability:** Spread servers across different physical hosts
- **Low Latency:** Keep servers on same physical host

### Do you need it?
**❌ NO - Not needed**

**Reason:**
- You're creating **only 1 server**
- Placement groups are for multi-server setups (clusters, load balancers)
- Useful for large-scale deployments with 3+ servers

**Recommendation:** Skip this. Only relevant if you scale to multiple servers later.

---

## 🏷️ **Labels**

### What is it?
Custom key-value tags for organizing your servers.

**Examples:**
```
env: production
project: realestates
app: monorepo
owner: dalibor
```

### Do you need it?
**⚠️ OPTIONAL - Nice to have**

**Benefits:**
- Organize servers in large projects
- Filter servers in Hetzner console
- Billing/cost tracking
- Automation scripts can use labels

**For 1 server:** Not critical, but good practice.

**Recommendation:** 
Add these labels (optional):

| Key       | Value           |
|-----------|-----------------|
| `env`     | `production`    |
| `project` | `realestates`   |
| `stack`   | `nestjs-nextjs` |

---

## ☁️ **Cloud Config (Cloud-Init)**

### What is it?
Automated setup script that runs **once** when server first boots.

**Uses:**
- Auto-install packages (Docker, Node.js)
- Create users
- Configure firewall
- Clone repositories
- Set up environment

### Do you need it?
**⚠️ OPTIONAL - Advanced users**

**Benefits:**
- Fully automated server setup
- No manual SSH commands
- Reproducible deployments

**Drawbacks:**
- Complex YAML syntax
- Hard to debug if it fails
- One-time execution only

**Recommendation for beginners:** 
❌ **Skip for now** - Follow manual deployment guide instead.

**Advanced users:** See example cloud-config below.

---

## 📝 **Name**

### What is it?
The display name for your server in Hetzner Console.

### Do you need it?
**✅ YES - Always set a descriptive name**

**Recommended name:**
```
realestates-production
```

Or more detailed:
```
realestates-prod-cpx22-nbg
```

**Why:**
- Easy to identify in server list
- Helps when managing multiple servers
- Shows in billing reports

**Recommendation:** Set to `realestates-production`

---

## ✅ **Final Configuration Summary**

Here's what to configure on screenshot 2:

| Option               | Setting                      | Reason                          |
|----------------------|------------------------------|---------------------------------|
| **Volumes**          | ⬜ Skip (unchecked)          | 80GB built-in is enough         |
| **Backups**          | ✅ **Enable (checked)**      | Essential data protection       |
| **Placement Groups** | ⬜ Skip (unchecked)          | Only have 1 server              |
| **Labels**           | ⚠️ Optional - add if desired | Nice for organization           |
| **Cloud Config**     | ⬜ Skip (leave empty)        | Follow manual guide instead     |
| **Name**             | ✅ `realestates-production`  | Easy identification             |

**Total Cost with Backups:**
- Server: €5.99/mo
- Backups: €1.20/mo (20%)
- **Total: €7.19/mo** (~€86/year)

---

## 📋 **Optional Cloud-Init Example**

If you're comfortable with automation, here's a cloud-config script:

```yaml
#cloud-config

# Update system
package_update: true
package_upgrade: true

# Install essential packages
packages:
  - git
  - curl
  - wget
  - ufw

# Create application user
users:
  - name: realestates
    groups: sudo, docker
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']

# Install Docker
runcmd:
  # Install Docker
  - curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  - sh /tmp/get-docker.sh
  - systemctl enable docker
  - systemctl start docker
  
  # Install Node.js 20
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt install -y nodejs
  
  # Configure firewall
  - ufw allow OpenSSH
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw --force enable
  
  # Install PM2
  - npm install -g pm2

# Reboot after setup
power_state:
  mode: reboot
  timeout: 30
  condition: true
```

**Note:** Only use this if you understand cloud-init. Otherwise, follow the manual deployment guide.

---

## 🚀 **Next Steps After Configuration**

1. ✅ Verify your selections on the right panel:
   - CPX22 selected
   - Nuremberg location
   - Ubuntu 24.04
   - IPv4, IPv6 enabled
   - 1 SSH key selected
   - Backups enabled (optional but recommended)
   - Name set

2. ✅ Check the **Total Cost** in bottom right:
   - Should show **€6.49/mo** (or ~€7.19/mo with backups)

3. ✅ Click the red **"Create & Buy now"** button

4. ✅ Wait for server to be created (1-2 minutes)

5. ✅ You'll get an **IP address** (e.g., `95.217.123.45`)

6. ✅ SSH into server:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

7. ✅ Follow the **[HETZNER_DEPLOYMENT_GUIDE.md](./HETZNER_DEPLOYMENT_GUIDE.md)** for complete deployment

---

## 📊 **Cost Breakdown Comparison**

### Minimal Setup (No Backups)
- CPX22 Server: **€5.99/mo**
- **Total: €5.99/mo** (~€72/year)

### Recommended Setup (With Backups)
- CPX22 Server: €5.99/mo
- Backups (20%): €1.20/mo
- **Total: €7.19/mo** (~€86/year)

### With Extra Volume (if needed later)
- CPX22 Server: €5.99/mo
- Backups: €1.20/mo
- 100 GB Volume: ~€4.80/mo
- **Total: €12/mo** (~€144/year)

---

## ❓ Common Questions

### Q: Can I add backups later?
**A:** Yes! Go to server settings → Backups → Enable. Same 20% cost applies.

### Q: Can I change the server name later?
**A:** Yes, easily in server settings.

### Q: What if 80GB isn't enough?
**A:** Add a Volume later, or resize to CPX32 (160GB).

### Q: Do I need a firewall?
**A:** The deployment guide includes UFW firewall setup. No need to add it here.

### Q: Can I delete backups to save money?
**A:** Yes, disable in settings. But you lose automatic recovery capability.

---

## 🎯 **Quick Decision Guide**

**If you're just testing:** 
- ⬜ No backups
- ⬜ No volumes
- Total: **€5.99/mo**

**If this is production (recommended):**
- ✅ Enable backups
- ⬜ No volumes (yet)
- ✅ Set name
- Total: **€7.19/mo**

**If you plan to store 1000+ high-res images:**
- ✅ Enable backups
- ✅ Add 100-200GB volume
- ✅ Set name
- Total: **~€12-15/mo**

---

**🎉 You're ready to create the server! Click "Create & Buy now" when configured.**

For deployment steps after server creation, see: [`HETZNER_DEPLOYMENT_GUIDE.md`](./HETZNER_DEPLOYMENT_GUIDE.md)
