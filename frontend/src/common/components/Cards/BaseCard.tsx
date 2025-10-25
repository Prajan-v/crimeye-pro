import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const CardContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.surface};
  flex-shrink: 0;
  svg {
    color: ${({ theme }) => theme.colors.accent.primary};
    width: 20px;
    height: 20px;
  }
`;

export const CardContent = styled.div<{ $noPadding?: boolean }>`
  padding: ${({ $noPadding, theme }) => $noPadding ? '0' : theme.spacing.lg};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  position: relative;
`;

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0, 0, 0.2, 1] as const } // <-- FIX: Added 'as const'
  })
};

interface BaseCardProps {
  children: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerTitle?: string;
  customIndex?: number;
  contentNoPadding?: boolean;
  className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({
  children, headerIcon, headerTitle,
  customIndex = 0, contentNoPadding = false, className
}) => {
  return (
    <CardContainer
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={customIndex}
      className={className}
    >
      {headerTitle && (
        <CardHeader>
          {headerIcon}
          <span>{headerTitle}</span>
        </CardHeader>
      )}
      {/* This logic was from your fix script, preserving it */
      headerTitle ? (
        <CardContent $noPadding={contentNoPadding}>{children}</CardContent>
      ) : (
        <div style={{ padding: contentNoPadding ? 0 : '1.5rem', flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
          {children}
        </div>
      )}
    </CardContainer>
  );
};

export default BaseCard;
