#!/bin/bash
# GitHub Actions SSH Key Setup for Secure Deployments
# Run this on your server to set up SSH keys for GitHub Actions

echo "🔑 Setting up GitHub Actions SSH Key"
echo "===================================="

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (sudo)"
    exit 1
fi

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Generate a new SSH key specifically for GitHub Actions
echo "1. Generating SSH key for GitHub Actions..."
ssh-keygen -t ed25519 -C "github-actions-deploy-$(date +%Y%m%d)" -f ~/.ssh/github_actions_deploy -N ""

# Add the public key to authorized_keys
echo "2. Adding public key to authorized_keys..."
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions_deploy
chmod 644 ~/.ssh/github_actions_deploy.pub

echo ""
echo "✅ SSH key generated successfully!"
echo ""
echo "📋 COPY THIS PRIVATE KEY TO GITHUB SECRETS:"
echo "=========================================="
echo ""
echo "Go to: https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS/settings/secrets/actions"
echo ""
echo "Create a new secret named: HETZNER_SSH_KEY"
echo ""
echo "Paste everything between the === lines below:"
echo ""
echo "==============================================="
cat ~/.ssh/github_actions_deploy
echo "==============================================="
echo ""
echo "🔧 GITHUB SECRETS TO SET:"
echo "========================"
echo ""
echo "HETZNER_HOST:     $(hostname -I | awk '{print $1}')"
echo "HETZNER_USERNAME: root"
echo "HETZNER_SSH_KEY:  [paste the key above]"
echo ""
echo "🧪 TEST THE SETUP:"
echo "=================="
echo ""
echo "After adding the secrets to GitHub:"
echo "1. Make a small change to any file"
echo "2. git add . && git commit -m 'test deploy'"
echo "3. git push origin develop"
echo "4. Check GitHub Actions tab for deployment status"
echo ""
echo "🔒 SECURITY NOTES:"
echo "=================="
echo "• This key is ONLY for GitHub Actions deployments"
echo "• It cannot be used for password authentication"
echo "• Keep your personal SSH keys separate"
echo "• The key is stored securely in GitHub secrets"
echo ""
echo "✅ Setup complete! Add the key to GitHub secrets to enable deployments."
