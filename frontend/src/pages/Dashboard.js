import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Cpu, AlertTriangle, List, RefreshCw } from 'react-feather';
import styles from '../styles/Dashboard.module.css';
import SystemStatus from '../components/SystemStatus';
import apiService from '../services/api.service';
import socketService from '../services/socket.service';

// Consistent threat colors
const threatColors = {
  CRITICAL: 'var(--accent-red)',
  HIGH: 'var(--accent-orange)',
  MEDIUM: 'var(--accent-gold)',
  LOW: 'var(--text-secondary)',
  NONE: 'var(--accent-green)',
  UNKNOWN: '#555',
};

// Animation variants for incident items
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
};

// Component for a single incident item in the list
function IncidentItem({ det }) {
  const isHighThreat = ['CRITICAL', 'HIGH'].includes(det.threat_level);
  return (
    <motion.div
      layout // Enable smooth reordering/list animation
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className={styles.incidentItem}
      style={{ borderLeft: `4px solid ${threatColors[det.threat_level]}`, paddingLeft: '15px' }} // Add severity indicator bar
    >
      <div className={styles.incidentHeader}>
        <strong>{det.camera_id}</strong>
        <span
          className="threat-badge" // Use global class
          style={{
             backgroundColor: threatColors[det.threat_level],
             color: isHighThreat || det.threat_level === 'UNKNOWN' ? '#fff' : '#000'
           }}
        >
          {det.threat_level}
        </span>
      </div>
      <p className={styles.incidentTimestamp}>{new Date(det.timestamp).toLocaleString()}</p>
      <p className={styles.incidentReport}>
        "{det.llm_report?.substring(0, 120) + (det.llm_report?.length > 120 ? '...' : '')}"
      </p>
      <img
        src={`http://localhost:5001/${det.image_path}`} // Use correct backend port
        alt={`Snapshot for ${det.camera_id} at ${new Date(det.timestamp).toLocaleTimeString()}`}
        className={styles.incidentImage}
        onClick={() => window.open(`http://localhost:5001/${det.image_path}`)}
        loading="lazy"
      />
    </motion.div>
  );
}

// Component for the Live Analysis section (Webcam + AI Report)
function LiveAnalysis({ onNewDetection }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [llmReport, setLlmReport] = useState(null); // Stores the latest AI response object
  const [currentStatus, setCurrentStatus] = useState("Initializing Webcam..."); // User-facing status string
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Analysis lock
  const [error, setError] = useState(null); // Webcam or Analysis error message
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true); // Track component mount status

  // Setup webcam on mount
  useEffect(() => {
    isMountedRef.current = true;
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } } // Request reasonable resolution
        });
        if (videoRef.current && isMountedRef.current) {
          videoRef.current.srcObject = stream;
          setCurrentStatus("Webcam active. Standing by...");
        }
      } catch (err) {
        console.error("Webcam Error:", err);
        if (isMountedRef.current) setError("Webcam access denied or not found. Please check permissions.");
        setCurrentStatus("Webcam Error");
      }
    }
    setupWebcam();

    // Cleanup function
    return () => {
      isMountedRef.current = false; // Mark as unmounted
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Stop webcam stream tracks
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject;
         stream.getTracks().forEach(track => track.stop());
         console.log("Webcam stream stopped.");
      }
    };
  }, []); // Run only once on mount

  // Function to perform analysis (memoized with useCallback)
  const analyzeCurrentFrame = useCallback(async () => {
    if (!isMountedRef.current || isAnalyzing || !videoRef.current || videoRef.current.readyState < 3) {
      // Don't run if unmounted, already analyzing, or video not ready
      return;
    }

    setIsAnalyzing(true);
    setCurrentStatus("Analyzing frame...");
    setError(null); // Clear previous errors

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) { setIsAnalyzing(false); return; } // Should not happen

    // Set canvas size to match video display size for accurate capture
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get frame as JPEG data URL (adjust quality if needed)
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.85); // Quality 0.85

    try {
      const res = await apiService.analyzeFrame({ camera_id: 'CAM_01', frame: frameBase64 });

      if (!isMountedRef.current) return; // Check again after await

      if (res.status === 201 && res.data) { // 201 Created = LLM analysis done
        setLlmReport(res.data); // Store the full detection object
        setCurrentStatus("Threat analysis complete.");
        onNewDetection(res.data); // Notify parent (Dashboard)
      } else if (res.status === 200 && res.data?.message) { // 200 OK = YOLO ran, no trigger
        setCurrentStatus(res.data.message); // Display message like "No objects of interest"
        // Optionally clear the previous llmReport state if desired
        // setLlmReport(null);
      } else {
         // Handle unexpected success statuses if necessary
         setCurrentStatus("Received unexpected analysis response.");
      }

    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Analysis API Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown analysis error.";
      setCurrentStatus("Analysis Service Failed.");
      setError(errorMsg);
      setLlmReport(null); // Clear report on error
    } finally {
      // Ensure analysis lock is released even if errors occurred
      if (isMountedRef.current) setIsAnalyzing(false);
    }
  }, [isAnalyzing, onNewDetection]); // Dependencies for useCallback

  // Start the analysis interval using the memoized function
  useEffect(() => {
    // Clear any existing interval before setting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Start polling if webcam is ready (check error state)
    if (!error) {
       intervalRef.current = setInterval(analyzeCurrentFrame, 2000); // Analyze every 2 seconds
    }
    // Cleanup interval on unmount (handled in the first useEffect)
    // or if the error state changes (e.g., webcam error stops polling)
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [analyzeCurrentFrame, error]); // Re-run if error state changes

  // Determine what report data to display (latest triggered report or default)
  const displayReport = llmReport || { threat_level: 'NONE', report: '...', llm_report: '' };
  const displayThreatLevel = llmReport ? llmReport.threat_level : 'NONE'; // Show NONE if no active report

  return (
    <div className={styles.liveGrid}>
      {/* Video Feed */}
      <div className={styles.videoContainer}>
        {error && !videoRef.current?.srcObject && (
            <motion.p initial={{opacity:0}} animate={{opacity:1}} className={styles.webcamError}>
                <AlertTriangle /> {error}
            </motion.p>
        )}
        <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
        <canvas ref={canvasRef} style={{ display: 'none' }} /> {/* Hidden canvas for capture */}
      </div>

      {/* AI Analyst Panel */}
      <div className={styles.analystPanel}>
        <div className={styles.analystHeader}>
          <Cpu size={20} /> AI Analyst Report
        </div>

        {/* Status Indicator */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStatus} // Animate when status text changes
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.reportStatus}
          >
            {isAnalyzing ? <RefreshCw size={14} style={{ marginRight: 5, animation: 'spin 1s linear infinite' }}/> : null}
            {currentStatus}
          </motion.span>
        </AnimatePresence>
        {/* Display specific analysis error if it occurred */}
        {error && currentStatus.includes("Failed") && (
            <p className={styles.webcamError} style={{padding:0, textAlign:'left', fontSize:'0.9rem'}}>
                <AlertTriangle size={16}/> {error}
            </p>
        )}

        {/* Threat Level Badge */}
        <motion.span
          key={displayThreatLevel} // Animate badge change
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={styles.threatBadge}
          style={{
             backgroundColor: threatColors[displayThreatLevel],
             color: ['CRITICAL', 'HIGH', 'UNKNOWN'].includes(displayThreatLevel) ? '#fff' : '#000'
           }}
        >
          {displayThreatLevel}
        </motion.span>

        {/* Report Summary & Analysis */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`rep-${llmReport?.id || 'standby'}`} // Animate when report changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.report}
          >
            {displayReport.report}
          </motion.p>
        </AnimatePresence>
        <div className={styles.analysis}>
          {displayReport.llm_report || (llmReport === null && !error ? "Detailed analysis will appear here when a threat is detected." : "")}
        </div>

      </div>
       {/* Add CSS for spin animation */}
       <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


// Main Dashboard Page Component
function Dashboard() {
  const [detections, setDetections] = useState([]); // Holds latest 5 detections for the side panel
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // 1. Fetch initial recent detections (e.g., last 5)
    apiService.getDetections(5)
      .then(res => { if (isMountedRef.current) setDetections(res.data); })
      .catch(err => console.error("Failed to fetch initial detections:", err));

    // 2. Connect to WebSocket and set up listener
    socketService.connect();
    socketService.onNewDetection((newDetection) => {
      if (isMountedRef.current) {
        // Add new detection to the start, keep the list size at 5
        setDetections(prev => [newDetection, ...prev.slice(0, 4)]);
      }
    });

    // 3. Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      socketService.off('new_detection');
      // Decide if socket should disconnect when leaving dashboard
      // socketService.disconnect();
    }
  }, []); // Run only on mount

  // Memoize the callback for LiveAnalysis
  const handleNewDetection = useCallback((newDetection) => {
      // This is now primarily handled by the WebSocket listener within this component,
      // but we keep the prop for potential direct updates or fallbacks.
      // The socket listener above already updates the `detections` state.
  }, []);

  return (
    <div>
      {/* Dashboard Header */}
      <div className={styles.header}>
        <h1>Live Dashboard</h1>
        <SystemStatus />
      </div>

      {/* Main Content Grid */}
      <div className={styles.grid}>
        {/* Live Feed and Analysis Card */}
        <motion.div
            layout // Animate size changes if needed
            className={styles.liveCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.liveCardHeader}><Video /> Live Feed (CAM_01)</div>
          <LiveAnalysis onNewDetection={handleNewDetection} />
        </motion.div>

        {/* Recent Incidents Card */}
        <motion.div
            layout
            className={styles.incidentCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.liveCardHeader}><List /> Recent Incidents (Live)</div>
          <div className={styles.incidentList}>
             <AnimatePresence initial={false}> {/* Don't animate initial load items */}
                {detections.length === 0 && (
                    <motion.p layout key="no-incidents" style={{padding: 20, color: 'var(--text-secondary)'}}>
                        No recent incidents recorded.
                    </motion.p>
                )}
                {detections.map(det => <IncidentItem key={det.id} det={det} />)}
             </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
