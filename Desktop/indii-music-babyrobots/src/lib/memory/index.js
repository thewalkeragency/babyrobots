// Memory Manager - Core Memory Infrastructure
// Tree Ring System: Core (Rush) -> Mid (Permissions) -> Outer (Crash)
// Based on docs/context_engineering.md and docs/memory_infra.md

import { RushMemory } from './rush-memory.js';
import { CrashMemory } from './crash-memory.js';
import { validateAgentPermission, getAgentPermissions } from './permissions.js';
import { SemanticChunker } from './semantic-chunker.js';

export class MemoryManager {
  constructor(options = {}) {
    // Tree Ring Architecture - Core Layer
    this.rush = new RushMemory({
      ttl: options.rushTtl || 30 * 60 * 1000, // 30 minutes
      maxSize: options.maxRushSize || 1000
    });
    
    // Tree Ring Architecture - Outer Layer
    this.crash = new CrashMemory({
      database: options.database,
      vectorSearch: options.enableVectorSearch || false
    });
    
    // Tree Ring Architecture - Processing Layer
    this.chunker = new SemanticChunker({
      chunkSize: options.chunkSize || 500,
      overlap: options.overlap || 50
    });
    
    this.strictPermissions = options.strictPermissions !== false;
  }

  // Tree Ring Core: Fast memory operations
  async getContext(sessionId, agentId, scope) {
    // Validate permissions first (mid ring)
    if (this.strictPermissions) {
      const hasPermission = await validateAgentPermission(agentId, scope, 'read');
      if (!hasPermission) {
        throw new Error(`Agent ${agentId} cannot read scope: ${scope}`);
      }
    }

    // Try rush memory first (core ring - fastest)
    let context = await this.rush.get(sessionId, agentId, scope);
    
    if (!context) {
      // Fallback to crash memory (outer ring - persistent)
      context = await this.crash.retrieve(sessionId, agentId, scope);
      
      // Warm rush cache for next access
      if (context) {
        await this.rush.set(sessionId, agentId, scope, context);
      }
    }
    
    return context;
  }

  // Tree Ring Write: Update with proper layering
  async updateContext(sessionId, agentId, scope, data, options = {}) {
    const { persistent = false, chunked = false, metadata = {} } = options;
    
    // Validate permissions (mid ring)
    if (this.strictPermissions) {
      const hasPermission = await validateAgentPermission(agentId, scope, 'write');
      if (!hasPermission) {
        throw new Error(`Agent ${agentId} cannot write to scope: ${scope}`);
      }
    }

    // Process data through chunking if needed (processing layer)
    let processedData = data;
    if (chunked && typeof data === 'string') {
      processedData = await this.chunker.chunkText(data, {
        agent: agentId,
        scope,
        session: sessionId,
        ...metadata
      });
    }

    // Always update rush memory (core ring)
    await this.rush.set(sessionId, agentId, scope, processedData, undefined, metadata);
    
    // Optionally persist to crash memory (outer ring)
    if (persistent) {
      await this.crash.save(sessionId, agentId, scope, processedData, metadata);
    }

    return {
      success: true,
      chunked: chunked && typeof data === 'string',
      persistent,
      timestamp: new Date().toISOString()
    };
  }

  // Tree Ring Search: Semantic search across all layers
  async searchContext(query, sessionId, agentId, scope, options = {}) {
    const { limit = 10, includeRush = true, includeCrash = true } = options;
    
    // Validate permissions
    if (this.strictPermissions) {
      const hasPermission = await validateAgentPermission(agentId, scope, 'read');
      if (!hasPermission) {
        throw new Error(`Agent ${agentId} cannot search scope: ${scope}`);
      }
    }

    const results = [];

    // Search rush memory (core ring)
    if (includeRush) {
      const rushResults = await this.rush.search(query, sessionId, agentId, scope);
      results.push(...rushResults.map(r => ({ ...r, source: 'rush' })));
    }

    // Search crash memory (outer ring)
    if (includeCrash) {
      const crashResults = await this.crash.search(query, sessionId, agentId, scope, limit);
      results.push(...crashResults.map(r => ({ ...r, source: 'crash' })));
    }

    // Sort by relevance score and limit
    return results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }

  // Memory Management: Clean up expired entries
  async cleanup() {
    await this.rush.cleanup();
    await this.crash.cleanup();
  }

  // Agent Context Seeding (Memex privilege)
  async seedContext(sessionId, agentId, seedData) {
    // Only Memex can seed context
    if (agentId !== 'memex') {
      throw new Error('Only Memex agent can seed context');
    }

    const scopes = ['project', 'implementation', 'monitoring', 'prototype'];
    const results = {};

    for (const scope of scopes) {
      const scopedData = this.extractScopeData(seedData, scope);
      if (scopedData) {
        results[scope] = await this.updateContext(
          sessionId, 
          agentId, 
          scope, 
          scopedData, 
          { persistent: true, chunked: true }
        );
      }
    }

    return results;
  }

  // Extract scope-specific data for seeding
  extractScopeData(data, scope) {
const scopeMap = {
      'project': ['goals', 'requirements', 'architecture', 'timeline', 'technical_details'],
      'implementation': ['code', 'tasks', 'technical_details', 'dependencies'],
      'monitoring': ['metrics', 'performance', 'alerts', 'logs', 'requirements'],
      'prototype': ['experiments', 'poc', 'drafts', 'iterations']
    };

    const relevantKeys = scopeMap[scope] || [];
    const scopedData = {};

    for (const key of relevantKeys) {
      if (data[key]) {
        scopedData[key] = data[key];
      }
    }

    return Object.keys(scopedData).length > 0 ? scopedData : null;
  }

  // Get memory statistics
  async getStats() {
    const rushStats = await this.rush.getStats();
    const crashStats = await this.crash.getStats();
    
    return {
      rush: rushStats,
      crash: crashStats,
      total_contexts: rushStats.count + crashStats.count,
      cache_hit_ratio: rushStats.hits / (rushStats.hits + rushStats.misses),
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance for global access
let memoryManager = null;

export const getMemoryManager = (options = {}) => {
  if (!memoryManager) {
    memoryManager = new MemoryManager(options);
  }
  return memoryManager;
};

export const initializeMemory = (options = {}) => {
  memoryManager = new MemoryManager(options);
  return memoryManager;
};

// Export for direct class usage
export { RushMemory, CrashMemory, SemanticChunker };
