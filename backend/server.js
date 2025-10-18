const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: '*' }
});

// Import routes (your existing)
const userRoutes = require('./routes/users');
const incidentRoutes = require('./routes/incidents');
const alertRoutes = require('./routes/alerts');
const activityLogRoutes = require('./routes/activityLog');
const aiRoutes = require('./routes/ai');
const detectionRoutes = require('./routes/detections');
const frameRoutes = require('./routes/frames');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health route
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend is running!', timestamp: new Date() });
});

// --- LLM DEDUCTION ENDPOINT (LM Studio+LLAMA) ---
app.post('/api/deduce', async (req, res) => {
    try {
        const { image, camera_id } = req.body;
        if (!image || !camera_id) {
            return res.status(400).json({ error: "Missing image or camera_id" });
        }

        // Save image to disk
        const imgBuffer = Buffer.from(image, "base64");
        const imgName = `frame_${camera_id}_${Date.now()}.jpg`;
        const imgPath = path.join(__dirname, 'captured_frames', imgName);
        fs.writeFileSync(imgPath, imgBuffer);

        // Build system prompt for LLM
        const prompt = `You are a crime analyst AI. Analyze the following surveillance image from camera ${camera_id}. State the threat level (CRITICAL, HIGH, MEDIUM, LOW), explain your reasoning, and recommend an action if necessary.`;

        // LLM Studio API call
        const resp = await fetch(process.env.LM_STUDIO_API || 'http://localhost:1233/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'meta-llama-3-1-8b-instruct',
                messages: [{ role: "system", content: prompt }],
                stream: false,
                temperature: 0.2
            })
        });
        const data = await resp.json();
        const llmReasoning = data.choices[0].message.content;

        // Extract threat level
        let level = "UNKNOWN";
        if (/CRITICAL/i.test(llmReasoning)) level = "CRITICAL";
        else if (/HIGH/i.test(llmReasoning)) level = "HIGH";
        else if (/MEDIUM/i.test(llmReasoning)) level = "MEDIUM";
        else if (/LOW/i.test(llmReasoning)) level = "LOW";

        res.json({
            camera_id,
            image_path: imgPath,
            threat_level: level,
            reasoning: llmReasoning,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Other REST routes
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/frames', frameRoutes);

// Socket.io
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('new-detection', (data) => {
        io.emit('detection-update', data);
    });

    socket.on('new-incident', (data) => {
        io.emit('incident-update', data);
    });

    socket.on('new-alert', (data) => {
        io.emit('alert-update', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Database: ${process.env.DB_NAME}`);
    console.log(`✅ LM Studio: ${process.env.LM_STUDIO_API || 'http://localhost:1233/v1/chat/completions'}`);
});
