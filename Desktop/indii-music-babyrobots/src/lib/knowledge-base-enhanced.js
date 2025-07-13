// Enhanced Knowledge Base - Tree Ring Integration
// Role-specific knowledge access with context engineering
// Based on docs/context_engineering.md and existing knowledge-base.js

import { KNOWLEDGE_BASE, getKnowledgeForRole } from './knowledge-base.js';
import { getMemoryManager } from './memory/index.js';
import { getAgentPermissions } from './memory/permissions.js';
import { AgentTypes, ScopeTypes } from './memory/types.js';

// Enhanced knowledge retrieval with agent context
export const getEnhancedKnowledgeForRole = async (roleId, context = {}) => {
  const { agentId, sessionId, scope = 'general' } = context;
  
  // Get base knowledge from existing system
  const baseKnowledge = getKnowledgeForRole(roleId) || {};
  
  // If no agent context provided, return base knowledge
  if (!agentId || !sessionId) {
    return {
      ...baseKnowledge,
      context_metadata: {
        generated_at: new Date().toISOString(),
        has_context: false,
        source: 'base_knowledge_only'
      }
    };
  }

  try {
    // Get memory manager instance
    const memoryManager = getMemoryManager();
    
    // Get contextual memory from Tree Ring system
    let contextualMemory = {};
    try {
      contextualMemory = await memoryManager.getContext(sessionId, agentId, scope);
    } catch (error) {
      console.warn(`Could not retrieve context for agent ${agentId}:`, error.message);
      contextualMemory = {};
    }
    
    // Apply semantic enhancement based on agent role and memory
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
        has_context: !!contextualMemory && Object.keys(contextualMemory).length > 0,
        agent_permissions: getAgentPermissions(agentId),
        source: 'enhanced_with_memory'
      }
    };
    
  } catch (error) {
    console.error('Error in enhanced knowledge retrieval:', error);
    
    // Fallback to base knowledge
    return {
      ...baseKnowledge,
      context_metadata: {
        generated_at: new Date().toISOString(),
        has_context: false,
        error: error.message,
        source: 'fallback_base_knowledge'
      }
    };
  }
};

// Semantic enhancement based on agent context and memory
async function enhanceWithSemanticContext(baseKnowledge, contextualMemory, metadata) {
  const { roleId, agentId, scope } = metadata;
  
  // Agent-specific knowledge enhancement rules
  const enhancementRules = getAgentEnhancementRules(agentId);
  
  // Apply enhancements based on agent type
  let enhanced = { ...baseKnowledge };
  
  // Add context-specific information
  if (contextualMemory && Object.keys(contextualMemory).length > 0) {
    enhanced = await applyContextualEnhancements(enhanced, contextualMemory, enhancementRules);
  }
  
  // Add agent-specific guidance
  enhanced = addAgentSpecificGuidance(enhanced, agentId, roleId);
  
  // Add scope-specific filters
  enhanced = applyScopeFilters(enhanced, scope);
  
  return enhanced;
}

// Get agent-specific enhancement rules
function getAgentEnhancementRules(agentId) {
  const rules = {
    [AgentTypes.MEMEX]: {
      focus: ['architecture', 'planning', 'high_level_design'],
      enhance_sections: ['platform', 'general'],
      add_context: ['project_scope', 'technical_requirements'],
      priority: 'strategic'
    },
    [AgentTypes.WARP]: {
      focus: ['implementation', 'technical_details', 'code_examples'],
      enhance_sections: ['artist', 'marketplace', 'technical'],
      add_context: ['task_specific', 'implementation_details'],
      priority: 'tactical'
    },
    [AgentTypes.JULES]: {
      focus: ['automation', 'monitoring', 'optimization'],
      enhance_sections: ['general', 'platform'],
      add_context: ['performance_metrics', 'system_health'],
      priority: 'operational'
    },
    [AgentTypes.GEMINI_CLI]: {
      focus: ['prototyping', 'experimentation', 'rapid_iteration'],
      enhance_sections: ['artist', 'fan', 'general'],
      add_context: ['prototype_feedback', 'experimental_features'],
      priority: 'experimental'
    }
  };
  
  return rules[agentId] || rules[AgentTypes.MEMEX]; // Default to Memex rules
}

// Apply contextual enhancements from memory
async function applyContextualEnhancements(knowledge, contextualMemory, rules) {
  const enhanced = { ...knowledge };
  
  // Add memory-based context to relevant sections
  for (const section of rules.enhance_sections) {
    if (enhanced[section]) {
      enhanced[section] = {
        ...enhanced[section],
        contextual_additions: extractRelevantContext(contextualMemory, section, rules.focus)
      };
    }
  }
  
  // Add dynamic context section
  enhanced.dynamic_context = {
    from_memory: contextualMemory,
    enhancement_rules: rules,
    last_updated: new Date().toISOString()
  };
  
  return enhanced;
}

// Extract relevant context based on focus areas
function extractRelevantContext(memory, section, focusAreas) {
  if (!memory || typeof memory !== 'object') {
    return [];
  }
  
  const relevant = [];
  
  // Look for focus area keywords in memory content
  const memoryText = JSON.stringify(memory).toLowerCase();
  
  for (const focus of focusAreas) {
    if (memoryText.includes(focus.toLowerCase())) {
      relevant.push({
        focus_area: focus,
        section: section,
        relevance_score: calculateRelevanceScore(memoryText, focus),
        extracted_at: new Date().toISOString()
      });
    }
  }
  
  return relevant;
}

// Add agent-specific guidance
function addAgentSpecificGuidance(knowledge, agentId, roleId) {
  const enhanced = { ...knowledge };
  
  // Agent-specific guidance based on context engineering rules
  const guidance = {
    [AgentTypes.MEMEX]: {
      approach: 'Take a high-level, architectural view. Focus on system design and integration.',
      responsibilities: ['Context seeding', 'Task delegation', 'Architecture decisions'],
      memory_access: 'Full access to all scopes'
    },
    [AgentTypes.WARP]: {
      approach: 'Focus on implementation details and technical execution.',
      responsibilities: ['Code implementation', 'Technical problem solving', 'Task execution'],
      memory_access: 'Task-scoped access for implementation context'
    },
    [AgentTypes.JULES]: {
      approach: 'Monitor performance and optimize systems. Focus on operational excellence.',
      responsibilities: ['Performance monitoring', 'System optimization', 'Automation'],
      memory_access: 'Background monitoring and metrics access'
    },
    [AgentTypes.GEMINI_CLI]: {
      approach: 'Rapid prototyping and experimentation. Focus on quick iterations.',
      responsibilities: ['Prototype development', 'Experimental features', 'Rapid testing'],
      memory_access: 'Experimental memory buckets for iteration'
    }
  };
  
  enhanced.agent_guidance = guidance[agentId] || guidance[AgentTypes.MEMEX];
  
  return enhanced;
}

// Apply scope-specific filters
function applyScopeFilters(knowledge, scope) {
  const enhanced = { ...knowledge };
  
  // Scope-specific filtering rules
  const scopeFilters = {
    [ScopeTypes.PROJECT]: ['platform', 'general'],
    [ScopeTypes.IMPLEMENTATION]: ['artist', 'marketplace', 'legal'],
    [ScopeTypes.MONITORING]: ['general', 'platform'],
    [ScopeTypes.PROTOTYPE]: ['artist', 'fan', 'marketplace'],
    [ScopeTypes.TASK]: ['artist', 'marketplace', 'licensing', 'legal']
  };
  
  const allowedSections = scopeFilters[scope] || Object.keys(knowledge);
  
  // Filter knowledge to scope-relevant sections
  const filtered = {};
  for (const section of allowedSections) {
    if (enhanced[section]) {
      filtered[section] = enhanced[section];
    }
  }
  
  // Always include agent guidance and metadata
  filtered.agent_guidance = enhanced.agent_guidance;
  filtered.dynamic_context = enhanced.dynamic_context;
  filtered.scope_filter = {
    applied_scope: scope,
    allowed_sections: allowedSections,
    filtered_at: new Date().toISOString()
  };
  
  return filtered;
}

// Calculate simple relevance score
function calculateRelevanceScore(text, keyword) {
  const keyword_lower = keyword.toLowerCase();
  const matches = (text.match(new RegExp(keyword_lower, 'g')) || []).length;
  const total_words = text.split(/\s+/).length;
  
  return Math.round((matches / total_words) * 1000) / 10; // Score out of 100
}

// Get knowledge with agent context - main export function
export const getKnowledgeWithAgentContext = async (roleId, agentId, sessionId, scope = 'general') => {
  return await getEnhancedKnowledgeForRole(roleId, {
    agentId,
    sessionId,
    scope
  });
};

// Seed knowledge into memory (Memex privilege only)
export const seedKnowledgeToMemory = async (roleId, sessionId, agentId = 'memex') => {
  if (agentId !== 'memex') {
    throw new Error('Only Memex agent can seed knowledge to memory');
  }
  
  const memoryManager = getMemoryManager();
  const knowledge = getKnowledgeForRole(roleId);
  
  if (!knowledge) {
    throw new Error(`No knowledge found for role: ${roleId}`);
  }
  
  // Seed knowledge to appropriate scopes
  const seedResults = await memoryManager.seedContext(sessionId, agentId, {
    goals: knowledge.platform?.mission || 'Platform goals',
    requirements: knowledge.platform?.features || [],
    architecture: knowledge.platform?.principles || [],
    technical_details: knowledge,
    monitoring: { knowledge_seeded: true, role: roleId },
    experiments: { prototype_knowledge: knowledge }
  });
  
  return {
    success: true,
    seeded_scopes: Object.keys(seedResults),
    role_id: roleId,
    session_id: sessionId,
    seeded_at: new Date().toISOString()
  };
};

// Export for backward compatibility
export { KNOWLEDGE_BASE, getKnowledgeForRole };
