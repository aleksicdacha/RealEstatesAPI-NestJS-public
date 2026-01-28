#!/bin/bash
# Create all required .env files on production server
# Run this on server: chmod +x create-env-files.sh && ./create-env-files.sh

echo "======================================"
echo "Creating Environment Files"
echo "======================================"
echo ""

# 1. API .env
echo "📝 Creating apps/api/.env..."
cat > apps/api/.env << 'EOF'
# API Backend Environment - Production
# IMPORTANT: Replace passwords and secrets!

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=estates

# JWT Configuration
JWT_SECRET=your_32_chars_minimum_secret_key_here_change_this
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=your_refresh_secret_key_minimum_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

# Rate Limiting (DDoS Protection)
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# Google Gemini AI (optional)
GEMINI_API_KEY=

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
echo "✅ Created apps/api/.env"
echo ""

# 2. Admin Web .env.production
echo "📝 Creating apps/admin-web/.env.production..."
cat > apps/admin-web/.env.production << 'EOF'
# Admin Web - Production Environment

NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

NODE_ENV=production
PORT=3001
EOF
echo "✅ Created apps/admin-web/.env.production"
echo ""

# 3. User Web .env.production
echo "📝 Creating apps/user-web/.env.production..."
cat > apps/user-web/.env.production << 'EOF'
# User Web - Production Environment

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
echo "⚠️  NEXT STEPS (IMPORTANT!):"
echo ""
echo "1. Edit API .env with secure credentials:"
echo "   nano apps/api/.env"
echo "   - Change DB_PASSWORD"
echo "   - Change JWT_SECRET (min 32 chars)"
echo "   - Change JWT_REFRESH_SECRET (min 32 chars)"
echo "   - Add GEMINI_API_KEY (if available)"
echo "   - Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (if available)"
echo ""
echo "2. Edit Admin Web .env:"
echo "   nano apps/admin-web/.env.production"
echo "   - Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
echo ""
echo "3. Edit User Web .env:"
echo "   nano apps/user-web/.env.production"
echo "   - Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
echo ""
echo "4. Verify database password matches docker-compose.yml:"
echo "   nano docker-compose.yml"
echo ""
echo "5. After editing, continue with deployment:"
echo "   ./SERVER_COMPLETE_SETUP.sh"
echo ""
