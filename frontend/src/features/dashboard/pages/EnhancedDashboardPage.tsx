import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAllIncidents, selectRecentIncidents, fetchIncidents, selectIncidentsStatus } from '../../incidents/incidentsSlice';
import { updateChartData, selectAlertFrequency, selectThreatDistribution } from '../dashboardSlice';
import SystemStatusWidget from '../components/SystemStatusWidget';
import BaseCard from '../../../common/components/Cards/BaseCard';
import AlertFrequencyChart from '../../../common/components/Charts/AlertFrequencyChart';
import ThreatDistributionChart from '../../../common/components/Charts/ThreatDistributionChart';
import RecentAlertsWidget from '../components/RecentAlertsWidget';
import CameraPreviewGrid from '../components/CameraPreviewGrid';
import RealTimeCharts from '../components/RealTimeCharts';
import { BarChart2, PieChart, Activity, Camera, AlertTriangle, Shield, Zap } from 'react-feather';
import { selectCurrentUser } from '../../auth/authSlice';
import ParticleBackground from '../../../common/components/Effects/ParticleBackground';
import StatCard from '../../../common/components/Cards/StatCard';
import GlassmorphicCard from '../../../common/components/Cards/GlassmorphicCard';

const DashboardContainer = styled(motion.div)`
  display: flex; 
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  position: relative;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Title = styled.h1`
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
  margin: 0;
  text-shadow: 0 0 30px ${({ theme }) => theme.colors.glow.primary};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0 0 0;
  font-weight: 300;
  letter-spacing: 0.05em;
`;

const StatsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MainGrid = styled.div`
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

const RealTimeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  .live-indicator {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.status.success};
    font-weight: 600;
  }
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.status.success};
  border-radius: 50%;
  animation: pulse 2s infinite;
`;

const EnhancedDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const allIncidents = useAppSelector(selectAllIncidents);
  const recentIncidents = useAppSelector((state) => selectRecentIncidents(state, 5));
  const incidentsStatus = useAppSelector(selectIncidentsStatus);
  const alertFrequencyData = useAppSelector(selectAlertFrequency);
  const threatDistributionData = useAppSelector(selectThreatDistribution);

  useEffect(() => {
    if (incidentsStatus === 'idle') {
      console.log("[EnhancedDashboardPage] Fetching initial incidents...");
      dispatch(fetchIncidents() as any);
    }
  }, [incidentsStatus, dispatch]);

  useEffect(() => {
    if (incidentsStatus === 'succeeded' || allIncidents.length > 0) {
      dispatch(updateChartData(allIncidents));
    }
  }, [allIncidents, incidentsStatus, dispatch]);

  // Calculate stats
  const totalAlerts = allIncidents.length;
  const activeCameras = new Set(allIncidents.map(incident => incident.camera_id)).size;
  const criticalThreats = allIncidents.filter(incident => 
    ['critical', 'high'].includes(incident.threat_level?.toLowerCase() || '')
  ).length;
  const systemHealth = Math.max(0, 100 - (criticalThreats * 10));

  return (
    <DashboardContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Background Effects */}
      <ParticleBackground particleCount={40} />
      
      <Header>
        <Title>Command Center</Title>
        <Subtitle>Welcome back, {currentUser?.username || 'Operator'}. System status: Operational</Subtitle>
      </Header>

      {/* Real-Time Analytics Section */}
      <RealTimeSection>
        <SectionTitle>
          <Zap size={24} />
          Real-Time Analytics
          <div className="live-indicator">
            <PulseDot />
            LIVE
          </div>
        </SectionTitle>
        <RealTimeCharts />
      </RealTimeSection>

      {/* Legacy Stats Cards */}
      <StatsGrid>
        <StatCard
          value={totalAlerts}
          label="Total Alerts"
          icon={<AlertTriangle size={24} />}
          iconColor="#FF3B30"
          trend={totalAlerts > 0 ? 'up' : 'neutral'}
          trendValue={totalAlerts > 0 ? '+12%' : '0%'}
          customIndex={0}
        />
        <StatCard
          value={activeCameras}
          label="Active Cameras"
          icon={<Camera size={24} />}
          iconColor="#00D9FF"
          trend="neutral"
          customIndex={1}
        />
        <StatCard
          value={criticalThreats}
          label="Critical Threats"
          icon={<Shield size={24} />}
          iconColor="#FF6B35"
          trend={criticalThreats > 0 ? 'up' : 'neutral'}
          trendValue={criticalThreats > 0 ? 'Active' : 'None'}
          customIndex={2}
        />
        <StatCard
          value={systemHealth}
          label="System Health"
          icon={<Activity size={24} />}
          iconColor={systemHealth > 80 ? '#00FF88' : systemHealth > 60 ? '#FFD700' : '#FF3B30'}
          trend={systemHealth > 80 ? 'up' : systemHealth < 60 ? 'down' : 'neutral'}
          trendValue={`${systemHealth}%`}
          customIndex={3}
        />
      </StatsGrid>

      {/* Main Dashboard Grid */}
      <MainGrid>
        <div className="system-status">
          <SystemStatusWidget customIndex={0} />
        </div>
        <div className="alert-frequency">
          <GlassmorphicCard 
            headerIcon={<BarChart2 size={20} />} 
            headerTitle="Alert Frequency (Last Hour)" 
            customIndex={1}
            glow={true}
          >
            <AlertFrequencyChart data={alertFrequencyData} />
          </GlassmorphicCard>
        </div>
        <div className="threat-distribution">
          <GlassmorphicCard 
            headerIcon={<PieChart size={20} />} 
            headerTitle="Threat Distribution (Today)" 
            customIndex={2}
            glow={true}
          >
            <ThreatDistributionChart data={threatDistributionData} />
          </GlassmorphicCard>
        </div>
        <div className="camera-grid">
          <CameraPreviewGrid customIndex={3} />
        </div>
        <div className="recent-alerts">
          <RecentAlertsWidget alerts={recentIncidents} customIndex={4} />
        </div>
      </MainGrid>
    </DashboardContainer>
  );
};

export default EnhancedDashboardPage;

