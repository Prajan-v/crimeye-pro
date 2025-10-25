import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Shield, Home, List, LogOut, Menu, X, Video } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout, selectCurrentUser } from '../../../features/auth/authSlice';
import { wsDisconnect } from '../../../services/socket.middleware';
import { AppTheme } from '../../../common/styles/theme';

interface SidebarProps {
  isCollapsed: boolean;
  isDrawerOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const sidebarDesktopVariants = {
  open: { width: 250, transition: { duration: 0.3, ease: 'easeInOut' as const } },
  collapsed: { width: 72, transition: { duration: 0.3, ease: 'easeInOut' as const } },
};
const sidebarMobileVariants = {
  open: { x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  closed: { x: '-100%', transition: { duration: 0.3, ease: 'easeIn' as const } },
};
const linkTextVariants = {
  open: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
  collapsed: { opacity: 0, x: -10, transition: { duration: 0.1 } },
};
const userProfileVariants = {
  open: { opacity: 1, height: 'auto', transition: { delay: 0.1, duration: 0.2 } },
  collapsed: { opacity: 0, height: 0, transition: { duration: 0.1 } },
};

const SidebarContainer = styled(motion.aside)`
  ${({ theme }) => theme.effects.glassmorphism}
  border-right: 1px solid ${({ theme }) => theme.colors.glass.border};
  display: flex; 
  flex-direction: column; 
  height: 100vh; 
  position: fixed;
  top: 0; 
  left: 0; 
  z-index: 1000; 
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: ${({ theme }) => theme.shadows.glass};
  
  /* Holographic border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, 
      ${({ theme }) => theme.colors.accent.primary}, 
      ${({ theme }) => theme.colors.accent.secondary},
      ${({ theme }) => theme.colors.accent.tertiary},
      ${({ theme }) => theme.colors.accent.primary}
    );
    opacity: 0.8;
    animation: borderGlow 3s ease-in-out infinite;
  }
  
  @keyframes borderGlow {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;
const SidebarContent = styled.div`
  display: flex; flex-direction: column; height: 100%; width: 250px;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
  overflow-x: hidden;
`;
const LogoWrapper = styled.div`
  display: flex; 
  align-items: center; 
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700; 
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md}; 
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
  flex-shrink: 0; 
  padding-left: 6px; 
  padding-right: 6px;
  position: relative;
  
  svg { 
    color: ${({ theme }) => theme.colors.accent.primary}; 
    flex-shrink: 0;
    filter: drop-shadow(0 0 8px ${({ theme }) => theme.colors.glow.primary});
    ${({ theme }) => theme.animations.pulse}
  }
  
  /* Gradient text effect */
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.primary}, 
    ${({ theme }) => theme.colors.accent.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;
const Nav = styled.nav`
  flex: 1; display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacing.sm};
`;
const NavItemBaseStyles = `
  display: flex;
  align-items: center;
  gap: ${({ theme }: { theme: AppTheme }) => theme.spacing.md};
  padding: ${({ theme }: { theme: AppTheme }) => theme.spacing.sm} ${({ theme }: { theme: AppTheme }) => theme.spacing.md};
  border-radius: ${({ theme }: { theme: AppTheme }) => theme.borderRadius.lg};
  color: ${({ theme }: { theme: AppTheme }) => theme.colors.text.secondary};
  font-weight: 600;
  transition: all ${({ theme }: { theme: AppTheme }) => theme.transitions.base};
  border: 1px solid transparent;
  white-space: nowrap;
  height: 48px;
  width: 100%;
  text-align: left;
  background: ${({ theme }: { theme: AppTheme }) => theme.colors.glass.background};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  svg {
    flex-shrink: 0;
    transition: all ${({ theme }: { theme: AppTheme }) => theme.transitions.base};
  }

  &:hover {
    color: ${({ theme }: { theme: AppTheme }) => theme.colors.text.primary};
    background: ${({ theme }: { theme: AppTheme }) => theme.colors.background.surface};
    box-shadow: ${({ theme }: { theme: AppTheme }) => theme.shadows.glowPrimary};
    transform: translateX(4px);
    
    svg {
      filter: drop-shadow(0 0 8px ${({ theme }: { theme: AppTheme }) => theme.colors.glow.primary});
    }
  }

  /* Holographic border effect on hover */
  &:hover::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(45deg, 
      ${({ theme }: { theme: AppTheme }) => theme.colors.accent.primary}40, 
      ${({ theme }: { theme: AppTheme }) => theme.colors.accent.secondary}20,
      ${({ theme }: { theme: AppTheme }) => theme.colors.accent.primary}40
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
  }
`;
const NavLinkStyled = styled(NavLink)`
  ${NavItemBaseStyles}
  &.active {
    color: ${({ theme }) => theme.colors.accent.primary};
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.accent.primary}20, 
      ${({ theme }) => theme.colors.accent.secondary}10
    );
    border: 1px solid ${({ theme }) => theme.colors.accent.primary}40;
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
    
    svg {
      filter: drop-shadow(0 0 8px ${({ theme }) => theme.colors.glow.primary});
    }
    
    /* Active state holographic border */
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
        ${({ theme }) => theme.colors.accent.primary}, 
        ${({ theme }) => theme.colors.accent.secondary},
        ${({ theme }) => theme.colors.accent.tertiary},
        ${({ theme }) => theme.colors.accent.primary}
      );
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
      pointer-events: none;
      opacity: 0.8;
    }
  }
`;
const LinkText = styled(motion.span)` overflow: hidden;`;
const Footer = styled.footer`
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.glass.border};
  flex-shrink: 0;
`;
const UserProfile = styled(motion.div)`
  display: flex; 
  align-items: center; 
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  overflow: hidden; 
  height: 52px;
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  transition: all ${({ theme }) => theme.transitions.base};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.surface};
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
  }
`;
const UserAvatar = styled.div`
  width: 36px; 
  height: 36px; 
  border-radius: 50%;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.primary}, 
    ${({ theme }) => theme.colors.accent.secondary}
  );
  color: #FFFFFF; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  font-weight: 700; 
  flex-shrink: 0; 
  font-size: ${({ theme }) => theme.fontSizes.sm};
  box-shadow: 0 0 15px ${({ theme }) => theme.colors.glow.primary};
  border: 2px solid ${({ theme }) => theme.colors.accent.primary}40;
`;
const UserInfo = styled.div` line-height: 1.3;`;
const UserName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary}; font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm}; white-space: nowrap;
`;
const UserRole = styled.div`
  color: ${({ theme }) => theme.colors.text.muted}; font-size: ${({ theme }) => theme.fontSizes.xs};
  white-space: nowrap;
`;
const LogoutButton = styled.button`
  ${NavItemBaseStyles}
  &:hover {
    color: ${({ theme }) => theme.colors.status.error};
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.status.error}20, 
      ${({ theme }) => theme.colors.status.error}10
    );
    box-shadow: ${({ theme }) => theme.shadows.glowError};
    border-color: ${({ theme }) => theme.colors.status.error}40;
    
    svg {
      filter: drop-shadow(0 0 8px ${({ theme }) => theme.colors.glow.error});
    }
  }
`;
const MobileToggle = styled(motion.button)`
  position: fixed; 
  top: 15px; 
  left: 15px; 
  z-index: 1010;
  ${({ theme }) => theme.effects.glassmorphism}
  border-radius: 50%; 
  padding: 12px; 
  display: flex;
  align-items: center; 
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  transition: all ${({ theme }) => theme.transitions.base};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.glass}, ${({ theme }) => theme.shadows.glowPrimary};
    transform: scale(1.1);
  }
  
  svg {
    filter: drop-shadow(0 0 4px ${({ theme }) => theme.colors.glow.primary});
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { 
    display: none; 
  }
`;
const Overlay = styled(motion.div)`
  position: fixed; 
  inset: 0; 
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.8), 
    rgba(0, 0, 0, 0.6)
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { 
    display: none; 
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isDrawerOpen, toggleSidebar, isMobile }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(wsDisconnect());
    navigate('/login');
  };

  const animationState = isCollapsed ? 'collapsed' : 'open';

  return (
    <>
      <MobileToggle onClick={toggleSidebar} aria-label="Toggle Navigation" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <AnimatePresence mode="wait">
          {isDrawerOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}> <X size={20} /> </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}> <Menu size={20} /> </motion.div>
          )}
        </AnimatePresence>
      </MobileToggle>

      <AnimatePresence>
        {isDrawerOpen && (
          <Overlay key="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={toggleSidebar} />
        )}
      </AnimatePresence>

      <SidebarContainer
        variants={isMobile ? sidebarMobileVariants : sidebarDesktopVariants}
        animate={isMobile ? (isDrawerOpen ? 'open' : 'closed') : (isCollapsed ? 'collapsed' : 'open')}
        initial={isMobile ? 'closed' : 'open'}
        className={isMobile ? 'mobile-sidebar' : 'desktop-sidebar'}
      >
        <SidebarContent>
          <LogoWrapper>
            <Shield size={30} />
            <AnimatePresence>
              {!isCollapsed && (<LinkText variants={linkTextVariants} initial="collapsed" animate="open" exit="collapsed"> CrimeEye-Pro </LinkText>)}
            </AnimatePresence>
          </LogoWrapper>
          <Nav>
            <NavLinkStyled to="/" end>
              <Home size={20} />
              <AnimatePresence>{!isCollapsed && <LinkText variants={linkTextVariants}>Dashboard</LinkText>}</AnimatePresence>
            </NavLinkStyled>
            <NavLinkStyled to="/live-feeds">
              <Video size={20} />
              <AnimatePresence>{!isCollapsed && <LinkText variants={linkTextVariants}>Live Feeds</LinkText>}</AnimatePresence>
            </NavLinkStyled>
            <NavLinkStyled to="/incidents">
              <List size={20} />
              <AnimatePresence>{!isCollapsed && <LinkText variants={linkTextVariants}>Incidents Log</LinkText>}</AnimatePresence>
            </NavLinkStyled>
          </Nav>
          <Footer>
            <UserProfile variants={userProfileVariants} animate={animationState} initial="collapsed">
              <UserAvatar>{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</UserAvatar>
              <UserInfo>
                <UserName>{user?.username || 'User'}</UserName>
                <UserRole>{user?.email || 'Operator'}</UserRole>
              </UserInfo>
            </UserProfile>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={20} />
              <AnimatePresence>{!isCollapsed && <LinkText variants={linkTextVariants}>Logout</LinkText>}</AnimatePresence>
            </LogoutButton>
          </Footer>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
