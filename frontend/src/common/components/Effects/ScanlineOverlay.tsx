import React from 'react';
import styled, { keyframes } from 'styled-components';

const scanlineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100vh);
  }
`;

const ScanlineContainer = styled.div<{ $intensity?: number; $speed?: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`;

const Scanline = styled.div<{ $intensity?: number; $speed?: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${({ theme }) => theme.colors.accent.primary}40 50%,
    transparent 100%
  );
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.accent.primary};
  animation: ${scanlineAnimation} ${({ $speed }) => $speed || 2}s linear infinite;
  opacity: ${({ $intensity }) => $intensity || 0.3};
`;

const ScanlineOverlay: React.FC<{
  intensity?: number;
  speed?: number;
  enabled?: boolean;
}> = ({ intensity = 0.3, speed = 2, enabled = true }) => {
  if (!enabled) return null;

  return (
    <ScanlineContainer $intensity={intensity} $speed={speed}>
      <Scanline $intensity={intensity} $speed={speed} />
    </ScanlineContainer>
  );
};

export default ScanlineOverlay;
