#!/bin/bash
# Server Security Audit Script
# Run this on your server to check for malware, telnet, DDoS, and other security issues

echo "🔍 SERVER SECURITY AUDIT"
echo "========================"

echo ""
echo "1. CHECKING FOR MALWARE & SUSPICIOUS PROCESSES"
echo "---------------------------------------------"

# Check for suspicious processes
echo "Suspicious processes (check for unknown services):"
ps aux | grep -E "(telnet|netcat|nc|backdoor|nmap|masscan|slowloris|hoic|loic|tor|ssh.*tunnel)" | grep -v grep

# Check for rootkits
echo ""
echo "Checking for rootkits with chkrootkit (if installed):"
if command -v chkrootkit &> /dev/null; then
    chkrootkit | head -20
else
    echo "chkrootkit not installed. Install with: apt install chkrootkit"
fi

# Check for malware with rkhunter (if installed)
echo ""
echo "Checking for rootkits with rkhunter (if installed):"
if command -v rkhunter &> /dev/null; then
    rkhunter --check --sk | head -20
else
    echo "rkhunter not installed. Install with: apt install rkhunter"
fi

echo ""
echo "2. CHECKING NETWORK SECURITY"
echo "----------------------------"

# Check open ports
echo "Open ports and listening services:"
netstat -tlnp 2>/dev/null || ss -tlnp

# Check for telnet service
echo ""
echo "Checking for telnet service:"
if systemctl is-active --quiet telnet; then
    echo "❌ WARNING: Telnet service is running!"
else
    echo "✅ Telnet service is not running"
fi

# Check for telnet port
echo ""
echo "Checking if telnet port (23) is open:"
if netstat -tln | grep -q ":23 "; then
    echo "❌ WARNING: Telnet port 23 is open!"
else
    echo "✅ Telnet port 23 is not open"
fi

# Check firewall status
echo ""
echo "Firewall status:"
if command -v ufw &> /dev/null; then
    ufw status
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --state
else
    echo "No firewall detected (ufw/firewalld)"
fi

echo ""
echo "3. CHECKING FOR DDOS ATTACKS"
echo "----------------------------"

# Check for SYN flood
echo "Checking for SYN flood attacks:"
netstat -ant | awk '{print $6}' | sort | uniq -c | sort -n

# Check connection counts
echo ""
echo "Connection counts by IP (top 10):"
netstat -ant | awk '{print $5}' | cut -d: -f1 | sed -e '/^$/d' | sort | uniq -c | sort -nr | head -10

# Check for unusual traffic patterns
echo ""
echo "Checking for unusual number of connections:"
CONNECTIONS=$(netstat -ant | wc -l)
echo "Total connections: $CONNECTIONS"
if [ "$CONNECTIONS" -gt 1000 ]; then
    echo "⚠️  WARNING: High number of connections detected!"
fi

echo ""
echo "4. CHECKING SYSTEM INTEGRITY"
echo "----------------------------"

# Check for suspicious files
echo "Checking for suspicious files in common locations:"
find /tmp -name "*.sh" -o -name "*backdoor*" -o -name "*exploit*" 2>/dev/null | head -10

# Check for world-writable files
echo ""
echo "World-writable files in system directories:"
find /etc /bin /sbin /usr/bin /usr/sbin -perm -002 -type f 2>/dev/null | head -10

# Check for SUID/SGID files
echo ""
echo "SUID/SGID files (potential security risks):"
find / -perm /6000 -type f 2>/dev/null | head -10

echo ""
echo "5. CHECKING LOGS FOR SUSPICIOUS ACTIVITY"
echo "----------------------------------------"

# Check auth logs for failed logins
echo "Recent failed login attempts:"
if [ -f /var/log/auth.log ]; then
    tail -50 /var/log/auth.log | grep -i "failed\|invalid" | tail -10
elif [ -f /var/log/secure ]; then
    tail -50 /var/log/secure | grep -i "failed\|invalid" | tail -10
fi

# Check for SSH brute force attempts
echo ""
echo "SSH brute force attempts (last 24h):"
if [ -f /var/log/auth.log ]; then
    grep "sshd.*Failed password" /var/log/auth.log | wc -l
fi

echo ""
echo "6. CHECKING RUNNING SERVICES"
echo "----------------------------"

# List all running services
echo "Running services:"
systemctl list-units --type=service --state=running | head -20

# Check for unknown services
echo ""
echo "Check for services not managed by systemd:"
ps aux | grep -v "\[.*\]" | grep -E "(init|systemd)" | wc -l

echo ""
echo "7. MEMORY AND CPU USAGE"
echo "-----------------------"

# Check for high resource usage
echo "Top memory-consuming processes:"
ps aux --sort=-%mem | head -10

echo ""
echo "Top CPU-consuming processes:"
ps aux --sort=-%cpu | head -10

echo ""
echo "8. RECOMMENDED SECURITY MEASURES"
echo "---------------------------------"

echo "Install security tools:"
echo "  apt install chkrootkit rkhunter fail2ban ufw"
echo ""
echo "Enable firewall:"
echo "  ufw enable"
echo ""
echo "Configure fail2ban:"
echo "  systemctl enable fail2ban"
echo "  systemctl start fail2ban"
echo ""
echo "Regular monitoring:"
echo "  - Check logs daily: tail -f /var/log/auth.log"
echo "  - Monitor connections: watch 'netstat -ant | wc -l'"
echo "  - Check disk usage: df -h"
echo "  - Monitor system resources: htop"

echo ""
echo "🔍 AUDIT COMPLETE"
echo "=================="
echo "Review the output above for any suspicious activity."
echo "If you find issues, consider:"
echo "1. Stop suspicious services"
echo "2. Change all passwords"
echo "3. Update system: apt update && apt upgrade"
echo "4. Run a full malware scan"
echo "5. Consider reinstalling if compromised"
