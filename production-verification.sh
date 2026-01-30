#!/bin/bash
# PRODUCTION VERIFICATION CHECKLIST
# Run this to verify your production deployment is working correctly

echo "🔍 PRODUCTION VERIFICATION CHECKLIST"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local service=$1
    local url=$2
    local name=$3

    echo -n "Checking $name ($url)... "
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

echo ""
echo "1. 🐳 DOCKER SERVICES"
echo "===================="

# Check Docker services
services=$(docker ps --format "{{.Names}}" | grep -E "(estates_|postgres|redis)" | wc -l)
if [ "$services" -ge 3 ]; then
    echo -e "Docker services: ${GREEN}✅ $services running${NC}"
else
    echo -e "Docker services: ${RED}❌ Only $services running${NC}"
fi

echo ""
echo "2. 🌐 APPLICATION ENDPOINTS"
echo "==========================="

# Check API
check_service "api" "http://localhost:3000/v1/properties/public" "API"

# Check Admin Web
check_service "admin" "http://localhost:3001" "Admin Web"

# Check User Web
check_service "user" "http://localhost:3002" "User Web"

echo ""
echo "3. 🗄️ DATABASE CONNECTIVITY"
echo "==========================="

# Check database connection
echo -n "Checking database connection... "
if docker exec estates_postgres_prod pg_isready -U estates_user -d estates_prod > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo "4. 🔧 ENVIRONMENT VARIABLES"
echo "==========================="

# Check critical environment variables
echo -n "Checking API environment... "
if docker exec estates_api_prod env | grep -q "NODE_ENV=production"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "Checking Google Maps API key... "
if docker exec estates_user_prod env | grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo "5. 🔒 SECURITY STATUS"
echo "====================="

# Check SSH configuration
echo -n "Checking SSH security... "
if grep -q "PasswordAuthentication no" /etc/ssh/sshd_config; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Check firewall
echo -n "Checking firewall... "
if ufw status | grep -q "Status: active"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Check fail2ban
echo -n "Checking fail2ban... "
if systemctl is-active --quiet fail2ban; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo "6. 📊 SYSTEM RESOURCES"
echo "======================"

# Show resource usage
echo "Memory usage:"
free -h | grep -E "^(Mem|Swap)"

echo ""
echo "Disk usage:"
df -h | grep -E "(Filesystem|/)$"

echo ""
echo "Docker resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "7. 📋 ACCESS INFORMATION"
echo "========================"

SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"
echo ""
echo "🌐 Application URLs:"
echo "   API:       http://$SERVER_IP:3000"
echo "   Admin:     http://$SERVER_IP:3001"
echo "   User Web:  http://$SERVER_IP:3002"
echo ""
echo "🔧 Management Commands:"
echo "   View logs:    docker logs [container_name]"
echo "   Restart all:  docker compose -f docker-compose.prod.yml restart"
echo "   Monitor:      /usr/local/bin/production-monitor.sh"
echo ""
echo "📊 Health Checks:"
echo "   API Health:   curl http://localhost:3000/v1/properties/public"
echo "   DB Health:    docker exec estates_postgres_prod pg_isready -U estates_user -d estates_prod"

echo ""
echo "🎯 VERIFICATION COMPLETE"
echo "========================"

# Summary
failed_checks=$(grep -c "❌ FAIL" <<< "$(cat /dev/null)")
if [ "$failed_checks" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! Your production deployment is healthy!${NC}"
else
    echo -e "${RED}⚠️  $failed_checks checks failed. Please review the output above.${NC}"
fi
