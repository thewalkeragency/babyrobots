import { 
  createUser, 
  createArtistProfile, 
  createFanProfile, 
  createLicensorProfile, 
  createServiceProviderProfile,
  updateArtistProfile,
  updateFanProfile,
  updateLicensorProfile,
  updateServiceProviderProfile,
  deleteArtistProfile,
  deleteFanProfile,
  deleteLicensorProfile,
  deleteServiceProviderProfile,
  getUserWithProfile,
  updateUserProfileType,
  searchArtistProfiles,
  searchFanProfiles,
  searchLicensorProfiles,
  searchServiceProviderProfiles,
  getProfilesByType,
  validateProfileData,
  db 
} from '../lib/db';

describe('🧪 User Profile Database Operations Test Suite', () => {
  // Clean database before each test
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

  describe('✅ CORE: Artist Profile CRUD Operations', () => {
    test('should create, read, update, and delete artist profile', () => {
      // Create user
      const userData = {
        email: 'artist@test.com',
        password_hash: 'hashedpassword',
        username: 'testartist',
        first_name: 'Test',
        last_name: 'Artist',
        profile_type: 'artist'
      };
      const userResult = createUser(userData);
      expect(userResult.lastInsertRowid).toBeGreaterThan(0);
      
      const userId = userResult.lastInsertRowid;

      // CREATE: Artist profile
      const profileData = {
        user_id: userId,
        artist_name: 'Test Artist',
        bio: 'A test artist bio',
        genre: 'Electronic',
        location: 'Detroit, MI',
        website: 'https://testartist.com',
        spotify_url: 'https://spotify.com/testartist',
        soundcloud_url: 'https://soundcloud.com/testartist',
        instagram_url: 'https://instagram.com/testartist',
        twitter_url: 'https://twitter.com/testartist'
      };
      
      const createResult = createArtistProfile(profileData);
      expect(createResult.lastInsertRowid).toBeGreaterThan(0);

      // READ: Get artist profile
      const profile = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?').get(userId);
      expect(profile).toBeTruthy();
      expect(profile.artist_name).toBe('Test Artist');
      expect(profile.genre).toBe('Electronic');

      // UPDATE: Artist profile
      const updateData = {
        artist_name: 'Updated Artist Name',
        bio: 'Updated bio',
        genre: 'Hip Hop',
        location: 'Los Angeles, CA',
        website: 'https://updatedartist.com',
        spotify_url: 'https://spotify.com/updatedartist',
        soundcloud_url: 'https://soundcloud.com/updatedartist',
        instagram_url: 'https://instagram.com/updatedartist',
        twitter_url: 'https://twitter.com/updatedartist'
      };
      
      const updateResult = updateArtistProfile(userId, updateData);
      expect(updateResult.changes).toBe(1);

      // Verify update
      const updatedProfile = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?').get(userId);
      expect(updatedProfile.artist_name).toBe('Updated Artist Name');
      expect(updatedProfile.genre).toBe('Hip Hop');

      // DELETE: Artist profile
      const deleteResult = deleteArtistProfile(userId);
      expect(deleteResult.changes).toBe(1);

      // Verify deletion
      const deletedProfile = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?').get(userId);
      expect(deletedProfile).toBeFalsy();
    });
  });

  describe('✅ CORE: Fan Profile CRUD Operations', () => {
    test('should create, read, update, and delete fan profile', () => {
      // Create user
      const userData = {
        email: 'fan@test.com',
        password_hash: 'hashedpassword',
        username: 'testfan',
        first_name: 'Test',
        last_name: 'Fan',
        profile_type: 'fan'
      };
      const userResult = createUser(userData);
      const userId = userResult.lastInsertRowid;

      // CREATE: Fan profile
      const profileData = {
        user_id: userId,
        display_name: 'Test Fan',
        favorite_genres: 'Electronic, Hip Hop',
        location: 'Detroit, MI',
        bio: 'Music enthusiast'
      };
      
      const createResult = createFanProfile(profileData);
      expect(createResult.lastInsertRowid).toBeGreaterThan(0);

      // READ: Get fan profile
      const profile = db.prepare('SELECT * FROM fan_profiles WHERE user_id = ?').get(userId);
      expect(profile).toBeTruthy();
      expect(profile.display_name).toBe('Test Fan');

      // UPDATE: Fan profile
      const updateData = {
        display_name: 'Updated Fan Name',
        favorite_genres: 'Jazz, Classical',
        location: 'New York, NY',
        bio: 'Updated bio'
      };
      
      const updateResult = updateFanProfile(userId, updateData);
      expect(updateResult.changes).toBe(1);

      // DELETE: Fan profile
      const deleteResult = deleteFanProfile(userId);
      expect(deleteResult.changes).toBe(1);
    });
  });

  describe('✅ CORE: Licensor Profile CRUD Operations', () => {
    test('should create, read, update, and delete licensor profile', () => {
      // Create user
      const userData = {
        email: 'licensor@test.com',
        password_hash: 'hashedpassword',
        username: 'testlicensor',
        first_name: 'Test',
        last_name: 'Licensor',
        profile_type: 'licensor'
      };
      const userResult = createUser(userData);
      const userId = userResult.lastInsertRowid;

      // CREATE: Licensor profile
      const profileData = {
        user_id: userId,
        company_name: 'Test Licensing Co',
        contact_person: 'John Doe',
        industry_focus: 'Film & TV',
        website: 'https://testlicensing.com',
        phone: '555-1234',
        address: '123 Music St, Detroit, MI'
      };
      
      const createResult = createLicensorProfile(profileData);
      expect(createResult.lastInsertRowid).toBeGreaterThan(0);

      // READ: Get licensor profile
      const profile = db.prepare('SELECT * FROM licensor_profiles WHERE user_id = ?').get(userId);
      expect(profile).toBeTruthy();
      expect(profile.company_name).toBe('Test Licensing Co');

      // UPDATE: Licensor profile
      const updateData = {
        company_name: 'Updated Licensing Co',
        contact_person: 'Jane Smith',
        industry_focus: 'Advertising',
        website: 'https://updatedlicensing.com',
        phone: '555-5678',
        address: '456 Updated St, LA, CA'
      };
      
      const updateResult = updateLicensorProfile(userId, updateData);
      expect(updateResult.changes).toBe(1);

      // DELETE: Licensor profile
      const deleteResult = deleteLicensorProfile(userId);
      expect(deleteResult.changes).toBe(1);
    });
  });

  describe('✅ CORE: Service Provider Profile CRUD Operations', () => {
    test('should create, read, update, and delete service provider profile', () => {
      // Create user
      const userData = {
        email: 'provider@test.com',
        password_hash: 'hashedpassword',
        username: 'testprovider',
        first_name: 'Test',
        last_name: 'Provider',
        profile_type: 'service_provider'
      };
      const userResult = createUser(userData);
      const userId = userResult.lastInsertRowid;

      // CREATE: Service provider profile
      const profileData = {
        user_id: userId,
        company_name: 'Test Audio Services',
        service_type: 'Mixing & Mastering',
        description: 'Professional audio services',
        website: 'https://testaudio.com',
        contact_email: 'contact@testaudio.com',
        phone: '555-9999',
        pricing_info: '$100/hour'
      };
      
      const createResult = createServiceProviderProfile(profileData);
      expect(createResult.lastInsertRowid).toBeGreaterThan(0);

      // READ: Get service provider profile
      const profile = db.prepare('SELECT * FROM service_provider_profiles WHERE user_id = ?').get(userId);
      expect(profile).toBeTruthy();
      expect(profile.company_name).toBe('Test Audio Services');
      expect(profile.service_type).toBe('Mixing & Mastering');

      // UPDATE: Service provider profile
      const updateData = {
        company_name: 'Updated Audio Services',
        service_type: 'Production & Mixing',
        description: 'Updated description',
        website: 'https://updatedaudio.com',
        contact_email: 'new@updatedaudio.com',
        phone: '555-0000',
        pricing_info: '$150/hour'
      };
      
      const updateResult = updateServiceProviderProfile(userId, updateData);
      expect(updateResult.changes).toBe(1);

      // DELETE: Service provider profile
      const deleteResult = deleteServiceProviderProfile(userId);
      expect(deleteResult.changes).toBe(1);
    });
  });

  describe('✅ CORE: Profile Management Functions', () => {
    test('should get user with profile data based on profile type', () => {
      // Create artist user and profile
      const userData = {
        email: 'artist@test.com',
        password_hash: 'hashedpassword',
        username: 'testartist',
        first_name: 'Test',
        last_name: 'Artist',
        profile_type: 'artist'
      };
      const userResult = createUser(userData);
      const userId = userResult.lastInsertRowid;

      const profileData = {
        user_id: userId,
        artist_name: 'Test Artist',
        bio: 'A test artist',
        genre: 'Electronic'
      };
      createArtistProfile(profileData);

      // Test getUserWithProfile
      const userWithProfile = getUserWithProfile(userId);
      expect(userWithProfile).toBeTruthy();
      expect(userWithProfile.email).toBe('artist@test.com');
      expect(userWithProfile.profile_type).toBe('artist');
      expect(userWithProfile.profile).toBeTruthy();
      expect(userWithProfile.profile.artist_name).toBe('Test Artist');
    });

    test('should update user profile type', () => {
      // Create user
      const userData = {
        email: 'user@test.com',
        password_hash: 'hashedpassword',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        profile_type: 'fan'
      };
      const userResult = createUser(userData);
      const userId = userResult.lastInsertRowid;

      // Update profile type
      const updateResult = updateUserProfileType(userId, 'artist');
      expect(updateResult.changes).toBe(1);

      // Verify update
      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      expect(updatedUser.profile_type).toBe('artist');
    });
  });

  describe('✅ CORE: Profile Search Functions', () => {
    beforeEach(() => {
      // Create test data for search tests
      const artists = [
        { email: 'rock@test.com', username: 'rockartist', profile_type: 'artist', artist_name: 'Rock Star', genre: 'Rock' },
        { email: 'jazz@test.com', username: 'jazzmusician', profile_type: 'artist', artist_name: 'Jazz Master', genre: 'Jazz' },
        { email: 'electronic@test.com', username: 'djpro', profile_type: 'artist', artist_name: 'DJ Pro', genre: 'Electronic' }
      ];

      artists.forEach(artistData => {
        const userData = {
          email: artistData.email,
          password_hash: 'hashedpassword',
          username: artistData.username,
          first_name: 'Test',
          last_name: 'Artist',
          profile_type: artistData.profile_type
        };
        const userResult = createUser(userData);
        
        const profileData = {
          user_id: userResult.lastInsertRowid,
          artist_name: artistData.artist_name,
          genre: artistData.genre
        };
        createArtistProfile(profileData);
      });
    });

    test('should search artist profiles by term', () => {
      const results = searchArtistProfiles('Rock');
      expect(results).toHaveLength(1);
      expect(results[0].artist_name).toBe('Rock Star');
      expect(results[0].genre).toBe('Rock');
    });

    test('should get profiles by type', () => {
      const artists = getProfilesByType('artist', 10);
      expect(artists).toHaveLength(3);
      expect(artists.every(a => a.artist_name)).toBe(true);
    });
  });

  describe('✅ CORE: Profile Validation Functions', () => {
    test('should validate artist profile data', () => {
      const validData = { artist_name: 'Valid Artist' };
      const invalidData = { artist_name: '' };
      
      expect(validateProfileData('artist', validData)).toHaveLength(0);
      expect(validateProfileData('artist', invalidData)).toHaveLength(1);
      expect(validateProfileData('artist', invalidData)[0]).toBe('Artist name is required');
    });

    test('should validate fan profile data', () => {
      const validData = { display_name: 'Valid Fan' };
      const invalidData = { display_name: '' };
      
      expect(validateProfileData('fan', validData)).toHaveLength(0);
      expect(validateProfileData('fan', invalidData)).toHaveLength(1);
    });

    test('should validate licensor profile data', () => {
      const validData = { company_name: 'Valid Company' };
      const invalidData = { company_name: '' };
      
      expect(validateProfileData('licensor', validData)).toHaveLength(0);
      expect(validateProfileData('licensor', invalidData)).toHaveLength(1);
    });

    test('should validate service provider profile data', () => {
      const validData = { company_name: 'Valid Company', service_type: 'Valid Service' };
      const invalidData1 = { company_name: '', service_type: 'Valid Service' };
      const invalidData2 = { company_name: 'Valid Company', service_type: '' };
      
      expect(validateProfileData('service_provider', validData)).toHaveLength(0);
      expect(validateProfileData('service_provider', invalidData1)).toHaveLength(1);
      expect(validateProfileData('service_provider', invalidData2)).toHaveLength(1);
    });
  });

  describe('✅ CORE: Foreign Key Relationships', () => {
    test('should maintain foreign key constraints on user deletion', () => {
      // Create user and profile
      const userData = {
        email: 'test@test.com',
        password_hash: 'hashedpassword',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        profile_type: 'artist'
      };
      const userResult = createUser(userData);
      const userId = userResult.lastInsertRowid;

      const profileData = {
        user_id: userId,
        artist_name: 'Test Artist'
      };
      createArtistProfile(profileData);

      // Verify profile exists
      let profile = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?').get(userId);
      expect(profile).toBeTruthy();

      // Delete user (should cascade to profile)
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      // Verify profile was deleted due to CASCADE
      profile = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?').get(userId);
      expect(profile).toBeFalsy();
    });
  });
});
