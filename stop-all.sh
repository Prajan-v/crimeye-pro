#!/bin/bash

# CrimeEye-Pro Stop Script
# This script stops all running services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   CrimeEye-Pro - Stopping Services    ${NC}"
echo -e "${YELLOW}========================================${NC}"

# Function to kill process by port
kill_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Stopping $service on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ $service stopped${NC}"
    else
        echo -e "${YELLOW}$service not running on port $port${NC}"
    fi
}

# Read PIDs from file if it exists
if [ -f ".pids" ]; then
    source .pids
    
    # Kill processes by PID
    if [ ! -z "$YOLO_PID" ]; then
        kill -9 $YOLO_PID 2>/dev/null || true
        echo -e "${GREEN}✅ YOLO Service stopped${NC}"
    fi
    
    if [ ! -z "$FASTAPI_PID" ]; then
        kill -9 $FASTAPI_PID 2>/dev/null || true
        echo -e "${GREEN}✅ FastAPI Backend stopped${NC}"
    fi
    
    if [ ! -z "$NODEJS_PID" ]; then
        kill -9 $NODEJS_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Node.js Backend stopped${NC}"
    fi
    
    if [ ! -z "$REACT_PID" ]; then
        kill -9 $REACT_PID 2>/dev/null || true
        echo -e "${GREEN}✅ React Frontend stopped${NC}"
    fi
    
    rm .pids
else
    echo -e "${YELLOW}PID file not found, stopping services by port...${NC}"
fi

# Kill by port as fallback
kill_port 5002 "YOLO Service"
kill_port 8000 "FastAPI Backend"
kill_port 5001 "Node.js Backend"
kill_port 3000 "React Frontend"

# Optional: Stop PostgreSQL and Redis
read -p "Do you want to stop PostgreSQL and Redis? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v brew &> /dev/null; then
        brew services stop postgresql@14 2>/dev/null || brew services stop postgresql
        brew services stop redis
    else
        pg_ctl -D /usr/local/var/postgres stop 2>/dev/null || true
        redis-cli shutdown 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ PostgreSQL and Redis stopped${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ All Services Stopped Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
