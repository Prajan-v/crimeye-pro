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
