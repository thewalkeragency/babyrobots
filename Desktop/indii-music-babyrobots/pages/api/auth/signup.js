import { authService } from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, password, role, profile = {} } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'User role is required. Must be one of: artist, fan, licensor, service_provider'
        });
      }

      // Validate role
      const validRoles = ['artist', 'fan', 'licensor', 'service_provider'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }

      // Use Supabase Auth service for registration
      const result = await authService.register({
        email,
        password,
        role,
        profile
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Registration failed.'
        });
      }

      // Successful registration
      return res.status(201).json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.profile?.role || role
        },
        profile: result.profile
      });

    } catch (error) {
      console.error('Signup API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration.'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
