import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, HardHat, FileText, LogOut, Activity } from 'react-feather';
import authService from '../services/auth.service';
import SystemStatus from './SystemStatus';
import styles from '../styles/Layout.module.css';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Incidents', path: '/incidents', icon: FileText },
    // You can add more routes here, e.g., 'Live Feeds'
];

const sidebarVariants = {
    initial: { x: -250 },
    animate: { x: 0 },
};

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className={styles.layout}>
            {/* Sidebar with Animation */}
            <motion.div
                className={styles.sidebar}
                variants={sidebarVariants}
                initial="initial"
                animate="animate"
                transition={{ type: 'tween', duration: 0.3 }}
            >
                <div className={styles.sidebarHeader}>
                    <Eye size={30} />
                    CrimeEye-Pro
                </div>

                <div className={styles.nav}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => 
                                isActive ? styles.navLinkActive : styles.navLink
                            }
                        >
                            <item.icon size={20} />
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                <div className={styles.footer}>
                    <SystemStatus /> 
                    <motion.button 
                        className={styles.logoutButton} 
                        onClick={authService.logout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut size={20} />
                        Logout
                    </motion.button>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
