import { authService } from '../../../src/lib/auth-service.js';
import { jwtService } from '../../../src/lib/jwt-service.js';
import { passwordService } from '../../../src/lib/password-service.js';
import { emailVerificationService } from '../../../src/lib/email-verification-service.js';

/**
 * Enhanced Sign In API Endpoint
 * Part of RING 1: Authentication System Database Operations
 * 
 * Features:
 * - Enhanced JWT token pairs (access + refresh)
 * - Email verification checking
 * - Security logging
 * - Rate limiting protection
 */

// In-memory rate limiting (use Redis in production)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  try {
    const { email, password, rememberMe = false } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check rate limiting
    const attemptKey = `${clientIP}:${email}`;
    const attempts = loginAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
    
    if (attempts.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts. Please try again later.',
          lockoutExpiresAt: new Date(attempts.lastAttempt + LOCKOUT_DURATION)
        });
      } else {
        // Reset attempts after lockout period
        loginAttempts.delete(attemptKey);
      }
    }

    // Attempt authentication
    const authResult = await authService.signIn(email, password);

    if (!authResult.success) {
      // Record failed attempt
      attempts.count++;
      attempts.lastAttempt = Date.now();
      loginAttempts.set(attemptKey, attempts);

      return res.status(401).json({
        success: false,
        error: authResult.error
      });
    }

    // Reset failed attempts on successful login
    loginAttempts.delete(attemptKey);

    // Check email verification status
    const verificationStatus = await emailVerificationService.isEmailVerified(email);
    
    if (!verificationStatus.verified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        emailVerified: false,
        needsVerification: true
      });
    }

    // Generate enhanced JWT token pair
    const userPayload = {
      userId: authResult.user.id,
      email: authResult.user.email,
      role: authResult.user.role
    };

    const tokenPair = jwtService.generateTokenPair(userPayload);

    // Set secure HTTP-only cookie for refresh token
    const refreshTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 days or 1 day
      path: '/api/auth'
    };

    res.setHeader('Set-Cookie', [
      `refreshToken=${tokenPair.refreshToken}; ${Object.entries(refreshTokenCookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')}`
    ]);

    // Return success response with access token
    return res.status(200).json({
      success: true,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role
      },
      accessToken: tokenPair.accessToken,
      tokenType: tokenPair.tokenType,
      expiresIn: tokenPair.expiresIn,
      emailVerified: true,
      message: 'Sign in successful'
    });

  } catch (error) {
    console.error('Enhanced sign in error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
