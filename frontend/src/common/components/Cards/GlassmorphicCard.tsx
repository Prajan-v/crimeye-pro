import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)<{ $glow?: boolean; $hover?: boolean }>`
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  overflow: hidden;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.base};
  
  ${({ $glow, theme }) => $glow && css`
    box-shadow: ${theme.shadows.glass}, ${theme.shadows.glowPrimary};
  `}
  
  ${({ $hover }) => $hover && css`
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
    }
  `}
  
  /* Corner accents */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.accent.primary}, 
      ${({ theme }) => theme.colors.accent.secondary},
      ${({ theme }) => theme.colors.accent.tertiary}
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
    opacity: 0.6;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  svg {
    color: ${({ theme }) => theme.colors.accent.primary};
    width: 20px;
    height: 20px;
    filter: drop-shadow(0 0 8px ${({ theme }) => theme.colors.glow.primary});
  }
  
  h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

const CardContent = styled.div<{ $noPadding?: boolean }>`
  padding: ${({ $noPadding, theme }) => $noPadding ? '0' : theme.spacing.lg};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  position: relative;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      delay: i * 0.1, 
      duration: 0.5, 
      ease: [0, 0, 0.2, 1] as const,
      type: "spring",
      stiffness: 100
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" as const }
  }
};

interface GlassmorphicCardProps {
  children: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerTitle?: string;
  customIndex?: number;
  contentNoPadding?: boolean;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  headerIcon,
  headerTitle,
  customIndex = 0,
  contentNoPadding = false,
  className,
  glow = false,
  hover = true,
  onClick
}) => {
  return (
    <CardContainer
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      custom={customIndex}
      className={className}
      $glow={glow}
      $hover={hover}
      onClick={onClick}
    >
      {headerTitle && (
        <CardHeader>
          {headerIcon}
          <h3>{headerTitle}</h3>
        </CardHeader>
      )}
      <CardContent $noPadding={contentNoPadding}>
        {children}
      </CardContent>
    </CardContainer>
  );
};

export default GlassmorphicCard;
