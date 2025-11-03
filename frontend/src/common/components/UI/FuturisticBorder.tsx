import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const BorderContainer = styled(motion.div)<{
  $variant?: 'default' | 'corner' | 'glow' | 'animated';
  $color?: string;
  $thickness?: number;
}>`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  
  ${({ $variant, $color, $thickness, theme }) => {
    const color = $color || theme.colors.accent.primary;
    const thickness = $thickness || 2;
    
    switch ($variant) {
      case 'corner':
        return css`
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            padding: ${thickness}px;
            background: linear-gradient(45deg, 
              ${color}, 
              ${theme.colors.accent.secondary},
              ${theme.colors.accent.tertiary},
              ${color}
            );
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            -webkit-mask-composite: xor;
            pointer-events: none;
            z-index: 1;
          }
        `;
      case 'glow':
        return css`
          border: ${thickness}px solid ${color};
          box-shadow: 
            0 0 20px ${color}40,
            inset 0 0 20px ${color}20;
        `;
      case 'animated':
        return css`
          border: ${thickness}px solid transparent;
          background: linear-gradient(45deg, 
            ${color}, 
            ${theme.colors.accent.secondary},
            ${theme.colors.accent.tertiary},
            ${color}
          ) border-box;
          background-clip: padding-box;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: -${thickness}px;
            left: -${thickness}px;
            right: -${thickness}px;
            bottom: -${thickness}px;
            background: linear-gradient(45deg, 
              ${color}, 
              ${theme.colors.accent.secondary},
              ${theme.colors.accent.tertiary},
              ${color}
            );
            border-radius: inherit;
            z-index: -1;
            animation: borderRotate 3s linear infinite;
          }
          
          @keyframes borderRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
      default:
        return css`
          border: ${thickness}px solid ${color};
        `;
    }
  }}
`;

const CornerAccent = styled.div<{ $color?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid ${({ $color, theme }) => $color || theme.colors.accent.primary};
  border-left: 2px solid ${({ $color, theme }) => $color || theme.colors.accent.primary};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.sm};
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: 6px;
    height: 6px;
    background: ${({ $color, theme }) => $color || theme.colors.accent.primary};
    border-radius: 50%;
    box-shadow: 0 0 8px ${({ $color, theme }) => $color || theme.colors.accent.primary};
  }
`;

const CornerAccentBR = styled(CornerAccent)`
  top: auto;
  left: auto;
  bottom: 0;
  right: 0;
  border-top: none;
  border-left: none;
  border-bottom: 2px solid ${({ $color, theme }) => $color || theme.colors.accent.primary};
  border-right: 2px solid ${({ $color, theme }) => $color || theme.colors.accent.primary};
  border-top-left-radius: 0;
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.sm};
`;

interface FuturisticBorderProps {
  children: React.ReactNode;
  variant?: 'default' | 'corner' | 'glow' | 'animated';
  color?: string;
  thickness?: number;
  showCorners?: boolean;
  className?: string;
}

const FuturisticBorder: React.FC<FuturisticBorderProps> = ({
  children,
  variant = 'default',
  color,
  thickness = 2,
  showCorners = false,
  className
}) => {
  const borderVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut" as const
      }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <BorderContainer
      $variant={variant}
      $color={color}
      $thickness={thickness}
      className={className}
      variants={borderVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {children}
      {showCorners && (
        <>
          <CornerAccent $color={color} />
          <CornerAccentBR $color={color} />
        </>
      )}
    </BorderContainer>
  );
};

export default FuturisticBorder;
