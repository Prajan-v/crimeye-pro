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
- **DO NOT** just list the objects. The YOLO model already did that.
- **DO** analyze the *context*, *posture*, and *interaction* of people with objects.
- **FOCUS** on suspicious activity, workplace monitoring, and potential crime.
Respond in this exact JSON format, and nothing else:
{
  "threat_level": "NONE | LOW | MEDIUM | HIGH | CRITICAL",
  "report": "A 1-2 sentence executive summary of the situation.",
  "analysis": "Your detailed, step-by-step reasoning for the threat level, describing the suspicious activity and context."
}
`;

const callOllama = async (frameBase64, yoloAlerts) => {
  const yolo_alert_str = yoloAlerts.length > 0 ? yoloAlerts.join(', ') : "No initial alerts.";
  
  const payload = {
    model: "llava-llama-3.1-8b",
    format: "json",
    stream: false,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `YOLO Triage Alerts: [${yolo_alert_str}]. Analyze the attached frame.`,
        images: [frameBase64]
      }
    ]
  };
  
  try {
    const resp = await axios.post(OLLAMA_CHAT_URL, payload, { timeout: 60000 });
    const llm_data = JSON.parse(resp.data.message.content);
    return llm_data;
  } catch (err) {
    console.error("Ollama Error:", err.response ? err.response.data : err.message);
    return {
      threat_level: "UNKNOWN",
      report: "LLM analysis failed or timed out.",
      analysis: err.message
    };
  }
};

exports.analyzeFrame = async (req, res) => {
  const { camera_id, frame } = req.body;
  if (!frame || !camera_id) {
    return res.status(400).json({ message: "Missing camera_id or frame" });
  }

  // 1. Get YOLO detections
  let yolo_data;
  try {
    const yolo_resp = await axios.post(YOLO_DETECT_URL, { frame });
    yolo_data = yolo_resp.data;
  } catch (err) {
    return res.status(503).json({ message: "YOLO service is offline or failed" });
  }

  // 2. Stop if YOLO found nothing interesting
  if (!yolo_data.success || !yolo_data.trigger_llm) {
    return res.status(200).json({ message: "No objects of interest. LLM not triggered." });
  }

  // 3. Call LLM for analysis FIRST
  const frameBase64 = frame.split(',')[1];
  const llm_data = await callOllama(frameBase64, yolo_data.yolo_alerts);
  
  // 4. --- LOGIC CHANGE ---
  // Only save the image and DB record if the threat is suspicious
  let imagePath = null;
  const isSuspicious = llm_data.threat_level === "MEDIUM" || 
                       llm_data.threat_level === "HIGH" || 
                       llm_data.threat_level === "CRITICAL";

  if (isSuspicious) {
    console.log(`SUSPICIOUS ACTIVITY DETECTED: ${llm_data.threat_level}. Saving image...`);
    
    // --- Image Save Logic is MOVED here ---
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const imageFilename = `${camera_id}_${timestamp}.jpg`;
    const relativeImagePath = path.join('static', 'detections', imageFilename);
    const localImagePath = path.join(__dirname, '..', relativeImagePath);
    
    try {
      await fs.writeFile(localImagePath, frameBase64, 'base64');
      imagePath = relativeImagePath; // Set path only on successful save
    } catch (err) {
      console.error("File save error:", err);
      // Continue without image, path will be null
    }

  } else {
    // Threat is NONE or LOW. Don't save image, and don't save to DB.
    console.log(`Low threat: ${llm_data.threat_level}. Frame discarded.`);
    return res.status(200).json({ message: `Low threat: ${llm_data.threat_level}. Frame discarded.` });
  }
  
  // 5. --- LOGIC CHANGE ---
  // This code only runs if (isSuspicious === true)
  try {
    const db_detection = await db.query(
      `INSERT INTO ai_detections (camera_id, image_path, yolo_alerts, llm_report, threat_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        camera_id,
        imagePath, // This will be the path or null if save failed
        JSON.stringify(yolo_data.yolo_alerts),
        llm_data.analysis || llm_data.report,
        llm_data.threat_level
      ]
    );
    
    const newDetection = db_detection.rows[0];
    const io = req.app.get('socketio');
    io.emit('new_detection', newDetection); // Send to all connected clients
    res.status(201).json(newDetection);

  } catch (err) {
    console.error("DB save error:", err);
    res.status(500).json({ message: "Failed to save detection to database." });
  }
};

// This function remains unchanged
exports.getDetections = async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const detections = await db.query(
      'SELECT * FROM ai_detections ORDER BY timestamp DESC LIMIT $1',
      [limit]
    );
    res.json(detections.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};