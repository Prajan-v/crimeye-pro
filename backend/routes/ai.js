const express = require('express');
const router = express.Router();
const axios = require('axios');

const LM_STUDIO_URL = 'http://localhost:1233';

// AI Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(`${LM_STUDIO_URL}/v1/chat/completions`, {
            model: 'meta-llama-3.1-8b-instruct',
            messages: [
                {
                    role: 'system',
                    content: 'You are a security AI assistant. Provide concise, professional security advice.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = response.data.choices[0].message.content;

        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('AI Chat error:', error.message);
        res.status(500).json({
            error: 'AI service unavailable',
            details: error.message
        });
    }
});

// AI Analysis of detections (for Phase 2)
router.post('/analyze-detection', async (req, res) => {
    try {
        const { detections, context } = req.body;

        const prompt = `You are a security AI analyzing surveillance footage.

Detected objects: ${JSON.stringify(detections)}
Context: ${context || 'General surveillance'}
Current time: ${new Date().toLocaleString()}

Analyze if this is suspicious activity. Respond in JSON format:
{
  "isSuspicious": true/false,
  "threatLevel": "low/medium/high/critical",
  "reasoning": "explain why",
  "recommendedAction": "what to do",
  "summary": "brief description"
}`;

        const response = await axios.post(`${LM_STUDIO_URL}/v1/chat/completions`, {
            model: 'meta-llama-3.1-8b-instruct',
            messages: [
                {
                    role: 'system',
                    content: 'You are a security threat analysis AI. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 300
        });

        const aiResponse = response.data.choices[0].message.content;
        
        // Try to parse JSON response
        let analysis;
        try {
            analysis = JSON.parse(aiResponse);
        } catch (e) {
            // If AI doesn't return valid JSON, create default response
            analysis = {
                isSuspicious: detections.some(d => ['knife', 'scissors'].includes(d.class)),
                threatLevel: 'medium',
                reasoning: aiResponse,
                recommendedAction: 'Monitor situation',
                summary: 'Detection analysis completed'
            };
        }

        res.json({
            success: true,
            analysis: analysis
        });

    } catch (error) {
        console.error('AI Analysis error:', error.message);
        res.status(500).json({
            error: 'AI analysis failed',
            details: error.message
        });
    }
});

module.exports = router;