# 🧠 Context Engineering Implementation Plan for Indii Music

## 📋 Overview

This plan outlines the implementation of context engineering principles from `docs/context_engineering.md` and memory infrastructure from `docs/memory_infra.md` into the existing Indii Music platform. The focus is on updating session context handling, ensuring compliance with context rules, and implementing consistent data handling across components.

## 🎯 Objectives

1. **Update session context handling** to include role-specific knowledge access
2. **Ensure compliance** with context rules in knowledge retrieval functions
3. **Utilize context engineering** and memory infrastructure documents for consistent data handling
4. **Implement memory architecture** with Rush + Crash system
5. **Add agent-scoped memory access** with proper permissions

## 📊 Current State Analysis

### Existing Components
- ✅ Basic session context API at `pages/api/ai/session/[sessionId]/context.js`
- ✅ Knowledge base system in `src/lib/knowledge-base.js` with `getKnowledgeForRole()`
- ✅ AI agent components in UI layer
- ✅ Agent definitions in `.ai_rules/agents/`
- ✅ Documentation: `docs/context_engineering.md` and `docs/memory_infra.md`

### Gaps Identified
- ❌ No role-based memory access control
- ❌ Missing Rush + Crash memory system
- ❌ No semantic chunking implementation
- ❌ Limited context scoping by agent type
- ❌ No memory write guards or permissions
- ❌ Missing RAG integration for knowledge retrieval

## 🏗️ Implementation Phases

### Phase 1: Core Memory Infrastructure (Week 1-2)

#### 1.1 Create Memory Management System
```
src/lib/memory/
├── index.js                 # Main memory manager
├── rush-memory.js          # Short-term memory (Redis/in-memory)
├── crash-memory.js         # Persistent memory (Database)
├── semantic-chunker.js     # Document chunking service
├── permissions.js          # Memory access control
└── types.js               # TypeScript definitions
```

#### 1.2 Database Schema Updates
```sql
-- Memory tables
CREATE TABLE memory_entries (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  agent_id TEXT,
  scope TEXT,
  access_level TEXT,
  content_type TEXT,
  content TEXT,
  metadata JSON,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_crash BOOLEAN DEFAULT FALSE
);

CREATE TABLE agent_permissions (
  id INTEGER PRIMARY KEY,
  agent_id TEXT,
  scope_pattern TEXT,
  read_access BOOLEAN,
  write_access BOOLEAN,
  created_at TIMESTAMP
);
```

#### 1.3 Agent Permission Matrix
```javascript
const AGENT_PERMISSIONS = {
  'memex': {
    memory_access: 'full',
    scopes: ['*'],
    can_seed_context: true
  },
  'warp': {
    memory_access: 'task-scoped',
    scopes: ['project:*', 'implementation:*'],
    can_seed_context: false
  },
  'jules': {
    memory_access: 'background',
    scopes: ['monitoring:*', 'optimization:*'],
    can_seed_context: false
  },
  'gemini-cli': {
    memory_access: 'experimental',
    scopes: ['prototype:*', 'experiment:*'],
    can_seed_context: false
  }
};
```

### Phase 2: Enhanced Session Context API (Week 2-3)

#### 2.1 Update Session Context Handler
```javascript
// pages/api/ai/session/[sessionId]/context.js - Enhanced version
export default async function handler(req, res) {
  const { sessionId } = req.query;
  const { agentId, contextData, scope, operation } = req.body;

  // Validate agent permissions
  const hasPermission = await validateAgentPermission(agentId, scope, operation);
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Route to appropriate memory system
  if (operation === 'read') {
    const context = await getContextForAgent(sessionId, agentId, scope);
    return res.json({ context });
  }
  
  if (operation === 'write') {
    await writeContextWithGuards(sessionId, agentId, scope, contextData);
    return res.json({ success: true });
  }
}
```

#### 2.2 Role-Specific Knowledge Access
```javascript
// src/lib/knowledge-enhanced.js
export const getKnowledgeForAgentRole = async (roleId, agentId, sessionId, scope) => {
  // Get base knowledge
  const baseKnowledge = getKnowledgeForRole(roleId);
  
  // Get agent-specific context
  const agentContext = await getMemoryForAgent(agentId, sessionId, scope);
  
  // Apply semantic chunking if needed
  const chunkedContext = await semanticChunk(agentContext, {
    chunkSize: 500,
    overlap: 50,
    metadata: { agent: agentId, scope }
  });
  
  // Combine and scope knowledge
  return {
    ...baseKnowledge,
    context: chunkedContext,
    permissions: await getAgentPermissions(agentId),
    scope: scope
  };
};
```

### Phase 3: Memory Systems Implementation (Week 3-4)

#### 3.1 Rush Memory (Short-term)
```javascript
// src/lib/memory/rush-memory.js
class RushMemory {
  constructor() {
    this.cache = new Map();
    this.ttl = 30 * 60 * 1000; // 30 minutes
  }

  async set(sessionId, agentId, scope, data, ttl = this.ttl) {
    const key = `${sessionId}:${agentId}:${scope}`;
    const entry = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
      metadata: { agent: agentId, scope }
    };
    
    this.cache.set(key, entry);
    
    // Schedule cleanup
    setTimeout(() => this.cleanup(key), ttl);
    
    return entry;
  }

  async get(sessionId, agentId, scope) {
    const key = `${sessionId}:${agentId}:${scope}`;
    const entry = this.cache.get(key);
    
    if (!entry || entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
}
```

#### 3.2 Crash Memory (Persistent)
```javascript
// src/lib/memory/crash-memory.js
class CrashMemory {
  async save(sessionId, agentId, scope, data, metadata = {}) {
    return await db.run(`
      INSERT INTO memory_entries 
      (session_id, agent_id, scope, content, metadata, is_crash, created_at)
      VALUES (?, ?, ?, ?, ?, TRUE, datetime('now'))
    `, [sessionId, agentId, scope, JSON.stringify(data), JSON.stringify(metadata)]);
  }

  async retrieve(sessionId, agentId, scope, limit = 10) {
    return await db.all(`
      SELECT * FROM memory_entries 
      WHERE session_id = ? AND agent_id = ? AND scope LIKE ? AND is_crash = TRUE
      ORDER BY created_at DESC LIMIT ?
    `, [sessionId, agentId, `${scope}%`, limit]);
  }

  async search(query, sessionId, agentId, scope) {
    // Implement semantic search using embeddings
    const embedding = await generateEmbedding(query);
    // Vector similarity search logic here
  }
}
```

#### 3.3 Semantic Chunking Service
```javascript
// src/lib/memory/semantic-chunker.js
export class SemanticChunker {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 500;
    this.overlap = options.overlap || 50;
  }

  async chunkText(text, metadata = {}) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      const chunk = text.slice(start, end);
      
      chunks.push({
        content: chunk,
        metadata: {
          ...metadata,
          chunk_index: chunks.length,
          start_pos: start,
          end_pos: end
        },
        embedding: await this.generateEmbedding(chunk)
      });
      
      start = end - this.overlap;
    }
    
    return chunks;
  }

  async generateEmbedding(text) {
    // Integrate with OpenAI embeddings or similar
    // This would use the embedding model specified in memory_infra.md
  }
}
```

### Phase 4: Agent Integration (Week 4-5)

#### 4.1 Update Agent Context Interfaces
```javascript
// src/lib/agents/base-agent.js
export class BaseAgent {
  constructor(agentId, permissions) {
    this.agentId = agentId;
    this.permissions = permissions;
    this.memory = new MemoryManager(agentId);
  }

  async getContext(sessionId, scope) {
    // Check permissions first
    if (!this.canReadScope(scope)) {
      throw new Error(`Agent ${this.agentId} cannot read scope: ${scope}`);
    }
    
    // Get rush memory first (faster)
    let context = await this.memory.rush.get(sessionId, this.agentId, scope);
    
    if (!context) {
      // Fallback to crash memory
      context = await this.memory.crash.retrieve(sessionId, this.agentId, scope);
    }
    
    return context;
  }

  async updateContext(sessionId, scope, data, persistent = false) {
    if (!this.canWriteScope(scope)) {
      throw new Error(`Agent ${this.agentId} cannot write to scope: ${scope}`);
    }
    
    // Always update rush memory
    await this.memory.rush.set(sessionId, this.agentId, scope, data);
    
    // Optionally persist to crash memory
    if (persistent) {
      await this.memory.crash.save(sessionId, this.agentId, scope, data);
    }
  }
}
```

#### 4.2 Memex Agent Enhancement
```javascript
// src/lib/agents/memex-agent.js
export class MemexAgent extends BaseAgent {
  constructor() {
    super('memex', AGENT_PERMISSIONS.memex);
  }

  async seedContext(sessionId, initialData) {
    // Memex can seed context for all scopes
    const scopes = ['project', 'implementation', 'monitoring', 'prototype'];
    
    for (const scope of scopes) {
      const scopedData = this.extractScopeData(initialData, scope);
      if (scopedData) {
        await this.updateContext(sessionId, scope, scopedData, true);
      }
    }
  }

  async delegateTask(taskData, targetAgent, sessionId) {
    // Create scoped context for target agent
    const scope = `task:${taskData.id}`;
    await this.updateContext(sessionId, scope, {
      task: taskData,
      delegated_to: targetAgent,
      delegated_at: new Date().toISOString(),
      access_permissions: this.generatePermissions(targetAgent, taskData)
    }, true);
    
    return scope;
  }
}
```

### Phase 5: Integration and Testing (Week 5-6)

#### 5.1 Update Knowledge Base Integration
```javascript
// src/lib/knowledge-base-enhanced.js
export const getEnhancedKnowledgeForRole = async (roleId, context = {}) => {
  const { agentId, sessionId, scope } = context;
  
  // Get base knowledge
  const baseKnowledge = KNOWLEDGE_BASE[roleId] || {};
  
  // Get contextual memory if agent context provided
  let contextualMemory = {};
  if (agentId && sessionId) {
    const agent = createAgent(agentId);
    contextualMemory = await agent.getContext(sessionId, scope || 'general');
  }
  
  // Apply semantic enhancement
  const enhancedKnowledge = await enhanceWithSemanticContext(
    baseKnowledge,
    contextualMemory,
    { roleId, agentId, scope }
  );
  
  return {
    ...enhancedKnowledge,
    context_metadata: {
      generated_at: new Date().toISOString(),
      agent_id: agentId,
      session_id: sessionId,
      scope: scope,
      has_context: !!contextualMemory
    }
  };
};
```

#### 5.2 Testing Strategy
```javascript
// tests/memory/context-engineering.test.js
describe('Context Engineering Implementation', () => {
  test('agent permissions are enforced', async () => {
    const warpAgent = new WarpAgent();
    
    // Should fail - Warp cannot access Memex scope
    await expect(
      warpAgent.getContext('session1', 'memex:architecture')
    ).rejects.toThrow('cannot read scope');
  });

  test('memory chunking works correctly', async () => {
    const chunker = new SemanticChunker({ chunkSize: 100, overlap: 20 });
    const chunks = await chunker.chunkText('long text...', { test: true });
    
    expect(chunks).toHaveLength(expectedChunks);
    expect(chunks[0].metadata.chunk_index).toBe(0);
  });

  test('rush memory expires correctly', async () => {
    const rushMemory = new RushMemory();
    await rushMemory.set('session1', 'test-agent', 'test-scope', 'data', 100);
    
    // Should exist immediately
    expect(await rushMemory.get('session1', 'test-agent', 'test-scope')).toBe('data');
    
    // Should expire after TTL
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(await rushMemory.get('session1', 'test-agent', 'test-scope')).toBeNull();
  });
});
```

## 📈 Success Metrics

### Technical Metrics
- ✅ All agent memory access requests properly validated
- ✅ Memory chunking maintains semantic coherence
- ✅ Rush memory TTL working correctly
- ✅ Crash memory persistence and retrieval functional
- ✅ Zero unauthorized scope access attempts succeed

### Performance Metrics
- 🎯 Context retrieval time < 100ms (rush memory)
- 🎯 Context retrieval time < 500ms (crash memory)
- 🎯 Memory utilization stays within bounds
- 🎯 Agent task delegation latency < 200ms

### User Experience Metrics
- 🎯 Agent responses include relevant context
- 🎯 No context leakage between unauthorized scopes
- 🎯 Consistent knowledge quality across sessions

## 🔧 Configuration Updates

### Environment Variables
```bash
# Memory Configuration
MEMORY_RUSH_TTL=1800000  # 30 minutes in ms
MEMORY_CHUNK_SIZE=500
MEMORY_CHUNK_OVERLAP=50
ENABLE_SEMANTIC_SEARCH=true

# Agent Permissions
AGENT_PERMISSION_STRICT_MODE=true
MEMEX_FULL_ACCESS=true

# Vector Database (if using external)
VECTOR_DB_URL=http://localhost:8080
EMBEDDINGS_MODEL=text-embedding-3-small
```

### Database Migrations
```sql
-- Add indexes for performance
CREATE INDEX idx_memory_session_agent ON memory_entries(session_id, agent_id);
CREATE INDEX idx_memory_scope ON memory_entries(scope);
CREATE INDEX idx_memory_created_at ON memory_entries(created_at);
CREATE INDEX idx_agent_permissions_scope ON agent_permissions(scope_pattern);
```

## 🚀 Deployment Strategy

1. **Development Environment**: Implement and test all components
2. **Staging Validation**: Verify memory persistence and agent interactions
3. **Gradual Rollout**: Enable for limited agent types first
4. **Full Production**: Deploy with monitoring and rollback capability

## 📝 Documentation Updates

- Update API documentation for new context endpoints
- Create agent integration guides
- Document memory scoping patterns
- Add troubleshooting guides for memory issues

---

This implementation plan transforms the Indii Music platform to fully utilize context engineering principles while maintaining backward compatibility and ensuring secure, scoped memory access for all AI agents.
