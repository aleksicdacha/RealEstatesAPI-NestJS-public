#!/bin/bash

# Monorepo Setup Script
echo "🏗️  Setting up Real Estate Monorepo..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build packages in order
echo "🔨 Building packages..."

echo "  → Building @repo/types..."
cd packages/types && npm install && npm run build && cd ../..

echo "  → Building @repo/utils..."
cd packages/utils && npm install && npm run build && cd ../..

echo "  → Building @repo/api-client..."
cd packages/api-client && npm install && npm run build && cd ../..

# Install app dependencies
echo "📱 Installing app dependencies..."

echo "  → Installing user-web dependencies..."
cd apps/user-web && npm install && cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "  1. Start user-web:  cd apps/user-web && npm run dev"
echo "  2. Open browser:    http://localhost:3002/sr"
echo ""
