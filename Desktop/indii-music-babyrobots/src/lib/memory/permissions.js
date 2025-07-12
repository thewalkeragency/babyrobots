// Permissions - Tree Ring Mid Layer
// Agent access control and memory permissions
// Based on docs/context_engineering.md - Agent Context Rules

// Agent Permission Matrix from context engineering documentation
export const AGENT_PERMISSIONS = {
  'memex': {
    name: 'Memex (Architect)',
    memory_access: 'full',
    scopes: ['*'],
    can_seed_context: true,
    read_access: true,
    write_access: true,
    description: 'Full memory access, responsible for context seeding'
  },
  'warp': {
    name: 'Warp 2.0 (Engineer)', 
    memory_access: 'implementation-focused',
    scopes: ['project:*', 'implementation:*', 'task:*', 'monitoring:*'],
    can_seed_context: false,
    read_access: true,
    write_access: true,
    description: 'Primary implementation agent with broad project access including monitoring'
  },
  'jules': {
    name: 'Google Jules (Testing & Debug)',
    memory_access: 'debugging-focused',
    scopes: ['monitoring:*', 'optimization:*', 'metrics:*', 'debugging:*', 'testing:*', 'project:*'],
    can_seed_context: false,
    read_access: true,
    write_access: true,
    description: 'Testing, debugging, and repository analysis with full project read access for context'
  },
  'gemini-cli': {
    name: 'Gemini CLI (Local Tools)',
    memory_access: 'local-repository',
    scopes: ['prototype:*', 'experiment:*', 'poc:*', 'local:*', 'tools:*', 'project:*'],
    can_seed_context: false,
    read_access: true,
    write_access: true,
    description: 'Local repository tools, prototyping, and alternative perspectives with project context access'
  }
};

// Scope hierarchy for Tree Ring access control
export const SCOPE_HIERARCHY = {
  'project': {
    level: 1,
    description: 'High-level project information',
    child_scopes: ['implementation', 'monitoring', 'prototype', 'debugging', 'testing']
  },
  'implementation': {
    level: 2,
    description: 'Code and technical implementation details',
    parent_scope: 'project'
  },
  'monitoring': {
    level: 2,
    description: 'Performance monitoring and optimization',
    parent_scope: 'project'
  },
  'prototype': {
    level: 2,
    description: 'Experimental and prototype work',
    parent_scope: 'project'
  },
  'debugging': {
    level: 2,
    description: 'Debug sessions and troubleshooting context',
    parent_scope: 'project'
  },
  'testing': {
    level: 2,
    description: 'Test execution and validation context',
    parent_scope: 'project'
  },
  'local': {
    level: 2,
    description: 'Local repository and tool-specific context',
    parent_scope: 'project'
  },
  'tools': {
    level: 3,
    description: 'Tool-specific memory and configuration',
    can_delegate: false
  },
  'task': {
    level: 3,
    description: 'Individual task contexts',
    can_delegate: true
  }
};

// Validate agent permission for scope and operation
export async function validateAgentPermission(agentId, scope, operation = 'read') {
  try {
    const agent = AGENT_PERMISSIONS[agentId];
    
    if (!agent) {
      console.warn(`Unknown agent: ${agentId}`);
      return false;
    }

    // Check operation permission
    if (operation === 'read' && !agent.read_access) {
      return false;
    }
    
    if (operation === 'write' && !agent.write_access) {
      return false;
    }

    // Check scope permission
    return checkScopePermission(agent, scope);
    
  } catch (error) {
    console.error('Error validating agent permission:', error);
    return false;
  }
}

// Check if agent has permission for specific scope
function checkScopePermission(agent, scope) {
  // Full access agents (memex) can access everything
  if (agent.scopes.includes('*')) {
    return true;
  }

  // Check exact scope matches
  if (agent.scopes.includes(scope)) {
    return true;
  }

  // Check wildcard patterns
  for (const allowedScope of agent.scopes) {
    if (allowedScope.endsWith('*')) {
      const prefix = allowedScope.slice(0, -1);
      if (scope.startsWith(prefix)) {
        return true;
      }
    }
  }

  // Check hierarchical access
  return checkHierarchicalAccess(agent, scope);
}

// Check hierarchical scope access
function checkHierarchicalAccess(agent, scope) {
  const scopeParts = scope.split(':');
  const mainScope = scopeParts[0];
  
  // Check if agent has access to parent scope
  const scopeInfo = SCOPE_HIERARCHY[mainScope];
  if (scopeInfo && scopeInfo.parent_scope) {
    return checkScopePermission(agent, scopeInfo.parent_scope);
  }
  
  return false;
}

// Get agent permissions object
export function getAgentPermissions(agentId) {
  return AGENT_PERMISSIONS[agentId] || null;
}

// Get all agents that have access to a scope
export function getAgentsWithScopeAccess(scope, operation = 'read') {
  const agents = [];
  
  for (const [agentId, agent] of Object.entries(AGENT_PERMISSIONS)) {
    // Check operation permission
    if (operation === 'read' && !agent.read_access) continue;
    if (operation === 'write' && !agent.write_access) continue;
    
    // Check scope permission
    if (checkScopePermission(agent, scope)) {
      agents.push(agentId);
    }
  }
  
  return agents;
}

// Check if agent can delegate task to another agent
export function canDelegateTask(fromAgentId, toAgentId, scope) {
  const fromAgent = AGENT_PERMISSIONS[fromAgentId];
  const toAgent = AGENT_PERMISSIONS[toAgentId];
  
  if (!fromAgent || !toAgent) {
    return false;
  }

  // Only memex can delegate to any agent
  if (fromAgentId === 'memex') {
    return true;
  }

  // Agents can delegate within their scope hierarchy
  const scopeParts = scope.split(':');
  const mainScope = scopeParts[0];
  
  // Check if both agents have access to the scope
  return checkScopePermission(fromAgent, scope) && 
         checkScopePermission(toAgent, scope);
}

// Create task-specific scope for delegation
export function createTaskScope(taskId, parentScope = 'task', delegatingAgent = 'memex') {
  const taskScope = `${parentScope}:${taskId}`;
  
  // Generate temporary permissions for task delegation
  return {
    scope: taskScope,
    created_by: delegatingAgent,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    access_level: 'task-specific'
  };
}

// Validate context handoff protocol from docs/context_engineering.md
export function validateContextHandoff(fromAgent, toAgent, context) {
  const requiredFields = [
    'previous_memory_state_summary',
    'current_task_scope_and_limitations', 
    'expected_output_format_and_validation_criteria',
    'access_permissions_for_memory_reads_writes'
  ];

  // Check if all required handoff fields are present
  for (const field of requiredFields) {
    if (!context.hasOwnProperty(field)) {
      throw new Error(`Missing required handoff field: ${field}`);
    }
  }

  // Validate agent permissions for handoff
  const fromAgentPerms = getAgentPermissions(fromAgent);
  const toAgentPerms = getAgentPermissions(toAgent);
  
  if (!fromAgentPerms || !toAgentPerms) {
    throw new Error('Invalid agent in handoff');
  }

  // Only memex or agents with task delegation scope can initiate handoffs
  if (fromAgent !== 'memex' && !context.access_permissions_for_memory_reads_writes.includes('delegate')) {
    throw new Error(`Agent ${fromAgent} cannot initiate context handoff`);
  }

  return true;
}

// Get memory access level for agent and scope
export function getMemoryAccessLevel(agentId, scope) {
  const agent = AGENT_PERMISSIONS[agentId];
  
  if (!agent) {
    return 'none';
  }

  if (!checkScopePermission(agent, scope)) {
    return 'none';
  }

  // Return access level based on agent type and scope
  switch (agent.memory_access) {
    case 'full':
      return 'full';
    case 'implementation-focused':
      // Warp has full access to project, implementation, task, and monitoring scopes
      return ['project:', 'implementation:', 'task:', 'monitoring:'].some(prefix => scope.startsWith(prefix)) ? 'full' : 'read-only';
    case 'debugging-focused':
      // Jules has full access to debugging, testing, monitoring, and project scopes
      return ['debugging:', 'testing:', 'monitoring:', 'project:', 'optimization:', 'metrics:'].some(prefix => scope.startsWith(prefix)) ? 'full' : 'read-only';
    case 'local-repository':
      // Gemini CLI has full access to local, tools, prototype, and project scopes
      return ['local:', 'tools:', 'prototype:', 'experiment:', 'poc:', 'project:'].some(prefix => scope.startsWith(prefix)) ? 'full' : 'read-only';
    case 'task-scoped':
      return scope.startsWith('task:') ? 'full' : 'read-only';
    case 'background':
      return 'read-only';
    case 'experimental':
      return scope.startsWith('prototype:') ? 'full' : 'read-only';
    default:
      return 'read-only';
  }
}

// Create agent permission report
export function createPermissionReport(agentId) {
  const agent = AGENT_PERMISSIONS[agentId];
  
  if (!agent) {
    return null;
  }

  return {
    agent_id: agentId,
    agent_name: agent.name,
    memory_access_type: agent.memory_access,
    allowed_scopes: agent.scopes,
    can_read: agent.read_access,
    can_write: agent.write_access,
    can_seed_context: agent.can_seed_context,
    description: agent.description,
    generated_at: new Date().toISOString()
  };
}

// Initialize database for dynamic permissions (future extension)
export function initializePermissionsDB() {
  // Placeholder for database initialization
  // Could be extended to store dynamic, session-specific permissions
  console.log('Permissions system initialized with static configuration');
  return true;
}

// Export permission constants for external use
export { AGENT_PERMISSIONS as PERMISSIONS };
