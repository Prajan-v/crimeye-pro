const express = require('express');
const router = express.Router();
const axios = require('axios');

const YOLO_SERVICE_URL = 'http://localhost:5002';

router.get('/yolo-health', async (req, res) => {
    try {
        const response = await axios.get(`${YOLO_SERVICE_URL}/health`, { timeout: 3000 });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ status: 'offline' });
    }
});

router.post('/detect-frame', async (req, res) => {
    try {
        const { frame } = req.body;
        
        if (!frame) {
            return res.status(400).json({ error: 'No frame' });
        }

        const yoloResponse = await axios.post(`${YOLO_SERVICE_URL}/detect-frame`, {
            frame: frame
        }, { timeout: 3000 });

        const detections = yoloResponse.data.detections || [];
        
        res.json({
            success: true,
            detections: detections
        });

    } catch (error) {
        res.status(500).json({ error: 'Detection failed' });
    }
});

module.exports = router;
