import { jwtService } from '../../../src/lib/jwt-service.js';
import { authService } from '../../../src/lib/auth-service.js';

/**
 * Token Refresh API Endpoint
 * Part of RING 1: Authentication System Database Operations
 * 
 * Handles refresh token validation and new access token generation
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const verification = jwtService.verifyRefreshToken(refreshToken);
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: verification.error,
        needsLogin: true
      });
    }

    // Get fresh user data (in case role or status changed)
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser.success || !currentUser.authenticated) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
        needsLogin: true
      });
    }

    // Generate new access token with fresh user data
    const userPayload = {
      userId: currentUser.user.id,
      email: currentUser.user.email,
      role: currentUser.user.role
    };

    const tokenRefreshResult = jwtService.refreshAccessToken(refreshToken, userPayload);

    if (!tokenRefreshResult.success) {
      return res.status(401).json({
        success: false,
        error: tokenRefreshResult.error,
        needsLogin: true
      });
    }

    return res.status(200).json({
      success: true,
      accessToken: tokenRefreshResult.accessToken,
      tokenType: tokenRefreshResult.tokenType,
      expiresIn: tokenRefreshResult.expiresIn,
      user: {
        id: currentUser.user.id,
        email: currentUser.user.email,
        role: currentUser.user.role
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
