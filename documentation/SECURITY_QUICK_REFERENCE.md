# Server Security Quick Reference Guide
# Essential commands to check for malware, telnet, DDoS, and security issues

## IMMEDIATE SECURITY CHECKS

### 1. Check for Telnet Service
```bash
# Check if telnet is running
systemctl status telnet
netstat -tln | grep :23

# Disable telnet if found
systemctl stop telnet
systemctl disable telnet
apt remove telnetd
```

### 2. Check Open Ports
```bash
# List all listening ports
netstat -tlnp
ss -tlnp

# Check for suspicious ports
netstat -tln | grep -E ":(666|6666|6667|31337|12345|54321)"
```

### 3. Check for Malware Processes
```bash
# Look for suspicious processes
ps aux | grep -E "(telnet|netcat|backdoor|nmap|masscan|slowloris|hoic|loic|tor|miner|xmrig)"

# Check CPU usage
top
htop
```

### 4. DDoS Detection
```bash
# Check connection counts
netstat -ant | wc -l

# Top connecting IPs
netstat -ant | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -10

# SYN flood check
netstat -ant | grep SYN_RECV | wc -l
```

### 5. Firewall Check
```bash
# Check UFW status
ufw status

# Check iptables
iptables -L -n

# Enable firewall if disabled
ufw enable
```

## COMPREHENSIVE SCANNING

### Install Security Tools
```bash
apt update
apt install chkrootkit rkhunter clamav fail2ban ufw iptables-persistent
```

### Run Security Scans
```bash
# Rootkit scan
chkrootkit

# Malware scan
rkhunter --check

# Virus scan
clamscan -r /var/www --quiet

# Update virus definitions
freshclam
```

## MONITORING & LOGS

### Check System Logs
```bash
# Auth logs
tail -f /var/log/auth.log

# System logs
tail -f /var/log/syslog

# Failed login attempts
grep "Failed password" /var/log/auth.log | wc -l
```

### Real-time Monitoring
```bash
# Network connections
watch 'netstat -ant | wc -l'

# System resources
htop

# Network traffic
nload
iftop
```

## DDOS PROTECTION SETUP

### Configure Fail2Ban
```bash
systemctl enable fail2ban
systemctl start fail2ban

# Check status
fail2ban-client status
```

### Rate Limiting (nginx example)
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### iptables DDoS Protection
```bash
# SYN flood protection
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j RETURN
iptables -A INPUT -p tcp --syn -j DROP

# Save rules
iptables-save > /etc/iptables/rules.v4
```

## MALWARE REMOVAL

### If Malware Detected
```bash
# Stop suspicious services
systemctl stop suspicious-service

# Remove malicious files
rm -f /path/to/malicious/file

# Change passwords
passwd username

# Update system
apt update && apt upgrade

# Reinstall if necessary
# Backup data first!
```

## PREVENTION MEASURES

### System Hardening
```bash
# Disable root login via SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# Use strong passwords
apt install libpam-pwquality

# Enable automatic updates
apt install unattended-upgrades
```

### Monitoring Setup
```bash
# Install monitoring tools
apt install htop nload iftop tcpdump

# Set up log monitoring
apt install logwatch
```

## QUICK SECURITY AUDIT

Run all scripts in sequence:
```bash
./scripts/server-security-audit.sh
./scripts/ddos-detection.sh
./scripts/malware-scan.sh
```

## EMERGENCY RESPONSE

If compromise suspected:
1. Disconnect from network
2. Change all passwords
3. Check system logs
4. Scan for malware
5. Remove suspicious files
6. Update system
7. Reinstall if necessary

## USEFUL COMMANDS SUMMARY

```bash
# Network
netstat -tlnp                    # Open ports
netstat -ant | wc -l            # Connection count
ss -tlnp                        # Alternative to netstat

# Processes
ps aux | grep suspicious        # Find processes
top -p PID                      # Monitor specific process
kill -9 PID                     # Kill process

# Files
find / -name "*suspicious*"     # Find files
ls -la /tmp                     # Check temp files
find / -perm -002               # World-writable files

# Logs
tail -f /var/log/auth.log       # Monitor auth logs
grep "Failed" /var/log/auth.log # Failed attempts
dmesg | tail                    # Kernel messages

# System
df -h                           # Disk usage
free -h                         # Memory usage
uptime                          # System uptime
who                             # Logged in users
```

Remember: Regular monitoring is key to security!
