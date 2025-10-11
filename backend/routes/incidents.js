const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT i.*, u.username FROM incidents i LEFT JOIN users u ON i.reported_by = u.id ORDER BY i.created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, severity, location, reported_by } = req.body;
        const result = await pool.query(
            'INSERT INTO incidents (title, description, severity, location, reported_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, severity || 'low', location, reported_by || 1]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { title, description, severity, status, location } = req.body;
        const result = await pool.query(
            'UPDATE incidents SET title=$1, description=$2, severity=$3, status=$4, location=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
            [title, description, severity, status, location, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM incidents WHERE id = $1', [req.params.id]);
        res.json({ message: 'Incident deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
