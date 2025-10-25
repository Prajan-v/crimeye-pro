import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import GlassmorphicCard from './GlassmorphicCard';
import AnimatedCounter from '../UI/AnimatedCounter';

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatValue = styled.div`
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
  text-shadow: 0 0 20px ${({ theme }) => theme.colors.glow.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
`;

const StatIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: linear-gradient(135deg, 
    ${({ $color, theme }) => $color || theme.colors.accent.primary}20,
    ${({ $color, theme }) => $color || theme.colors.accent.primary}10
  );
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ $color, theme }) => $color || theme.colors.accent.primary}40;
  box-shadow: 0 0 20px ${({ $color, theme }) => $color || theme.colors.glow.primary};
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ $color, theme }) => $color || theme.colors.accent.primary};
    filter: drop-shadow(0 0 8px ${({ $color, theme }) => $color || theme.colors.glow.primary});
  }
`;

const TrendIndicator = styled.div<{ $trend: 'up' | 'down' | 'neutral' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ $trend, theme }) => {
    switch ($trend) {
      case 'up': return theme.colors.status.success;
      case 'down': return theme.colors.status.error;
      default: return theme.colors.text.muted;
    }
  }};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

interface StatCardProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  customIndex?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  iconColor,
  trend = 'neutral',
  trendValue,
  customIndex = 0,
  onClick
}) => {
  return (
    <GlassmorphicCard
      customIndex={customIndex}
      onClick={onClick}
      hover={true}
      glow={trend === 'up'}
    >
      <StatContent>
        {icon && (
          <StatIcon $color={iconColor}>
            {icon}
          </StatIcon>
        )}
        <StatValue>
          <AnimatedCounter value={value} />
        </StatValue>
        <StatLabel>{label}</StatLabel>
        {trend !== 'neutral' && trendValue && (
          <TrendIndicator $trend={trend}>
            {trend === 'up' ? '↗' : '↘'} {trendValue}
          </TrendIndicator>
        )}
      </StatContent>
    </GlassmorphicCard>
  );
};

export default StatCard;
