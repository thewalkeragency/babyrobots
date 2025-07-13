import { createMocks } from 'node-mocks-http';
import { createUser, db } from '../lib/db';

// Import API handlers
import artistHandler from '../pages/api/profiles/artist.js';
import fanHandler from '../pages/api/profiles/fan.js';
import licensorHandler from '../pages/api/profiles/licensor.js';
import serviceProviderHandler from '../pages/api/profiles/service-provider.js';

describe('🧪 Profile API Endpoints Test Suite', () => {
  let testUserId;

  // Clean database and create test user before each test
  beforeEach(() => {
    db.prepare('DELETE FROM chat_messages').run();
    db.prepare('DELETE FROM chat_sessions').run();
    db.prepare('DELETE FROM audio_files').run();
    db.prepare('DELETE FROM workspace_tasks').run();
    db.prepare('DELETE FROM workspace_files').run();
    db.prepare('DELETE FROM project_workspaces').run();
    db.prepare('DELETE FROM split_sheet_contributors').run();
    db.prepare('DELETE FROM split_sheets').run();
    db.prepare('DELETE FROM tracks').run();
    db.prepare('DELETE FROM service_provider_profiles').run();
    db.prepare('DELETE FROM licensor_profiles').run();
    db.prepare('DELETE FROM fan_profiles').run();
    db.prepare('DELETE FROM artist_profiles').run();
    db.prepare('DELETE FROM users').run();
  });

  describe('✅ Artist Profile API Tests', () => {
    beforeEach(() => {
      // Create test user with artist profile type
      const userData = {
        email: 'artist@test.com',
        password_hash: 'hashedpassword',
        username: 'testartist',
        first_name: 'Test',
        last_name: 'Artist',
        profile_type: 'artist'
      };
      const userResult = createUser(userData);
      testUserId = userResult.lastInsertRowid;
    });

    test('POST /api/profiles/artist - should create artist profile', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: 'Test Artist',
            bio: 'Test bio',
            genre: 'Electronic'
          }
        }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe('Artist profile created successfully');
      expect(response.profile.artist_name).toBe('Test Artist');
    });

    test('GET /api/profiles/artist - should get artist profile', async () => {
      // First create a profile
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: 'Test Artist',
            bio: 'Test bio'
          }
        }
      });
      await artistHandler(createReq, createRes);

      // Then get the profile
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: testUserId.toString() }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.profile.artist_name).toBe('Test Artist');
    });

    test('PUT /api/profiles/artist - should update artist profile', async () => {
      // First create a profile
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: 'Test Artist',
            bio: 'Original bio'
          }
        }
      });
      await artistHandler(createReq, createRes);

      // Then update the profile
      const { req, res } = createMocks({
        method: 'PUT',
        query: { userId: testUserId.toString() },
        body: {
          updateData: {
            artist_name: 'Updated Artist',
            bio: 'Updated bio'
          }
        }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe('Artist profile updated successfully');
      expect(response.profile.artist_name).toBe('Updated Artist');
    });

    test('DELETE /api/profiles/artist - should delete artist profile', async () => {
      // First create a profile
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: 'Test Artist'
          }
        }
      });
      await artistHandler(createReq, createRes);

      // Then delete the profile
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { userId: testUserId.toString() }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe('Artist profile deleted successfully');
    });

    test('POST /api/profiles/artist - should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: '' // Invalid: empty artist name
          }
        }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.errors).toContain('Artist name is required');
    });

    test('GET /api/profiles/artist - should return 404 for non-existent profile', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: testUserId.toString() }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe('Artist profile not found');
    });
  });

  describe('✅ Fan Profile API Tests', () => {
    beforeEach(() => {
      // Create test user with fan profile type
      const userData = {
        email: 'fan@test.com',
        password_hash: 'hashedpassword',
        username: 'testfan',
        first_name: 'Test',
        last_name: 'Fan',
        profile_type: 'fan'
      };
      const userResult = createUser(userData);
      testUserId = userResult.lastInsertRowid;
    });

    test('POST /api/profiles/fan - should create fan profile', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            display_name: 'Test Fan',
            favorite_genres: 'Electronic, Hip Hop'
          }
        }
      });

      await fanHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe('Fan profile created successfully');
      expect(response.profile.display_name).toBe('Test Fan');
    });

    test('PUT /api/profiles/fan - should update fan profile', async () => {
      // First create a profile
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            display_name: 'Test Fan'
          }
        }
      });
      await fanHandler(createReq, createRes);

      // Then update the profile
      const { req, res } = createMocks({
        method: 'PUT',
        query: { userId: testUserId.toString() },
        body: {
          updateData: {
            display_name: 'Updated Fan Name'
          }
        }
      });

      await fanHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.profile.display_name).toBe('Updated Fan Name');
    });

    test('POST /api/profiles/fan - should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            display_name: '' // Invalid: empty display name
          }
        }
      });

      await fanHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.errors).toContain('Display name is required');
    });
  });

  describe('✅ Licensor Profile API Tests', () => {
    beforeEach(() => {
      // Create test user with licensor profile type
      const userData = {
        email: 'licensor@test.com',
        password_hash: 'hashedpassword',
        username: 'testlicensor',
        first_name: 'Test',
        last_name: 'Licensor',
        profile_type: 'licensor'
      };
      const userResult = createUser(userData);
      testUserId = userResult.lastInsertRowid;
    });

    test('POST /api/profiles/licensor - should create licensor profile', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            company_name: 'Test Licensing Co',
            contact_person: 'John Doe'
          }
        }
      });

      await licensorHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe('Licensor profile created successfully');
      expect(response.profile.company_name).toBe('Test Licensing Co');
    });

    test('POST /api/profiles/licensor - should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            company_name: '' // Invalid: empty company name
          }
        }
      });

      await licensorHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.errors).toContain('Company name is required');
    });
  });

  describe('✅ Service Provider Profile API Tests', () => {
    beforeEach(() => {
      // Create test user with service_provider profile type
      const userData = {
        email: 'provider@test.com',
        password_hash: 'hashedpassword',
        username: 'testprovider',
        first_name: 'Test',
        last_name: 'Provider',
        profile_type: 'service_provider'
      };
      const userResult = createUser(userData);
      testUserId = userResult.lastInsertRowid;
    });

    test('POST /api/profiles/service-provider - should create service provider profile', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            company_name: 'Test Audio Services',
            service_type: 'Mixing & Mastering'
          }
        }
      });

      await serviceProviderHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe('Service provider profile created successfully');
      expect(response.profile.company_name).toBe('Test Audio Services');
    });

    test('POST /api/profiles/service-provider - should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            company_name: 'Valid Company',
            service_type: '' // Invalid: empty service type
          }
        }
      });

      await serviceProviderHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.errors).toContain('Service type is required');
    });
  });

  describe('✅ Error Handling Tests', () => {
    beforeEach(() => {
      // Create test user with artist profile type
      const userData = {
        email: 'artist@test.com',
        password_hash: 'hashedpassword',
        username: 'testartist',
        first_name: 'Test',
        last_name: 'Artist',
        profile_type: 'artist'
      };
      const userResult = createUser(userData);
      testUserId = userResult.lastInsertRowid;
    });

    test('should return 400 when userId is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {} // Missing userId
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe('User ID is required');
    });

    test('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH', // Unsupported method
        query: { userId: testUserId.toString() }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe('Method PATCH not allowed');
    });

    test('should return 404 when user does not exist', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: '99999' }, // Non-existent user
        body: {
          profileData: {
            artist_name: 'Test Artist'
          }
        }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe('User not found');
    });

    test('should return 409 when profile already exists', async () => {
      // First create a profile
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: 'Test Artist'
          }
        }
      });
      await artistHandler(createReq, createRes);

      // Try to create another profile for the same user
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: testUserId.toString() },
        body: {
          profileData: {
            artist_name: 'Another Artist'
          }
        }
      });

      await artistHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe('Artist profile already exists for this user');
    });
  });
});
