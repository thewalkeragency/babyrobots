import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route wrapper component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ 
  children, 
  fallback, 
  requireRole,
  loadingComponent 
}) => {
  const { user, profile, loading, authenticated } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return loadingComponent || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px'
      }}>
        Loading...
      </div>
    );
  }

  // Not authenticated - show fallback or default message
  if (!authenticated || !user) {
    return fallback || (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        margin: '20px auto',
        maxWidth: '400px'
      }}>
        <h2>Authentication Required</h2>
        <p>Please log in to access this content.</p>
      </div>
    );
  }

  // Check role requirements if specified
  if (requireRole) {
    const userRole = user.role || profile?.role;
    
    if (Array.isArray(requireRole)) {
      // Multiple roles allowed
      if (!requireRole.includes(userRole)) {
        return (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            margin: '20px auto',
            maxWidth: '400px',
            backgroundColor: '#ffe0e0'
          }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this content.</p>
            <p>Required role: {requireRole.join(' or ')}</p>
            <p>Your role: {userRole || 'None'}</p>
          </div>
        );
      }
    } else {
      // Single role required
      if (userRole !== requireRole) {
        return (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            margin: '20px auto',
            maxWidth: '400px',
            backgroundColor: '#ffe0e0'
          }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this content.</p>
            <p>Required role: {requireRole}</p>
            <p>Your role: {userRole || 'None'}</p>
          </div>
        );
      }
    }
  }

  // User is authenticated and has required role - render children
  return children;
};

export default ProtectedRoute;
