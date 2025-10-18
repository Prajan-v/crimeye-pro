const axios = require('axios');
const db = require('../utils/db');
require('dotenv').config();

const YOLO_HEALTH_URL = `${process.env.YOLO_API_URL}/yolo-health`;
const OLLAMA_HEALTH_URL = process.env.OLLAMA_API_URL;

const checkService = async (url) => {
  try {
    await axios.get(url, { timeout: 2000 });
    return 'online';
  } catch (error) {
    return 'offline';
  }
};

exports.getSystemHealth = async (req, res) => {
  let db_status = 'offline';
  try {
    const client = await db.query('SELECT 1');
    if (client) db_status = 'online';
  } catch (e) { /* stays offline */ }

  const [yolo_service, ollama_service] = await Promise.all([
    checkService(YOLO_HEALTH_URL),
    checkService(OLLAMA_HEALTH_URL)
  ]);

  res.json({
    database: db_status,
    yolo_service,
    ollama_service,
  });
};
