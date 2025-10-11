const express = require('express');
const router = express.Router();
const axios = require('axios');

const LM_STUDIO_URL = process.env.LM_STUDIO_API || 'http://localhost:1233/v1/chat/completions';

// AI chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await axios.post(LM_STUDIO_URL, {
            model: 'meta-llama-3.1-8b-instruct',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a professional security assistant for CrimeEye-Pro, an AI-powered security monitoring system. Provide clear, actionable, and professional security guidance. Keep responses concise but informative.' 
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        }, {
            timeout: 30000
        });

        const aiResponse = response.data.choices[0].message.content;

        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('AI chat error:', error.message);
        res.status(500).json({
            error: 'AI service unavailable',
            message: error.message
        });
    }
});

// Generate incident report
router.post('/generate-report', async (req, res) => {
    try {
        const { incident } = req.body;

        if (!incident) {
            return res.status(400).json({ error: 'Incident data is required' });
        }

        const prompt = `Generate a professional security incident report for the following:

Title: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Location: ${incident.location}
Time: ${incident.created_at || new Date().toISOString()}

Include: Executive Summary, Incident Details, Analysis, Recommended Actions, and Follow-up Requirements.`;

        const response = await axios.post(LM_STUDIO_URL, {
            model: 'meta-llama-3.1-8b-instruct',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a security report writer. Generate professional, detailed incident reports in a formal tone.' 
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            timeout: 30000
        });

        const report = response.data.choices[0].message.content;

        res.json({
            success: true,
            report: report
        });

    } catch (error) {
        console.error('Report generation error:', error.message);
        res.status(500).json({
            error: 'AI service unavailable',
            message: error.message
        });
    }
});

module.exports = router;