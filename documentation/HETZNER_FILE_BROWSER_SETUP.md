# 📁 Hetzner Server - Web File Browser Setup

## Problem: Hetzner Cloud Console Cannot View Files

The Hetzner Cloud Console **does not have a file browser**. It only provides:
- Server management (start/stop/restart)
- Web terminal (command line only)
- Metrics and monitoring

## Solution: Install Filebrowser (Web-based File Manager)

**Filebrowser** is a lightweight, modern web app that lets you:
- ✅ Browse files through your web browser
- ✅ Upload/download files
- ✅ Edit text files (code, configs)
- ✅ Create/delete/rename files and folders
- ✅ Preview images and documents
- ✅ Secure with username/password

## 🔐 Security First

**This guide sets up secure credentials from the start** - no default `admin/admin` passwords that need to be changed later. You'll create your own secure username and password during installation.

**Best practices:**
- ✅ Use a unique, strong password (at least 16 characters)
- ✅ Use a non-obvious username (not "admin")
- ✅ Consider adding SSL/HTTPS for production use
- ✅ Restrict firewall access if possible (only your IP)

---

## 🚀 Quick Installation

### Option 1: Automated Setup Script (Recommended)

**Easiest way** - Use the provided script that handles secure credential creation:

```bash
# On your Hetzner server
cd /root/RealEstatesAPI-NestJS
bash scripts/setup-filebrowser-secure.sh
```

The script will:
- ✅ Install Filebrowser
- ✅ Prompt you to create a secure username and password
- ✅ Configure the service to auto-start
- ✅ Set up the firewall
- ✅ Display access instructions

**Skip to Step 6 below after running the script!**

---

### Option 2: Manual Installation

### Step 1: SSH into Your Hetzner Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install Filebrowser

```bash
# Download and install
curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash

# Verify installation
filebrowser version
```

### Step 3: Configure Filebrowser

```bash
# Create config directory
mkdir -p /etc/filebrowser

# Initialize database
filebrowser config init -d /etc/filebrowser/database.db

# Set the root directory (your project)
filebrowser config set --root /root/RealEstatesAPI-NestJS -d /etc/filebrowser/database.db

# Set listening address and port
filebrowser config set --address 0.0.0.0 -d /etc/filebrowser/database.db
filebrowser config set --port 8080 -d /etc/filebrowser/database.db

# Set branding
filebrowser config set --branding.name "Real Estate Server" -d /etc/filebrowser/database.db

# 🔐 IMPORTANT: Create a secure admin user (replace with your own credentials!)
filebrowser users add admin_user "YourStrongPassword123!" --perm.admin -d /etc/filebrowser/database.db

# Remove the default admin user for security
filebrowser users rm admin -d /etc/filebrowser/database.db 2>/dev/null || true
```

**⚠️ SECURITY NOTE:** Replace `admin_user` and `YourStrongPassword123!` with your own secure credentials!

**💡 TIP: Generate a strong random password:**
```bash
# Generate a 24-character random password
openssl rand -base64 24
```

### Step 4: Create Systemd Service (Auto-start on boot)

```bash
# Create service file
cat > /etc/systemd/system/filebrowser.service << 'EOF'
[Unit]
Description=File Browser
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/filebrowser -d /etc/filebrowser/database.db
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable and start service
systemctl enable filebrowser
systemctl start filebrowser

# Check status
systemctl status filebrowser
```

### Step 5: Configure Firewall

```bash
# Allow port 8080
ufw allow 8080/tcp

# Check firewall status
ufw status
```

### Step 6: Access Filebrowser

Open in your web browser:
```
http://YOUR_SERVER_IP:8080
```

**Login credentials:**
- Username: The username you created in Step 3 (e.g., `admin_user`)
- Password: The password you set in Step 3

**✅ Your account is already secure!** No default credentials are active.

---

## 🔐 User Management

### Change Your Password

1. Login to Filebrowser
2. Click the **user icon** (top right)
3. Click **"Settings"**
4. Go to **"User Management"**
5. Click on your username
6. Set a new password
7. Click **"Update"**

### Add Additional Users

```bash
# Add a read-only user
filebrowser users add viewer_user "ViewerPassword123" -d /etc/filebrowser/database.db

# Add another admin user
filebrowser users add admin2 "Admin2Password123" --perm.admin -d /etc/filebrowser/database.db

# List all users
filebrowser users ls -d /etc/filebrowser/database.db
```

---

## 🔒 Optional: Add SSL with Nginx (Secure HTTPS Access)

### If you already have Nginx configured:

```bash
# Edit your Nginx config
nano /etc/nginx/sites-available/realestates
```

**Add this location block:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # ...existing SSL config...
    
    # Filebrowser location
    location /files {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # ...rest of config...
}
```

**Update Filebrowser to use a base URL:**
```bash
filebrowser config set --baseurl /files -d /etc/filebrowser/database.db
systemctl restart filebrowser
systemctl restart nginx
```

Now access via: `https://yourdomain.com/files`

---

## 🎯 Daily Usage

### Managing Filebrowser Service

```bash
# Check status
systemctl status filebrowser

# Stop service
systemctl stop filebrowser

# Start service
systemctl start filebrowser

# Restart service
systemctl restart filebrowser

# View logs
journalctl -u filebrowser -f
```

### Common Tasks in Filebrowser UI

**Upload files:**
1. Navigate to desired folder
2. Click **"Upload"** button
3. Drag & drop or select files

**Edit files:**
1. Click on any text file (`.js`, `.ts`, `.json`, `.env`, etc.)
2. Click **"Edit"** button
3. Make changes
4. Click **"Save"**

**Download files:**
1. Select file(s) with checkbox
2. Click **"Download"** button

**Create new files/folders:**
1. Click **"New"** button
2. Choose "File" or "Folder"
3. Enter name

---

## 🆘 Troubleshooting

### Cannot access Filebrowser

```bash
# Check if service is running
systemctl status filebrowser

# Check if port is listening
netstat -tlnp | grep 8080

# Check firewall
ufw status | grep 8080

# View logs
journalctl -u filebrowser -n 50
```

### Forgot admin password

```bash
# Stop the service
systemctl stop filebrowser

# Reset the database and create a new admin
rm /etc/filebrowser/database.db
filebrowser config init -d /etc/filebrowser/database.db
filebrowser config set --root /root/RealEstatesAPI-NestJS -d /etc/filebrowser/database.db
filebrowser config set --address 0.0.0.0 -d /etc/filebrowser/database.db
filebrowser config set --port 8080 -d /etc/filebrowser/database.db

# Create new admin user (replace with your credentials)
filebrowser users add new_admin "NewSecurePassword123!" --perm.admin -d /etc/filebrowser/database.db

# Remove default admin
filebrowser users rm admin -d /etc/filebrowser/database.db 2>/dev/null || true

# Start the service
systemctl start filebrowser
```

### Service won't start

```bash
# Check for errors
journalctl -u filebrowser -n 100 --no-pager

# Verify binary exists
which filebrowser

# Try running manually to see errors
filebrowser -d /etc/filebrowser/database.db
```

---

## 🔄 Alternative: SFTP Clients (Desktop Apps)

If you prefer a **desktop application** instead of web interface:

### Windows:
- **WinSCP** - https://winscp.net/eng/download.php
- **FileZilla** - https://filezilla-project.org/download.php?type=client

### Mac:
- **Cyberduck** - https://cyberduck.io/download/
- **FileZilla** - https://filezilla-project.org/download.php?type=client

### Linux:
- **FileZilla** - `sudo apt install filezilla`
- Nautilus/Dolphin/Thunar built-in SFTP support

**Connection settings:**
```
Protocol: SFTP
Host: YOUR_SERVER_IP
Port: 22
Username: root
Authentication: SSH key or password
```

---

## 📊 Comparison: Filebrowser vs SFTP Clients

| Feature | Filebrowser (Web) | SFTP Client (Desktop) |
|---------|-------------------|------------------------|
| **Access from anywhere** | ✅ Yes (just need browser) | ❌ Need app installed |
| **Quick edits** | ✅ Built-in editor | ✅ Can open in external editor |
| **File preview** | ✅ Images, PDFs, videos | ⚠️ Limited |
| **Bulk operations** | ✅ Yes | ✅ Yes |
| **Speed** | ⚠️ Slower for large files | ✅ Faster transfers |
| **Mobile access** | ✅ Works on phone/tablet | ❌ Limited mobile apps |
| **Security** | ⚠️ Needs SSL setup | ✅ Built-in SSH encryption |

---

## ✅ Recommended Setup

**For best workflow, use both:**

1. **Filebrowser** - Quick checks, small edits, previews
2. **SFTP Client** - Large file transfers, bulk operations
3. **SSH Terminal** - System administration, running commands

---

## 📚 Related Documentation

- **Production Quick Start:** `documentation/PRODUCTION_QUICK_START.md`
- **Hetzner Deployment:** `documentation/HETZNER_DEPLOYMENT_GUIDE.md`
- **SSH Setup:** `documentation/SSH_QUICK_GUIDE.md`

---

## 🔗 Official Resources

- **Filebrowser Documentation:** https://filebrowser.org/
- **Filebrowser GitHub:** https://github.com/filebrowser/filebrowser
- **Hetzner Cloud Docs:** https://docs.hetzner.com/cloud/

---

**You now have a graphical file manager for your Hetzner server! 🎉**

Access at: `http://YOUR_SERVER_IP:8080`

Login with the secure credentials you created during setup.
