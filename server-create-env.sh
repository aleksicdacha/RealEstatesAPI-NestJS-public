#!/bin/bash
# SERVER VERSION - Create environment files for production
# Run on server: chmod +x server-create-env.sh && ./server-create-env.sh

set -e

echo "======================================"
echo "Creating Server Environment Files"
echo "======================================"
echo ""

# 1. Root .env.production for Docker Compose
echo "Creating .env.production..."
cat > .env.production << 'EOF'
# Root environment for docker-compose.prod.yml
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates

JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=redis
REDIS_PORT=6379

NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
EOF

echo "✅ Created .env.production"
echo ""

# 2. API .env for local migrations
echo "Creating apps/api/.env..."
cat > apps/api/.env << 'EOF'
# API Backend Environment - Production
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates

JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=CHANGE_ME
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

REDIS_HOST=localhost
REDIS_PORT=6379

GEMINI_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@example.com
EOF

echo "✅ Created apps/api/.env"
echo ""

# 3. Admin-web .env.production
echo "Creating apps/admin-web/.env.production..."
mkdir -p apps/admin-web
cat > apps/admin-web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NODE_ENV=production
PORT=3001
EOF

echo "✅ Created apps/admin-web/.env.production"
echo ""

# 4. User-web .env.production
echo "Creating apps/user-web/.env.production..."
mkdir -p apps/user-web
cat > apps/user-web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NODE_ENV=production
PORT=3002
EOF

echo "✅ Created apps/user-web/.env.production"
echo ""

echo "======================================"
echo "✅ All Environment Files Created!"
echo "======================================"
echo ""
echo "Files created:"
echo "  ✅ .env.production (root)"
echo "  ✅ apps/api/.env"
echo "  ✅ apps/admin-web/.env.production"
echo "  ✅ apps/user-web/.env.production"
echo ""
echo "⚠️  Optional: Add your Google Maps API key to:"
echo "   - .env.production"
echo "   - apps/admin-web/.env.production"
echo "   - apps/user-web/.env.production"
echo ""
echo "Next steps:"
echo "  1. Verify PostgreSQL password matches: CHANGE_ME"
echo "  2. Run: ./quick-prod-deploy.sh"
echo ""
