/**
 * API Route: /api/roles/list
 * List available roles and user's current roles
 */

import rbacService from '../../../src/lib/rbac-service.js';
import authService from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate the requesting user
    const authResult = await authService.validateSession(req);
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = authResult.user.id;
    const { userId: targetUserId, includePermissions = 'false' } = req.query;

    // Determine which user's roles to fetch
    let requestedUserId = userId;
    
    if (targetUserId && parseInt(targetUserId) !== userId) {
      // Check if requesting user can view other users' roles
      const canViewOthers = await rbacService.hasPermission(
        userId, 
        'read_users'
      );
      
      if (!canViewOthers) {
        return res.status(403).json({ 
          error: 'Cannot view other users\' roles' 
        });
      }
      
      requestedUserId = parseInt(targetUserId);
    }

    // Get user's current roles and permissions
    const userRolesAndPermissions = await rbacService.getUserRolesAndPermissions(requestedUserId);

    let allRoles = [];
    
    // If user has role management permissions, include all available roles
    const canManageRoles = await rbacService.hasPermission(userId, 'manage_roles');
    if (canManageRoles) {
      allRoles = await rbacService.getAllRoles();
    }

    const response = {
      success: true,
      userId: requestedUserId,
      userRoles: userRolesAndPermissions.roles,
      userPermissions: includePermissions === 'true' ? userRolesAndPermissions.permissions : undefined,
      availableRoles: canManageRoles ? allRoles : [],
      canManageRoles
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Roles list error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
