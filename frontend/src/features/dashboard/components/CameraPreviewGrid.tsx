import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Video, WifiOff, Camera, Activity } from 'react-feather';
import GlassmorphicCard from '../../../common/components/Cards/GlassmorphicCard';
import FuturisticBorder from '../../../common/components/UI/FuturisticBorder';
const Grid = styled(motion.div)`
display: grid;
grid-template-columns: 1fr;
gap: ${({ theme }) => theme.spacing.md};
@media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
grid-template-columns: repeat(2, 1fr);
}
`;
const CameraCard = styled(motion.div)<{ $status: 'live' | 'offline' }>`
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.glass};
  transition: all ${({ theme }) => theme.transitions.base};
  cursor: pointer;
  position: relative;
  
  ${({ $status, theme }) => {
    if ($status === 'live') {
      return `
        border: 2px solid ${theme.colors.status.success}40;
        box-shadow: ${theme.shadows.glass}, 0 0 20px ${theme.colors.glowSuccess};
      `;
    } else {
      return `
        border: 2px solid ${theme.colors.border};
        box-shadow: ${theme.shadows.glass};
      `;
    }
  }}
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
  }
`;
const Placeholder = styled.div<{ $status: 'live' | 'offline' }>`
  width: 100%; 
  aspect-ratio: 16/9; 
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.primary}, 
    ${({ theme }) => theme.colors.background.secondary}
  );
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;
  
  svg { 
    width: 30%; 
    height: 30%; 
    max-width: 60px; 
    opacity: 0.5;
    filter: drop-shadow(0 0 10px currentColor);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 0%, 
      ${({ theme }) => theme.colors.accent.primary}10 50%, 
      transparent 100%
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  &::after {
    content: '${({ $status }) => $status.toUpperCase()}';
    position: absolute;
    top: ${({ theme }) => theme.spacing.sm};
    right: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: #FFFFFF;
    background: linear-gradient(135deg, 
      ${({ theme, $status }) => $status === 'live' ? theme.colors.status.success : theme.colors.text.muted}, 
      ${({ theme, $status }) => $status === 'live' ? theme.colors.status.success : theme.colors.text.muted}CC
    );
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    box-shadow: 0 0 10px ${({ theme, $status }) => $status === 'live' ? theme.colors.glowSuccess : 'transparent'};
    ${({ $status, theme }) => ($status === 'live' ? theme.animations.pulse : '')}
  }
`;
const InfoBar = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.elevated}CC, 
    ${({ theme }) => theme.colors.background.surface}CC
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600; 
  font-size: ${({ theme }) => theme.fontSizes.sm};
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.accent.primary};
    filter: drop-shadow(0 0 4px currentColor);
  }
`;
const gridVariants = {
hidden: { opacity: 0 },
visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
hidden: { opacity: 0, y: 20, scale: 0.95 },
visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};
const cameras = [
{ id: 'CAM_01', name: 'Keller Kamera 1', status: 'live' },
{ id: 'CAM_02', name: 'Keller Kamera 2', status: 'live' },
{ id: 'CAM_03', name: 'Keller Kamera 3', status: 'live' },
{ id: 'CAM_04', name: 'Warehouse Entry', status: 'offline' },
{ id: 'CAM_05', name: 'Main Lobby', status: 'live' },
{ id: 'CAM_06', name: 'Parking Lot', status: 'live' },
];
interface CameraPreviewGridProps { customIndex?: number; }
const CameraPreviewGrid: React.FC<CameraPreviewGridProps> = ({ customIndex }) => {
  const liveCameras = cameras.filter(cam => cam.status === 'live').length;
  const totalCameras = cameras.length;
  
  return (
    <GlassmorphicCard
      headerIcon={<Video size={20} />}
      headerTitle="Live Camera Feeds"
      customIndex={customIndex}
      glow={liveCameras > 0}
    >
      <Grid variants={gridVariants} initial="hidden" animate="visible">
        {cameras.map((cam) => (
          <FuturisticBorder
            key={cam.id}
            variant="corner"
            color={cam.status === 'live' ? '#00FF88' : '#6b7280'}
            showCorners={true}
          >
            <CameraCard 
              $status={cam.status as 'live' | 'offline'}
              variants={cardVariants} 
              title={`View ${cam.name}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Placeholder $status={cam.status as 'live' | 'offline'}>
                {cam.status === 'live' ? <Video /> : <WifiOff />}
              </Placeholder>
              <InfoBar>
                <Camera size={16} />
                {cam.name}
                {cam.status === 'live' && (
                  <Activity size={12} style={{ marginLeft: 'auto', color: '#00FF88' }} />
                )}
              </InfoBar>
            </CameraCard>
          </FuturisticBorder>
        ))}
      </Grid>
    </GlassmorphicCard>
  );
};
export default CameraPreviewGrid;
