import { emailVerificationService } from '../../../src/lib/email-verification-service.js';

/**
 * Email Verification API Endpoint
 * Part of RING 1: Authentication System Database Operations
 * 
 * Handles:
 * - POST /api/auth/verify-email (verify email with token)
 * - PUT /api/auth/verify-email (resend verification email)
 */

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Verify email with token
      return await handleEmailVerification(req, res);
    } else if (req.method === 'PUT') {
      // Resend verification email
      return await handleResendVerification(req, res);
    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('Email verification API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Handle email verification using token
 */
async function handleEmailVerification(req, res) {
  try {
    const { token } = req.body;

    // Input validation
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    // Verify the email
    const verificationResult = await emailVerificationService.verifyEmail(token);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        error: verificationResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: verificationResult.message,
      userId: verificationResult.userId,
      email: verificationResult.email
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
}

/**
 * Handle resending verification email
 */
async function handleResendVerification(req, res) {
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

    // Resend verification email
    const resendResult = await emailVerificationService.resendVerificationEmail(email);

    if (!resendResult.success) {
      return res.status(400).json({
        success: false,
        error: resendResult.error
      });
    }

    // Send the verification email (mock implementation)
    await emailVerificationService.sendVerificationEmail(email, resendResult.verificationUrl);

    return res.status(200).json({
      success: true,
      message: resendResult.message,
      expiresAt: resendResult.expiresAt
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
}
