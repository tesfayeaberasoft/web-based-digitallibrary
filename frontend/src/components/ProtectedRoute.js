import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeUserRole } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // User doesn't have required role, redirect to appropriate dashboard
    switch (normalizeUserRole(user.role)) {
      case 'super-admin':
        return <Navigate to="/super-admin" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'librarian':
        return <Navigate to="/librarian" replace />;
      case 'user':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;