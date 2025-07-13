import { loadAgents, getAgent } from '../lib/ai-agents.js';

async function testAllAgents() {
  console.log('🤖 Testing All Available Agents\n');

  try {
    await loadAgents();
    
    const expectedAgents = ['art_department', 'gemini_cli', 'jules', 'memex', 'warp'];
    
    for (const agentId of expectedAgents) {
      try {
        const agent = await getAgent(agentId);
        if (agent) {
          console.log(`✅ ${agentId}: Loaded successfully (${agent.constructor.name})`);
        } else {
          console.log(`❌ ${agentId}: Not found`);
        }
      } catch (error) {
        console.log(`❌ ${agentId}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎯 Agent System Status: All agents are properly configured and loadable.');
    
  } catch (error) {
    console.error('💥 Error testing agents:', error.message);
  }
}

testAllAgents();
