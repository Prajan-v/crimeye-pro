import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import authService from './services/auth.service';
import Layout from './components/Layout'; // Import the main Layout wrapper
import './index.css'; // Import global styles

// Lazy load pages for code splitting and faster initial load
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Incidents = lazy(() => import('./pages/Incidents'));

// Simple loading component for Suspense fallback
const PageLoader = () => (
  <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)',
      fontSize: '1.2rem'
    }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{
         width: 24, height: 24, border: '3px solid var(--accent-gold)',
         borderTopColor: 'transparent', borderRadius: '50%', marginRight: 15
       }}
    />
    Loading CrimeEye-Pro...
  </div>
);

// Component to protect routes that require authentication
// Wraps the page component with the main Layout (sidebar etc.)
const PrivateRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  // If user is authenticated, render the Layout and the page content
  // Otherwise, redirect to the login page
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
  // 'replace' prevents the login page from being added to history stack
};

// Component for public routes (Login, Register)
// If user is already logged in, redirect them to the dashboard
const PublicRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  return user ? <Navigate to="/" replace /> : children;
};

// Component to add consistent page transition animations
const AnimatedRoute = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }} // Fade in and slide up slightly
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }} // Fade out and slide up slightly
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// Component containing the Animated Routes logic
function AppRoutes() {
  const location = useLocation(); // Needed for AnimatePresence key
  return (
    // AnimatePresence handles the exit animation before the new route enters
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AnimatedRoute><Login /></AnimatedRoute>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AnimatedRoute><Register /></AnimatedRoute>
            </PublicRoute>
          }
        />

        {/* Private Routes (these are wrapped by PrivateRoute, which includes Layout) */}
        <Route
          path="/" // Root path (Dashboard)
          element={
            <PrivateRoute>
              <AnimatedRoute><Dashboard /></AnimatedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/incidents" // Incident History page
          element={
            <PrivateRoute>
              <AnimatedRoute><Incidents /></AnimatedRoute>
            </PrivateRoute>
          }
        />

        {/* Fallback route - Redirect any unknown paths to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Main App component - sets up Router and Suspense for lazy loading
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Router>
        <AppRoutes /> {/* Contains all the animated routing logic */}
      </Router>
    </Suspense>
  );
}
export default App;
