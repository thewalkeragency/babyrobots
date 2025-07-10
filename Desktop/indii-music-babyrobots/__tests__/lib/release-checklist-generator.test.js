/**
 * Unit Tests for Release Checklist Generator
 */

import { releaseChecklistGenerator } from '@/lib/release-checklist-generator';
import { jest } from '@jest/globals';

/**
 * Test release checklist generation
 */
describe('ReleaseChecklistGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = releaseChecklistGenerator;
  });

  test('should generate checklist for single release', () => {
    const releaseDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const checklist = generator.generateChecklist({ releaseType: 'single', releaseDate });

    expect(checklist).toBeDefined();
    expect(checklist.releaseType).toBe('Single Release');
    expect(checklist.phases).toHaveLength(5);
    expect(checklist.phases[0].tasks).toHaveLength(5);
  });

  test('should throw error for unsupported release type', () => {
    expect(() => {
      generator.generateChecklist({ releaseType: 'mixtape' });
    }).toThrow('Unsupported release type: mixtape');
  });

  test('should calculate due dates correctly', () => {
    const startDate = new Date();
    const dueDate = generator.calculateDueDate(startDate, -8);

    const expectedDate = new Date(startDate);
    expectedDate.setDate(expectedDate.getDate() - (8 * 7));

    expect(dueDate.toDateString()).toBe(expectedDate.toDateString());
  });

  test('should export checklist to JSON format', () => {
    const checklist = generator.generateChecklist({ releaseType: 'single' });
    const json = generator.exportChecklist(checklist, 'json');

    expect(json).toContain('Single Release');
    expect(json).toContain('Pre-Production');
  });

  test('should update task completion status', () => {
    const checklist = generator.generateChecklist({ releaseType: 'single' });
    const taskId = checklist.phases[0].tasks[0].id;

    const updatedChecklist = generator.updateTaskStatus(checklist, taskId, true);

    const updatedTask = updatedChecklist.phases[0].tasks.find(t => t.id === taskId);
    expect(updatedTask.completed).toBe(true);
    expect(updatedChecklist.completedTasks).toBe(1);
  });
});

