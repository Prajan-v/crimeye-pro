#!/bin/bash

# Service verification script for CrimeEye-Pro

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   Verifying CrimeEye-Pro Services     ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Function to check service
check_service() {
    local url=$1
    local name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404\|301\|302"; then
        echo -e "${GREEN}✅ $name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not responding${NC}"
        return 1
    fi
}

# Check all services
check_service "http://localhost:5002/yolo-health" "YOLO Service (Port 5002)"
check_service "http://localhost:8000/health" "FastAPI Backend (Port 8000)"
check_service "http://localhost:5001/" "Node.js Backend (Port 5001)"
check_service "http://localhost:3000" "React Frontend (Port 3000)"

echo ""

# Check database
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL Database is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL Database is not running${NC}"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis Cache is running${NC}"
else
    echo -e "${RED}❌ Redis Cache is not running${NC}"
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}Access Points:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:8000/api/docs${NC}"
echo -e "  Health:   ${GREEN}http://localhost:8000/health${NC}"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo -e "  Username: ${GREEN}CrimeEye${NC}"
echo -e "  Password: ${GREEN}CrimeEye@${NC}"
echo -e "${YELLOW}========================================${NC}"
