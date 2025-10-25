const { io } = require('../../server'); // Import io from server.js

// In-memory store for detections (replace with DB later)
let allDetections = [];

// Called by Python script
exports.reportDetection = async (req, res) => {
  try {
    const newDetection = req.body;
    
    // Add a unique ID and timestamp if not provided
    if (!newDetection.id) newDetection.id = Date.now();
    if (!newDetection.timestamp) newDetection.timestamp = new Date().toISOString();

    console.log('[Analysis] Received new detection:', newDetection.llm_report);

    // Add to our in-memory list
    allDetections.unshift(newDetection); // Add to the beginning
    
    // Keep list from growing too large
    if (allDetections.length > 200) {
      allDetections.pop();
    }

    // EMIT to all connected React clients
    io.emit('new_detection', newDetection);

    res.status(200).json({ message: 'Detection reported successfully' });

  } catch (error) {
    console.error('[Analysis] Error reporting detection:', error);
    res.status(500).json({ message: 'Error processing detection' });
  }
};

// Called by React frontend on load
exports.getDetections = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const detections = allDetections.slice(0, limit);
    res.status(200).json(detections);
  } catch (error) {
    console.error('[Analysis] Error fetching detections:', error);
    res.status(500).json({ message: 'Error fetching detections' });
  }
};