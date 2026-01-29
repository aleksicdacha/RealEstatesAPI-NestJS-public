statusit st#!/bin/bash
# PRODUCTION SERVER SECURITY MASTER SCRIPT
# Comprehensive security hardening and malware cleanup for production servers
# Run this script on your production server to secure it completely

set -e  # Exit on any error

echo "🔒 PRODUCTION SERVER SECURITY MASTER SCRIPT"
echo "==========================================="
echo "This script will:"
echo "  ✅ Clean malware and suspicious processes"
echo "  ✅ Harden SSH security (disable password auth)"
echo "  ✅ Configure firewall and fail2ban"
echo "  ✅ Install security tools"
echo "  ✅ Run comprehensive security audit"
echo "  ✅ Set up monitoring"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "❌ Please run as root (sudo)"
        exit 1
    fi
}

# Function for emergency malware cleanup
emergency_cleanup() {
    echo ""
    echo "🚨 PHASE 1: EMERGENCY MALWARE CLEANUP"
    echo "====================================="

    # Kill suspicious processes
    echo "1. Killing suspicious processes..."
    pkill -f "x86_64.kok" 2>/dev/null || echo "   No x86_64.kok processes found"
    pkill -f "miner" 2>/dev/null || echo "   No miner processes found"
    pkill -f "cryptominer" 2>/dev/null || echo "   No cryptominer processes found"
    pkill -f "backdoor" 2>/dev/null || echo "   No backdoor processes found"

    # Remove malware files
    echo "2. Removing malware files..."
    rm -f /tmp/x86_64.kok 2>/dev/null || echo "   x86_64.kok not found in /tmp"
    find /tmp -name "*.kok" -delete 2>/dev/null
    find /var/tmp -name "*.kok" -delete 2>/dev/null
    find /tmp -name "*miner*" -delete 2>/dev/null
    find /tmp -name "*backdoor*" -delete 2>/dev/null

    # Clean up startup files
    echo "3. Cleaning startup files..."

    # Backup original files
    cp /etc/profile /etc/profile.backup.$(date +%Y%m%d_%H%M%S)
    cp /root/.bashrc /root/.bashrc.backup.$(date +%Y%m%d_%H%M%S)

    # Remove malicious lines
    sed -i '/x86_64\.kok.*startup/d' /etc/profile
    sed -i '/deleted.*startup/d' /etc/profile
    sed -i '/x86_64\.kok.*startup/d' /root/.bashrc
    sed -i '/deleted.*startup/d' /root/.bashrc

    # Check for other compromised files
    echo "4. Checking for other compromised files..."
    grep -r "x86_64.kok" /etc/ 2>/dev/null | head -5 || echo "   No x86_64.kok references found"

    # Kill any remaining suspicious processes
    echo "5. Final process cleanup..."
    ps aux | grep -E "(miner|kok|crypto|backdoor)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || echo "   No suspicious processes found"

    # Check cron jobs
    echo "6. Checking cron jobs..."
    crontab -l | grep -E "(kok|miner|crypto)" || echo "   No suspicious cron jobs found"

    # Check systemd services
    echo "7. Checking systemd services..."
    systemctl list-units --type=service --state=running | grep -E "(miner|kok|crypto)" || echo "   No suspicious services found"

    echo "✅ Emergency cleanup complete"
}

# Function for SSH hardening
ssh_hardening() {
    echo ""
    echo "🔐 PHASE 2: SSH SECURITY HARDENING"
    echo "=================================="

    # Backup SSH config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

    echo "1. Disabling root login via SSH..."
    sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

    echo "2. Disabling password authentication..."
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

    echo "3. Enabling public key authentication..."
    sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
    sed -i 's/PubkeyAuthentication no/PubkeyAuthentication yes/' /etc/ssh/sshd_config

    echo "4. Setting strict permissions..."
    sed -i 's/#StrictModes yes/StrictModes yes/' /etc/ssh/sshd_config

    echo "5. Limiting SSH to specific users (uncomment and modify if needed)..."
    # echo "AllowUsers yourusername admin" >> /etc/ssh/sshd_config

    echo "6. Changing default SSH port (optional but recommended)..."
    # sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

    echo "7. Testing SSH configuration..."
    sshd -t
    if [ $? -eq 0 ]; then
        echo "✅ SSH configuration is valid"
    else
        echo "❌ SSH configuration error! Check /etc/ssh/sshd_config"
        exit 1
    fi

    echo "8. Restarting SSH service..."
    systemctl restart ssh 2>/dev/null || systemctl restart sshd 2>/dev/null || service ssh restart 2>/dev/null || echo "⚠️  Could not restart SSH service automatically"

    echo "✅ SSH hardening complete"
    echo ""
    echo "⚠️  IMPORTANT: You must set up SSH keys before closing this session!"
    echo "   Run these commands on your LOCAL machine:"
    echo "   ssh-copy-id -i ~/.ssh/id_rsa.pub root@your-server-ip"
    echo "   Then test: ssh root@your-server-ip"
}

# Function for firewall and fail2ban setup
firewall_setup() {
    echo ""
    echo "🛡️  PHASE 3: FIREWALL & FAIL2BAN SETUP"
    echo "===================================="

    echo "1. Enabling UFW firewall..."
    ufw --force enable
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    ufw allow 8080  # filebrowser
    ufw --force reload

    echo "2. Installing and configuring fail2ban..."
    apt update
    apt install -y fail2ban

    # Configure fail2ban
    cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6
bantime = 3600

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 3600
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban

    echo "✅ Firewall and fail2ban setup complete"
}

# Function to install security tools
install_security_tools() {
    echo ""
    echo "🔧 PHASE 4: INSTALLING SECURITY TOOLS"
    echo "===================================="

    apt update
    apt install -y chkrootkit rkhunter clamav debsums aide auditd monit htop nload iftop tcpdump

    # Update ClamAV definitions
    freshclam --quiet

    # Configure aide
    aideinit --yes 2>/dev/null || echo "aideinit completed with warnings"

    echo "✅ Security tools installed"
}

# Function for system security audit
security_audit() {
    echo ""
    echo "🔍 PHASE 5: COMPREHENSIVE SECURITY AUDIT"
    echo "======================================="

    echo "1. Checking for rootkits..."
    chkrootkit 2>/dev/null | grep -E "(INFECTED|Warning|Suspicious)" | head -10 || echo "   No rootkits detected"

    echo "2. Checking system integrity..."
    debsums -c 2>/dev/null | head -10 || echo "   System files intact"

    echo "3. Checking for suspicious processes..."
    ps aux | grep -E "(miner|kok|crypto|backdoor|nmap|masscan)" | grep -v grep || echo "   No suspicious processes found"

    echo "4. Checking open ports..."
    netstat -tlnp 2>/dev/null | head -10

    echo "5. Checking SSH configuration..."
    grep -E "(PermitRootLogin|PasswordAuthentication|Port)" /etc/ssh/sshd_config

    echo "6. Checking firewall status..."
    ufw status | head -10

    echo "7. Checking fail2ban status..."
    fail2ban-client status 2>/dev/null || echo "   fail2ban not running"

    echo "8. Checking recent failed logins..."
    grep "Failed password" /var/log/auth.log | tail -5 2>/dev/null || echo "   No recent failed logins"

    echo "✅ Security audit complete"
}

# Function for monitoring setup
monitoring_setup() {
    echo ""
    echo "📊 PHASE 6: MONITORING SETUP"
    echo "==========================="

    echo "1. Setting up log monitoring..."
    # Create log monitoring script
    cat > /usr/local/bin/security-monitor.sh << 'EOF'
#!/bin/bash
echo "🔍 Security Monitor - $(date)"
echo "Failed logins today: $(grep 'Failed password' /var/log/auth.log | wc -l)"
echo "Active connections: $(netstat -ant | wc -l)"
echo "Banned IPs: $(fail2ban-client status sshd 2>/dev/null | grep 'Banned IP' | wc -l || echo 'N/A')"
echo "Suspicious processes: $(ps aux | grep -E '(miner|kok|crypto)' | grep -v grep | wc -l)"
EOF

    chmod +x /usr/local/bin/security-monitor.sh

    echo "2. Setting up daily security check cron job..."
    # Add to root's crontab
    (crontab -l ; echo "0 2 * * * /usr/local/bin/security-monitor.sh >> /var/log/security-monitor.log 2>&1") | crontab -

    echo "3. Setting up automatic updates..."
    apt install -y unattended-upgrades
    dpkg-reconfigure --priority=low unattended-upgrades

    echo "✅ Monitoring setup complete"
}

# Function for final recommendations
final_recommendations() {
    echo ""
    echo "🎯 PHASE 7: FINAL SECURITY RECOMMENDATIONS"
    echo "=========================================="

    echo "✅ COMPLETED:"
    echo "  • Malware cleanup"
    echo "  • SSH hardening"
    echo "  • Firewall configuration"
    echo "  • Security tools installation"
    echo "  • System audit"
    echo "  • Monitoring setup"
    echo ""

    echo "🔑 IMMEDIATE NEXT STEPS:"
    echo "1. Set up SSH keys on your local machine:"
    echo "   ssh-keygen -t ed25519 -C 'your-email@example.com'"
    echo "   ssh-copy-id -i ~/.ssh/id_ed25519.pub root@your-server-ip"
    echo ""
    echo "2. Test SSH key login works:"
    echo "   ssh root@your-server-ip"
    echo ""
    echo "3. Change all user passwords:"
    echo "   passwd username"
    echo ""

    echo "📋 DAILY MONITORING:"
    echo "• Check logs: tail -f /var/log/auth.log"
    echo "• Monitor connections: watch 'netstat -ant | wc -l'"
    echo "• Check banned IPs: fail2ban-client status sshd"
    echo "• Run security monitor: /usr/local/bin/security-monitor.sh"
    echo ""

    echo "🛡️  ADDITIONAL SECURITY MEASURES:"
    echo "• Enable 2FA for SSH if possible"
    echo "• Regularly update system: apt update && apt upgrade"
    echo "• Monitor disk usage: df -h"
    echo "• Check system resources: htop"
    echo "• Backup important data regularly"
    echo ""

    echo "🚨 IF COMPROMISE SUSPECTED:"
    echo "• Disconnect from network immediately"
    echo "• Change ALL passwords"
    echo "• Check for backdoors: find / -name '.*' -type f | xargs grep -l 'backdoor' 2>/dev/null"
    echo "• Consider server reinstall"
    echo ""

    echo "✅ PRODUCTION SERVER SECURITY COMPLETE"
    echo "======================================"
    echo "Your server is now significantly more secure!"
    echo "Remember to monitor logs regularly and keep the system updated."
}

# Main execution
check_root
emergency_cleanup
ssh_hardening
firewall_setup
install_security_tools
security_audit
monitoring_setup
final_recommendations

echo ""
echo "🎉 ALL SECURITY MEASURES COMPLETED!"
echo "Please follow the next steps above to finalize your security setup."
