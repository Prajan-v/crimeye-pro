import React from 'react';
import styled, { css } from 'styled-components';
import { motion, Variants } from 'framer-motion';

interface BadgeProps {
  $level: 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
  $size?: 'sm' | 'md' | 'lg';
  $glow?: boolean;
}

const BadgeContainer = styled(motion.span)<BadgeProps>`
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

  ${({ $level, theme, $glow }) => css`
    background: linear-gradient(135deg, ${theme.colors.threat[$level]}20, ${theme.colors.threat[$level]}10);
    color: ${theme.colors.threat[$level]};
    border-color: ${theme.colors.threat[$level]}60;
    ${$glow &&
    css`
      box-shadow: 0 0 20px ${
        $level === 'critical'
          ? theme.colors.glowError
          : $level === 'high' || $level === 'medium'
          ? theme.colors.glowWarning
          : theme.colors.glowSuccess
      };
    `}
  `}

  ${({ $level }) =>
    ['critical', 'high'].includes($level) &&
    css`
      ${({ theme }) => theme.animations.pulse}
    `}
`;

const StatusDot = styled.div<{ $level: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  ${({ $level }) =>
    ['critical', 'high'].includes($level) &&
    css`
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
  children,
}) => {
  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
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
