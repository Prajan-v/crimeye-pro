import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Home, List, LogOut, Menu, X } from 'react-feather';
import styles from '../styles/Layout.module.css';
import authService from '../services/auth.service';

const sidebarVariants = {
  // Use width instead of x for smoother performance on some browsers
  open: { width: 250, transition: { duration: 0.4, ease: [0.1, 0.7, 0.6, 0.9] } },
  closed: { width: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const mobileSidebarVariants = {
  open: { x: 0, transition: { duration: 0.4, ease: [0.1, 0.7, 0.6, 0.9] } },
  closed: { x: '-100%', transition: { duration: 0.3, ease: "easeIn" } }
};

const contentVariants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.99, transition: { duration: 0.2 } }
};

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); // To use as key for content animation
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className={styles.sidebarHeader}>
        <Shield size={30} />
        <span>CrimeEye-Pro</span>
      </div>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          end // Important for matching only the root path
          className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
          onClick={() => setIsMobileNavOpen(false)} // Close nav on click
        >
          <Home size={20} />
          <span>Live Dashboard</span>
        </NavLink>
        <NavLink
          to="/incidents"
          className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
          onClick={() => setIsMobileNavOpen(false)} // Close nav on click
        >
          <List size={20} />
          <span>Incident History</span>
        </NavLink>
      </nav>
      <footer className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </footer>
    </>
  );

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <motion.nav
        className={`${styles.sidebar} ${styles.desktopSidebar}`} // Add class to hide on mobile
        initial={{ width: 250 }} // Start open on desktop
        animate={{ width: 250 }} // Stay open
        style={{ overflow: 'hidden' }} // Hide content when animating width (optional)
      >
        <SidebarContent />
      </motion.nav>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40
              }}
              onClick={() => setIsMobileNavOpen(false)}
            />
            {/* Mobile Nav Content */}
            <motion.nav
              className={`${styles.sidebar} ${styles.mobileSidebar}`} // Add class to show only on mobile
              key="mobile-sidebar"
              variants={mobileSidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}
            >
              <button
                onClick={() => setIsMobileNavOpen(false)}
                style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <SidebarContent />
            </motion.nav>
          </>
        )}
      </AnimatePresence>


      <main className={styles.mainContent}>
        {/* Mobile Nav Toggle Button */}
        <button
          className={styles.mobileNavToggle} // Add styles for this button
          onClick={() => setIsMobileNavOpen(true)}
          style={{ position: 'absolute', top: 15, left: 15, zIndex: 30, background: 'var(--bg-surface)', border: '1px solid #444', borderRadius: '50%', padding: '8px', display: 'none', cursor: 'pointer' }} /* Hide initially, shown via media query */
        >
          <Menu size={20} color="var(--text-primary)" />
        </button>

        {/* Animated Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // Animate when route changes
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Add Media Query in index.css or a dedicated CSS file */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .${styles.desktopSidebar} { display: none; }
          .${styles.mobileNavToggle} { display: block; }
          .${styles.mainContent} { padding: 20px; } /* Adjust padding on mobile */
          .${styles.grid} { grid-template-columns: 1fr; height: auto; } /* Stack grid items on mobile */
        }
        @media (min-width: 769px) {
           .${styles.mobileSidebar} { display: none; }
        }
      `}</style>
    </div>
  );
}
export default Layout;
