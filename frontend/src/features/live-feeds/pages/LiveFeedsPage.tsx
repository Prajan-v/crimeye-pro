import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ParticleBackground from '../../../common/components/Effects/ParticleBackground';
import DynamicCameraGrid from '../components/DynamicCameraGrid';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchCameras, selectCameras, selectCamerasStatus, Camera } from '../liveFeedsSlice';
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

const LiveFeedsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const cameras = useAppSelector(selectCameras);
  const status = useAppSelector(selectCamerasStatus);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCameras());
    }
  }, [dispatch, status]);

  const activeCameras = useMemo<Camera[]>(() => {
    const sorted = [...cameras];
    sorted.sort((a, b) => (a.id === 'DESKTOP_WEBCAM' ? -1 : b.id === 'DESKTOP_WEBCAM' ? 1 : 0));
    return sorted;
  }, [cameras]);

  return (
    <PageContainer>
      {/* Background Effects */}
      <ParticleBackground particleCount={25} />
      
      {/* Live Clock - Top Right Corner */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          textAlign: 'right',
          minWidth: '160px',
          zIndex: 1000,
        }}
      >
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFD700', marginBottom: '4px' }}>
          {currentTime.toLocaleTimeString()}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </motion.div>
      
      <Header>
        <Title>Live Camera Feeds</Title>
        <Subtitle>Real-time surveillance monitoring system</Subtitle>
      </Header>

      {/* Controls and live grid replaced by dynamic grid */}
      <DynamicCameraGrid
        cameras={activeCameras.map((camera: Camera) => ({
          id: camera.id,
          name: camera.name,
          rtsp_url: camera.rtsp_url,
          location: camera.location ?? undefined,
          status: camera.status as 'online' | 'offline' | 'error' | 'buffering',
        }))}
      />
    </PageContainer>
  );
};

export default LiveFeedsPage;
