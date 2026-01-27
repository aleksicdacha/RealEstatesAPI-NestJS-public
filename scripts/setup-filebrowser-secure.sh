#!/bin/bash

# 📁 Secure Filebrowser Installation Script
# This script installs Filebrowser with secure credentials from the start

set -e  # Exit on any error

echo "🔐 Secure Filebrowser Installation"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use: sudo bash setup-filebrowser-secure.sh)"
    exit 1
fi

# Step 1: Download and install Filebrowser
echo "📦 Step 1: Installing Filebrowser..."
curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash

# Verify installation
if ! command -v filebrowser &> /dev/null; then
    echo "❌ Filebrowser installation failed"
    exit 1
fi

echo "✅ Filebrowser installed: $(filebrowser version)"
echo ""

# Step 2: Get secure credentials from user
echo "🔐 Step 2: Set up secure admin credentials"
echo ""
echo "⚠️  DO NOT use 'admin' as username or 'admin' as password!"
echo ""

# Get username
while true; do
    read -p "Enter admin username (not 'admin'): " ADMIN_USER
    if [ "$ADMIN_USER" = "admin" ]; then
        echo "❌ Please use a different username for security!"
    elif [ -z "$ADMIN_USER" ]; then
        echo "❌ Username cannot be empty!"
    else
        break
    fi
done

# Get password
while true; do
    read -sp "Enter secure password (min 12 characters): " ADMIN_PASS
    echo ""
    if [ ${#ADMIN_PASS} -lt 12 ]; then
        echo "❌ Password must be at least 12 characters!"
    else
        read -sp "Confirm password: " ADMIN_PASS_CONFIRM
        echo ""
        if [ "$ADMIN_PASS" = "$ADMIN_PASS_CONFIRM" ]; then
            break
        else
            echo "❌ Passwords don't match!"
        fi
    fi
done

echo ""
echo "✅ Credentials set"
echo ""

# Step 3: Configure Filebrowser
echo "⚙️  Step 3: Configuring Filebrowser..."

# Create config directory
mkdir -p /etc/filebrowser

# Initialize database
filebrowser config init -d /etc/filebrowser/database.db

# Set the root directory
PROJECT_PATH="/root/RealEstatesAPI-NestJS"
if [ ! -d "$PROJECT_PATH" ]; then
    echo "⚠️  Warning: $PROJECT_PATH not found. Using /root instead."
    PROJECT_PATH="/root"
fi

filebrowser config set --root "$PROJECT_PATH" -d /etc/filebrowser/database.db

# Set listening address and port
filebrowser config set --address 0.0.0.0 -d /etc/filebrowser/database.db
filebrowser config set --port 8080 -d /etc/filebrowser/database.db

# Set branding
filebrowser config set --branding.name "Real Estate Server" -d /etc/filebrowser/database.db

# Create secure admin user
filebrowser users add "$ADMIN_USER" "$ADMIN_PASS" --perm.admin -d /etc/filebrowser/database.db

# Remove default admin user (if exists)
filebrowser users rm admin -d /etc/filebrowser/database.db 2>/dev/null || true

echo "✅ Configuration complete"
echo ""

# Step 4: Create systemd service
echo "🚀 Step 4: Setting up auto-start service..."

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

echo "✅ Service started"
echo ""

# Step 5: Configure firewall
echo "🔒 Step 5: Configuring firewall..."

# Check if ufw is installed and active
if command -v ufw &> /dev/null; then
    # Allow port 8080
    ufw allow 8080/tcp
    echo "✅ Firewall configured (port 8080 opened)"
else
    echo "⚠️  UFW not installed. Make sure port 8080 is accessible."
fi
echo ""

# Step 6: Display access information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Filebrowser Installation Complete! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Access Filebrowser at:"
echo ""

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -n "$SERVER_IP" ]; then
    echo "   http://$SERVER_IP:8080"
else
    echo "   http://YOUR_SERVER_IP:8080"
fi

echo ""
echo "🔐 Login credentials:"
echo "   Username: $ADMIN_USER"
echo "   Password: ************** (the password you just set)"
echo ""
echo "📂 Root directory: $PROJECT_PATH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🛠️  Service commands:"
echo "   systemctl status filebrowser    # Check status"
echo "   systemctl restart filebrowser   # Restart service"
echo "   systemctl stop filebrowser      # Stop service"
echo ""
echo "📚 Full documentation: documentation/HETZNER_FILE_BROWSER_SETUP.md"
echo ""

# Save credentials to a file (optional)
read -p "Save credentials to /root/.filebrowser-credentials? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat > /root/.filebrowser-credentials << EOF
Filebrowser Credentials
========================
Username: $ADMIN_USER
Password: $ADMIN_PASS
URL: http://$SERVER_IP:8080
Date: $(date)
EOF
    chmod 600 /root/.filebrowser-credentials
    echo "✅ Credentials saved to /root/.filebrowser-credentials"
    echo "   (This file is protected with permissions 600)"
fi

echo ""
echo "🎉 Installation complete! Open the URL above to access your files."
echo ""
