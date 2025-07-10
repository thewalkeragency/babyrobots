import { createUser, getUserByEmail, verifyPassword } from '../../lib/db';
import registerHandler from '../../pages/api/auth/register';
import loginHandler from '../../pages/api/auth/login';

// Mock the database to prevent actual file system writes during tests
jest.mock('../../lib/db', () => ({
  __esModule: true,
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
}));

describe('Authentication API', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      method: 'POST',
      body: {},
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
      getUserByEmail.mockReturnValueOnce(null); // User does not exist
      createUser.mockReturnValueOnce(1); // User created with ID 1

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully!', userId: 1 });
      expect(createUser).toHaveBeenCalledWith('test@example.com', 'password123', 'artist');
    });

    it('should return 409 if user already exists', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      getUserByEmail.mockReturnValueOnce({ id: 1, email: 'test@example.com' }); // User exists

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with this email already exists.' });
      expect(createUser).not.toHaveBeenCalled();
    });

    it('should return 400 if email or password are missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required.' });
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
      getUserByEmail.mockReturnValueOnce({ id: 1, email: 'test@example.com', password: 'hashed_password', role: 'artist' });
      verifyPassword.mockReturnValueOnce(true);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Login successful!', user: { id: 1, email: 'test@example.com', role: 'artist' } });
      expect(verifyPassword).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    it('should return 401 for invalid credentials (user not found)', async () => {
      req.body = { email: 'nonexistent@example.com', password: 'password123' };
      getUserByEmail.mockReturnValueOnce(null);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      getUserByEmail.mockReturnValueOnce({ id: 1, email: 'test@example.com', password: 'hashed_password' });
      verifyPassword.mockReturnValueOnce(false);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
    });

    it('should return 405 for non-POST requests', async () => {
      req.method = 'GET';

      await loginHandler(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
    });
  });
});