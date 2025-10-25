import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from 'styled-components';
import { ThreatDistributionDataPoint } from '../../types';  // Fixed import path

interface ChartProps { data: ThreatDistributionDataPoint[]; }

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  const theme = useTheme();
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      backgroundColor: theme.colors.background.elevated, 
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md, 
      boxShadow: theme.shadows.lg,
      padding: theme.spacing.md, 
      color: theme.colors.text.primary,
    }}>
      <p style={{ margin: 0, fontSize: theme.fontSizes.sm, fontWeight: 600 }}>
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
};

const ThreatDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const theme = useTheme();
  
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        color: theme.colors.text.muted,
        fontSize: theme.fontSizes.sm
      }}>
        No threat data available
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="50%" 
            outerRadius="70%" 
            dataKey="value" 
            label={(entry) => entry.name}
            labelLine={{ stroke: theme.colors.text.muted }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span style={{ color: theme.colors.text.secondary }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ThreatDistributionChart;
