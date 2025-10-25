import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const MainContent = styled(motion.main)<{ $isSidebarCollapsed: boolean; $isMobile: boolean }>`
  flex: 1;
  overflow-y: auto;
  height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  position: relative;
  margin-left: ${({ $isSidebarCollapsed, $isMobile }) =>
    $isMobile ? '0' : ($isSidebarCollapsed ? '72px' : '250px')};
  transition: margin-left ${({ theme }) => theme.transitions.base};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
    padding-top: calc(${({ theme }) => theme.spacing.xl} + 60px);
  }
`;

const Layout: React.FC = () => { 
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      if (mobileCheck !== isMobile) {
        setIsMobile(mobileCheck);
        setIsSidebarOpen(!mobileCheck);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    // FIX: Added 'isSidebarOpen' to dependency array
  }, [location.pathname, isMobile, isSidebarOpen]);

  const isCollapsed = !isSidebarOpen && !isMobile;
  const isDrawerOpen = isSidebarOpen && isMobile;

  return (
    <LayoutContainer>
      <Sidebar
        isCollapsed={isCollapsed}
        isDrawerOpen={isDrawerOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      <MainContent
        $isSidebarCollapsed={isCollapsed}
        $isMobile={isMobile}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
