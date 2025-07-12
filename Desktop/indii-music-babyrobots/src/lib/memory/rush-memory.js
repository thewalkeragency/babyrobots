// Rush Memory - Tree Ring Core Layer
// Fast, short-term memory with TTL and LRU eviction
// Based on docs/memory_infra.md - Rush memory system

export class RushMemory {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 30 * 60 * 1000; // 30 minutes default
    this.maxSize = options.maxSize || 1000;
    this.hits = 0;
    this.misses = 0;
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  // Generate key for tree ring addressing
  _generateKey(sessionId, agentId, scope) {
    return `${sessionId}:${agentId}:${scope}`;
  }

  // Set data with TTL and metadata
  async set(sessionId, agentId, scope, data, customTtl, metadata = {}) {
    const key = this._generateKey(sessionId, agentId, scope);
    const ttl = customTtl || this.ttl;
    
    const entry = {
      data,
      metadata: {
        agent: agentId,
        scope,
        session: sessionId,
        created_at: Date.now(),
        expires_at: Date.now() + ttl,
        access_count: 0,
        last_accessed: Date.now(),
        ...metadata
      },
      expires: Date.now() + ttl
    };

    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this._findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, entry);
    
    // Move to end for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry;
  }

  // Get data with access tracking
  async get(sessionId, agentId, scope) {
    const key = this._generateKey(sessionId, agentId, scope);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access tracking
    entry.metadata.access_count++;
    entry.metadata.last_accessed = Date.now();
    this.hits++;

    // Move to end for LRU (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  // Check if key exists without affecting LRU or access count
  async has(sessionId, agentId, scope) {
    const key = this._generateKey(sessionId, agentId, scope);
    const entry = this.cache.get(key);
    
    if (!entry || entry.expires < Date.now()) {
      return false;
    }
    
    return true;
  }

  // Delete specific entry
  async delete(sessionId, agentId, scope) {
    const key = this._generateKey(sessionId, agentId, scope);
    return this.cache.delete(key);
  }

  // Search entries with basic text matching
  async search(query, sessionId, agentId, scope) {
    const results = [];
    const searchKey = `${sessionId}:${agentId}:${scope}`;
    
    for (const [key, entry] of this.cache.entries()) {
      // Skip expired entries
      if (entry.expires < Date.now()) {
        continue;
      }

      // Check if key matches scope pattern
      if (!key.startsWith(searchKey.replace(/\*$/, ''))) {
        continue;
      }

      // Simple text search in data
      const dataStr = JSON.stringify(entry.data);
      if (dataStr.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          key,
          data: entry.data,
          metadata: entry.metadata,
          score: this._calculateRelevanceScore(query, dataStr, entry.metadata)
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Calculate simple relevance score
  _calculateRelevanceScore(query, dataStr, metadata) {
    const queryLower = query.toLowerCase();
    const dataLower = dataStr.toLowerCase();
    
    let score = 0;
    
    // Exact matches get higher score
    const exactMatches = (dataLower.match(new RegExp(queryLower, 'g')) || []).length;
    score += exactMatches * 10;
    
    // Recent entries get slight boost
    const ageInHours = (Date.now() - metadata.created_at) / (1000 * 60 * 60);
    score += Math.max(0, 5 - ageInHours);
    
    // Frequently accessed entries get boost
    score += Math.min(metadata.access_count, 5);
    
    return score;
  }

  // Find oldest entry for LRU eviction
  _findOldestEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.last_accessed < oldestTime) {
        oldestTime = entry.metadata.last_accessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // Clean up expired entries
  async cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    return expiredKeys.length;
  }

  // Get all entries for specific scope
  async getByScope(sessionId, agentId, scope) {
    const results = [];
    const searchKey = `${sessionId}:${agentId}:${scope}`;
    
    for (const [key, entry] of this.cache.entries()) {
      // Skip expired entries
      if (entry.expires < Date.now()) {
        continue;
      }

      // Check if key matches scope
      if (key.startsWith(searchKey)) {
        results.push({
          key,
          data: entry.data,
          metadata: entry.metadata
        });
      }
    }

    return results.sort((a, b) => b.metadata.created_at - a.metadata.created_at);
  }

  // Get memory statistics
  async getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires > now) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
      
      // Estimate size (rough calculation)
      totalSize += JSON.stringify(entry).length;
    }

    return {
      count: this.cache.size,
      active_entries: activeEntries,
      expired_entries: expiredEntries,
      hits: this.hits,
      misses: this.misses,
      hit_ratio: this.hits / (this.hits + this.misses) || 0,
      estimated_size_bytes: totalSize,
      max_size: this.maxSize,
      ttl_ms: this.ttl
    };
  }

  // Clear all entries
  async clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Destroy and cleanup
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}
