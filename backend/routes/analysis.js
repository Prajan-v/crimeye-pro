const express = require('express');
const router = express.Router();
const { analyzeFrame, getDetections } = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');

// Note: express.json({limit: '10mb'}) in server.js handles the large base64 payload
router.post('/frame', authMiddleware, analyzeFrame);
router.get('/detections', authMiddleware, getDetections);

module.exports = router;
