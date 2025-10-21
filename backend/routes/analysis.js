const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');

// Note: express.json({limit: '10mb'}) in server.js handles the large base64 payload

// Route for sending a live frame for detection/deduction
router.post('/frame', authMiddleware, analysisController.analyzeFrame);

// Route for fetching historical detections (Incident Log)
router.get('/detections', authMiddleware, analysisController.getDetections);

// NEW ROUTE: Fetch data for stats cards and charts (Dashboard)
router.get('/stats', authMiddleware, analysisController.getAnalyticsStats);

module.exports = router;