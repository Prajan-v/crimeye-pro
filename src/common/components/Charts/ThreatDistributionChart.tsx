import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from 'styled-components';
import { ThreatDistributionDataPoint } from '../../types';
interface ChartProps { data: ThreatDistributionDataPoint[]; }
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
const theme = useTheme();
if (active && payload && payload.length) {
const data = payload[0].payload;
return (
<div style={{
backgroundColor: theme.colors.background.elevated, border: `1px solid
${theme.colors.border}`,
borderRadius: theme.borderRadius.md, boxShadow: theme.shadows.lg,
padding: theme.spacing.md, color: theme.colors.text.primary,
}}>
<p style={{ color: data.fill, fontWeight: 600, fontSize: theme.fontSizes.sm }}>
{`${data.name}: ${data.value}`}
</p>
</div>
);
}
return null;
};
const renderLegend = (props: any) => {
const { payload } = props;
const theme = useTheme();
return (
<ul style={{ listStyle: 'none', margin: 0, padding: `0 ${theme.spacing.md}`, textAlign: 'center',
marginTop: theme.spacing.md }}>
{payload.map((entry: any, index: number) => (
<li key={`item-${index}`} style={{
color: entry.color, fontSize: theme.fontSizes.sm,
display: 'inline-block', marginRight: theme.spacing.md, fontWeight: 500,
}}>
<span style={{
display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
backgroundColor: entry.color, marginRight: theme.spacing.sm, verticalAlign: 'middle',
}}></span>
{entry.value} ({entry.payload.value})
</li>
))}
</ul>
);
};
const ThreatDistributionChart: React.FC<ChartProps> = ({ data }) => {
const theme = useTheme();
const noData = data.length === 0;
return (
<motion.div style={{ width: '100%',
height: 250 }}
key={data.map(d => d.value).join('-')}
initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
>
<ResponsiveContainer width="100%" height="100%">
{noData ? (
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color:
theme.colors.text.muted, fontSize: theme.fontSizes.sm }}>
No threat data for today yet.
</div>
) : (
<PieChart>
<Tooltip content={<CustomTooltip />} />
<Pie
data={data as any[]} cx="50%" cy="50%"
innerRadius="60%" outerRadius="80%"
dataKey="value" paddingAngle={5} cornerRadius={theme.borderRadius.md}
animationDuration={800}
>
{data.map((entry, index) => (
<Cell key={`cell-${index}`} fill={entry.fill} stroke={theme.colors.background.secondary} />
))}
</Pie>
<Legend content={renderLegend} verticalAlign="bottom" />
</PieChart>
)}
</ResponsiveContainer>
</motion.div>
);
};
export default ThreatDistributionChart;
