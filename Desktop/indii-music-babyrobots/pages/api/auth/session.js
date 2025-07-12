import { authService } from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Extract token from Authorization header or cookies
      let token = null;
      
      // Check Authorization header first
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      // Fallback to cookies if no Authorization header
      if (!token && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies.authToken;
      }

      // Get current user session (with token for SQLite fallback)
      const result = await authService.getCurrentUser(token);

      if (!result.success || !result.authenticated) {
        return res.status(401).json({
          success: false,
          authenticated: false,
          message: result.error || 'No valid session found.'
        });
      }

      // Valid session
      return res.status(200).json({
        success: true,
        authenticated: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role || result.profile?.role || null
        },
        profile: result.profile
      });

    } catch (error) {
      console.error('Session API error:', error);
      return res.status(500).json({
        success: false,
        authenticated: false,
        message: 'Internal server error during session check.'
      });
    }
  } else if (req.method === 'POST') {
    // Validate a specific token
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'Token is required.'
        });
      }

      const result = await authService.validateSession(token);

      if (!result.valid) {
        return res.status(401).json({
          success: false,
          valid: false,
          message: result.error || 'Invalid token.'
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        user: result.user
      });

    } catch (error) {
      console.error('Token validation API error:', error);
      return res.status(500).json({
        success: false,
        valid: false,
        message: 'Internal server error during token validation.'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
