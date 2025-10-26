import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from './hooks';
import { selectisAuthenticated, fetchCurrentUser, selectAuthStatus, logout } from '../features/auth/authSlice';
import { wsConnect, wsDisconnect } from '../services/socket.middleware';
import { jwtDecode } from 'jwt-decode';
import Layout from '../common/components/Layout/Layout';
import PageLoader from '../common/components/Loaders/PageLoader';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const IncidentsPage = lazy(() => import('../features/incidents/pages/IncidentsPage'));
const LiveFeedsPage = lazy(() => import('../features/live-feeds/pages/LiveFeedsPage'));
const AdminPanel = lazy(() => import('../features/admin/pages/AdminPanel'));

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectisAuthenticated);
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectisAuthenticated);
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/";
  return isAuthenticated ? <Navigate to={from} replace /> : children;
};

function AppRoutes() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectisAuthenticated);
  const authStatus = useAppSelector(selectAuthStatus);
  const token = useAppSelector(state => state.auth.token);

  // Check token and fetch user
  useEffect(() => {
    if (token && authStatus === 'idle' && !isAuthenticated) {
      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          console.log("[App Effect] Valid token found, fetching user...");
          dispatch(fetchCurrentUser() as any);
        } else {
          console.warn("[App Effect] Token expired, logging out.");
          dispatch(logout());
        }
      } catch {
        console.error("[App Effect] Invalid token, logging out.");
        dispatch(logout());
      }
    }
  }, [token, authStatus, isAuthenticated, dispatch]);

  // WebSocket connection based on auth
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[App Effect] Connecting WebSocket…");
      dispatch(wsConnect());
    } else {
      dispatch(wsDisconnect());
    }
  }, [isAuthenticated, dispatch]);

  return (
    // ✅ AnimatePresence JSX-safe wrapper
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={<PublicRoute><Suspense fallback={<PageLoader />}><LoginPage /></Suspense></PublicRoute>}
        />
        <Route
          path="/register"
          element={<PublicRoute><Suspense fallback={<PageLoader />}><RegisterPage /></Suspense></PublicRoute>}
        />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route
            index
            element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>}
          />
          <Route
            path="incidents"
            element={<Suspense fallback={<PageLoader />}><IncidentsPage /></Suspense>}
          />
          <Route
            path="live-feeds"
            element={<Suspense fallback={<PageLoader />}><LiveFeedsPage /></Suspense>}
          />
          <Route
            path="admin"
            element={<Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Router>
        <AppRoutes />
      </Router>
    </Suspense>
  );
}

export default App;
