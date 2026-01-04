#!/bin/bash

# Deployment script for Notes App
# This script builds and deploys the application

set -e

echo "🚀 Starting deployment of Notes App..."

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Build the applications
echo "📦 Building applications..."
npm run build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker image prune -f || true

# Start the application
echo "🏃 Starting application..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Frontend: http://localhost:5173"
    echo "🔌 Backend API: http://localhost:5000"
    echo "🗄️ Database: localhost:27017"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
else
    echo "❌ Deployment failed. Check logs:"
    docker-compose logs
    exit 1
fi
