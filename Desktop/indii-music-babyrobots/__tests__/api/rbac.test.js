/**
 * RBAC API Integration Tests
 * Tests for role management API endpoints
 */

import { jest } from '@jest/globals';

// Mock the services
const mockAuthService = {
  validateSession: jest.fn()
};

const mockRbacService = {
  assignRole: jest.fn(),
  revokeRole: jest.fn(),
  hasPermission: jest.fn(),
  getUserRolesAndPermissions: jest.fn(),
  getAllRoles: jest.fn()
};

// Mock modules using standard Jest mocking
jest.mock('../../src/lib/auth-service.js', () => mockAuthService);

jest.mock('../../src/lib/rbac-service.js', () => mockRbacService);

// Import handlers after mocking - using dynamic imports in beforeAll
let assignHandler, revokeHandler, checkHandler, listHandler;

// Mock request and response objects
const createMockRequest = (method = 'POST', body = {}, query = {}) => ({
  method,
  body,
  query
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('RBAC API Endpoints', () => {
  beforeAll(async () => {
    // Import handlers after mocking
    const assignModule = await import('../../pages/api/roles/assign.js');
    const revokeModule = await import('../../pages/api/roles/revoke.js');
    const checkModule = await import('../../pages/api/roles/check.js');
    const listModule = await import('../../pages/api/roles/list.js');
    
    assignHandler = assignModule.default;
    revokeHandler = revokeModule.default;
    checkHandler = checkModule.default;
    listHandler = listModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/roles/assign', () => {
    test('should assign role successfully', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'artist' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);
      mockRbacService.assignRole.mockResolvedValue({
        id: 1,
        userId: 123,
        role: { name: 'artist' }
      });

      await assignHandler(req, res);

      expect(mockRbacService.assignRole).toHaveBeenCalledWith(123, 'artist', 456);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Role 'artist' assigned successfully",
        userRole: expect.any(Object)
      });
    });

    test('should return 401 for unauthenticated user', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'artist' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({ success: false });

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('should return 403 for insufficient permissions', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'artist' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(false);

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions to assign roles'
      });
    });

    test('should return 400 for missing required fields', async () => {
      const req = createMockRequest('POST', { userId: 123 }); // Missing roleName
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields: userId and roleName'
      });
    });

    test('should return 405 for wrong method', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });
  });

  describe('/api/roles/revoke', () => {
    test('should revoke role successfully', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'artist' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);
      mockRbacService.revokeRole.mockResolvedValue({
        id: 1,
        userId: 123,
        role: { name: 'artist' }
      });

      await revokeHandler(req, res);

      expect(mockRbacService.revokeRole).toHaveBeenCalledWith(123, 'artist', 456);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Role 'artist' revoked successfully",
        userRole: expect.any(Object)
      });
    });

    test('should prevent revoking super_admin from self', async () => {
      const req = createMockRequest('POST', { userId: 456, roleName: 'super_admin' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);

      await revokeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot revoke super_admin role from yourself'
      });
    });
  });

  describe('/api/roles/check', () => {
    test('should check permission successfully', async () => {
      const req = createMockRequest('POST', { permissionName: 'create_track' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 123 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);

      await checkHandler(req, res);

      expect(mockRbacService.hasPermission).toHaveBeenCalledWith(123, 'create_track', null);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        userId: 123,
        permission: 'create_track',
        hasPermission: true,
        resourceOwnerId: null
      });
    });

    test('should check permission for other user if admin', async () => {
      const req = createMockRequest('POST', { 
        permissionName: 'create_track', 
        userId: 456 
      });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 123 }
      });
      mockRbacService.hasPermission
        .mockResolvedValueOnce(true)  // For manage_roles check
        .mockResolvedValueOnce(false); // For actual permission check

      await checkHandler(req, res);

      expect(mockRbacService.hasPermission).toHaveBeenCalledWith(456, 'create_track', null);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should deny checking other user permission without admin rights', async () => {
      const req = createMockRequest('POST', { 
        permissionName: 'create_track', 
        userId: 456 
      });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 123 }
      });
      mockRbacService.hasPermission.mockResolvedValue(false);

      await checkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Can only check your own permissions'
      });
    });
  });

  describe('/api/roles/list', () => {
    test('should list user roles and permissions', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();

      const mockRolesAndPermissions = {
        roles: [{ id: 1, name: 'artist', displayName: 'Artist' }],
        permissions: [{ id: 1, name: 'create_track', displayName: 'Create Track' }]
      };

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 123 }
      });
      mockRbacService.getUserRolesAndPermissions.mockResolvedValue(mockRolesAndPermissions);
      mockRbacService.hasPermission.mockResolvedValue(false);

      await listHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        userId: 123,
        userRoles: mockRolesAndPermissions.roles,
        userPermissions: undefined,
        availableRoles: [],
        canManageRoles: false
      });
    });

    test('should include available roles for admin users', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();

      const mockRolesAndPermissions = {
        roles: [{ id: 1, name: 'admin', displayName: 'Administrator' }],
        permissions: []
      };

      const mockAllRoles = [
        { id: 1, name: 'admin', displayName: 'Administrator' },
        { id: 2, name: 'artist', displayName: 'Artist' }
      ];

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 123 }
      });
      mockRbacService.getUserRolesAndPermissions.mockResolvedValue(mockRolesAndPermissions);
      mockRbacService.hasPermission.mockResolvedValue(true);
      mockRbacService.getAllRoles.mockResolvedValue(mockAllRoles);

      await listHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        userId: 123,
        userRoles: mockRolesAndPermissions.roles,
        userPermissions: undefined,
        availableRoles: mockAllRoles,
        canManageRoles: true
      });
    });

    test('should include permissions when requested', async () => {
      const req = createMockRequest('GET', {}, { includePermissions: 'true' });
      const res = createMockResponse();

      const mockRolesAndPermissions = {
        roles: [{ id: 1, name: 'artist', displayName: 'Artist' }],
        permissions: [{ id: 1, name: 'create_track', displayName: 'Create Track' }]
      };

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 123 }
      });
      mockRbacService.getUserRolesAndPermissions.mockResolvedValue(mockRolesAndPermissions);
      mockRbacService.hasPermission.mockResolvedValue(false);

      await listHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        userId: 123,
        userRoles: mockRolesAndPermissions.roles,
        userPermissions: mockRolesAndPermissions.permissions,
        availableRoles: [],
        canManageRoles: false
      });
    });

    test('should return 405 for wrong method', async () => {
      const req = createMockRequest('POST');
      const res = createMockResponse();

      await listHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'artist' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);
      mockRbacService.assignRole.mockRejectedValue(new Error('Database connection failed'));

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An error occurred while processing your request'
      });
    });

    test('should handle role not found errors', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'nonexistent' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);
      mockRbacService.assignRole.mockRejectedValue(new Error("Role 'nonexistent' not found"));

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Role 'nonexistent' not found"
      });
    });

    test('should handle duplicate role assignment', async () => {
      const req = createMockRequest('POST', { userId: 123, roleName: 'artist' });
      const res = createMockResponse();

      mockAuthService.validateSession.mockResolvedValue({
        success: true,
        user: { id: 456 }
      });
      mockRbacService.hasPermission.mockResolvedValue(true);
      mockRbacService.assignRole.mockRejectedValue(new Error("User already has role 'artist'"));

      await assignHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "User already has role 'artist'"
      });
    });
  });
});
