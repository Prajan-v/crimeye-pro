# CrimeEye-Pro Complete Setup Guide

This guide will walk you through setting up the complete CrimeEye-Pro surveillance system from scratch.

## System Requirements

- macOS (your current system)
- PostgreSQL 14+ (already installed)
- Redis 6+ (for caching and rate limiting)
- Python 3.11+
- Node.js 16+
- npm or yarn

## Architecture Overview

The system consists of 4 main services:
1. **PostgreSQL Database** (port 5432) - Data storage
2. **YOLO Service** (port 5002) - Object detection (Flask)
3. **FastAPI Backend** (port 8000) - New real-time API with WebSocket
4. **Node.js Backend** (port 5001) - Existing backend (parallel operation)
5. **React Frontend** (port 3000) - User interface

---

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE crimeye_db;

# Verify
\l

# Exit
\q
```

### 1.2 Configure Database Password (if needed)

```bash
# Set password for your user
psql postgres
ALTER USER prajanv WITH PASSWORD 'your_secure_password';
\q
```

---

## Step 2: Redis Installation

### 2.1 Install Redis via Homebrew

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

---

## Step 3: Backend Setup (FastAPI)

### 3.1 Navigate to Backend Directory

```bash
cd /Users/prajanv/Desktop/crimeye-pro/backend
```

### 3.2 Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### 3.3 Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

### 3.4 Configure Environment Variables

```bash
# Copy example env file
cp env.example .env

# Edit .env file with your actual values
nano .env
```

**Required .env values:**
```env
DATABASE_URL=postgresql://prajanv:YOUR_PASSWORD@localhost:5432/crimeye_db
SECRET_KEY=crimeye-pro-secret-key-2024-secure-random-string
MAIL_USERNAME=crimeeye935@gmail.com
MAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
ADMIN_PHONE=+917010132407
YOLO_SERVICE_URL=http://localhost:5002
REDIS_URL=redis://localhost:6379
FASTAPI_PORT=8000
```

**Note:** For Gmail, you need to create an App Password:
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use that password in MAIL_PASSWORD

### 3.5 Initialize Database

```bash
# Run database initialization
python -m app.cli init
```

This will:
- Create all database tables
- Create admin user with credentials:
  - **Username:** CrimeEye
  - **Password:** CrimeEye@

---

## Step 4: YOLO Service Setup

### 4.1 Navigate to YOLO Service Directory

```bash
cd /Users/prajanv/Desktop/crimeye-pro/yolo-service
```

### 4.2 Activate Virtual Environment (if not already)

```bash
# If venv doesn't exist, create it
python3 -m venv venv

# Activate
source venv/bin/activate
```

### 4.3 Install YOLO Dependencies

```bash
pip install -r requirements.txt
```

### 4.4 Verify YOLO Model

```bash
# Check if yolov8n.pt exists
ls -lh yolov8n.pt

# If not, it will be downloaded automatically on first run
```

---

## Step 5: Frontend Setup

### 5.1 Navigate to Frontend Directory

```bash
cd /Users/prajanv/Desktop/crimeye-pro/frontend
```

### 5.2 Install Node Dependencies

```bash
# Install all dependencies
npm install

# If you encounter errors, try:
npm install --legacy-peer-deps
```

### 5.3 Verify Configuration

Check `src/config/index.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8000';  // FastAPI
export const WEBSOCKET_URL = 'ws://localhost:8000/ws';
```

---

## Step 6: Start All Services

### 6.1 Start Services in Order

**Terminal 1 - Redis (if not running as service):**
```bash
redis-server
```

**Terminal 2 - YOLO Service:**
```bash
cd /Users/prajanv/Desktop/crimeye-pro/yolo-service
source venv/bin/activate
python app.py
```

Wait for: `✅ Model loaded successfully!`

**Terminal 3 - FastAPI Backend:**
```bash
cd /Users/prajanv/Desktop/crimeye-pro/backend
source venv/bin/activate
python -m app.main
```

Wait for: `✅ CrimeEye-Pro FastAPI Backend running on port 8000`

**Terminal 4 - Node.js Backend (existing):**
```bash
cd /Users/prajanv/Desktop/crimeye-pro/backend
npm start
```

Wait for: `🚀 Backend server running on http://localhost:5001`

**Terminal 5 - React Frontend:**
```bash
cd /Users/prajanv/Desktop/crimeye-pro/frontend
npm start
```

Wait for browser to open at `http://localhost:3000`

---

## Step 7: First Login & Testing

### 7.1 Access the Application

1. Open browser to `http://localhost:3000`
2. You should see the futuristic login page with animations

### 7.2 Login with Admin Credentials

```
Username: CrimeEye
Password: CrimeEye@
```

### 7.3 Verify Services

**Check FastAPI:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","timestamp":...}
```

**Check YOLO Service:**
```bash
curl http://localhost:5002/yolo-health
# Should return: {"status":"online","message":"YOLO Service is healthy"}
```

**Check Node.js Backend:**
```bash
curl http://localhost:5001/
# Should return: CrimeEye-Pro Backend API is running.
```

**Check WebSocket:**
Open browser console and test:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => console.log('WebSocket connected!');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
```

---

## Step 8: Add Test Camera

### 8.1 Navigate to Settings

1. Click on "Settings" in the sidebar
2. Go to "Cameras" tab
3. Click "Add Camera"

### 8.2 Add Camera Details

```
Name: Test Camera 1
RTSP URL: rtsp://your-camera-url (or use a test stream)
Location: Main Entrance
```

For testing without real camera, you can use:
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

### 8.3 Test Connection

Click "Test Connection" button to verify camera is accessible.

---

## Step 9: Testing Features

### 9.1 Live Feeds

1. Navigate to "Live Feeds"
2. You should see your cameras in a responsive grid
3. Camera status should show "online" or "offline"
4. FPS counter should appear when streaming

### 9.2 Frame Gallery

1. Navigate to "Frames" (after some detections are captured)
2. Use filters to search by date, camera, or threat level
3. Click on a frame to view in lightbox
4. Test delete functionality

### 9.3 Analytics Dashboard

1. Navigate to "Dashboard"
2. View real-time statistics
3. Check detection trend charts
4. Verify threat distribution pie chart

### 9.4 Real-Time Notifications

1. Trigger a high-threat detection (weapon detection)
2. Check for:
   - Toast notification in browser
   - Email to crimeeye935@gmail.com
   - SMS to +917010132407 (if Twilio configured)

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql

# Test connection
psql -U prajanv -d crimeye_db -c "SELECT 1;"
```

### Redis Connection Issues

```bash
# Check Redis is running
brew services list | grep redis

# Restart if needed
brew services restart redis

# Test connection
redis-cli ping
```

### YOLO Service Not Responding

```bash
# Check if port 5002 is in use
lsof -i :5002

# Kill process if needed
kill -9 <PID>

# Restart YOLO service
cd yolo-service
source venv/bin/activate
python app.py
```

### FastAPI Backend Errors

```bash
# Check logs for errors
cd backend
source venv/bin/activate
python -m app.main

# Reset database if needed
python -m app.cli reset
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Clear cache
npm cache clean --force
```

### WebSocket Connection Failures

1. Check browser console for errors
2. Verify FastAPI is running on port 8000
3. Check CORS settings in `app/main.py`
4. Test WebSocket manually:
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws
```

---

## Performance Optimization Tips

### 1. Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_detection_frames_camera_timestamp 
ON detection_frames(camera_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_detection_frames_threat_level 
ON detection_frames(threat_level);
```

### 2. Redis Caching

Ensure Redis is running for optimal performance:
- Camera status caching
- Rate limiting
- Session management

### 3. YOLO Performance

- Use YOLOv8n (nano) for fastest inference
- Adjust FPS in .env (default: 10 FPS)
- Lower confidence threshold if too many false negatives

### 4. Frontend Performance

```bash
# Build optimized production version
cd frontend
npm run build

# Serve with a production server
npm install -g serve
serve -s build -l 3000
```

---

## Maintenance

### Daily Tasks

1. Check system health: `curl http://localhost:8000/health`
2. Monitor disk space for detection frames
3. Review alerts and notifications

### Weekly Tasks

1. Review analytics dashboard
2. Check camera uptime
3. Verify backup processes

### Monthly Tasks

1. Update dependencies:
```bash
# Backend
cd backend
source venv/bin/activate
pip list --outdated

# Frontend
cd frontend
npm outdated
```

2. Clean old detection frames (automatic, but verify)
3. Review and optimize database queries

---

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong SECRET_KEY in .env
- [ ] Configure Gmail App Password
- [ ] Enable HTTPS in production
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Monitor failed login attempts
- [ ] Keep all dependencies updated

---

## API Documentation

Once FastAPI is running, visit:
- **Interactive API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

---

## Support & Resources

- **Project Directory:** `/Users/prajanv/Desktop/crimeye-pro`
- **Logs Location:** Check terminal outputs for each service
- **Database:** `crimeye_db` on PostgreSQL
- **Admin Email:** crimeeye935@gmail.com
- **Admin Phone:** +917010132407

---

## Quick Start Script

Create `start-all.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Starting CrimeEye-Pro System..."

# Start Redis
echo "📦 Starting Redis..."
brew services start redis

# Start YOLO Service
echo "🎯 Starting YOLO Service..."
cd yolo-service
source venv/bin/activate
python app.py &
YOLO_PID=$!
cd ..

# Wait for YOLO to initialize
sleep 5

# Start FastAPI Backend
echo "⚡ Starting FastAPI Backend..."
cd backend
source venv/bin/activate
python -m app.main &
FASTAPI_PID=$!
cd ..

# Wait for FastAPI to initialize
sleep 3

# Start Node.js Backend
echo "🟢 Starting Node.js Backend..."
cd backend
npm start &
NODEJS_PID=$!
cd ..

# Start Frontend
echo "🎨 Starting React Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "📝 Process IDs:"
echo "   YOLO: $YOLO_PID"
echo "   FastAPI: $FASTAPI_PID"
echo "   Node.js: $NODEJS_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
```

Make it executable:
```bash
chmod +x start-all.sh
```

---

## Success Indicators

✅ All services running without errors
✅ Can login with CrimeEye/CrimeEye@
✅ WebSocket connection established
✅ Camera feeds display in real-time
✅ YOLO detections appear on canvas
✅ Alerts sent via email/SMS
✅ Frame gallery loads correctly
✅ Settings page functional
✅ Analytics dashboard displays data

---

**Congratulations! Your CrimeEye-Pro system is now fully operational!** 🎉

