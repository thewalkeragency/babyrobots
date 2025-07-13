import registerHandler from '../../pages/api/auth/register';
import loginHandler from '../../pages/api/auth/login';
import signupHandler from '../../pages/api/auth/signup';
import signoutHandler from '../../pages/api/auth/signout';
import sessionHandler from '../../pages/api/auth/session';
import profileHandler from '../../pages/api/auth/profile';

import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';

// Mock the auth service to prevent actual Supabase calls during tests
jest.mock('../../src/lib/auth-service.js', () => ({
  authService: {
    register: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    validateSession: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

const authService = require('../../src/lib/auth-service.js').authService;

describe('Authentication API', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      method: 'POST',
      body: {},
      query: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    };
  });

  describe('/api/auth/register', () => {
    it('should register a new user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123', role: 'artist' };
      authService.register.mockResolvedValueOnce({
        success: true,
        user: { id: 'uuid-123', email: 'test@example.com' },
        profile: { role: 'artist' },
        message: 'Registration successful'
      });

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful',
        user: { id: 'uuid-123', email: 'test@example.com', role: 'artist' },
        profile: { role: 'artist' }
      });
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        role: 'artist',
        profile: {}
      });
    });

    it('should return 400 if registration fails', async () => {
      req.body = { email: 'test@example.com', password: 'password123', role: 'artist' };
      authService.register.mockResolvedValueOnce({
        success: false,
        error: 'User already exists'
      });

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists'
      });
    });

    it('should return 400 if email, password or role are missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password and role

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email, password, and role are required.'
      });
    });

    it('should return 400 for invalid role', async () => {
      req.body = { email: 'test@example.com', password: 'password123', role: 'invalid_role' };

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid role. Must be one of: artist, fan, licensor, service_provider'
      });
    });

    it('should return 405 for non-POST requests', async () => {
      req.method = 'GET';

      await registerHandler(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
    });
  });

  describe('/api/auth/login', () => {
    it('should log in a user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      authService.signIn.mockResolvedValueOnce({
        success: true,
        user: { id: 'uuid-123', email: 'test@example.com' },
        profile: { role: 'artist' },
        message: 'Sign in successful'
      });

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Sign in successful',
        user: { id: 'uuid-123', email: 'test@example.com', role: 'artist' },
        profile: { role: 'artist' },
        needsProfileSetup: false
      });
      expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return 401 for invalid credentials', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      req.body = { email, password };
      authService.signIn.mockResolvedValueOnce({
        success: false,
        error: 'Invalid credentials'
      });

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return 400 if email or password are missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email and password are required.'
      });
    });

    it('should return 405 for non-POST requests', async () => {
      req.method = 'GET';

      await loginHandler(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
    });
  });

  describe('/api/auth/session', () => {
    it('should return current session for authenticated user', async () => {
      req.method = 'GET';
      authService.getCurrentUser.mockResolvedValueOnce({
        success: true,
        authenticated: true,
        user: { id: faker.string.uuid(), email: faker.internet.email() },
        profile: { role: 'artist' },
        session: { expires_at: new Date().getTime() + 3600000 }
      });

      await sessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        authenticated: true,
        user: { id: faker.string.uuid(), email: faker.internet.email(), role: 'artist' },
        profile: { role: 'artist' }
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      req.method = 'GET';
      authService.getCurrentUser.mockResolvedValueOnce({
        success: false,
        authenticated: false
      });

      await sessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        authenticated: false,
        message: expect.any(String)
      });
    });
  });

  describe('/api/auth/signout', () => {
    it('should sign out user successfully', async () => {
      authService.signOut.mockResolvedValueOnce({
        success: true,
        message: 'Sign out successful'
      });

      await signoutHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Sign out successful'
      });
      expect(authService.signOut).toHaveBeenCalled();
    });

    it('should handle signout failure', async () => {
      authService.signOut.mockResolvedValueOnce({
        success: false,
        error: 'Signout failed'
      });

      await signoutHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Signout failed'
      });
    });
  });
});
