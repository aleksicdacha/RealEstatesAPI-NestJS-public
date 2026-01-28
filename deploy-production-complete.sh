#!/bin/bash
set -e

echo "========================================"
echo "Production Deployment - Complete"
echo "========================================"
echo ""

# Step 1: Stop and clean existing containers
echo "Step 1: Stopping existing containers..."
docker compose -f docker-compose.prod.yml down || true
echo "✅ Containers stopped"
echo ""

# Step 2: Start PostgreSQL and wait for it
echo "Step 2: Starting PostgreSQL..."
docker compose -f docker-compose.prod.yml up -d postgres redis
echo "Waiting 20 seconds for PostgreSQL to initialize..."
sleep 20
echo "✅ PostgreSQL started"
echo ""

# Step 3: Verify PostgreSQL is ready
echo "Step 3: Verifying PostgreSQL..."
for i in {1..10}; do
  if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ PostgreSQL failed to start after 10 attempts"
    docker compose -f docker-compose.prod.yml logs postgres
    exit 1
  fi
  echo "Waiting for PostgreSQL... attempt $i/10"
  sleep 3
done
echo ""

# Step 4: Build all services
echo "Step 4: Building Docker images..."
echo "This may take 5-10 minutes on first build..."
docker compose -f docker-compose.prod.yml build
echo "✅ Images built"
echo ""

# Step 5: Start API service (needed for migrations)
echo "Step 5: Starting API service..."
docker compose -f docker-compose.prod.yml up -d api
echo "Waiting 15 seconds for API to initialize..."
sleep 15
echo "✅ API started"
echo ""

# Step 6: Run migrations inside API container
echo "Step 6: Running database migrations..."
if docker compose -f docker-compose.prod.yml exec -T api npm run migration:run; then
  echo "✅ Migrations completed"
else
  echo "⚠️  Migration failed or no new migrations to run"
  echo "Checking if database tables exist..."

  # Check if tables exist
  if docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d estates -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" | grep -q "property"; then
    echo "✅ Database tables exist, continuing..."
  else
    echo "❌ Database tables missing and migration failed"
    echo "Last migration error:"
    docker compose -f docker-compose.prod.yml logs api | tail -50
    exit 1
  fi
fi
echo ""

# Step 7: Start all services
echo "Step 7: Starting all services..."
docker compose -f docker-compose.prod.yml up -d
echo "Waiting 15 seconds for services to stabilize..."
sleep 15
echo "✅ All services started"
echo ""

# Step 8: Verify deployment
echo "Step 8: Verifying deployment..."
echo ""

echo "Container Status:"
docker compose -f docker-compose.prod.yml ps
echo ""

echo "Testing API endpoint..."
if curl -f -s http://localhost:3000/v1/properties/public?page=1&limit=1 > /dev/null; then
  echo "✅ API is responding"
else
  echo "⚠️  API not responding yet (may need more time)"
fi
echo ""

# Step 9: Show access URLs
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
echo "🌐 Access URLs:"
echo "  - API:         http://46.224.231.217:3000/v1"
echo "  - Admin Panel: http://46.224.231.217:3001"
echo "  - User Website: http://46.224.231.217:3002"
echo ""
echo "📊 Monitoring Commands:"
echo "  - View all logs:  docker compose -f docker-compose.prod.yml logs -f"
echo "  - View API logs:  docker compose -f docker-compose.prod.yml logs -f api"
echo "  - Check status:   docker compose -f docker-compose.prod.yml ps"
echo "  - Restart all:    docker compose -f docker-compose.prod.yml restart"
echo ""
echo "🔧 Management:"
echo "  - Stop all:       docker compose -f docker-compose.prod.yml down"
echo "  - Start all:      docker compose -f docker-compose.prod.yml up -d"
echo "  - View database:  docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d estates"
echo ""
