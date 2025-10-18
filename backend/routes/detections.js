const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

// Analyze detection with LLM
router.post('/analyze', async (req, res) => {
    try {
        const { camera_id, detections, scene_context, frame_base64 } = req.body;
        
        // Create LLM prompt
        const prompt = `You are a security AI analyzing surveillance footage. Analyze this detection and provide threat assessment.

Detection Data:
Camera: ${camera_id}
Time: ${scene_context.time_of_day || 'unknown'}
Detected Objects: ${detections.map(d => d.class).join(', ')}
Confidence Scores: ${detections.map(d => d.confidence).join(', ')}
Scene Context: ${JSON.stringify(scene_context)}

Provide analysis in JSON format:
{
  "threat_level": "LOW/MEDIUM/HIGH/CRITICAL",
  "confidence": 0.0-1.0,
  "description": "Brief description of what's happening",
  "reasoning": "Why this is/isn't a threat",
  "recommended_actions": ["action1", "action2"],
  "alert_security": true/false,
  "incident_category": "category_name"
}

Be concise and professional.`;

        // Call LM Studio
        const llmResponse = await axios.post(`${process.env.LM_STUDIO_API}/chat/completions`, {
            model: 'local-model',
            messages: [
                { role: 'system', content: 'You are an expert security analyst. Respond only with valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const analysisText = llmResponse.data.choices[0].message.content;
        const analysis = JSON.parse(analysisText);

        // Save detection to database
        const detectionResult = await pool.query(
            `INSERT INTO llm_detections 
            (camera_id, yolo_raw_data, llm_analysis, threat_level, confidence, description, reasoning, recommended_actions) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id`,
            [
                camera_id,
                JSON.stringify(detections),
                JSON.stringify(analysis),
                analysis.threat_level,
                analysis.confidence,
                analysis.description,
                analysis.reasoning,
                analysis.recommended_actions
            ]
        );

        const detectionId = detectionResult.rows[0].id;

        // If high threat, create incident automatically
        if (analysis.alert_security && ['HIGH', 'CRITICAL'].includes(analysis.threat_level)) {
            const incidentResult = await pool.query(
                `INSERT INTO incidents 
                (title, description, severity, status, location, reported_by) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING id`,
                [
                    `${analysis.incident_category || 'Security Alert'} - ${camera_id}`,
                    analysis.description,
                    analysis.threat_level.toLowerCase(),
                    'open',
                    camera_id,
                    1
                ]
            );

            const incidentId = incidentResult.rows[0].id;

            // Update detection with incident_id
            await pool.query(
                'UPDATE llm_detections SET incident_created = true, incident_id = $1 WHERE id = $2',
                [incidentId, detectionId]
            );

            // Create alert
            await pool.query(
                `INSERT INTO alerts (incident_id, alert_type, message, confidence) 
                VALUES ($1, $2, $3, $4)`,
                [incidentId, analysis.incident_category || 'threat_detected', analysis.description, analysis.confidence]
            );

            // Save frame if provided
            if (frame_base64) {
                const frameBuffer = Buffer.from(frame_base64, 'base64');
                await pool.query(
                    `INSERT INTO captured_frames 
                    (llm_detection_id, incident_id, frame_data, camera_id, file_size) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [detectionId, incidentId, frameBuffer, camera_id, frameBuffer.length]
                );
            }

            return res.json({ 
                success: true, 
                analysis, 
                incident_created: true,
                incident_id: incidentId,
                detection_id: detectionId
            });
        }

        res.json({ 
            success: true, 
            analysis, 
            incident_created: false,
            detection_id: detectionId
        });

    } catch (error) {
        console.error('Detection analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all detections
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM llm_detections ORDER BY detection_timestamp DESC LIMIT 50'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get detection by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM llm_detections WHERE id = $1',
            [req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
