import { loadAgents, getAgent } from '../lib/ai-agents.js';

async function main() {
  console.log('Starting simplified Art Department agent test...');

  try {
    // Test 1: Load agents
    console.log('Loading agents...');
    await loadAgents();
    console.log('✓ Agents loaded successfully');

    // Test 2: Get the art department agent
    console.log('Getting art department agent...');
    const artAgent = await getAgent('art_department');
    
    if (!artAgent) {
      throw new Error('Art department agent not found');
    }
    console.log('✓ Art department agent found:', artAgent.agentId);

    // Test 3: Test the art generation logic directly
    console.log('Testing art concept generation...');
    const mockTrack = {
      title: 'Cybernetic Dreams',
      mood: 'futuristic',
      genre: 'Synthwave'
    };

    const concepts = artAgent.generateArtConcepts(mockTrack);
    console.log('✓ Generated art concepts:', concepts.length);
    
    console.log('Generated Concepts:');
    concepts.forEach((concept, index) => {
      console.log(`${index + 1}. ${concept}`);
    });

    console.log('\n✅ Test Passed! Art Department agent is working correctly.');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    process.exit(1);
  }
}

main();
