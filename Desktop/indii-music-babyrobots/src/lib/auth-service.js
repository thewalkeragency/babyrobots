import { getPrismaClient } from './prisma-config.js';
import bcrypt from 'bcrypt';
import { getUserByEmail, createUser, verifyPassword } from './db.js';
import jwt from 'jsonwebtoken';
import { supabaseAuth, supabaseDB, createSupabaseClient, validateSupabaseConfig } from './supabase-config.js';

/**
 * Authentication Service Layer
 * Integrates Supabase Auth with existing user profile system
 * Falls back to SQLite when Supabase is not configured
 */

export class AuthService {
  constructor() {
    this.hasSupabase = validateSupabaseConfig().isValid;
    this.client = this.hasSupabase ? createSupabaseClient() : null;
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
  }

  /**
   * Register a new user with Supabase Auth or SQLite fallback
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (artist, fan, licensor, service_provider)
   * @param {Object} userData.profile - Role-specific profile data
   */
  async register(userData) {
    try {
      const { email, password, role, profile = {} } = userData;

      // Validate required fields
      if (!email || !password || !role) {
        throw new Error('Email, password, and role are required');
      }

      if (this.hasSupabase && this.client) {
        // Use Supabase Auth
        const { data: authData, error: authError } = await this.client.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              displayName: profile.displayName || email.split('@')[0]
            }
          }
        });

        if (authError) {
          throw new Error(`Registration failed: ${authError.message}`);
        }

        // Create user profile in our database
        const userProfileData = {
          id: authData.user.id,
          email: authData.user.email,
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const { data: dbUser, error: dbError } = await supabaseDB.createUser(userProfileData);

        if (dbError) {
          console.error('Database user creation failed:', dbError);
          throw new Error('Failed to create user profile');
        }

        // Create role-specific profile
        if (Object.keys(profile).length > 0) {
          await this.createRoleProfile(dbUser.id, role, profile);
        }

        return {
          success: true,
          user: authData.user,
          profile: dbUser,
          message: 'Registration successful'
        };
      } else {
        // Fallback to SQLite registration - createUser handles password hashing internally
        const userId = createUser(email, password, role);
        
        if (!userId) {
          throw new Error('Failed to create user');
        }

        // Get the created user to return complete data
        const newUser = getUserByEmail(email);
        
        if (!newUser) {
          throw new Error('Failed to retrieve created user');
        }

        // Generate JWT token for immediate login
        const token = jwt.sign(
          { 
            userId: newUser.id, 
            email: newUser.email,
            role: newUser.role 
          },
          this.jwtSecret,
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
          },
          token,
          message: 'Registration successful'
        };
      }

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign in user with Supabase Auth or SQLite fallback
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async signIn(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (this.hasSupabase) {
        // Use Supabase Auth
        const { data: authData, error: authError } = await supabaseAuth.signIn(email, password);

        if (authError) {
          throw new Error(`Sign in failed: ${authError.message}`);
        }

        // Get user profile from our database
        const { data: userProfile, error: profileError } = await supabaseDB.getUserByEmail(email);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return {
            success: true,
            user: authData.user,
            profile: null,
            needsProfileSetup: true,
            message: 'Sign in successful, profile setup required'
          };
        }

        return {
          success: true,
          user: authData.user,
          profile: userProfile,
          message: 'Sign in successful'
        };
      } else {
        // Fallback to SQLite auth
        const user = getUserByEmail(email);
        
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = verifyPassword(password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Generate JWT token for session
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email,
            role: user.role 
          },
          this.jwtSecret,
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          token,
          message: 'Sign in successful'
        };
      }

    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      if (this.hasSupabase) {
        const { error } = await supabaseAuth.signOut();
        
        if (error) {
          throw new Error(`Sign out failed: ${error.message}`);
        }
      } else {
        // For SQLite, signout is just clearing the client-side token
        // The actual token invalidation would be handled client-side
        console.log('SQLite signout - token should be cleared client-side');
      }

      return {
        success: true,
        message: 'Sign out successful'
      };

    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(token = null) {
    try {
      if (this.hasSupabase) {
        const { data: sessionData, error: sessionError } = await supabaseAuth.getSession();
        
        if (sessionError || !sessionData.session) {
          return {
            success: false,
            user: null,
            authenticated: false
          };
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabaseDB.getUserByEmail(
          sessionData.session.user.email
        );

        return {
          success: true,
          user: sessionData.session.user,
          profile: userProfile,
          authenticated: true,
          session: sessionData.session
        };
      } else {
        // SQLite fallback - validate JWT token
        if (!token) {
          return {
            success: false,
            user: null,
            authenticated: false,
            error: 'No token provided'
          };
        }

        try {
          const decoded = jwt.verify(token, this.jwtSecret);
          const user = getUserByEmail(decoded.email);
          
          if (!user) {
            return {
              success: false,
              user: null,
              authenticated: false,
              error: 'User not found'
            };
          }

          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            },
            authenticated: true,
            profile: user
          };
        } catch (jwtError) {
          return {
            success: false,
            user: null,
            authenticated: false,
            error: 'Invalid token'
          };
        }
      }

    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        user: null,
        authenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Validate session token
   */
  async validateSession(token) {
    try {
      if (!token) {
        return { valid: false, error: 'No token provided' };
      }

      if (this.hasSupabase) {
        const { data: userData, error } = await supabaseAuth.getUser();
        
        if (error || !userData.user) {
          return { valid: false, error: 'Invalid session' };
        }

        return {
          valid: true,
          user: userData.user
        };
      } else {
        // SQLite fallback - validate JWT token
        try {
          const decoded = jwt.verify(token, this.jwtSecret);
          const user = getUserByEmail(decoded.email);
          
          if (!user) {
            return { valid: false, error: 'User not found' };
          }

          return {
            valid: true,
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            }
          };
        } catch (jwtError) {
          return { valid: false, error: 'Invalid token' };
        }
      }

    } catch (error) {
      console.error('Session validation error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Create role-specific profile
   */
  async createRoleProfile(userId, role, profileData) {
    try {
      const tableMap = {
        artist: 'artistProfile',
        fan: 'fanProfile', 
        licensor: 'licensorProfile',
        service_provider: 'serviceProviderProfile'
      };

      const tableName = tableMap[role];
      if (!tableName) {
        throw new Error(`Invalid role: ${role}`);
      }

      const profileWithUserId = {
        ...profileData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabaseDB.createProfile(tableName, profileWithUserId);

      if (error) {
        throw new Error(`Failed to create ${role} profile: ${error.message}`);
      }

      return { success: true, profile: data };

    } catch (error) {
      console.error('Create role profile error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      // Get current user to determine role
      const { data: currentUser, error: userError } = await supabaseDB.getUserById(userId);
      
      if (userError || !currentUser) {
        throw new Error('User not found');
      }

      const role = currentUser.role;
      const tableMap = {
        artist: 'artistProfile',
        fan: 'fanProfile',
        licensor: 'licensorProfile', 
        service_provider: 'serviceProviderProfile'
      };

      const tableName = tableMap[role];
      if (!tableName) {
        throw new Error(`Invalid role: ${role}`);
      }

      const updatedProfile = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabaseDB.updateProfile(tableName, userId, updatedProfile);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return { success: true, profile: data };

    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Password reset request
   */
  async requestPasswordReset(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw new Error(`Password reset failed: ${error.message}`);
      }

      return {
        success: true,
        message: 'Password reset email sent'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      if (!newPassword) {
        throw new Error('New password is required');
      }

      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(`Password update failed: ${error.message}`);
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };

    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * OAuth provider sign in
   */
  async signInWithProvider(provider, options = {}) {
    try {
      const validProviders = ['google', 'apple', 'facebook', 'github'];
      
      if (!validProviders.includes(provider)) {
        throw new Error(`Invalid provider: ${provider}`);
      }

      const { data, error } = await this.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options.redirectTo || `${window.location.origin}/auth/callback`,
          ...options
        }
      });

      if (error) {
        throw new Error(`OAuth sign in failed: ${error.message}`);
      }

      return {
        success: true,
        data,
        message: `${provider} sign in initiated`
      };

    } catch (error) {
      console.error('OAuth sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback() {
    try {
      const { data: sessionData, error } = await this.client.auth.getSession();
      
      if (error) {
        throw new Error(`OAuth callback error: ${error.message}`);
      }

      if (!sessionData.session) {
        throw new Error('No session found after OAuth callback');
      }

      // Check if user profile exists in our database
      const { data: userProfile, error: profileError } = await supabaseDB.getUserByEmail(
        sessionData.session.user.email
      );

      if (profileError) {
        // User authenticated via OAuth but no profile exists - needs profile setup
        return {
          success: true,
          user: sessionData.session.user,
          profile: null,
          needsProfileSetup: true,
          message: 'OAuth authentication successful, profile setup required'
        };
      }

      return {
        success: true,
        user: sessionData.session.user,
        profile: userProfile,
        authenticated: true,
        message: 'OAuth authentication successful'
      };

    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

export default authService;
