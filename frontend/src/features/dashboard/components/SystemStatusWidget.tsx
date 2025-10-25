import React from 'react';
import GlassmorphicCard from '../../../common/components/Cards/GlassmorphicCard';
import SystemStatus from '../../../common/components/SystemStatus/SystemStatus';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'react-feather';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StatusCardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 120px;
  gap: ${({ theme }) => theme.spacing.lg};
  position: relative;
  
  & > div {
    font-size: ${({ theme }) => theme.fontSizes.base};
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const StatusIndicator = styled(motion.div)<{ $status: 'online' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'online':
        return `
          background: linear-gradient(135deg, ${theme.colors.status.success}20, ${theme.colors.status.success}10);
          color: ${theme.colors.status.success};
          border: 1px solid ${theme.colors.status.success}40;
          box-shadow: 0 0 20px ${theme.colors.glowSuccess};
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, ${theme.colors.status.warning}20, ${theme.colors.status.warning}10);
          color: ${theme.colors.status.warning};
          border: 1px solid ${theme.colors.status.warning}40;
          box-shadow: 0 0 20px ${theme.colors.glowWarning};
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, ${theme.colors.status.error}20, ${theme.colors.status.error}10);
          color: ${theme.colors.status.error};
          border: 1px solid ${theme.colors.status.error}40;
          box-shadow: 0 0 20px ${theme.colors.glowError};
        `;
    }
  }}
  
  svg {
    width: 16px;
    height: 16px;
    filter: drop-shadow(0 0 4px currentColor);
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const StatusItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.surface};
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
  }
`;

const StatusLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
`;

const StatusValue = styled.span<{ $status: 'online' | 'warning' | 'error' }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'online': return `color: ${theme.colors.status.success};`;
      case 'warning': return `color: ${theme.colors.status.warning};`;
      case 'error': return `color: ${theme.colors.status.error};`;
    }
  }}
`;

interface SystemStatusWidgetProps { 
  customIndex?: number;
}

const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({ customIndex }) => {
  // Mock system status data
  const systemStatus = {
    overall: 'online' as const,
    components: [
      { name: 'AI Engine', status: 'online' as const },
      { name: 'Cameras', status: 'online' as const },
      { name: 'Database', status: 'warning' as const },
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'error': return <XCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <GlassmorphicCard
      headerIcon={<Activity size={20} />}
      headerTitle="System Status"
      customIndex={customIndex}
      glow={systemStatus.overall === 'online'}
    >
      <StatusCardContent>
        <StatusIndicator 
          $status={systemStatus.overall}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getStatusIcon(systemStatus.overall)}
          {systemStatus.overall === 'online' ? 'All Systems Operational' : 
           systemStatus.overall === 'warning' ? 'Minor Issues Detected' : 
           'Critical System Error'}
        </StatusIndicator>
        
        <StatusGrid>
          {systemStatus.components.map((component, index) => (
            <StatusItem
              key={component.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <StatusValue $status={component.status}>
                {getStatusIcon(component.status)}
              </StatusValue>
              <StatusLabel>{component.name}</StatusLabel>
            </StatusItem>
          ))}
        </StatusGrid>
      </StatusCardContent>
    </GlassmorphicCard>
  );
};

export default SystemStatusWidget;
