import React from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, ChevronRight } from 'react-feather';
import BaseCard, { CardContent } from '../../../common/components/Cards/BaseCard';
import { AiDetection, ThreatLevel } from '../../../common/types';
import { Link } from 'react-router-dom';
import { theme as appTheme } from '../../../common/styles/theme';
const AlertList = styled(motion.div)`
display: flex; flex-direction: column;
gap: ${({ theme }) => theme.spacing.md};
`;
const AlertItem = styled(motion.div)<{ $levelColor: string }>`
display: flex; gap: ${({ theme }) => theme.spacing.sm};
background-color: ${({ theme }) => theme.colors.background.surface};
border-radius: ${({ theme }) => theme.borderRadius.md};
padding: ${({ theme }) => theme.spacing.sm};
border-left: 4px solid ${({ $levelColor }) => $levelColor};
overflow: hidden; cursor: pointer;
transition: background-color ${({ theme }) => theme.transitions.fast};
&:hover { background-color: ${({ theme }) => theme.colors.background.elevated}; }
`;
const AlertIcon = styled.div<{ $levelColor: string }>`
flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
display: flex; align-items: center; justify-content: center;
background-color: ${({ $levelColor }) => $levelColor}20;
color: ${({ $levelColor }) => $levelColor};
`;
const AlertInfo = styled.div` flex: 1; min-width: 0;`;
const AlertHeader = styled.div`
display: flex; justify-content: space-between; align-items: center;
`;
const AlertTitle = styled.div`
font-weight: 600; color: ${({ theme }) => theme.colors.text.primary};
font-size: ${({ theme }) => theme.fontSizes.sm};
white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
const AlertTimestamp = styled.div`
display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.xs};
font-size: ${({ theme }) => theme.fontSizes.xs};
color: ${({ theme }) => theme.colors.text.muted};
flex-shrink: 0;
`;
const AlertReport = styled.p`
font-size: ${({ theme }) => theme.fontSizes.sm};
color: ${({ theme }) => theme.colors.text.secondary};
white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
margin-top: ${({ theme }) => theme.spacing.xs};
`;
const EmptyState = styled.div`
display: flex; justify-content: center; align-items: center;
height: 100%; min-height: 100px;
color: ${({ theme }) => theme.colors.text.muted};
font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const ViewAllLink = styled(Link)`
display: flex; align-items: center; justify-content: center;
gap: ${({ theme }) => theme.spacing.xs}; font-size: ${({ theme }) => theme.fontSizes.sm};
font-weight: 500;
color: ${({ theme }) => theme.colors.text.secondary};
margin-top: ${({ theme }) => theme.spacing.md};
padding: ${({ theme }) => theme.spacing.sm};
border-radius: ${({ theme }) => theme.borderRadius.md};
&:hover {
background-color: ${({ theme }) => theme.colors.background.surface};
color: ${({ theme }) => theme.colors.accent.primary};
}
`;
const itemVariants = {
hidden: { opacity: 0, y: 20 },
visible: { opacity: 1, y: 0 },
exit: { opacity: 0, x: -30, transition: { duration: 0.2 } }
};
const getThreatColor = (level: ThreatLevel): string => {
return appTheme.colors.threat[(level || 'unknown').toLowerCase() as keyof typeof
appTheme.colors.threat] || appTheme.colors.text.muted;
};
const formatTime = (timestamp: string) => {
try {
const date = new Date(timestamp);
const today = new Date();
if (date.toDateString() === today.toDateString()) {
return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
} catch (e) { return "Invalid Date"; }
};
interface RecentAlertsWidgetProps { alerts: AiDetection[]; customIndex?: number; }
const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({ alerts, customIndex }) => {
return (
<BaseCard
headerIcon={<AlertTriangle size={20} />}
headerTitle="Recent Alerts"
customIndex={customIndex}
contentNoPadding={true}
>
<CardContent $noPadding={true} style={{ display: 'flex', flexDirection: 'column' }}>
<AlertList style={{ padding: appTheme.spacing.lg, paddingBottom: 0, flex: 1, minHeight: 0,
overflowY: 'auto' }}>
<AnimatePresence>
{alerts.length === 0 && (<EmptyState>No recent alerts.</EmptyState>)}
{alerts.map((alert) => {
const levelColor = getThreatColor(alert.threat_level);
return (
<AlertItem
key={alert.id} $levelColor={levelColor}
variants={itemVariants} initial="hidden" animate="visible" exit="exit"
layout transition={{ type: 'spring', stiffness: 300, damping: 25 }}
title={`Click to view details for ${alert.camera_id}`}
>
<AlertIcon $levelColor={levelColor}> <AlertTriangle size={16} /> </AlertIcon>
<AlertInfo>
<AlertHeader>
<AlertTitle>{alert.camera_id}</AlertTitle>
<AlertTimestamp> <Clock size={12} /> {formatTime(alert.timestamp)} </AlertTimestamp>
</AlertHeader>
<AlertReport title={alert.llm_report}>
{alert.llm_report || "No summary provided."}
</AlertReport>
</AlertInfo>
</AlertItem>
);
})}
</AnimatePresence>
</AlertList>
<ViewAllLink to="/incidents" style={{ flexShrink: 0, padding: appTheme.spacing.md }}>
View All Incidents <ChevronRight size={16} />
</ViewAllLink>
</CardContent>
</BaseCard>
);
};
export default RecentAlertsWidget;
