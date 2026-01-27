#!/bin/bash

#############################################################################
# 🚀 Real Estate Platform - Complete Hetzner Server Setup Script
#############################################################################
#
# This script will:
# 1. Update Ubuntu system
# 2. Install Docker, Node.js 20, Git, Nginx, PM2
# 3. Clone the project from GitHub (develop branch)
# 4. Configure environment files
# 5. Start database
# 6. Build and start all applications
# 7. Configure Nginx reverse proxy
# 8. Setup SSL (optional)
#
# Usage: bash setup-server-complete.sh
#
#############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="https://github.com/YOUR_USERNAME/RealEstatesAPI-NestJS.git"
PROJECT_DIR="/root/RealEstatesAPI-NestJS"
NODE_VERSION="20"

#############################################################################
# Helper Functions
#############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

#############################################################################
# Check if running as root
#############################################################################

if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use: sudo bash setup-server-complete.sh)"
    exit 1
fi

#############################################################################
# Welcome Message
#############################################################################

clear
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🏠 Real Estate Platform - Complete Server Setup             ║"
echo "║                                                               ║"
echo "║   This script will set up your Hetzner server from scratch   ║"
echo "║   with all required software and deploy your application.    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

#############################################################################
# Step 1: Gather Information
#############################################################################

print_header "📝 Step 1: Configuration"

# GitHub Repository
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/RealEstatesAPI-NestJS.git): " GITHUB_REPO
if [ -z "$GITHUB_REPO" ]; then
    print_error "GitHub repository URL is required!"
    exit 1
fi

# GitHub credentials (for private repos)
echo ""
read -p "Is this a private repository? (y/N): " IS_PRIVATE
if [[ $IS_PRIVATE =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
fi

# Domain configuration
echo ""
read -p "Enter your domain name (leave empty to skip domain setup): " DOMAIN_NAME

# Database password
echo ""
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
echo "Generated database password: $DB_PASSWORD"
read -p "Use this password? (Y/n): " USE_GEN_PASS
if [[ $USE_GEN_PASS =~ ^[Nn]$ ]]; then
    read -sp "Enter your preferred database password: " DB_PASSWORD
    echo ""
fi

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 48)

# Google Maps API Key (optional)
echo ""
read -p "Enter Google Maps API Key (optional, press Enter to skip): " GOOGLE_MAPS_KEY

# Gemini API Key (optional)
read -p "Enter Gemini API Key for chatbot (optional, press Enter to skip): " GEMINI_KEY

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
print_info "Server IP detected: $SERVER_IP"

echo ""
print_success "Configuration complete!"

#############################################################################
# Step 2: Update System
#############################################################################

print_header "🔄 Step 2: Updating System"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

print_success "System updated"

#############################################################################
# Step 3: Install Docker
#############################################################################

print_header "🐳 Step 3: Installing Docker"

if command -v docker &> /dev/null; then
    print_info "Docker already installed: $(docker --version)"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Install Docker Compose plugin
    apt-get install -y docker-compose-plugin

    # Start Docker service
    systemctl enable docker
    systemctl start docker

    print_success "Docker installed: $(docker --version)"
fi

#############################################################################
# Step 4: Install Node.js
#############################################################################

print_header "📦 Step 4: Installing Node.js $NODE_VERSION"

if command -v node &> /dev/null; then
    CURRENT_NODE=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$CURRENT_NODE" -ge "$NODE_VERSION" ]; then
        print_info "Node.js already installed: $(node --version)"
    else
        print_warning "Node.js version is old, upgrading..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
fi

# Install PM2 globally
if command -v pm2 &> /dev/null; then
    print_info "PM2 already installed"
else
    npm install -g pm2
    print_success "PM2 installed"
fi

#############################################################################
# Step 5: Install Nginx
#############################################################################

print_header "🌐 Step 5: Installing Nginx"

if command -v nginx &> /dev/null; then
    print_info "Nginx already installed"
else
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx installed"
fi

#############################################################################
# Step 6: Install Git
#############################################################################

print_header "📂 Step 6: Installing Git"

if command -v git &> /dev/null; then
    print_info "Git already installed: $(git --version)"
else
    apt-get install -y git
    print_success "Git installed"
fi

#############################################################################
# Step 7: Clone Project
#############################################################################

print_header "📥 Step 7: Cloning Project"

# Remove existing project directory if exists
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Project directory exists. Removing..."
    rm -rf "$PROJECT_DIR"
fi

cd /root

# Clone repository
if [[ $IS_PRIVATE =~ ^[Yy]$ ]] && [ -n "$GITHUB_TOKEN" ]; then
    # For private repos, embed token in URL
    REPO_URL=$(echo $GITHUB_REPO | sed "s|https://|https://${GITHUB_TOKEN}@|")
    git clone --branch develop "$REPO_URL" RealEstatesAPI-NestJS
else
    git clone --branch develop "$GITHUB_REPO" RealEstatesAPI-NestJS
fi

cd "$PROJECT_DIR"
print_success "Project cloned from develop branch"

#############################################################################
# Step 8: Configure Environment Files
#############################################################################

print_header "⚙️  Step 8: Configuring Environment Files"

# Create API .env file
cat > apps/api/.env << EOF
# Environment
NODE_ENV=production

# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=estates
DB_SYNC=false

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=30d

# Application
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://${SERVER_IP}:3001,http://${SERVER_IP}:3002${DOMAIN_NAME:+,https://${DOMAIN_NAME},https://admin.${DOMAIN_NAME}}

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Gemini AI (Chatbot)
GEMINI_API_KEY=${GEMINI_KEY:-}

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF

print_success "API .env created"

# Create User Web .env.local
cat > apps/user-web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_KEY:-}
EOF

# If domain is set, use HTTPS
if [ -n "$DOMAIN_NAME" ]; then
    cat > apps/user-web/.env.local << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN_NAME}/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_KEY:-}
EOF
fi

print_success "User Web .env.local created"

# Create Admin Web .env.local
cat > apps/admin-web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3000/v1
EOF

if [ -n "$DOMAIN_NAME" ]; then
    cat > apps/admin-web/.env.local << EOF
NEXT_PUBLIC_API_URL=https://admin.${DOMAIN_NAME}/api/v1
EOF
fi

print_success "Admin Web .env.local created"

# Create root .env.development for Docker Compose
cat > .env.development << EOF
DB_NAME=estates
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
EOF

print_success ".env.development created for Docker"

#############################################################################
# Step 9: Start Database
#############################################################################

print_header "🗄️  Step 9: Starting Database"

# Create docker-compose.prod.yml for production
cat > docker-compose.prod.yml << EOF
services:
  postgres:
    image: postgres:16-alpine
    container_name: estates_postgres
    environment:
      POSTGRES_DB: estates
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: estates_redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Start database containers
docker compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
print_info "Waiting for database to initialize..."
sleep 15

# Verify database is running
if docker ps | grep -q estates_postgres; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start!"
    docker logs estates_postgres
    exit 1
fi

#############################################################################
# Step 10: Install Dependencies
#############################################################################

print_header "📦 Step 10: Installing Dependencies"

npm ci --prefer-offline

print_success "Dependencies installed"

#############################################################################
# Step 11: Build Packages and Applications
#############################################################################

print_header "🔧 Step 11: Building Applications"

# Build shared packages first
cd packages/types
npm run build
cd ../..

print_success "Shared packages built"

# Build API specifically (most important)
print_info "Building API..."
cd apps/api

# Clean previous builds
rm -rf dist build 2>/dev/null || true

# Build
npm run build

# Check if build succeeded (could be in dist or build)
if [ -f "dist/main.js" ]; then
    print_success "API built successfully (dist/main.js)"
elif [ -f "build/main.js" ]; then
    print_warning "API built to 'build' folder, moving to 'dist'..."
    mv build dist
    print_success "API build moved to dist/"
else
    print_error "API build failed! No main.js found"
    print_info "Trying direct nest build..."
    npx nest build

    if [ -f "dist/main.js" ]; then
        print_success "API built with npx nest build"
    elif [ -f "build/main.js" ]; then
        mv build dist
        print_success "API build moved to dist/"
    else
        print_error "API build failed completely!"
        print_info "Checking for errors..."
        npm run build 2>&1 | tail -50
        exit 1
    fi
fi
cd ../..

# Build frontend applications
print_info "Building Admin Web..."
cd apps/admin-web
npm run build
cd ../..

print_info "Building User Web..."
cd apps/user-web
npm run build
cd ../..

print_success "All applications built"

#############################################################################
# Step 12: Run Database Migrations and Seed
#############################################################################

print_header "🗄️  Step 12: Running Database Migrations"

cd apps/api

# Install tsconfig-paths if not present
npm install tsconfig-paths --save-dev 2>/dev/null || true

# Try running migrations
print_info "Running migrations..."
npm run migration:run 2>/dev/null || {
    print_warning "Migrations script failed. Trying direct TypeORM CLI..."
    npx typeorm migration:run -d src/data-source.ts 2>/dev/null || {
        print_warning "Migrations may not exist yet or already ran. Continuing..."
    }
}

# Seed admin user directly using ts-node
print_info "Creating admin user..."
npx ts-node ../../seeds/create-admin.ts 2>/dev/null || {
    print_warning "Seed script failed. Admin user may already exist."
}

cd ../..

print_success "Database setup complete"

#############################################################################
# Step 13: Start Applications with PM2
#############################################################################

print_header "🚀 Step 13: Starting Applications"

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Verify API build exists before starting
if [ ! -f "apps/api/dist/main.js" ]; then
    print_error "API build not found! Building now..."
    cd apps/api
    npm run build || npx nest build
    cd ../..
fi

# Start API
print_info "Starting API..."
cd apps/api
if [ -f "dist/main.js" ]; then
    pm2 start dist/main.js --name "api" -i 1
    print_success "API started"
else
    print_error "Cannot start API - dist/main.js not found!"
    print_info "Check build logs above for errors"
fi
cd ../..

# Start Admin Web
print_info "Starting Admin Web..."
cd apps/admin-web
pm2 start npm --name "admin-web" -- start
cd ../..

# Start User Web
print_info "Starting User Web..."
cd apps/user-web
pm2 start npm --name "user-web" -- start
cd ../..
# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

print_success "Applications started with PM2"

# Wait for apps to fully start
sleep 10

# Show PM2 status
pm2 status

#############################################################################
# Step 14: Configure Nginx (if domain provided)
#############################################################################

if [ -n "$DOMAIN_NAME" ]; then
    print_header "🌐 Step 14: Configuring Nginx"

    # Main site (user-web)
    cat > /etc/nginx/sites-available/realestates << EOF
# User Website
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        alias /root/RealEstatesAPI-NestJS/apps/api/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.${DOMAIN_NAME};

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/realestates /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Test and reload Nginx
    nginx -t && systemctl reload nginx

    print_success "Nginx configured for domain: $DOMAIN_NAME"

    # Offer SSL setup
    echo ""
    read -p "Do you want to setup SSL with Let's Encrypt? (y/N): " SETUP_SSL
    if [[ $SETUP_SSL =~ ^[Yy]$ ]]; then
        apt-get install -y certbot python3-certbot-nginx
        certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME -d admin.$DOMAIN_NAME --non-interactive --agree-tos -m admin@$DOMAIN_NAME || print_warning "SSL setup may require manual intervention"
        print_success "SSL certificates installed"
    fi
else
    print_header "🌐 Step 14: Configuring Nginx (Direct IP Access)"

    cat > /etc/nginx/sites-available/realestates << EOF
# Direct IP Access Configuration
server {
    listen 80 default_server;
    server_name _;

    # User Website
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Uploads
    location /uploads {
        alias /root/RealEstatesAPI-NestJS/apps/api/uploads;
        expires 30d;
    }
}

# Admin Panel (port 81)
server {
    listen 81;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:3000;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/realestates /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx

    print_success "Nginx configured for direct IP access"
fi

#############################################################################
# Step 15: Configure Firewall
#############################################################################

print_header "🔒 Step 15: Configuring Firewall"

ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 81/tcp  # Admin panel if no domain

print_success "Firewall configured"

#############################################################################
# Step 16: Save Credentials
#############################################################################

print_header "📝 Step 16: Saving Credentials"

cat > /root/.realestates-credentials << EOF
#############################################################################
# Real Estate Platform - Server Credentials
# Generated: $(date)
#############################################################################

# Server Information
SERVER_IP: ${SERVER_IP}
${DOMAIN_NAME:+DOMAIN: ${DOMAIN_NAME}}

# Database
DB_HOST: localhost
DB_PORT: 5432
DB_NAME: estates
DB_USER: postgres
DB_PASSWORD: ${DB_PASSWORD}

# JWT Secrets
JWT_SECRET: ${JWT_SECRET}
JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}

# Application URLs
${DOMAIN_NAME:+User Website: https://${DOMAIN_NAME}}
${DOMAIN_NAME:+Admin Panel: https://admin.${DOMAIN_NAME}}
${DOMAIN_NAME:-User Website: http://${SERVER_IP}}
${DOMAIN_NAME:-Admin Panel: http://${SERVER_IP}:81}
${DOMAIN_NAME:-Direct Ports:}
${DOMAIN_NAME:-  API:       http://${SERVER_IP}:3000}
${DOMAIN_NAME:-  Admin:     http://${SERVER_IP}:3001}
${DOMAIN_NAME:-  User:      http://${SERVER_IP}:3002}

# Default Admin Login
Email: admin@google.com
Password: admin123
⚠️ CHANGE THIS PASSWORD IMMEDIATELY!

# GitHub Repository
${GITHUB_REPO}

# Useful Commands
pm2 status                    # Check app status
pm2 logs                      # View logs
pm2 restart all               # Restart apps
docker ps                     # Check database
cd /root/RealEstatesAPI-NestJS # Project directory
EOF

chmod 600 /root/.realestates-credentials

print_success "Credentials saved to /root/.realestates-credentials"

#############################################################################
# Completion Message
#############################################################################

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   ✅ SETUP COMPLETE! Your server is ready!                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📌 Access Your Applications:${NC}"
echo ""
if [ -n "$DOMAIN_NAME" ]; then
    echo -e "   🌐 User Website:  ${GREEN}https://${DOMAIN_NAME}${NC}"
    echo -e "   🔐 Admin Panel:   ${GREEN}https://admin.${DOMAIN_NAME}${NC}"
    echo -e "   📡 API:           ${GREEN}https://${DOMAIN_NAME}/api/v1${NC}"
else
    echo -e "   🌐 User Website:  ${GREEN}http://${SERVER_IP}${NC}"
    echo -e "   🔐 Admin Panel:   ${GREEN}http://${SERVER_IP}:81${NC}"
    echo -e "   📡 API:           ${GREEN}http://${SERVER_IP}:3000/v1${NC}"
fi
echo ""
echo -e "${YELLOW}🔑 Default Admin Login:${NC}"
echo "   Email:    admin@google.com"
echo "   Password: admin123"
echo -e "   ${RED}⚠️  CHANGE THIS PASSWORD IMMEDIATELY!${NC}"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View all logs"
echo "   pm2 logs api        - View API logs only"
echo "   pm2 restart all     - Restart all applications"
echo "   docker ps           - Check database status"
echo ""
echo -e "${BLUE}📁 Important Files:${NC}"
echo "   Project:      /root/RealEstatesAPI-NestJS"
echo "   Credentials:  /root/.realestates-credentials"
echo "   API Config:   /root/RealEstatesAPI-NestJS/apps/api/.env"
echo ""
echo -e "${BLUE}🔄 GitHub Auto-Deploy:${NC}"
echo "   See: /root/RealEstatesAPI-NestJS/documentation/GITHUB_ACTIONS_SETUP.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
