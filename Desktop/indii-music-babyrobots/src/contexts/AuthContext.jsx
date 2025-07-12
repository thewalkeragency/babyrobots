import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.authenticated) {
        setUser(data.user);
        setProfile(data.profile);
        setAuthenticated(true);
      } else {
        setUser(null);
        setProfile(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
      setProfile(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setAuthenticated(true);
        
        return {
          success: true,
          message: data.message,
          needsProfileSetup: data.needsProfileSetup
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error during login'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setAuthenticated(true);
        
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      // Clear state regardless of response
      setUser(null);
      setProfile(null);
      setAuthenticated(false);

      return {
        success: data.success || true,
        message: data.message || 'Logged out'
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setProfile(null);
      setAuthenticated(false);
      
      return {
        success: true,
        message: 'Logged out (offline)'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user'
        };
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileData
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.message || 'Profile update failed'
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Network error during profile update'
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        return {
          success: true,
          profile: data.profile
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to refresh profile'
        };
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      return {
        success: false,
        error: 'Network error during profile refresh'
      };
    }
  };

  const value = {
    user,
    profile,
    loading,
    authenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
