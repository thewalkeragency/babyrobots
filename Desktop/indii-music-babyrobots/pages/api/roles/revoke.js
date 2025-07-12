/**
 * API Route: /api/roles/revoke
 * Revoke a role from a user
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

    // Check if requesting user has permission to revoke roles
    const hasPermission = await rbacService.hasPermission(
      requestingUserId, 
      'manage_roles'
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to revoke roles' 
      });
    }

    // Prevent users from revoking super_admin from themselves
    if (requestingUserId === parseInt(userId) && roleName === 'super_admin') {
      return res.status(403).json({ 
        error: 'Cannot revoke super_admin role from yourself' 
      });
    }

    // Revoke the role
    const result = await rbacService.revokeRole(
      parseInt(userId), 
      roleName, 
      requestingUserId
    );

    return res.status(200).json({
      success: true,
      message: `Role '${roleName}' revoked successfully`,
      userRole: result
    });

  } catch (error) {
    console.error('Role revocation error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('does not have')) {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
