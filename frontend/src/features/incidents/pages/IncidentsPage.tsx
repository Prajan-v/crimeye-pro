import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAllIncidents, fetchIncidents, selectIncidentsStatus, selectIncidentsError, addIncident } from '../incidentsSlice';
import { AiDetection } from '../../../common/types';
import { AlertCircle, Calendar, Camera as CameraIcon, Users, Loader, Search } from 'react-feather';
import { theme as appTheme } from '../../../common/styles/theme';
import ParticleBackground from '../../../common/components/Effects/ParticleBackground';
import GlassmorphicCard from '../../../common/components/Cards/GlassmorphicCard';
import RiskBadge from '../../../common/components/UI/RiskBadge';
import FuturisticBorder from '../../../common/components/UI/FuturisticBorder';

const PageContainer = styled(motion.div)`
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

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const SearchInput = styled(motion.input)`
  flex: 1;
  min-width: 250px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.base};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
    background: ${({ theme }) => theme.colors.background.surface};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const FilterSelect = styled(motion.select)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.base};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
    background: ${({ theme }) => theme.colors.background.surface};
  }
`;
const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 2px solid ${({ theme }) => theme.colors.accent.primary};
  color: ${({ theme }) => theme.colors.accent.primary};
  background: transparent;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  &:hover { background: ${({ theme }) => theme.colors.background.surface}; }
`;
const IncidentsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) { grid-template-columns: repeat(3, 1fr); }
`;
const IncidentCardContainer = styled(motion.div)<{ $levelColor: string }>`
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  overflow: hidden; 
  display: flex; 
  flex-direction: column;
  transition: all ${({ theme }) => theme.transitions.base};
  position: relative;
  border-left: 5px solid ${({ $levelColor }) => $levelColor};
  
  /* Holographic border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(45deg, 
      ${({ $levelColor }) => $levelColor}40, 
      ${({ theme }) => theme.colors.accent.primary}20,
      ${({ $levelColor }) => $levelColor}40
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
    opacity: 0.6;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
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
  const level = (detection.threat_level || 'unknown').toLowerCase() as 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
  const levelColor = appTheme.colors.threat[level] || appTheme.colors.text.muted;
  const isHighThreat = ['critical', 'high'].includes(level);

  return (
    <IncidentCardContainer $levelColor={levelColor} variants={itemVariants} layout>
      <Thumbnail onClick={() => window.open(`http://localhost:8000/${detection.image_path}`)}>
        {detection.image_path ? (
          <img src={`http://localhost:8000/${detection.image_path}`} alt={`Snapshot for ${detection.camera_id}`} />
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
          <RiskBadge 
            level={level} 
            size="sm" 
            glow={isHighThreat}
          />
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (status === 'idle') {
      console.log("[IncidentsPage] Fetching initial incidents...");
      dispatch(fetchIncidents() as any); 
    }
  }, [status, dispatch]);


  // Filter incidents based on search and filters
  const filteredIncidents = allIncidents.filter(incident => {
    const matchesSearch = incident.camera_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.llm_report?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || incident.threat_level?.toLowerCase() === riskFilter;
    const matchesDate = dateFilter === 'all' || true; // Add date filtering logic here
    
    return matchesSearch && matchesRisk && matchesDate;
  });

  const showEmptyState = status === 'succeeded' && filteredIncidents.length === 0;

  return (
    <PageContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Background Effects */}
      <ParticleBackground particleCount={30} />
      
      <Header>
        <Title>Incidents Log</Title>
        <Subtitle>Complete history of all detected incidents</Subtitle>
      </Header>

      {/* Filter Bar */}
      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        />
        <FilterSelect
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </FilterSelect>
        <FilterSelect
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </FilterSelect>
      </FilterBar>

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
            <StateMessage key="empty" style={{ gridColumn: '1 / -1' }}>
              <AlertCircle size={48} />
              No incidents found matching your criteria.
            </StateMessage>
          ) : (
            filteredIncidents.map((det: AiDetection) => (
              <IncidentCard key={det.id} detection={det} />
            ))
          )}
        </IncidentsGrid>
      )}
    </PageContainer>
  );
};

export default IncidentsPage;