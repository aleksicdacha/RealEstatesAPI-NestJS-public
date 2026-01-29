#!/bin/bash
# SSH Attack Monitoring Script
# Monitor and block SSH brute force attempts

echo "🔍 SSH ATTACK MONITORING"
echo "========================"

# Check current fail2ban status
echo "1. Fail2Ban Status:"
fail2ban-client status 2>/dev/null || echo "Fail2Ban not running"

echo ""
echo "2. SSH Ban Status:"
fail2ban-client status sshd 2>/dev/null || echo "SSH jail not active"

echo ""
echo "3. Recent SSH Attacks (last 10):"
grep "Failed password\|Invalid user" /var/log/auth.log | tail -10

echo ""
echo "4. Top attacking IPs (last 24h):"
grep "Failed password\|Invalid user" /var/log/auth.log | \
awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head -10

echo ""
echo "5. Current SSH connections:"
who

echo ""
echo "6. SSH service status:"
systemctl status ssh --no-pager -l | head -10

echo ""
echo "7. SSH configuration check:"
grep -E "(PermitRootLogin|PasswordAuthentication|Port)" /etc/ssh/sshd_config

echo ""
echo "🛡️  PROTECTION MEASURES:"
echo "========================"

echo "Active firewall rules:"
ufw status | head -20

echo ""
echo "Blocked IPs in iptables:"
iptables -L -n | grep DROP || echo "No DROP rules found"

echo ""
echo "📊 MONITORING RECOMMENDATIONS:"
echo "=============================="

echo "1. Monitor SSH logs continuously:"
echo "   tail -f /var/log/auth.log | grep sshd"

echo ""
echo "2. Check banned IPs:"
echo "   fail2ban-client status sshd"

echo ""
echo "3. View detailed attack patterns:"
echo "   journalctl -u ssh -f"

echo ""
echo "4. Set up alerts for suspicious activity:"
echo "   # Install monitoring tools"
echo "   apt install monit"
echo "   # Configure email alerts"

echo ""
echo "5. Consider additional protections:"
echo "   - Use SSH key authentication only"
echo "   - Change SSH port from 22"
echo "   - Use VPN for admin access"
echo "   - Implement geo-blocking"

echo ""
echo "🔍 SSH Monitoring Complete"
