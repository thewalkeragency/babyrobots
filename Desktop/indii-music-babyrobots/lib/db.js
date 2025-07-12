const Database = require('better-sqlite3');
const path = require('path');

// Create database file in project root
const dbPath = path.join(process.cwd(), 'indii-music.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
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

// Split sheets
    db.exec(`
      CREATE TABLE IF NOT EXISTS split_sheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track_id INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE
      )
    `);

    // Split sheet contributors
    db.exec(`
      CREATE TABLE IF NOT EXISTS split_sheet_contributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        split_sheet_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        role TEXT,
        percentage REAL NOT NULL,
        FOREIGN KEY (split_sheet_id) REFERENCES split_sheets (id) ON DELETE CASCADE
      )
    `);

    // Project workspaces
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Workspace files
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        FOREIGN KEY (workspace_id) REFERENCES project_workspaces (id) ON DELETE CASCADE
      )
    `);

    // Workspace tasks
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        is_completed BOOLEAN DEFAULT false,
        FOREIGN KEY (workspace_id) REFERENCES project_workspaces (id) ON DELETE CASCADE
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

    // Authentication system tables
    // OAuth accounts table
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_account_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // User sessions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        session_token TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        expires DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Verification tokens table
    db.exec(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires DATETIME NOT NULL,
        UNIQUE(identifier, token)
      )
    `);

    // User roles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        assigned_by INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    // Security logs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN DEFAULT true,
        details TEXT, -- JSON as TEXT in SQLite
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    // Password resets table
    db.exec(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires DATETIME NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
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

  // Enhanced profile operations with full CRUD
  
  // Artist profile CRUD operations
  updateArtistProfile: (userId, profileData) => {
    const stmt = db.prepare(`
      UPDATE artist_profiles 
      SET artist_name = ?, bio = ?, genre = ?, location = ?, website = ?, 
          spotify_url = ?, soundcloud_url = ?, instagram_url = ?, twitter_url = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    return stmt.run(
      profileData.artist_name,
      profileData.bio,
      profileData.genre,
      profileData.location,
      profileData.website,
      profileData.spotify_url,
      profileData.soundcloud_url,
      profileData.instagram_url,
      profileData.twitter_url,
      userId
    );
  },

  deleteArtistProfile: (userId) => {
    const stmt = db.prepare('DELETE FROM artist_profiles WHERE user_id = ?');
    return stmt.run(userId);
  },

  // Fan profile CRUD operations
  updateFanProfile: (userId, profileData) => {
    const stmt = db.prepare(`
      UPDATE fan_profiles 
      SET display_name = ?, favorite_genres = ?, location = ?, bio = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    return stmt.run(
      profileData.display_name,
      profileData.favorite_genres,
      profileData.location,
      profileData.bio,
      userId
    );
  },

  deleteFanProfile: (userId) => {
    const stmt = db.prepare('DELETE FROM fan_profiles WHERE user_id = ?');
    return stmt.run(userId);
  },

  // Licensor profile CRUD operations
  updateLicensorProfile: (userId, profileData) => {
    const stmt = db.prepare(`
      UPDATE licensor_profiles 
      SET company_name = ?, contact_person = ?, industry_focus = ?, website = ?, 
          phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    return stmt.run(
      profileData.company_name,
      profileData.contact_person,
      profileData.industry_focus,
      profileData.website,
      profileData.phone,
      profileData.address,
      userId
    );
  },

  deleteLicensorProfile: (userId) => {
    const stmt = db.prepare('DELETE FROM licensor_profiles WHERE user_id = ?');
    return stmt.run(userId);
  },

  // Service provider profile CRUD operations
  updateServiceProviderProfile: (userId, profileData) => {
    const stmt = db.prepare(`
      UPDATE service_provider_profiles 
      SET company_name = ?, service_type = ?, description = ?, website = ?, 
          contact_email = ?, phone = ?, pricing_info = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    return stmt.run(
      profileData.company_name,
      profileData.service_type,
      profileData.description,
      profileData.website,
      profileData.contact_email,
      profileData.phone,
      profileData.pricing_info,
      userId
    );
  },

  deleteServiceProviderProfile: (userId) => {
    const stmt = db.prepare('DELETE FROM service_provider_profiles WHERE user_id = ?');
    return stmt.run(userId);
  },

  // Profile management and switching functions
  getUserWithProfile: (userId) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return null;

    let profile = null;
    switch (user.profile_type) {
      case 'artist':
        profile = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?').get(userId);
        break;
      case 'fan':
        profile = db.prepare('SELECT * FROM fan_profiles WHERE user_id = ?').get(userId);
        break;
      case 'licensor':
        profile = db.prepare('SELECT * FROM licensor_profiles WHERE user_id = ?').get(userId);
        break;
      case 'service_provider':
        profile = db.prepare('SELECT * FROM service_provider_profiles WHERE user_id = ?').get(userId);
        break;
    }

    return {
      ...user,
      profile
    };
  },

  updateUserProfileType: (userId, newProfileType) => {
    const stmt = db.prepare('UPDATE users SET profile_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(newProfileType, userId);
  },

  // Profile search and filtering functions
  searchArtistProfiles: (searchTerm, limit = 20) => {
    const stmt = db.prepare(`
      SELECT ap.*, u.username, u.first_name, u.last_name 
      FROM artist_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE ap.artist_name LIKE ? OR ap.genre LIKE ? OR ap.bio LIKE ?
      ORDER BY ap.updated_at DESC
      LIMIT ?
    `);
    const term = `%${searchTerm}%`;
    return stmt.all(term, term, term, limit);
  },

  searchFanProfiles: (searchTerm, limit = 20) => {
    const stmt = db.prepare(`
      SELECT fp.*, u.username, u.first_name, u.last_name 
      FROM fan_profiles fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.display_name LIKE ? OR fp.favorite_genres LIKE ? OR fp.bio LIKE ?
      ORDER BY fp.updated_at DESC
      LIMIT ?
    `);
    const term = `%${searchTerm}%`;
    return stmt.all(term, term, term, limit);
  },

  searchLicensorProfiles: (searchTerm, limit = 20) => {
    const stmt = db.prepare(`
      SELECT lp.*, u.username, u.first_name, u.last_name 
      FROM licensor_profiles lp
      JOIN users u ON lp.user_id = u.id
      WHERE lp.company_name LIKE ? OR lp.industry_focus LIKE ? OR lp.contact_person LIKE ?
      ORDER BY lp.updated_at DESC
      LIMIT ?
    `);
    const term = `%${searchTerm}%`;
    return stmt.all(term, term, term, limit);
  },

  searchServiceProviderProfiles: (searchTerm, limit = 20) => {
    const stmt = db.prepare(`
      SELECT spp.*, u.username, u.first_name, u.last_name 
      FROM service_provider_profiles spp
      JOIN users u ON spp.user_id = u.id
      WHERE spp.company_name LIKE ? OR spp.service_type LIKE ? OR spp.description LIKE ?
      ORDER BY spp.updated_at DESC
      LIMIT ?
    `);
    const term = `%${searchTerm}%`;
    return stmt.all(term, term, term, limit);
  },

  // Get profiles by type
  getProfilesByType: (profileType, limit = 50) => {
    switch (profileType) {
      case 'artist':
        const artistStmt = db.prepare(`
          SELECT ap.*, u.username, u.first_name, u.last_name 
          FROM artist_profiles ap
          JOIN users u ON ap.user_id = u.id
          ORDER BY ap.updated_at DESC
          LIMIT ?
        `);
        return artistStmt.all(limit);
      case 'fan':
        const fanStmt = db.prepare(`
          SELECT fp.*, u.username, u.first_name, u.last_name 
          FROM fan_profiles fp
          JOIN users u ON fp.user_id = u.id
          ORDER BY fp.updated_at DESC
          LIMIT ?
        `);
        return fanStmt.all(limit);
      case 'licensor':
        const licensorStmt = db.prepare(`
          SELECT lp.*, u.username, u.first_name, u.last_name 
          FROM licensor_profiles lp
          JOIN users u ON lp.user_id = u.id
          ORDER BY lp.updated_at DESC
          LIMIT ?
        `);
        return licensorStmt.all(limit);
      case 'service_provider':
        const spStmt = db.prepare(`
          SELECT spp.*, u.username, u.first_name, u.last_name 
          FROM service_provider_profiles spp
          JOIN users u ON spp.user_id = u.id
          ORDER BY spp.updated_at DESC
          LIMIT ?
        `);
        return spStmt.all(limit);
      default:
        return [];
    }
  },

  // Profile validation functions
  validateProfileData: (profileType, data) => {
    const errors = [];
    
    switch (profileType) {
      case 'artist':
        if (!data.artist_name || data.artist_name.trim().length === 0) {
          errors.push('Artist name is required');
        }
        break;
      case 'fan':
        if (!data.display_name || data.display_name.trim().length === 0) {
          errors.push('Display name is required');
        }
        break;
      case 'licensor':
        if (!data.company_name || data.company_name.trim().length === 0) {
          errors.push('Company name is required');
        }
        break;
      case 'service_provider':
        if (!data.company_name || data.company_name.trim().length === 0) {
          errors.push('Company name is required');
        }
        if (!data.service_type || data.service_type.trim().length === 0) {
          errors.push('Service type is required');
        }
        break;
    }
    
    return errors;
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
    return stmt.get(sessionId) || null;
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
  },

  // Split sheet operations
  createSplitSheet: (splitSheetData) => {
    const stmt = db.prepare(`
      INSERT INTO split_sheets (track_id, description)
      VALUES (?, ?)
    `);
    return stmt.run(splitSheetData.track_id, splitSheetData.description);
  },

  getSplitSheetsByTrack: (trackId) => {
    const stmt = db.prepare('SELECT * FROM split_sheets WHERE track_id = ?');
    return stmt.all(trackId);
  },

  // Split sheet contributor operations
  createSplitSheetContributor: (contributorData) => {
    const stmt = db.prepare(`
      INSERT INTO split_sheet_contributors (split_sheet_id, name, role, percentage)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      contributorData.split_sheet_id,
      contributorData.name,
      contributorData.role,
      contributorData.percentage
    );
  },

  getContributorsBySplitSheet: (splitSheetId) => {
    const stmt = db.prepare('SELECT * FROM split_sheet_contributors WHERE split_sheet_id = ?');
    return stmt.all(splitSheetId);
  },

  // Project workspace operations
  createProjectWorkspace: (workspaceData) => {
    const stmt = db.prepare(`
      INSERT INTO project_workspaces (user_id, name, description)
      VALUES (?, ?, ?)
    `);
    return stmt.run(
      workspaceData.user_id,
      workspaceData.name,
      workspaceData.description
    );
  },

  getWorkspacesByUser: (userId) => {
    const stmt = db.prepare('SELECT * FROM project_workspaces WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  },

  getWorkspaceById: (id) => {
    const stmt = db.prepare('SELECT * FROM project_workspaces WHERE id = ?');
    return stmt.get(id);
  },

  // Workspace file operations
  createWorkspaceFile: (fileData) => {
    const stmt = db.prepare(`
      INSERT INTO workspace_files (workspace_id, filename, file_path)
      VALUES (?, ?, ?)
    `);
    return stmt.run(
      fileData.workspace_id,
      fileData.filename,
      fileData.file_path
    );
  },

  getFilesByWorkspace: (workspaceId) => {
    const stmt = db.prepare('SELECT * FROM workspace_files WHERE workspace_id = ?');
    return stmt.all(workspaceId);
  },

  // Workspace task operations
  createWorkspaceTask: (taskData) => {
    const stmt = db.prepare(`
      INSERT INTO workspace_tasks (workspace_id, title, description, due_date, is_completed)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      taskData.workspace_id,
      taskData.title,
      taskData.description,
      taskData.due_date,
      taskData.is_completed ? 1 : 0
    );
  },

  getTasksByWorkspace: (workspaceId) => {
    const stmt = db.prepare('SELECT * FROM workspace_tasks WHERE workspace_id = ? ORDER BY due_date ASC');
    return stmt.all(workspaceId);
  },

  updateTaskCompletion: (taskId, isCompleted) => {
    const stmt = db.prepare('UPDATE workspace_tasks SET is_completed = ? WHERE id = ?');
    return stmt.run(isCompleted ? 1 : 0, taskId);
  }
};

module.exports = {
  db,
  ...db_helpers
};
