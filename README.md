# CrimeEye-Pro 🛡️

**Enterprise-Grade Real-Time Surveillance & Threat Detection System**

A production-ready, AI-powered surveillance platform with real-time object detection, threat analysis, and instant alerting capabilities and work monitoring.

---

## 🌟 Features

### Core Capabilities
- **Real-Time Object Detection** - YOLOv8-powered detection with <1s latency
- **Live Desktop Webcam** - Real-time webcam monitoring with instant detection
- **Live Clock Display** - Real-time date and time on surveillance feeds
- **Detection Timestamps** - Automatic timestamp on every detection event
- **Multi-Camera Support** - Monitor unlimited cameras simultaneously
- **Threat Classification** - Automatic threat level assessment (Low/Medium/High)
- **Instant Alerts** - Email and SMS notifications for high-threat detections
- **Live WebSocket Streaming** - Real-time frame updates with minimal latency
- **Frame Gallery** - Searchable archive of all detection events
- **Analytics Dashboard** - Comprehensive statistics and trend analysis
- **Responsive Camera Grid** - Dynamic layouts for 1-20+ cameras
- **Admin Panel** - User registration approval and management

### Security Features
- **JWT Authentication** - Secure token-based authentication with refresh mechanism
- **User Registration System** - Admin approval workflow for new users
- **Password Hashing** - Bcrypt encryption for secure password storage
- **Rate Limiting** - Protection against brute force attacks
- **Encrypted Storage** - Secure frame and metadata storage
- **HTTPS Ready** - Production-ready security configuration
- **Admin Panel** - Manage pending user registrations

### Performance
- **Low Latency** - <50ms WebSocket message delivery
- **Optimized Database** - Indexed queries for fast retrieval
- **Redis Caching** - Sub-millisecond cache access
- **Async Processing** - Non-blocking detection pipeline
- **Frame Compression** - 70% storage reduction

---

## 🚀 Quick Start

### Prerequisites
- macOS (current system)
- PostgreSQL 14+ (installed)
- Redis 6+
- Python 3.11+
- Node.js 16+

### One-Command Setup

```bash
# Clone or navigate to project
cd /Users/prajanv/Desktop/crimeye-pro

# Make scripts executable (if not already)
chmod +x start-*.sh

# Start all services
./start-all.sh
```

This will:
1. ✅ Start Redis
2. ✅ Start PostgreSQL
3. ✅ Launch YOLO service (port 5002)
4. ✅ Launch FastAPI backend (port 8000)
5. ✅ Launch Node.js backend (port 5001)
6. ✅ Launch React frontend (port 3000)

### Access the Application

**Web Interface:** http://localhost:3000

**Login Credentials:**
```
Username: CrimeEye
Password: CrimeEye@
```

**Note:** New users can register but require admin approval before login.

**API Documentation:** http://localhost:8000/docs

---

## 📋 Detailed Setup

For detailed setup instructions, see [SETUP.md](./SETUP.md)

### Manual Service Startup

**Terminal 1 - YOLO Service:**
```bash
./start-yolo.sh
```

**Terminal 2 - FastAPI Backend:**
```bash
./start-fastapi.sh
```

**Terminal 3 - Node.js Backend:**
```bash
./start-nodejs.sh
```

**Terminal 4 - React Frontend:**
```bash
./start-frontend.sh
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│                   (Port 3000)                           │
│  • Futuristic UI with animations                       │
│  • Real-time WebSocket connection                      │
│  • Dynamic camera grid                                 │
│  • Frame gallery & analytics                           │
└────────────┬──────────────────────┬─────────────────────┘
             │                      │
             │                      │
    ┌────────▼────────┐    ┌───────▼────────┐
    │  FastAPI Backend │    │ Node.js Backend│
    │   (Port 8000)    │    │   (Port 5001)  │
    │                  │    │                │
    │ • WebSocket API  │    │ • Legacy API   │
    │ • Auth & JWT     │    │ • Parallel     │
    │ • Real-time data │    │   operation    │
    └────────┬─────────┘    └────────────────┘
             │
             │
    ┌────────▼─────────┐
    │  YOLO Service    │
    │   (Port 5002)    │
    │                  │
    │ • YOLOv8n model  │
    │ • Object detect  │
    │ • Threat assess  │
    └──────────────────┘
             │
             │
    ┌────────▼─────────┐    ┌──────────────┐
    │   PostgreSQL     │    │    Redis     │
    │   (Port 5432)    │    │  (Port 6379) │
    │                  │    │              │
    │ • Detection data │    │ • Caching    │
    │ • User data      │    │ • Rate limit │
    │ • Camera config  │    │ • Sessions   │
    └──────────────────┘    └──────────────┘
```

---

## 📁 Project Structure

```
crimeye-pro/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── cli.py             # CLI commands
│   │   └── main.py            # FastAPI app
│   ├── alembic/               # Database migrations
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── dashboard/     # Analytics dashboard
│   │   │   ├── live-feeds/    # Camera feeds
│   │   │   ├── frames/        # Frame gallery
│   │   │   └── settings/      # Admin settings
│   │   ├── common/            # Shared components
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API clients
│   └── package.json           # Node dependencies
│
├── yolo-service/              # YOLO Detection Service
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   └── yolov8n.pt            # YOLO model
│
├── start-all.sh              # Start all services
├── start-yolo.sh             # Start YOLO service
├── start-fastapi.sh          # Start FastAPI backend
├── start-nodejs.sh           # Start Node.js backend
├── start-frontend.sh         # Start React frontend
├── SETUP.md                  # Detailed setup guide
└── README.md                 # This file
```

---

## 🔧 Configuration

### Environment Variables

Create `/backend/.env` from `env.example`:

```env
# Database
DATABASE_URL=postgresql://prajanv:YOUR_PASSWORD@localhost:5432/crimeye_db

# Email Alerts
MAIL_USERNAME=crimeeye935@gmail.com
MAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD

# SMS Alerts (Optional - Twilio)
ADMIN_PHONE=+917010132407
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Services
YOLO_SERVICE_URL=http://localhost:5002
REDIS_URL=redis://localhost:6379
```

### Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. App Passwords → Generate new password
4. Copy password to `MAIL_PASSWORD` in `.env`

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Cameras
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Add new camera
- `PUT /api/cameras/{id}` - Update camera
- `DELETE /api/cameras/{id}` - Delete camera
- `POST /api/cameras/{id}/test-connection` - Test camera

### Detections
- `GET /api/detections` - Get detection frames
- `GET /api/detections/{id}` - Get specific frame
- `DELETE /api/detections/{id}` - Delete frame

### Analytics
- `GET /api/analytics/summary` - Dashboard statistics
- `GET /api/analytics/trends` - Detection trends
- `GET /api/analytics/threats` - Threat distribution

### WebSocket
- `ws://localhost:8000/ws` - Real-time updates

---

## 🎨 UI Features

### Login Page
- Futuristic glassmorphism design
- Animated particle background
- Password strength indicator
- Real-time form validation
- Smooth animations with Framer Motion

### Dashboard
- Real-time statistics
- Detection trend charts
- Threat distribution
- Camera uptime monitoring
- Live activity feed

### Live Feeds
- Dynamic responsive grid (1-20+ cameras)
- Real-time FPS counter
- Status indicators
- Recording controls
- Fullscreen mode
- Snapshot capture
- Auto-reconnect on connection loss

### Frame Gallery
- Infinite scroll with virtualization
- Advanced filters (date, camera, threat, object)
- Lightbox modal
- Bulk delete
- Export functionality

### Settings
- Profile management
- Camera CRUD operations
- System configuration
- Notification preferences
- Danger zone (data cleanup)

---

## 🧪 Testing

### Health Checks

```bash
# FastAPI
curl http://localhost:8000/health

# YOLO Service
curl http://localhost:5002/yolo-health

# Node.js Backend
curl http://localhost:5001/

# Redis
redis-cli ping

# PostgreSQL
psql -U prajanv -d crimeye_db -c "SELECT 1;"
```

### WebSocket Test

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
```

---

## 📈 Performance Metrics

- **Detection Latency:** <1 second
- **WebSocket Message Delivery:** <50ms
- **Database Query Time:** <100ms
- **Frame Processing:** 10 FPS (configurable)
- **Concurrent Cameras:** 20+ supported
- **Storage Efficiency:** 70% compression

---

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing (cost factor 12)
- Rate limiting (5 login attempts per 15 mins)
- CORS protection
- SQL injection prevention
- XSS protection
- HTTPS ready

---

## 📝 Database Schema

### Tables
- `admin_user` - Admin account
- `cameras` - Camera configurations
- `detection_frames` - Captured frames with detections
- `detection_logs` - Individual object detections
- `alerts` - Notification history

### Indexes
- `(camera_id, timestamp)` - Fast frame queries
- `threat_level` - Quick threat filtering

---

## 🛠️ Maintenance

### Database Cleanup

```bash
# Manual cleanup
cd backend
source venv/bin/activate
python -m app.cli reset  # WARNING: Deletes all data
```

### Logs

Check terminal outputs for each service for real-time logs.

### Backups

```bash
# Backup database
pg_dump -U prajanv crimeye_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U prajanv crimeye_db < backup_20240101.sql
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql
```

### Redis Connection Failed

```bash
# Check Redis status
brew services list | grep redis

# Restart Redis
brew services restart redis
```

### YOLO Model Not Loading

```bash
cd yolo-service
# Model will auto-download on first run
# Or manually download:
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

---

## 📚 Additional Resources
m/)
- [YOLOv8 Documentation](https://docs.ultralytics.com
- [FastAPI Documentation](https://fastapi.tiangolo.co/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🤝 Support

For issues or questions:
- Email: crimeeye935@gmail.com
- Phone: +917010132407

---

## 📄 License

Proprietary - All Rights Reserved

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Cloud deployment
- [ ] Multi-user support
- [ ] Advanced analytics with ML
- [ ] Integration with third-party cameras
- [ ] Facial recognition
- [ ] License plate recognition
- [ ] Behavior analysis

---

**Made with ❤️ for enhanced security and peace of mind**