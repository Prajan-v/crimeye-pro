import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Video } from 'react-feather';
import BaseCard from '../../../common/components/Cards/BaseCard';
const Header = styled.div`
margin-bottom: ${({ theme }) => theme.spacing.lg};
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
const PlaceholderContent = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
text-align: center;
min-height: 400px;
color: ${({ theme }) => theme.colors.text.muted};
svg {
width: 64px;
height: 64px;
margin-bottom: ${({ theme }) => theme.spacing.lg};
opacity: 0.5;
}
h2 {
font-size: ${({ theme }) => theme.fontSizes['2xl']};
color: ${({ theme }) => theme.colors.text.secondary};
margin-bottom: ${({ theme }) => theme.spacing.sm};
}
`;
const LiveFeedsPage: React.FC = () => {
return (
<motion.div>
<Header>
<Title>Live Feeds</Title>
<Subtitle>Centralized monitoring (Under Construction)</Subtitle>
</Header>
<BaseCard>
<PlaceholderContent>
<Video />
<h2>Live Feeds Page</h2>
<p>This area will contain the grid of live video streams.</p>
</PlaceholderContent>
</BaseCard>
</motion.div>
);
};
export default LiveFeedsPage;
