import { authService } from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Use Supabase Auth service for sign out
      const result = await authService.signOut();

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Sign out failed.'
        });
      }

      // Successful sign out
      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Signout API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during sign out.'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
