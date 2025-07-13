// Crash Memory - Tree Ring Outer Layer
// Persistent memory storage with database backing
// Based on docs/memory_infra.md - Crash memory system

import sqlite3 from 'sqlite3';
sqlite3.verbose();

export class CrashMemory {
  constructor(options = {}) {
    this.db = new sqlite3.Database(options.database || ':memory:', (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
    
    // Default query options for semantic search
    this.vectorSearchEnabled = options.vectorSearch || false;
    this.initialize();
  }

  // Initialize database tables
  initialize() {
    this.db.serialize(() => {
      // Create memory entries table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS memory_entries (
        id INTEGER PRIMARY KEY,
        session_id TEXT,
        agent_id TEXT,
        scope TEXT,
        access_level TEXT,
        content_type TEXT,
        content TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_crash BOOLEAN DEFAULT FALSE
        )
      `);

      // Create indexes for fast lookup
      this.db.run('CREATE INDEX IF NOT EXISTS idx_memory_session_agent ON memory_entries(session_id, agent_id);');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_memory_scope ON memory_entries(scope);');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory_entries(created_at);');
    });
  }

  // Save memory entry
  async save(sessionId, agentId, scope, data, metadata = {}) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO memory_entries 
        (session_id, agent_id, scope, content, metadata, is_crash, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, datetime('now'))
      `);

      const serializedData = JSON.stringify(data);
      const serializedMetadata = JSON.stringify(metadata);
      
      stmt.run(sessionId, agentId, scope, serializedData, serializedMetadata, function(err) {
        if (err) {
          console.error('Error saving memory:', err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });

      stmt.finalize();
    });
  }

  // Retrieve memory entries
  async retrieve(sessionId, agentId, scope, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM memory_entries 
        WHERE session_id = ? 
        AND scope LIKE ? AND is_crash = TRUE
        ORDER BY created_at DESC LIMIT ?
      `, [sessionId, `${scope}%`, limit], (err, rows) => {
        if (err) {
          console.error('Error retrieving memory:', err.message);
          reject(err);
        } else {
          // Parse the JSON content and return the actual data
          if (rows.length > 0) {
            try {
              const latestRow = rows[0];
              const parsedContent = JSON.parse(latestRow.content);
              resolve(parsedContent);
            } catch (parseErr) {
              console.error('Error parsing stored content:', parseErr.message);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // Placeholder for semantic search
  async search(query, sessionId, agentId, scope, limit = 10) {
    // Example logic for vector search, based on enabled options
    if (!this.vectorSearchEnabled) {
      console.warn('Vector search is disabled. Enable to use this feature.');
      return [];
    }

    // TODO: Implement vector-based search logic
    console.warn('Vector search functionality will be added.');

    return [];
  }

  // Cleanup expired entries - if implemented
  async cleanup() {
    const now = new Date().toISOString();
    this.db.run('DELETE FROM memory_entries WHERE expires_at < ?', [now]);
  }

  // Get all entries for specific scope
  async getByScope(sessionId, agentId, scope) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM memory_entries 
        WHERE session_id = ? AND agent_id = ? AND scope LIKE ? AND is_crash = TRUE
        ORDER BY created_at DESC
      `, [sessionId, agentId, `${scope}%`], (err, rows) => {
        if (err) {
          console.error('Error retrieving memory by scope:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Memory statistics
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM memory_entries', [], (err, row) => {
        if (err) {
          console.error('Error getting stats:', err.message);
          reject(err);
        } else {
          resolve({ count: row.count });
        }
      });
    });
  }
} 
// Initialize a singleton for shared use
let crashMemory = new CrashMemory({ database: 'crash-memory.db' });
export const getCrashMemory = (options = {}) => {
  if (!crashMemory) {
    crashMemory = new CrashMemory(options);
  }
  return crashMemory;
};

export const initializeCrashMemory = (options = {}) => {
  crashMemory = new CrashMemory(options);
  return crashMemory;
};

// Class is already exported directly on line 8

