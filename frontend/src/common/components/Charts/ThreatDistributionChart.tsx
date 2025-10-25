import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from 'styled-components';
import { ThreatDistributionDataPoint } from '../../../common/types';
import styled from 'styled-components';

interface ChartProps { data: ThreatDistributionDataPoint[]; }

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

const TooltipValue = styled.p<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.base};
  text-shadow: 0 0 10px ${({ $color }) => $color}40;
  margin: 0;
`;

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <TooltipContainer>
        <TooltipValue $color={data.fill}>
          {`${data.name}: ${data.value}`}
        </TooltipValue>
      </TooltipContainer>
    );
  }
  return null;
};

const LegendContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LegendItem = styled.li<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.surface};
    box-shadow: 0 0 15px ${({ $color }) => $color}40;
  }
`;

const LegendDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 8px ${({ $color }) => $color}60;
  ${({ $color }) => $color === '#FF3B30' && `
    ${({ theme }) => theme.animations.pulse}
  `}
`;

const RenderLegend: React.FC<any> = (props) => {
  const { payload } = props;
  return (
    <LegendContainer>
      {payload.map((entry: any, index: number) => (
        <LegendItem key={`item-${index}`} $color={entry.color}>
          <LegendDot $color={entry.color} />
          {entry.value} ({entry.payload.value})
        </LegendItem>
      ))}
    </LegendContainer>
  );
};

const ChartContainer = styled(motion.div)`
  width: 100%;
  height: 250px;
  position: relative;
  overflow: hidden;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &::before {
    content: '📊';
    font-size: 2rem;
    opacity: 0.5;
  }
`;

const ThreatDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const theme = useTheme();
  const noData = data.length === 0;

  return (
    <ChartContainer
      key={data.map(d => d.value).join('-')}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {noData ? (
          <EmptyState>
            No threat data for today yet.
          </EmptyState>
        ) : (
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data as any[]}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              dataKey="value"
              paddingAngle={3}
              cornerRadius={6}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  stroke={theme.colors.background.secondary}
                  strokeWidth={2}
                  style={{
                    filter: `drop-shadow(0 0 8px ${entry.fill}60)`,
                  }}
                />
              ))}
            </Pie>
            <Legend content={<RenderLegend />} verticalAlign="bottom" />
          </PieChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ThreatDistributionChart;
