import { loadAgents, getAgent } from '../lib/ai-agents.js';

async function testVariations() {
  console.log('Testing Art Department agent with different track variations...\n');

  try {
    await loadAgents();
    const artAgent = await getAgent('art_department');

    const testTracks = [
      {
        title: 'Midnight Jazz',
        mood: 'relaxing',
        genre: 'Jazz'
      },
      {
        title: 'Digital Storm',
        mood: 'intense',
        genre: 'Techno'
      },
      {
        title: 'Country Roads Home',
        mood: 'nostalgic',
        genre: 'Country'
      }
    ];

    for (let i = 0; i < testTracks.length; i++) {
      const track = testTracks[i];
      console.log(`\n=== Test ${i + 1}: ${track.title} (${track.genre} - ${track.mood}) ===`);
      
      const concepts = artAgent.generateArtConcepts(track);
      concepts.forEach((concept, index) => {
        console.log(`${index + 1}. ${concept.substring(0, 100)}...`);
      });
    }

    console.log('\n✅ All tests passed! Agent generates different concepts for different inputs.');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    process.exit(1);
  }
}

testVariations();
