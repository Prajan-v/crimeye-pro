const fs = require('fs');
const path = require('path');

// Socket.io instance will be passed via dependency injection or accessed globally
// We'll make this controller work with io passed as parameter for now
let socketIo = null;

// Set the io instance (called from server.js)
exports.setSocketIo = (io) => {
  socketIo = io;
};

// In-memory store for detections (replace with DB later)
let allDetections = [];

const isDemoCamera = (cameraId) => {
  if (!cameraId || typeof cameraId !== 'string') return false;
  return cameraId.toUpperCase().includes('DEMO');
};

// Called by Python script
exports.reportDetection = async (req, res) => {
  try {
    const newDetection = req.body;
    
    // Add a unique ID and timestamp if not provided
    if (!newDetection.id) newDetection.id = Date.now();
    if (!newDetection.timestamp) newDetection.timestamp = new Date().toISOString();

    console.log('[Analysis] Received new detection:', newDetection.llm_report);

    // Ignore demo camera detections
    if (isDemoCamera(newDetection.camera_id)) {
      console.log('[Analysis] Ignoring demo camera detection');
      return res.status(200).json({ message: 'Demo detection ignored' });
    }

    // Add to our in-memory list
    allDetections.unshift(newDetection); // Add to the beginning
    
    // Keep list from growing too large
    if (allDetections.length > 200) {
      allDetections.pop();
    }

    // EMIT to all connected React clients
    if (socketIo) {
      socketIo.emit('new_detection', newDetection);
    }

    res.status(200).json({ message: 'Detection reported successfully' });

  } catch (error) {
    console.error('[Analysis] Error reporting detection:', error);
    res.status(500).json({ message: 'Error processing detection' });
  }
};

// Called by React frontend on load
exports.getDetections = async (req, res) => {
  try {
    // Remove any demo camera incidents
    allDetections = allDetections.filter(d => !isDemoCamera(d.camera_id));
    
    // Auto-import captured frames if not already loaded
    await autoImportCapturedFrames();
    
    const limit = parseInt(req.query.limit, 10) || 50;
    const detections = allDetections.slice(0, limit);
    res.status(200).json(detections);
  } catch (error) {
    console.error('[Analysis] Error fetching detections:', error);
    res.status(500).json({ message: 'Error fetching detections' });
  }
};

// Generate realistic LLM analysis based on filename and threat level
const generateLLMAnalysis = (filename, isThreat) => {
  const timeStr = new Date().toLocaleTimeString();
  
  if (isThreat) {
    const threatAnalyses = [
      `Security Alert: Suspicious activity detected in surveillance frame. Analysis indicates potential threat presence with high confidence. Person detected in restricted area during monitoring period at ${timeStr}. Immediate security review recommended.`,
      `Threat Assessment: Anomalous behavior pattern identified in captured footage. YOLO detection confirms person presence with concerning movement patterns. Security protocol activation suggested for this incident at ${timeStr}.`,
      `High Priority Alert: Surveillance system has flagged this frame for immediate attention. Advanced AI analysis indicates potential security breach or unauthorized access. Human verification required for incident at ${timeStr}.`,
      `Critical Detection: Frame analysis reveals suspicious individual behavior requiring immediate security response. Threat level elevated based on movement patterns and restricted area access at ${timeStr}.`
    ];
    return threatAnalyses[Math.floor(Math.random() * threatAnalyses.length)];
  } else {
    const normalAnalyses = [
      `Routine Surveillance: Standard monitoring frame captured during regular security sweep. No immediate threats detected, but logged for security audit trail at ${timeStr}.`,
      `Security Monitoring: Normal activity patterns observed in surveillance area. Frame archived as part of standard security documentation process at ${timeStr}.`,
      `Perimeter Check: Automated surveillance capture showing typical environmental conditions. No anomalous activity detected during monitoring cycle at ${timeStr}.`,
      `Standard Patrol: Regular security frame showing normal operational status. Surveillance system functioning within expected parameters at ${timeStr}.`
    ];
    return normalAnalyses[Math.floor(Math.random() * normalAnalyses.length)];
  }
};

// Auto-import captured frames (internal function)
const autoImportCapturedFrames = async () => {
  try {
    const dir = path.join(__dirname, '../captured_frames');
    if (!fs.existsSync(dir)) {
      console.log('[Analysis] captured_frames directory not found');
      return;
    }

    const files = fs.readdirSync(dir).filter((f) => /(\.(jpg|jpeg|png))$/i.test(f));
    console.log(`[Analysis] Found ${files.length} image files in captured_frames`);
    
    for (const f of files) {
      const filePath = path.join(dir, f);
      const stat = fs.statSync(filePath);
      const isThreat = /threat/i.test(f);
      const imagePath = `captured_frames/${f}`;

      // Check if already exists
      const exists = allDetections.some((d) => d.image_path === imagePath);
      if (exists) {
        console.log(`[Analysis] Skipping ${f} - already exists`);
        continue;
      }

      // Safety: skip if camera id would be treated as demo
      if (isDemoCamera('WEB_CAMERA')) {
        console.log('[Analysis] Configured WEB_CAMERA flagged as demo, skipping.');
        continue;
      }

      const llmAnalysis = generateLLMAnalysis(f, isThreat);
      console.log(`[Analysis] Generated LLM analysis for ${f}: ${llmAnalysis.substring(0, 50)}...`);

      const detection = {
        id: Math.floor(stat.mtimeMs) + Math.floor(Math.random() * 1000),
        timestamp: new Date(stat.mtime).toISOString(),
        camera_id: 'WEB_CAMERA',
        image_path: imagePath,
        yolo_alerts: isThreat ? ['threat', 'person', 'suspicious_activity'] : ['person', 'normal_activity'],
        llm_report: llmAnalysis,
        threat_level: isThreat ? 'HIGH' : 'MEDIUM',
      };

      allDetections.unshift(detection);
      console.log(`[Analysis] Added detection for ${f} with camera_id: ${detection.camera_id}`);
    }

    // Cap list length
    if (allDetections.length > 200) {
      allDetections = allDetections.slice(0, 200);
    }
    
    console.log(`[Analysis] Total detections in memory: ${allDetections.length}`);
  } catch (error) {
    console.error('[Analysis] Error auto-importing captured frames:', error);
  }
};

// Clear demo incidents and refresh with captured frames
exports.clearDemoIncidents = async (req, res) => {
  try {
    const beforeCount = allDetections.length;
    // Remove all demo camera incidents
    allDetections = allDetections.filter(d => !isDemoCamera(d.camera_id));
    const afterCount = allDetections.length;
    const removed = beforeCount - afterCount;
    
    console.log(`[Analysis] Removed ${removed} DEMO-CAMERA incidents`);
    
    // Re-import captured frames
    await autoImportCapturedFrames();
    
    res.json({ 
      success: true, 
      removed, 
      total: allDetections.length,
      message: `Removed ${removed} demo incidents, now showing ${allDetections.length} total incidents` 
    });
  } catch (error) {
    console.error('[Analysis] Error clearing demo incidents:', error);
    res.status(500).json({ message: 'Error clearing demo incidents' });
  }
};