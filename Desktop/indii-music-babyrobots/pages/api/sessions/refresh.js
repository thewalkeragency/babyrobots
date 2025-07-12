/**
 * Token Refresh API Endpoint
 * POST /api/sessions/refresh
 * 
 * Refreshes access tokens using refresh tokens
 * Implements token rotation for enhanced security
 */

import tokenService from '../../../src/lib/token-service.js';
import sessionService from '../../../src/lib/session-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body;

    // Validate required fields
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing required field: refreshToken'
      });
    }

    // Extract request metadata
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
      // Refresh the access token
      const refreshResult = await tokenService.refreshAccessToken(refreshToken);

      // Log token refresh for security monitoring
      const tokenData = await tokenService.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (tokenData) {
        await sessionService.logSecurityEvent(tokenData.userId, 'token_refreshed', {
          sessionId: tokenData.sessionId,
          ipAddress,
          userAgent,
          tokenRotated: refreshResult.refreshToken !== refreshToken
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: refreshResult.accessToken,
        refreshToken: refreshResult.refreshToken,
        expiresIn: refreshResult.expiresIn
      });

    } catch (refreshError) {
      // Log failed refresh attempt
      console.error('Token refresh failed:', refreshError.message);

      // Attempt to get user info for logging
      let userId = null;
      try {
        const tokenData = await tokenService.prisma.refreshToken.findUnique({
          where: { token: refreshToken }
        });
        userId = tokenData?.userId;
      } catch (lookupError) {
        // Token not found or other error
      }

      if (userId) {
        await sessionService.logSecurityEvent(userId, 'token_refresh_failed', {
          reason: refreshError.message,
          ipAddress,
          userAgent
        });

        // Check for suspicious activity on repeated failures
        await sessionService.detectSuspiciousActivity(userId, ipAddress, userAgent);
      }

      // Determine appropriate error response
      if (refreshError.message.includes('not found')) {
        return res.status(404).json({
          error: 'Refresh token not found',
          code: 'TOKEN_NOT_FOUND'
        });
      }

      if (refreshError.message.includes('revoked')) {
        return res.status(401).json({
          error: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }

      if (refreshError.message.includes('expired')) {
        return res.status(401).json({
          error: 'Refresh token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (refreshError.message.includes('session')) {
        return res.status(401).json({
          error: 'Associated session is invalid',
          code: 'SESSION_INVALID'
        });
      }

      return res.status(400).json({
        error: 'Token refresh failed',
        message: refreshError.message,
        code: 'REFRESH_FAILED'
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
