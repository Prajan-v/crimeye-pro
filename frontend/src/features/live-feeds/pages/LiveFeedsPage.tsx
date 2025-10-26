import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Clock } from 'react-feather';
import { Video, Camera, Activity, AlertTriangle, Settings, Grid } from 'react-feather';
import GlassmorphicCard from '../../../common/components/Cards/GlassmorphicCard';
import ParticleBackground from '../../../common/components/Effects/ParticleBackground';
import FuturisticBorder from '../../../common/components/UI/FuturisticBorder';
import RiskBadge from '../../../common/components/UI/RiskBadge';
const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  position: relative;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 700;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.primary}, 
    ${({ theme }) => theme.colors.accent.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 0 30px ${({ theme }) => theme.colors.glow.primary};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0 0 0;
  font-weight: 300;
  letter-spacing: 0.05em;
`;

const ControlsBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const ControlButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
    background: ${({ theme }) => theme.colors.background.surface};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CameraGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CameraFeed = styled(motion.div)<{ $status: 'online' | 'offline' | 'error' }>`
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  overflow: hidden;
  position: relative;
  aspect-ratio: 16/9;
  transition: all ${({ theme }) => theme.transitions.base};
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'online':
        return `
          border: 2px solid ${theme.colors.status.success}40;
          box-shadow: ${theme.shadows.glass}, 0 0 20px ${theme.colors.glowSuccess};
        `;
      case 'error':
        return `
          border: 2px solid ${theme.colors.status.error}40;
          box-shadow: ${theme.shadows.glass}, 0 0 20px ${theme.colors.glowError};
        `;
      default:
        return `
          border: 2px solid ${theme.colors.border};
          box-shadow: ${theme.shadows.glass};
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
  }
`;

const CameraHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.elevated}CC, 
    ${({ theme }) => theme.colors.background.surface}CC
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
`;

const CameraName = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const StatusIndicator = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'online':
        return `color: ${theme.colors.status.success};`;
      case 'error':
        return `color: ${theme.colors.status.error};`;
      default:
        return `color: ${theme.colors.text.muted};`;
    }
  }}
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
    ${({ $status }) => $status === 'online' && `
      ${({ theme }) => theme.animations.pulse}
    `}
  }
`;

const CameraContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.primary}, 
    ${({ theme }) => theme.colors.background.secondary}
  );
  color: ${({ theme }) => theme.colors.text.muted};
  
  svg {
    width: 64px;
    height: 64px;
    opacity: 0.5;
  }
`;

const CameraFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.elevated}CC, 
    ${({ theme }) => theme.colors.background.surface}CC
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
`;

const Timestamp = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const RiskMeter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const RiskBar = styled.div<{ $level: number }>`
  width: 60px;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.surface};
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $level }) => $level}%;
    background: linear-gradient(90deg, 
      ${({ theme }) => theme.colors.status.success}, 
      ${({ theme }) => theme.colors.status.warning}, 
      ${({ theme }) => theme.colors.status.error}
    );
    transition: width ${({ theme }) => theme.transitions.base};
  }
`;
// Mock camera data
const mockCameras = [
  { id: 'CAM_01', name: 'Main Entrance', status: 'online' as const, riskLevel: 25, lastUpdate: new Date() },
  { id: 'CAM_02', name: 'Parking Lot', status: 'online' as const, riskLevel: 15, lastUpdate: new Date() },
  { id: 'CAM_03', name: 'Reception Area', status: 'error' as const, riskLevel: 80, lastUpdate: new Date() },
  { id: 'CAM_04', name: 'Security Office', status: 'offline' as const, riskLevel: 0, lastUpdate: new Date() },
  { id: 'CAM_05', name: 'Emergency Exit', status: 'online' as const, riskLevel: 5, lastUpdate: new Date() },
  { id: 'CAM_06', name: 'Storage Room', status: 'online' as const, riskLevel: 10, lastUpdate: new Date() },
];

const LiveFeedsPage: React.FC = () => {
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x3' | '4x4'>('2x2');
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

  const getGridColumns = () => {
    switch (gridLayout) {
      case '2x2': return 'repeat(2, 1fr)';
      case '3x3': return 'repeat(3, 1fr)';
      case '4x4': return 'repeat(4, 1fr)';
      default: return 'repeat(2, 1fr)';
    }
  };

  const CameraFeedComponent: React.FC<{ camera: typeof mockCameras[0] }> = ({ camera }) => (
    <CameraFeed
      $status={camera.status}
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
      }}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
    >
      <CameraHeader>
        <CameraName>
          <Camera size={16} />
          {camera.name}
        </CameraName>
        <StatusIndicator $status={camera.status}>
          {camera.status === 'online' ? 'LIVE' : camera.status === 'error' ? 'ERROR' : 'OFFLINE'}
        </StatusIndicator>
      </CameraHeader>
      
      <CameraContent>
        {camera.status === 'online' ? (
          <Video size={64} />
        ) : camera.status === 'error' ? (
          <AlertTriangle size={64} />
        ) : (
          <Camera size={64} />
        )}
      </CameraContent>
      
      <CameraFooter>
        <Timestamp>
          <Clock size={14} />
          {camera.lastUpdate.toLocaleTimeString()}
        </Timestamp>
        <RiskMeter>
          <RiskBar $level={camera.riskLevel} />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {camera.riskLevel}%
          </span>
        </RiskMeter>
      </CameraFooter>
    </CameraFeed>
  );

  return (
    <PageContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Background Effects */}
      <ParticleBackground particleCount={25} />
      
      <Header>
        <Title>Live Camera Feeds</Title>
        <Subtitle>Real-time surveillance monitoring system</Subtitle>
      </Header>

      <ControlsBar>
        <ControlButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGridLayout('2x2')}
        >
          <Grid size={20} />
          2x2 Grid
        </ControlButton>
        <ControlButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGridLayout('3x3')}
        >
          <Grid size={20} />
          3x3 Grid
        </ControlButton>
        <ControlButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGridLayout('4x4')}
        >
          <Grid size={20} />
          4x4 Grid
        </ControlButton>
        <ControlButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={20} />
          Settings
        </ControlButton>
      </ControlsBar>

      <CameraGrid style={{ gridTemplateColumns: getGridColumns() }}>
        {mockCameras.slice(0, gridLayout === '2x2' ? 4 : gridLayout === '3x3' ? 9 : 16).map((camera) => (
          <CameraFeedComponent key={camera.id} camera={camera} />
        ))}
      </CameraGrid>
    </PageContainer>
  );
};

export default LiveFeedsPage;
