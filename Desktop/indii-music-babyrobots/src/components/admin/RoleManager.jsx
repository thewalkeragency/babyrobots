/**
 * Role Manager Component
 * Admin interface for managing user roles and permissions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleManager = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load initial data
  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles/list', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setRoles(data.availableRoles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // This would need a dedicated API endpoint for listing users
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Mock data for demo purposes
      setUsers([]);
    }
  };

  const assignRole = async (userId, roleName) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, roleName })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Role '${roleName}' assigned successfully`);
        loadUsers(); // Refresh user list
      } else {
        setError(data.error || 'Failed to assign role');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const revokeRole = async (userId, roleName) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/roles/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, roleName })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Role '${roleName}' revoked successfully`);
        loadUsers(); // Refresh user list
      } else {
        setError(data.error || 'Failed to revoke role');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async (userId, permissionName) => {
    try {
      const response = await fetch('/api/roles/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, permissionName })
      });

      const data = await response.json();
      return data.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to access the role manager.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Role Manager</h1>
      
      {/* Status Messages */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          color: '#2e7d32',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {/* Available Roles */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Available Roles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {roles.map(role => (
            <div key={role.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{role.displayName}</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                {role.description}
              </p>
              <div style={{ fontSize: '12px', color: '#888' }}>
                <div>Level: {role.level}</div>
                <div>System Role: {role.isSystem ? 'Yes' : 'No'}</div>
                <div>Permissions: {role.rolePermissions?.length || 0}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Management */}
      <div>
        <h2>User Role Management</h2>
        
        {users.length === 0 ? (
          <p>No users found. (User listing API endpoint needed)</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {users.map(userData => (
              <div key={userData.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff'
              }}>
                <h3 style={{ margin: '0 0 15px 0' }}>
                  {userData.email}
                  {userData.id === user.id && <span style={{ color: '#666', fontSize: '14px' }}> (You)</span>}
                </h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Current Roles:</strong>
                  {userData.userRoles && userData.userRoles.length > 0 ? (
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {userData.userRoles.map(userRole => (
                        <li key={userRole.id} style={{ marginBottom: '5px' }}>
                          <span>{userRole.role.displayName}</span>
                          {userRole.role.name !== 'super_admin' && (
                            <button
                              onClick={() => revokeRole(userData.id, userRole.role.name)}
                              disabled={loading}
                              style={{
                                marginLeft: '10px',
                                padding: '2px 8px',
                                fontSize: '12px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Revoke
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: '5px 0', color: '#666' }}>No roles assigned</p>
                  )}
                </div>

                <div>
                  <strong>Assign Role:</strong>
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {roles.map(role => {
                      const hasRole = userData.userRoles?.some(ur => ur.role.name === role.name);
                      return (
                        <button
                          key={role.id}
                          onClick={() => assignRole(userData.id, role.name)}
                          disabled={loading || hasRole}
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            backgroundColor: hasRole ? '#ccc' : '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: hasRole ? 'not-allowed' : 'pointer',
                            opacity: hasRole ? 0.6 : 1
                          }}
                        >
                          {role.displayName}
                          {hasRole && ' ✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Testing */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Permission Testing</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Test permission checking for the current user:
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            'manage_users',
            'create_track',
            'update_profile',
            'access_admin',
            'moderate_content'
          ].map(permission => (
            <button
              key={permission}
              onClick={async () => {
                const hasPermission = await checkPermission(user.id, permission);
                alert(`Permission '${permission}': ${hasPermission ? 'GRANTED' : 'DENIED'}`);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test: {permission}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
