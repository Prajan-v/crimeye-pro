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

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number>();

  // Draw detection bounding boxes
  const drawDetections = useCallback((detections: Detection[]) => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
        const newDetections = data.data.detections || [];
        setDetections(newDetections);
        drawDetections(newDetections);
        onDetection?.(newDetections);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for camera ${camera.id}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for camera ${camera.id}`);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic here
        }
      }, 3000);
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

  // Resize canvas to match container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      if (!canvas || !overlay) return;

      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      overlay.width = rect.width;
      overlay.height = rect.height;

      // Redraw detections after resize
      drawDetections(detections);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [detections, drawDetections]);

  return (
    <FeedContainer>
      <Canvas ref={canvasRef} />
      <DetectionOverlay ref={overlayRef} />
      
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

