import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Camera, Wifi, WifiOff, AlertCircle } from 'react-feather';
import CameraFeed from './CameraFeed';
// import { useWebSocket } from '../../../services/socket.middleware';

// Grid container with responsive layout
const GridContainer = styled(motion.div)<{ cameraCount: number }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  height: 100%;
  width: 100%;
  
  /* Responsive grid layouts based on camera count */
  ${({ cameraCount }) => {
    if (cameraCount === 1) {
      return `
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
      `;
    } else if (cameraCount === 2) {
      return `
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
      `;
    } else if (cameraCount === 3) {
      return `
        grid-template-columns: 2fr 1fr;
        grid-template-rows: 1fr 1fr;
        grid-template-areas: 
          "main cam2"
          "main cam3";
      `;
    } else if (cameraCount === 4) {
      return `
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      `;
    } else if (cameraCount <= 6) {
      return `
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
      `;
    } else {
      return `
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(auto-fit, minmax(200px, 1fr));
        overflow-y: auto;
      `;
    }
  }}
`;

// Camera feed wrapper with grid positioning
const CameraWrapper = styled(motion.div)<{ 
  isMain?: boolean; 
  gridArea?: string;
  cameraCount: number;
}>`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  ${({ isMain, cameraCount }) => isMain && cameraCount === 3 && `
    grid-area: main;
  `}
  
  ${({ gridArea }) => gridArea && `
    grid-area: ${gridArea};
  `}
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
    transition: all ${({ theme }) => theme.transitions.base};
  }
`;

// Status indicator
const StatusIndicator = styled(motion.div)<{ status: 'online' | 'offline' | 'error' | 'buffering' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  z-index: 10;
  
  background: ${({ status, theme }) => {
    switch (status) {
      case 'online': return theme.colors.status.success;
      case 'offline': return theme.colors.status.error;
      case 'error': return theme.colors.status.error;
      case 'buffering': return theme.colors.status.warning;
      default: return theme.colors.background.elevated;
    }
  }};
  
  color: ${({ theme }) => theme.colors.background.primary};
`;

// Connection status overlay
const ConnectionOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.background.primary}80;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  z-index: 20;
`;

// Auto-reconnect indicator
const ReconnectIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.status.warning};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

interface CameraData {
  id: string;
  name: string;
  rtsp_url: string;
  location?: string;
  status: 'online' | 'offline' | 'error' | 'buffering';
  fps?: number;
  isRecording?: boolean;
}

interface DynamicCameraGridProps {
  cameras: CameraData[];
  onCameraClick?: (camera: CameraData) => void;
}

const DynamicCameraGrid: React.FC<DynamicCameraGridProps> = ({
  cameras,
  onCameraClick,
}) => {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  
  // Get grid layout based on camera count
  const gridLayout = useMemo(() => {
    const count = cameras.length;
    
    if (count === 1) {
      return { columns: 1, rows: 1, areas: {} };
    } else if (count === 2) {
      return { columns: 2, rows: 1, areas: {} };
    } else if (count === 3) {
      return {
        columns: 2,
        rows: 2,
        areas: {
          [cameras[0].id]: 'main',
          [cameras[1].id]: 'cam2',
          [cameras[2].id]: 'cam3',
        }
      };
    } else if (count === 4) {
      return { columns: 2, rows: 2, areas: {} };
    } else if (count <= 6) {
      return { columns: 2, rows: 3, areas: {} };
    } else {
      return { columns: 3, rows: Math.ceil(count / 3), areas: {} };
    }
  }, [cameras]);
  
  const handleCameraClick = useCallback((camera: CameraData) => {
    setSelectedCamera(camera.id);
    onCameraClick?.(camera);
  }, [onCameraClick]);
  
  if (cameras.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '16px',
          color: '#a0a0a0',
        }}
      >
        <Camera size={48} />
        <h3>No cameras available</h3>
        <p>Add cameras to start monitoring</p>
      </motion.div>
    );
  }
  
  return (
    <GridContainer
      cameraCount={cameras.length}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {cameras.map((camera, index) => (
          <CameraWrapper
            key={camera.id}
            isMain={index === 0 && cameras.length === 3}
            gridArea={gridLayout.areas[camera.id]}
            cameraCount={cameras.length}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleCameraClick(camera)}
          >
            {/* Status indicator */}
            <StatusIndicator
              status={camera.status}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {camera.status === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
              {camera.status.toUpperCase()}
            </StatusIndicator>
            
            {/* Recording indicator */}
            {/* Camera feed */}
            <CameraFeed
              camera={camera}
              isSelected={selectedCamera === camera.id}
              onDetection={(detection) => {
                // Handle detection events
                console.log('Detection:', detection);
              }}
            />
            
            {/* Connection overlay for offline cameras */}
            {camera.status === 'offline' && (
              <ConnectionOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WifiOff size={48} />
                <div>
                  <h4>Camera Offline</h4>
                  <p>{camera.name}</p>
                </div>
                <ReconnectIndicator>
                  <AlertCircle size={16} />
                  Attempting to reconnect...
                </ReconnectIndicator>
              </ConnectionOverlay>
            )}
          </CameraWrapper>
        ))}
      </AnimatePresence>
    </GridContainer>
  );
};

export default DynamicCameraGrid;

