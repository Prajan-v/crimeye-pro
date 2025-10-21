import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Video, WifiOff } from 'react-feather';
import BaseCard from '../../../common/components/Cards/BaseCard';
const Grid = styled(motion.div)`
display: grid;
grid-template-columns: 1fr;
gap: ${({ theme }) => theme.spacing.md};
@media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
grid-template-columns: repeat(2, 1fr);
}
`;
const CameraCard = styled(motion.div)`
background-color: ${({ theme }) => theme.colors.background.surface};
border-radius: ${({ theme }) => theme.borderRadius.md};
border: 1px solid ${({ theme }) => theme.colors.border};
overflow: hidden;
box-shadow: ${({ theme }) => theme.shadows.sm};
transition: transform ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) =>
theme.transitions.fast};
cursor: pointer;
&:hover {
transform: translateY(-4px);
box-shadow: ${({ theme }) => theme.shadows.lg};
border-color: ${({ theme }) => theme.colors.accent.primary};
}
`;
const Placeholder = styled.div<{ $status: 'live' | 'offline' }>`
width: 100%; aspect-ratio: 16/9; background-color: #000;
display: flex; flex-direction: column; align-items: center; justify-content: center;
color: ${({ theme }) => theme.colors.text.muted};
border-bottom: 1px solid ${({ theme }) => theme.colors.border};
position: relative;
svg { width: 30%; height: 30%; max-width: 60px; opacity: 0.3; }
&::after {
content: '${({ $status }) => $status.toUpperCase()}';
position: absolute;
top: ${({ theme }) => theme.spacing.sm};
right: ${({ theme }) => theme.spacing.sm};
padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
border-radius: ${({ theme }) => theme.borderRadius.sm};
font-size: ${({ theme }) => theme.fontSizes.xs};
font-weight: 600;
color: #FFFFFF;
background-color: ${({ theme, $status }) => $status === 'live' ? theme.colors.status.error :
theme.colors.text.muted};
opacity: 0.9;
text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
`;
const InfoBar = styled.div`
padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
background-color: ${({ theme }) => theme.colors.background.surface};
color: ${({ theme }) => theme.colors.text.primary};
font-weight: 500; font-size: ${({ theme }) => theme.fontSizes.sm};
white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
const gridVariants = {
hidden: { opacity: 0 },
visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
hidden: { opacity: 0, y: 20, scale: 0.95 },
visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};
const cameras = [
{ id: 'CAM_01', name: 'Keller Kamera 1', status: 'live' },
{ id: 'CAM_02', name: 'Keller Kamera 2', status: 'live' },
{ id: 'CAM_03', name: 'Keller Kamera 3', status: 'live' },
{ id: 'CAM_04', name: 'Warehouse Entry', status: 'offline' },
{ id: 'CAM_05', name: 'Main Lobby', status: 'live' },
{ id: 'CAM_06', name: 'Parking Lot', status: 'live' },
];
interface CameraPreviewGridProps { customIndex?: number; }
const CameraPreviewGrid: React.FC<CameraPreviewGridProps> = ({ customIndex }) => {
return (
<BaseCard
headerIcon={<Video size={20} />}
headerTitle="Live Camera Feeds"
customIndex={customIndex}
>
<Grid variants={gridVariants} initial="hidden" animate="visible">
{cameras.map((cam) => (
<CameraCard key={cam.id} variants={cardVariants} title={`View ${cam.name}`}>
<Placeholder $status={cam.status as 'live' | 'offline'}>
{cam.status === 'live' ? <Video /> : <WifiOff />}
</Placeholder>
<InfoBar>{cam.name}</InfoBar>
</CameraCard>
))}
</Grid>
</BaseCard>
);
};
export default CameraPreviewGrid;
