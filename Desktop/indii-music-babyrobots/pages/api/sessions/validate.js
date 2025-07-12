/**
 * Session Validation API Endpoint
 * POST /api/sessions/validate
 * 
 * Validates session tokens and returns user data
 * Updates session activity and checks for expiration
 */

import sessionService from '../../../src/lib/session-service.js';
import tokenService from '../../../src/lib/token-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken, accessToken } = req.body;

    // Validate required fields
    if (!sessionToken && !accessToken) {
      return res.status(400).json({
        error: 'Missing required field: sessionToken or accessToken'
      });
    }

    let validationResult = null;
    let user = null;
    let sessionData = null;

    // If session token provided, validate it
    if (sessionToken) {
      validationResult = await sessionService.validateSession(sessionToken);
      
      if (validationResult.valid) {
        user = validationResult.user;
        sessionData = validationResult.session;
      }
    }
    
    // If access token provided and session validation failed/not provided
    if (accessToken && (!validationResult || !validationResult.valid)) {
      const tokenData = tokenService.verifyAccessToken(accessToken);
      
      if (tokenData) {
        // Get user and session info from token
        const sessionValidation = await sessionService.validateSession(tokenData.sessionId);
        
        if (sessionValidation.valid) {
          user = sessionValidation.user;
          sessionData = sessionValidation.session;
          validationResult = { valid: true };
        }
      }
    }

    // Check if validation was successful
    if (!validationResult || !validationResult.valid) {
      return res.status(401).json({
        error: 'Invalid or expired session',
        reason: validationResult?.reason || 'Token validation failed'
      });
    }

    // Extract request metadata for activity tracking
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Update session activity with current request info
    await sessionService.updateSessionActivity(sessionData.id, {
      ipAddress,
      userAgent
    });

    // Return validation success with user data
    res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileType: user.profileType
      },
      session: {
        id: sessionData.id,
        expires: sessionData.expires,
        lastActivity: sessionData.lastActivity,
        deviceInfo: sessionData.deviceInfo,
        location: sessionData.location,
        status: sessionData.status
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
