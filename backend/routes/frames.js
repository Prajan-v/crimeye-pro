const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all frames
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, llm_detection_id, incident_id, file_format, file_size, 
             camera_id, captured_at 
             FROM captured_frames 
             ORDER BY captured_at DESC 
             LIMIT 100`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get frame image by ID
router.get('/:id/image', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT frame_data, file_format FROM captured_frames WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Frame not found' });
        }

        const frame = result.rows[0];
        const format = frame.file_format || 'jpg';
        
        res.set('Content-Type', `image/${format}`);
        res.send(frame.frame_data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get frames for specific incident
router.get('/incident/:incident_id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, llm_detection_id, file_format, file_size, 
             camera_id, captured_at 
             FROM captured_frames 
             WHERE incident_id = $1 
             ORDER BY captured_at DESC`,
            [req.params.incident_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete frame
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM captured_frames WHERE id = $1', [req.params.id]);
        res.json({ message: 'Frame deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
