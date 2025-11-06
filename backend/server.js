const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./utils/db'); // Import db utility

// --- Initialization ---
const app = express();
const server = http.createServer(app);

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow connection from frontend
    methods: ["GET", "POST"]
  }
});
app.set('socketio', io); // Make io accessible in controllers

// --- Request Logger Middleware (Add this EARLY) ---
app.use((req, res, next) => {
  const start = Date.now();
  // Log request start
  console.log(`➡️ ${req.method} ${req.originalUrl} (from ${req.ip})`);
  // Log response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`⬅️ ${req.method} ${req.originalUrl} ${res.statusCode} ${res.statusMessage} (${duration}ms)`);
  });
  next(); // Pass control to the next middleware
});

// --- Core Middleware ---
// 1. CORS
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

// 2. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --- Static Folder ---
const staticPath = path.join(__dirname, 'static');
app.use('/static', express.static(staticPath));
console.log(`✅ Serving static files from: ${staticPath}`);

// Serve captured frames
const capturedFramesPath = path.join(__dirname, 'captured_frames');
app.use('/captured_frames', express.static(capturedFramesPath));
console.log(`✅ Serving captured frames from: ${capturedFramesPath}`);

// --- API Routes ---
// Mount routers AFTER core middleware
console.log("🛠️ Attempting to mount API routes...");
try {
  // Set socket.io instance in analysisController before mounting routes
  const analysisController = require('./controllers/analysisController');
  analysisController.setSocketIo(io);
  
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/system', require('./routes/system'));
  app.use('/api/analysis', require('./routes/analysis'));
  console.log("✅ API routes mounted successfully.");
} catch (routeError) {
  console.error("🚨 CRITICAL ERROR mounting routes:", routeError);
  process.exit(1); // Exit if routes fail to mount
}


// --- Basic Root Route ---
app.get('/', (req, res) => {
  res.send('CrimeEye-Pro Backend API is running.');
});

// --- Centralized Error Handling Middleware (Add this LAST) ---
app.use((err, req, res, next) => {
  console.error("🚨 Unhandled Error:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- Socket.io Connection Logic ---
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id}, Reason: ${reason}`);
  });
  socket.on('connect_error', (err) => {
    console.error(`🚨 Socket connection error for ${socket.id}: ${err.message}`);
  });
});

// --- Start Server Function ---
const startServer = () => {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
  server.on('error', (error) => { // Add listener for server errors (e.g., port already in use)
      console.error('🚨 Server Error:', error);
      process.exit(1);
  });
};

// --- Initialize DB then Start Server ---
console.log("⏳ Initializing database...");
db.initializeDatabase()
  .then(() => {
    console.log("✅ Database initialization complete.");
    startServer(); // Start the server only after DB is confirmed OK
  })
  .catch((initError) => {
    // Error is already logged in initializeDatabase, just exit
    console.error("🚨 Server startup aborted due to database initialization failure.");
    process.exit(1);
  });


// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
  console.log("\n🚦 SIGINT received. Shutting down server gracefully...");
  server.close(async () => {
    console.log(" -> ✅ HTTP server closed.");
    try {
      await db.pool.end(); // Use async/await for pool end
      console.log(" -> ✅ Database pool closed.");
    } catch (err) {
      console.error(" -> 🚨 Error closing DB pool:", err);
    } finally {
      process.exit(0);
    }
  });
  // Force close server after timeout if needed
  setTimeout(() => {
     console.error(" -> ⚠️ Could not close connections in time, forcing shutdown.");
     process.exit(1);
  }, 10000); // 10 seconds timeout
});
