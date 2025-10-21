import React, { useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAllIncidents, fetchIncidents, selectIncidentsStatus, selectIncidentsError } from
'../incidentsSlice';
import { AiDetection, ThreatLevel } from '../../../common/types'; // Make sure AiDetection is imported
import { AlertCircle, Calendar, Camera as CameraIcon, Users, Loader } from 'react-feather';
import { theme as appTheme } from '../../../common/styles/theme'; // Renamed import to avoid conflict with useTheme hook result

const PageContainer = styled(motion.div)`
display: flex; flex-direction: column;
gap: ${({ theme }) => theme.spacing.lg};
`;
const Header = styled.div`
margin-bottom: ${({ theme }) => theme.spacing.md};
`;
const Title = styled.h1`
font-size: ${({ theme }) => theme.fontSizes['3xl']};
font-weight: 700;
color: ${({ theme }) => theme.colors.text.primary};
`;
const Subtitle = styled.p`
font-size: ${({ theme }) => theme.fontSizes.lg};
color: ${({ theme }) => theme.colors.text.secondary};
`;
const IncidentsGrid = styled(motion.div)`
display: grid;
grid-template-columns: 1fr;
gap: ${({ theme }) => theme.spacing.lg};
@media (min-width: ${({ theme }) => theme.breakpoints.md}) { grid-template-columns: repeat(2, 1fr); }
@media (min-width: ${({ theme }) => theme.breakpoints.xl}) { grid-template-columns: repeat(3, 1fr); }
`;
const IncidentCardContainer = styled(motion.div)<{ $levelColor: string }>`
background-color: ${({ theme }) => theme.colors.background.secondary};
border: 1px solid ${({ theme }) => theme.colors.border};
border-radius: ${({ theme }) => theme.borderRadius.xl};
box-shadow: ${({ theme }) => theme.shadows.md};
overflow: hidden; display: flex; flex-direction: column;
transition: transform ${({ theme }) => theme.transitions.base}, box-shadow ${({ theme }) =>
theme.transitions.base};
border-left: 5px solid ${({ $levelColor }) => $levelColor};
&:hover {
transform: translateY(-5px);
box-shadow: ${({ theme }) => theme.shadows.xl};
border-color: ${({ $levelColor }) => $levelColor};
}
`;
const Thumbnail = styled.div`
width: 100%; aspect-ratio: 16/9; background-color: #000;
display: flex; align-items: center; justify-content: center;
color: ${({ theme }) => theme.colors.text.muted};
cursor: pointer; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
img { width: 100%; height: 100%; object-fit: cover; }
svg { width: 25%; height: 25%; opacity: 0.3; }
`;
const Content = styled.div`
padding: ${({ theme }) => theme.spacing.lg};
flex-grow: 1; display: flex; flex-direction: column;
gap: ${({ theme }) => theme.spacing.md};
`;
const CardHeader = styled.div`
display: flex; justify-content: space-between; align-items: flex-start;
`;
const ThreatBadge = styled.span<{ $color: string, $bgColor: string }>`
padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
border-radius: ${({ theme }) => theme.borderRadius.full};
font-size: ${({ theme }) => theme.fontSizes.xs};
font-weight: 700; text-transform: uppercase;
background-color: ${({ $bgColor }) => $bgColor};
color: ${({ $color }) => $color};
flex-shrink: 0;
`;
const MetaInfo = styled.div`
display: flex; flex-direction: column;
gap: ${({ theme }) => theme.spacing.sm};
`;
const MetaItem = styled.div`
display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.sm};
font-size: ${({ theme }) => theme.fontSizes.sm};
color: ${({ theme }) => theme.colors.text.secondary};
svg { width: 16px; height: 16px; color: ${({ theme }) => theme.colors.accent.primary}; flex-shrink: 0; }
`;
const ReportText = styled.p`
font-size: ${({ theme }) => theme.fontSizes.sm};
color: ${({ theme }) => theme.colors.text.primary};
line-height: 1.5; font-style: italic;
display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
overflow: hidden; text-overflow: ellipsis; flex-grow: 1;
`;
const TagsList = styled.div`
margin-top: auto; padding-top: ${({ theme }) => theme.spacing.sm};
border-top: 1px solid ${({ theme }) => theme.colors.border};
display: flex; flex-wrap: wrap;
gap: ${({ theme }) => theme.spacing.xs};
`;
const Tag = styled.span`
background-color: ${({ theme }) => theme.colors.background.surface};
border-radius: ${({ theme }) => theme.borderRadius.sm};
padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.xs};
font-size: ${({ theme }) => theme.fontSizes.xs};
color: ${({ theme }) => theme.colors.text.secondary};
`;
const StateMessage = styled(motion.div)`
grid-column: 1 / -1; text-align: center;
padding: ${({ theme }) => theme.spacing['2xl']};
color: ${({ theme }) => theme.colors.text.muted};
font-size: ${({ theme }) => theme.fontSizes.lg};
display: flex;
flex-direction: column; align-items: center;
gap: ${({ theme }) => theme.spacing.md};
svg { width: 48px; height: 48px; }
`;
const containerVariants = {
hidden: { opacity: 0 },
visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
hidden: { opacity: 0, y: 20, scale: 0.95 },
visible: { opacity: 1, y: 0, scale: 1 },
};
interface IncidentCardProps { detection: AiDetection; }
const IncidentCard: React.FC<IncidentCardProps> = ({ detection }) => {
// Use the imported appTheme here
const level = (detection.threat_level || 'unknown').toLowerCase() as keyof typeof appTheme.colors.threat;
const levelColor = appTheme.colors.threat[level] || appTheme.colors.text.muted;
const isHighThreat = ['critical', 'high'].includes(level);
return (
<IncidentCardContainer $levelColor={levelColor} variants={itemVariants} layout>
<Thumbnail onClick={() => window.open(`http://localhost:5001/${detection.image_path}`)}>
{detection.image_path ? (
<img src={`http://localhost:5001/${detection.image_path}`} alt={`Snapshot for ${detection.camera_id}`} />
) : (<CameraIcon />)}
</Thumbnail>
<Content>
<CardHeader>
{/* Use appTheme here as well */}
<MetaItem style={{ flex: 1, minWidth: 0, gap: appTheme.spacing.xs }}>
<CameraIcon />
<span style={{ fontWeight: 600, color: appTheme.colors.text.primary, whiteSpace: 'nowrap',
overflow: 'hidden', textOverflow: 'ellipsis' }}>
{detection.camera_id}
</span>
</MetaItem>
<ThreatBadge $color={isHighThreat ? '#FFFFFF' : '#000000'} $bgColor={levelColor}>
{detection.threat_level}
</ThreatBadge>
</CardHeader>
<MetaInfo>
<MetaItem>
<Calendar />
<span>{new Date(detection.timestamp).toLocaleString()}</span>
</MetaItem>
{detection.yolo_alerts?.some(alert => alert.toLowerCase().includes("person")) && (
<MetaItem> <Users /> <span>Person(s) detected</span> </MetaItem>
)}
</MetaInfo>
{/* Correctly terminated string concatenation */}
<ReportText title={detection.llm_report}>{detection.llm_report || "No analysis available."}</ReportText>
{detection.yolo_alerts && detection.yolo_alerts.length > 0 && (
<TagsList>
{detection.yolo_alerts.map((alert, index) => (
<Tag key={index}>{alert}</Tag>
))}
</TagsList>
)}
</Content>
</IncidentCardContainer>
);
};
const IncidentsPage: React.FC = () => {
const dispatch = useAppDispatch();
const allIncidents = useAppSelector(selectAllIncidents);
const status = useAppSelector(selectIncidentsStatus);
const error = useAppSelector(selectIncidentsError);
const theme = useTheme(); // Use the hook here
useEffect(() => {
if (status === 'idle') {
console.log("[IncidentsPage] Fetching initial incidents...");
dispatch(fetchIncidents());
}
}, [status, dispatch]);
return (
<PageContainer>
<Header>
<Title>Incidents Log</Title>
<Subtitle>Complete history of all detected incidents</Subtitle>
</Header>
<AnimatePresence>
{status === 'loading' && (
<StateMessage key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{
opacity: 0 }}>
<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease:
'linear' }}>
<Loader />
</motion.div>
Loading incidents...
</StateMessage>
)}
{status === 'failed' && (
// Use the theme variable from the hook
<StateMessage key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity:
0 }} style={{ color: theme.colors.status.error }}>
<AlertCircle />
{error || "Failed to load incidents."}
</StateMessage>
)}
</AnimatePresence>
{(status === 'succeeded' || (status === 'idle' && allIncidents.length > 0)) && (
<IncidentsGrid variants={containerVariants} initial="hidden" animate="visible">
{/* Comparison is okay, but TS flags it as potentially always false based on flow */}
{allIncidents.length === 0 && status !== 'loading' ? (
<StateMessage key="empty" style={{ gridColumn: '1 / -1' }}>No incidents found in the
database.</StateMessage>
) : (
// Add : AiDetection here
allIncidents.map((det: AiDetection) => (
<IncidentCard key={det.id} detection={det} />
))
)}
</IncidentsGrid>
)}
</PageContainer>
);
};
export default IncidentsPage;

