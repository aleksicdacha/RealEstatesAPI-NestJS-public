#!/bin/bash
# EMERGENCY MALWARE CLEANUP SCRIPT
# Run this immediately on compromised server

echo "🚨 EMERGENCY MALWARE CLEANUP"
echo "============================"

# Kill suspicious processes
echo "1. Killing suspicious processes..."
pkill -f "x86_64.kok" 2>/dev/null || echo "No x86_64.kok processes found"
pkill -f "miner" 2>/dev/null || echo "No miner processes found"
pkill -f "cryptominer" 2>/dev/null || echo "No cryptominer processes found"

# Remove malware files
echo "2. Removing malware files..."
rm -f /tmp/x86_64.kok 2>/dev/null || echo "x86_64.kok not found in /tmp"
find /tmp -name "*.kok" -delete 2>/dev/null
find /var/tmp -name "*.kok" -delete 2>/dev/null

# Clean up startup files
echo "3. Cleaning startup files..."

# Backup original files
cp /etc/profile /etc/profile.backup.$(date +%Y%m%d_%H%M%S)
cp /root/.bashrc /root/.bashrc.backup.$(date +%Y%m%d_%H%M%S)

# Remove malicious lines from /etc/profile
sed -i '/x86_64\.kok.*startup/d' /etc/profile
sed -i '/deleted.*startup/d' /etc/profile

# Remove malicious lines from /root/.bashrc
sed -i '/x86_64\.kok.*startup/d' /root/.bashrc
sed -i '/deleted.*startup/d' /root/.bashrc

# Check for other compromised files
echo "4. Checking for other compromised files..."
grep -r "x86_64.kok" /etc/ 2>/dev/null | head -5
grep -r "startup" /etc/profile /root/.bashrc 2>/dev/null

# Kill any remaining suspicious processes
echo "5. Final process cleanup..."
ps aux | grep -E "(miner|kok|crypto)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null

# Check for cron jobs
echo "6. Checking cron jobs..."
crontab -l | grep -E "(kok|miner|crypto)" || echo "No suspicious cron jobs found"

# Check for systemd services
echo "7. Checking systemd services..."
systemctl list-units --type=service --state=running | grep -E "(miner|kok|crypto)" || echo "No suspicious services found"

echo ""
echo "🧹 CLEANUP COMPLETE"
echo "=================="

echo "Next steps:"
echo "1. Change ALL passwords immediately"
echo "2. Run: ./ssh-harden.sh (disable password auth)"
echo "3. Check logs: grep 'x86_64.kok' /var/log/*"
echo "4. Run full malware scan: ./malware-scan.sh"
echo "5. Consider reinstalling if heavily compromised"

echo ""
echo "⚠️  WARNING: Your server was accessed without password!"
echo "   This indicates a serious security breach."
