import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from 'styled-components';
import { AlertFrequencyDataPoint } from '../../../common/types';
import styled from 'styled-components';

interface ChartProps { data: AlertFrequencyDataPoint[]; }

const TooltipContainer = styled.div`
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
`;

const TooltipHeader = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 500;
`;

const TooltipValue = styled.p`
  color: ${({ theme }) => theme.colors.accent.primary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.base};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.glow.primary};
`;

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <TooltipHeader>{`Time: ${label}`}</TooltipHeader>
        <TooltipValue>{`Alerts: ${payload[0].value}`}</TooltipValue>
      </TooltipContainer>
    );
  }
  return null;
};

const ChartContainer = styled(motion.div)`
  width: 100%;
  height: 250px;
  position: relative;
  overflow: hidden;
  
  /* Glowing grid lines */
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: ${({ theme }) => theme.colors.border};
    stroke-dasharray: 3 3;
    filter: drop-shadow(0 0 2px ${({ theme }) => theme.colors.glow.primary});
  }
  
  /* Glowing axes */
  .recharts-xAxis .recharts-text,
  .recharts-yAxis .recharts-text {
    fill: ${({ theme }) => theme.colors.text.muted};
    filter: drop-shadow(0 0 4px ${({ theme }) => theme.colors.glow.primary});
  }
`;

const AlertFrequencyChart: React.FC<ChartProps> = ({ data }) => {
  const theme = useTheme();
  
  return (
    <ChartContainer
      key={data.length > 0 ? data.map(d => d.count).join('-') : 'empty'}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid 
            stroke={theme.colors.border} 
            strokeDasharray="3 3" 
            vertical={false}
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="time" 
            stroke={theme.colors.text.muted} 
            fontSize={theme.fontSizes.xs} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: theme.colors.text.muted }}
          />
          <YAxis 
            stroke={theme.colors.text.muted} 
            fontSize={theme.fontSizes.xs} 
            tickLine={false} 
            axisLine={false} 
            allowDecimals={false} 
            width={30}
            tick={{ fill: theme.colors.text.muted }}
          />
          <Tooltip 
            cursor={{ 
              fill: theme.colors.accent.primary + '20',
              stroke: theme.colors.accent.primary,
              strokeWidth: 1,
              strokeDasharray: '5 5'
            }} 
            content={<CustomTooltip />} 
          />
          <Bar 
            dataKey="count" 
            fill={`url(#gradient-${Math.random().toString(36).substr(2, 9)})`}
            radius={[6, 6, 0, 0]} 
            barSize={24} 
            animationDuration={800}
            animationEasing="ease-out"
          />
          <defs>
            <linearGradient id={`gradient-${Math.random().toString(36).substr(2, 9)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.accent.primary} />
              <stop offset="100%" stopColor={theme.colors.accent.secondary} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default AlertFrequencyChart;
