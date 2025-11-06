const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// This route will be triggered by the Python service
router.post('/report_detection', analysisController.reportDetection);

// Clear demo incidents and refresh with captured frames
router.post('/clear_demo_incidents', analysisController.clearDemoIncidents);

// This route will be fetched by the React frontend
router.get('/detections', analysisController.getDetections);

module.exports = router;