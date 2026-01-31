#!/bin/bash
set -e

echo "======================================"
echo "Creating Environment Files for Production"
echo "======================================"

echo ""
echo "Creating .env.production..."
cat > .env.production << 'EOF'
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
echo "Creating apps/api/.env..."
cat > apps/api/.env << 'EOF'
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
EOF

echo "✅ Created apps/api/.env"

echo ""
echo "Creating apps/admin-web/.env.production..."
cat > apps/admin-web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NODE_ENV=production
PORT=3001
EOF

echo "✅ Created apps/admin-web/.env.production"

echo ""
echo "Creating apps/user-web/.env.production..."
cat > apps/user-web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NODE_ENV=production
PORT=3002
EOF

echo "✅ Created apps/user-web/.env.production"

echo ""
echo "======================================"
echo "✅ All environment files created!"
echo "======================================"
echo ""
echo "Created files:"
echo "  .env.production"
echo "  apps/api/.env"
echo "  apps/admin-web/.env.production"
echo "  apps/user-web/.env.production"
echo ""
echo "Next step: Run ./fix-migration-deploy.sh"
echo ""
