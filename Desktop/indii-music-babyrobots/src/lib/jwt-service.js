import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Enhanced JWT Service with Refresh Tokens and Blacklisting
 * Part of RING 1: Authentication System Database Operations
 */

class JWTService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key';
    
    // In-memory blacklist for tokens (in production, use Redis or database)
    this.tokenBlacklist = new Set();
    this.refreshTokens = new Map(); // userId -> refreshToken mapping
    
    // Token expiration times
    this.accessTokenExpiry = '15m'; // Short-lived access tokens
    this.refreshTokenExpiry = '7d'; // Longer-lived refresh tokens
  }

  /**
   * Generate access and refresh token pair
   * @param {Object} payload - User data to encode
   * @returns {Object} - { accessToken, refreshToken, expiresIn }
   */
  generateTokenPair(payload) {
    try {
      const tokenId = crypto.randomUUID();
      const refreshTokenId = crypto.randomUUID();

      // Create access token with short expiry
      const accessToken = jwt.sign(
        {
          ...payload,
          tokenId,
          type: 'access'
        },
        this.jwtSecret,
        { 
          expiresIn: this.accessTokenExpiry,
          issuer: 'indii-music',
          audience: 'indii-music-app'
        }
      );

      // Create refresh token with longer expiry
      const refreshToken = jwt.sign(
        {
          userId: payload.userId,
          tokenId: refreshTokenId,
          type: 'refresh'
        },
        this.refreshSecret,
        { 
          expiresIn: this.refreshTokenExpiry,
          issuer: 'indii-music',
          audience: 'indii-music-app'
        }
      );

      // Store refresh token mapping
      this.refreshTokens.set(payload.userId, {
        token: refreshToken,
        tokenId: refreshTokenId,
        createdAt: new Date(),
        lastUsed: new Date()
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer'
      };

    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * Verify access token
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded payload or error
   */
  verifyAccessToken(token) {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      // Check if token is blacklisted
      if (this.tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'indii-music',
        audience: 'indii-music-app'
      });

      // Verify token type
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        valid: true,
        payload: decoded
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        expired: error.name === 'TokenExpiredError'
      };
    }
  }

  /**
   * Verify refresh token
   * @param {string} refreshToken - Refresh token to verify
   * @returns {Object} - Verification result
   */
  verifyRefreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token provided');
      }

      const decoded = jwt.verify(refreshToken, this.refreshSecret, {
        issuer: 'indii-music',
        audience: 'indii-music-app'
      });

      // Verify token type
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in our store
      const storedRefreshData = this.refreshTokens.get(decoded.userId);
      if (!storedRefreshData || storedRefreshData.token !== refreshToken) {
        throw new Error('Refresh token not found or invalid');
      }

      return {
        valid: true,
        payload: decoded
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @param {Object} userPayload - User data for new token
   * @returns {Object} - New access token or error
   */
  refreshAccessToken(refreshToken, userPayload) {
    try {
      const verification = this.verifyRefreshToken(refreshToken);
      
      if (!verification.valid) {
        throw new Error(verification.error);
      }

      // Update last used timestamp
      const storedRefreshData = this.refreshTokens.get(verification.payload.userId);
      if (storedRefreshData) {
        storedRefreshData.lastUsed = new Date();
      }

      // Generate new access token
      const tokenId = crypto.randomUUID();
      const accessToken = jwt.sign(
        {
          ...userPayload,
          tokenId,
          type: 'access'
        },
        this.jwtSecret,
        { 
          expiresIn: this.accessTokenExpiry,
          issuer: 'indii-music',
          audience: 'indii-music-app'
        }
      );

      return {
        success: true,
        accessToken,
        expiresIn: 900,
        tokenType: 'Bearer'
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Blacklist a token (logout)
   * @param {string} token - Token to blacklist
   * @param {number} userId - User ID for cleanup
   */
  blacklistToken(token, userId = null) {
    try {
      if (token) {
        this.tokenBlacklist.add(token);
      }

      // Also remove refresh token for this user
      if (userId) {
        this.refreshTokens.delete(userId);
      }

      return { success: true };

    } catch (error) {
      console.error('Token blacklist error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate token and extract user info
   * @param {string} token - JWT token to validate
   * @returns {Object} - User info or error
   */
  validateToken(token) {
    const verification = this.verifyAccessToken(token);
    
    if (!verification.valid) {
      return {
        valid: false,
        error: verification.error,
        needsRefresh: verification.expired
      };
    }

    return {
      valid: true,
      user: {
        userId: verification.payload.userId,
        email: verification.payload.email,
        role: verification.payload.role
      },
      tokenId: verification.payload.tokenId
    };
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  cleanupExpiredTokens() {
    try {
      const now = new Date();
      const refreshTokenExpireTime = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

      // Clean up expired refresh tokens
      for (const [userId, refreshData] of this.refreshTokens.entries()) {
        if (now - refreshData.createdAt > refreshTokenExpireTime) {
          this.refreshTokens.delete(userId);
        }
      }

      // In production, you'd also clean up blacklisted tokens that have expired
      // For now, we'll keep them in memory

      console.log('Token cleanup completed');
      return { success: true };

    } catch (error) {
      console.error('Token cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get token statistics
   * @returns {Object} - Token usage statistics
   */
  getTokenStats() {
    return {
      activeRefreshTokens: this.refreshTokens.size,
      blacklistedTokens: this.tokenBlacklist.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Revoke all tokens for a user
   * @param {number} userId - User ID
   */
  revokeAllUserTokens(userId) {
    try {
      // Remove refresh tokens
      this.refreshTokens.delete(userId);
      
      // Note: In production, you'd also need to blacklist all active access tokens
      // for this user, which would require a database lookup
      
      return { success: true };

    } catch (error) {
      console.error('Token revocation error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
export const jwtService = new JWTService();

// Start cleanup interval (every hour)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    jwtService.cleanupExpiredTokens();
  }, 60 * 60 * 1000); // 1 hour
}

export default jwtService;
