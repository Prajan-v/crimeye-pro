import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const LiveCamera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState({ people: 0, objects: 0, fps: 0 });
    const [yoloStatus, setYoloStatus] = useState('checking');
    const intervalRef = useRef(null);
    const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

    useEffect(() => {
        checkYoloHealth();
        const healthInterval = setInterval(checkYoloHealth, 5000);
        return () => clearInterval(healthInterval);
    }, []);

    const checkYoloHealth = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/detection/yolo-health');
            setYoloStatus(response.data.status === 'running' ? 'online' : 'offline');
        } catch (error) {
            setYoloStatus('offline');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
            startDetection();
        } catch (error) {
            console.error('Camera error:', error);
            alert('Cannot access camera');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setIsStreaming(false);
        setDetections([]);
        setStats({ people: 0, objects: 0, fps: 0 });
    };

    const startDetection = () => {
        fpsCounterRef.current = { frames: 0, lastTime: Date.now() };
        
        intervalRef.current = setInterval(async () => {
            if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                const frameData = canvas.toDataURL('image/jpeg', 0.6);
                
                try {
                    const response = await axios.post('http://localhost:5001/api/detection/detect-frame', {
                        frame: frameData
                    }, { timeout: 5000 });

                    if (response.data.detections) {
                        setDetections(response.data.detections);
                        
                        const peopleCount = response.data.detections.filter(d => 
                            d.class.toLowerCase() === 'person'
                        ).length;
                        
                        const objectCount = response.data.detections.length - peopleCount;
                        
                        fpsCounterRef.current.frames++;
                        const now = Date.now();
                        const elapsed = (now - fpsCounterRef.current.lastTime) / 1000;
                        
                        if (elapsed >= 1) {
                            const fps = Math.round(fpsCounterRef.current.frames / elapsed);
                            setStats({ people: peopleCount, objects: objectCount, fps });
                            fpsCounterRef.current = { frames: 0, lastTime: now };
                        }
                    }
                } catch (error) {
                    console.error('Detection error:', error.message);
                }
            }
        }, 200);
    };

    return (
        <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '30px'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h2 style={{ color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>📹</span>
                    Live Camera Feed
                </h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '5px 12px',
                        backgroundColor: yoloStatus === 'online' ? '#065f46' : '#7f1d1d',
                        borderRadius: '5px'
                    }}>
                        <span style={{ 
                            color: yoloStatus === 'online' ? '#10b981' : '#ef4444',
                            marginRight: '5px',
                            fontSize: '12px'
                        }}>●</span>
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                            YOLO: {yoloStatus.toUpperCase()}
                        </span>
                    </div>
                    {!isStreaming ? (
                        <button
                            onClick={startCamera}
                            style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ▶ Start Camera
                        </button>
                    ) : (
                        <button
                            onClick={stopCamera}
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ■ Stop Camera
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 2 }}>
                    <div style={{ 
                        position: 'relative',
                        backgroundColor: '#000',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', display: 'block' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        
                        {isStreaming && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                padding: '5px 12px',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <span style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'pulse 1s infinite'
                                }}></span>
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                    LIVE | {stats.fps} FPS
                                </span>
                            </div>
                        )}
                        
                        {!isStreaming && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: '#666',
                                fontSize: '16px'
                            }}>
                                Camera Inactive - Click Start Camera
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ 
                        backgroundColor: '#262626', 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginBottom: '15px'
                    }}>
                        <h3 style={{ color: '#fbbf24', margin: '0 0 15px 0', fontSize: '16px' }}>
                            Detection Stats
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>👤 People:</span>
                                <span style={{ 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    fontSize: '20px'
                                }}>{stats.people}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>📦 Objects:</span>
                                <span style={{ 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    fontSize: '20px'
                                }}>{stats.objects}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>⚡ FPS:</span>
                                <span style={{ 
                                    color: stats.fps > 0 ? '#10b981' : '#ef4444', 
                                    fontWeight: 'bold',
                                    fontSize: '20px'
                                }}>{stats.fps}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        backgroundColor: '#262626', 
                        padding: '15px', 
                        borderRadius: '8px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ color: '#fbbf24', margin: '0 0 15px 0', fontSize: '16px' }}>
                            Live Detections ({detections.length})
                        </h3>
                        {detections.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                color: '#666',
                                padding: '30px 10px'
                            }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>❗</div>
                                <div style={{ fontSize: '14px' }}>No objects detected</div>
                            </div>
                        ) : (
                            detections.map((detection, index) => (
                                <div key={index} style={{
                                    backgroundColor: '#1a1a1a',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    marginBottom: '8px',
                                    borderLeft: detection.class.toLowerCase() === 'knife' || detection.class.toLowerCase() === 'scissors' 
                                        ? '3px solid #ef4444' 
                                        : '3px solid #fbbf24'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ 
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize'
                                        }}>
                                            {detection.class}
                                        </span>
                                        <span style={{ 
                                            color: '#10b981',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {Math.round(detection.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveCamera;