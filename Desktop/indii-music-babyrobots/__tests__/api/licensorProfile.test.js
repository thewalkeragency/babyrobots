import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';

// Define the mock functions first
const mockCreateLicensorProfile = jest.fn();
const mockGetLicensorProfileByUserId = jest.fn();
const mockUpdateLicensorProfile = jest.fn();
const mockDeleteLicensorProfile = jest.fn();

// Then mock the module, returning these mock functions
jest.mock('../../src/lib/db', () => ({
  __esModule: true,
  createLicensorProfile: mockCreateLicensorProfile,
  getLicensorProfileByUserId: mockGetLicensorProfileByUserId,
  updateLicensorProfile: mockUpdateLicensorProfile,
  deleteLicensorProfile: mockDeleteLicensorProfile,
}));

// Now import the handler
import handler from '../../pages/api/profile/licensor';

describe('Licensor Profile API', () => {
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
  it('should create a licensor profile', async () => {
    req.method = 'POST';
    req.body = { ...req.body, companyName: 'Test Company', contactPerson: 'Jane Doe' };
    createLicensorProfile.mockReturnValueOnce(101);

    await handler(req, res);

    expect(createLicensorProfile).toHaveBeenCalledWith(1, 'Test Company', 'Jane Doe', undefined, undefined, undefined);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Licensor profile created successfully!', profileId: 101 });
  });

  it('should return 400 if companyName is missing on POST', async () => {
    req.method = 'POST';
    req.body = { ...req.body, contactPerson: 'Jane Doe' }; // Missing companyName

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Company name is required to create a licensor profile.' });
  });

  // Test GET (Read)
  it('should get a licensor profile', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getLicensorProfileByUserId.mockReturnValueOnce({ id: 101, company_name: 'Fetched Company' });

    await handler(req, res);

    expect(getLicensorProfileByUserId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 101, company_name: 'Fetched Company' });
  });

  it('should return 404 if licensor profile not found on GET', async () => {
    req.method = 'GET';
    req.query.userId = 1; // Set userId in query for GET request
    getLicensorProfileByUserId.mockReturnValueOnce(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Licensor profile not found.' });
  });

  // Test PUT (Update)
  it('should update a licensor profile', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, companyName: 'Updated Company', industry: 'Film' };
    updateLicensorProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(updateLicensorProfile).toHaveBeenCalledWith(1, 'Updated Company', undefined, 'Film', undefined, undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Licensor profile updated successfully!' });
  });

  it('should return 404 if licensor profile not found on PUT', async () => {
    req.method = 'PUT';
    req.body = { ...req.body, companyName: faker.company.name() };
    updateLicensorProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Licensor profile not found or no changes made.' });
  });

  // Test DELETE
  it('should delete a licensor profile', async () => {
    req.method = 'DELETE';
    deleteLicensorProfile.mockReturnValueOnce(1); // 1 change made

    await handler(req, res);

    expect(deleteLicensorProfile).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Licensor profile deleted successfully!' });
  });

  it('should return 404 if licensor profile not found on DELETE', async () => {
    req.method = 'DELETE';
    mockDeleteLicensorProfile.mockReturnValueOnce(0); // 0 changes made

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Licensor profile not found.' });
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
