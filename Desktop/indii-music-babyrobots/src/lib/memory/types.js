// Types - Tree Ring Memory System
// TypeScript-style definitions for memory components
// Based on docs/context_engineering.md and docs/memory_infra.md

/**
 * Tree Ring Memory System Types
 * Core (Rush) -> Mid (Permissions) -> Outer (Crash)
 */

// Memory Entry Structure
export const MemoryEntrySchema = {
  id: 'string',
  session_id: 'string',
  agent_id: 'string',
  scope: 'string',
  content: 'any',
  metadata: {
    agent: 'string',
    scope: 'string',
    session: 'string',
    created_at: 'string',
    access_count: 'number',
    last_accessed: 'string',
    chunk_index: 'number',
    chunk_size: 'number',
    chunk_type: 'string'
  },
  expires: 'number',
  is_crash: 'boolean'
};

// Agent Permission Structure
export const AgentPermissionSchema = {
  name: 'string',
  memory_access: 'enum["full", "task-scoped", "background", "experimental"]',
  scopes: 'array[string]',
  can_seed_context: 'boolean',
  read_access: 'boolean',
  write_access: 'boolean',
  description: 'string'
};

// Context Handoff Structure (from docs/context_engineering.md)
export const ContextHandoffSchema = {
  previous_memory_state_summary: 'string',
  current_task_scope_and_limitations: 'string',
  expected_output_format_and_validation_criteria: 'string',
  access_permissions_for_memory_reads_writes: 'array[string]'
};

// Agent Types from .ai_rules/agents/
export const AgentTypes = {
  MEMEX: 'memex',
  WARP: 'warp',
  JULES: 'jules',
  GEMINI_CLI: 'gemini-cli'
};

// Scope Types
export const ScopeTypes = {
  PROJECT: 'project',
  IMPLEMENTATION: 'implementation',
  MONITORING: 'monitoring',
  PROTOTYPE: 'prototype',
  TASK: 'task',
  EXPERIMENT: 'experiment',
  POC: 'poc',
  METRICS: 'metrics',
  OPTIMIZATION: 'optimization'
};

// Tree Ring System Validation Functions
export function validateMemoryEntry(entry) {
  const required = ['session_id', 'agent_id', 'scope', 'content'];
  return required.every(field => entry.hasOwnProperty(field));
}

export function validateAgentId(agentId) {
  return Object.values(AgentTypes).includes(agentId);
}

export function validateScope(scope) {
  const scopeParts = scope.split(':');
  const mainScope = scopeParts[0];
  return Object.values(ScopeTypes).includes(mainScope);
}


// Memory Manager Options
export const MemoryManagerOptions = {
  rushTtl: 'number', // TTL in milliseconds
  maxRushSize: 'number', // Max entries in rush memory
  chunkSize: 'number', // Semantic chunk size
  overlap: 'number', // Chunk overlap
  database: 'string', // Database path
  enableVectorSearch: 'boolean',
  strictPermissions: 'boolean'
};

// Chunk Structure
export const ChunkSchema = {
  content: 'string',
  metadata: {
    agent: 'string',
    scope: 'string',
    session: 'string',
    chunk_index: 'number',
    start_pos: 'number',
    end_pos: 'number',
    chunk_size: 'number',
    created_at: 'string',
    chunk_type: 'enum["heading", "code", "list", "ordered_list", "paragraph", "text"]',
    total_chunks: 'number',
    is_first: 'boolean',
    is_last: 'boolean',
    word_count: 'number',
    sentence_count: 'number',
    complexity_score: 'number'
  }
};

// Memory Operation Types
export const MemoryOperations = {
  READ: 'read',
  write: 'write',
  search: 'search',
  delete: 'delete'
};

// Memory Access Levels
export const MemoryAccessLevels = {
  none: 'none',
  read_only: 'read-only',
  full: 'full'
};

export function validateOperation(operation) {
  return Object.values(MemoryOperations).includes(operation);
}

// Helper function to create typed memory entry
export function createMemoryEntry(sessionId, agentId, scope, content, metadata = {}) {
  if (!validateAgentId(agentId)) {
    throw new Error(`Invalid agent ID: ${agentId}`);
  }
  
  if (!validateScope(scope)) {
    throw new Error(`Invalid scope: ${scope}`);
  }

  return {
    session_id: sessionId,
    agent_id: agentId,
    scope: scope,
    content: content,
    metadata: {
      agent: agentId,
      scope: scope,
      session: sessionId,
      created_at: new Date().toISOString(),
      access_count: 0,
      last_accessed: new Date().toISOString(),
      ...metadata
    },
    expires: Date.now() + (30 * 60 * 1000), // 30 minutes default
    is_crash: false
  };
}

// Helper function to create context handoff
export function createContextHandoff(fromAgent, toAgent, taskData, scope) {
  return {
    previous_memory_state_summary: `Context from ${fromAgent} for task: ${taskData.id}`,
    current_task_scope_and_limitations: `Scope: ${scope}, Agent: ${toAgent}`,
    expected_output_format_and_validation_criteria: taskData.validation || 'Standard output format',
    access_permissions_for_memory_reads_writes: [`read:${scope}`, `write:${scope}`],
    from_agent: fromAgent,
    to_agent: toAgent,
    task_id: taskData.id,
    created_at: new Date().toISOString()
  };
}

// Type checking utilities
export function isValidChunk(chunk) {
  return chunk && 
         typeof chunk.content === 'string' && 
         chunk.metadata && 
         typeof chunk.metadata.chunk_index === 'number';
}

export function isValidMemoryEntry(entry) {
  return entry &&
         typeof entry.session_id === 'string' &&
         typeof entry.agent_id === 'string' &&
         typeof entry.scope === 'string' &&
         entry.content !== undefined;
}

// Constants for Tree Ring configuration
export const TreeRingConfig = {
  RUSH_DEFAULT_TTL: 30 * 60 * 1000, // 30 minutes
  RUSH_MAX_SIZE: 1000,
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 50,
  MIN_CHUNK_SIZE: 100,
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  TASK_SCOPE_TTL: 24 * 60 * 60 * 1000 // 24 hours
};

// Error types for Tree Ring system
export const TreeRingErrors = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_AGENT: 'INVALID_AGENT',
  INVALID_SCOPE: 'INVALID_SCOPE',
  MEMORY_NOT_FOUND: 'MEMORY_NOT_FOUND',
  HANDOFF_FAILED: 'HANDOFF_FAILED',
  CHUNK_ERROR: 'CHUNK_ERROR'
};

// Create error with type
export function createTreeRingError(type, message, details = {}) {
  const error = new Error(message);
  error.type = type;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
}
