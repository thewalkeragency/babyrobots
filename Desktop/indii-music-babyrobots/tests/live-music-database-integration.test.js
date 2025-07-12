const { db } = require('../lib/db');

describe('Live Music & Content Management Database Integration Tests', () => {
  beforeAll(async () => {
    // Initialize the actual database
    console.log('🚀 Connected to live database for integration testing');
  });

  afterAll(() => {
    if (db) {
      db.close();
      console.log('🔌 Database connection closed');
    }
  });

  describe('End-to-End Music Content Workflow', () => {
    let testUserId, testArtistId, testTrackId, testWorkspaceId, testSplitSheetId;

    test('Should create complete music workflow: User → Artist → Track → Workspace → Split Sheet', async () => {
      // Step 1: Create a test user
      const userStmt = db.prepare(`
        INSERT INTO users (email, password_hash, profile_type) 
        VALUES (?, ?, ?)
      `);
      const userResult = userStmt.run('test-integration@example.com', 'hashedpassword', 'artist');
      testUserId = userResult.lastInsertRowid;
      expect(testUserId).toBeDefined();
      console.log('✅ User created with ID:', testUserId);

      // Step 2: Create artist profile
      const artistStmt = db.prepare(`
        INSERT INTO artist_profiles (user_id, artist_name, bio) 
        VALUES (?, ?, ?)
      `);
      const artistResult = artistStmt.run(testUserId, 'Test Artist', 'Test bio for integration');
      testArtistId = artistResult.lastInsertRowid;
      expect(testArtistId).toBeDefined();
      console.log('✅ Artist profile created with ID:', testArtistId);

      // Step 3: Create a track
      const trackStmt = db.prepare(`
        INSERT INTO tracks (artist_id, title, genre, bpm, key_signature, duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const trackResult = trackStmt.run(testUserId, 'Integration Test Song', 'Electronic', 128, 'Am', 240);
      testTrackId = trackResult.lastInsertRowid;
      expect(testTrackId).toBeDefined();
      console.log('✅ Track created with ID:', testTrackId);

      // Step 4: Create project workspace
      const workspaceStmt = db.prepare(`
        INSERT INTO project_workspaces (user_id, name, description)
        VALUES (?, ?, ?)
      `);
      const workspaceResult = workspaceStmt.run(testUserId, 'Integration Test Project', 'Testing workspace creation');
      testWorkspaceId = workspaceResult.lastInsertRowid;
      expect(testWorkspaceId).toBeDefined();
      console.log('✅ Workspace created with ID:', testWorkspaceId);

      // Step 5: Create split sheet
      const splitSheetStmt = db.prepare(`
        INSERT INTO split_sheets (track_id, description)
        VALUES (?, ?)
      `);
      const splitSheetResult = splitSheetStmt.run(testTrackId, 'Integration test split sheet');
      testSplitSheetId = splitSheetResult.lastInsertRowid;
      expect(testSplitSheetId).toBeDefined();
      console.log('✅ Split sheet created with ID:', testSplitSheetId);

      // Step 6: Add contributors to split sheet
      const contributorStmt = db.prepare(`
        INSERT INTO split_sheet_contributors (split_sheet_id, name, role, percentage)
        VALUES (?, ?, ?, ?)
      `);
      contributorStmt.run(testSplitSheetId, 'Test Artist', 'songwriter', 50.0);
      contributorStmt.run(testSplitSheetId, 'Test Artist', 'producer', 50.0);
      console.log('✅ Split sheet contributors added');

      console.log('🎉 Complete workflow created successfully!');
    });

    test('Should verify foreign key relationships work correctly', async () => {
      // Verify track is connected to artist (track.artist_id references users.id directly)
      const trackCheck = db.prepare('SELECT * FROM tracks WHERE id = ?').get(testTrackId);
      expect(trackCheck.artist_id).toBe(testUserId);

      // Verify split sheet is connected to track (no workspace_id in split_sheets table)
      const splitSheetCheck = db.prepare('SELECT * FROM split_sheets WHERE id = ?').get(testSplitSheetId);
      expect(splitSheetCheck.track_id).toBe(testTrackId);

      // Verify contributors are connected to split sheet
      const contributors = db.prepare('SELECT * FROM split_sheet_contributors WHERE split_sheet_id = ?').all(testSplitSheetId);
      expect(contributors).toHaveLength(2);
      expect(contributors[0].name).toBe('Test Artist');

      console.log('✅ All foreign key relationships verified');
    });

    test('Should verify cascade delete operations work', async () => {
      // Create additional test data
      const testWorkspace2Stmt = db.prepare(`
        INSERT INTO project_workspaces (user_id, name, description)
        VALUES (?, ?, ?)
      `);
      const workspace2Result = testWorkspace2Stmt.run(testUserId, 'Delete Test Workspace', 'For cascade testing');
      const testWorkspace2Id = workspace2Result.lastInsertRowid;

      // Add files to workspace
      const fileStmt = db.prepare(`
        INSERT INTO workspace_files (workspace_id, filename, file_path)
        VALUES (?, ?, ?)
      `);
      fileStmt.run(testWorkspace2Id, 'test.mp3', '/uploads/test.mp3');

      // Add tasks to workspace
      const taskStmt = db.prepare(`
        INSERT INTO workspace_tasks (workspace_id, title, description, is_completed)
        VALUES (?, ?, ?, ?)
      `);
      taskStmt.run(testWorkspace2Id, 'Test Task', 'For cascade testing', 0);

      // Delete workspace - should cascade to files and tasks
      const deleteWorkspaceStmt = db.prepare('DELETE FROM project_workspaces WHERE id = ?');
      deleteWorkspaceStmt.run(testWorkspace2Id);

      // Verify cascade deletes worked
      const remainingFiles = db.prepare('SELECT * FROM workspace_files WHERE workspace_id = ?').all(testWorkspace2Id);
      const remainingTasks = db.prepare('SELECT * FROM workspace_tasks WHERE workspace_id = ?').all(testWorkspace2Id);

      expect(remainingFiles).toHaveLength(0);
      expect(remainingTasks).toHaveLength(0);

      console.log('✅ Cascade delete operations verified');
    });

    test('Should handle complex queries across multiple tables', async () => {
      // Complex query: Get all tracks with their artist info and split sheet data
      const complexQuery = db.prepare(`
        SELECT 
          t.id as track_id,
          t.title as track_title,
          t.genre,
          t.bpm,
          ap.artist_name,
          ss.description as split_description,
          COUNT(ssc.id) as contributor_count
        FROM tracks t
        JOIN artist_profiles ap ON t.artist_id = ap.user_id
        LEFT JOIN split_sheets ss ON t.id = ss.track_id
        LEFT JOIN split_sheet_contributors ssc ON ss.id = ssc.split_sheet_id
        WHERE t.id = ?
        GROUP BY t.id, ap.id, ss.id
      `);

      const result = complexQuery.get(testTrackId);
      
      expect(result).toBeDefined();
      expect(result.track_title).toBe('Integration Test Song');
      expect(result.artist_name).toBe('Test Artist');
      expect(result.split_description).toBe('Integration test split sheet');
      expect(result.contributor_count).toBe(2);

      console.log('✅ Complex multi-table query verified:', result);
    });

    test('Should verify data integrity constraints', async () => {
      // Test that we can't create tracks without valid artist_id
      const invalidTrackStmt = db.prepare(`
        INSERT INTO tracks (artist_id, title)
        VALUES (?, ?)
      `);

      expect(() => {
        invalidTrackStmt.run(99999, 'Invalid Track');
      }).toThrow();

      // Test that we can't create split sheet contributors without valid split_sheet_id
      const invalidContributorStmt = db.prepare(`
        INSERT INTO split_sheet_contributors (split_sheet_id, name, role, percentage)
        VALUES (?, ?, ?, ?)
      `);

      expect(() => {
        invalidContributorStmt.run(99999, 'Test Name', 'songwriter', 50.0);
      }).toThrow();

      console.log('✅ Data integrity constraints verified');
    });

    // Cleanup
    test('Should cleanup test data', async () => {
      // Delete in correct order to respect foreign keys
      db.prepare('DELETE FROM split_sheet_contributors WHERE split_sheet_id = ?').run(testSplitSheetId);
      db.prepare('DELETE FROM split_sheets WHERE id = ?').run(testSplitSheetId);
      db.prepare('DELETE FROM workspace_files WHERE workspace_id = ?').run(testWorkspaceId);
      db.prepare('DELETE FROM workspace_tasks WHERE workspace_id = ?').run(testWorkspaceId);
      db.prepare('DELETE FROM project_workspaces WHERE id = ?').run(testWorkspaceId);
      db.prepare('DELETE FROM tracks WHERE id = ?').run(testTrackId);
      db.prepare('DELETE FROM artist_profiles WHERE id = ?').run(testArtistId);
      db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);

      console.log('✅ Test data cleaned up');
    });
  });

  describe('Database Helper Functions Integration', () => {
    test('Should verify all helper functions are available', () => {
      const { 
        createUser,
        getUserById,
        getUserByEmail,
        createArtistProfile,
        getArtistProfile,
        createFanProfile,
        getFanProfile,
        createLicensorProfile,
        getLicensorProfile,
        createServiceProviderProfile,
        getServiceProviderProfile,
        createTrack,
        getTrackById,
        getTracksByArtist,
        createSplitSheet,
        getSplitSheetsByTrack,
        createSplitSheetContributor,
        getContributorsBySplitSheet,
        createProjectWorkspace,
        getWorkspaceById,
        getWorkspacesByUser,
        createWorkspaceFile,
        getFilesByWorkspace,
        createWorkspaceTask,
        getTasksByWorkspace,
        updateTaskCompletion
      } = require('../lib/db');

      // Verify core functions exist
      expect(typeof createUser).toBe('function');
      expect(typeof getUserById).toBe('function');
      expect(typeof getUserByEmail).toBe('function');
      
      // Artist profile functions
      expect(typeof createArtistProfile).toBe('function');
      expect(typeof getArtistProfile).toBe('function');
      
      // Fan profile functions
      expect(typeof createFanProfile).toBe('function');
      expect(typeof getFanProfile).toBe('function');
      
      // Track functions
      expect(typeof createTrack).toBe('function');
      expect(typeof getTrackById).toBe('function');
      expect(typeof getTracksByArtist).toBe('function');
      
      // Split sheet functions
      expect(typeof createSplitSheet).toBe('function');
      expect(typeof getSplitSheetsByTrack).toBe('function');
      expect(typeof createSplitSheetContributor).toBe('function');
      expect(typeof getContributorsBySplitSheet).toBe('function');
      
      // Workspace functions
      expect(typeof createProjectWorkspace).toBe('function');
      expect(typeof getWorkspaceById).toBe('function');
      expect(typeof getWorkspacesByUser).toBe('function');
      expect(typeof createWorkspaceFile).toBe('function');
      expect(typeof getFilesByWorkspace).toBe('function');
      expect(typeof createWorkspaceTask).toBe('function');
      expect(typeof getTasksByWorkspace).toBe('function');
      expect(typeof updateTaskCompletion).toBe('function');

      console.log('✅ All helper functions verified and available');
    });
  });

  describe('Performance and Stress Testing', () => {
    test('Should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      // Create a test user for bulk operations
      const userStmt = db.prepare(`
        INSERT INTO users (email, password_hash, profile_type) 
        VALUES (?, ?, ?)
      `);
      const userResult = userStmt.run('bulk-test@example.com', 'hashedpassword', 'artist');
      const bulkTestUserId = userResult.lastInsertRowid;

      // Create artist profile
      const artistStmt = db.prepare(`
        INSERT INTO artist_profiles (user_id, artist_name) 
        VALUES (?, ?)
      `);
      const artistResult = artistStmt.run(bulkTestUserId, 'Bulk Test Artist');
      const bulkTestArtistId = artistResult.lastInsertRowid;

      // Bulk create tracks
      const trackStmt = db.prepare(`
        INSERT INTO tracks (artist_id, title, genre, bpm)
        VALUES (?, ?, ?, ?)
      `);

      const trackIds = [];
      for (let i = 1; i <= 50; i++) {
        const result = trackStmt.run(
          bulkTestUserId, 
          `Bulk Track ${i}`, 
          'Electronic', 
          120 + (i % 40)
        );
        trackIds.push(result.lastInsertRowid);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(trackIds).toHaveLength(50);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      console.log(`✅ Bulk operations completed in ${duration}ms`);

      // Cleanup bulk test data
      trackIds.forEach(id => {
        db.prepare('DELETE FROM tracks WHERE id = ?').run(id);
      });
      db.prepare('DELETE FROM artist_profiles WHERE id = ?').run(bulkTestArtistId);
      db.prepare('DELETE FROM users WHERE id = ?').run(bulkTestUserId);
    });
  });
});
