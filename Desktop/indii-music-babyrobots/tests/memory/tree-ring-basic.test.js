// Tree Ring Memory System - Basic Tests
// Test agent permissions, memory operations, and context engineering
// Based on implementation plan Phase 5

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { MemoryManager } from '../../src/lib/memory/index.js';
import { validateAgentPermission } from '../../src/lib/memory/permissions.js';
import { SemanticChunker } from '../../src/lib/memory/semantic-chunker.js';
import { AgentTypes, ScopeTypes } from '../../src/lib/memory/types.js';

describe('Tree Ring Memory System - Basic Tests', () => {
  let memoryManager;
  const testSessionId = 'test-session-123';
  
  beforeEach(() => {
    // Initialize fresh memory manager for each test
    memoryManager = new MemoryManager({
      strictPermissions: true,
      enableVectorSearch: false
    });
  });
  
  afterEach(() => {
    // Cleanup memory manager
    if (memoryManager) {
      memoryManager.rush.destroy();
    }
  });

  describe('Agent Permission System', () => {
    test('Memex agent has full access to all scopes', async () => {
      const hasProjectAccess = await validateAgentPermission('memex', 'project:test', 'read');
      const hasImplementationAccess = await validateAgentPermission('memex', 'implementation:feature', 'write');
      const hasMonitoringAccess = await validateAgentPermission('memex', 'monitoring:performance', 'read');
      
      expect(hasProjectAccess).toBe(true);
      expect(hasImplementationAccess).toBe(true);
      expect(hasMonitoringAccess).toBe(true);
    });

    test('Warp agent has implementation-focused access', async () => {
      const hasTaskAccess = await validateAgentPermission('warp', 'task:123', 'write');
      const hasImplementationAccess = await validateAgentPermission('warp', 'implementation:feature', 'read');
      const hasMonitoringAccess = await validateAgentPermission('warp', 'monitoring:performance', 'read');
      const hasProjectAccess = await validateAgentPermission('warp', 'project:test', 'write');
      
      expect(hasTaskAccess).toBe(true);
      expect(hasImplementationAccess).toBe(true);
      expect(hasMonitoringAccess).toBe(true);
      expect(hasProjectAccess).toBe(true);
    });

    test('Jules agent has debugging-focused access with write permissions', async () => {
      const hasMonitoringRead = await validateAgentPermission('jules', 'monitoring:metrics', 'read');
      const hasMonitoringWrite = await validateAgentPermission('jules', 'monitoring:metrics', 'write');
      const hasDebuggingAccess = await validateAgentPermission('jules', 'debugging:session', 'write');
      const hasTestingAccess = await validateAgentPermission('jules', 'testing:unit', 'write');
      const hasTaskAccess = await validateAgentPermission('jules', 'task:123', 'read');
      const hasImplementationAccess = await validateAgentPermission('jules', 'implementation:feature', 'read');
      
      expect(hasMonitoringRead).toBe(true);
      expect(hasMonitoringWrite).toBe(true);
      expect(hasDebuggingAccess).toBe(true);
      expect(hasTestingAccess).toBe(true);
      expect(hasTaskAccess).toBe(false);
      expect(hasImplementationAccess).toBe(false);
    });

    test('Unknown agent is denied access', async () => {
      const hasAccess = await validateAgentPermission('unknown-agent', 'project:test', 'read');
      expect(hasAccess).toBe(false);
    });
  });

  describe('Rush Memory Operations', () => {
    test('Can store and retrieve context in rush memory', async () => {
      const testData = { message: 'Hello from memex', timestamp: Date.now() };
      
      await memoryManager.updateContext(testSessionId, 'memex', 'project:test', testData);
      const retrieved = await memoryManager.getContext(testSessionId, 'memex', 'project:test');
      
      expect(retrieved).toEqual(testData);
    });

    test('Rush memory respects TTL expiration', async () => {
      const testData = { message: 'This should expire' };
      
      // Set with very short TTL (100ms)
      await memoryManager.rush.set(testSessionId, 'memex', 'project:test', testData, 100);
      
      // Should exist immediately
      const immediate = await memoryManager.rush.get(testSessionId, 'memex', 'project:test');
      expect(immediate).toEqual(testData);
      
      // Should expire after TTL
      await new Promise(resolve => setTimeout(resolve, 150));
      const expired = await memoryManager.rush.get(testSessionId, 'memex', 'project:test');
      expect(expired).toBeNull();
    });

    test('Rush memory enforces agent permissions', async () => {
      const testData = { restricted: 'data' };
      
      // Test with gemini-cli trying to access implementation scope (should fail)
      await expect(
        memoryManager.updateContext(testSessionId, 'gemini-cli', 'implementation:feature', testData)
      ).rejects.toThrow('cannot write to scope');
    });
  });

  describe('Semantic Chunking', () => {
    let chunker;
    
    beforeEach(() => {
      chunker = new SemanticChunker({
        chunkSize: 100,
        overlap: 20
      });
    });

    test('Chunks text correctly with specified size and overlap', async () => {
      const longText = 'This is a long piece of text that should be chunked into smaller pieces. ' +
                      'Each chunk should be approximately 100 characters long with some overlap. ' +
                      'This helps maintain semantic coherence across chunk boundaries.';
      
      const chunks = await chunker.chunkText(longText, { test: true });
      
      expect(chunks).toHaveLength(3); // Expecting ~3 chunks for this text
      expect(chunks[0].metadata.chunk_index).toBe(0);
      expect(chunks[0].metadata.is_first).toBe(true);
      expect(chunks[chunks.length - 1].metadata.is_last).toBe(true);
    });

    test('Chunk metadata includes required fields', async () => {
      const text = 'Simple test text for chunking.';
      const chunks = await chunker.chunkText(text, { agent: 'memex', scope: 'test' });
      
      expect(chunks[0].metadata).toHaveProperty('agent', 'memex');
      expect(chunks[0].metadata).toHaveProperty('scope', 'test');
      expect(chunks[0].metadata).toHaveProperty('chunk_index');
      expect(chunks[0].metadata).toHaveProperty('word_count');
      expect(chunks[0].metadata).toHaveProperty('created_at');
    });

    test('Handles empty or invalid input gracefully', async () => {
      const emptyChunks = await chunker.chunkText('', {});
      const nullChunks = await chunker.chunkText(null, {});
      
      expect(emptyChunks).toEqual([]);
      expect(nullChunks).toEqual([]);
    });
  });

  describe('Context Handoff Protocol', () => {
    test('Memex can seed context for all scopes', async () => {
      const seedData = {
        goals: ['Improve user experience'],
        requirements: ['Fast performance', 'Secure authentication'],
        architecture: ['Microservices', 'API-first design'],
        technical_details: { stack: 'Node.js, React, PostgreSQL' },
        experiments: ['A/B testing', 'Feature flags'],
        poc: ['User interface mockups']
      };
      
      const results = await memoryManager.seedContext(testSessionId, 'memex', seedData);
      
      expect(results).toHaveProperty('project');
      expect(results).toHaveProperty('implementation');
      expect(results).toHaveProperty('monitoring');
      expect(results).toHaveProperty('prototype');
    });

    test('Non-memex agents cannot seed context', async () => {
      const seedData = { test: 'data' };
      
      await expect(
        memoryManager.seedContext(testSessionId, 'warp', seedData)
      ).rejects.toThrow('Only Memex agent can seed context');
    });
  });

  describe('Cross-agent Memory Access', () => {
    test('Agents can access appropriate shared context', async () => {
      // Memex seeds project context
      await memoryManager.updateContext(
        testSessionId, 
        'memex', 
        'project:shared', 
        { projectGoal: 'Build amazing music platform' },
        { persistent: true }
      );
      
      // Warp should be able to read project context
      const context = await memoryManager.getContext(testSessionId, 'warp', 'project:shared');
      expect(context).toHaveProperty('projectGoal');
    });

    test('Memory isolation between different scopes', async () => {
      // Store data in different scopes
      await memoryManager.updateContext(testSessionId, 'memex', 'project:alpha', { data: 'alpha' });
      await memoryManager.updateContext(testSessionId, 'memex', 'project:beta', { data: 'beta' });
      
      // Verify isolation
      const alphaData = await memoryManager.getContext(testSessionId, 'memex', 'project:alpha');
      const betaData = await memoryManager.getContext(testSessionId, 'memex', 'project:beta');
      
      expect(alphaData.data).toBe('alpha');
      expect(betaData.data).toBe('beta');
    });
  });

  describe('Memory Statistics and Health', () => {
    test('Memory statistics are accurate', async () => {
      // Add some test data
      await memoryManager.updateContext(testSessionId, 'memex', 'project:test1', { data: 'test1' });
      await memoryManager.updateContext(testSessionId, 'memex', 'project:test2', { data: 'test2' });
      
      const stats = await memoryManager.getStats();
      
      expect(stats).toHaveProperty('rush');
      expect(stats).toHaveProperty('crash');
      expect(stats.rush.count).toBeGreaterThanOrEqual(2);
    });

    test('Memory cleanup removes expired entries', async () => {
      // Add entry with short TTL
      await memoryManager.rush.set(testSessionId, 'memex', 'temp:test', { temp: true }, 50);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Cleanup should remove expired entries
      const cleanedUp = await memoryManager.rush.cleanup();
      expect(cleanedUp).toBeGreaterThanOrEqual(1);
    });
  });
});
