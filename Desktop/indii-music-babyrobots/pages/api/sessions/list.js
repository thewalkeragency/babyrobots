/**
 * Session List API Endpoint
 * GET /api/sessions/list
 * 
 * Lists all active sessions for the authenticated user
 * Provides session management capabilities
 */

import sessionService from '../../../src/lib/session-service.js';
import tokenService from '../../../src/lib/token-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Get all active sessions for user
    const sessions = await sessionService.getUserSessions(userId);

    // Format session data (exclude sensitive information)
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      location: session.location,
      ipAddress: session.ipAddress ? 
        session.ipAddress.replace(/\.\d+$/, '.***') : null, // Mask last octet for privacy
      lastActivity: session.lastActivity,
      status: session.status,
      createdAt: session.createdAt,
      isCurrent: session.id === currentSessionId,
      isActive: session.status === 'active' && !session.isRevoked
    }));

    // Sort by last activity (most recent first)
    formattedSessions.sort((a, b) => 
      new Date(b.lastActivity) - new Date(a.lastActivity)
    );

    // Get session statistics
    const stats = {
      totalSessions: formattedSessions.length,
      activeSessions: formattedSessions.filter(s => s.isActive).length,
      currentSession: formattedSessions.find(s => s.isCurrent),
      oldestSession: formattedSessions[formattedSessions.length - 1]
    };

    res.status(200).json({
      success: true,
      sessions: formattedSessions,
      stats,
      currentSessionId
    });

  } catch (error) {
    console.error('Session list error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
