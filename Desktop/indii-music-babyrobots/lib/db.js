const Database = require('better-sqlite3');
const path = require('path');

// Create database file in project root
const dbPath = path.join(process.cwd(), 'indii-music.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initializes the SQLite database schema for the music application.
 *
 * Creates all required tables with appropriate columns, constraints, and foreign keys if they do not already exist. Ensures foreign key support and sets up tables for users, various profile types, tracks, audio files, chat sessions (including session-specific context), and chat messages.
 *
 * @throws Will throw an error if database initialization fails.
 */
function initializeDatabase() {
  try {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        profile_type TEXT CHECK (profile_type IN ('artist', 'fan', 'licensor', 'service_provider')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Artist profiles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS artist_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist_name TEXT NOT NULL,
        bio TEXT,
        genre TEXT,
        location TEXT,
        website TEXT,
        spotify_url TEXT,
        soundcloud_url TEXT,
        instagram_url TEXT,
        twitter_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Fan profiles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS fan_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        display_name TEXT,
        favorite_genres TEXT,
        location TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Licensor profiles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS licensor_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL,
        contact_person TEXT,
        industry_focus TEXT,
        website TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Service provider profiles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_provider_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        description TEXT,
        website TEXT,
        contact_email TEXT,
        phone TEXT,
        pricing_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Tracks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artist_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        duration INTEGER,
        genre TEXT,
        mood TEXT,
        bpm INTEGER,
        key_signature TEXT,
        file_url TEXT,
        artwork_url TEXT,
        description TEXT,
        tags TEXT,
        is_public BOOLEAN DEFAULT true,
        play_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Audio files table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audio_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        duration INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Chat sessions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'general',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        context_json TEXT DEFAULT NULL, -- Added for session-specific agent context
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    // Chat messages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        role TEXT DEFAULT 'general',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize on first import
initializeDatabase();

// Helper functions
const db_helpers = {
  // User operations
  createUser: (userData) => {
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, username, first_name, last_name, profile_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      userData.email,
      userData.password_hash,
      userData.username,
      userData.first_name,
      userData.last_name,
      userData.profile_type
    );
  },

  getUserByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  getUserById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Artist profile operations
  createArtistProfile: (profileData) => {
    const stmt = db.prepare(`
      INSERT INTO artist_profiles (user_id, artist_name, bio, genre, location, website, spotify_url, soundcloud_url, instagram_url, twitter_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      profileData.user_id,
      profileData.artist_name,
      profileData.bio,
      profileData.genre,
      profileData.location,
      profileData.website,
      profileData.spotify_url,
      profileData.soundcloud_url,
      profileData.instagram_url,
      profileData.twitter_url
    );
  },

  getArtistProfile: (userId) => {
    const stmt = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?');
    return stmt.get(userId);
  },

  // Fan profile operations
  createFanProfile: (profileData) => {
    const stmt = db.prepare(`
      INSERT INTO fan_profiles (user_id, display_name, favorite_genres, location, bio)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      profileData.user_id,
      profileData.display_name,
      profileData.favorite_genres,
      profileData.location,
      profileData.bio
    );
  },

  getFanProfile: (userId) => {
    const stmt = db.prepare('SELECT * FROM fan_profiles WHERE user_id = ?');
    return stmt.get(userId);
  },

  // Licensor profile operations
  createLicensorProfile: (profileData) => {
    const stmt = db.prepare(`
      INSERT INTO licensor_profiles (user_id, company_name, contact_person, industry_focus, website, phone, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      profileData.user_id,
      profileData.company_name,
      profileData.contact_person,
      profileData.industry_focus,
      profileData.website,
      profileData.phone,
      profileData.address
    );
  },

  getLicensorProfile: (userId) => {
    const stmt = db.prepare('SELECT * FROM licensor_profiles WHERE user_id = ?');
    return stmt.get(userId);
  },

  // Service provider profile operations
  createServiceProviderProfile: (profileData) => {
    const stmt = db.prepare(`
      INSERT INTO service_provider_profiles (user_id, company_name, service_type, description, website, contact_email, phone, pricing_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      profileData.user_id,
      profileData.company_name,
      profileData.service_type,
      profileData.description,
      profileData.website,
      profileData.contact_email,
      profileData.phone,
      profileData.pricing_info
    );
  },

  getServiceProviderProfile: (userId) => {
    const stmt = db.prepare('SELECT * FROM service_provider_profiles WHERE user_id = ?');
    return stmt.get(userId);
  },

  // Track operations
  createTrack: (trackData) => {
    const stmt = db.prepare(`
      INSERT INTO tracks (artist_id, title, duration, genre, mood, bpm, key_signature, file_url, artwork_url, description, tags, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      trackData.artist_id,
      trackData.title,
      trackData.duration,
      trackData.genre,
      trackData.mood,
      trackData.bpm,
      trackData.key_signature,
      trackData.file_url,
      trackData.artwork_url,
      trackData.description,
      trackData.tags,
      trackData.is_public
    );
  },

  getTracksByArtist: (artistId) => {
    const stmt = db.prepare('SELECT * FROM tracks WHERE artist_id = ? ORDER BY created_at DESC');
    return stmt.all(artistId);
  },

  getTrackById: (id) => {
    const stmt = db.prepare('SELECT * FROM tracks WHERE id = ?');
    return stmt.get(id);
  },

  // Audio file operations
  createAudioFile: (fileData) => {
    const stmt = db.prepare(`
      INSERT INTO audio_files (user_id, filename, original_name, file_path, file_size, mime_type, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      fileData.user_id,
      fileData.filename,
      fileData.original_name,
      fileData.file_path,
      fileData.file_size,
      fileData.mime_type,
      fileData.duration
    );
  },

  // Chat operations
  createChatSession: (sessionData) => {
    const stmt = db.prepare(`
      INSERT INTO chat_sessions (user_id, session_id, role)
      VALUES (?, ?, ?)
    `);
    return stmt.run(sessionData.user_id, sessionData.session_id, sessionData.role);
  },

  getChatSession: (sessionId) => {
    const stmt = db.prepare('SELECT * FROM chat_sessions WHERE session_id = ?');
    return stmt.get(sessionId);
  },

  updateChatSessionActivity: (sessionId) => {
    const stmt = db.prepare('UPDATE chat_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = ?');
    return stmt.run(sessionId);
  },

  createChatMessage: (messageData) => {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (session_id, message, response, role)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      messageData.session_id,
      messageData.message,
      messageData.response,
      messageData.role
    );
  },

  getChatHistory: (sessionId, limit = 50) => {
    const stmt = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `);
    return stmt.all(sessionId, limit);
  },

  updateSessionContext: (sessionId, contextData) => {
    const contextJsonString = JSON.stringify(contextData);
    const stmt = db.prepare('UPDATE chat_sessions SET context_json = ? WHERE session_id = ?');
    return stmt.run(contextJsonString, sessionId);
  },

  getSessionContext: (sessionId) => {
    const stmt = db.prepare('SELECT context_json FROM chat_sessions WHERE session_id = ?');
    const row = stmt.get(sessionId);
    if (row && row.context_json) {
      try {
        return JSON.parse(row.context_json);
      } catch (e) {
        console.error("Error parsing session context JSON:", e);
        return null; // Or throw, or return the raw string
      }
    }
    return null;
  }
};

module.exports = {
  db,
  ...db_helpers
};
