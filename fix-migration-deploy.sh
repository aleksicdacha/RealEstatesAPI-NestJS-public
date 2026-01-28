#!/bin/bash
set -e

echo "======================================"
echo "Production Deployment - Migration Fix"
echo "======================================"

# Step 1: Ensure .env.production exists
if [ ! -f ".env.production" ]; then
  echo "❌ ERROR: .env.production not found!"
  echo "Run this first to create environment files:"
  echo "  cat > .env.production << 'EOF'"
  echo "  # Paste your .env.production content here"
  echo "  EOF"
  exit 1
fi

echo ""
echo "Step 1: Starting PostgreSQL with port exposed..."
docker compose -f docker-compose.prod.yml up -d postgres

echo ""
echo "Step 2: Waiting for PostgreSQL to be ready..."
sleep 15

echo ""
echo "Step 3: Verifying PostgreSQL connection..."
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres || {
  echo "❌ PostgreSQL is not ready. Waiting 10 more seconds..."
  sleep 10
}

echo ""
echo "Step 4: Running migrations..."
echo "NOTE: This runs migrations from the HOST, connecting to PostgreSQL on localhost:5432"
cd apps/api
npm run migration:run || {
  echo ""
  echo "⚠️  Migration failed from host. Trying inside Docker container..."
  cd ../..

  # Build API image first
  docker compose -f docker-compose.prod.yml build api

  # Start API temporarily
  docker compose -f docker-compose.prod.yml up -d api
  sleep 10

  # Run migrations inside container
  docker compose -f docker-compose.prod.yml exec api npm run migration:run

  echo "✅ Migrations completed inside Docker container"
}
cd ../..

echo ""
echo "Step 5: Building all services..."
docker compose -f docker-compose.prod.yml build

echo ""
echo "Step 6: Starting all services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "Step 7: Waiting for services to stabilize..."
sleep 10

echo ""
echo "Step 8: Checking services status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "Services:"
echo "  API:       http://46.224.231.217:3000/v1"
echo "  Admin:     http://46.224.231.217:3001"
echo "  User Web:  http://46.224.231.217:3002"
echo ""
echo "Verify API: curl http://localhost:3000/v1/properties/public?page=1&limit=1"
echo ""
echo "Check logs: docker compose -f docker-compose.prod.yml logs -f api"
echo ""
