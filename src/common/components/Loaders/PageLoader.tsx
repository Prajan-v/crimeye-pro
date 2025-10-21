import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
const LoaderContainer = styled(motion.div)`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: 100vh;
width: 100%;
background: ${({ theme }) => theme.colors.background.primary};
color: ${({ theme }) => theme.colors.text.primary};
font-size: ${({ theme }) => theme.fontSizes.lg};
`;
const Spinner = styled(motion.div)`
width: 32px;
height: 32px;
border: 4px solid ${({ theme }) => theme.colors.background.surface};
border-top-color: ${({ theme }) => theme.colors.accent.primary};
border-radius: 50%;
margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
const PageLoader: React.FC = () => (
<LoaderContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
<Spinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
Loading CrimeEye-Pro...
</LoaderContainer>
);
export default PageLoader;
