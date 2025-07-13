import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';

// Mock the database functions
const mockDbFunctions = {
  createFanProfile: jest.fn(),
  getFanProfileByUserId: jest.fn(),
  updateFanProfile: jest.fn(),
  deleteFanProfile: jest.fn()
};

jest.mock('@/lib/db', () => mockDbFunctions);

// Import handler after mocking
let handler;

const { createFanProfile, getFanProfileByUserId, updateFanProfile, deleteFanProfile } = mockDbFunctions;

describe('Fan Profile API', () => {
  let req;
  let res;

  beforeAll(async () => {
    // Import handler after mocking
    const module = await import('../../pages/api/profile/fan.js');
    handler = module.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      method: 'POST',
      body: { userId: 1 }, // Mock user ID for testing
      query: {}, // Initialize req.query
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    };
  });

  // Test POST (Create)
  it('should create a fan profile', async () => {
    req.method = 'POST';
    req.body = { ...req.body, displayName: 'Test Fan', musicPreferences: { genres: ['pop', 'rock'] } };
    createFanProfile.mockReturnValueOnce(101);

    await handler(req, res);

    expect(createFanProfile).toHaveBeenCalledWith(1, 'Test Fan', JSON.stringify({ genres: ['pop', 'rock'] }), null);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan profile created successfully!', profileId: 101 });
  });

  it('should return 400 if displayName is missing on POST', async () => {
    req.method = 'POST';
    req.body = { ...req.body, musicPreferences: { genres: ['pop'] } }; // Missing displayName

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Display name is required to create a fan profile.' });
  });

  // Test GET (Read)
  it('should get a fan profile', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getFanProfileByUserId.mockReturnValueOnce({ id: 101, display_name: 'Fetched Fan' });

    await handler(req, res);

    expect(getFanProfileByUserId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 101, display_name: 'Fetched Fan' });
  });

  it('should return 404 if fan profile not found on GET', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getFanProfileByUserId.mockReturnValueOnce(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan profile not found.' });
  });

  // Test PUT (Update)
  it('should update a fan profile', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, displayName: 'Updated Fan', musicPreferences: { genres: ['jazz'] } };
    updateFanProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(updateFanProfile).toHaveBeenCalledWith(1, req.body.displayName, JSON.stringify(req.body.musicPreferences), null);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan profile updated successfully!' });
  });

  it('should return 404 if fan profile not found on PUT', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, displayName: 'Updated Fan' };
    updateFanProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan profile not found or no changes made.' });
  });

  // Test DELETE
  it('should delete a fan profile', async () => {
    req.method = 'DELETE';
    deleteFanProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(deleteFanProfile).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan profile deleted successfully!' });
  });

  it('should return 404 if fan profile not found on DELETE', async () => {
    req.method = 'DELETE';
    deleteFanProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan profile not found.' });
  });

  // Test unauthorized access
  it('should return 401 if userId is missing', async () => {
    req.body.userId = undefined; // Remove userId
    req.query.userId = undefined; // Remove userId from query
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: User ID missing.' });
  });

  // Test unsupported method
  it('should return 405 for unsupported methods', async () => {
    req.method = 'PATCH';
    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith('Method PATCH Not Allowed');
  });
});
