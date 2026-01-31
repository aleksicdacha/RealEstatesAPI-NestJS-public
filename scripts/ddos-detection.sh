#!/bin/bash
# DDoS Detection and Monitoring Script
# Run this script to detect and monitor potential DDoS attacks

echo "🛡️  DDOS DETECTION & MONITORING"
echo "================================"

# Function to check for SYN flood
check_syn_flood() {
    echo ""
    echo "1. SYN Flood Detection"
    echo "----------------------"
    SYN_RECV=$(netstat -ant | grep SYN_RECV | wc -l)
    SYN_SENT=$(netstat -ant | grep SYN_SENT | wc -l)

    echo "SYN_RECV connections: $SYN_RECV"
    echo "SYN_SENT connections: $SYN_SENT"

    if [ "$SYN_RECV" -gt 100 ]; then
        echo "❌ WARNING: Potential SYN flood attack detected!"
        echo "Top SYN_RECV connections:"
        netstat -ant | grep SYN_RECV | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -5
    else
        echo "✅ No SYN flood indicators detected"
    fi
}

# Function to check connection rates
check_connection_rates() {
    echo ""
    echo "2. Connection Rate Analysis"
    echo "---------------------------"

    # Count connections per minute (requires bc)
    if command -v bc &> /dev/null; then
        CONN_RATE=$(netstat -ant | grep ESTABLISHED | wc -l)
        echo "Current established connections: $CONN_RATE"

        if [ "$CONN_RATE" -gt 500 ]; then
            echo "⚠️  WARNING: High number of established connections"
        fi
    fi

    # Check for connection attempts from single IPs
    echo ""
    echo "Top 10 IPs by connection attempts:"
    netstat -ant | awk '{print $5}' | cut -d: -f1 | grep -v "^$" | sort | uniq -c | sort -nr | head -10
}

# Function to check for UDP flood
check_udp_flood() {
    echo ""
    echo "3. UDP Flood Detection"
    echo "----------------------"
    UDP_CONNS=$(netstat -anu | wc -l)
    echo "UDP connections: $UDP_CONNS"

    # Check for unusual UDP traffic
    UDP_ESTABLISHED=$(netstat -anu | grep ESTABLISHED | wc -l)
    echo "UDP established connections: $UDP_ESTABLISHED"
}

# Function to check for HTTP flood
check_http_flood() {
    echo ""
    echo "4. HTTP Flood Detection"
    echo "-----------------------"

    if command -v ss &> /dev/null; then
        HTTP_CONNS=$(ss -ant | grep :80 | wc -l)
        HTTPS_CONNS=$(ss -ant | grep :443 | wc -l)
        echo "HTTP connections (port 80): $HTTP_CONNS"
        echo "HTTPS connections (port 443): $HTTPS_CONNS"
    else
        HTTP_CONNS=$(netstat -ant | grep :80 | wc -l)
        HTTPS_CONNS=$(netstat -ant | grep :443 | wc -l)
        echo "HTTP connections (port 80): $HTTP_CONNS"
        echo "HTTPS connections (port 443): $HTTPS_CONNS"
    fi

    if [ "$HTTP_CONNS" -gt 1000 ] || [ "$HTTPS_CONNS" -gt 1000 ]; then
        echo "⚠️  WARNING: Potential HTTP flood detected!"
    fi
}

# Function to check system resources
check_resources() {
    echo ""
    echo "5. System Resource Usage"
    echo "------------------------"

    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    echo "CPU Usage: ${CPU_USAGE}%"

    # Memory usage
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    echo "Memory Usage: ${MEM_USAGE}%"

    # Disk I/O
    if command -v iostat &> /dev/null; then
        echo ""
        echo "Disk I/O (last 1 second):"
        iostat -x 1 1 | tail -3
    fi

    # Network I/O
    if command -v sar &> /dev/null; then
        echo ""
        echo "Network I/O (if available):"
        sar -n DEV 1 1 | tail -3 2>/dev/null || echo "sar not configured for network monitoring"
    fi
}

# Function to check for botnet activity
check_botnet_activity() {
    echo ""
    echo "6. Botnet Activity Detection"
    echo "-----------------------------"

    # Check for unusual outbound connections
    OUTBOUND=$(netstat -ant | grep ESTABLISHED | grep -v "127.0.0.1" | grep -v "localhost" | wc -l)
    echo "Outbound connections: $OUTBOUND"

    # Check for connections to suspicious ports
    SUSPICIOUS_PORTS=$(netstat -ant | grep -E ":(666|6666|6667|6668|6669|31337|12345|54321)" | wc -l)
    if [ "$SUSPICIOUS_PORTS" -gt 0 ]; then
        echo "❌ WARNING: Connections to suspicious ports detected!"
        netstat -ant | grep -E ":(666|6666|6667|6668|6669|31337|12345|54321)"
    fi
}

# Function to monitor in real-time (optional)
monitor_realtime() {
    echo ""
    echo "7. Real-time Monitoring (Press Ctrl+C to stop)"
    echo "---------------------------------------------"
    echo "Monitoring connections per second for 30 seconds..."

    COUNT=0
    while [ $COUNT -lt 30 ]; do
        CONNS=$(netstat -ant | wc -l)
        echo "$(date +%H:%M:%S): $CONNS connections"
        sleep 1
        COUNT=$((COUNT + 1))
    done
}

# Main execution
check_syn_flood
check_connection_rates
check_udp_flood
check_http_flood
check_resources
check_botnet_activity

echo ""
echo "🛡️  DDoS Protection Recommendations:"
echo "===================================="
echo "1. Install DDoS protection:"
echo "   apt install iptables-persistent fail2ban"
echo ""
echo "2. Configure rate limiting in nginx/apache:"
echo "   limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;"
echo ""
echo "3. Use Cloudflare or similar CDN for DDoS protection"
echo ""
echo "4. Monitor with tools like:"
echo "   - htop (system monitoring)"
echo "   - nload (network monitoring)"
echo "   - tcpdump (packet analysis)"
echo ""
echo "5. Set up alerts for high connection counts"

# Ask if user wants real-time monitoring
echo ""
read -p "Would you like to run real-time connection monitoring? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    monitor_realtime
fi

echo ""
echo "🛡️  DDoS Check Complete"
