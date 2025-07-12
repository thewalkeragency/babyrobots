/**
 * Enhanced Session Management Service
 * Task 3: Session Management and Token Handling
 * 
 * Provides comprehensive session lifecycle management including:
 * - Enhanced session tracking with device/location metadata
 * - Session validation and renewal
 * - Concurrent session management
 * - Security monitoring and suspicious activity detection
 */

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

class SessionService {
  constructor() {
    this.prisma = prisma;
    this.maxConcurrentSessions = 5; // Default limit per user
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.suspiciousActivityThreshold = 3; // Failed attempts threshold
  }

  /**
   * Create a new session with enhanced metadata
   */
  async createSession(userId, options = {}) {
    try {
      const {
        deviceInfo,
        ipAddress,
        userAgent,
        location,
        expiresIn = this.sessionTimeout
      } = options;

      // Check concurrent session limit
      await this.enforceConcurrentSessionLimit(userId);

      // Generate session token
      const sessionToken = this.generateSessionToken();
      const expires = new Date(Date.now() + expiresIn);

      // Create session record
      const session = await this.prisma.session.create({
        data: {
          id: crypto.randomUUID(),
          sessionToken,
          userId,
          expires,
          status: 'active',
          deviceInfo,
          ipAddress,
          location,
          userAgent,
          lastActivity: new Date(),
          isRevoked: false
        },
        include: {
          user: true
        }
      });

      // Log session creation
      await this.logSecurityEvent(userId, 'session_created', {
        sessionId: session.id,
        deviceInfo,
        ipAddress,
        location
      });

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Validate and update session activity
   */
  async validateSession(sessionToken) {
    try {
      const session = await this.prisma.session.findUnique({
        where: { sessionToken },
        include: {
          user: true,
          refreshTokens: {
            where: { isRevoked: false },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!session) {
        return { valid: false, reason: 'Session not found' };
      }

      // Check if session is revoked
      if (session.isRevoked || session.status !== 'active') {
        return { valid: false, reason: 'Session revoked or inactive' };
      }

      // Check if session is expired
      if (session.expires < new Date()) {
        await this.expireSession(session.id);
        return { valid: false, reason: 'Session expired' };
      }

      // Update last activity
      await this.updateSessionActivity(session.id);

      return {
        valid: true,
        session,
        user: session.user
      };
    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }

  /**
   * Update session last activity timestamp
   */
  async updateSessionActivity(sessionId, additionalData = {}) {
    try {
      return await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          lastActivity: new Date(),
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
      throw error;
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId, revokedBy = null) {
    try {
      const session = await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'revoked',
          isRevoked: true,
          updatedAt: new Date()
        },
        include: { user: true }
      });

      // Revoke all associated refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: { sessionId },
        data: { isRevoked: true }
      });

      // Log session revocation
      await this.logSecurityEvent(session.userId, 'session_revoked', {
        sessionId,
        revokedBy,
        reason: 'manual_revocation'
      });

      return session;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId, currentSessionId = null) {
    try {
      // Get all active sessions except current one
      const sessionsToRevoke = await this.prisma.session.findMany({
        where: {
          userId,
          status: 'active',
          isRevoked: false,
          ...(currentSessionId && { id: { not: currentSessionId } })
        }
      });

      // Revoke sessions
      await this.prisma.session.updateMany({
        where: {
          userId,
          status: 'active',
          ...(currentSessionId && { id: { not: currentSessionId } })
        },
        data: {
          status: 'revoked',
          isRevoked: true,
          updatedAt: new Date()
        }
      });

      // Revoke associated refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false,
          ...(currentSessionId && { sessionId: { not: currentSessionId } })
        },
        data: { isRevoked: true }
      });

      // Log bulk revocation
      await this.logSecurityEvent(userId, 'sessions_bulk_revoked', {
        revokedCount: sessionsToRevoke.length,
        keepCurrentSession: !!currentSessionId
      });

      return sessionsToRevoke;
    } catch (error) {
      console.error('Error revoking all user sessions:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId) {
    try {
      return await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          user: true,
          refreshTokens: true
        }
      });
    } catch (error) {
      console.error('Error getting session by ID:', error);
      throw error;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId) {
    try {
      return await this.prisma.session.findMany({
        where: {
          userId,
          status: 'active',
          isRevoked: false
        },
        orderBy: { lastActivity: 'desc' },
        select: {
          id: true,
          deviceInfo: true,
          ipAddress: true,
          location: true,
          lastActivity: true,
          createdAt: true,
          expires: true,
          status: true,
          isRevoked: true
        }
      });
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

  /**
   * Enforce concurrent session limits
   */
  async enforceConcurrentSessionLimit(userId) {
    try {
      const activeSessions = await this.prisma.session.findMany({
        where: {
          userId,
          status: 'active',
          isRevoked: false,
          expires: { gt: new Date() }
        },
        orderBy: { lastActivity: 'asc' }
      });

      if (activeSessions.length >= this.maxConcurrentSessions) {
        // Revoke oldest session(s)
        const sessionsToRevoke = activeSessions.slice(0, activeSessions.length - this.maxConcurrentSessions + 1);
        
        for (const session of sessionsToRevoke) {
          await this.revokeSession(session.id, 'concurrent_limit_exceeded');
        }
      }
    } catch (error) {
      console.error('Error enforcing session limit:', error);
      throw error;
    }
  }

  /**
   * Expire a session
   */
  async expireSession(sessionId) {
    try {
      return await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'expired',
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error expiring session:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions (background job)
   */
  async cleanupExpiredSessions() {
    try {
      const expiredSessions = await this.prisma.session.updateMany({
        where: {
          expires: { lt: new Date() },
          status: 'active'
        },
        data: {
          status: 'expired',
          updatedAt: new Date()
        }
      });

      // Also revoke associated refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: {
          expires: { lt: new Date() },
          isRevoked: false
        },
        data: { isRevoked: true }
      });

      console.log(`Cleaned up ${expiredSessions.count} expired sessions`);
      return expiredSessions.count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(userId, ipAddress, userAgent) {
    try {
      // Check for multiple failed login attempts
      const recentFailures = await this.prisma.securityLog.count({
        where: {
          userId,
          action: 'login_failed',
          ipAddress,
          createdAt: {
            gt: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          }
        }
      });

      if (recentFailures >= this.suspiciousActivityThreshold) {
        // Temporarily suspend user sessions
        await this.prisma.session.updateMany({
          where: {
            userId,
            status: 'active'
          },
          data: { status: 'suspended' }
        });

        await this.logSecurityEvent(userId, 'suspicious_activity_detected', {
          reason: 'multiple_failed_logins',
          failureCount: recentFailures,
          ipAddress,
          userAgent
        });

        return { suspicious: true, action: 'sessions_suspended' };
      }

      return { suspicious: false };
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      throw error;
    }
  }

  /**
   * Generate secure session token
   */
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Log security events
   */
  async logSecurityEvent(userId, action, details) {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId,
          action,
          details,
          success: !action.includes('failed'),
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
      // Don't throw - logging failures shouldn't break main functionality
    }
  }
}

export default new SessionService();
