#!/bin/bash
# IMMEDIATE SSH SECURITY HARDENING
# Run this script to protect against SSH brute force attacks

echo "🔒 SSH SECURITY HARDENING"
echo "=========================="

# Backup current SSH config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

echo "1. Disabling root login via SSH..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

echo "2. Disabling password authentication (use keys only)..."
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

echo "3. Limiting SSH to specific users only..."
# Uncomment and modify the line below to allow only specific users
# echo "AllowUsers yourusername admin" >> /etc/ssh/sshd_config

echo "4. Changing default SSH port (optional but recommended)..."
# sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

echo "5. Enabling fail2ban SSH protection..."
systemctl enable fail2ban
systemctl start fail2ban

# Configure fail2ban for SSH
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

echo "6. Testing SSH configuration..."
sshd -t

if [ $? -eq 0 ]; then
    echo "✅ SSH configuration is valid"
    echo "7. Restarting SSH service..."
    systemctl restart sshd
    systemctl restart fail2ban
    echo "✅ SSH hardening complete!"
else
    echo "❌ SSH configuration error! Check /etc/ssh/sshd_config"
    exit 1
fi

echo ""
echo "🔑 NEXT STEPS:"
echo "1. Generate SSH keys on your local machine:"
echo "   ssh-keygen -t ed25519 -C 'your-email@example.com'"
echo ""
echo "2. Copy public key to server:"
echo "   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server"
echo ""
echo "3. Test key-based login works before closing this session"
echo ""
echo "4. Monitor fail2ban:"
echo "   fail2ban-client status sshd"
echo ""
echo "⚠️  WARNING: After running this script, you MUST use SSH keys to login!"
echo "   Password authentication is now disabled."
