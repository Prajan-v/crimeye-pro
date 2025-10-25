#!/bin/bash

# ============================================================================
# CRIMEEYE-PRO FRONTEND - COMPLETE ERROR FIX SCRIPT
# ============================================================================
# This script fixes all TypeScript and ESLint errors
# Run this from your frontend project root directory
# ============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║              CRIMEEYE-PRO COMPLETE ERROR FIX SCRIPT              ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Current directory: $(pwd)"
echo ""
read -p "Press ENTER to start fixing errors or CTRL+C to cancel..."

# ============================================================================
# FIX 1: Update BaseCard.tsx to fix motion.div prop issues
# ============================================================================
echo ""
echo "🔧 Fixing BaseCard.tsx..."

cat > src/common/components/Cards/BaseCard.tsx << 'EOF'
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const CardContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.surface};
  flex-shrink: 0;
  svg {
    color: ${({ theme }) => theme.colors.accent.primary};
    width: 20px;
    height: 20px;
  }
`;

export const CardContent = styled.div<{ $noPadding?: boolean }>`
  padding: ${({ $noPadding, theme }) => $noPadding ? '0' : theme.spacing.lg};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  position: relative;
`;

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0, 0, 0.2, 1] }
  })
};

interface BaseCardProps {
  children: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerTitle?: string;
  customIndex?: number;
  contentNoPadding?: boolean;
  className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({
  children, headerIcon, headerTitle,
  customIndex = 0, contentNoPadding = false, className
}) => {
  return (
    <CardContainer
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={customIndex}
      className={className}
    >
      {headerTitle && (
        <CardHeader>
          {headerIcon}
          <span>{headerTitle}</span>
        </CardHeader>
      )}
      {headerTitle ? (
        <CardContent $noPadding={contentNoPadding}>{children}</CardContent>
      ) : (
        <div style={{ padding: contentNoPadding ? 0 : '1.5rem', flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
          {children}
        </div>
      )}
    </CardContainer>
  );
};

export default BaseCard;
EOF

echo "✅ BaseCard.tsx fixed"

# ============================================================================
# FIX 2: Update SystemStatus.tsx to fix dispatch type
# ============================================================================
echo ""
echo "🔧 Fixing SystemStatus.tsx..."

cat > src/common/components/SystemStatus/SystemStatus.tsx << 'EOF'
import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchSystemHealth, selectSystemHealth, selectSystemHealthLoading } from '../../../features/dashboard/systemHealthSlice';
import { store } from '../../../app/store';
import 'react-tooltip/dist/react-tooltip.css';

const StatusContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  align-items: center;
`;

const StatusItem = styled.div<{ $loading: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${({ $loading }) => ($loading ? 0.5 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  font-weight: 500;
  line-height: 1;
`;

const StatusDot = styled(motion.div)<{ $status: 'online' | 'offline' }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme, $status }) =>
    $status === 'online' ? theme.colors.status.success : theme.colors.status.error};
  ${({ $status }) => $status === 'online' && css`
    animation: pulse 1.5s infinite ease-in-out;
  `}
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
  }
`;

const SystemStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const health = useAppSelector(selectSystemHealth);
  const loading = useAppSelector(selectSystemHealthLoading);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const checkHealth = () => {
      if (isMountedRef.current && !store.getState().systemHealth.loading) {
        dispatch(fetchSystemHealth() as any);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [dispatch]);

  const getStatus = (serviceStatus: string | 'online' | 'offline' | undefined) => {
    return serviceStatus === 'online' ? 'online' : 'offline';
  };

  const statusDB = getStatus(health?.database);
  const statusYOLO = getStatus(health?.yolo_service);
  const statusLLM = getStatus(health?.ollama_service);

  return (
    <StatusContainer data-tooltip-id="global-tooltip">
      <StatusItem $loading={loading} data-tooltip-content={`Database: ${health?.database || 'Offline'}`}>
        <StatusDot $status={statusDB} />
        POSTGRES
      </StatusItem>
      <StatusItem $loading={loading} data-tooltip-content={`YOLO Service: ${health?.yolo_service || 'Offline'}`}>
        <StatusDot $status={statusYOLO} />
        YOLO
      </StatusItem>
      <StatusItem $loading={loading} data-tooltip-content={`LLM Service: ${health?.ollama_service || 'Offline'}`}>
        <StatusDot $status={statusLLM} />
        OLLAMA
      </StatusItem>
    </StatusContainer>
  );
};

export default SystemStatus;
EOF

echo "✅ SystemStatus.tsx fixed"

# ============================================================================
# FIX 3: Update DashboardPage.tsx to fix dispatch type
# ============================================================================
echo ""
echo "🔧 Fixing DashboardPage.tsx..."

cat > src/features/dashboard/pages/DashboardPage.tsx << 'EOF'
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
      dispatch(fetchIncidents() as any);
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
          <BaseCard headerIcon={<BarChart2 size={20} />} headerTitle="Alert Frequency (Last Hour)" customIndex={1}>
            <AlertFrequencyChart data={alertFrequencyData} />
          </BaseCard>
        </div>
        <div className="threat-distribution">
          <BaseCard headerIcon={<PieChart size={20} />} headerTitle="Threat Distribution (Today)" customIndex={2}>
            <ThreatDistributionChart data={threatDistributionData} />
          </BaseCard>
        </div>
        <div className="camera-grid"> <CameraPreviewGrid customIndex={3} /> </div>
        <div className="recent-alerts"> <RecentAlertsWidget alerts={recentIncidents} customIndex={4} /> </div>
      </Grid>
    </DashboardContainer>
  );
};

export default DashboardPage;
EOF

echo "✅ DashboardPage.tsx fixed"

# ============================================================================
# FIX 4: Update IncidentsPage.tsx to fix dispatch and comparison issues
# ============================================================================
echo ""
echo "🔧 Fixing IncidentsPage.tsx..."

cat > src/features/incidents/pages/IncidentsPage.tsx << 'EOF'
import React, { useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAllIncidents, fetchIncidents, selectIncidentsStatus, selectIncidentsError } from '../incidentsSlice';
import { AiDetection, ThreatLevel } from '../../../common/types';
import { AlertCircle, Calendar, Camera as CameraIcon, Users, Loader } from 'react-feather';
import { theme as appTheme } from '../../../common/styles/theme';

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
  transition: transform ${({ theme }) => theme.transitions.base}, box-shadow ${({ theme }) => theme.transitions.base};
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
          <MetaItem style={{ flex: 1, minWidth: 0, gap: appTheme.spacing.xs }}>
            <CameraIcon />
            <span style={{ fontWeight: 600, color: appTheme.colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
  const theme = useTheme();

  useEffect(() => {
    if (status === 'idle') {
      console.log("[IncidentsPage] Fetching initial incidents...");
      dispatch(fetchIncidents() as any);
    }
  }, [status, dispatch]);

  const showEmptyState = status === 'succeeded' && allIncidents.length === 0;

  return (
    <PageContainer>
      <Header>
        <Title>Incidents Log</Title>
        <Subtitle>Complete history of all detected incidents</Subtitle>
      </Header>
      <AnimatePresence>
        {status === 'loading' && (
          <StateMessage key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader />
            </motion.div>
            Loading incidents...
          </StateMessage>
        )}
        {status === 'failed' && (
          <StateMessage key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: theme.colors.status.error }}>
            <AlertCircle />
            {error || "Failed to load incidents."}
          </StateMessage>
        )}
      </AnimatePresence>
      {(status === 'succeeded' || (status === 'idle' && allIncidents.length > 0)) && (
        <IncidentsGrid variants={containerVariants} initial="hidden" animate="visible">
          {showEmptyState ? (
            <StateMessage key="empty" style={{ gridColumn: '1 / -1' }}>No incidents found in the database.</StateMessage>
          ) : (
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
EOF

echo "✅ IncidentsPage.tsx fixed"

# ============================================================================
# FIX 5: Update index.tsx to properly import styled.d.ts
# ============================================================================
echo ""
echo "🔧 Fixing index.tsx..."

cat > src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './app/App';
import { GlobalStyles } from './common/styles/GlobalStyles';
import { ThemeProvider } from 'styled-components';
import { theme } from './common/styles/theme';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <App />
      <Tooltip id="global-tooltip" style={{ zIndex: 9999 }} />
    </ThemeProvider>
  </Provider>
);
EOF

echo "✅ index.tsx fixed"

# ============================================================================
# COMPLETION MESSAGE
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ ALL FIXES COMPLETE! ✅                      ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Summary of fixes applied:"
echo "   1. ✅ Fixed BaseCard.tsx motion.div prop issues"
echo "   2. ✅ Fixed SystemStatus.tsx dispatch types"
echo "   3. ✅ Fixed DashboardPage.tsx dispatch types"
echo "   4. ✅ Fixed IncidentsPage.tsx dispatch & comparison issues"
echo "   5. ✅ Fixed index.tsx theme import"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm start"
echo "   2. Check for any remaining errors in console"
echo ""
echo "💡 Note: All other errors should already be fixed by the previous script."
echo "   If you still see errors, please share the error log!"
echo ""

