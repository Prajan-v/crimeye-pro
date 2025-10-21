import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from 'styled-components';
import { AlertFrequencyDataPoint } from '../../common/types';
interface ChartProps { data: AlertFrequencyDataPoint[]; }
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
const theme = useTheme();
if (active && payload && payload.length) {
return (
<div style={{
backgroundColor: theme.colors.background.elevated, border: `1px solid
${theme.colors.border}`,
borderRadius: theme.borderRadius.md, boxShadow: theme.shadows.lg,
padding: theme.spacing.md, color: theme.colors.text.primary,
}}>
<p style={{
fontSize: theme.fontSizes.sm, color: theme.colors.text.secondary, marginBottom:
theme.spacing.sm,
borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: theme.spacing.sm,
}}>{`Time: ${label}`}</p>
<p style={{ color: theme.colors.accent.primary, fontWeight: 600 }}>
{`Alerts: ${payload[0].value}`}
</p>
</div>
);
}
return null;
};
const AlertFrequencyChart: React.FC<ChartProps> = ({ data }) => {
const theme = useTheme();
return (
<motion.div style={{ width: '100%', height: 250 }}
key={data.length > 0 ? data.map(d => d.count).join('-') : 'empty'}
initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
>
<ResponsiveContainer width="100%" height="100%">
<BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
<CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" vertical={false} />
<XAxis dataKey="time" stroke={theme.colors.text.muted} fontSize={theme.fontSizes.xs}
tickLine={false} axisLine={false} />
<YAxis stroke={theme.colors.text.muted} fontSize={theme.fontSizes.xs} tickLine={false}
axisLine={false} allowDecimals={false} width={30} />
<Tooltip cursor={{ fill: 'rgba(0, 169, 165, 0.1)' }} content={<CustomTooltip />} />
<Bar dataKey="count" fill={theme.colors.accent.primary} radius={[4, 4, 0, 0]} barSize={20}
animationDuration={500} />
</BarChart>
</ResponsiveContainer>
</motion.div>
);
};
export default AlertFrequencyChart;
