import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const BadgeContainer = styled(motion.span)<{ 
  $level: 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
  $size?: 'sm' | 'md' | 'lg';
  $glow?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ $size, theme }) => {
    switch ($size) {
      case 'sm': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'lg': return `${theme.spacing.sm} ${theme.spacing.md}`;
      default: return `${theme.spacing.xs} ${theme.spacing.sm}`;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ $size, theme }) => {
    switch ($size) {
      case 'sm': return theme.fontSizes.xs;
      case 'lg': return theme.fontSizes.sm;
      default: return theme.fontSizes.xs;
    }
  }};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
  position: relative;
  overflow: hidden;
  
  /* Level-specific styling */
  ${({ $level, theme }) => {
    switch ($level) {
      case 'critical':
        return css`
          background: linear-gradient(135deg, ${theme.colors.threat.critical}20, ${theme.colors.threat.critical}10);
          color: ${theme.colors.threat.critical};
          border-color: ${theme.colors.threat.critical}60;
          ${({ $glow }) => $glow && css`
            box-shadow: 0 0 20px ${theme.colors.glowError};
          `}
        `;
      case 'high':
        return css`
          background: linear-gradient(135deg, ${theme.colors.threat.high}20, ${theme.colors.threat.high}10);
          color: ${theme.colors.threat.high};
          border-color: ${theme.colors.threat.high}60;
          ${({ $glow }) => $glow && css`
            box-shadow: 0 0 20px ${theme.colors.glowWarning};
          `}
        `;
      case 'medium':
        return css`
          background: linear-gradient(135deg, ${theme.colors.threat.medium}20, ${theme.colors.threat.medium}10);
          color: ${theme.colors.threat.medium};
          border-color: ${theme.colors.threat.medium}60;
          ${({ $glow }) => $glow && css`
            box-shadow: 0 0 20px ${theme.colors.glowWarning};
          `}
        `;
      case 'low':
        return css`
          background: linear-gradient(135deg, ${theme.colors.threat.low}20, ${theme.colors.threat.low}10);
          color: ${theme.colors.threat.low};
          border-color: ${theme.colors.threat.low}60;
          ${({ $glow }) => $glow && css`
            box-shadow: 0 0 20px ${theme.colors.glowSuccess};
          `}
        `;
      case 'none':
        return css`
          background: linear-gradient(135deg, ${theme.colors.threat.none}20, ${theme.colors.threat.none}10);
          color: ${theme.colors.threat.none};
          border-color: ${theme.colors.threat.none}60;
          ${({ $glow }) => $glow && css`
            box-shadow: 0 0 20px ${theme.colors.glowSuccess};
          `}
        `;
      default:
        return css`
          background: linear-gradient(135deg, ${theme.colors.threat.unknown}20, ${theme.colors.threat.unknown}10);
          color: ${theme.colors.threat.unknown};
          border-color: ${theme.colors.threat.unknown}60;
        `;
    }
  }}
  
  /* Pulse animation for critical/high levels */
  ${({ $level }) => ['critical', 'high'].includes($level) && css`
    ${({ theme }) => theme.animations.pulse}
  `}
  
  /* Shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const StatusDot = styled.div<{ $level: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  ${({ $level }) => ['critical', 'high'].includes($level) && `
    ${({ theme }) => theme.animations.pulse}
  `}
`;

interface RiskBadgeProps {
  level: 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  showDot?: boolean;
  children?: React.ReactNode;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  glow = false,
  showDot = true,
  children
}) => {
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  return (
    <BadgeContainer
      $level={level}
      $size={size}
      $glow={glow}
      variants={badgeVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {showDot && <StatusDot $level={level} />}
      {children || level}
    </BadgeContainer>
  );
};

export default RiskBadge;
