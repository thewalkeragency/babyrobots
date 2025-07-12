/**
 * Permission Checking Middleware
 * Validates user permissions for protected routes and resources
 */

import rbacService from '../lib/rbac-service.js';
import authService from '../lib/auth-service.js';

/**
 * Create permission middleware
 * @param {string} permissionName - Required permission name
 * @param {Object} options - Configuration options
 */
export function requirePermission(permissionName, options = {}) {
  return async (req, res, next) => {
    try {
      // Authenticate user first
      const authResult = await authService.validateSession(req);
      if (!authResult.success || !authResult.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = authResult.user.id;
      const { 
        resourceOwnerId = null,
        checkOwnership = false,
        allowOwner = true,
        failureMessage = 'Insufficient permissions'
      } = options;

      // Determine resource owner if checking ownership
      let resourceOwner = resourceOwnerId;
      
      if (checkOwnership && !resourceOwner) {
        // Try to extract from request parameters or body
        resourceOwner = req.params?.userId || 
                      req.body?.userId || 
                      req.query?.userId;
        
        if (resourceOwner) {
          resourceOwner = parseInt(resourceOwner);
        }
      }

      // Allow resource owner access if configured
      if (allowOwner && resourceOwner && resourceOwner === userId) {
        req.user = authResult.user;
        req.hasPermission = true;
        req.isOwner = true;
        return next();
      }

      // Check permission
      const hasPermission = await rbacService.hasPermission(
        userId,
        permissionName,
        resourceOwner
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: failureMessage,
          required: permissionName 
        });
      }

      // Add user and permission info to request
      req.user = authResult.user;
      req.hasPermission = true;
      req.isOwner = resourceOwner === userId;
      
      return next();
    } catch (error) {
      console.error('Permission check middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during permission check' 
      });
    }
  };
}

/**
 * Require specific role
 */
export function requireRole(roleName, options = {}) {
  return async (req, res, next) => {
    try {
      const authResult = await authService.validateSession(req);
      if (!authResult.success || !authResult.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = authResult.user.id;
      const { failureMessage = `Role '${roleName}' required` } = options;

      // Get user's roles
      const { roles } = await rbacService.getUserRolesAndPermissions(userId);
      const hasRole = roles.some(role => role.name === roleName);

      if (!hasRole) {
        return res.status(403).json({ 
          error: failureMessage,
          required: roleName 
        });
      }

      req.user = authResult.user;
      req.userRoles = roles;
      
      return next();
    } catch (error) {
      console.error('Role check middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during role check' 
      });
    }
  };
}

/**
 * Require any of the specified roles
 */
export function requireAnyRole(roleNames, options = {}) {
  return async (req, res, next) => {
    try {
      const authResult = await authService.validateSession(req);
      if (!authResult.success || !authResult.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = authResult.user.id;
      const { failureMessage = `One of these roles required: ${roleNames.join(', ')}` } = options;

      // Get user's roles
      const { roles } = await rbacService.getUserRolesAndPermissions(userId);
      const hasAnyRole = roles.some(role => roleNames.includes(role.name));

      if (!hasAnyRole) {
        return res.status(403).json({ 
          error: failureMessage,
          required: roleNames 
        });
      }

      req.user = authResult.user;
      req.userRoles = roles;
      
      return next();
    } catch (error) {
      console.error('Any role check middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during role check' 
      });
    }
  };
}

/**
 * Admin only access
 */
export const requireAdmin = requireAnyRole(['super_admin', 'admin'], {
  failureMessage: 'Administrator access required'
});

/**
 * Moderator or admin access
 */
export const requireModerator = requireAnyRole(['super_admin', 'admin', 'moderator'], {
  failureMessage: 'Moderator access required'
});

/**
 * Check resource ownership
 */
export function requireOwnership(resourceIdField = 'userId') {
  return async (req, res, next) => {
    try {
      const authResult = await authService.validateSession(req);
      if (!authResult.success || !authResult.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = authResult.user.id;
      const resourceId = req.params[resourceIdField] || 
                        req.body[resourceIdField] || 
                        req.query[resourceIdField];

      if (!resourceId) {
        return res.status(400).json({ 
          error: `Missing resource identifier: ${resourceIdField}` 
        });
      }

      if (parseInt(resourceId) !== userId) {
        // Check if user has admin permissions to bypass ownership
        const isAdmin = await rbacService.hasPermission(userId, 'manage_users');
        
        if (!isAdmin) {
          return res.status(403).json({ 
            error: 'Access denied: resource ownership required' 
          });
        }
      }

      req.user = authResult.user;
      req.isOwner = parseInt(resourceId) === userId;
      
      return next();
    } catch (error) {
      console.error('Ownership check middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during ownership check' 
      });
    }
  };
}

/**
 * Utility function to check permissions programmatically
 */
export async function checkPermission(req, permissionName, resourceOwnerId = null) {
  try {
    const authResult = await authService.validateSession(req);
    if (!authResult.success || !authResult.user) {
      return { success: false, error: 'Authentication required' };
    }

    const hasPermission = await rbacService.hasPermission(
      authResult.user.id,
      permissionName,
      resourceOwnerId
    );

    return { 
      success: true, 
      hasPermission, 
      user: authResult.user 
    };
  } catch (error) {
    console.error('Permission check utility error:', error);
    return { success: false, error: 'Permission check failed' };
  }
}

export default {
  requirePermission,
  requireRole,
  requireAnyRole,
  requireAdmin,
  requireModerator,
  requireOwnership,
  checkPermission
};
