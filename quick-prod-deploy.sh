#!/bin/bash
# Quick Production Deployment Script
# Run on server: chmod +x quick-prod-deploy.sh && ./quick-prod-deploy.sh

set -e  # Exit on any error

echo "======================================"
echo "Production Deployment - Quick Start"
echo "======================================"
echo ""

# Step 1: Start PostgreSQL
echo "Step 1: Starting PostgreSQL..."
docker compose -f docker-compose.prod.yml up -d postgres
echo "✅ PostgreSQL starting..."
echo ""

# Step 2: Wait for PostgreSQL
echo "Step 2: Waiting for PostgreSQL to be ready (15 seconds)..."
sleep 15
echo "✅ PostgreSQL should be ready"
echo ""

# Step 3: Run migrations
echo "Step 3: Running database migrations..."
cd apps/api
npm run build
npm run migration:run
cd ../..
echo "✅ Migrations completed"
echo ""

# Step 4: Start all services
echo "Step 4: Starting all services with Docker Compose..."
docker compose -f docker-compose.prod.yml up -d
echo "✅ All services starting..."
echo ""

# Step 5: Wait for services
echo "Step 5: Waiting for services to initialize (30 seconds)..."
sleep 30
echo ""

# Step 6: Check status
echo "======================================"
echo "Deployment Status:"
echo "======================================"
docker compose -f docker-compose.prod.yml ps
echo ""

# Step 7: Test API
echo "======================================"
echo "Testing API..."
echo "======================================"
curl -s http://localhost:3000/v1/properties/public?page=1&limit=1 | head -n 20
echo ""
echo ""

# Step 8: Check for DDoS connections
echo "======================================"
echo "Checking for DDoS connections to 92.118.207.21..."
echo "======================================"
DDOS_COUNT=$(sudo netstat -an | grep "92.118.207.21" | wc -l || echo "0")
echo "Active connections: $DDOS_COUNT"
if [ "$DDOS_COUNT" -lt 3 ]; then
  echo "✅ No DDoS detected (count: $DDOS_COUNT)"
else
  echo "⚠️  WARNING: High connection count to 92.118.207.21: $DDOS_COUNT"
fi
echo ""

echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo "Services:"
echo "  - API:        http://46.224.231.217:3000"
echo "  - Admin Web:  http://46.224.231.217:3001"
echo "  - User Web:   http://46.224.231.217:3002"
echo ""
echo "View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "Check status: docker compose -f docker-compose.prod.yml ps"
echo ""
