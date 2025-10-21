import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from
'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from './hooks';
import { selectisAuthenticated, fetchCurrentUser, selectAuthStatus, logout } from
'../features/auth/authSlice';
import { wsConnect, wsDisconnect } from '../services/socket.middleware';
import { jwtDecode } from 'jwt-decode';
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const IncidentsPage = lazy(() => import('../features/incidents/pages/IncidentsPage'));
const LiveFeedsPage = lazy(() => import('../features/live-feeds/pages/LiveFeedsPage'));
import Layout from '../common/components/Layout/Layout';
import PageLoader from '../common/components/Loaders/PageLoader';
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
const isAuthenticated = useAppSelector(selectisAuthenticated);
const location = useLocation();
if (!isAuthenticated) {
return <Navigate to="/login" state={{ from: location }} replace />;
}
return children;
};
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
const isAuthenticated = useAppSelector(selectisAuthenticated);
const location = useLocation();
const from = (location.state as { from?: Location })?.from?.pathname || "/";
if (isAuthenticated) {
return <Navigate to={from} replace />;
}
return children;
};
function AppRoutes() {
const location = useLocation();
const dispatch = useAppDispatch();
const isAuthenticated = useAppSelector(selectisAuthenticated);
const authStatus = useAppSelector(selectAuthStatus);
const token = useAppSelector(state => state.auth.token);
useEffect(() => {
if (token && authStatus === 'idle' && !isAuthenticated) {
try {
const decoded: { exp: number } = jwtDecode(token);
if (decoded.exp * 1000 > Date.now()) {
console.log("[App Effect] Token found, fetching current user...");
dispatch(fetchCurrentUser());
} else {
console.warn("[App Effect] Token found but expired, logging out.");
dispatch(logout());
}
} catch (e) {
console.error("[App Effect] Invalid token found, logging out.");
dispatch(logout());
}
}
}, [token, authStatus, isAuthenticated, dispatch]);
useEffect(() => {
if (isAuthenticated) {
console.log("[App Effect] User is authenticated, connecting WebSocket...");
dispatch(wsConnect());
} else {
console.log("[App Effect] User not authenticated, disconnecting WebSocket...");
dispatch(wsDisconnect());
}
}, [isAuthenticated, dispatch]);
return (
<AnimatePresence mode="wait">
<Routes location={location} key={location.pathname}>
<Route
path="/login"
element={ <PublicRoute><Suspense fallback={<PageLoader />}><LoginPage
/></Suspense></PublicRoute> }
/>
<Route
path="/register"
element={ <PublicRoute><Suspense fallback={<PageLoader />}><RegisterPage
/></Suspense></PublicRoute> }
/>
<Route
path="/*"
element={
<PrivateRoute>
<Layout>
<Suspense fallback={<PageLoader />}>
<Routes>
<Route path="/" element={<DashboardPage />} />
<Route path="/incidents" element={<IncidentsPage />} />
<Route path="/live-feeds" element={<LiveFeedsPage />} />
<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
</Suspense>
</Layout>
</PrivateRoute>
}
/>
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
