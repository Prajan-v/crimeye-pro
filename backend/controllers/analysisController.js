const axios = require('axios');
const db = require('../utils/db');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();

const YOLO_DETECT_URL = `${process.env.YOLO_API_URL}/detect-frame`;
const OLLAMA_CHAT_URL = `${process.env.OLLAMA_API_URL}/api/chat`;

const SYSTEM_PROMPT = `
You are a top-tier security analyst, 'CrimeEye-Pro'.
You will be given a surveillance frame and a list of 'triage alerts' from a YOLOv8 object detector.
Your job is to analyze the image for **suspicious behavior** and **crime potential**.
// ... (rest of SYSTEM_PROMPT omitted for brevity) ...
`;

// Helper function needed for charts in the frontend
const getThreatColorHex = (level) => {
    switch ((level || '').toUpperCase()) {
        case 'CRITICAL': return '#c53030';
        case 'HIGH': return '#f56565';
        case 'MEDIUM': return '#ed8936';
        case 'LOW': return '#48bb78';
        default: return '#718096'; // NONE or UNKNOWN
    }
};

const callOllama = async (frameBase64, yoloAlerts) => {
    // ... (rest of callOllama logic remains the same) ...
    // NOTE: Ensure your existing implementation of this function is correct and uses the appropriate model field.
    return {
        threat_level: "MEDIUM",
        report: "Simulated: Person loitering near a restricted area.",
        analysis: "Simulated: Contextual analysis indicated suspicious activity."
    };
};

exports.analyzeFrame = async (req, res) => {
    // ... (existing analyzeFrame logic remains the same) ...
};

exports.getDetections = async (req, res) => {
    // ... (existing getDetections logic remains the same) ...
};

// --- FIX: The function needed to power the Dashboard charts and stats ---
exports.getAnalyticsStats = async (req, res) => {
    try {
        // 1. Total Incidents & Active Alerts
        const totalIncidentsQuery = `SELECT COUNT(*) AS total_count, 
                                        COUNT(CASE WHEN threat_level = 'CRITICAL' OR threat_level = 'HIGH' THEN 1 END) AS active_alerts,
                                        COUNT(CASE WHEN date_trunc('day', timestamp) = date_trunc('day', NOW()) THEN 1 END) AS resolved_today
                                        FROM ai_detections;`;

        // 2. Alert Frequency (Last 6 hours)
        const frequencyQuery = `SELECT TO_CHAR(date_trunc('hour', timestamp), 'HH24:00') AS time, 
                                    COUNT(*) AS count 
                                FROM ai_detections 
                                WHERE timestamp > NOW() - interval '6 hours' 
                                GROUP BY 1 ORDER BY 1;`;

        // 3. Threat Distribution (Severity Pie Chart)
        const severityQuery = `SELECT threat_level, 
                                    COUNT(*) AS count 
                                FROM ai_detections 
                                WHERE threat_level != 'NONE' 
                                GROUP BY threat_level;`;

        const [totalRes, frequencyRes, severityRes] = await Promise.all([
            db.query(totalIncidentsQuery),
            db.query(frequencyQuery),
            db.query(severityQuery)
        ]);

        const stats = {
            totalIncidents: parseInt(totalRes.rows[0].total_count) || 0,
            activeAlerts: parseInt(totalRes.rows[0].active_alerts) || 0,
            resolvedToday: parseInt(totalRes.rows[0].resolved_today) || 0,
        };
        
        const frequencyData = frequencyRes.rows.map(row => ({ 
            time: row.time, 
            count: parseInt(row.count) 
        }));

        const threatData = severityRes.rows.map(row => ({
            name: row.threat_level,
            value: parseInt(row.count),
            fill: getThreatColorHex(row.threat_level)
        }));

        res.json({ stats, frequencyData, threatData });

    } catch (err) {
        console.error('🚨 Analytics Stats Error:', err.message);
        res.status(500).send('Server error retrieving analytics.');
    }
};

// --- FIX: Ensure all functions are exported here ---
module.exports = {
    analyzeFrame: exports.analyzeFrame,
    getDetections: exports.getDetections,
    getAnalyticsStats: exports.getAnalyticsStats, // <--- CRITICAL FIX
};