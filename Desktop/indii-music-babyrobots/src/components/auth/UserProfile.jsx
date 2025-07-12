import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * User Profile Display Component
 * Shows current user information and allows logout
 */
const UserProfile = ({ showLogout = true, onLogout }) => {
  const { user, profile, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const result = await logout();
      
      if (onLogout) {
        onLogout(result);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No user logged in
      </div>
    );
  }

  const userRole = user.role || profile?.role || 'Unknown';
  
  // Get role-specific profile data
  const roleProfile = profile ? (
    profile.artistProfile || 
    profile.fanProfile || 
    profile.licensorProfile || 
    profile.serviceProviderProfile
  ) : null;

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      maxWidth: '400px', 
      margin: '20px auto',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>User Profile</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Email:</strong> {user.email}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Role:</strong> 
        <span style={{ 
          marginLeft: '8px',
          padding: '2px 8px',
          backgroundColor: getRoleColor(userRole),
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          textTransform: 'capitalize'
        }}>
          {userRole.replace('_', ' ')}
        </span>
      </div>
      
      {roleProfile && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Profile Details:</strong>
          <div style={{ 
            marginTop: '5px', 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {renderRoleProfile(userRole, roleProfile)}
          </div>
        </div>
      )}
      
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
        User ID: {user.id}
      </div>
      
      {showLogout && (
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isLoggingOut ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      )}
    </div>
  );
};

// Helper function to get role-specific colors
const getRoleColor = (role) => {
  const colors = {
    artist: '#e74c3c',
    fan: '#3498db',
    licensor: '#f39c12',
    service_provider: '#27ae60',
    provider: '#27ae60'
  };
  return colors[role] || '#6c757d';
};

// Helper function to render role-specific profile information
const renderRoleProfile = (role, roleProfile) => {
  switch (role) {
    case 'artist':
      return (
        <>
          {roleProfile.artistName && <div><strong>Artist Name:</strong> {roleProfile.artistName}</div>}
          {roleProfile.genre && <div><strong>Genre:</strong> {roleProfile.genre}</div>}
          {roleProfile.bio && <div><strong>Bio:</strong> {roleProfile.bio}</div>}
          {roleProfile.location && <div><strong>Location:</strong> {roleProfile.location}</div>}
        </>
      );
    
    case 'fan':
      return (
        <>
          {roleProfile.displayName && <div><strong>Display Name:</strong> {roleProfile.displayName}</div>}
          {roleProfile.favoriteGenres && <div><strong>Favorite Genres:</strong> {roleProfile.favoriteGenres}</div>}
          {roleProfile.location && <div><strong>Location:</strong> {roleProfile.location}</div>}
          {roleProfile.bio && <div><strong>Bio:</strong> {roleProfile.bio}</div>}
        </>
      );
    
    case 'licensor':
      return (
        <>
          {roleProfile.companyName && <div><strong>Company:</strong> {roleProfile.companyName}</div>}
          {roleProfile.contactPerson && <div><strong>Contact Person:</strong> {roleProfile.contactPerson}</div>}
          {roleProfile.industryFocus && <div><strong>Industry Focus:</strong> {roleProfile.industryFocus}</div>}
        </>
      );
    
    case 'service_provider':
    case 'provider':
      return (
        <>
          {roleProfile.companyName && <div><strong>Company:</strong> {roleProfile.companyName}</div>}
          {roleProfile.serviceType && <div><strong>Service Type:</strong> {roleProfile.serviceType}</div>}
          {roleProfile.description && <div><strong>Description:</strong> {roleProfile.description}</div>}
        </>
      );
    
    default:
      return <div>Profile details not available</div>;
  }
};

export default UserProfile;
