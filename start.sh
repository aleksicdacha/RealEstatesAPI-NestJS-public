#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

echo "🚀 Starting Real Estate Management System..."

# Check if required commands exist
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./setup.sh first."
    exit 1
fi

# Check if ports are available
if port_in_use 3000; then
    echo "⚠️  Port 3000 is already in use. Backend might already be running."
fi

if port_in_use 3001; then
    echo "⚠️  Port 3001 is already in use. Frontend might already be running."
fi

# Start backend
echo "🔧 Starting backend server..."
npm run start:dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "🎨 Starting frontend server..."
cd admin-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🔗 URLs:"
echo "   Backend API: http://localhost:3000"
echo "   Frontend Admin: http://localhost:3001"
echo "   API Documentation: http://localhost:3000/api/docs"
echo ""
echo "To stop the application, press Ctrl+C"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping application..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Wait for background processes
wait
