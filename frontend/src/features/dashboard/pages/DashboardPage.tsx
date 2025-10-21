import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAllIncidents, selectRecentIncidents, fetchIncidents, selectIncidentsStatus } from
'../../incidents/incidentsSlice';
import { updateChartData, selectAlertFrequency, selectThreatDistribution } from '../dashboardSlice';
import SystemStatusWidget from '../components/SystemStatusWidget';
import BaseCard from '../../../common/components/Cards/BaseCard';
import AlertFrequencyChart from '../../../common/components/Charts/AlertFrequencyChart';
import ThreatDistributionChart from '../../../common/components/Charts/ThreatDistributionChart';
import RecentAlertsWidget from '../components/RecentAlertsWidget';
import CameraPreviewGrid from '../components/CameraPreviewGrid';
import { BarChart2, PieChart } from 'react-feather';
import { selectCurrentUser } from '../../auth/authSlice';
const DashboardContainer = styled(motion.div)`
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
const Grid = styled.div`
display: grid;
gap: ${({ theme }) => theme.spacing.lg};
grid-template-columns: 1fr;
@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
grid-template-columns: repeat(2, 1fr);
.system-status, .camera-grid, .recent-alerts { grid-column: 1 / -1; }
}
@media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
grid-template-columns: repeat(3, 1fr);
.system-status, .alert-frequency, .threat-distribution { grid-column: span 1; }
.camera-grid { grid-column: 1 / -1; }
.recent-alerts { grid-column: 1 / -1; }
}
@media (min-width: 1536px) {
grid-template-columns: repeat(4, 1fr);
.system-status { grid-column: 1 / 2; grid-row: 1 / 2; }
.alert-frequency { grid-column: 2 / 3; grid-row: 1 / 2; }
.threat-distribution { grid-column: 3 / 4; grid-row: 1 / 2; }
.recent-alerts { grid-column: 4 / 5; grid-row: 1 / 3; }
.camera-grid { grid-column: 1 / 4; grid-row: 2 / 3; }
}
`;
const DashboardPage: React.FC = () => {
const dispatch = useAppDispatch();
const currentUser = useAppSelector(selectCurrentUser);
const allIncidents = useAppSelector(selectAllIncidents);
const recentIncidents = useAppSelector((state) => selectRecentIncidents(state, 5));
const incidentsStatus = useAppSelector(selectIncidentsStatus);
const alertFrequencyData = useAppSelector(selectAlertFrequency);
const threatDistributionData = useAppSelector(selectThreatDistribution);
useEffect(() => {
if (incidentsStatus === 'idle') {
console.log("[DashboardPage] Fetching initial incidents...");
dispatch(fetchIncidents());
}
}, [incidentsStatus, dispatch]);
useEffect(() => {
if (incidentsStatus === 'succeeded' || allIncidents.length > 0) {
dispatch(updateChartData(allIncidents));
}
}, [allIncidents, incidentsStatus, dispatch]);
return (
<DashboardContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
<Header>
<Title>Dashboard</Title>
<Subtitle>Welcome back, {currentUser?.username || 'Operator'}.</Subtitle>
</Header>
<Grid>
<div className="system-status"> <SystemStatusWidget customIndex={0} /> </div>
<div className="alert-frequency">
<BaseCard headerIcon={<BarChart2 size={20} />} headerTitle="Alert Frequency (Last Hour)"
customIndex={1}>
<AlertFrequencyChart data={alertFrequencyData} />
</BaseCard>
</div>
<div className="threat-distribution">
<BaseCard headerIcon={<PieChart size={20} />} headerTitle="Threat Distribution (Today)"
customIndex={2}>
<ThreatDistributionChart data={threatDistributionData} />
</BaseCard>
</div>
<div className="camera-grid"> <CameraPreviewGrid customIndex={3} /> </div>
<div className="recent-alerts"> <RecentAlertsWidget alerts={recentIncidents} customIndex={4}
/> </div>
</Grid>
</DashboardContainer>
);
};
export default DashboardPage;
