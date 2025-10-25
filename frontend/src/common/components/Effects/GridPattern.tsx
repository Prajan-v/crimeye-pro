import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div<{ $opacity?: number; $size?: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: ${({ $opacity }) => $opacity || 0.2};
  background-image: 
    linear-gradient(${({ theme }) => theme.colors.border}40 1px, transparent 1px),
    linear-gradient(90deg, ${({ theme }) => theme.colors.border}40 1px, transparent 1px);
  background-size: ${({ $size }) => $size || 50}px ${({ $size }) => $size || 50}px;
`;

const GridPattern: React.FC<{
  opacity?: number;
  size?: number;
  enabled?: boolean;
}> = ({ opacity = 0.2, size = 50, enabled = true }) => {
  if (!enabled) return null;

  return <GridContainer $opacity={opacity} $size={size} />;
};

export default GridPattern;
