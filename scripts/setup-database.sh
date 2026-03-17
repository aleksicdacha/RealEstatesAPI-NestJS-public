#!/bin/bash

###############################################################################
# Complete Database Setup and Seeding Script
# This script creates all database tables and populates them with data
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Setup & Seeding Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if PostgreSQL is running
echo -e "\n${BLUE}Step 1: Checking PostgreSQL...${NC}"
if ! docker ps | grep -q estates_postgres; then
    echo -e "${RED}PostgreSQL container not running!${NC}"
    echo "Starting PostgreSQL..."
    cd "$(dirname "$0")/.."
    docker-compose up -d postgres redis
    sleep 10
fi

# Test connection
docker exec estates_postgres pg_isready -U postgres > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not responding${NC}"
    exit 1
fi

# Create database schema
echo -e "\n${BLUE}Step 2: Creating database schema...${NC}"

# Copy SQL file to container
docker cp "$(dirname "$0")/create-schema.sql" estates_postgres:/tmp/schema.sql

# Execute schema creation
docker exec estates_postgres psql -U postgres -d estates -f /tmp/schema.sql > /dev/null 2>&1

# Verify tables were created
TABLE_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")

if [ "$TABLE_COUNT" -gt 5 ]; then
    echo -e "${GREEN}✓ Database schema created ($TABLE_COUNT tables)${NC}"
else
    echo -e "${RED}✗ Failed to create schema${NC}"
    exit 1
fi

# Seed the database
echo -e "\n${BLUE}Step 3: Seeding database with sample data...${NC}"

cd "$(dirname "$0")/../apps/api"

# Run the comprehensive seed script
npx ts-node ../../seeds/local-comprehensive-seed.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
    echo -e "${RED}✗ Seeding failed${NC}"
    exit 1
fi

# Verify data
echo -e "\n${BLUE}Step 4: Verifying data...${NC}"

USER_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM users;")
PROPERTY_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM properties;")
CLIENT_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM clients;")

echo -e "Users: ${GREEN}$USER_COUNT${NC}"
echo -e "Properties: ${GREEN}$PROPERTY_COUNT${NC}"
echo -e "Clients: ${GREEN}$CLIENT_COUNT${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Database: estates"
echo "Tables created and populated"
echo ""
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "You can now start the API:"
echo "  cd apps/api"
echo "  npm run start:dev"
