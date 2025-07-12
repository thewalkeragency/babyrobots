/**
 * Session Creation API Endpoint
 * POST /api/sessions/create
 * 
 * Creates new session with enhanced metadata tracking
 * Integrates with auth system and RBAC
 */

import sessionService from '../../../src/lib/session-service.js';
import tokenService from '../../../src/lib/token-service.js';
import { AuthService } from '../../../src/lib/auth-service.js';

const authService = new AuthService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      password,
      deviceInfo,
      location,
      rememberMe = false
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email and password'
      });
    }

    // Extract request metadata
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Authenticate user
    const authResult = await authService.signIn(email, password);
    
    if (!authResult.success) {
      // Log failed attempt
      await sessionService.logSecurityEvent(null, 'login_failed', {
        email,
        ipAddress,
        userAgent,
        reason: authResult.error
      });

      // Check for suspicious activity
      if (authResult.userId) {
        await sessionService.detectSuspiciousActivity(authResult.userId, ipAddress, userAgent);
      }

      return res.status(401).json({
        error: 'Invalid credentials',
        message: authResult.error
      });
    }

    const { user } = authResult;

    // Check for suspicious activity before creating session
    const suspiciousCheck = await sessionService.detectSuspiciousActivity(
      user.id, 
      ipAddress, 
      userAgent
    );

    if (suspiciousCheck.suspicious) {
      return res.status(423).json({
        error: 'Account temporarily locked due to suspicious activity',
        action: suspiciousCheck.action
      });
    }

    // Create session with enhanced metadata
    const sessionOptions = {
      deviceInfo: deviceInfo || `${userAgent?.substring(0, 100)}`,
      ipAddress,
      userAgent,
      location,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 1 day
    };

    const session = await sessionService.createSession(user.id, sessionOptions);

    // Generate refresh token
    const refreshToken = await tokenService.generateRefreshToken(user.id, session.id);

    // Generate access token
    const accessTokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      iat: Math.floor(Date.now() / 1000)
    };
    const accessToken = tokenService.generateAccessToken(accessTokenPayload);

    // Log successful login
    await sessionService.logSecurityEvent(user.id, 'session_created', {
      sessionId: session.id,
      deviceInfo: sessionOptions.deviceInfo,
      ipAddress,
      location,
      rememberMe
    });

    // Return session data (exclude sensitive information)
    res.status(200).json({
      success: true,
      message: 'Session created successfully',
      session: {
        id: session.id,
        userId: user.id,
        expires: session.expires,
        deviceInfo: session.deviceInfo,
        location: session.location,
        createdAt: session.createdAt
      },
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profileType: user.profileType
      },
      tokens: {
        accessToken,
        refreshToken: refreshToken.token,
        expiresIn: tokenService.parseExpiryToSeconds(tokenService.accessTokenExpiry)
      }
    });

  } catch (error) {
    console.error('Session creation error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
