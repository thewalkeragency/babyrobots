/**
 * Role-Based Access Control (RBAC) Service
 * Handles role assignment, permission checking, and access control
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class RBACService {
  constructor() {
    this.prisma = prisma;
  }

  /**
   * Initialize default roles and permissions
   */
  async initializeRoles() {
    try {
      // Create system roles
      const systemRoles = [
        {
          name: 'super_admin',
          displayName: 'Super Administrator',
          description: 'Full system access and control',
          isSystem: true,
          level: 0
        },
        {
          name: 'admin',
          displayName: 'Administrator',
          description: 'Administrative access to user and content management',
          isSystem: true,
          level: 1
        },
        {
          name: 'moderator',
          displayName: 'Moderator',
          description: 'Content moderation and user management',
          isSystem: true,
          level: 2
        },
        {
          name: 'premium_user',
          displayName: 'Premium User',
          description: 'Enhanced user features and capabilities',
          isSystem: true,
          level: 3
        },
        {
          name: 'artist',
          displayName: 'Artist',
          description: 'Music artist with track upload and management',
          isSystem: true,
          level: 4
        },
        {
          name: 'fan',
          displayName: 'Fan',
          description: 'Music fan with basic interaction features',
          isSystem: true,
          level: 4
        },
        {
          name: 'licensor',
          displayName: 'Licensor',
          description: 'Music licensing professional',
          isSystem: true,
          level: 4
        },
        {
          name: 'service_provider',
          displayName: 'Service Provider',
          description: 'Music industry service provider',
          isSystem: true,
          level: 4
        }
      ];

      // Create roles
      for (const roleData of systemRoles) {
        await this.prisma.role.upsert({
          where: { name: roleData.name },
          update: roleData,
          create: roleData
        });
      }

      // Create system permissions
      const systemPermissions = [
        // User management
        { name: 'manage_users', displayName: 'Manage Users', resource: 'users', action: 'MANAGE', scope: 'all' },
        { name: 'create_user', displayName: 'Create User', resource: 'users', action: 'CREATE', scope: 'all' },
        { name: 'read_users', displayName: 'Read Users', resource: 'users', action: 'READ', scope: 'all' },
        { name: 'update_user', displayName: 'Update User', resource: 'users', action: 'UPDATE', scope: 'own' },
        { name: 'delete_user', displayName: 'Delete User', resource: 'users', action: 'DELETE', scope: 'all' },
        
        // Profile management
        { name: 'create_profile', displayName: 'Create Profile', resource: 'profiles', action: 'CREATE', scope: 'own' },
        { name: 'read_profile', displayName: 'Read Profile', resource: 'profiles', action: 'READ', scope: 'public' },
        { name: 'update_profile', displayName: 'Update Profile', resource: 'profiles', action: 'UPDATE', scope: 'own' },
        { name: 'delete_profile', displayName: 'Delete Profile', resource: 'profiles', action: 'DELETE', scope: 'own' },
        
        // Track management
        { name: 'create_track', displayName: 'Create Track', resource: 'tracks', action: 'CREATE', scope: 'own' },
        { name: 'read_tracks', displayName: 'Read Tracks', resource: 'tracks', action: 'READ', scope: 'public' },
        { name: 'update_track', displayName: 'Update Track', resource: 'tracks', action: 'UPDATE', scope: 'own' },
        { name: 'delete_track', displayName: 'Delete Track', resource: 'tracks', action: 'DELETE', scope: 'own' },
        { name: 'download_track', displayName: 'Download Track', resource: 'tracks', action: 'DOWNLOAD', scope: 'public' },
        { name: 'upload_track', displayName: 'Upload Track', resource: 'tracks', action: 'UPLOAD', scope: 'own' },
        
        // Content moderation
        { name: 'moderate_content', displayName: 'Moderate Content', resource: 'content', action: 'MODERATE', scope: 'all' },
        { name: 'report_content', displayName: 'Report Content', resource: 'content', action: 'REPORT', scope: 'public' },
        
        // Admin panel
        { name: 'access_admin', displayName: 'Access Admin Panel', resource: 'admin', action: 'READ', scope: 'all' },
        { name: 'manage_roles', displayName: 'Manage Roles', resource: 'roles', action: 'MANAGE', scope: 'all' },
        
        // Comments and ratings
        { name: 'comment', displayName: 'Comment', resource: 'comments', action: 'CREATE', scope: 'public' },
        { name: 'rate', displayName: 'Rate Content', resource: 'ratings', action: 'CREATE', scope: 'public' }
      ];

      // Create permissions
      for (const permData of systemPermissions) {
        await this.prisma.permission.upsert({
          where: { 
            resource_action_scope: {
              resource: permData.resource,
              action: permData.action,
              scope: permData.scope
            }
          },
          update: permData,
          create: { ...permData, isSystem: true }
        });
      }

      console.log('RBAC system initialized successfully');
      return { success: true, message: 'RBAC system initialized' };
    } catch (error) {
      console.error('Error initializing RBAC:', error);
      throw error;
    }
  }

  /**
   * Assign a role to a user
   */
  async assignRole(userId, roleName, assignedBy = null) {
    try {
      // Get role by name
      const role = await this.prisma.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      // Check if user already has this role
      const existingUserRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: userId,
            roleId: role.id
          }
        }
      });

      if (existingUserRole) {
        // Reactivate if inactive
        if (!existingUserRole.isActive) {
          return await this.prisma.userRole.update({
            where: { id: existingUserRole.id },
            data: { 
              isActive: true, 
              assignedBy,
              assignedAt: new Date()
            },
            include: {
              role: true,
              user: true
            }
          });
        }
        throw new Error(`User already has role '${roleName}'`);
      }

      // Create new role assignment
      const userRole = await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
          assignedBy,
          isActive: true
        },
        include: {
          role: true,
          user: true
        }
      });

      // Log the role assignment
      await this.logSecurityEvent(userId, 'role_assigned', { 
        role: roleName, 
        assignedBy 
      });

      return userRole;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  /**
   * Revoke a role from a user
   */
  async revokeRole(userId, roleName, revokedBy = null) {
    try {
      // Get role by name
      const role = await this.prisma.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      // Find and deactivate user role
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: userId,
            roleId: role.id
          }
        }
      });

      if (!userRole || !userRole.isActive) {
        throw new Error(`User does not have active role '${roleName}'`);
      }

      // Deactivate role
      const updatedUserRole = await this.prisma.userRole.update({
        where: { id: userRole.id },
        data: { 
          isActive: false,
          updatedAt: new Date()
        },
        include: {
          role: true,
          user: true
        }
      });

      // Log the role revocation
      await this.logSecurityEvent(userId, 'role_revoked', { 
        role: roleName, 
        revokedBy 
      });

      return updatedUserRole;
    } catch (error) {
      console.error('Error revoking role:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId, permissionName, resourceOwnerId = null) {
    try {
      // Get user's active roles
      const userRoles = await this.prisma.userRole.findMany({
        where: {
          userId: userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      if (!userRoles.length) {
        return false;
      }

      // Check each role for the permission
      for (const userRole of userRoles) {
        const rolePermissions = userRole.role.rolePermissions;
        
        for (const rolePermission of rolePermissions) {
          const permission = rolePermission.permission;
          
          if (permission.name === permissionName && rolePermission.isGranted) {
            // Check scope
            if (permission.scope === 'all') {
              return true;
            }
            
            if (permission.scope === 'own' && resourceOwnerId === userId) {
              return true;
            }
            
            if (permission.scope === 'public') {
              return true;
            }
            
            // Add more scope logic as needed
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get user's roles and permissions
   */
  async getUserRolesAndPermissions(userId) {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: {
          userId: userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                where: { isGranted: true },
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      const roles = userRoles.map(ur => ur.role);
      const permissions = userRoles.flatMap(ur => 
        ur.role.rolePermissions.map(rp => rp.permission)
      );

      // Remove duplicate permissions
      const uniquePermissions = permissions.filter((perm, index, self) => 
        index === self.findIndex(p => p.id === perm.id)
      );

      return {
        roles,
        permissions: uniquePermissions
      };
    } catch (error) {
      console.error('Error getting user roles and permissions:', error);
      throw error;
    }
  }

  /**
   * Get all available roles
   */
  async getAllRoles() {
    try {
      return await this.prisma.role.findMany({
        where: { isActive: true },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting roles:', error);
      throw error;
    }
  }

  /**
   * Create a custom role
   */
  async createRole(roleData) {
    try {
      const role = await this.prisma.role.create({
        data: {
          ...roleData,
          isSystem: false
        }
      });

      await this.logSecurityEvent(null, 'role_created', { 
        roleName: roleData.name 
      });

      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId, permissionId, isGranted = true) {
    try {
      const rolePermission = await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        },
        update: { isGranted },
        create: {
          roleId,
          permissionId,
          isGranted
        }
      });

      return rolePermission;
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      throw error;
    }
  }

  /**
   * Log security events
   */
  async logSecurityEvent(userId, action, details = {}) {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId,
          action,
          details,
          success: true
        }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Cleanup expired roles
   */
  async cleanupExpiredRoles() {
    try {
      const expired = await this.prisma.userRole.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true
        },
        data: { isActive: false }
      });

      return expired.count;
    } catch (error) {
      console.error('Error cleaning up expired roles:', error);
      throw error;
    }
  }
}

// Export singleton instance
const rbacService = new RBACService();
export default rbacService;
