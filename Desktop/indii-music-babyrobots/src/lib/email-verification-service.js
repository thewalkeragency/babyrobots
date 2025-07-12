import crypto from 'crypto';
import { getPrismaClient } from './prisma-config.js';

/**
 * Email Verification Service
 * Part of RING 1: Authentication System Database Operations
 */

class EmailVerificationService {
  constructor() {
    this.verificationTokenExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.maxVerificationAttempts = 5; // Maximum verification attempts per day
    this.prisma = null;
    this.initPrisma();
  }

  async initPrisma() {
    try {
      this.prisma = await getPrismaClient();
    } catch (error) {
      console.log('Prisma not available, using fallback for email verification');
    }
  }

  /**
   * Generate email verification token
   * @param {string} email - User email
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Verification token data
   */
  async generateVerificationToken(email, userId) {
    try {
      if (!email || !userId) {
        throw new Error('Email and userId are required');
      }

      // Check rate limiting
      const recentAttempts = await this.getRecentVerificationAttempts(email);
      if (recentAttempts >= this.maxVerificationAttempts) {
        throw new Error('Too many verification attempts. Please try again tomorrow.');
      }

      // Generate cryptographically secure token
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + this.verificationTokenExpiry);

      if (this.prisma) {
        // Use Prisma to store verification token
        await this.prisma.verificationToken.create({
          data: {
            identifier: email,
            token: hashedToken,
            expires: expiresAt
          }
        });

        // Mark user as unverified if not already
        await this.prisma.user.update({
          where: { id: userId },
          data: { emailVerified: null } // Prisma convention for unverified
        });

      } else {
        // Fallback to in-memory storage
        if (!global.emailVerificationTokens) {
          global.emailVerificationTokens = new Map();
        }
        
        global.emailVerificationTokens.set(hashedToken, {
          email,
          userId,
          expires: expiresAt,
          used: false,
          createdAt: new Date()
        });
      }

      return {
        success: true,
        token, // Return unhashed token for email
        verificationUrl: this.generateVerificationUrl(token),
        expiresAt,
        expiresIn: this.verificationTokenExpiry / 1000 // seconds
      };

    } catch (error) {
      console.error('Email verification token generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify email using token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} - Verification result
   */
  async verifyEmail(token) {
    try {
      if (!token) {
        throw new Error('Verification token is required');
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      if (this.prisma) {
        // Use Prisma to verify token
        const verificationRecord = await this.prisma.verificationToken.findUnique({
          where: { token: hashedToken }
        });

        if (!verificationRecord) {
          throw new Error('Invalid verification token');
        }

        if (new Date() > verificationRecord.expires) {
          throw new Error('Verification token has expired');
        }

        // Find user by email and mark as verified
        const user = await this.prisma.user.findUnique({
          where: { email: verificationRecord.identifier }
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Update user as verified and delete the token
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() }
          }),
          this.prisma.verificationToken.delete({
            where: { token: hashedToken }
          })
        ]);

        return {
          success: true,
          userId: user.id,
          email: user.email,
          message: 'Email verified successfully'
        };

      } else {
        // Fallback to in-memory storage
        if (!global.emailVerificationTokens) {
          throw new Error('Invalid verification token');
        }

        const verificationData = global.emailVerificationTokens.get(hashedToken);
        if (!verificationData) {
          throw new Error('Invalid verification token');
        }

        if (verificationData.used) {
          throw new Error('Verification token has already been used');
        }

        if (new Date() > verificationData.expires) {
          throw new Error('Verification token has expired');
        }

        // Mark as used and user as verified
        verificationData.used = true;
        
        // In SQLite fallback, we'd update the user record here
        const { updateUserEmailVerified } = await import('./db.js');
        if (updateUserEmailVerified) {
          updateUserEmailVerified(verificationData.email, true);
        }

        return {
          success: true,
          userId: verificationData.userId,
          email: verificationData.email,
          message: 'Email verified successfully'
        };
      }

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if email is verified
   * @param {string} email - User email
   * @returns {Promise<Object>} - Verification status
   */
  async isEmailVerified(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      if (this.prisma) {
        const user = await this.prisma.user.findUnique({
          where: { email },
          select: { emailVerified: true }
        });

        if (!user) {
          throw new Error('User not found');
        }

        return {
          verified: !!user.emailVerified,
          verifiedAt: user.emailVerified
        };

      } else {
        // Fallback check
        const { getUserByEmail } = await import('./db.js');
        const user = getUserByEmail(email);
        
        if (!user) {
          throw new Error('User not found');
        }

        return {
          verified: !!user.email_verified,
          verifiedAt: user.email_verified_at || null
        };
      }

    } catch (error) {
      console.error('Email verification check error:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Resend result
   */
  async resendVerificationEmail(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      // Check if already verified
      const verificationStatus = await this.isEmailVerified(email);
      if (verificationStatus.verified) {
        return {
          success: false,
          error: 'Email is already verified'
        };
      }

      // Get user ID
      let userId;
      if (this.prisma) {
        const user = await this.prisma.user.findUnique({
          where: { email },
          select: { id: true }
        });
        
        if (!user) {
          throw new Error('User not found');
        }
        userId = user.id;

      } else {
        const { getUserByEmail } = await import('./db.js');
        const user = getUserByEmail(email);
        
        if (!user) {
          throw new Error('User not found');
        }
        userId = user.id;
      }

      // Generate new verification token
      const tokenResult = await this.generateVerificationToken(email, userId);
      
      if (!tokenResult.success) {
        throw new Error(tokenResult.error);
      }

      return {
        success: true,
        verificationUrl: tokenResult.verificationUrl,
        expiresAt: tokenResult.expiresAt,
        message: 'Verification email resent successfully'
      };

    } catch (error) {
      console.error('Resend verification email error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get recent verification attempts count
   * @param {string} email - User email
   * @returns {Promise<number>} - Number of recent attempts
   */
  async getRecentVerificationAttempts(email) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (this.prisma) {
        const count = await this.prisma.verificationToken.count({
          where: {
            identifier: email,
            expires: { gte: oneDayAgo }
          }
        });
        return count;

      } else {
        // Fallback counting
        if (!global.emailVerificationTokens) {
          return 0;
        }

        let count = 0;
        for (const [_, verificationData] of global.emailVerificationTokens.entries()) {
          if (verificationData.email === email && verificationData.createdAt > oneDayAgo) {
            count++;
          }
        }
        return count;
      }

    } catch (error) {
      console.error('Error getting verification attempts:', error);
      return 0;
    }
  }

  /**
   * Generate verification URL
   * @param {string} token - Verification token
   * @returns {string} - Verification URL
   */
  generateVerificationUrl(token) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:9000';
    return `${baseUrl}/auth/verify-email?token=${token}`;
  }

  /**
   * Clean up expired verification tokens
   * @returns {Promise<Object>} - Cleanup result
   */
  async cleanupExpiredTokens() {
    try {
      if (this.prisma) {
        const deleted = await this.prisma.verificationToken.deleteMany({
          where: {
            expires: { lt: new Date() }
          }
        });

        console.log(`Cleaned up ${deleted.count} expired email verification tokens`);
        return { success: true, deleted: deleted.count };

      } else {
        // Fallback cleanup
        if (!global.emailVerificationTokens) {
          return { success: true, deleted: 0 };
        }

        const now = new Date();
        let deletedCount = 0;

        for (const [token, verificationData] of global.emailVerificationTokens.entries()) {
          if (verificationData.expires < now) {
            global.emailVerificationTokens.delete(token);
            deletedCount++;
          }
        }

        console.log(`Cleaned up ${deletedCount} expired email verification tokens`);
        return { success: true, deleted: deletedCount };
      }

    } catch (error) {
      console.error('Verification token cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send verification email (placeholder - integrate with email service)
   * @param {string} email - Recipient email
   * @param {string} verificationUrl - Verification URL
   * @returns {Promise<Object>} - Send result
   */
  async sendVerificationEmail(email, verificationUrl) {
    try {
      // This is a placeholder - integrate with actual email service (SendGrid, Mailgun, etc.)
      console.log(`
=== EMAIL VERIFICATION ===
To: ${email}
Subject: Verify your email address

Please click the link below to verify your email address:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.
=========================
      `);

      // For development, return success
      return {
        success: true,
        message: 'Verification email sent (check console in development)'
      };

    } catch (error) {
      console.error('Send verification email error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get verification statistics
   * @returns {Object} - Verification statistics
   */
  getVerificationStats() {
    if (this.prisma) {
      // In production, you'd query the database for stats
      return {
        message: 'Stats available via database query',
        timestamp: new Date().toISOString()
      };
    } else {
      // Fallback stats
      const activeTokens = global.emailVerificationTokens ? global.emailVerificationTokens.size : 0;
      
      return {
        activeVerificationTokens: activeTokens,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
export const emailVerificationService = new EmailVerificationService();

// Start cleanup interval (every 6 hours)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    emailVerificationService.cleanupExpiredTokens();
  }, 6 * 60 * 60 * 1000); // 6 hours
}

export default emailVerificationService;
