const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || process.env.DB_DATABASE, // Use DB_NAME from your old .env
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_detections (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      camera_id VARCHAR(100) NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      yolo_alerts JSON,
      llm_report TEXT,
      threat_level VARCHAR(50)
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(queryText);
    client.release();
    console.log('Database tables checked/created successfully.');
  } catch (err) {
    console.error('CRITICAL: Error connecting to DB or creating tables:', err);
    process.exit(1); // Exit if we can't connect
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  createTables,
};
