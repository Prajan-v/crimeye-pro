const { Pool } = require('pg');
require('dotenv').config();

// Validate essential DB environment variables
const requiredEnv = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
let missingEnv = false;
requiredEnv.forEach(v => {
  if (!process.env[v]) {
    console.error(`🚨 FATAL ERROR: Missing required environment variable: ${v} in .env file.`);
    missingEnv = true;
  }
});
if (missingEnv) process.exit(1);

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10), // Ensure port is an integer
  connectionTimeoutMillis: 5000, // 5 seconds to connect
  idleTimeoutMillis: 30000,    // Close idle clients after 30 seconds
};

console.log(`⏳ Initializing PostgreSQL pool for ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}...`);
const pool = new Pool(dbConfig);

pool.on('error', (err, client) => {
  console.error('🚨 PostgreSQL Pool Error:', err);
});

// Function to test connection and create tables
const initializeDatabase = async () => {
  let client;
  try {
    console.log(' -> Attempting database connection test...');
    client = await pool.connect(); // Try to connect
    console.log(` -> ✅ Database connected successfully.`);

    // --- Table Creation ---
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE, -- Keep email as optional
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_detections (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        camera_id VARCHAR(100) NOT NULL,
        image_path VARCHAR(255), -- Path relative to static folder (e.g., detections/...)
        yolo_alerts JSON,
        llm_report TEXT,
        threat_level VARCHAR(50),
        CONSTRAINT uq_detection UNIQUE (camera_id, timestamp) -- Prevent exact duplicates
      );
      -- Optional Indexes
      CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON ai_detections (timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_detections_threat_level ON ai_detections (threat_level);
    `;
    await client.query(createTableQuery);
    console.log(' -> ✅ Database tables checked/created successfully.');

  } catch (err) {
    console.error('🚨 CRITICAL: Database initialization failed:', err.message);
    if (err.code === 'ECONNREFUSED') console.error(" -> ⚠️ Connection refused. Is PostgreSQL running?");
    else if (err.code === '3D000') console.error(` -> ⚠️ Database "${dbConfig.database}" does not exist.`);
    else if (err.code === '28P01') console.error(" -> ⚠️ Authentication failed. Check DB credentials in .env.");
    throw err; // Re-throw error to be caught by server.js
  } finally {
    if (client) {
      client.release(); // IMPORTANT: Always release the client!
      console.log(" -> ✅ Initial DB client released.");
    }
  }
};

module.exports = {
  // Function to execute queries using the pool
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      // console.log('DB Query executed:', { text: text.substring(0, 50)+'...', duration: `${duration}ms`, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('🚨 DB Query Error:', { text: text.substring(0, 100)+'...', params, error: err.message });
      throw err; // Re-throw to be handled by controller
    }
  },
  initializeDatabase, // Export the initialization function
  pool, // Export pool for graceful shutdown
};
