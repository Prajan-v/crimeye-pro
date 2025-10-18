const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./utils/db');

// --- Initialization ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React frontend
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

// --- Database Connection ---
// This function also creates tables if they don't exist
db.createTables();

// --- Middleware ---
app.use(cors());
// Increase payload limit for large base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --- Static Folder ---
// This serves your saved detection images
app.use('/static', express.static(path.join(__dirname, 'static')));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/system', require('./routes/system'));
app.use('/api/analysis', require('./routes/analysis'));

// --- Socket.io Connection ---
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Backend server running on http://localhost:${PORT}`));
