# CrimeEye-Pro Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Configure Environment
```bash
cd /Users/prajanv/Desktop/crimeye-pro/backend
cp env.example .env
nano .env  # Add your PostgreSQL password
```

### 2. Initialize Database
```bash
cd /Users/prajanv/Desktop/crimeye-pro/backend
source venv/bin/activate
python -m app.cli init
```

### 3. Start Everything
```bash
cd /Users/prajanv/Desktop/crimeye-pro
./start-all.sh
```

**Done!** Access at http://localhost:3000

---

## 🔑 Login Credentials

```
Username: CrimeEye
Password: CrimeEye@
```

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main UI |
| **FastAPI** | http://localhost:8000 | New backend API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Node.js** | http://localhost:5001 | Legacy backend (parallel) |
| **YOLO** | http://localhost:5002 | Object detection service |
| **WebSocket** | ws://localhost:8000/ws | Real-time updates |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/backend/.env` | Environment configuration |
| `/backend/app/cli.py` | Database management CLI |
| `/backend/app/main.py` | FastAPI application |
| `/yolo-service/app.py` | YOLO detection service |
| `/frontend/src/config/index.ts` | Frontend API configuration |
| `SETUP.md` | Detailed setup instructions |
| `README.md` | Project overview |

---

## 🛠️ Common Commands

### Database Management
```bash
# Initialize database and create admin user
python -m app.cli init

# Reset database (WARNING: Deletes all data)
python -m app.cli reset
```

### Service Control
```bash
# Start individual services
./start-yolo.sh      # YOLO detection
./start-fastapi.sh   # FastAPI backend
./start-nodejs.sh    # Node.js backend
./start-frontend.sh  # React frontend

# Start all services
./start-all.sh
```

### Health Checks
```bash
# Check FastAPI
curl http://localhost:8000/health

# Check YOLO
curl http://localhost:5002/yolo-health

# Check Node.js
curl http://localhost:5001/

# Check Redis
redis-cli ping

# Check PostgreSQL
psql -U prajanv -d crimeye_db -c "SELECT 1;"
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
lsof -i :8000  # Find process
kill -9 <PID>  # Kill process
```

### Database Connection Failed
```bash
brew services restart postgresql
```

### Redis Not Running
```bash
brew services start redis
```

### Virtual Environment Issues
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📊 System Architecture

```
Frontend (3000) ──┬──> FastAPI (8000) ──> PostgreSQL (5432)
                  │                    └──> Redis (6379)
                  │                    └──> YOLO (5002)
                  └──> Node.js (5001)
```

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Set strong `SECRET_KEY` in .env
- [ ] Configure Gmail App Password
- [ ] Set PostgreSQL password
- [ ] Review CORS settings
- [ ] Enable HTTPS (production)

---

## 📧 Alert Configuration

### Email (Gmail)
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. Add to `.env`: `MAIL_PASSWORD=your_app_password`

### SMS (Twilio - Optional)
1. Sign up at twilio.com
2. Get Account SID and Auth Token
3. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

---

## 🎯 Key Features

✅ Real-time object detection (YOLOv8)
✅ Multi-camera support
✅ WebSocket live streaming
✅ Email & SMS alerts
✅ Threat classification (Low/Medium/High)
✅ Secure JWT authentication
✅ Responsive camera grid
✅ Frame storage & retrieval
✅ Analytics dashboard
✅ Auto cleanup (30-day retention)

---

## 📱 API Examples

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CrimeEye","password":"CrimeEye@"}'
```

### Get Cameras
```bash
curl http://localhost:8000/api/cameras \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Camera
```bash
curl -X POST http://localhost:8000/api/cameras \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Camera 1",
    "rtsp_url":"rtsp://example.com/stream",
    "location":"Main Entrance"
  }'
```

---

## 🧪 Testing WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected!');
  // Subscribe to camera updates
  ws.send(JSON.stringify({
    type: 'subscribe_camera',
    camera_id: 'your-camera-id'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

---

## 📈 Performance Tips

1. **Adjust YOLO FPS** - Lower FPS = better performance
   ```env
   YOLO_FPS=5  # Default is 10
   ```

2. **Frame Retention** - Reduce storage usage
   ```env
   FRAME_RETENTION_DAYS=7  # Default is 30
   ```

3. **Redis Caching** - Ensure Redis is running for optimal speed

4. **Database Indexes** - Already optimized for fast queries

---

## 🆘 Emergency Commands

### Stop All Services
```bash
# Kill by port
lsof -ti:3000,5001,5002,8000 | xargs kill -9
```

### Reset Everything
```bash
cd backend
source venv/bin/activate
python -m app.cli reset  # Resets database
```

### Clear Redis Cache
```bash
redis-cli FLUSHALL
```

---

## 📞 Support Contacts

**Email:** crimeeye935@gmail.com
**Phone:** +917010132407
**Database:** crimeye_db
**Admin:** CrimeEye

---

## ⚡ Pro Tips

1. Use `./start-all.sh` for quickest startup
2. Check logs in terminal windows for debugging
3. Visit `/docs` endpoint for interactive API testing
4. Use browser DevTools to monitor WebSocket messages
5. Keep Redis running for best performance
6. Regular backups: `pg_dump crimeye_db > backup.sql`

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready (Core Features)

