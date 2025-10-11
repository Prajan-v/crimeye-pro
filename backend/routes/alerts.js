const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { incident_id, alert_type, message, confidence } = req.body;
        const result = await pool.query(
            'INSERT INTO alerts (incident_id, alert_type, message, confidence) VALUES ($1, $2, $3, $4) RETURNING *',
            [incident_id, alert_type, message, confidence || 0.5]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
