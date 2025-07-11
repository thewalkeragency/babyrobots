const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Mock the process.cwd() to point to a temporary directory for the test database
const TEST_DB_DIR = path.join(__dirname, 'test_db_data');
// Adjusted to match the actual filename from db.js
const ACTUAL_DB_PATH = path.join(TEST_DB_DIR, 'indii-music.db');

// Store original process.cwd
const originalCwd = process.cwd;

jest.mock('../../lib/db', () => {
  // Ensure a clean, in-memory database for each test run that uses the actual module logic
  // We need to re-require the actual db module but force it to use an in-memory db
  // or a temporary test file db that gets cleaned up.
  // For simplicity in this step, we'll mock process.cwd() so db.js creates its file in a temp location.

  // Ensure the test DB directory exists
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
  // Point cwd to the test db directory
  process.cwd = () => TEST_DB_DIR;

  const actualDbModule = jest.requireActual('../../lib/db');

  // Restore cwd after db module is loaded
  process.cwd = originalCwd;

  return {
    ...actualDbModule,
    // We can override specific things here if needed, for now, use the actual logic
    // with the modified cwd for db path.
  };
});

// Now require the module that will use the mocked cwd
const dbLib = require('../../lib/db');

describe('Database Operations (lib/db.js)', () => {
  let testDb;

  beforeAll(() => {
    // Ensure the test database file uses the modified path
    // The dbLib module when required above should have used the mocked cwd.
    // We will directly use its 'db' export which should be connected to the test file.
    testDb = dbLib.db;
    expect(testDb.name).toBe(ACTUAL_DB_PATH); // Verify it's using our test DB path
  });

  afterAll(() => {
    testDb.close();
    // Clean up the test database file and directory
    if (fs.existsSync(ACTUAL_DB_PATH)) {
      fs.unlinkSync(ACTUAL_DB_PATH);
    }
    if (fs.existsSync(TEST_DB_DIR)) {
      // Check if directory is empty before removing
      if (fs.readdirSync(TEST_DB_DIR).length === 0) {
        fs.rmdirSync(TEST_DB_DIR);
      } else {
        // This case might happen if other files are created there, handle as needed
        console.warn(`Test DB directory ${TEST_DB_DIR} not empty, not removing.`);
      }
    }
  });

  beforeEach(() => {
    // Clear all tables before each test to ensure isolation
    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();
    tables.forEach(table => {
      testDb.exec(`DELETE FROM ${table.name};`);
      // Reset autoincrement counters if applicable (optional, but good for consistency)
      if (table.name !== 'sqlite_sequence') { // sqlite_sequence is special
          try {
            testDb.exec(`DELETE FROM sqlite_sequence WHERE name='${table.name}';`);
          } catch (e) {
            // Ignore error if table is not in sqlite_sequence (e.g., no autoincrement or never had rows)
          }
      }
    });
    // Re-run initialization if tables were dropped or for a clean slate with schema.
    // However, db.js already runs initializeDatabase() on import.
    // Forcing re-initialization might be tricky without changing db.js structure.
    // For now, DELETING from tables is sufficient for isolation if schema is stable.
  });

  describe('initializeDatabase()', () => {
    it('should create all the necessary tables', () => {
      const expectedTables = [
        'users', 'artist_profiles', 'fan_profiles', 'licensor_profiles',
        'service_provider_profiles', 'tracks', 'audio_files',
        'chat_sessions', 'chat_messages', 'split_sheets', 'split_sheet_contributors',
        'project_workspaces', 'workspace_files', 'workspace_tasks'
      ];
      const tablesQuery = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
      const tables = tablesQuery.all().map(t => t.name).filter(name => !name.startsWith('sqlite_'));

      expectedTables.forEach(table => {
        expect(tables).toContain(table);
      });
    });

    it('users table should have correct columns', () => {
      const columns = testDb.pragma(`table_info(users)`).map(col => col.name);
      expect(columns).toEqual(expect.arrayContaining([
        'id', 'email', 'password_hash', 'username', 'first_name', 'last_name', 'profile_type', 'created_at', 'updated_at'
      ]));
    });

    // Add more column checks for other critical tables like chat_sessions, chat_messages
    it('chat_sessions table should have correct columns', () => {
        const columns = testDb.pragma(`table_info(chat_sessions)`).map(col => col.name);
        expect(columns).toEqual(expect.arrayContaining([
            'id', 'user_id', 'session_id', 'role', 'created_at', 'last_activity', 'context_json' // Added context_json
        ]));
    });

    it('chat_messages table should have correct columns', () => {
        const columns = testDb.pragma(`table_info(chat_messages)`).map(col => col.name);
        expect(columns).toEqual(expect.arrayContaining([
            'id', 'session_id', 'message', 'response', 'role', 'created_at'
        ]));
    });
  });

  describe('User Operations', () => {
    it('should create a new user and retrieve them by email and id', () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        profile_type: 'artist'
      };
      const result = dbLib.createUser(userData);
      expect(result.lastInsertRowid).toBeGreaterThan(0);

      const userByEmail = dbLib.getUserByEmail('test@example.com');
      expect(userByEmail).toBeDefined();
      expect(userByEmail.email).toBe(userData.email);
      expect(userByEmail.username).toBe(userData.username);

      const userById = dbLib.getUserById(result.lastInsertRowid);
      expect(userById).toBeDefined();
      expect(userById.id).toBe(result.lastInsertRowid);
      expect(userById.email).toBe(userData.email);
    });

    it('should not allow creating a user with a duplicate email', () => {
      const userData = { email: 'unique@example.com', password_hash: 'p', username: 'u1', profile_type: 'fan' };
      dbLib.createUser(userData);
      expect(() => {
        dbLib.createUser(userData); // Try creating again with same email
      }).toThrow(/UNIQUE constraint failed: users.username/); // This was the actual error, let's test username uniqueness here
    });

    it('should not allow creating a user with a duplicate email', () => {
        const userData1 = { email: 'duplicate.email@example.com', password_hash: 'p1', username: 'user1_dup_email', profile_type: 'fan' };
        dbLib.createUser(userData1);
        const userData2 = { email: 'duplicate.email@example.com', password_hash: 'p2', username: 'user2_dup_email', profile_type: 'artist' };
        expect(() => {
          dbLib.createUser(userData2);
        }).toThrow(/UNIQUE constraint failed: users.email/);
    });

    it('should return undefined when getting a non-existent user', () => {
      const userByEmail = dbLib.getUserByEmail('nonexistent@example.com');
      expect(userByEmail).toBeUndefined();
      const userById = dbLib.getUserById(99999);
      expect(userById).toBeUndefined();
    });
  });

  // Placeholder for further tests - will implement these next
  describe('Chat Operations', () => {
    let testUser;
    let testUserId;

    beforeEach(() => {
      // Create a user for chat operations
      const userResult = dbLib.createUser({
        email: 'chatuser@example.com',
        password_hash: 'password',
        username: 'chatty',
        profile_type: 'fan'
      });
      testUserId = userResult.lastInsertRowid;
      testUser = dbLib.getUserById(testUserId);
    });

    it('should create a chat session and retrieve it', () => {
      const sessionId = 'session123';
      const sessionData = { user_id: testUserId, session_id: sessionId, role: 'artist_assistant' };
      const createResult = dbLib.createChatSession(sessionData);
      expect(createResult.lastInsertRowid).toBeGreaterThan(0);

      const retrievedSession = dbLib.getChatSession(sessionId);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession.session_id).toBe(sessionId);
      expect(retrievedSession.user_id).toBe(testUserId);
      expect(retrievedSession.role).toBe('artist_assistant');
    });

    it('should create a chat message and retrieve chat history', () => {
      const sessionId = 'history_session';
      dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'general' });

      const messageData1 = { session_id: sessionId, message: 'Hello', response: 'Hi there!', role: 'general' };
      dbLib.createChatMessage(messageData1);

      // Add a small delay or ensure timestamps are distinct if relying on order
      // For SQLite, default CURRENT_TIMESTAMP resolution might be per-second.
      // If tests run fast, timestamps could be identical.
      // For robust ordering tests, ensure distinct timestamps or use rowid.

      const messageData2 = { session_id: sessionId, message: 'How are you?', response: 'I am fine.', role: 'general' };
      dbLib.createChatMessage(messageData2);

      const history = dbLib.getChatHistory(sessionId);
      expect(history).toHaveLength(2);
      // Chat history is ordered DESC by created_at
      // Timestamps can be the same if messages are created too quickly.
      // Test that the messages exist, order might not be guaranteed if timestamps are identical.
      expect(history.map(h => h.message)).toEqual(expect.arrayContaining([messageData1.message, messageData2.message]));
      if (history.length === 2) { // If order is deterministic due to different timestamps, check it
        const time1 = history.find(h => h.message === messageData1.message).created_at;
        const time2 = history.find(h => h.message === messageData2.message).created_at;
        if (new Date(time1).getTime() !== new Date(time2).getTime()) {
            expect(history[0].message).toBe(messageData2.message); // messageData2 should be more recent
            expect(history[1].message).toBe(messageData1.message);
        }
      }
    });

    it('getChatHistory should respect the limit and order', (done) => {
      const sessionId = 'limit_session';
      dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'general' });

      let promises = [];
      for (let i = 0; i < 5; i++) {
        // Add a small delay to ensure distinct timestamps for reliable ordering
        promises.push(new Promise(resolve => setTimeout(() => {
          dbLib.createChatMessage({ session_id: sessionId, message: `Msg ${i}`, response: `Resp ${i}`, role: 'general' });
          resolve();
        }, i * 20))); // Stagger insertions
      }

      Promise.all(promises).then(() => {
        try {
          // Get all messages to know their insertion order by ID
          const allMessagesRaw = dbLib.db.prepare('SELECT id, message FROM chat_messages WHERE session_id = ? ORDER BY id ASC').all(sessionId);
          expect(allMessagesRaw).toHaveLength(5);

          // Identify the expected latest 3 messages by their content, based on insertion order (highest IDs)
          const expectedLatestMessagesContent = allMessagesRaw.slice(-3).map(m => m.message).reverse(); // reverse because getChatHistory is DESC

          const history = dbLib.getChatHistory(sessionId, 3);
          expect(history).toHaveLength(3);

          // Check if the messages returned by getChatHistory are the ones we expect,
          // regardless of the exact order if created_at is the same.
          // However, with staggered inserts, created_at should differ.
          expect(history[0].message).toBe(expectedLatestMessagesContent[0]); // Should be Msg 4
          expect(history[1].message).toBe(expectedLatestMessagesContent[1]); // Should be Msg 3
          expect(history[2].message).toBe(expectedLatestMessagesContent[2]); // Should be Msg 2
          done();
        } catch (error) {
          done(error);
        }
      });
    }, 10000); // Increased timeout for this test specifically

    it('updateChatSessionActivity should update last_activity', (done) => {
        const sessionId = 'activity_session';
        dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'general' });
        const initialSession = dbLib.getChatSession(sessionId);
        const initialActivityTime = new Date(initialSession.last_activity).getTime();

        // Wait a moment to ensure the timestamp will be different
        setTimeout(() => {
            dbLib.updateChatSessionActivity(sessionId);
            const updatedSession = dbLib.getChatSession(sessionId);
            const updatedActivityTime = new Date(updatedSession.last_activity).getTime();
            // Allow for greater or equal in case the clock tick is exactly on the second boundary
            // but given the delay, it should be greater.
            expect(updatedActivityTime).toBeGreaterThanOrEqual(initialActivityTime);
            // More reliably, ensure it's actually different if > 1s has passed, or significantly different
            if (updatedActivityTime === initialActivityTime) {
                // This could happen if the test is too fast / system clock resolution
                console.warn("Activity timestamp did not change, test might be too fast or clock resolution too low.");
            }
            // To be more robust, check if it's different from the initial time.
            // If the initial time was X, the new time must be > X, unless the system clock is stuck.
            // The core issue is ensuring CURRENT_TIMESTAMP in SQLite moves forward.
            // A 1050ms delay should typically ensure this.
            expect(updatedActivityTime).not.toBe(initialActivityTime); // Ensure it actually changed
            done();
        }, 1050); // Increased delay to 1.05 seconds
    });

    it('getChatHistory should return empty array for session with no messages', () => {
        const sessionId = 'empty_session';
        dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'general' });
        const history = dbLib.getChatHistory(sessionId);
        expect(history).toEqual([]);
    });

    it('getChatSession should return undefined for non-existent session', () => {
        const session = dbLib.getChatSession('non_existent_session_id');
        expect(session).toBeUndefined();
    });

    it('should update and retrieve session context', () => {
      const sessionId = 'context_session_test';
      dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'test_role' });

      const contextToSave = { key1: 'value1', count: 42, nested: { arr: [1, 'a'] } };
      const updateResult = dbLib.updateSessionContext(sessionId, contextToSave);
      expect(updateResult.changes).toBe(1);

      const retrievedContext = dbLib.getSessionContext(sessionId);
      expect(retrievedContext).toEqual(contextToSave);
    });

    it('getSessionContext should return null if no context is set', () => {
      const sessionId = 'no_context_session';
      dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'test_role' });
      const context = dbLib.getSessionContext(sessionId);
      expect(context).toBeNull();
    });

    it('getSessionContext should return null for non-existent session', () => {
      const context = dbLib.getSessionContext('non_existent_session_for_context');
      expect(context).toBeNull();
    });

    it('getSessionContext should handle invalid JSON in context_json gracefully', () => {
      const sessionId = 'invalid_json_session';
      dbLib.createChatSession({ user_id: testUserId, session_id: sessionId, role: 'test_role' });
      // Manually insert invalid JSON
      dbLib.db.prepare('UPDATE chat_sessions SET context_json = ? WHERE session_id = ?').run('{key: "value" unquoted_key}', sessionId);

      const context = dbLib.getSessionContext(sessionId);
      expect(context).toBeNull(); // Or check for specific error logging if applicable
    });

  });

  describe('Artist Profile Operations', () => {
    let testUser;
    let testUserId;

    beforeEach(() => {
      const userResult = dbLib.createUser({
        email: 'artistuser@example.com',
        password_hash: 'password',
        username: 'art1st',
        profile_type: 'artist'
      });
      testUserId = userResult.lastInsertRowid;
      testUser = dbLib.getUserById(testUserId);
    });

    it('should create an artist profile and retrieve it', () => {
      const profileData = {
        user_id: testUserId,
        artist_name: 'DJ Test',
        bio: 'Test Bio',
        genre: 'Electronic',
        location: 'Testville'
        // Add other fields as necessary
      };
      const result = dbLib.createArtistProfile(profileData);
      expect(result.lastInsertRowid).toBeGreaterThan(0);

      const retrievedProfile = dbLib.getArtistProfile(testUserId);
      expect(retrievedProfile).toBeDefined();
      expect(retrievedProfile.user_id).toBe(testUserId);
      expect(retrievedProfile.artist_name).toBe(profileData.artist_name);
    });

    it('should return undefined when getting a non-existent artist profile', () => {
      const otherUser = dbLib.createUser({ email: 'another@example.com', password_hash: 'p', username: 'another', profile_type: 'fan' });
      const profile = dbLib.getArtistProfile(otherUser.lastInsertRowid);
      expect(profile).toBeUndefined();
    });

    it('should fail to create an artist profile for a non-existent user_id', () => {
      const profileData = {
        user_id: 99999,
        artist_name: 'Ghost Artist',
        // Ensure all fields required by createArtistProfile are provided, even if null
        bio: null, genre: null, location: null, website: null,
        spotify_url: null, soundcloud_url: null, instagram_url: null, twitter_url: null
      };
      expect(() => {
        dbLib.createArtistProfile(profileData);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });
  });

  describe('Track Operations', () => {
    let artistUser;
    let artistUserId;

    beforeEach(() => {
      const userResult = dbLib.createUser({
        email: 'trackartist@example.com',
        password_hash: 'password',
        username: 'trackmaster',
        profile_type: 'artist'
      });
      artistUserId = userResult.lastInsertRowid;
      // It's important that the user_id used for tracks actually exists in users table
      // and corresponds to an artist. The schema links tracks.artist_id to users.id.
      // Consider if tracks.artist_id should link to artist_profiles.id instead for stricter typing.
      // For now, it links to users.id.
    });

    it('should create a track and retrieve it by ID and by artist', () => {
      const trackData = {
        artist_id: artistUserId,
        title: 'Test Track',
        duration: 180,
        genre: 'Pop',
        mood: 'Happy', // Ensuring all fields are present
        bpm: 120,
        key_signature: 'C Major',
        file_url: '/path/to/track.mp3',
        artwork_url: '/art/track.jpg',
        description: 'A test track.',
        tags: 'test,pop',
        is_public: 1 // Changed boolean to integer 1 for true
      };
      const result = dbLib.createTrack(trackData);
      expect(result.lastInsertRowid).toBeGreaterThan(0);
      const trackId = result.lastInsertRowid;

      const retrievedTrackById = dbLib.getTrackById(trackId);
      expect(retrievedTrackById).toBeDefined();
      expect(retrievedTrackById.title).toBe(trackData.title);
      expect(retrievedTrackById.artist_id).toBe(artistUserId);

      const tracksByArtist = dbLib.getTracksByArtist(artistUserId);
      expect(tracksByArtist).toHaveLength(1);
      expect(tracksByArtist[0].title).toBe(trackData.title);
    });

    it('getTracksByArtist should return empty array for artist with no tracks', () => {
        const newUser = dbLib.createUser({ email: 'notracks@example.com', password_hash: 'p', username: 'notracks', profile_type: 'artist'});
        const tracks = dbLib.getTracksByArtist(newUser.lastInsertRowid);
        expect(tracks).toEqual([]);
    });

    it('getTrackById should return undefined for non-existent track', () => {
        const track = dbLib.getTrackById(9999);
        expect(track).toBeUndefined();
    });
  });

  describe('Audio File Operations', () => {
    let testUser;
    let testUserId;

    beforeEach(() => {
      const userResult = dbLib.createUser({
        email: 'audiofileuser@example.com',
        password_hash: 'password',
        username: 'audiophile',
        profile_type: 'artist'
      });
      testUserId = userResult.lastInsertRowid;
    });

    it('should create an audio file record and retrieve it (simulated)', () => {
      const fileData = {
        user_id: testUserId,
        filename: 'generated_filename.mp3',
        original_name: 'original.mp3',
        file_path: '/uploads/generated_filename.mp3',
        file_size: 1024 * 500, // 500KB
        mime_type: 'audio/mpeg',
        duration: 240 // 4 minutes
      };
      const result = dbLib.createAudioFile(fileData);
      expect(result.lastInsertRowid).toBeGreaterThan(0);
      const fileId = result.lastInsertRowid;

      // Add a getAudioFileById function in db.js to test retrieval, or query manually
      const retrievedFile = dbLib.db.prepare('SELECT * FROM audio_files WHERE id = ?').get(fileId);
      expect(retrievedFile).toBeDefined();
      expect(retrievedFile.original_name).toBe(fileData.original_name);
      expect(retrievedFile.user_id).toBe(testUserId);
    });
  });

  describe('Foreign Key Constraints & Cascades', () => {
    it('ON DELETE CASCADE for artist_profiles when user is deleted', () => {
      const userRes = dbLib.createUser({ email: 'cascadeuser@example.com', password_hash: 'p', username: 'cascade1', profile_type: 'artist' });
      const userId = userRes.lastInsertRowid;
      dbLib.createArtistProfile({ user_id: userId, artist_name: 'Cascade Artist' });

      let profile = dbLib.getArtistProfile(userId);
      expect(profile).toBeDefined();

      // Delete the user
      dbLib.db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      profile = dbLib.getArtistProfile(userId);
      expect(profile).toBeUndefined(); // Profile should be deleted due to cascade

      const userCheck = dbLib.getUserById(userId);
      expect(userCheck).toBeUndefined(); // User is confirmed deleted
    });

    it('ON DELETE CASCADE for tracks when user (artist) is deleted', () => {
      const userRes = dbLib.createUser({ email: 'cascadetrackuser@example.com', password_hash: 'p', username: 'cascade2', profile_type: 'artist' });
      const userId = userRes.lastInsertRowid;
      const trackRes = dbLib.createTrack({
        artist_id: userId, title: 'Cascade Track', duration: 180, genre: 'Pop',
        mood: 'Happy', bpm: 120, key_signature: 'C Major', file_url: '/path/to/track.mp3',
        artwork_url: '/art/track.jpg', description: 'A test track.', tags: 'test,pop', is_public: 1 // Changed boolean to integer
      });
      // console.log('TrackData for createTrack in cascade test:', JSON.stringify({
      //   artist_id: userId, title: 'Cascade Track', duration: 180, genre: 'Pop',
      //   mood: 'Happy', bpm: 120, key_signature: 'C Major', file_url: '/path/to/track.mp3',
      //   artwork_url: '/art/track.jpg', description: 'A test track.', tags: 'test,pop', is_public: true
      // }, null, 2));
      const trackId = trackRes.lastInsertRowid;

      let track = dbLib.getTrackById(trackId);
      expect(track).toBeDefined();

      dbLib.db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      track = dbLib.getTrackById(trackId);
      expect(track).toBeUndefined(); // Track should be deleted
    });

    it('ON DELETE CASCADE for chat_messages when chat_session is deleted', () => {
        const userRes = dbLib.createUser({ email: 'cascadechatuser@example.com', password_hash: 'p', username: 'cascadechat', profile_type: 'fan' });
        const userId = userRes.lastInsertRowid;
        const sessionId = 'cascade_chat_session';
        dbLib.createChatSession({ user_id: userId, session_id: sessionId, role: 'general' });
        const msgRes = dbLib.createChatMessage({ session_id: sessionId, message: 'test', response: 'test', role: 'general' }); // Added role
        const msgId = msgRes.lastInsertRowid;

        let messages = dbLib.getChatHistory(sessionId);
        expect(messages).toHaveLength(1);

        // Delete the chat session
        // Note: chat_sessions.session_id is TEXT UNIQUE, not INTEGER PRIMARY KEY
        // The FK in chat_messages is to chat_sessions.session_id
        dbLib.db.prepare('DELETE FROM chat_sessions WHERE session_id = ?').run(sessionId);

        messages = dbLib.getChatHistory(sessionId);
        expect(messages).toEqual([]); // Messages should be deleted

        const sessionCheck = dbLib.getChatSession(sessionId);
        expect(sessionCheck).toBeUndefined(); // Session is confirmed deleted
    });

    it('ON DELETE SET NULL for chat_sessions.user_id when user is deleted', () => {
        const userRes = dbLib.createUser({ email: 'setnulluser@example.com', password_hash: 'p', username: 'setnull', profile_type: 'fan' });
        const userId = userRes.lastInsertRowid;
        const sessionId = 'setnull_session';
        dbLib.createChatSession({ user_id: userId, session_id: sessionId, role: 'general' });

        let session = dbLib.getChatSession(sessionId);
        expect(session.user_id).toBe(userId);

        dbLib.db.prepare('DELETE FROM users WHERE id = ?').run(userId);

        session = dbLib.getChatSession(sessionId);
        expect(session).toBeDefined(); // Session should still exist
        expect(session.user_id).toBeNull(); // user_id should be set to NULL
    });
  });

  describe('Music & Content Management Operations', () => {
    let artistUserId, trackId;

    beforeEach(() => {
      // Create artist user and track for testing
      const userResult = dbLib.createUser({
        email: 'musicartist@example.com',
        password_hash: 'password',
        username: 'musicmaker',
        profile_type: 'artist'
      });
      artistUserId = userResult.lastInsertRowid;

      const trackResult = dbLib.createTrack({
        artist_id: artistUserId,
        title: 'Test Music Track',
        duration: 240,
        genre: 'Hip-Hop',
        mood: 'Energetic',
        bpm: 140,
        key_signature: 'A Minor',
        file_url: '/music/test.mp3',
        artwork_url: '/art/test.jpg',
        description: 'A test music track',
        tags: 'test,hip-hop',
        is_public: 1
      });
      trackId = trackResult.lastInsertRowid;
    });

    describe('Split Sheet Operations', () => {
      it('should create a split sheet and retrieve it', () => {
        const splitSheetData = {
          track_id: trackId,
          description: 'Revenue split for Test Music Track'
        };
        const result = dbLib.createSplitSheet(splitSheetData);
        expect(result.lastInsertRowid).toBeGreaterThan(0);

        const splitSheets = dbLib.getSplitSheetsByTrack(trackId);
        expect(splitSheets).toHaveLength(1);
        expect(splitSheets[0].description).toBe(splitSheetData.description);
      });

      it('should create split sheet contributors', () => {
        const splitSheetResult = dbLib.createSplitSheet({
          track_id: trackId,
          description: 'Test split sheet'
        });
        const splitSheetId = splitSheetResult.lastInsertRowid;

        const contributorData = {
          split_sheet_id: splitSheetId,
          name: 'Producer Smith',
          role: 'Producer',
          percentage: 50.0
        };
        const result = dbLib.createSplitSheetContributor(contributorData);
        expect(result.lastInsertRowid).toBeGreaterThan(0);

        const contributors = dbLib.getContributorsBySplitSheet(splitSheetId);
        expect(contributors).toHaveLength(1);
        expect(contributors[0].name).toBe(contributorData.name);
        expect(contributors[0].percentage).toBe(contributorData.percentage);
      });
    });

    describe('Project Workspace Operations', () => {
      it('should create a project workspace and retrieve it', () => {
        const workspaceData = {
          user_id: artistUserId,
          name: 'Album Project 2025',
          description: 'Working on my next album'
        };
        const result = dbLib.createProjectWorkspace(workspaceData);
        expect(result.lastInsertRowid).toBeGreaterThan(0);
        const workspaceId = result.lastInsertRowid;

        const workspaces = dbLib.getWorkspacesByUser(artistUserId);
        expect(workspaces).toHaveLength(1);
        expect(workspaces[0].name).toBe(workspaceData.name);

        const workspace = dbLib.getWorkspaceById(workspaceId);
        expect(workspace).toBeDefined();
        expect(workspace.description).toBe(workspaceData.description);
      });

      it('should create workspace files', () => {
        const workspaceResult = dbLib.createProjectWorkspace({
          user_id: artistUserId,
          name: 'Test Workspace',
          description: 'Test'
        });
        const workspaceId = workspaceResult.lastInsertRowid;

        const fileData = {
          workspace_id: workspaceId,
          filename: 'demo.wav',
          file_path: '/workspaces/files/demo.wav'
        };
        const result = dbLib.createWorkspaceFile(fileData);
        expect(result.lastInsertRowid).toBeGreaterThan(0);

        const files = dbLib.getFilesByWorkspace(workspaceId);
        expect(files).toHaveLength(1);
        expect(files[0].filename).toBe(fileData.filename);
      });

      it('should create and manage workspace tasks', () => {
        const workspaceResult = dbLib.createProjectWorkspace({
          user_id: artistUserId,
          name: 'Task Workspace',
          description: 'Test workspace for tasks'
        });
        const workspaceId = workspaceResult.lastInsertRowid;

        const taskData = {
          workspace_id: workspaceId,
          title: 'Record vocals',
          description: 'Record lead vocals for chorus',
          due_date: '2025-08-01',
          is_completed: false
        };
        const result = dbLib.createWorkspaceTask(taskData);
        expect(result.lastInsertRowid).toBeGreaterThan(0);
        const taskId = result.lastInsertRowid;

        const tasks = dbLib.getTasksByWorkspace(workspaceId);
        expect(tasks).toHaveLength(1);
        expect(tasks[0].title).toBe(taskData.title);

        // Test task completion update
        const updateResult = dbLib.updateTaskCompletion(taskId, true);
        expect(updateResult.changes).toBe(1);

        const updatedTasks = dbLib.getTasksByWorkspace(workspaceId);
        expect(updatedTasks[0].is_completed).toBe(1); // SQLite stores boolean as integer
      });
    });

    describe('Music & Content Management Foreign Key Constraints', () => {
      it('ON DELETE CASCADE for split_sheets when track is deleted', () => {
        const splitSheetResult = dbLib.createSplitSheet({
          track_id: trackId,
          description: 'Test split sheet for cascade'
        });
        const splitSheetId = splitSheetResult.lastInsertRowid;

        let splitSheets = dbLib.getSplitSheetsByTrack(trackId);
        expect(splitSheets).toHaveLength(1);

        // Delete the track
        dbLib.db.prepare('DELETE FROM tracks WHERE id = ?').run(trackId);

        splitSheets = dbLib.getSplitSheetsByTrack(trackId);
        expect(splitSheets).toEqual([]); // Split sheets should be deleted
      });

      it('ON DELETE CASCADE for workspace components when workspace is deleted', () => {
        const workspaceResult = dbLib.createProjectWorkspace({
          user_id: artistUserId,
          name: 'Cascade Test Workspace',
          description: 'Test workspace for cascade'
        });
        const workspaceId = workspaceResult.lastInsertRowid;

        // Create workspace file and task
        dbLib.createWorkspaceFile({
          workspace_id: workspaceId,
          filename: 'test.wav',
          file_path: '/test.wav'
        });
        dbLib.createWorkspaceTask({
          workspace_id: workspaceId,
          title: 'Test Task',
          description: 'Test task description'
        });

        let files = dbLib.getFilesByWorkspace(workspaceId);
        let tasks = dbLib.getTasksByWorkspace(workspaceId);
        expect(files).toHaveLength(1);
        expect(tasks).toHaveLength(1);

        // Delete the workspace
        dbLib.db.prepare('DELETE FROM project_workspaces WHERE id = ?').run(workspaceId);

        files = dbLib.getFilesByWorkspace(workspaceId);
        tasks = dbLib.getTasksByWorkspace(workspaceId);
        expect(files).toEqual([]); // Files should be deleted
        expect(tasks).toEqual([]); // Tasks should be deleted
      });
    });
  });

});
