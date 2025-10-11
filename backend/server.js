const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: '*' }
});

// Make io available to routes
app.set('io', io);

// Import routes
const userRoutes = require('./routes/users');
const incidentRoutes = require('./routes/incidents');
const alertRoutes = require('./routes/alerts');
const activityLogRoutes = require('./routes/activityLog');
const aiRoutes = require('./routes/ai');
const detectionRoutes = require('./routes/detection');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased for base64 images

// Routes
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/detection', detectionRoutes);

// Socket.io
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 CrimeEye-Pro Backend Server`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: Connected`);
    console.log(`${'='.repeat(50)}\n`);
});
