import { passwordService } from '../../../src/lib/password-service.js';
import { emailVerificationService } from '../../../src/lib/email-verification-service.js';

/**
 * Password Reset API Endpoint
 * Part of RING 1: Authentication System Database Operations
 * 
 * Handles both:
 * - POST /api/auth/reset-password (request reset)
 * - PUT /api/auth/reset-password (complete reset with token)
 */

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Request password reset
      return await handlePasswordResetRequest(req, res);
    } else if (req.method === 'PUT') {
      // Complete password reset with token
      return await handlePasswordResetComplete(req, res);
    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('Password reset API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Handle password reset request (generate token and send email)
 */
async function handlePasswordResetRequest(req, res) {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Generate password reset token
    const resetResult = await passwordService.generatePasswordResetToken(email);

    if (!resetResult.success) {
      return res.status(400).json({
        success: false,
        error: resetResult.error
      });
    }

    // Send password reset email (mock implementation)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:9000'}/auth/reset-password?token=${resetResult.token}`;
    
    // In production, integrate with actual email service
    console.log(`
=== PASSWORD RESET EMAIL ===
To: ${email}
Subject: Reset your password

Someone requested a password reset for your account.

If this was you, click the link below to reset your password:
${resetUrl}

This link will expire in 15 minutes.

If you didn't request this, please ignore this email.
============================
    `);

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      expiresAt: resetResult.expiresAt,
      expiresIn: resetResult.expiresIn
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
}

/**
 * Handle password reset completion (validate token and update password)
 */
async function handlePasswordResetComplete(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Input validation
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, new password, and confirmation are required'
      });
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password confirmation does not match'
      });
    }

    // Validate password strength
    const strengthCheck = passwordService.validatePasswordStrength(newPassword);
    if (!strengthCheck.isStrong) {
      return res.status(400).json({
        success: false,
        error: strengthCheck.message,
        requirements: strengthCheck.requirements
      });
    }

    // Verify token and reset password
    const resetResult = await passwordService.resetPassword(token, newPassword);

    if (!resetResult.success) {
      return res.status(400).json({
        success: false,
        error: resetResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Password reset completion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
}
