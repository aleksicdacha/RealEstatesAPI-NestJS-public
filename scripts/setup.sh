#!/bin/bash

echo "🚀 Setting up Real Estate Management System..."

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual configuration"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd admin-frontend
npm install
cd ..

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Start PostgreSQL database"
echo "3. Run: npm run migration:run"
echo "4. Run: npm run seed:all"
echo "5. Start the application: npm run dev"
