import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('./database.sqlite', { verbose: console.log });

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'artist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS artist_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    stage_name TEXT NOT NULL,
    legal_name TEXT,
    bio TEXT,
    website TEXT,
    pro_affiliation TEXT,
    ipi_number TEXT,
    social_links TEXT, -- Stored as JSON string
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS fan_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    music_preferences TEXT, -- Stored as JSON string
    listening_history TEXT, -- Stored as JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS licensor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    industry TEXT,
    budget_range TEXT,
    licensing_needs TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS service_provider_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    service_categories TEXT, -- Stored as JSON string
    skills TEXT, -- Stored as JSON string
    experience_years INTEGER,
    portfolio_urls TEXT, -- Stored as JSON string
    rates TEXT, -- Stored as JSON string
    availability_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    album_title TEXT,
    genre TEXT,
    mood_tags TEXT, -- Stored as JSON string
    instrumentation TEXT, -- Stored as JSON string
    tempo_bpm INTEGER,
    key_signature TEXT,
    duration_seconds INTEGER,
    isrc TEXT,
    iswc TEXT,
    explicit_content BOOLEAN DEFAULT FALSE,
    language TEXT,
    release_date DATETIME,
    original_release_date DATETIME,
    copyright_holder TEXT,
    ai_tags TEXT, -- Stored as JSON string
    file_url TEXT,
    cover_art_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATETIME,
    completed_at DATETIME,
    assigned_to INTEGER,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    tags TEXT, -- Stored as JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
  );
`);

export const createUser = (email, password, role = 'artist') => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
  const info = stmt.run(email, hashedPassword, role);
  return info.lastInsertRowid;
};

export const getUserByEmail = (email) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
};

export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export const createArtistProfile = (userId, stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl) => {
  const stmt = db.prepare(
    'INSERT INTO artist_profiles (user_id, stage_name, legal_name, bio, website, pro_affiliation, ipi_number, social_links, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(userId, stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl);
  return info.lastInsertRowid;
};

export const getArtistProfileByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM artist_profiles WHERE user_id = ?');
  return stmt.get(userId);
};

export const updateArtistProfile = (userId, stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl) => {
  const stmt = db.prepare(
    'UPDATE artist_profiles SET stage_name = ?, legal_name = ?, bio = ?, website = ?, pro_affiliation = ?, ipi_number = ?, social_links = ?, profile_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  );
  const info = stmt.run(stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl, userId);
  return info.changes;
};

export const deleteArtistProfile = (userId) => {
  const stmt = db.prepare('DELETE FROM artist_profiles WHERE user_id = ?');
  const info = stmt.run(userId);
  return info.changes;
};

export const createFanProfile = (userId, displayName, musicPreferences, listeningHistory) => {
  const stmt = db.prepare(
    'INSERT INTO fan_profiles (user_id, display_name, music_preferences, listening_history) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(userId, displayName, musicPreferences, listeningHistory);
  return info.lastInsertRowid;
};

export const getFanProfileByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM fan_profiles WHERE user_id = ?');
  return stmt.get(userId);
};

export const updateFanProfile = (userId, displayName, musicPreferences, listeningHistory) => {
  const stmt = db.prepare(
    'UPDATE fan_profiles SET display_name = ?, music_preferences = ?, listening_history = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  );
  const info = stmt.run(displayName, musicPreferences, listeningHistory, userId);
  return info.changes;
};

export const deleteFanProfile = (userId) => {
  const stmt = db.prepare('DELETE FROM fan_profiles WHERE user_id = ?');
  const info = stmt.run(userId);
  return info.changes;
};

export const createLicensorProfile = (userId, companyName, contactPerson, industry, budgetRange, licensingNeeds) => {
  const stmt = db.prepare(
    'INSERT INTO licensor_profiles (user_id, company_name, contact_person, industry, budget_range, licensing_needs) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(userId, companyName, contactPerson, industry, budgetRange, licensingNeeds);
  return info.lastInsertRowid;
};

export const getLicensorProfileByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM licensor_profiles WHERE user_id = ?');
  return stmt.get(userId);
};

export const updateLicensorProfile = (userId, companyName, contactPerson, industry, budgetRange, licensingNeeds) => {
  const stmt = db.prepare(
    'UPDATE licensor_profiles SET company_name = ?, contact_person = ?, industry = ?, budget_range = ?, licensing_needs = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  );
  const info = stmt.run(companyName, contactPerson, industry, budgetRange, licensingNeeds, userId);
  return info.changes;
};

export const deleteLicensorProfile = (userId) => {
  const stmt = db.prepare('DELETE FROM licensor_profiles WHERE user_id = ?');
  const info = stmt.run(userId);
  return info.changes;
};

export const createServiceProviderProfile = (userId, businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus) => {
  const stmt = db.prepare(
    'INSERT INTO service_provider_profiles (user_id, business_name, service_categories, skills, experience_years, portfolio_urls, rates, availability_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(userId, businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus);
  return info.lastInsertRowid;
};

export const getServiceProviderProfileByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM service_provider_profiles WHERE user_id = ?');
  return stmt.get(userId);
};

export const updateServiceProviderProfile = (userId, businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus) => {
  const stmt = db.prepare(
    'UPDATE service_provider_profiles SET business_name = ?, service_categories = ?, skills = ?, experience_years = ?, portfolio_urls = ?, rates = ?, availability_status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  );
  const info = stmt.run(businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus, userId);
  return info.changes;
};

export const deleteServiceProviderProfile = (userId) => {
  const stmt = db.prepare('DELETE FROM service_provider_profiles WHERE user_id = ?');
  const info = stmt.run(userId);
  return info.changes;
};

export const createTrack = (artistId, title, albumTitle, genre, moodTags, instrumentation, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags, fileUrl, coverArtUrl) => {
  const stmt = db.prepare(
    'INSERT INTO tracks (artist_id, title, album_title, genre, mood_tags, instrumentation, tempo_bpm, key_signature, duration_seconds, isrc, iswc, explicit_content, language, release_date, original_release_date, copyright_holder, ai_tags, file_url, cover_art_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(artistId, title, albumTitle, genre, moodTags, instrumentation, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags, fileUrl, coverArtUrl);
  return info.lastInsertRowid;
};

export const getTrackById = (id) => {
  const stmt = db.prepare('SELECT * FROM tracks WHERE id = ?');
  return stmt.get(id);
};

export const updateTrack = (id, artistId, title, albumTitle, genre, moodTags, instrumentation, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags, fileUrl, coverArtUrl) => {
  const stmt = db.prepare(
    'UPDATE tracks SET artist_id = ?, title = ?, album_title = ?, genre = ?, mood_tags = ?, instrumentation = ?, tempo_bpm = ?, key_signature = ?, duration_seconds = ?, isrc = ?, iswc = ?, explicit_content = ?, language = ?, release_date = ?, original_release_date = ?, copyright_holder = ?, ai_tags = ?, file_url = ?, cover_art_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  const info = stmt.run(artistId, title, albumTitle, genre, moodTags, instrumentation, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags, fileUrl, coverArtUrl, id);
  return info.changes;
};

export const deleteTrack = (id) => {
  const stmt = db.prepare('DELETE FROM tracks WHERE id = ?');
  const info = stmt.run(id);
  return info.changes;
};

export const getTracksByArtistId = (artistId) => {
  const stmt = db.prepare('SELECT * FROM tracks WHERE artist_id = ?');
  return stmt.all(artistId);
};

// Generic query and run functions for more flexible database operations
export const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
};

export const run = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

// Task management functions
export const createTask = (userId, title, description, priority, category, dueDate, assignedTo, projectId, tags) => {
  const stmt = db.prepare(
    'INSERT INTO tasks (user_id, title, description, priority, category, due_date, assigned_to, project_id, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(userId, title, description, priority, category, dueDate, assignedTo, projectId, tags);
  return info.lastInsertRowid;
};

export const getTaskById = (id) => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id);
};

export const getTasksByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY priority DESC, created_at DESC');
  return stmt.all(userId);
};

export const updateTask = (id, updates) => {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  const stmt = db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
  const info = stmt.run(...values, id);
  return info.changes;
};

export const deleteTask = (id) => {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const info = stmt.run(id);
  return info.changes;
};

export default db;
