/**
 * Session Management API Tests
 * Tests all session endpoints for Ring 1 Task 3 completion
 */

// Test data (needs to be defined early for use in mocks)
const testUser = {
  email: 'session.test@example.com',
  password: 'SecureTestPass123!',
  role: 'artist',
  profile: {
    displayName: 'Session Tester',
    artistName: 'Session Artist'
  }
};

import { createMocks } from 'node-mocks-http';
import createSessionHandler from '../../pages/api/sessions/create.js';
import validateSessionHandler from '../../pages/api/sessions/validate.js';
import refreshSessionHandler from '../../pages/api/sessions/refresh.js';
import revokeSessionHandler from '../../pages/api/sessions/revoke.js';
import listSessionHandler from '../../pages/api/sessions/list.js';
import { PrismaClient } from '@prisma/client';
import sessionService from '../../src/lib/session-service.js';
import tokenService from '../../src/lib/token-service.js';

const prisma = new PrismaClient();

// Mock AuthService with a simpler approach that doesn't interfere with imports
const mockAuthService = {
  register: jest.fn().mockImplementation(async (userData) => {
    // Create a user in the database directly for testing
    const hashedPassword = 'hashedPassword123'; // Mock hash
    const createdUser = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        profileType: userData.role, // Map role to profileType
        firstName: userData.profile?.displayName || userData.email.split('@')[0]
      }
    });
    
    return {
      success: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.profileType
      },
      profile: createdUser,
      message: 'Registration successful'
    };
  }),
  signIn: jest.fn().mockImplementation(async (email, password) => {
    // Simulate authentication check
    if (email === testUser.email && password === testUser.password) {
      // Find the user we created in the test
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            profileType: user.profileType
          },
          message: 'Sign in successful'
        };
      }
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  })
};

// Mock the auth service used in the session handlers
jest.doMock('../../src/lib/auth-service.js', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => mockAuthService)
  };
});

const authService = mockAuthService;

let testUserId;
let testSessionId;
let testAccessToken;
let testRefreshToken;

describe('Session Management API Tests', () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });

    // Create test user
    const user = await authService.register(testUser);
    testUserId = user.user.id;
  });

  afterAll(async () => {
    // Clean up test data only if testUserId exists
    if (testUserId) {
      try {
        await prisma.securityLog.deleteMany({ where: { userId: testUserId } });
        await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
        await prisma.session.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
      } catch (error) {
        console.error('Test cleanup error:', error);
      }
    }
    await prisma.$disconnect();
  });

  describe('POST /api/sessions/create', () => {
    test('should create session with valid credentials', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Test Browser/1.0'
        },
        body: {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: 'Test Device',
          location: 'Test Location',
          rememberMe: false
        }
      });

      await createSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.session).toBeDefined();
      expect(responseData.user).toBeDefined();
      expect(responseData.tokens).toBeDefined();
      expect(responseData.tokens.accessToken).toBeDefined();
      expect(responseData.tokens.refreshToken).toBeDefined();

      // Store for subsequent tests
      testSessionId = responseData.session.id;
      testAccessToken = responseData.tokens.accessToken;
      testRefreshToken = responseData.tokens.refreshToken;
    });

    test('should reject invalid credentials', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: testUser.email,
          password: 'wrongpassword'
        }
      });

      await createSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Invalid credentials');
    });

    test('should reject missing fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: testUser.email
          // Missing password
        }
      });

      await createSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/sessions/validate', () => {
    test('should validate access token successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Test Browser/1.0'
        },
        body: {
          accessToken: testAccessToken
        }
      });

      await validateSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.valid).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.session).toBeDefined();
    });

    test('should reject invalid token', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          accessToken: 'invalid-token'
        }
      });

      await validateSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Invalid or expired session');
    });

    test('should reject missing token', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {}
      });

      await validateSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Missing required field');
    });
  });

  describe('POST /api/sessions/refresh', () => {
    test('should refresh access token successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Test Browser/1.0'
        },
        body: {
          refreshToken: testRefreshToken
        }
      });

      await refreshSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.accessToken).toBeDefined();
      expect(responseData.refreshToken).toBeDefined();
      expect(responseData.expiresIn).toBeDefined();

      // Update access token for subsequent tests
      testAccessToken = responseData.accessToken;
    });

    test('should reject invalid refresh token', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          refreshToken: 'invalid-refresh-token'
        }
      });

      await refreshSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Refresh token not found');
    });
  });

  describe('GET /api/sessions/list', () => {
    test('should list user sessions', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: `Bearer ${testAccessToken}`
        }
      });

      await listSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.sessions).toBeDefined();
      expect(Array.isArray(responseData.sessions)).toBe(true);
      expect(responseData.stats).toBeDefined();
      expect(responseData.currentSessionId).toBeDefined();
    });

    test('should reject missing authorization', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await listSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Access token required');
    });
  });

  describe('POST /api/sessions/revoke', () => {
    test('should reject missing authorization for single revoke', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          sessionId: testSessionId
        }
      });

      await revokeSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Access token required');
    });

    test('should reject missing sessionId', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${testAccessToken}`
        },
        body: {}
      });

      await revokeSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Session ID required');
    });
  });

  describe('DELETE /api/sessions/revoke (revoke all)', () => {
    test('should revoke all other sessions', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${testAccessToken}`
        }
      });

      await revokeSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('All other sessions revoked');
      expect(responseData.currentSessionId).toBeDefined();
    });
  });

  describe('Session Service Integration Tests', () => {
    test('should handle concurrent session limits', async () => {
      // Create multiple sessions to test limit enforcement
      const sessions = [];
      
      for (let i = 0; i < 7; i++) {
        const session = await sessionService.createSession(testUserId, {
          deviceInfo: `Test Device ${i}`,
          ipAddress: `192.168.1.${100 + i}`,
          userAgent: `Test Browser ${i}/1.0`
        });
        sessions.push(session);
      }

      // Should have enforced the limit (5 max)
      const activeSessions = await sessionService.getUserSessions(testUserId);
      expect(activeSessions.length).toBeLessThanOrEqual(5);
    });

    test('should detect and handle suspicious activity', async () => {
      const suspiciousResult = await sessionService.detectSuspiciousActivity(
        testUserId,
        '192.168.1.200',
        'Suspicious Browser/1.0'
      );

      expect(suspiciousResult).toBeDefined();
      expect(typeof suspiciousResult.suspicious).toBe('boolean');
    });

    test('should clean up expired sessions', async () => {
      const cleanupResult = await sessionService.cleanupExpiredSessions();
      expect(typeof cleanupResult).toBe('number');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalPrisma = sessionService.prisma;
      sessionService.prisma = {
        session: {
          findUnique: () => {
            throw new Error('Database connection failed');
          }
        }
      };

      const result = await sessionService.validateSession('test-token');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Validation error');

      // Restore original prisma
      sessionService.prisma = originalPrisma;
    });
  });
});
