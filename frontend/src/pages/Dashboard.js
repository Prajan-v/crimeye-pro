import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Camera, Clock, AlertTriangle, Loader, RefreshCcw } from 'react-feather';
import authService from '../services/auth.service';
import apiService from '../services/api.service';

const Dashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [processingFrame, setProcessingFrame] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraID = 'Workplace-Cam-A';
    const captureRate = 5000; // Capture every 5 seconds (2fps * 5) for 2fps goal

    // --- WebRTC Setup (Webcam Feed) ---
    useEffect(() => {
        const enableStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        enableStream();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // --- Core Logic: Capture Frame, Send to Backend ---
    useEffect(() => {
        const interval = setInterval(captureAndSendFrame, captureRate);
        
        const currentVideoRef = videoRef.current; // Capture ref for cleanup
        
        async function captureAndSendFrame() {
            if (processingFrame || !currentVideoRef || !canvasRef.current) return;
            
            setProcessingFrame(true);

            // 1. Draw frame to canvas
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = currentVideoRef.videoWidth;
            canvasRef.current.height = currentVideoRef.videoHeight;
            context.drawImage(currentVideoRef, 0, 0, currentVideoRef.videoWidth, currentVideoRef.videoHeight);
            
            // 2. Convert to Base64 Image
            const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8); // JPEG format

            // 3. Send to Node.js Backend API
            try {
                const response = await fetch('http://localhost:5001/api/analysis/frame', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${authService.getToken()}\`
                    },
                    body: JSON.stringify({ camera_id: cameraID, frame: frameBase64 })
                });

                const data = await response.json();
                
                // Success is defined by an LLM report being generated and logged via Socket.IO,
                // but we check for any general success response from the YOLO triage.
                if (data.message === "No objects of interest. LLM not triggered.") {
                     console.log("YOLO: No threat, skipping LLM analysis.");
                } else if (data.threat_level) {
                     console.log(\`YOLO/LLM: New Alert: \${data.threat_level}\`);
                }
                
            } catch (error) {
                console.error('Frame processing failed:', error);
            } finally {
                setProcessingFrame(false);
            }
        }

        return () => clearInterval(interval);
    }, [processingFrame, captureRate]); // Dependencies updated

    // --- Socket.IO Listener for Real-time Alerts ---
    useEffect(() => {
        const onNewDetection = (newDetection) => {
            // Add new alert to the start of the array
            setAlerts(prev => [{ ...newDetection, isNew: true }, ...prev.filter(a => a.id !== newDetection.id)]);
        };

        authService.connectSocket(onNewDetection);

        return () => {
            authService.disconnectSocket();
        };
    }, []);

    const getThreatColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'var(--threat-critical)';
            case 'HIGH': return 'var(--threat-high)';
            case 'MEDIUM': return 'var(--threat-medium)';
            case 'LOW': return 'var(--threat-low)';
            default: return 'var(--threat-none)';
        }
    };

    const alertItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    };

    return (
        <div>
            <h1><Activity size={30} style={{ marginRight: 10 }} /> Live Threat Monitoring</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* --- Live Camera Feed --- */}
                <div className="card" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, color: 'var(--accent-gold)' }}><Camera size={20} style={{ marginRight: 8 }} /> {cameraID}</h2>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>LIVE</span>
                    </div>
                    
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    
                    {/* Frame capture indicator */}
                    <AnimatePresence>
                        {processingFrame && (
                            <motion.div 
                                style={{ position: 'absolute', bottom: 15, right: 15, background: 'var(--bg-dark)', color: 'var(--accent-gold)', padding: '5px 10px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <RefreshCcw size={14} className="spin" /> Processing Frame...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- Real-time Alerts --- */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ margin: 0, color: 'var(--threat-critical)', borderBottom: '1px solid var(--bg-surface)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <Zap size={20} style={{ marginRight: 8 }} /> Real-time Alerts ({alerts.length})
                    </h2>
                    
                    <motion.div layout style={{ overflowY: 'auto', flexGrow: 1 }}>
                        <AnimatePresence>
                            {alerts.slice(0, 10).map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    className="alert-item"
                                    variants={alertItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                    style={{
                                        borderLeft: \`4px solid \${getThreatColor(alert.threat_level)}\`,
                                        backgroundColor: alert.isNew ? \`\${getThreatColor(alert.threat_level)}20\` : 'var(--bg-light)',
                                        padding: '10px',
                                        marginBottom: '10px',
                                        borderRadius: '4px',
                                        boxShadow: alert.isNew ? \`0 0 10px \${getThreatColor(alert.threat_level)}60\` : 'none',
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', color: getThreatColor(alert.threat_level) }}>
                                        <AlertTriangle size={14} style={{ marginRight: 5 }} /> 
                                        {alert.threat_level}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '5px' }}>
                                        {alert.llm_report.substring(0, 70)}...
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                        <Clock size={12} style={{ marginRight: 5 }} /> {new Date(alert.timestamp).toLocaleTimeString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                    
                    {alerts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                            <Loader size={24} className="spin" /> Waiting for suspicious activity...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
