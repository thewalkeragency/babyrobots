/**
 * Token Management Service
 * Task 3: Session Management and Token Handling
 * 
 * Handles JWT refresh tokens, access tokens, and token rotation
 * Provides secure token lifecycle management with blacklisting
 */

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

class TokenService {
  constructor() {
    this.prisma = prisma;
    this.accessTokenSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    this.accessTokenExpiry = '15m'; // 15 minutes
    this.refreshTokenExpiry = '7d'; // 7 days
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'indii-music',
      audience: 'indii-music-api'
    });
  }

  /**
   * Generate and store refresh token
   */
  async generateRefreshToken(userId, sessionId) {
    try {
      const token = crypto.randomBytes(40).toString('hex');
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const refreshToken = await this.prisma.refreshToken.create({
        data: {
          id: crypto.randomUUID(),
          token,
          sessionId,
          userId,
          expires,
          isRevoked: false
        }
      });

      return refreshToken;
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw error;
    }
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      console.error('Error verifying access token:', error);
      return null;
    }
  }

  /**
   * Validate refresh token and generate new access token
   */
  async refreshAccessToken(refreshTokenString) {
    try {
      // Find refresh token in database
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenString },
        include: {
          user: true,
          session: true
        }
      });

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      // Check if token is revoked
      if (refreshToken.isRevoked) {
        throw new Error('Refresh token has been revoked');
      }

      // Check if token is expired
      if (refreshToken.expires < new Date()) {
        await this.revokeRefreshToken(refreshToken.id);
        throw new Error('Refresh token has expired');
      }

      // Check if associated session is valid
      if (refreshToken.session.status !== 'active' || refreshToken.session.isRevoked) {
        await this.revokeRefreshToken(refreshToken.id);
        throw new Error('Associated session is invalid');
      }

      // Generate new access token
      const accessTokenPayload = {
        userId: refreshToken.userId,
        email: refreshToken.user.email,
        sessionId: refreshToken.sessionId,
        iat: Math.floor(Date.now() / 1000)
      };

      const accessToken = this.generateAccessToken(accessTokenPayload);

      // Optionally rotate refresh token (more secure)
      let newRefreshToken = null;
      if (this.shouldRotateRefreshToken(refreshToken)) {
        newRefreshToken = await this.rotateRefreshToken(refreshToken);
      }

      return {
        accessToken,
        refreshToken: newRefreshToken ? newRefreshToken.token : refreshTokenString,
        expiresIn: this.parseExpiryToSeconds(this.accessTokenExpiry)
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Rotate refresh token for enhanced security
   */
  async rotateRefreshToken(oldRefreshToken) {
    try {
      // Generate new refresh token
      const newToken = await this.generateRefreshToken(
        oldRefreshToken.userId,
        oldRefreshToken.sessionId
      );

      // Mark old token as rotated
      await this.prisma.refreshToken.update({
        where: { id: oldRefreshToken.id },
        data: {
          isRevoked: true,
          updatedAt: new Date()
        }
      });

      // Link rotation for audit trail
      await this.prisma.refreshToken.update({
        where: { id: newToken.id },
        data: { rotatedFrom: oldRefreshToken.id }
      });

      return newToken;
    } catch (error) {
      console.error('Error rotating refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(refreshTokenId) {
    try {
      return await this.prisma.refreshToken.update({
        where: { id: refreshTokenId },
        data: {
          isRevoked: true,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserRefreshTokens(userId) {
    try {
      const result = await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false
        },
        data: {
          isRevoked: true,
          updatedAt: new Date()
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error revoking all user refresh tokens:', error);
      throw error;
    }
  }

  /**
   * Create API access token with specific scope
   */
  async createApiAccessToken(userId, scope = 'api_access', expiresIn = '30d') {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + this.parseExpiryToMilliseconds(expiresIn));

      const accessToken = await this.prisma.accessToken.create({
        data: {
          id: crypto.randomUUID(),
          token,
          userId,
          expires,
          scope,
          purpose: 'api_access',
          isRevoked: false
        }
      });

      return accessToken;
    } catch (error) {
      console.error('Error creating API access token:', error);
      throw error;
    }
  }

  /**
   * Validate API access token
   */
  async validateApiAccessToken(tokenString) {
    try {
      const accessToken = await this.prisma.accessToken.findUnique({
        where: { token: tokenString },
        include: { user: true }
      });

      if (!accessToken) {
        return { valid: false, reason: 'Token not found' };
      }

      if (accessToken.isRevoked) {
        return { valid: false, reason: 'Token revoked' };
      }

      if (accessToken.expires < new Date()) {
        await this.revokeApiAccessToken(accessToken.id);
        return { valid: false, reason: 'Token expired' };
      }

      return {
        valid: true,
        token: accessToken,
        user: accessToken.user
      };
    } catch (error) {
      console.error('Error validating API access token:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }

  /**
   * Revoke API access token
   */
  async revokeApiAccessToken(tokenId) {
    try {
      return await this.prisma.accessToken.update({
        where: { id: tokenId },
        data: {
          isRevoked: true,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error revoking API access token:', error);
      throw error;
    }
  }

  /**
   * Get user's API tokens
   */
  async getUserApiTokens(userId) {
    try {
      return await this.prisma.accessToken.findMany({
        where: {
          userId,
          purpose: 'api_access',
          isRevoked: false,
          expires: { gt: new Date() }
        },
        select: {
          id: true,
          scope: true,
          createdAt: true,
          expires: true,
          // Don't return actual token for security
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting user API tokens:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens (background job)
   */
  async cleanupExpiredTokens() {
    try {
      // Clean up expired refresh tokens
      const expiredRefreshTokens = await this.prisma.refreshToken.updateMany({
        where: {
          expires: { lt: new Date() },
          isRevoked: false
        },
        data: { isRevoked: true }
      });

      // Clean up expired access tokens
      const expiredAccessTokens = await this.prisma.accessToken.updateMany({
        where: {
          expires: { lt: new Date() },
          isRevoked: false
        },
        data: { isRevoked: true }
      });

      console.log(`Cleaned up ${expiredRefreshTokens.count} refresh tokens and ${expiredAccessTokens.count} access tokens`);
      
      return {
        refreshTokens: expiredRefreshTokens.count,
        accessTokens: expiredAccessTokens.count
      };
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  /**
   * Check if refresh token should be rotated
   */
  shouldRotateRefreshToken(refreshToken) {
    // Rotate if token is more than halfway to expiry
    const now = new Date();
    const created = new Date(refreshToken.createdAt);
    const expires = new Date(refreshToken.expires);
    
    const totalLifetime = expires.getTime() - created.getTime();
    const timeUsed = now.getTime() - created.getTime();
    
    return timeUsed > totalLifetime * 0.5;
  }

  /**
   * Parse expiry string to seconds
   */
  parseExpiryToSeconds(expiry) {
    const matches = expiry.match(/^(\d+)([smhdw])$/);
    if (!matches) return 900; // Default 15 minutes
    
    const value = parseInt(matches[1]);
    const unit = matches[2];
    
    const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800
    };
    
    return value * (multipliers[unit] || 60);
  }

  /**
   * Parse expiry string to milliseconds
   */
  parseExpiryToMilliseconds(expiry) {
    return this.parseExpiryToSeconds(expiry) * 1000;
  }

  /**
   * Blacklist a JWT token (for immediate revocation)
   */
  async blacklistToken(tokenHash, expiresAt) {
    try {
      // In production, you might want to use Redis for this
      // For now, we'll store in database
      await this.prisma.accessToken.create({
        data: {
          id: crypto.randomUUID(),
          token: tokenHash,
          userId: 0, // Special user ID for blacklisted tokens
          expires: expiresAt,
          purpose: 'service_auth', // Special purpose for blacklisted tokens
          isRevoked: true
        }
      });
    } catch (error) {
      console.error('Error blacklisting token:', error);
      throw error;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(tokenHash) {
    try {
      const blacklistedToken = await this.prisma.accessToken.findUnique({
        where: {
          token: tokenHash
        }
      });

      return blacklistedToken && blacklistedToken.isRevoked;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }
}

export default new TokenService();
