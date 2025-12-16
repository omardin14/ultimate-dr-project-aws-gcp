#!/bin/bash

# Quick start script for local development

echo "🚀 Starting local development environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database and card service
echo "📦 Starting database and services..."
docker-compose -f docker-compose.dev.yml up -d postgres-primary

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Start card service in background
echo "🔧 Starting card service..."
cd services/primary/card-service
if [ ! -d "node_modules" ]; then
    echo "📥 Installing card service dependencies..."
    npm install
fi

# Start card service in background
npm run dev &
CARD_SERVICE_PID=$!
cd ../../..

# Wait a bit for card service to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "VITE_DR_API_URL=http://localhost:4001" >> .env
fi

echo ""
echo "✅ Services are starting!"
echo ""
echo "📍 Access points:"
echo "   Frontend:    http://localhost:3000"
echo "   Card Service: http://localhost:3001"
echo "   Database:    localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $CARD_SERVICE_PID; docker-compose -f docker-compose.dev.yml down; exit" INT
wait $CARD_SERVICE_PID

