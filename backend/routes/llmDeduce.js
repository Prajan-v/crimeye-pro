const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function callLlamaDeduction({ camera_id }) {
  const prompt = `You are a crime analyst AI. Analyze the following surveillance image from camera ${camera_id}. State the threat level (CRITICAL, HIGH, MEDIUM, LOW), explain your reasoning, and recommend an action if necessary.`;
  const resp = await fetch('http://localhost:1233/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama-3-1-8b-instruct',
      messages: [
        { role: "system", content: prompt }
      ],
      stream: false,
      temperature: 0.2
    })
  });
  const data = await resp.json();
  return data.choices[0].message.content;
}

router.post('/deduce', async (req, res) => {
  try {
    const { image, camera_id } = req.body;
    if (!image || !camera_id) {
      return res.status(400).json({ error: "Missing image or camera_id" });
    }
    const imgBuffer = Buffer.from(image, "base64");
    const imgName = `frame_${camera_id}_${Date.now()}.jpg`;
    const imgPath = path.join(__dirname, '..', 'captured_frames', imgName);
    fs.writeFileSync(imgPath, imgBuffer);

    const llmReasoning = await callLlamaDeduction({ camera_id });

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

module.exports = router;
