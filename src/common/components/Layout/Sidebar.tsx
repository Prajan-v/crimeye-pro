import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import styled from 'styled-components';
import { Shield, Home, List, LogOut, Menu, X, Video } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout, selectCurrentUser } from '../../../features/auth/authSlice';
import { wsDisconnect } from '../../../services/socket.middleware';

interface SidebarProps { 
  isCollapsed: boolean; 
  isDrawerOpen: boolean; 
  toggleSidebar: () => void; 
  isMobile: boolean; 
}

// Fixed variants with proper typing
const sidebarDesktopVariants: Variants = { 
  open: { 
    width: 250, 
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }  // Fixed ease as array
  }, 
  collapsed: { 
    width: 72, 
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } 
  }, 
};

const sidebarMobileVariants: Variants = { 
  open: { 
    x: 0, 
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } 
  }, 
  closed: { 
    x: '-100%', 
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } 
  }, 
};

const linkTextVariants: Variants = { 
  open: { 
    opacity: 1, 
    x: 0, 
    transition: { delay: 0.1, duration: 0.2 } 
  }, 
  collapsed: { 
    opacity: 0, 
    x: -10, 
    transition: { duration: 0.1 } 
  }, 
};

const userProfileVariants: Variants = { 
  open: { 
    opacity: 1, 
    height: 'auto', 
    transition: { delay: 0.1, duration: 0.2 } 
  }, 
  collapsed: { 
    opacity: 0, 
    height: 0, 
    transition: { duration: 0.1 } 
  }, 
};

const SidebarContainer = styled(motion.aside)`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; flex-direction: column; height: 100vh; position: fixed;
  top: 0; left: 0; z-index: 1000; overflow: hidden;
`;

const Header = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700; padding-bottom: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md}; 
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0; padding-left: 6px; padding-right: 6px;
  svg { color: ${({ theme }) => theme.colors.accent.primary}; flex-shrink: 0; }
`;

const Nav = styled.nav`
  flex: 1; overflow-y: auto; padding: ${({ theme }) => theme.spacing.sm};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacing.xs};
`;

const StyledNavLink = styled(NavLink)`
  display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md}; border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.base}; font-weight: 500;
  transition: background-color ${({ theme }) => theme.transitions.fast}, 
              color ${({ theme }) => theme.transitions.fast};
  text-decoration: none; position: relative; overflow: hidden;
  &.active { background-color: ${({ theme }) => theme.colors.background.surface}; 
             color: ${({ theme }) => theme.colors.accent.primary}; }
  &:hover { background-color: ${({ theme }) => theme.colors.background.surface}; 
            color: ${({ theme }) => theme.colors.text.primary}; }
  svg { width: 20px; height: 20px; flex-shrink: 0; }
`;

const LinkText = styled(motion.span)`
  white-space: nowrap; overflow: hidden;
`;

const Footer = styled.footer`
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const UserProfile = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md}; margin: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background.surface};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const UserName = styled.div`
  font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const UserEmail = styled.div`
  color: ${({ theme }) => theme.colors.text.muted}; overflow: hidden; text-overflow: ellipsis; 
  white-space: nowrap;
`;

const LogoutButton = styled(motion.button)`
  display: flex; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md}; margin: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  transition: filter ${({ theme }) => theme.transitions.fast};
  width: calc(100% - ${({ theme }) => theme.spacing.md});
  &:hover { filter: brightness(1.1); }
  svg { width: 18px; height: 18px; }
`;

const MenuButton = styled(motion.button)`
  position: fixed; top: 15px; left: 15px; z-index: 1010;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%; padding: 8px; display: flex;
  align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: background-color ${({ theme }) => theme.transitions.fast}, 
              transform ${({ theme }) => theme.transitions.fast};
  &:hover { background-color: ${({ theme }) => theme.colors.background.elevated}; 
            transform: scale(1.05); }
  svg { width: 20px; height: 20px; }
`;

const Overlay = styled(motion.div)`
  position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.7);
  z-index: 999; backdrop-filter: blur(2px);
`;

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isDrawerOpen, toggleSidebar, isMobile }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(wsDisconnect());
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const closeMobileDrawer = () => { if (isMobile && isDrawerOpen) toggleSidebar(); };

  const navLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/incidents', icon: List, label: 'Incidents' },
    { to: '/live-feeds', icon: Video, label: 'Live Feeds' },
  ];

  return (
    <>
      {isMobile && (
        <MenuButton onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {isDrawerOpen ? <X /> : <Menu />}
        </MenuButton>
      )}
      <AnimatePresence>
        {isMobile && isDrawerOpen && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeMobileDrawer} />
        )}
      </AnimatePresence>
      <SidebarContainer
        variants={isMobile ? sidebarMobileVariants : sidebarDesktopVariants}
        animate={isMobile ? (isDrawerOpen ? 'open' : 'closed') : (isCollapsed ? 'collapsed' : 'open')}
        initial={isMobile ? 'closed' : 'open'}
        className={isMobile ? 'mobile-sidebar' : 'desktop-sidebar'}
      >
        <Header>
          <Shield size={28} />
          {(!isCollapsed || isMobile) && <span>CrimeEye-Pro</span>}
        </Header>
        <Nav>
          {navLinks.map((link) => (
            <StyledNavLink key={link.to} to={link.to} onClick={closeMobileDrawer}>
              <link.icon />
              {(!isCollapsed || isMobile) && (
                <LinkText variants={linkTextVariants} animate={isCollapsed && !isMobile ? 'collapsed' : 'open'}>
                  {link.label}
                </LinkText>
              )}
            </StyledNavLink>
          ))}
        </Nav>
        <Footer>
          {currentUser && (!isCollapsed || isMobile) && (
            <UserProfile variants={userProfileVariants} animate={isCollapsed && !isMobile ? 'collapsed' : 'open'}>
              <UserName>{currentUser.username}</UserName>
              {currentUser.email && <UserEmail>{currentUser.email}</UserEmail>}
            </UserProfile>
          )}
          <LogoutButton onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <LogOut />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </LogoutButton>
        </Footer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
