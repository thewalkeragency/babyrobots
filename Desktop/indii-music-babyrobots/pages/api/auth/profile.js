import { authService } from '../../../src/lib/auth-service.js';

/**
 * User profile sync endpoint
 * GET /api/auth/profile - Get current user profile
 * PUT /api/auth/profile - Update user profile
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get current user and profile
      const result = await authService.getCurrentUser();

      if (!result.success || !result.authenticated) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.profile?.role || null
        },
        profile: result.profile
      });

    } else if (req.method === 'PUT') {
      // Update user profile
      const { userId, profileData } = req.body;

      if (!userId || !profileData) {
        return res.status(400).json({
          success: false,
          message: 'User ID and profile data are required'
        });
      }

      const result = await authService.updateProfile(userId, profileData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Profile update failed'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: result.profile
      });

    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
}
