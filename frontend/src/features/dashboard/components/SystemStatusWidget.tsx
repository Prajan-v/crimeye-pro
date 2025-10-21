import React from 'react';
import BaseCard from '../../../common/components/Cards/BaseCard';
import SystemStatus from '../../../common/components/SystemStatus/SystemStatus';
import { Activity } from 'react-feather';
import styled from 'styled-components';
const StatusCardContent = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: 100%;
min-height: 120px;
gap: ${({ theme }) => theme.spacing.lg};
& > div {
font-size: ${({ theme }) => theme.fontSizes.base};
gap: ${({ theme }) => theme.spacing.xl};
}
`;
interface SystemStatusWidgetProps { customIndex?: number; }
const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({ customIndex }) => {
return (
<BaseCard
headerIcon={<Activity size={20} />}
headerTitle="System Status"
customIndex={customIndex}
>
<StatusCardContent>
<SystemStatus />
</StatusCardContent>
</BaseCard>
);
};
export default SystemStatusWidget;
