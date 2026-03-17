# 📚 Hetzner Deployment Documentation Index

Complete guide for deploying your Real Estate Platform to Hetzner Cloud.

---

## 🚀 **Quick Navigation**

### **Start Here** (If you're about to create server):
1. **[HETZNER_CONFIG_QUICK_ANSWER.md](./HETZNER_CONFIG_QUICK_ANSWER.md)** ⭐ **START HERE**
   - Quick answer to "What options should I select?"
   - Visual configuration guide
   - Takes 2 minutes to read

### **Step-by-Step Guides:**

#### Phase 1: Server Creation
2. **[../HETZNER_SETUP_CHECKLIST.md](../HETZNER_SETUP_CHECKLIST.md)**
   - Complete checklist format
   - Check boxes as you go
   - All steps in one place

3. **[SSH_QUICK_GUIDE.md](./SSH_QUICK_GUIDE.md)**
   - Which SSH file to copy to Hetzner
   - How to create SSH keys
   - Troubleshooting SSH issues

4. **[HETZNER_SERVER_OPTIONS_EXPLAINED.md](./HETZNER_SERVER_OPTIONS_EXPLAINED.md)**
   - Detailed explanation of all options
   - Cost comparisons
   - When to use what

#### Phase 2: Deployment
5. **[HETZNER_DEPLOYMENT_GUIDE.md](./HETZNER_DEPLOYMENT_GUIDE.md)** ⭐
   - Complete A-Z deployment walkthrough
   - Docker installation
   - GitHub authentication setup
   - Database setup
   - Application deployment
   - Domain & SSL configuration
   - Monitoring & backups

6. **[GITHUB_AUTH_ERROR_FIX.md](./GITHUB_AUTH_ERROR_FIX.md)** 🔐
   - Fix "Password authentication not supported" error
   - Personal Access Token method
   - SSH key setup
   - Quick troubleshooting

7. **[GITHUB_SSH_SETUP_SERVER.md](./GITHUB_SSH_SETUP_SERVER.md)**
   - Detailed SSH setup guide
   - Automated setup script
   - Full troubleshooting

8. **[PRODUCTION_QUICK_START.md](./PRODUCTION_QUICK_START.md)** ⭐ **Files on server? START HERE**
   - Immediate startup commands
   - Quick configuration guide
   - Verify everything works

9. **[AUTOMATED_DEPLOYMENT_GUIDE.md](./AUTOMATED_DEPLOYMENT_GUIDE.md)** 🤖
   - GitHub Actions CI/CD setup
   - Automated deployments
   - Development → Production workflow
   - Rollback procedures

10. **[REPOSITORY_CLONE_TROUBLESHOOTING.md](./REPOSITORY_CLONE_TROUBLESHOOTING.md)**
    - Fix empty repository clone
    - Branch switching
    - Alternative transfer methods

11. **[BUILD_ONLY_DEPLOYMENT.md](./BUILD_ONLY_DEPLOYMENT.md)** 🏗️
    - Full source vs build-only comparison
    - When to use each approach
    - Advanced deployment strategies
    - Docker containerization

12. **[HETZNER_FILE_BROWSER_SETUP.md](./HETZNER_FILE_BROWSER_SETUP.md)** 📁
    - Install web-based file manager (Filebrowser)
    - View/edit files through browser
    - Upload/download files easily
    - Alternative to SFTP clients

13. **[HETZNER_CLEAN_START_GUIDE.md](./HETZNER_CLEAN_START_GUIDE.md)** 🧹
    - Clean server and start fresh
    - Quick clean (keep packages) vs Deep clean (remove all)
    - Safe file removal scripts
    - Backup procedures

14. **[EMERGENCY_CLEAN_COMMANDS.md](./EMERGENCY_CLEAN_COMMANDS.md)** 🚨
    - Copy-paste ready commands
    - Quick reference for server cleaning
    - Manual clean commands (if scripts unavailable)
    - Emergency backup and rollback

---

## 📊 **Documentation Overview**

| Guide | Purpose | When to Use | Time Needed |
|-------|---------|-------------|-------------|
| **HETZNER_CONFIG_QUICK_ANSWER** | Quick reference | Creating server now | 2 min |
| **HETZNER_SETUP_CHECKLIST** | Step-by-step checklist | Creating server | 5 min |
| **SSH_QUICK_GUIDE** | SSH key help | Need SSH key | 3 min |
| **HETZNER_SERVER_OPTIONS_EXPLAINED** | Detailed options | Want to understand everything | 15 min |
| **HETZNER_DEPLOYMENT_GUIDE** | Full deployment | After server is created | 60 min |
| **GITHUB_AUTH_ERROR_FIX** | Fix GitHub auth error | Getting auth error | 2-5 min |
| **GITHUB_SSH_SETUP_SERVER** | Detailed GitHub SSH | Want SSH method | 10 min |
| **PRODUCTION_QUICK_START** | Start apps on server | Files on server, need to run | 15 min |
| **AUTOMATED_DEPLOYMENT_GUIDE** | CI/CD setup | Want automated deploys | 20 min |
| **REPOSITORY_CLONE_TROUBLESHOOTING** | Fix clone issues | Empty repo after clone | 10 min |
| **HETZNER_FILE_BROWSER_SETUP** | Install file manager | Need to view files graphically | 10 min |
| **HETZNER_CLEAN_START_GUIDE** | Clean server, fresh start | Need to reset server | 2-10 min |
| **EMERGENCY_CLEAN_COMMANDS** | Quick reference | Need commands fast | 1 min |

---

## 🎯 **Use Cases - Which Guide to Read?**

### "I need to create a server RIGHT NOW"
👉 **[HETZNER_CONFIG_QUICK_ANSWER.md](./HETZNER_CONFIG_QUICK_ANSWER.md)**

### "I don't know which SSH file to copy"
👉 **[SSH_QUICK_GUIDE.md](./SSH_QUICK_GUIDE.md)**

### "I want to understand all the server options"
👉 **[HETZNER_SERVER_OPTIONS_EXPLAINED.md](./HETZNER_SERVER_OPTIONS_EXPLAINED.md)**

### "My server is ready, how do I deploy?"
👉 **[HETZNER_DEPLOYMENT_GUIDE.md](./HETZNER_DEPLOYMENT_GUIDE.md)**

### "I want a complete checklist"
👉 **[../HETZNER_SETUP_CHECKLIST.md](../HETZNER_SETUP_CHECKLIST.md)**

### "GitHub says 'Password authentication not supported'"
👉 **[GITHUB_AUTH_ERROR_FIX.md](./GITHUB_AUTH_ERROR_FIX.md)**

### "I want to set up SSH for GitHub"
👉 **[GITHUB_SSH_SETUP_SERVER.md](./GITHUB_SSH_SETUP_SERVER.md)**

### "Files are on server, how do I start the apps?"
👉 **[PRODUCTION_QUICK_START.md](./PRODUCTION_QUICK_START.md)** ⭐

### "I want automated deployments from GitHub"
👉 **[AUTOMATED_DEPLOYMENT_GUIDE.md](./AUTOMATED_DEPLOYMENT_GUIDE.md)**

### "Repository cloned but only has README.md"
👉 **[REPOSITORY_CLONE_TROUBLESHOOTING.md](./REPOSITORY_CLONE_TROUBLESHOOTING.md)**

### "How do I view files on my Hetzner server graphically?"
👉 **[HETZNER_FILE_BROWSER_SETUP.md](./HETZNER_FILE_BROWSER_SETUP.md)** 📁

### "Can I browse files in Hetzner Cloud Console?"
👉 **No** - Hetzner console doesn't have a file browser. Use **[HETZNER_FILE_BROWSER_SETUP.md](./HETZNER_FILE_BROWSER_SETUP.md)** to install a web-based file manager.

### "I want to clean my server and start fresh"
👉 **[HETZNER_CLEAN_START_GUIDE.md](./HETZNER_CLEAN_START_GUIDE.md)** 🧹

### "Remove all project files but keep Docker/Node.js installed"
👉 Use **Quick Clean** script - see **[HETZNER_CLEAN_START_GUIDE.md](./HETZNER_CLEAN_START_GUIDE.md)**

### "Reset server to bare Ubuntu (remove everything)"
👉 Use **Deep Clean** script - see **[HETZNER_CLEAN_START_GUIDE.md](./HETZNER_CLEAN_START_GUIDE.md)**

---

## 🔄 **Deployment Workflow**

```
┌─────────────────────────────────────────────────┐
│  1. Read HETZNER_CONFIG_QUICK_ANSWER.md         │
│     ↓                                            │
│  2. Prepare SSH key (SSH_QUICK_GUIDE.md)        │
│     ↓                                            │
│  3. Create server in Hetzner Console            │
│     ↓                                            │
│  4. Get server IP address                       │
│     ↓                                            │
│  5. Follow HETZNER_DEPLOYMENT_GUIDE.md          │
│     ↓                                            │
│  6. Application is live! 🎉                     │
└─────────────────────────────────────────────────┘
```

---

## 📝 **Quick Reference Cards**

### Server Specifications (Recommended)
```
Server Type:  CPX22
vCPUs:        2 (AMD)
RAM:          4 GB
Storage:      80 GB SSD
Traffic:      20 TB/month
Location:     Nuremberg (Europe)
OS:           Ubuntu 24.04
Cost:         €5.99/mo (€7.19/mo with backups)
```

### Configuration Summary
```
✅ Backups:           Enabled (+€1.20/mo)
❌ Volumes:           Not needed
❌ Placement Groups:  Not needed
⚠️ Labels:            Optional
❌ Cloud Config:      Skip
✅ Name:              realestates-production
```

### What Runs on the Server
```
- NestJS API         (Port 3000)
- Admin Web          (Port 3001)
- User Web           (Port 3002)
- PostgreSQL         (Port 5432)
- Redis (optional)   (Port 6379)
- Nginx (proxy)      (Port 80/443)
```

---

## 🛠️ **Common Tasks**

### Before Server Creation
- [ ] Read configuration guide
- [ ] Prepare SSH public key
- [ ] Decide on backups (recommended: YES)
- [ ] Choose server name

### During Server Creation
- [ ] Select CPX22 server
- [ ] Choose location (Nuremberg)
- [ ] Add SSH key
- [ ] Enable backups
- [ ] Set name
- [ ] Click "Create & Buy now"

### After Server Creation
- [ ] Note down IP address
- [ ] SSH into server
- [ ] Install Docker & Node.js
- [ ] Clone repository
- [ ] Configure environment
- [ ] Deploy applications
- [ ] Set up domain & SSL
- [ ] Configure backups

---

## 🆘 **Troubleshooting Quick Links**

### SSH Issues
👉 **[SSH_QUICK_GUIDE.md](./SSH_QUICK_GUIDE.md)** - Troubleshooting section

### Server Configuration Questions
👉 **[HETZNER_SERVER_OPTIONS_EXPLAINED.md](./HETZNER_SERVER_OPTIONS_EXPLAINED.md)** - Common questions

### Deployment Problems
👉 **[HETZNER_DEPLOYMENT_GUIDE.md](./HETZNER_DEPLOYMENT_GUIDE.md)** - Troubleshooting section

---

## 💰 **Cost Calculator**

### Basic Setup (Testing)
```
CPX22 Server:        €5.99/mo
Backups:             €0.00/mo
Volumes:             €0.00/mo
─────────────────────────────
TOTAL:               €5.99/mo (~€72/year)
```

### Recommended Setup (Production)
```
CPX22 Server:        €5.99/mo
Backups (+20%):      €1.20/mo
Volumes:             €0.00/mo
─────────────────────────────
TOTAL:               €7.19/mo (~€86/year)
```

### High Storage Setup
```
CPX22 Server:        €5.99/mo
Backups (+20%):      €1.20/mo
100GB Volume:        €4.80/mo
─────────────────────────────
TOTAL:              €12.00/mo (~€144/year)
```

---

## 📚 **Additional Documentation**

### Project-Specific
- **[../AI_PROJECT_CONTEXT.md](../AI_PROJECT_CONTEXT.md)** - Project overview
- **[MONOREPO_README.md](./MONOREPO_README.md)** - Monorepo structure
- **[SECURITY-PUBLIC-API.md](./SECURITY-PUBLIC-API.md)** - Security guidelines

### Feature Guides
- **[CHATBOT_GUIDE.md](./CHATBOT_GUIDE.md)** - Google Gemini chatbot
- **[NEWSLETTER_HTML_GUIDE.md](./NEWSLETTER_HTML_GUIDE.md)** - Newsletter features
- **[COLOR_CONFIGURATION.md](./COLOR_CONFIGURATION.md)** - Brand colors

### Development
- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Local development setup
- **[QUICK_REFERENCE_UX.md](./QUICK_REFERENCE_UX.md)** - UX guidelines

---

## ✅ **Pre-Deployment Checklist**

Before you start, make sure you have:

- [ ] Hetzner account created
- [ ] Credit card/payment method added
- [ ] SSH keys ready (see SSH_QUICK_GUIDE.md)
- [ ] Domain name (optional, for production)
- [ ] GitHub repository access
- [ ] Environment variables prepared
- [ ] Read at least HETZNER_CONFIG_QUICK_ANSWER.md

---

## 🎓 **Learning Path**

### Beginner (Never deployed before)
1. Start with **HETZNER_CONFIG_QUICK_ANSWER.md** (2 min)
2. Read **SSH_QUICK_GUIDE.md** (3 min)
3. Use **HETZNER_SETUP_CHECKLIST.md** (5 min)
4. Follow **HETZNER_DEPLOYMENT_GUIDE.md** step-by-step (60 min)

**Total time:** ~70 minutes

### Intermediate (Deployed before, need quick reference)
1. **HETZNER_CONFIG_QUICK_ANSWER.md** (2 min)
2. **HETZNER_SETUP_CHECKLIST.md** (5 min)
3. **HETZNER_DEPLOYMENT_GUIDE.md** (skim for specific sections)

**Total time:** ~15 minutes

### Advanced (Just need a reminder)
1. **HETZNER_CONFIG_QUICK_ANSWER.md** (1 min)
2. **HETZNER_SETUP_CHECKLIST.md** (check boxes only)

**Total time:** ~5 minutes

---

## 📞 **Support**

If you get stuck:

1. **Check troubleshooting sections** in relevant guide
2. **Search documentation** for keywords
3. **Review error logs:**
   ```bash
   pm2 logs
   docker logs <container>
   ```
4. **Hetzner support:** https://docs.hetzner.com/
5. **GitHub issues:** Create issue with error details

---

## 🔄 **Keep This Updated**

This index references:
- ✅ HETZNER_CONFIG_QUICK_ANSWER.md
- ✅ HETZNER_SETUP_CHECKLIST.md
- ✅ SSH_QUICK_GUIDE.md
- ✅ HETZNER_SERVER_OPTIONS_EXPLAINED.md
- ✅ HETZNER_DEPLOYMENT_GUIDE.md

**Last updated:** January 27, 2026

---

## 🚀 **Ready to Deploy?**

**Start here:** [HETZNER_CONFIG_QUICK_ANSWER.md](./HETZNER_CONFIG_QUICK_ANSWER.md)

**Good luck! 🎉**
