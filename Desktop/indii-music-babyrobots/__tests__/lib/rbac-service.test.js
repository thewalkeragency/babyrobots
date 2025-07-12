/**
 * RBAC Service Unit Tests
 * Comprehensive testing for role-based access control functionality
 */

import { jest } from '@jest/globals';
import rbacService from '../../src/lib/rbac-service.js';

// Mock Prisma client
const mockPrisma = {
  role: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn()
  },
  permission: {
    upsert: jest.fn(),
    findUnique: jest.fn()
  },
  userRole: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  rolePermission: {
    upsert: jest.fn()
  },
  securityLog: {
    create: jest.fn()
  }
};

// Replace the prisma instance in rbacService
rbacService.prisma = mockPrisma;

describe('RBAC Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role Assignment', () => {
    test('should assign role to user successfully', async () => {
      const mockRole = { id: 1, name: 'artist' };
      const mockUserRole = {
        id: 1,
        userId: 123,
        roleId: 1,
        isActive: true,
        role: mockRole,
        user: { id: 123, email: 'test@example.com' }
      };

      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.userRole.findUnique.mockResolvedValue(null);
      mockPrisma.userRole.create.mockResolvedValue(mockUserRole);
      mockPrisma.securityLog.create.mockResolvedValue({});

      const result = await rbacService.assignRole(123, 'artist', 456);

      expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'artist' }
      });
      expect(mockPrisma.userRole.create).toHaveBeenCalledWith({
        data: {
          userId: 123,
          roleId: 1,
          assignedBy: 456,
          isActive: true
        },
        include: {
          role: true,
          user: true
        }
      });
      expect(result).toEqual(mockUserRole);
    });

    test('should throw error when role not found', async () => {
      mockPrisma.role.findUnique.mockResolvedValue(null);

      await expect(rbacService.assignRole(123, 'nonexistent', 456))
        .rejects.toThrow("Role 'nonexistent' not found");
    });

    test('should throw error when user already has role', async () => {
      const mockRole = { id: 1, name: 'artist' };
      const mockExistingUserRole = { id: 1, isActive: true };

      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.userRole.findUnique.mockResolvedValue(mockExistingUserRole);

      await expect(rbacService.assignRole(123, 'artist', 456))
        .rejects.toThrow("User already has role 'artist'");
    });

    test('should reactivate inactive role', async () => {
      const mockRole = { id: 1, name: 'artist' };
      const mockInactiveUserRole = { id: 1, isActive: false };
      const mockUpdatedUserRole = {
        id: 1,
        isActive: true,
        role: mockRole,
        user: { id: 123 }
      };

      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.userRole.findUnique.mockResolvedValue(mockInactiveUserRole);
      mockPrisma.userRole.update.mockResolvedValue(mockUpdatedUserRole);
      mockPrisma.securityLog.create.mockResolvedValue({});

      const result = await rbacService.assignRole(123, 'artist', 456);

      expect(mockPrisma.userRole.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: true,
          assignedBy: 456,
          assignedAt: expect.any(Date)
        },
        include: {
          role: true,
          user: true
        }
      });
      expect(result).toEqual(mockUpdatedUserRole);
    });
  });

  describe('Role Revocation', () => {
    test('should revoke role from user successfully', async () => {
      const mockRole = { id: 1, name: 'artist' };
      const mockUserRole = { id: 1, isActive: true };
      const mockUpdatedUserRole = {
        id: 1,
        isActive: false,
        role: mockRole,
        user: { id: 123 }
      };

      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.userRole.findUnique.mockResolvedValue(mockUserRole);
      mockPrisma.userRole.update.mockResolvedValue(mockUpdatedUserRole);
      mockPrisma.securityLog.create.mockResolvedValue({});

      const result = await rbacService.revokeRole(123, 'artist', 456);

      expect(mockPrisma.userRole.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: false,
          updatedAt: expect.any(Date)
        },
        include: {
          role: true,
          user: true
        }
      });
      expect(result).toEqual(mockUpdatedUserRole);
    });

    test('should throw error when user does not have role', async () => {
      const mockRole = { id: 1, name: 'artist' };

      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.userRole.findUnique.mockResolvedValue(null);

      await expect(rbacService.revokeRole(123, 'artist', 456))
        .rejects.toThrow("User does not have active role 'artist'");
    });
  });

  describe('Permission Checking', () => {
    test('should return true for user with valid permission', async () => {
      const mockUserRoles = [{
        role: {
          rolePermissions: [{
            permission: {
              name: 'create_track',
              scope: 'own'
            },
            isGranted: true
          }]
        }
      }];

      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRoles);

      const result = await rbacService.hasPermission(123, 'create_track', 123);

      expect(result).toBe(true);
    });

    test('should return false for user without permission', async () => {
      const mockUserRoles = [{
        role: {
          rolePermissions: [{
            permission: {
              name: 'other_permission',
              scope: 'own'
            },
            isGranted: true
          }]
        }
      }];

      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRoles);

      const result = await rbacService.hasPermission(123, 'create_track', 123);

      expect(result).toBe(false);
    });

    test('should return true for admin with all scope permission', async () => {
      const mockUserRoles = [{
        role: {
          rolePermissions: [{
            permission: {
              name: 'manage_users',
              scope: 'all'
            },
            isGranted: true
          }]
        }
      }];

      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRoles);

      const result = await rbacService.hasPermission(123, 'manage_users');

      expect(result).toBe(true);
    });

    test('should return false for denied permission', async () => {
      const mockUserRoles = [{
        role: {
          rolePermissions: [{
            permission: {
              name: 'create_track',
              scope: 'own'
            },
            isGranted: false
          }]
        }
      }];

      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRoles);

      const result = await rbacService.hasPermission(123, 'create_track', 123);

      expect(result).toBe(false);
    });

    test('should return false for user with no roles', async () => {
      mockPrisma.userRole.findMany.mockResolvedValue([]);

      const result = await rbacService.hasPermission(123, 'create_track');

      expect(result).toBe(false);
    });
  });

  describe('User Roles and Permissions Retrieval', () => {
    test('should return user roles and permissions', async () => {
      const mockUserRoles = [{
        role: {
          id: 1,
          name: 'artist',
          displayName: 'Artist'
        }
      }];

      const mockPermissions = [{
        id: 1,
        name: 'create_track',
        displayName: 'Create Track'
      }];

      const mockUserRolesWithPermissions = [{
        role: {
          id: 1,
          name: 'artist',
          displayName: 'Artist',
          rolePermissions: [{
            permission: mockPermissions[0]
          }]
        }
      }];

      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRolesWithPermissions);

      const result = await rbacService.getUserRolesAndPermissions(123);

      expect(result.roles).toHaveLength(1);
      expect(result.permissions).toHaveLength(1);
      expect(result.roles[0].name).toBe('artist');
      expect(result.permissions[0].name).toBe('create_track');
    });

    test('should remove duplicate permissions', async () => {
      const mockPermission = {
        id: 1,
        name: 'create_track',
        displayName: 'Create Track'
      };

      const mockUserRoles = [{
        role: {
          id: 1,
          name: 'artist',
          rolePermissions: [{ permission: mockPermission }]
        }
      }, {
        role: {
          id: 2,
          name: 'premium_user',
          rolePermissions: [{ permission: mockPermission }]
        }
      }];

      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRoles);

      const result = await rbacService.getUserRolesAndPermissions(123);

      expect(result.permissions).toHaveLength(1);
      expect(result.permissions[0].id).toBe(1);
    });
  });

  describe('Role Creation', () => {
    test('should create custom role successfully', async () => {
      const roleData = {
        name: 'custom_role',
        displayName: 'Custom Role',
        description: 'A custom role'
      };

      const mockCreatedRole = {
        id: 5,
        ...roleData,
        isSystem: false
      };

      mockPrisma.role.create.mockResolvedValue(mockCreatedRole);
      mockPrisma.securityLog.create.mockResolvedValue({});

      const result = await rbacService.createRole(roleData);

      expect(mockPrisma.role.create).toHaveBeenCalledWith({
        data: {
          ...roleData,
          isSystem: false
        }
      });
      expect(result).toEqual(mockCreatedRole);
    });
  });

  describe('Permission to Role Assignment', () => {
    test('should assign permission to role', async () => {
      const mockRolePermission = {
        id: 1,
        roleId: 1,
        permissionId: 1,
        isGranted: true
      };

      mockPrisma.rolePermission.upsert.mockResolvedValue(mockRolePermission);

      const result = await rbacService.assignPermissionToRole(1, 1, true);

      expect(mockPrisma.rolePermission.upsert).toHaveBeenCalledWith({
        where: {
          roleId_permissionId: {
            roleId: 1,
            permissionId: 1
          }
        },
        update: { isGranted: true },
        create: {
          roleId: 1,
          permissionId: 1,
          isGranted: true
        }
      });
      expect(result).toEqual(mockRolePermission);
    });
  });

  describe('Cleanup Operations', () => {
    test('should cleanup expired roles', async () => {
      const mockResult = { count: 3 };
      mockPrisma.userRole.updateMany.mockResolvedValue(mockResult);

      const result = await rbacService.cleanupExpiredRoles();

      expect(mockPrisma.userRole.updateMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
          isActive: true
        },
        data: { isActive: false }
      });
      expect(result).toBe(3);
    });
  });

  describe('Security Logging', () => {
    test('should log security events', async () => {
      mockPrisma.securityLog.create.mockResolvedValue({});

      await rbacService.logSecurityEvent(123, 'role_assigned', { role: 'artist' });

      expect(mockPrisma.securityLog.create).toHaveBeenCalledWith({
        data: {
          userId: 123,
          action: 'role_assigned',
          details: { role: 'artist' },
          success: true
        }
      });
    });

    test('should handle logging errors gracefully', async () => {
      mockPrisma.securityLog.create.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(rbacService.logSecurityEvent(123, 'test', {}))
        .resolves.toBeUndefined();
    });
  });
});
