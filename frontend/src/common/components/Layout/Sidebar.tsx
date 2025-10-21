import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Shield, Home, List, LogOut, Menu, X, Video } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout, selectCurrentUser } from '../../../features/auth/authSlice';
import { wsDisconnect } from '../../../services/socket.middleware';
import { AppTheme } from '../../../common/styles/theme'; // Import AppTheme type

interface SidebarProps { isCollapsed: boolean; isDrawerOpen: boolean; toggleSidebar: () => void; isMobile: boolean; }

const sidebarDesktopVariants = { open: { width: 250, transition: { duration: 0.3, ease: 'easeInOut' } }, collapsed: { width: 72, transition: { duration: 0.3, ease: 'easeInOut' } }, };
const sidebarMobileVariants = { open: { x: 0, transition: { duration: 0.3, ease: 'easeOut' } }, closed: { x: '-100%', transition: { duration: 0.3, ease: 'easeIn' } }, };
const linkTextVariants = { open: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } }, collapsed: { opacity: 0, x: -10, transition: { duration: 0.1 } }, };
const userProfileVariants = { open: { opacity: 1, height: 'auto', transition: { delay: 0.1, duration: 0.2 } }, collapsed: { opacity: 0, height: 0, transition: { duration: 0.1 } }, };

const SidebarContainer = styled(motion.aside)`
background-color: ${({ theme }) => theme.colors.background.secondary};
border-right: 1px solid ${({ theme }) => theme.colors.border};
display: flex; flex-direction: column; height: 100vh; position: fixed;
top: 0; left: 0; z-index: 1000; overflow: hidden;
`;
const SidebarContent = styled.div`
display: flex; flex-direction: column; height: 100%; width: 250px;
padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
overflow-y: auto;
overflow-x: hidden;
`;
const LogoWrapper = styled.div`
display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.sm};
color: ${({ theme }) => theme.colors.text.primary};
font-size: ${({ theme }) => theme.fontSizes.xl};
font-weight: 700; padding-bottom: ${({ theme }) => theme.spacing.lg};
margin-bottom: ${({ theme }) => theme.spacing.md}; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
flex-shrink: 0; padding-left: 6px; padding-right: 6px;
svg { color: ${({ theme }) => theme.colors.accent.primary}; flex-shrink: 0; }
`;
const Nav = styled.nav`
flex: 1; display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacing.sm};
`;
const NavItemBaseStyles = `
  display: flex;
  align-items: center;
  gap: ${({ theme }: { theme: AppTheme }) => theme.spacing.md};
  padding: ${({ theme }: { theme: AppTheme }) => theme.spacing.sm} ${({ theme }: { theme: AppTheme }) => theme.spacing.md};
  border-radius: ${({ theme }: { theme: AppTheme }) => theme.borderRadius.md};
  color: ${({ theme }: { theme: AppTheme }) => theme.colors.text.secondary};
  font-weight: 500;
  transition: all ${({ theme }: { theme: AppTheme }) => theme.transitions.fast};
  border: 1px solid transparent;
  white-space: nowrap;
  height: 44px;
  width: 100%;
  text-align: left;
  background: none;
  cursor: pointer;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    color: ${({ theme }: { theme: AppTheme }) => theme.colors.text.primary};
    background-color: ${({ theme }: { theme: AppTheme }) => theme.colors.background.surface};
  }
`;
const NavLinkStyled = styled(NavLink)`
  ${NavItemBaseStyles}
  &.active {
    color: ${({ theme }) => theme.colors.accent.primary};
    background-color: ${({ theme }) => `${theme.colors.accent.primary}1A`};
    border: 1px solid ${({ theme }) => theme.colors.accent.primary};
  }
`;
const LinkText = styled(motion.span)` overflow: hidden;`;
const Footer = styled.footer`
padding-top: ${({ theme }) => theme.spacing.md};
border-top: 1px solid ${({ theme }) => theme.colors.border};
flex-shrink: 0;
`;
const UserProfile = styled(motion.div)`
display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.sm};
padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
margin-bottom: ${({ theme }) => theme.spacing.sm};
overflow: hidden; height: 52px;
`;
const UserAvatar = styled.div`
width: 32px; height: 32px; border-radius: 50%;
background-color: ${({ theme }) => theme.colors.accent.primary};
color: #FFFFFF; display: flex; align-items: center; justify-content: center;
font-weight: 600; flex-shrink: 0; font-size: ${({ theme }) => theme.fontSizes.sm};
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
    background-color: ${({ theme }) => 'rgba(239, 68, 68, 0.1)'};
  }
`;
const MobileToggle = styled(motion.button)`
position: fixed; top: 15px; left: 15px; z-index: 1010;
background-color: ${({ theme }) => theme.colors.background.surface};
border: 1px solid ${({ theme }) => theme.colors.border};
border-radius: 50%; padding: 8px; display: flex;
align-items: center; justify-content: center;
color: ${({ theme }) => theme.colors.text.primary};
box-shadow: ${({ theme }) => theme.shadows.md};
@media (min-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;
const Overlay = styled(motion.div)`
position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); z-index: 999;
@media (min-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isDrawerOpen, toggleSidebar,
isMobile }) => {
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
{!isCollapsed && (<LinkText variants={linkTextVariants} initial="collapsed"
animate="open" exit="collapsed"> CrimeEye-Pro </LinkText>)}
</AnimatePresence>
</LogoWrapper>
<Nav>
<NavLinkStyled to="/" end>
<Home size={20} />
<AnimatePresence>{!isCollapsed && <LinkText
variants={linkTextVariants}>Dashboard</LinkText>}</AnimatePresence>
</NavLinkStyled>
<NavLinkStyled to="/live-feeds">
<Video size={20} />
<AnimatePresence>{!isCollapsed && <LinkText variants={linkTextVariants}>Live
Feeds</LinkText>}</AnimatePresence>
</NavLinkStyled>
<NavLinkStyled to="/incidents">
<List size={20} />
<AnimatePresence>{!isCollapsed && <LinkText variants={linkTextVariants}>Incidents
Log</LinkText>}</AnimatePresence>
</NavLinkStyled>
</Nav>
<Footer>
<UserProfile variants={userProfileVariants} animate={animationState}
initial="collapsed">
<UserAvatar>{user?.username ? user.username.charAt(0).toUpperCase() :
'U'}</UserAvatar>
<UserInfo>
<UserName>{user?.username || 'User'}</UserName>
<UserRole>{user?.email || 'Operator'}</UserRole>
</UserInfo>
</UserProfile>
<LogoutButton onClick={handleLogout}>
<LogOut size={20} />
<AnimatePresence>{!isCollapsed && <LinkText
variants={linkTextVariants}>Logout</LinkText>}</AnimatePresence>
</LogoutButton>
</Footer>
</SidebarContent>
</SidebarContainer>
</>
);
};
export default Sidebar;
