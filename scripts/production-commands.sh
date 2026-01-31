#!/bin/bash
# Production Server Management Script
# Use this on production server for common tasks

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_menu() {
    echo ""
    echo -e "${BLUE}=== PRODUCTION SERVER MANAGEMENT ===${NC}"
    echo "1)  Deploy/Redeploy Application"
    echo "2)  Check Services Status"
    echo "3)  View All Logs"
    echo "4)  Restart All Services"
    echo "5)  Restart Single Service"
    echo "6)  Stop All Services"
    echo "7)  Start All Services"
    echo "8)  Test API Endpoint"
    echo "9)  Check Database Tables"
    echo "10) Database Backup"
    echo "11) View Resource Usage"
    echo "12) Update from Git"
    echo "13) View Service URLs"
    echo "0)  Exit"
    echo ""
}

cd /root/RealEstatesAPI-NestJS 2>/dev/null || {
    echo -e "${RED}Error: Project directory not found!${NC}"
    exit 1
}

while true; do
    show_menu
    read -p "Enter your choice [0-13]: " choice

    case $choice in
        1)
            echo -e "${GREEN}Starting deployment...${NC}"
            ./deploy.sh
            ;;
        2)
            echo -e "${GREEN}Services status:${NC}"
            docker compose -f docker-compose.prod.yml ps
            ;;
        3)
            echo -e "${GREEN}Viewing logs (Ctrl+C to exit)...${NC}"
            docker compose -f docker-compose.prod.yml logs -f --tail 50
            ;;
        4)
            echo -e "${YELLOW}Restarting all services...${NC}"
            docker compose -f docker-compose.prod.yml restart
            echo -e "${GREEN}All services restarted!${NC}"
            ;;
        5)
            echo "Services: api, admin-web, user-web, postgres, redis"
            read -p "Enter service name: " service
            docker compose -f docker-compose.prod.yml restart $service
            echo -e "${GREEN}$service restarted!${NC}"
            ;;
        6)
            echo -e "${RED}Stopping all services...${NC}"
            docker compose -f docker-compose.prod.yml down
            ;;
        7)
            echo -e "${GREEN}Starting all services...${NC}"
            docker compose -f docker-compose.prod.yml up -d
            sleep 5
            docker compose -f docker-compose.prod.yml ps
            ;;
        8)
            echo -e "${GREEN}Testing API...${NC}"
            curl -s http://localhost:3000/v1/properties/public | jq '.' || curl -s http://localhost:3000/v1/properties/public
            ;;
        9)
            echo -e "${GREEN}Database tables:${NC}"
            docker exec estates_postgres_prod psql -U estates_user -d estates_prod -c "\dt"
            ;;
        10)
            BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
            echo -e "${GREEN}Creating backup: $BACKUP_FILE${NC}"
            docker exec estates_postgres_prod pg_dump -U estates_user estates_prod > $BACKUP_FILE
            echo -e "${GREEN}Backup saved: $BACKUP_FILE${NC}"
            ls -lh $BACKUP_FILE
            ;;
        11)
            echo -e "${GREEN}Resource usage:${NC}"
            docker stats --no-stream
            ;;
        12)
            echo -e "${YELLOW}Updating from Git...${NC}"
            git fetch origin
            git status
            echo ""
            read -p "Pull latest from develop? (y/n): " confirm
            if [ "$confirm" = "y" ]; then
                git pull origin develop
                echo -e "${GREEN}Code updated!${NC}"
                read -p "Redeploy? (y/n): " redeploy
                if [ "$redeploy" = "y" ]; then
                    ./deploy.sh
                fi
            fi
            ;;
        13)
            SERVER_IP=$(hostname -I | awk '{print $1}')
            echo -e "${BLUE}=== SERVICE URLs ===${NC}"
            echo ""
            echo "API:          http://$SERVER_IP:3000"
            echo "Admin Panel:  http://$SERVER_IP:3001"
            echo "User Website: http://$SERVER_IP:3002"
            echo ""
            ;;
        0)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option!${NC}"
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
done

check_status() {
    echo "${GREEN}Checking services status...${NC}"
    docker compose -f docker-compose.prod.yml ps
}

view_logs() {
    echo "${GREEN}Viewing all logs (Ctrl+C to exit)...${NC}"
    docker compose -f docker-compose.prod.yml logs -f --tail 50
}

restart_all() {
    echo "${YELLOW}Restarting all services...${NC}"
    docker compose -f docker-compose.prod.yml restart
    echo "${GREEN}All services restarted!${NC}"
}

restart_single() {
    echo "Available services: api, admin-web, user-web, postgres, redis"
    read -p "Enter service name: " service
    echo "${YELLOW}Restarting $service...${NC}"
    docker compose -f docker-compose.prod.yml restart $service
    echo "${GREEN}$service restarted!${NC}"
}

stop_all() {
    echo "${RED}Stopping all services...${NC}"
    docker compose -f docker-compose.prod.yml down
    echo "${GREEN}All services stopped!${NC}"
}

start_all() {
    echo "${GREEN}Starting all services...${NC}"
    docker compose -f docker-compose.prod.yml up -d
    sleep 5
    echo "${GREEN}All services started!${NC}"
    docker compose -f docker-compose.prod.yml ps
}

rebuild_all() {
    echo "${YELLOW}Rebuilding and redeploying all services...${NC}"
    echo "This may take several minutes..."
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml build
    docker compose -f docker-compose.prod.yml up -d
    echo "${GREEN}Rebuild complete!${NC}"
}

test_api() {
    echo "${GREEN}Testing API endpoint...${NC}"
    echo ""
    echo "GET /v1/properties/public:"
    curl -s http://localhost:3000/v1/properties/public | jq '.' || curl -s http://localhost:3000/v1/properties/public
    echo ""
}

check_database() {
    echo "${GREEN}Database tables:${NC}"
    docker exec estates_postgres_prod psql -U estates_user -d estates_prod -c "\dt"
    echo ""
    echo "${GREEN}Row counts:${NC}"
    docker exec estates_postgres_prod psql -U estates_user -d estates_prod -c "
        SELECT 'users' as table_name, COUNT(*) FROM users
        UNION ALL
        SELECT 'properties', COUNT(*) FROM properties
        UNION ALL
        SELECT 'clients', COUNT(*) FROM clients
        UNION ALL
        SELECT 'property_images', COUNT(*) FROM property_images
        UNION ALL
        SELECT 'representatives', COUNT(*) FROM representatives
        UNION ALL
        SELECT 'newsletter_subscribers', COUNT(*) FROM newsletter_subscribers;
    "
}

show_urls() {
    echo "${BLUE}=== SERVICE URLs ===${NC}"
    echo ""
    echo "🔗 API (Backend):"
    echo "   http://46.224.231.217:3000"
    echo "   http://46.224.231.217:3000/v1/properties/public"
    echo ""
    echo "👤 Admin Panel:"
    echo "   http://46.224.231.217:3001"
    echo ""
    echo "🌐 User Website:"
    echo "   http://46.224.231.217:3002"
    echo ""
    echo "💾 Database:"
    echo "   Host: localhost:5432"
    echo "   Database: estates_prod"
    echo "   User: estates_user"
    echo ""
}

backup_database() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "${GREEN}Creating database backup: $BACKUP_FILE${NC}"
    docker exec estates_postgres_prod pg_dump -U estates_user estates_prod > $BACKUP_FILE
    echo "${GREEN}Backup saved: $BACKUP_FILE${NC}"
    ls -lh $BACKUP_FILE
}

show_resources() {
    echo "${GREEN}Docker container resource usage:${NC}"
    docker stats --no-stream
    echo ""
    echo "${GREEN}Disk usage:${NC}"
    df -h | grep -E 'Filesystem|/dev/sda'
    echo ""
    echo "${GREEN}Memory usage:${NC}"
    free -h
}

clean_docker() {
    echo "${YELLOW}Cleaning Docker system...${NC}"
    echo "This will remove:"
    echo "  - Stopped containers"
    echo "  - Unused networks"
    echo "  - Dangling images"
    echo "  - Build cache"
    echo ""
    read -p "Continue? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        docker system prune -f
        echo "${GREEN}Docker system cleaned!${NC}"
    fi
}

update_and_deploy() {
    echo "${YELLOW}Updating from Git and redeploying...${NC}"
    echo ""
    git fetch origin
    git status
    echo ""
    read -p "Pull latest changes from develop? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        git pull origin develop
        echo ""
        echo "${GREEN}Code updated!${NC}"
        echo ""
        read -p "Rebuild and redeploy? (y/n): " rebuild
        if [ "$rebuild" = "y" ]; then
            docker compose -f docker-compose.prod.yml down
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml up -d
            echo "${GREEN}Deployment complete!${NC}"
        fi
    fi
}

# Main script
cd /root/RealEstatesAPI-NestJS 2>/dev/null || {
    echo "${RED}Error: Project directory not found!${NC}"
    echo "Expected location: /root/RealEstatesAPI-NestJS"
    exit 1
}

while true; do
    show_menu
    read -p "Enter your choice [0-14]: " choice

    case $choice in
        1) check_status ;;
        2) view_logs ;;
        3) restart_all ;;
        4) restart_single ;;
        5) stop_all ;;
        6) start_all ;;
        7) rebuild_all ;;
        8) test_api ;;
        9) check_database ;;
        10) show_urls ;;
        11) backup_database ;;
        12) show_resources ;;
        13) clean_docker ;;
        14) update_and_deploy ;;
        0)
            echo "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo "${RED}Invalid option!${NC}"
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
done
