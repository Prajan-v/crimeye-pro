const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');
const { saveFrame } = require('../utils/frameStorage');

// Forward detection request to YOLO service
router.post('/detect-frame', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { frame, camera_id } = req.body;
        
        if (!frame) {
            return res.status(400).json({ error: 'No frame provided' });
        }
        
        // Send to YOLO service
        const yoloResponse = await axios.post('http://localhost:5002/detect-frame', {
            frame: frame
        }, {
            timeout: 30000 // 30 second timeout
        });
        
        const { detections, alerts, stats } = yoloResponse.data;
        
        // If alerts detected, save to database and capture frame
        if (alerts && alerts.length > 0) {
            for (const alert of alerts) {
                // Create incident
                const incident = await pool.query(
                    'INSERT INTO incidents (title, description, severity, location, reported_by, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [
                        `${alert.type}: ${alert.message}`,
                        `Detected via live camera feed. Confidence: ${(alert.confidence * 100).toFixed(0)}%`,
                        alert.severity === 'critical' ? 'high' : alert.severity,
                        camera_id || 'Camera 1',
                        1, // Admin user ID
                        'open'
                    ]
                );
                
                // 🆕 SAVE CAPTURED FRAME
                const savedFrame = saveFrame(frame, incident.rows[0].id);
                
                // Create alert in database
                await pool.query(
                    'INSERT INTO alerts (incident_id, alert_type, message, confidence) VALUES ($1, $2, $3, $4)',
                    [
                        incident.rows[0].id,
                        alert.alert_type || 'detection',
                        alert.message,
                        alert.confidence
                    ]
                );
                
                // Log activity
                await pool.query(
                    'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
                    [
                        1,
                        'detection_alert',
                        `Auto-detection: ${alert.message} | Frame: ${savedFrame ? savedFrame.filename : 'none'}`
                    ]
                );
                
                // Emit socket event with frame info
                if (req.app.get('io')) {
                    req.app.get('io').emit('new-alert', {
                        alert: alert,
                        incident: incident.rows[0],
                        frame_filename: savedFrame ? savedFrame.filename : null,
                        timestamp: new Date()
                    });
                }
                
                console.log(`🚨 Alert created: ${alert.message} | Frame: ${savedFrame ? savedFrame.filename : 'none'}`);
            }
        }
        
        const processingTime = Date.now() - startTime;
        
        res.json({
            success: true,
            detections: detections,
            alerts: alerts,
            stats: stats,
            performance: {
                processing_time_ms: processingTime,
                fps: Math.round(1000 / processingTime * 10) / 10
            }
        });
        
    } catch (error) {
        console.error('Detection error:', error.message);
        res.status(500).json({ 
            error: 'Detection service unavailable',
            message: error.message 
        });
    }
});

// Get YOLO service health
router.get('/yolo-health', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5002/health', { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ status: 'offline', error: error.message });
    }
});

module.exports = router;