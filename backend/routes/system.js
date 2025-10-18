const express = require('express');
const router = express.Router();
const { getSystemHealth } = require('../controllers/systemController');
const authMiddleware = require('../middleware/auth');

router.get('/health', authMiddleware, getSystemHealth);

module.exports = router;
