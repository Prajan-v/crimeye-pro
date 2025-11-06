#!/bin/bash

echo "🚀 Starting CrimeEye-Pro Complete System"
echo "=========================================="
echo ""

# Check if Redis is running
echo "📦 Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Starting Redis..."
    brew services start redis
    sleep 2
fi
echo "✅ Redis is running"
echo ""

# Check if PostgreSQL is running
echo "🐘 Checking PostgreSQL..."
if ! pg_isready > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql
    sleep 3
fi
echo "✅ PostgreSQL is running"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start YOLO Service in new terminal
echo "🎯 Starting YOLO Service..."
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && ./start-yolo.sh\""
sleep 5

# Start FastAPI Backend in new terminal
echo "⚡ Starting FastAPI Backend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && ./start-fastapi.sh\""
sleep 3

# Start Node.js Backend in new terminal
echo "🟢 Starting Node.js Backend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && ./start-nodejs.sh\""
sleep 2

# Start React Frontend in new terminal
echo "🎨 Starting React Frontend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && ./start-frontend.sh\""

echo ""
echo "✅ All services are starting in separate terminal windows!"
echo ""
echo "📝 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   FastAPI:      http://localhost:8000"
echo "   FastAPI Docs: http://localhost:8000/docs"
echo "   Node.js API:  http://localhost:5001"
echo "   YOLO Service: http://localhost:5002"
echo "   WebSocket:    ws://localhost:8000/ws"
echo ""
echo ""
echo "⏱️  Please wait 10-15 seconds for all services to fully initialize..."
echo ""

