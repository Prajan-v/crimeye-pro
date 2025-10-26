#!/bin/bash

echo "🎬 CrimeEye-Pro Demo Webcam Setup"
echo "=================================="
echo ""

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg not found. Installing...${NC}"
    brew install ffmpeg
fi

echo -e "${GREEN}✅ FFmpeg is ready${NC}"
echo ""

# Check if CrimeEye-Pro services are running
echo -e "${BLUE}🔍 Checking CrimeEye-Pro services...${NC}"

# Check FastAPI
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ FastAPI Backend (port 8000) - Running${NC}"
else
    echo -e "${RED}❌ FastAPI Backend (port 8000) - Not running${NC}"
    echo "   Start with: cd backend && source venv/bin/activate && python -m app.main"
fi

# Check YOLO Service
if curl -s http://localhost:5002/yolo-health > /dev/null; then
    echo -e "${GREEN}✅ YOLO Service (port 5002) - Running${NC}"
else
    echo -e "${RED}❌ YOLO Service (port 5002) - Not running${NC}"
    echo "   Start with: cd yolo-service && source venv/bin/activate && python app.py"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ React Frontend (port 3000) - Running${NC}"
else
    echo -e "${RED}❌ React Frontend (port 3000) - Not running${NC}"
    echo "   Start with: cd frontend && npm start"
fi

echo ""

# Demo webcam configuration
echo -e "${YELLOW}🎥 DEMO WEBCAM CONFIGURATION${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📱 Your Mac Webcam Details:${NC}"
echo "   Device: FaceTime HD Camera"
echo "   Device ID: 0"
echo "   Resolution: 1280x720 (HD)"
echo "   Frame Rate: 30 FPS"
echo ""

echo -e "${BLUE}🔧 Demo Stream Commands:${NC}"
echo ""
echo -e "${GREEN}Option 1: High Quality RTSP Stream${NC}"
echo "ffmpeg -f avfoundation -i \"0\" -c:v libx264 -preset medium -crf 23 -maxrate 2M -bufsize 4M -f rtsp rtsp://localhost:8554/demo"
echo ""
echo -e "${GREEN}Option 2: Optimized for Demo (Recommended)${NC}"
echo "ffmpeg -f avfoundation -i \"0\" -c:v libx264 -preset fast -crf 25 -maxrate 1M -bufsize 2M -r 15 -s 1280x720 -f rtsp rtsp://localhost:8554/demo"
echo ""
echo -e "${GREEN}Option 3: Low Latency (Best for Live Demo)${NC}"
echo "ffmpeg -f avfoundation -i \"0\" -c:v libx264 -preset ultrafast -tune zerolatency -crf 28 -maxrate 800k -bufsize 1M -r 10 -s 854x480 -f rtsp rtsp://localhost:8554/demo"
echo ""

echo -e "${YELLOW}📋 DEMO SETUP INSTRUCTIONS:${NC}"
echo "=================================="
echo ""
echo "1. ${BLUE}Start the webcam stream${NC} (choose one option above)"
echo "2. ${BLUE}Open CrimeEye-Pro${NC}: http://localhost:3000"
echo "3. ${BLUE}Login${NC}: CrimeEye / CrimeEye@"
echo "4. ${BLUE}Go to Settings → Cameras${NC}"
echo "5. ${BLUE}Add Camera${NC} with these details:"
echo "   • Name: Demo Webcam"
echo "   • RTSP URL: rtsp://localhost:8554/demo"
echo "   • Location: Demo Room"
echo "6. ${BLUE}Test Connection${NC} → Save"
echo "7. ${BLUE}Go to Live Feeds${NC} to see your webcam"
echo ""

echo -e "${YELLOW}🎯 DEMO PRESENTATION TIPS:${NC}"
echo "=================================="
echo ""
echo "• ${GREEN}Position yourself${NC} 2-3 feet from the camera"
echo "• ${GREEN}Ensure good lighting${NC} - face a window or use room lights"
echo "• ${GREEN}Test detection${NC} by moving objects in front of the camera"
echo "• ${GREEN}Show different objects${NC} to demonstrate YOLO detection"
echo "• ${GREEN}Check analytics${NC} dashboard for real-time statistics"
echo "• ${GREEN}Test alerts${NC} by triggering high-threat detections"
echo ""

# Ask if user wants to start demo stream
echo -e "${YELLOW}🚀 Ready to start demo webcam stream?${NC}"
read -p "Choose option (1=High Quality, 2=Optimized, 3=Low Latency, n=Skip): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo -e "${GREEN}🎬 Starting High Quality Demo Stream...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        ffmpeg -f avfoundation -i "0" -c:v libx264 -preset medium -crf 23 -maxrate 2M -bufsize 4M -f rtsp rtsp://localhost:8554/demo
        ;;
    2)
        echo -e "${GREEN}🎬 Starting Optimized Demo Stream...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        ffmpeg -f avfoundation -i "0" -c:v libx264 -preset fast -crf 25 -maxrate 1M -bufsize 2M -r 15 -s 1280x720 -f rtsp rtsp://localhost:8554/demo
        ;;
    3)
        echo -e "${GREEN}🎬 Starting Low Latency Demo Stream...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        ffmpeg -f avfoundation -i "0" -c:v libx264 -preset ultrafast -tune zerolatency -crf 28 -maxrate 800k -bufsize 1M -r 10 -s 854x480 -f rtsp rtsp://localhost:8554/demo
        ;;
    *)
        echo -e "${BLUE}📝 Demo setup complete! Use the instructions above when ready.${NC}"
        ;;
esac
