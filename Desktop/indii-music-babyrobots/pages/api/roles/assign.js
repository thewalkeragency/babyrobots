/**
 * API Route: /api/roles/assign
 * Assign a role to a user
 */

import rbacService from '../../../src/lib/rbac-service.js';
import authService from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate the requesting user
    const authResult = await authService.validateSession(req);
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requestingUserId = authResult.user.id;
    const { userId, roleName } = req.body;

    // Validate input
    if (!userId || !roleName) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and roleName' 
      });
    }

    // Check if requesting user has permission to assign roles
    const hasPermission = await rbacService.hasPermission(
      requestingUserId, 
      'manage_roles'
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to assign roles' 
      });
    }

    // Assign the role
    const result = await rbacService.assignRole(
      parseInt(userId), 
      roleName, 
      requestingUserId
    );

    return res.status(200).json({
      success: true,
      message: `Role '${roleName}' assigned successfully`,
      userRole: result
    });

  } catch (error) {
    console.error('Role assignment error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('already has role')) {
      return res.status(409).json({ error: error.message });
    }

    // Sanitize error message to prevent information disclosure
    const sanitizedMessage = 'An error occurred while processing your request';
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: sanitizedMessage 
    });
  }
}
