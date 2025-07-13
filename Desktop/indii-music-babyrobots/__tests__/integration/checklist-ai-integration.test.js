/**
 * Integration Tests for Release Checklist with AI Assistant
 */

import { releaseChecklistGenerator } from '@/lib/release-checklist-generator';
import AIRouter from '@/lib/ai-router';
import { jest } from '@jest/globals';

describe('Checklist AI Integration', () => {
  let aiRouter;
  
  beforeEach(() => {
    aiRouter = new AIRouter();
    // Mock AI provider for testing
    aiRouter.providers.gemini = {
      generate: jest.fn(),
      healthCheck: jest.fn()
    };
  });

  test('should integrate checklist generation with AI assistant', async () => {
    // Mock AI response
    const mockAIResponse = `Here's your release checklist:
    
    **Pre-Production Phase**
    - Complete track finalization
    - Create split sheets
    - Register with PRO
    
    This checklist will help you stay organized for your single release.`;
    
    aiRouter.providers.gemini.generate.mockResolvedValue(mockAIResponse);
    
    // Generate checklist
    const checklist = releaseChecklistGenerator.generateChecklist({
      releaseType: 'single',
      releaseDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
    });
    
    // Simulate AI assistant processing
    const aiMessage = `Generate a release checklist for a single with release date in 30 days`;
    const aiResponse = await aiRouter.route(aiMessage, { role: 'artist' });
    
    expect(aiResponse).toContain('checklist');
    expect(checklist.phases).toHaveLength(5);
    expect(checklist.totalTasks).toBeGreaterThan(0);
  });

  test('should handle AI-powered task recommendations', async () => {
    const checklist = releaseChecklistGenerator.generateChecklist({
      releaseType: 'ep',
      artistLevel: 'emerging'
    });
    
    // Simulate AI providing additional task suggestions
    const mockRecommendations = [
      { id: 'social_strategy', task: 'Develop TikTok promotion strategy', priority: 'high', category: 'marketing' },
      { id: 'playlist_research', task: 'Research indie playlist curators', priority: 'medium', category: 'promotion' }
    ];
    
    aiRouter.providers.gemini.generate.mockResolvedValue(
      JSON.stringify(mockRecommendations)
    );
    
    const customChecklist = releaseChecklistGenerator.generateChecklist({
      releaseType: 'ep',
      customTasks: mockRecommendations.map(rec => ({ ...rec, phase: 'Pre-Release' }))
    });
    
    expect(customChecklist.phases.find(p => p.name === 'Pre-Release').tasks)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ task: 'Develop TikTok promotion strategy' })
      ]));
  });

  test('should provide AI-powered timeline recommendations', async () => {
    const checklist = releaseChecklistGenerator.generateChecklist({
      releaseType: 'album',
      releaseDate: new Date(Date.now() + (120 * 24 * 60 * 60 * 1000)) // 4 months
    });
    
    const analytics = releaseChecklistGenerator.generateAnalytics(checklist);
    
    // Mock AI timeline analysis
    aiRouter.providers.gemini.generate.mockResolvedValue(
      'Based on your album timeline, I recommend starting pre-production tasks immediately to stay on schedule.'
    );
    
    const timelineMessage = `Analyze this release timeline: ${JSON.stringify(analytics.byPhase)}`;
    const aiAdvice = await aiRouter.route(timelineMessage, { role: 'artist' });
    
    expect(aiAdvice).toContain('timeline');
    expect(analytics.byPhase).toHaveLength(5);
  });
});
