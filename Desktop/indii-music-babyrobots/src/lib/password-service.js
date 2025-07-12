import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getPrismaClient } from './prisma-config.js';

/**
 * Enhanced Password Security Service
 * Part of RING 1: Authentication System Database Operations
 */

class PasswordService {
  constructor() {
    this.saltRounds = 12; // High security salt rounds
    this.resetTokenExpiry = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.maxResetAttempts = 3; // Maximum reset attempts per hour
    this.prisma = null;
    this.initPrisma();
  }

  async initPrisma() {
    try {
      this.prisma = await getPrismaClient();
    } catch (error) {
      console.log('Prisma not available, using SQLite fallback for password operations');
    }
  }

  /**
   * Hash password with enhanced security
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    try {
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Validate password strength
      const strengthCheck = this.validatePasswordStrength(password);
      if (!strengthCheck.isStrong) {
        throw new Error(`Password is too weak: ${strengthCheck.message}`);
      }

      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;

    } catch (error) {
      console.error('Password hashing error:', error);
      throw error;
    }
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Stored password hash
   * @returns {Promise<boolean>} - Password matches
   */
  async verifyPassword(password, hash) {
    try {
      if (!password || !hash) {
        return false;
      }

      const isValid = await bcrypt.compare(password, hash);
      return isValid;

    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonPasswords: !this.isCommonPassword(password)
    };

    const passedCount = Object.values(requirements).filter(Boolean).length;
    const isStrong = passedCount >= 5; // Require at least 5 out of 6 criteria

    let message = '';
    if (!requirements.minLength) message += 'At least 8 characters. ';
    if (!requirements.hasUppercase) message += 'One uppercase letter. ';
    if (!requirements.hasLowercase) message += 'One lowercase letter. ';
    if (!requirements.hasNumbers) message += 'One number. ';
    if (!requirements.hasSpecialChars) message += 'One special character. ';
    if (!requirements.noCommonPasswords) message += 'Avoid common passwords. ';

    return {
      isStrong,
      score: passedCount,
      requirements,
      message: isStrong ? 'Password is strong' : message.trim()
    };
  }

  /**
   * Check if password is commonly used
   * @param {string} password - Password to check
   * @returns {boolean} - Is common password
   */
  isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'dragon', 'master', 'hello', 'login'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate secure password reset token
   * @param {string} email - User email
   * @returns {Promise<Object>} - Reset token data
   */
  async generatePasswordResetToken(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      // Check rate limiting (max 3 attempts per hour)
      const recentAttempts = await this.getRecentResetAttempts(email);
      if (recentAttempts >= this.maxResetAttempts) {
        throw new Error('Too many password reset attempts. Please try again later.');
      }

      // Generate cryptographically secure token
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + this.resetTokenExpiry);

      if (this.prisma) {
        // Use Prisma to store reset token
        await this.prisma.passwordReset.create({
          data: {
            user: {
              connect: { email }
            },
            token: hashedToken,
            expires: expiresAt,
            used: false
          }
        });
      } else {
        // Fallback to in-memory storage (not recommended for production)
        if (!global.passwordResetTokens) {
          global.passwordResetTokens = new Map();
        }
        
        global.passwordResetTokens.set(hashedToken, {
          email,
          expires: expiresAt,
          used: false,
          createdAt: new Date()
        });
      }

      return {
        success: true,
        token, // Return unhashed token for email
        expiresAt,
        expiresIn: this.resetTokenExpiry / 1000 // seconds
      };

    } catch (error) {
      console.error('Password reset token generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} - Verification result
   */
  async verifyPasswordResetToken(token) {
    try {
      if (!token) {
        throw new Error('Reset token is required');
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      if (this.prisma) {
        // Use Prisma to verify token
        const resetRecord = await this.prisma.passwordReset.findUnique({
          where: { token: hashedToken },
          include: { user: true }
        });

        if (!resetRecord) {
          throw new Error('Invalid reset token');
        }

        if (resetRecord.used) {
          throw new Error('Reset token has already been used');
        }

        if (new Date() > resetRecord.expires) {
          throw new Error('Reset token has expired');
        }

        return {
          valid: true,
          userId: resetRecord.user.id,
          email: resetRecord.user.email,
          tokenId: resetRecord.id
        };

      } else {
        // Fallback to in-memory storage
        if (!global.passwordResetTokens) {
          throw new Error('Invalid reset token');
        }

        const resetData = global.passwordResetTokens.get(hashedToken);
        if (!resetData) {
          throw new Error('Invalid reset token');
        }

        if (resetData.used) {
          throw new Error('Reset token has already been used');
        }

        if (new Date() > resetData.expires) {
          throw new Error('Reset token has expired');
        }

        return {
          valid: true,
          email: resetData.email,
          tokenData: resetData
        };
      }

    } catch (error) {
      console.error('Password reset token verification error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify token first
      const tokenVerification = await this.verifyPasswordResetToken(token);
      if (!tokenVerification.valid) {
        throw new Error(tokenVerification.error);
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      if (this.prisma) {
        // Use Prisma to update password and mark token as used
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: tokenVerification.userId },
            data: { passwordHash: hashedPassword }
          }),
          this.prisma.passwordReset.update({
            where: { id: tokenVerification.tokenId },
            data: { used: true }
          })
        ]);

        // Revoke all existing sessions for security
        await this.prisma.session.deleteMany({
          where: { userId: tokenVerification.userId }
        });

      } else {
        // Fallback to SQLite/in-memory
        const { updateUserPassword } = await import('./db.js');
        updateUserPassword(tokenVerification.email, hashedPassword);

        // Mark token as used
        if (global.passwordResetTokens) {
          const resetData = global.passwordResetTokens.get(hashedToken);
          if (resetData) {
            resetData.used = true;
          }
        }
      }

      return {
        success: true,
        message: 'Password reset successful'
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
   * Get recent password reset attempts count
   * @param {string} email - User email
   * @returns {Promise<number>} - Number of recent attempts
   */
  async getRecentResetAttempts(email) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (this.prisma) {
        const count = await this.prisma.passwordReset.count({
          where: {
            user: { email },
            createdAt: { gte: oneHourAgo }
          }
        });
        return count;
      } else {
        // Fallback counting (simplified)
        if (!global.passwordResetTokens) {
          return 0;
        }

        let count = 0;
        for (const [_, resetData] of global.passwordResetTokens.entries()) {
          if (resetData.email === email && resetData.createdAt > oneHourAgo) {
            count++;
          }
        }
        return count;
      }

    } catch (error) {
      console.error('Error getting reset attempts:', error);
      return 0;
    }
  }

  /**
   * Clean up expired reset tokens
   * @returns {Promise<Object>} - Cleanup result
   */
  async cleanupExpiredTokens() {
    try {
      if (this.prisma) {
        const deleted = await this.prisma.passwordReset.deleteMany({
          where: {
            expires: { lt: new Date() }
          }
        });

        console.log(`Cleaned up ${deleted.count} expired password reset tokens`);
        return { success: true, deleted: deleted.count };

      } else {
        // Fallback cleanup
        if (!global.passwordResetTokens) {
          return { success: true, deleted: 0 };
        }

        const now = new Date();
        let deletedCount = 0;

        for (const [token, resetData] of global.passwordResetTokens.entries()) {
          if (resetData.expires < now) {
            global.passwordResetTokens.delete(token);
            deletedCount++;
          }
        }

        console.log(`Cleaned up ${deletedCount} expired password reset tokens`);
        return { success: true, deleted: deletedCount };
      }

    } catch (error) {
      console.error('Token cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate secure random password
   * @param {number} length - Password length (default 16)
   * @returns {string} - Generated password
   */
  generateSecurePassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill remaining length with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Create singleton instance
export const passwordService = new PasswordService();

// Start cleanup interval (every hour)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    passwordService.cleanupExpiredTokens();
  }, 60 * 60 * 1000); // 1 hour
}

export default passwordService;
