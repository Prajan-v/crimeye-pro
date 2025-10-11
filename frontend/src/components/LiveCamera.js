import React, { useRef, useEffect, useState } from 'react';
import API from '../api';
import { Camera, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function LiveCamera() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [detections, setDetections] = useState([]);
    const [lastAlert, setLastAlert] = useState(null);
    const [stats, setStats] = useState({ person_count: 0, total_objects: 0, weapon_detected: false });
    const [yoloStatus, setYoloStatus] = useState('checking');
    const [fps, setFps] = useState(0);
    const [processingTime, setProcessingTime] = useState(0);

    useEffect(() => {
        checkYoloService();
        const interval = setInterval(checkYoloService, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    const checkYoloService = async () => {
        try {
            const response = await API.get('/detection/yolo-health');
            setYoloStatus('online');
            console.log('✅ YOLO service online:', response.data);
        } catch (error) {
            setYoloStatus('offline');
            console.error('❌ YOLO service offline');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                startDetection();
            }
        } catch (error) {
            console.error('Camera access error:', error);
            alert('Could not access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setIsStreaming(false);
            setDetections([]);
            setStats({ person_count: 0, total_objects: 0, weapon_detected: false });
            setLastAlert(null);
        }
    };

    const captureFrame = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8);
        }
        return null;
    };

    const startDetection = () => {
        let frameCount = 0;
        let lastTime = Date.now();

        const detectLoop = setInterval(async () => {
            if (!isStreaming) {
                clearInterval(detectLoop);
                return;
            }

            const frame = captureFrame();
            if (!frame) return;

            const detectionStart = Date.now();

            try {
                const response = await API.post('/detection/detect-frame', {
                    frame: frame,
                    camera_id: 'Webcam 1'
                });

                if (response.data.success) {
                    setDetections(response.data.detections || []);
                    setStats(response.data.stats || { person_count: 0, total_objects: 0, weapon_detected: false });

                    // Update processing time
                    const detectionTime = Date.now() - detectionStart;
                    setProcessingTime(detectionTime);

                    // Show latest alert
                    if (response.data.alerts && response.data.alerts.length > 0) {
                        setLastAlert(response.data.alerts[0]);
                        
                        // Auto-clear alert after 5 seconds
                        setTimeout(() => setLastAlert(null), 5000);
                    }

                    // Calculate FPS
                    frameCount++;
                    const now = Date.now();
                    if (now - lastTime >= 1000) {
                        setFps(frameCount);
                        frameCount = 0;
                        lastTime = now;
                    }
                }
            } catch (error) {
                console.error('Detection error:', error);
                if (error.response?.status === 500) {
                    setYoloStatus('offline');
                }
            }
        }, 100); // 100ms = 10 FPS ⚡
    };

    return (
        <div style={{ padding: '20px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #d4af37', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Camera size={28} /> Live Camera Feed
                </h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {yoloStatus === 'online' ? (
                            <CheckCircle size={20} color="#4caf50" />
                        ) : yoloStatus === 'offline' ? (
                            <XCircle size={20} color="#d32f2f" />
                        ) : (
                            <AlertCircle size={20} color="#ffb400" />
                        )}
                        <span style={{ color: yoloStatus === 'online' ? '#4caf50' : '#d32f2f', fontSize: '14px', fontWeight: 'bold' }}>
                            YOLO: {yoloStatus.toUpperCase()}
                        </span>
                    </div>
                    {isStreaming ? (
                        <button onClick={stopCamera} style={{ background: '#d32f2f', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            ⏹ Stop Camera
                        </button>
                    ) : (
                        <button onClick={startCamera} style={{ background: '#4caf50', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            ▶ Start Camera
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Video Feed */}
                <div style={{ position: 'relative' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', borderRadius: '8px', background: '#000', border: '2px solid #d4af37' }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    
                    {isStreaming && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '8px 12px', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ color: '#4caf50', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff0000', animation: 'blink 1s infinite' }}></span>
                                LIVE | {fps} FPS
                            </div>
                            <div style={{ color: '#ffb400', fontSize: '12px' }}>
                                Latency: {processingTime}ms
                            </div>
                        </div>
                    )}

                    {lastAlert && (
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '10px', 
                            left: '10px', 
                            right: '10px',
                            background: lastAlert.severity === 'critical' ? 'rgba(211,47,47,0.95)' : lastAlert.severity === 'high' ? 'rgba(255,152,0,0.95)' : 'rgba(255,193,7,0.95)',
                            padding: '15px',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: 'bold',
                            animation: 'slideUp 0.3s ease-out, pulse 1s infinite',
                            border: '2px solid #fff'
                        }}>
                            <div style={{ fontSize: '16px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {lastAlert.severity === 'critical' ? '🚨' : '⚠️'} {lastAlert.message}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                Confidence: {(lastAlert.confidence * 100).toFixed(0)}% | {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detection Stats & Live Detections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Stats Card */}
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', border: '1px solid #d4af37' }}>
                        <h3 style={{ color: '#d4af37', fontSize: '16px', marginBottom: '15px', marginTop: 0 }}>Detection Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#1a1a1a', borderRadius: '5px' }}>
                                <span style={{ color: '#ccc', fontSize: '14px' }}>👤 People:</span>
                                <span style={{ 
                                    color: stats.person_count > 0 ? '#4caf50' : '#fff', 
                                    fontWeight: 'bold', 
                                    fontSize: '20px' 
                                }}>{stats.person_count}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#1a1a1a', borderRadius: '5px' }}>
                                <span style={{ color: '#ccc', fontSize: '14px' }}>📦 Objects:</span>
                                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>{stats.total_objects}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#1a1a1a', borderRadius: '5px' }}>
                                <span style={{ color: '#ccc', fontSize: '14px' }}>⚡ FPS:</span>
                                <span style={{ 
                                    color: fps >= 8 ? '#4caf50' : fps >= 5 ? '#ffb400' : '#ff6b6b', 
                                    fontWeight: 'bold', 
                                    fontSize: '20px' 
                                }}>{fps}</span>
                            </div>
                            {stats.weapon_detected && (
                                <div style={{ 
                                    padding: '10px', 
                                    background: 'rgba(211,47,47,0.2)', 
                                    border: '2px solid #d32f2f', 
                                    borderRadius: '5px',
                                    color: '#ff6b6b',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    animation: 'pulse 1s infinite'
                                }}>
                                    🚨 WEAPON DETECTED
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Detections */}
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', border: '1px solid #d4af37', maxHeight: '450px', overflowY: 'auto' }}>
                        <h3 style={{ color: '#d4af37', fontSize: '16px', marginBottom: '15px', marginTop: 0 }}>
                            Live Detections ({detections.length})
                        </h3>
                        {detections.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <AlertCircle size={40} color="#666" />
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>No objects detected</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {detections.map((det, idx) => (
                                    <div key={idx} style={{ 
                                        background: '#1a1a1a', 
                                        padding: '12px', 
                                        borderRadius: '5px', 
                                        borderLeft: `4px solid ${det.confidence > 0.8 ? '#4caf50' : det.confidence > 0.6 ? '#ffb400' : '#ff6b6b'}`,
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ 
                                                color: '#fff', 
                                                fontSize: '14px', 
                                                fontWeight: 'bold',
                                                textTransform: 'capitalize'
                                            }}>
                                                {det.class === 'person' ? '👤' : det.class === 'cell phone' ? '📱' : det.class === 'bottle' ? '🍾' : det.class === 'backpack' ? '🎒' : '📦'} {det.class}
                                            </span>
                                            <span style={{ 
                                                background: det.confidence > 0.8 ? '#4caf50' : det.confidence > 0.6 ? '#ffb400' : '#ff6b6b',
                                                color: '#fff',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {(det.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}