import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FeedContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.background.elevated};
`;

const CameraName = styled(motion.div)`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated}CC;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  z-index: 5;
`;

const DetectionOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
`;

interface Detection {
  class_name: string;
  confidence: number;
  bbox: number[];
  threat_level: string;
}

interface CameraFeedProps {
  camera: {
    id: string;
    name: string;
    rtsp_url: string;
    status: string;
  };
  isSelected?: boolean;
  onDetection?: (detection: Detection[]) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ camera, isSelected, onDetection }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(true);
  const [llmAnalysis, setLlmAnalysis] = useState<string | null>(null);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isDesktopCamera = camera.id === 'DESKTOP_WEBCAM';

  // Draw detection bounding boxes
  const drawDetections = useCallback((detections: Detection[]) => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each detection
    detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      // Set color based on threat level
      let color = '#10B981'; // green (low)
      if (detection.threat_level === 'high') {
        color = '#EF4444'; // red
      } else if (detection.threat_level === 'medium') {
        color = '#F59E0B'; // orange
      }

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);

      // Draw label background
      const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = '14px Inter, sans-serif';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight, textMetrics.width + 10, textHeight);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x1 + 5, y1 - 5);
    });
  }, []);

  const startWebcam = useCallback(async () => {
    if (!isDesktopCamera) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          /* autoplay policies */
        });
      }
      setStreamError(null);
      setIsWebcamActive(true);
    } catch (error) {
      console.error('Failed to start desktop camera stream', error);
      setStreamError('Unable to access desktop camera');
      setIsWebcamActive(false);
    }
  }, [isDesktopCamera]);

  const stopWebcam = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  }, []);

  const toggleWebcam = useCallback(() => {
    if (isWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  }, [isWebcamActive, startWebcam, stopWebcam]);

  useEffect(() => {
    if (!isDesktopCamera) {
      return;
    }

    startWebcam();

    return () => {
      stopWebcam();
    };
  }, [isDesktopCamera, startWebcam, stopWebcam]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected for camera ${camera.id}`);
      // Subscribe to this camera's updates
      ws.send(JSON.stringify({
        type: 'subscribe_camera',
        camera_id: camera.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'detection' && data.camera_id === camera.id) {
        const newDetections = data.detections || [];
        setDetections(newDetections);
        setLastDetectionTime(new Date());
        drawDetections(newDetections);
        onDetection?.(newDetections);
      } else if (data.type === 'llm_analysis' && data.camera_id === camera.id) {
        setLlmAnalysis(data.analysis);
        // Auto-clear after 10 seconds
        setTimeout(() => setLlmAnalysis(null), 10000);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for camera ${camera.id}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for camera ${camera.id}`);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'unsubscribe_camera',
          camera_id: camera.id
        }));
      }
      ws.close();
    };
  }, [camera.id, drawDetections, onDetection]);

  // Frame capture and streaming for desktop camera
  useEffect(() => {
    if (!isDesktopCamera || !isWebcamActive) {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      return;
    }

    // Create hidden canvas for frame capture
    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement('canvas');
    }

    const captureAndSendFrame = () => {
      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      const ws = wsRef.current;

      if (!video || !canvas || !ws || ws.readyState !== WebSocket.OPEN) {
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result as string;
                ws.send(JSON.stringify({
                  type: 'frame',
                  camera_id: camera.id,
                  frame: base64data
                }));
              };
              reader.readAsDataURL(blob);
            }
          }, 'image/jpeg', 0.8);
        }
      }
    };

    // Send frames at 5 FPS
    frameIntervalRef.current = setInterval(captureAndSendFrame, 200);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [isDesktopCamera, isWebcamActive, camera.id]);

  // Resize canvas to match container
  useEffect(() => {
    const resizeCanvas = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      const container = overlay.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      overlay.width = rect.width;
      overlay.height = rect.height;

      // Redraw detections after resize
      drawDetections(detections);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.addEventListener('loadedmetadata', resizeCanvas);
      videoEl.addEventListener('resize', resizeCanvas as EventListener);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (videoEl) {
        videoEl.removeEventListener('loadedmetadata', resizeCanvas);
        videoEl.removeEventListener('resize', resizeCanvas as EventListener);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [detections, drawDetections]);

  return (
    <FeedContainer>
      {isDesktopCamera ? (
        <Video ref={videoRef} autoPlay muted playsInline />
      ) : (
        <Video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          poster="/static/media/camera-placeholder.jpg"
          onError={() => setStreamError('Stream preview unavailable')}
        />
      )}
      <DetectionOverlay ref={overlayRef} />
      {streamError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#000000cc',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
        >
          {streamError}
        </motion.div>
      )}
      
      {isDesktopCamera && detections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            maxWidth: '220px',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '6px', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯</span> Detections
          </div>
          {detections.map((det, idx) => (
            <div key={idx} style={{ fontSize: '0.75rem', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{det.class_name}</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>({Math.round(det.confidence * 100)}%)</span>
            </div>
          ))}
          {lastDetectionTime && (
            <div style={{ fontSize: '0.7rem', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)', color: '#a0a0a0' }}>
              🕐 {lastDetectionTime.toLocaleTimeString()}
              <br />
              📅 {lastDetectionTime.toLocaleDateString()}
            </div>
          )}
        </motion.div>
      )}
      
      {isDesktopCamera && detections.length === 0 && isWebcamActive && !llmAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1acc',
            color: '#a0a0a0',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        >
          No detections yet...
        </motion.div>
      )}

      {isDesktopCamera && llmAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, #1a1a1acc 0%, #2a2a2acc 100%)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            border: '1px solid #FFD70040',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '6px', color: '#FFD700' }}>
            🤖 AI Analysis
          </div>
          {llmAnalysis}
        </motion.div>
      )}
      
      <CameraName
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {camera.name}
      </CameraName>
    </FeedContainer>
  );
};

export default CameraFeed;

