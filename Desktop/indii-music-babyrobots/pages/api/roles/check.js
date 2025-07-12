/**
 * API Route: /api/roles/check
 * Check if a user has specific permission
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

    const { permissionName, userId, resourceOwnerId } = req.body;

    // Validate input
    if (!permissionName) {
      return res.status(400).json({ 
        error: 'Missing required field: permissionName' 
      });
    }

    // If no userId provided, check for the authenticated user
    const targetUserId = userId ? parseInt(userId) : authResult.user.id;

    // Only allow users to check their own permissions unless they have admin rights
    const requestingUserId = authResult.user.id;
    if (targetUserId !== requestingUserId) {
      const canCheckOthers = await rbacService.hasPermission(
        requestingUserId, 
        'manage_roles'
      );
      
      if (!canCheckOthers) {
        return res.status(403).json({ 
          error: 'Can only check your own permissions' 
        });
      }
    }

    // Check the permission
    const hasPermission = await rbacService.hasPermission(
      targetUserId,
      permissionName,
      resourceOwnerId ? parseInt(resourceOwnerId) : null
    );

    return res.status(200).json({
      success: true,
      userId: targetUserId,
      permission: permissionName,
      hasPermission,
      resourceOwnerId: resourceOwnerId || null
    });

  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
