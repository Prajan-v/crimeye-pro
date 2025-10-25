const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import routes
const authRoutes = require('./backend/routes/auth');
const analysisRoutes = require('./backend/routes/analysis');
// We will add the system health route later

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Your React frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (like detection images)
app.use('/detections', express.static(path.join(__dirname, 'detections')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
// app.use('/api/system', systemRoutes);

// Socket.IO Setup
const io = new Server(server, {
  cors: corsOptions
});

// Socket.IO Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided.'));
  }
  jwt.verify(token, process.env.JWT_SECRET || 'YOUR_REALLY_SECRET_KEY_FALLBACK', (err, user) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.user.username} (ID: ${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`[Backend] Server running on port ${PORT}`);
});

// Export 'io' to be used in other files (like analysisController)
module.exports = { io };