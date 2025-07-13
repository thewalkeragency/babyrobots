import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';

// Define the mock functions first
const mockCreateServiceProviderProfile = jest.fn();
const mockGetServiceProviderProfileByUserId = jest.fn();
const mockUpdateServiceProviderProfile = jest.fn();
const mockDeleteServiceProviderProfile = jest.fn();

// Then mock the module, returning these mock functions
jest.mock('../../src/lib/db', () => ({
  __esModule: true,
  createServiceProviderProfile: mockCreateServiceProviderProfile,
  getServiceProviderProfileByUserId: mockGetServiceProviderProfileByUserId,
  updateServiceProviderProfile: mockUpdateServiceProviderProfile,
  deleteServiceProviderProfile: mockDeleteServiceProviderProfile,
}));

// Now import the handler
import handler from '../../pages/api/profile/serviceProvider';

describe('Service Provider Profile API', () => {
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
  it('should create a service provider profile', async () => {
    req.method = 'POST';
    req.body = { ...req.body, businessName: 'Test Studio', serviceCategories: ['mixing', 'mastering'], experienceYears: null };
    createServiceProviderProfile.mockReturnValueOnce(101);

    await handler(req, res);

    expect(createServiceProviderProfile).toHaveBeenCalledWith(1, 'Test Studio', JSON.stringify(['mixing', 'mastering']), null, null, null, null, undefined);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Service provider profile created successfully!', profileId: 101 });
  });

  it('should return 400 if businessName is missing on POST', async () => {
    req.method = 'POST';
    req.body = { ...req.body, serviceCategories: ['mixing'] }; // Missing businessName

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Business name is required to create a service provider profile.' });
  });

  // Test GET (Read)
  it('should get a service provider profile', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getServiceProviderProfileByUserId.mockReturnValueOnce({ id: 101, business_name: 'Fetched Studio' });

    await handler(req, res);

    expect(getServiceProviderProfileByUserId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 101, business_name: 'Fetched Studio' });
  });

  it('should return 404 if service provider profile not found on GET', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getServiceProviderProfileByUserId.mockReturnValueOnce(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Service provider profile not found.' });
  });

  // Test PUT (Update)
  it('should update a service provider profile', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, businessName: 'Updated Studio', experienceYears: 5 };
    updateServiceProviderProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(updateServiceProviderProfile).toHaveBeenCalledWith(1, 'Updated Studio', null, null, 5, null, null, undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Service provider profile updated successfully!' });
  });

  it('should return 404 if service provider profile not found on PUT', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, businessName: faker.company.name() };
    updateServiceProviderProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Service provider profile not found or no changes made.' });
  });

  // Test DELETE
  it('should delete a service provider profile', async () => {
    req.method = 'DELETE';
    deleteServiceProviderProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(deleteServiceProviderProfile).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Service provider profile deleted successfully!' });
  });

  it('should return 404 if service provider profile not found on DELETE', async () => {
    req.method = 'DELETE';
    mockDeleteServiceProviderProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Service provider profile not found.' });
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
