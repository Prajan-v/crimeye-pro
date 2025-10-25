import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, ChevronRight, Eye } from 'react-feather';
import GlassmorphicCard from '../../../common/components/Cards/GlassmorphicCard';
import { AiDetection, ThreatLevel } from '../../../common/types';
import { Link } from 'react-router-dom';
import { theme as appTheme } from '../../../common/styles/theme';
import RiskBadge from '../../../common/components/UI/RiskBadge';

const AlertList = styled(motion.div)`
  display: flex; flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;
const AlertItem = styled(motion.div)<{ $levelColor: string }>`
  display: flex; 
  gap: ${({ theme }) => theme.spacing.sm};
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border-left: 4px solid ${({ $levelColor }) => $levelColor};
  overflow: hidden; 
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  position: relative;
  
  /* Holographic border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 1px;
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
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
    background: ${({ theme }) => theme.colors.background.surface};
  }
`;
const AlertIcon = styled.div<{ $levelColor: string }>`
  flex-shrink: 0; 
  width: 40px; 
  height: 40px; 
  border-radius: 50%;
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: linear-gradient(135deg, 
    ${({ $levelColor }) => $levelColor}30, 
    ${({ $levelColor }) => $levelColor}10
  );
  color: ${({ $levelColor }) => $levelColor};
  border: 2px solid ${({ $levelColor }) => $levelColor}40;
  box-shadow: 0 0 15px ${({ $levelColor }) => $levelColor}40;
  
  svg {
    filter: drop-shadow(0 0 4px currentColor);
  }
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
    <GlassmorphicCard
      headerIcon={<AlertTriangle size={20} />}
      headerTitle="Recent Alerts"
      customIndex={customIndex}
      glow={alerts.length > 0}
    >
      <AlertList style={{ padding: appTheme.spacing.lg, paddingBottom: 0, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <AnimatePresence>
          {alerts.length === 0 && (
            <EmptyState>
              <AlertTriangle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              No recent alerts.
            </EmptyState>
          )}
          {alerts.map((alert, index) => {
            const levelColor = getThreatColor(alert.threat_level);
            const threatLevel = (alert.threat_level || 'unknown').toLowerCase() as 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
            const isHighThreat = ['critical', 'high'].includes(threatLevel);
            
            return (
              <AlertItem
                key={alert.id} 
                $levelColor={levelColor}
                variants={itemVariants} 
                initial="hidden" 
                animate="visible" 
                exit="exit"
                layout 
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                title={`Click to view details for ${alert.camera_id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AlertIcon $levelColor={levelColor}> 
                  <AlertTriangle size={18} /> 
                </AlertIcon>
                <AlertInfo>
                  <AlertHeader>
                    <AlertTitle>{alert.camera_id}</AlertTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RiskBadge 
                        level={threatLevel} 
                        size="sm" 
                        glow={isHighThreat}
                      />
                      <AlertTimestamp> 
                        <Clock size={12} /> {formatTime(alert.timestamp)} 
                      </AlertTimestamp>
                    </div>
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
        <Eye size={16} />
        View All Incidents 
        <ChevronRight size={16} />
      </ViewAllLink>
    </GlassmorphicCard>
  );
};

export default RecentAlertsWidget;
