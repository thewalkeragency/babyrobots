/**
 * Session Revocation API Endpoint
 * POST /api/sessions/revoke
 * DELETE /api/sessions/revoke-all
 * 
 * Revokes user sessions for security and logout functionality
 */

import sessionService from '../../../src/lib/session-service.js';
import tokenService from '../../../src/lib/token-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract authorization token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify access token
    const tokenData = tokenService.verifyAccessToken(token);
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = tokenData.userId;
    const currentSessionId = tokenData.sessionId;

    if (req.method === 'POST') {
      // Revoke specific session
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ 
          error: 'Session ID required for single session revocation' 
        });
      }

      // Verify user owns the session
      const session = await sessionService.getSessionById(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ 
          error: 'Cannot revoke session that does not belong to you' 
        });
      }

      await sessionService.revokeSession(sessionId, userId);

      // Log security event
      await sessionService.logSecurityEvent(userId, 'session_revoked', {
        sessionId,
        revokedBy: userId,
        reason: 'user_requested'
      });

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
        sessionId
      });

    } else if (req.method === 'DELETE') {
      // Revoke all user sessions except current
      const revokedSessions = await sessionService.revokeAllUserSessions(
        userId, 
        currentSessionId
      );

      // Log security event
      await sessionService.logSecurityEvent(userId, 'all_sessions_revoked', {
        revokedCount: revokedSessions.length,
        currentSessionId,
        reason: 'user_requested'
      });

      res.status(200).json({
        success: true,
        message: 'All other sessions revoked successfully',
        revokedCount: revokedSessions.length,
        currentSessionId
      });
    }

  } catch (error) {
    console.error('Session revocation error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
