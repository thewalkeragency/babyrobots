/**
 * Performance Tests for Release Checklist Generator
 */

import { releaseChecklistGenerator } from '@/lib/release-checklist-generator';

describe('Checklist Performance Tests', () => {
  test('should generate checklist within acceptable time', () => {
    const startTime = performance.now();
    
    const checklist = releaseChecklistGenerator.generateChecklist({
      releaseType: 'album',
      releaseDate: new Date(Date.now() + (120 * 24 * 60 * 60 * 1000))
    });
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Should complete within 100ms
    expect(executionTime).toBeLessThan(100);
    expect(checklist).toBeDefined();
  });

  test('should handle multiple checklist generations efficiently', () => {
    const startTime = performance.now();
    
    const checklists = [];
    for (let i = 0; i < 50; i++) {
      checklists.push(
        releaseChecklistGenerator.generateChecklist({
          releaseType: i % 2 === 0 ? 'single' : 'ep',
          releaseDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000))
        })
      );
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Should complete 50 generations within 1 second
    expect(executionTime).toBeLessThan(1000);
    expect(checklists).toHaveLength(50);
  });

  test('should export large checklist efficiently', () => {
    const checklist = releaseChecklistGenerator.generateChecklist({
      releaseType: 'album',
      customTasks: Array.from({ length: 100 }, (_, i) => ({
        id: `custom_${i}`,
        task: `Custom task ${i}`,
        priority: 'medium',
        category: 'custom',
        phase: 'Pre-Production'
      }))
    });
    
    const startTime = performance.now();
    const exported = releaseChecklistGenerator.exportChecklist(checklist, 'markdown');
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    
    // Should export within 50ms even with large data
    expect(executionTime).toBeLessThan(50);
    expect(exported).toContain('Album Release');
  });
});
