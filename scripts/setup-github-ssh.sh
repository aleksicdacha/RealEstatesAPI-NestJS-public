#!/bin/bash

#############################################
# GitHub SSH Setup for Hetzner Deployment
# Automates SSH key generation for GitHub
#############################################

set -e

echo "════════════════════════════════════════════════════════"
echo "🔐 GitHub SSH Authentication Setup"
echo "════════════════════════════════════════════════════════"
echo ""

# Check if .ssh directory exists
if [ ! -d "$HOME/.ssh" ]; then
    echo "📁 Creating .ssh directory..."
    mkdir -p "$HOME/.ssh"
    chmod 700 "$HOME/.ssh"
fi

# Generate SSH key if it doesn't exist
KEY_PATH="$HOME/.ssh/github_deploy"
if [ ! -f "$KEY_PATH" ]; then
    echo "🔑 Generating new SSH key for GitHub..."
    ssh-keygen -t ed25519 -C "github-deploy-$(hostname)-$(date +%Y%m%d)" -f "$KEY_PATH" -N ""
    echo "✅ SSH key generated successfully"
else
    echo "⚠️  SSH key already exists at: $KEY_PATH"
    echo "   Using existing key..."
fi

# Configure SSH config
echo ""
echo "⚙️  Configuring SSH..."

# Backup existing config if it exists
if [ -f "$HOME/.ssh/config" ]; then
    if ! grep -q "Host github.com" "$HOME/.ssh/config"; then
        echo "   Backing up existing SSH config..."
        cp "$HOME/.ssh/config" "$HOME/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)"
    fi
fi

# Add GitHub SSH config (or update it)
if grep -q "Host github.com" "$HOME/.ssh/config" 2>/dev/null; then
    echo "   GitHub config already exists in SSH config"
else
    cat >> "$HOME/.ssh/config" << 'EOF'

# GitHub SSH Configuration
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
    echo "   Added GitHub configuration to SSH config"
fi

# Set correct permissions
chmod 600 "$HOME/.ssh/config" 2>/dev/null || true
chmod 600 "$KEY_PATH"
chmod 644 "${KEY_PATH}.pub"

echo "✅ SSH configuration complete"
echo ""

# Display public key
echo "════════════════════════════════════════════════════════"
echo "📋 YOUR PUBLIC KEY - Copy this to GitHub:"
echo "════════════════════════════════════════════════════════"
echo ""
cat "${KEY_PATH}.pub"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Instructions
echo "📌 NEXT STEPS:"
echo ""
echo "1. Copy the SSH key above (the entire line)"
echo ""
echo "2. Open in your browser:"
echo "   👉 https://github.com/settings/keys"
echo ""
echo "3. Click 'New SSH key' button"
echo ""
echo "4. Fill in:"
echo "   - Title: Hetzner Server - RealEstates"
echo "   - Key type: Authentication Key"
echo "   - Key: Paste the public key from above"
echo ""
echo "5. Click 'Add SSH key'"
echo ""
echo "6. Back on this server, test the connection:"
echo "   👉 ssh -T git@github.com"
echo ""
echo "   You should see: 'Hi [username]! You've successfully authenticated...'"
echo ""
echo "7. Clone your repository:"
echo "   👉 git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Offer to test connection
echo "Would you like to test the GitHub connection now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔍 Testing GitHub SSH connection..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo "✅ SUCCESS! GitHub SSH is working!"
        echo ""
        echo "You can now clone your repository:"
        echo "cd ~ && git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git"
    else
        echo "⚠️  Connection test failed."
        echo ""
        echo "This is normal if you haven't added the SSH key to GitHub yet."
        echo "Please complete steps 1-5 above, then test again with:"
        echo "ssh -T git@github.com"
    fi
else
    echo ""
    echo "⏭️  Skipping connection test."
    echo "   Test manually later with: ssh -T git@github.com"
fi

echo ""
echo "✅ Setup complete!"
echo ""
