#!/bin/bash

# CrimeEye-Pro Improved Startup Script
# This script ensures all services start correctly with proper error handling

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   CrimeEye-Pro - Starting Services    ${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        echo -e "${YELLOW}   Attempting to kill process on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to start...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Check and create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p backend/static/detections
mkdir -p backend/captured_frames
mkdir -p logs

# Check for required services
echo -e "${YELLOW}🔍 Checking required services...${NC}"

# Check PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 || brew services start postgresql
    else
        echo -e "${RED}PostgreSQL is not running. Please start it manually.${NC}"
        exit 1
    fi
    sleep 3
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Check Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    if command -v brew &> /dev/null; then
        brew services start redis
    else
        redis-server --daemonize yes
    fi
    sleep 2
fi
echo -e "${GREEN}✅ Redis is running${NC}"

# Kill any existing processes on our ports
echo -e "${YELLOW}🔧 Checking ports...${NC}"
check_port 5002  # YOLO
check_port 8000  # FastAPI
check_port 5001  # Node.js
check_port 3000  # React

# Start YOLO Service
echo -e "${YELLOW}🎯 Starting YOLO Detection Service...${NC}"
cd yolo-service
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment for YOLO...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
nohup python app.py > ../logs/yolo.log 2>&1 &
YOLO_PID=$!
cd ..
echo -e "${GREEN}✅ YOLO Service started (PID: $YOLO_PID)${NC}"

# Start FastAPI Backend
echo -e "${YELLOW}🚀 Starting FastAPI Backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment for FastAPI...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Initialize database
    echo -e "${YELLOW}Initializing database...${NC}"
    python -m app.cli init
else
    source venv/bin/activate
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please update .env file with your credentials${NC}"
fi

nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/fastapi.log 2>&1 &
FASTAPI_PID=$!
cd ..
echo -e "${GREEN}✅ FastAPI Backend started (PID: $FASTAPI_PID)${NC}"

# Start Node.js Backend
echo -e "${YELLOW}📦 Starting Node.js Backend...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
fi
nohup node server.js > logs/nodejs.log 2>&1 &
NODEJS_PID=$!
echo -e "${GREEN}✅ Node.js Backend started (PID: $NODEJS_PID)${NC}"

# Start React Frontend
echo -e "${YELLOW}⚛️  Starting React Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing React dependencies...${NC}"
    npm install
fi
nohup npm start > ../logs/react.log 2>&1 &
REACT_PID=$!
cd ..
echo -e "${GREEN}✅ React Frontend started (PID: $REACT_PID)${NC}"

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for all services to be ready...${NC}"
sleep 5

wait_for_service "http://localhost:5002/yolo-health" "YOLO Service"
wait_for_service "http://localhost:8000/health" "FastAPI Backend"
wait_for_service "http://localhost:5001/" "Node.js Backend"
wait_for_service "http://localhost:3000" "React Frontend"

# Save PIDs to file for shutdown script
echo "YOLO_PID=$YOLO_PID" > .pids
echo "FASTAPI_PID=$FASTAPI_PID" >> .pids
echo "NODEJS_PID=$NODEJS_PID" >> .pids
echo "REACT_PID=$REACT_PID" >> .pids

# Display success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ All Services Started Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}📱 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}📚 API Docs:${NC} http://localhost:8000/api/docs"
echo -e "${GREEN}🔌 WebSocket:${NC} ws://localhost:8000/ws"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo -e "  Username: CrimeEye"
echo -e "  Password: CrimeEye@"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC} ./stop-all.sh"
echo -e "${YELLOW}To view logs:${NC} tail -f logs/*.log"
echo ""
echo -e "${GREEN}Happy Monitoring! 🛡️${NC}"
