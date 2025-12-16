#!/bin/bash

# Setup script for local development WITHOUT Docker
# This is the simplest setup - just uses local PostgreSQL

echo "🚀 Setting up local development environment (No Docker)..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Please install PostgreSQL:"
    echo "  macOS: brew install postgresql@15"
    echo "  Linux: sudo apt-get install postgresql"
    echo "  Or download from: https://www.postgresql.org/download/"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    # Try to start PostgreSQL (macOS with Homebrew)
    if command -v brew &> /dev/null; then
        brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
        sleep 3
    else
        echo "Please start PostgreSQL manually and run this script again."
        exit 1
    fi
fi

# Create database if it doesn't exist
echo "📦 Creating database..."
createdb rewards_db 2>/dev/null || echo "Database already exists or error occurred"

# Install dependencies
echo "📥 Installing dependencies..."

echo "  - Installing shared package..."
cd packages/shared
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
cd ../..

echo "  - Installing card service..."
cd services/primary/card-service
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../../..

echo "  - Installing frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "VITE_DR_API_URL=http://localhost:4001" >> .env
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now start the services:"
echo ""
echo "Terminal 1 - Card Service:"
echo "  cd services/primary/card-service && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"

