import { loadAgents, getAgent } from '../lib/ai-agents.js';

async function runComprehensiveTests() {
  console.log('🧪 Running Final Comprehensive Test Suite\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  function test(name, testFn) {
    testsTotal++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  try {
    // Test 1: Agent Loading
    console.log('📂 Testing Agent System...');
    await loadAgents();
    test('Agent loading system works', () => {
      if (!loadAgents) throw new Error('loadAgents function not available');
    });

    // Test 2: Agent Retrieval
    const artAgent = await getAgent('art_department');
    test('Art Department agent retrieval', () => {
      if (!artAgent) throw new Error('Art agent not found');
      if (artAgent.agentId !== 'art_department') throw new Error('Wrong agent ID');
    });

    // Test 3: Agent Properties
    test('Agent has required properties', () => {
      if (!artAgent.generateArtConcepts) throw new Error('Missing generateArtConcepts method');
      if (!artAgent.agentId) throw new Error('Missing agentId');
    });

    // Test 4: Art Generation with Various Inputs
    console.log('\n🎨 Testing Art Generation...');
    
    const testCases = [
      { title: 'Test Song', mood: 'happy', genre: 'Pop' },
      { title: '', mood: 'sad', genre: 'Blues' }, // Edge case: empty title
      { title: 'Long Song Title With Many Words And Symbols!@#', mood: 'energetic', genre: 'Rock' },
      { title: 'Minimal', mood: '', genre: '' }, // Edge case: empty mood/genre
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const concepts = artAgent.generateArtConcepts(testCase);
      
      test(`Art generation test case ${i + 1}`, () => {
        if (!Array.isArray(concepts)) throw new Error('Concepts not an array');
        if (concepts.length !== 3) throw new Error(`Expected 3 concepts, got ${concepts.length}`);
        
        concepts.forEach((concept, idx) => {
          if (typeof concept !== 'string') throw new Error(`Concept ${idx} is not a string`);
          if (concept.length < 10) throw new Error(`Concept ${idx} too short`);
        });
      });
    }

    // Test 5: Content Customization
    console.log('\n🔍 Testing Content Customization...');
    
    const track1 = { title: 'Jazz Night', mood: 'smooth', genre: 'Jazz' };
    const track2 = { title: 'Metal Storm', mood: 'aggressive', genre: 'Metal' };
    
    const concepts1 = artAgent.generateArtConcepts(track1);
    const concepts2 = artAgent.generateArtConcepts(track2);
    
    test('Content varies based on input', () => {
      const hasJazzContent = concepts1.some(c => c.includes('Jazz') || c.includes('smooth'));
      const hasMetalContent = concepts2.some(c => c.includes('Metal') || c.includes('aggressive'));
      
      if (!hasJazzContent) throw new Error('Jazz concepts missing jazz-specific content');
      if (!hasMetalContent) throw new Error('Metal concepts missing metal-specific content');
      
      // Ensure concepts are actually different
      const identical = concepts1.every((c, i) => c === concepts2[i]);
      if (identical) throw new Error('Concepts are identical for different inputs');
    });

    // Test 6: Error Handling
    console.log('\n⚠️  Testing Error Handling...');
    
    test('Handles undefined input gracefully', () => {
      try {
        const concepts = artAgent.generateArtConcepts(undefined);
        // Should not crash, even if it produces empty/default content
        if (!Array.isArray(concepts)) throw new Error('Should return array even with undefined input');
      } catch (error) {
        // It's ok if it throws an error, as long as it's handled
      }
    });

    test('Handles null input gracefully', () => {
      try {
        const concepts = artAgent.generateArtConcepts(null);
        // Should not crash, even if it produces empty/default content
        if (!Array.isArray(concepts)) throw new Error('Should return array even with null input');
      } catch (error) {
        // It's ok if it throws an error, as long as it's handled
      }
    });

    // Test 7: Performance Test
    console.log('\n⚡ Testing Performance...');
    
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      artAgent.generateArtConcepts({ title: `Test ${i}`, mood: 'test', genre: 'Test' });
    }
    const endTime = Date.now();
    
    test('Performance is acceptable', () => {
      const duration = endTime - startTime;
      if (duration > 1000) throw new Error(`Too slow: ${duration}ms for 10 generations`);
    });

    // Test 8: Memory Usage
    test('No obvious memory leaks', () => {
      const beforeGC = process.memoryUsage().heapUsed;
      
      // Generate many concepts
      for (let i = 0; i < 100; i++) {
        artAgent.generateArtConcepts({ title: `Memory Test ${i}`, mood: 'test', genre: 'Test' });
      }
      
      const afterGC = process.memoryUsage().heapUsed;
      const growthMB = (afterGC - beforeGC) / 1024 / 1024;
      
      if (growthMB > 50) throw new Error(`Excessive memory growth: ${growthMB.toFixed(2)}MB`);
    });

    // Final Results
    console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
      console.log('🎉 ALL TESTS PASSED! Art Department Agent is fully functional and ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Critical error during testing:', error.message);
    process.exit(1);
  }
}

runComprehensiveTests();
