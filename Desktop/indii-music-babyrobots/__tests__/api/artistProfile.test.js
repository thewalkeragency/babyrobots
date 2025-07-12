import { createArtistProfile, getArtistProfileByUserId, updateArtistProfile, deleteArtistProfile } from '../../src/lib/db';
import handler from '../../pages/api/profile/artist';

// Mock the database functions
jest.mock('../../src/lib/db', () => ({
  __esModule: true,
  createArtistProfile: jest.fn(),
  getArtistProfileByUserId: jest.fn(),
  updateArtistProfile: jest.fn(),
  deleteArtistProfile: jest.fn(),
}));

describe('Artist Profile API', () => {
  let req;
  let res;

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
  it('should create an artist profile', async () => {
    req.method = 'POST';
    req.body = { ...req.body, stageName: 'Test Artist', legalName: 'John Doe' };
    createArtistProfile.mockReturnValueOnce(101);

    await handler(req, res);

    expect(createArtistProfile).toHaveBeenCalledWith(1, 'Test Artist', 'John Doe', undefined, undefined, undefined, undefined, null, undefined);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Artist profile created successfully!', profileId: 101 });
  });

  it('should return 400 if stageName is missing on POST', async () => {
    req.method = 'POST';
    req.body = { ...req.body, legalName: 'John Doe' }; // Missing stageName

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Stage name is required to create an artist profile.' });
  });

  // Test GET (Read)
  it('should get an artist profile', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getArtistProfileByUserId.mockReturnValueOnce({ id: 101, stage_name: 'Fetched Artist' });

    await handler(req, res);

    expect(getArtistProfileByUserId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 101, stage_name: 'Fetched Artist' });
  });

  it('should return 404 if artist profile not found on GET', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getArtistProfileByUserId.mockReturnValueOnce(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Artist profile not found.' });
  });

  // Test PUT (Update)
  it('should update an artist profile', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, stageName: 'Updated Artist', bio: 'New Bio' };
    updateArtistProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(updateArtistProfile).toHaveBeenCalledWith(1, 'Updated Artist', undefined, 'New Bio', undefined, undefined, undefined, null, undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Artist profile updated successfully!' });
  });

  it('should return 404 if artist profile not found on PUT', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, stageName: 'Updated Artist' };
    updateArtistProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Artist profile not found or no changes made.' });
  });

  // Test DELETE
  it('should delete an artist profile', async () => {
    req.method = 'DELETE';
    deleteArtistProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(deleteArtistProfile).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Artist profile deleted successfully!' });
  });

  it('should return 404 if artist profile not found on DELETE', async () => {
    req.method = 'DELETE';
    deleteArtistProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Artist profile not found.' });
  });

  // Test unauthorized access
  it('should return 401 if userId is missing', async () => {
    req.body.userId = undefined; // Remove userId
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
