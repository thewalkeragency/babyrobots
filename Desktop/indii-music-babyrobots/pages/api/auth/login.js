import { authService } from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required.' 
        });
      }

      // Use Supabase Auth service
      const result = await authService.signIn(email, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.error || 'Invalid credentials.'
        });
      }

      // Successful authentication
      return res.status(200).json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.profile?.role || null
        },
        profile: result.profile,
        needsProfileSetup: result.needsProfileSetup || false
      });

    } catch (error) {
      console.error('Login API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login.'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
