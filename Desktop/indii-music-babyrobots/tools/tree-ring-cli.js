#!/usr/bin/env node

// Tree Ring Memory System CLI Tool
// Test and demonstrate memory operations, agent permissions, and context engineering
// Usage: node tools/tree-ring-cli.js [command] [options]

import { MemoryManager } from '../src/lib/memory/index.js';
import { getEnhancedKnowledgeForRole } from '../src/lib/knowledge-base-enhanced.js';
import { validateAgentPermission, createPermissionReport } from '../src/lib/memory/permissions.js';
import { AgentTypes, ScopeTypes } from '../src/lib/memory/types.js';

class TreeRingCLI {
  constructor() {
    this.memoryManager = new MemoryManager({
      strictPermissions: true,
      enableVectorSearch: false
    });
    this.sessionId = 'cli-session-' + Date.now();
  }

  async runCommand(command, args) {
    try {
      switch (command) {
        case 'test-permissions':
          return await this.testPermissions();
        case 'test-memory':
          return await this.testMemoryOperations(args);
        case 'demo':
          return await this.runSimpleDemo();
        default:
          return this.showHelp();
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 1;
    }
  }

  async testPermissions() {
    console.log('Testing Tree Ring Permission System...\n');
    
    const agents = ['memex', 'warp', 'jules', 'gemini-cli'];
    const scopes = ['project:test', 'implementation:feature', 'monitoring:metrics'];
    
    console.log('Agent | Scope | Read | Write');
    console.log('------|-------|------|------');
    
    for (const agent of agents) {
      for (const scope of scopes) {
        const readAllowed = await validateAgentPermission(agent, scope, 'read');
        const writeAllowed = await validateAgentPermission(agent, scope, 'write');
        const readSymbol = readAllowed ? 'Y' : 'N';
        const writeSymbol = writeAllowed ? 'Y' : 'N';
        console.log(`${agent.padEnd(6)} | ${scope.padEnd(13)} | ${readSymbol.padEnd(4)} | ${writeSymbol}`);
      }
    }
    
    console.log('\nPermission testing completed');
    return 0;
  }

  async testMemoryOperations(args) {
    console.log('Testing Tree Ring Memory Operations...\n');
    
    const agent = args.agent || 'memex';
    const scope = args.scope || 'project:test';
    
    // Test write operation
    const testData = {
      message: `Hello from ${agent}`,
      timestamp: new Date().toISOString(),
      test_data: 'Tree Ring Memory System'
    };
    
    console.log(`Writing context for agent: ${agent}, scope: ${scope}`);
    await this.memoryManager.updateContext(this.sessionId, agent, scope, testData);
    
    // Test read operation
    console.log(`Reading context for agent: ${agent}, scope: ${scope}`);
    const retrieved = await this.memoryManager.getContext(this.sessionId, agent, scope);
    console.log('Retrieved data:', JSON.stringify(retrieved, null, 2));
    
    console.log('\nMemory operations testing completed');
    return 0;
  }

  async runSimpleDemo() {
    console.log('Running Tree Ring System Demo\n');
    console.log('========================================');
    
    // Step 1: Permission testing
    console.log('\n1. Testing Permissions...');
    await this.testPermissions();
    
    // Step 2: Memory operations
    console.log('\n2. Testing Memory Operations...');
    await this.testMemoryOperations({ agent: 'memex', scope: 'project:demo' });
    
    console.log('\nDemo completed successfully!');
    return 0;
  }

  showHelp() {
    console.log('\nTree Ring Memory System CLI Tool\n');
    console.log('Commands:');
    console.log('  test-permissions              Test agent permission matrix');
    console.log('  test-memory [--agent=X]       Test memory operations');
    console.log('  demo                         Run simple demo');
    console.log('  help                         Show this help');
    
    console.log('\nExamples:');
    console.log('  node tools/tree-ring-cli.js demo');
    console.log('  node tools/tree-ring-cli.js test-memory --agent=warp');
    
    return 0;
  }

  cleanup() {
    if (this.memoryManager) {
      this.memoryManager.rush.destroy();
    }
  }
}

// CLI entry point
async function main() {
  const cli = new TreeRingCLI();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  // Parse simple arguments
  const parsedArgs = {};
  for (const arg of args.slice(1)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      parsedArgs[key] = value || true;
    }
  }
  
  let exitCode = 0;
  
  try {
    exitCode = await cli.runCommand(command, parsedArgs);
  } catch (error) {
    console.error('Unexpected error:', error);
    exitCode = 1;
  } finally {
    cli.cleanup();
  }
  
  process.exit(exitCode);
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main();
}

export { TreeRingCLI };
