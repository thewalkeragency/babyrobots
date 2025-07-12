import { jwtService } from './jwt-service.js';
import { authService } from './auth-service.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Part of RING 1: Authentication System Database Operations
 */

/**
 * Middleware to verify JWT tokens and extract user info
 */
export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const validation = jwtService.validateToken(token);

    if (!validation.valid) {
      const statusCode = validation.needsRefresh ? 401 : 403;
      return res.status(statusCode).json({
        success: false,
        error: validation.error,
        needsRefresh: validation.needsRefresh
      });
    }

    // Attach user info to request
    req.user = validation.user;
    req.tokenId = validation.tokenId;
    
    next();

  } catch (error) {
    console.error('Token authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Middleware to check if user has required role(s)
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userRole = req.user.role;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          requiredRoles: roles,
          userRole: userRole
        });
      }

      next();

    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization failed'
      });
    }
  };
}

/**
 * Middleware to check if user owns the resource or has admin role
 * @param {string} userIdField - Field name in request that contains the user ID to check
 */
export function requireOwnershipOrAdmin(userIdField = 'userId') {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentUserId = req.user.userId;
      const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
      const userRole = req.user.role;

      // Allow admins to access any resource
      if (userRole === 'admin' || userRole === 'super_admin') {
        return next();
      }

      // Allow users to access their own resources
      if (currentUserId.toString() === resourceUserId.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.'
      });

    } catch (error) {
      console.error('Ownership authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization failed'
      });
    }
  };
}

/**
 * Middleware to check specific permissions
 * @param {string|Array} permissions - Permission(s) to check
 */
export function requirePermission(permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const permissionList = Array.isArray(permissions) ? permissions : [permissions];
      const userRole = req.user.role;
      
      // Define role-based permissions
      const rolePermissions = {
        'admin': ['*'], // Admin has all permissions
        'super_admin': ['*'], // Super admin has all permissions
        'artist': [
          'create_track',
          'edit_own_track',
          'delete_own_track',
          'view_own_profile',
          'edit_own_profile',
          'upload_audio',
          'create_split_sheet'
        ],
        'fan': [
          'view_tracks',
          'like_track',
          'create_playlist',
          'view_own_profile',
          'edit_own_profile'
        ],
        'licensor': [
          'view_tracks',
          'license_request',
          'view_own_profile',
          'edit_own_profile',
          'view_licensing_data'
        ],
        'service_provider': [
          'view_tracks',
          'offer_services',
          'view_own_profile',
          'edit_own_profile',
          'manage_services'
        ]
      };

      const userPermissions = rolePermissions[userRole] || [];
      
      // Check if user has all required permissions
      const hasAllPermissions = permissionList.every(permission => 
        userPermissions.includes('*') || userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          requiredPermissions: permissionList,
          userRole: userRole
        });
      }

      next();

    } catch (error) {
      console.error('Permission authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization failed'
      });
    }
  };
}

/**
 * Middleware to check if user is verified (email verified)
 */
export function requireVerifiedUser(req, res, next) {
  // This would require checking the database for email verification status
  // For now, we'll assume verified if they have a valid token
  // In production, you'd check the emailVerified field in the database
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  // TODO: Add actual email verification check
  // const verificationStatus = await emailVerificationService.isEmailVerified(req.user.email);
  // if (!verificationStatus.verified) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'Email verification required'
  //   });
  // }

  next();
}

/**
 * Combine multiple middleware functions
 * @param {Array} middlewares - Array of middleware functions
 */
export function combineMiddleware(middlewares) {
  return (req, res, next) => {
    let index = 0;

    function runNext() {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    }

    runNext();
  };
}

/**
 * Helper function to create protected route handler
 * @param {Object} options - Route protection options
 * @param {Function} handler - Route handler function
 */
export function createProtectedRoute(options = {}, handler) {
  const {
    requireAuth = true,
    roles = null,
    permissions = null,
    requireVerified = false,
    requireOwnership = null
  } = options;

  const middlewares = [];

  if (requireAuth) {
    middlewares.push(authenticateToken);
  }

  if (requireVerified) {
    middlewares.push(requireVerifiedUser);
  }

  if (roles) {
    middlewares.push(requireRole(roles));
  }

  if (permissions) {
    middlewares.push(requirePermission(permissions));
  }

  if (requireOwnership) {
    middlewares.push(requireOwnershipOrAdmin(requireOwnership));
  }

  return async (req, res) => {
    try {
      // Run middleware chain
      await new Promise((resolve, reject) => {
        combineMiddleware(middlewares)(req, res, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Run the actual handler
      return await handler(req, res);

    } catch (error) {
      console.error('Protected route error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

/**
 * Role hierarchy for permission inheritance
 */
export const ROLE_HIERARCHY = {
  'super_admin': 4,
  'admin': 3,
  'service_provider': 2,
  'licensor': 2,
  'artist': 1,
  'fan': 0
};

/**
 * Check if user has higher or equal role level
 * @param {string} userRole - Current user role
 * @param {string} requiredRole - Required role level
 */
export function hasRoleLevel(userRole, requiredRole) {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export default {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin,
  requirePermission,
  requireVerifiedUser,
  combineMiddleware,
  createProtectedRoute,
  hasRoleLevel,
  ROLE_HIERARCHY
};
