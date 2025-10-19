import React from 'react';

//
// ------------------ THIS IS THE FIX ------------------
//
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
//
// --- 'Outlet' was missing from the line above ---
//

// --- Page Imports ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// Import your other pages here
// import IncidentHistory from './pages/IncidentHistory'; 

// --- Service Imports ---
import AuthService from './services/auth.service';
import ProtectedRoute from './services/ProtectedRoute';

/**
 * A helper component for routes that should *only* be
 * visible to logged-out users (like Login/Register).
 */
const LoggedOutRoute = () => {
  const user = AuthService.getCurrentUser();
  // If user is logged in, redirect them to the dashboard
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* === PROTECTED ROUTES (Must be logged in) === */}
        {/* All routes inside here are now protected by our gatekeeper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/history" element={<IncidentHistory />} /> */}
        </Route>

        {/* === PUBLIC / LOGGED-OUT ROUTES === */}
        {/* All routes inside here are for logged-out users */}
        <Route element={<LoggedOutRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* --- Default Route --- */}
        {/* Redirects user to the correct starting page */}
        <Route 
          path="/" 
          element={
            AuthService.getCurrentUser() 
              ? <Navigate to="/dashboard" /> 
              : <Navigate to="/login" />
          } 
        />
        
        {/* --- 404 Not Found --- */}
        <Route path="*" element={
          <div style={{ padding: '2rem', color: 'white', minHeight: '100vh', background: '#0d0d0d' }}>
            <h2>404 Page Not Found</h2>
            <Link to="/" style={{ color: '#f0c040' }}>Go Home</Link>
          </div>
        } />

      </Routes>
    </Router>
  );
}

export default App;