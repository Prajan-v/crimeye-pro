import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from './auth.service';

/**
 * This component checks if a user is authenticated.
 * If yes, it renders the child components (e.g., the Dashboard).
 * If no, it redirects the user to the /login page.
 */
const ProtectedRoute = () => {
  const user = AuthService.getCurrentUser(); // Checks if token is valid and not expired

  if (!user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child route (e.g., <Dashboard />)
  return <Outlet />;
};

export default ProtectedRoute;