/**
 * Release Checklist Generation System
 * Provides template-based checklist generation with timeline calculation
 * and milestone tracking for music releases
 */

export class ReleaseChecklistGenerator {
  constructor() {
    this.templates = {
      single: {
        name: 'Single Release',
        timeline: 8, // weeks
        phases: [
          {
            name: 'Pre-Production',
            startWeek: -8,
            endWeek: -6,
            tasks: [
              { id: 'track_finalization', task: 'Finalize track selection and arrangement', priority: 'high', category: 'production' },
              { id: 'split_sheets', task: 'Create and verify split sheets in indii.music', priority: 'high', category: 'legal' },
              { id: 'pro_registration', task: 'Register with PRO (ASCAP/BMI/SESAC)', priority: 'medium', category: 'legal' },
              { id: 'marketing_strategy', task: 'Develop marketing strategy and timeline', priority: 'high', category: 'marketing' },
              { id: 'budget_planning', task: 'Set release budget and allocate resources', priority: 'medium', category: 'business' }
            ]
          },
          {
            name: 'Production',
            startWeek: -6,
            endWeek: -4,
            tasks: [
              { id: 'mixing_mastering', task: 'Complete mixing and mastering', priority: 'high', category: 'production' },
              { id: 'artwork_creation', task: 'Create high-resolution artwork (3000x3000px)', priority: 'high', category: 'design' },
              { id: 'metadata_prep', task: 'Prepare metadata (ISRC, genre, mood tags)', priority: 'high', category: 'distribution' },
              { id: 'sound_locker_content', task: 'Prepare Sound Locker exclusive content', priority: 'medium', category: 'fan_engagement' }
            ]
          },
          {
            name: 'Pre-Release',
            startWeek: -4,
            endWeek: -1,
            tasks: [
              { id: 'distribution_submit', task: 'Submit to indii.music distribution', priority: 'high', category: 'distribution' },
              { id: 'epk_creation', task: 'Generate smart links and EPK', priority: 'high', category: 'marketing' },
              { id: 'playlist_pitching', task: 'Pitch to playlist curators', priority: 'medium', category: 'promotion' },
              { id: 'social_content', task: 'Schedule social media content', priority: 'medium', category: 'marketing' },
              { id: 'press_outreach', task: 'Reach out to music blogs and press', priority: 'medium', category: 'promotion' }
            ]
          },
          {
            name: 'Release Week',
            startWeek: 0,
            endWeek: 0,
            tasks: [
              { id: 'monitor_analytics', task: 'Monitor analytics dashboard', priority: 'high', category: 'analytics' },
              { id: 'fan_engagement', task: 'Engage with fans via Sound Locker', priority: 'medium', category: 'fan_engagement' },
              { id: 'social_sharing', task: 'Share on social media platforms', priority: 'high', category: 'marketing' },
              { id: 'playlist_tracking', task: 'Track playlist adds and features', priority: 'medium', category: 'promotion' }
            ]
          },
          {
            name: 'Post-Release',
            startWeek: 1,
            endWeek: 4,
            tasks: [
              { id: 'performance_analysis', task: 'Analyze performance metrics', priority: 'high', category: 'analytics' },
              { id: 'followup_content', task: 'Plan follow-up content and campaigns', priority: 'medium', category: 'marketing' },
              { id: 'sync_licensing', task: 'Consider sync licensing opportunities', priority: 'low', category: 'licensing' },
              { id: 'next_release_prep', task: 'Begin planning next release', priority: 'low', category: 'planning' }
            ]
          }
        ]
      },
      ep: {
        name: 'EP Release',
        timeline: 12,
        phases: [
          {
            name: 'Pre-Production',
            startWeek: -12,
            endWeek: -8,
            tasks: [
              { id: 'track_selection', task: 'Finalize 3-6 track selection and order', priority: 'high', category: 'production' },
              { id: 'split_sheets_multi', task: 'Create split sheets for all tracks', priority: 'high', category: 'legal' },
              { id: 'pro_registration', task: 'Register all tracks with PRO', priority: 'medium', category: 'legal' },
              { id: 'ep_concept', task: 'Develop EP concept and theme', priority: 'high', category: 'creative' },
              { id: 'marketing_strategy_ep', task: 'Plan comprehensive marketing strategy', priority: 'high', category: 'marketing' }
            ]
          },
          {
            name: 'Production',
            startWeek: -8,
            endWeek: -6,
            tasks: [
              { id: 'mixing_mastering_ep', task: 'Complete mixing and mastering for all tracks', priority: 'high', category: 'production' },
              { id: 'artwork_package', task: 'Create artwork package (cover + individual singles)', priority: 'high', category: 'design' },
              { id: 'metadata_all_tracks', task: 'Prepare metadata for all tracks', priority: 'high', category: 'distribution' },
              { id: 'bonus_content', task: 'Create bonus content for Sound Locker', priority: 'medium', category: 'fan_engagement' }
            ]
          },
          {
            name: 'Pre-Release',
            startWeek: -6,
            endWeek: -1,
            tasks: [
              { id: 'lead_single', task: 'Release lead single 4 weeks before EP', priority: 'high', category: 'strategy' },
              { id: 'distribution_submit_ep', task: 'Submit EP to indii.music distribution', priority: 'high', category: 'distribution' },
              { id: 'press_kit', task: 'Create comprehensive press kit', priority: 'high', category: 'promotion' },
              { id: 'playlist_campaign', task: 'Launch playlist pitching campaign', priority: 'medium', category: 'promotion' },
              { id: 'content_calendar', task: 'Execute social media content calendar', priority: 'medium', category: 'marketing' }
            ]
          },
          {
            name: 'Release Week',
            startWeek: 0,
            endWeek: 0,
            tasks: [
              { id: 'ep_launch', task: 'Launch EP with coordinated campaign', priority: 'high', category: 'marketing' },
              { id: 'live_engagement', task: 'Host live listening party or Q&A', priority: 'medium', category: 'fan_engagement' },
              { id: 'press_interviews', task: 'Conduct press interviews and features', priority: 'medium', category: 'promotion' }
            ]
          },
          {
            name: 'Post-Release',
            startWeek: 1,
            endWeek: 8,
            tasks: [
              { id: 'single_rollout', task: 'Continue single rollout from EP tracks', priority: 'medium', category: 'strategy' },
              { id: 'performance_review', task: 'Comprehensive performance analysis', priority: 'high', category: 'analytics' },
              { id: 'sync_opportunities', task: 'Pursue sync licensing for EP tracks', priority: 'medium', category: 'licensing' }
            ]
          }
        ]
      },
      album: {
        name: 'Album Release',
        timeline: 16,
        phases: [
          {
            name: 'Pre-Production',
            startWeek: -16,
            endWeek: -12,
            tasks: [
              { id: 'album_concept', task: 'Finalize album concept and track listing', priority: 'high', category: 'creative' },
              { id: 'split_sheets_album', task: 'Create split sheets for all album tracks', priority: 'high', category: 'legal' },
              { id: 'album_strategy', task: 'Develop comprehensive album strategy', priority: 'high', category: 'strategy' },
              { id: 'budget_planning_album', task: 'Plan album budget and funding', priority: 'high', category: 'business' }
            ]
          },
          {
            name: 'Production',
            startWeek: -12,
            endWeek: -8,
            tasks: [
              { id: 'album_mixing_mastering', task: 'Complete mixing and mastering for full album', priority: 'high', category: 'production' },
              { id: 'album_artwork', task: 'Create album artwork and packaging design', priority: 'high', category: 'design' },
              { id: 'vinyl_cd_prep', task: 'Prepare for physical release (vinyl, CD)', priority: 'medium', category: 'distribution' }
            ]
          },
          {
            name: 'Pre-Release Campaign',
            startWeek: -8,
            endWeek: -1,
            tasks: [
              { id: 'lead_singles', task: 'Release 2-3 lead singles with gaps', priority: 'high', category: 'strategy' },
              { id: 'pre_order', task: 'Set up pre-order and pre-save campaigns', priority: 'high', category: 'marketing' },
              { id: 'album_press', task: 'Launch comprehensive press campaign', priority: 'high', category: 'promotion' },
              { id: 'tour_planning', task: 'Plan album release tour', priority: 'medium', category: 'live_performance' }
            ]
          },
          {
            name: 'Release Week',
            startWeek: 0,
            endWeek: 0,
            tasks: [
              { id: 'album_launch', task: 'Execute full album launch campaign', priority: 'high', category: 'marketing' },
              { id: 'release_show', task: 'Host album release show/event', priority: 'medium', category: 'live_performance' }
            ]
          },
          {
            name: 'Post-Release Campaign',
            startWeek: 1,
            endWeek: 12,
            tasks: [
              { id: 'album_cycle', task: 'Continue album cycle with additional singles', priority: 'high', category: 'strategy' },
              { id: 'tour_execution', task: 'Execute album tour', priority: 'medium', category: 'live_performance' },
              { id: 'sync_album', task: 'Pursue sync opportunities for album tracks', priority: 'medium', category: 'licensing' }
            ]
          }
        ]
      }
    };
  }

  /**
   * Generate a customized release checklist
   * @param {Object} options - Release configuration options
   * @returns {Object} Generated checklist with timeline and tasks
   */
  generateChecklist(options = {}) {
    const {
      releaseType = 'single',
      releaseDate = null,
      customTasks = [],
      excludeCategories = [],
      artistLevel = 'independent' // 'independent', 'emerging', 'established'
    } = options;

    const template = this.templates[releaseType];
    if (!template) {
      throw new Error(`Unsupported release type: ${releaseType}`);
    }

    const checklist = {
      id: this.generateId(),
      releaseType: template.name,
      timeline: template.timeline,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      createdAt: new Date(),
      lastUpdated: new Date(),
      phases: [],
      totalTasks: 0,
      completedTasks: 0,
      progress: 0
    };

    // Calculate dates and generate phases
    checklist.phases = template.phases.map(phase => {
      const phaseTasks = phase.tasks
        .filter(task => !excludeCategories.includes(task.category))
        .map(task => ({
          ...task,
          id: `${checklist.id}_${task.id}`,
          completed: false,
          completedAt: null,
          notes: '',
          dueDate: this.calculateDueDate(releaseDate, phase.startWeek),
          estimatedHours: this.getEstimatedHours(task, artistLevel)
        }));

      // Add custom tasks if they belong to this phase
      const phaseCustomTasks = customTasks
        .filter(customTask => customTask.phase === phase.name)
        .map(customTask => ({
          ...customTask,
          id: `${checklist.id}_custom_${customTask.id}`,
          completed: false,
          completedAt: null,
          category: 'custom'
        }));

      const allPhaseTasks = [...phaseTasks, ...phaseCustomTasks];
      checklist.totalTasks += allPhaseTasks.length;

      return {
        ...phase,
        id: `${checklist.id}_${phase.name.toLowerCase().replace(/\s+/g, '_')}`,
        tasks: allPhaseTasks,
        taskCount: allPhaseTasks.length,
        completedTaskCount: 0,
        startDate: this.calculateDueDate(releaseDate, phase.startWeek),
        endDate: this.calculateDueDate(releaseDate, phase.endWeek),
        status: 'upcoming' // 'upcoming', 'active', 'completed'
      };
    });

    return checklist;
  }

  /**
   * Calculate due date based on release date and week offset
   * @param {Date|string} releaseDate - Target release date
   * @param {number} weekOffset - Weeks before (negative) or after (positive) release
   * @returns {Date|null} Calculated due date
   */
  calculateDueDate(releaseDate, weekOffset) {
    if (!releaseDate) return null;
    
    const date = new Date(releaseDate);
    date.setDate(date.getDate() + (weekOffset * 7));
    return date;
  }

  /**
   * Get estimated hours for a task based on artist level
   * @param {Object} task - Task object
   * @param {string} artistLevel - Artist experience level
   * @returns {number} Estimated hours
   */
  getEstimatedHours(task, artistLevel) {
    const baseHours = {
      'track_finalization': 8,
      'split_sheets': 2,
      'pro_registration': 1,
      'marketing_strategy': 6,
      'mixing_mastering': 16,
      'artwork_creation': 8,
      'metadata_prep': 2,
      'distribution_submit': 2,
      'epk_creation': 4,
      'playlist_pitching': 6,
      'social_content': 8,
      'monitor_analytics': 2,
      'fan_engagement': 3,
      'performance_analysis': 4
    };

    const multipliers = {
      'independent': 1.5, // More time needed for learning
      'emerging': 1.2,    // Some experience
      'established': 1.0  // Efficient workflow
    };

    const base = baseHours[task.id] || 3;
    const multiplier = multipliers[artistLevel] || 1.0;
    
    return Math.ceil(base * multiplier);
  }

  /**
   * Update task completion status
   * @param {Object} checklist - The checklist object
   * @param {string} taskId - Task ID to update
   * @param {boolean} completed - Completion status
   * @param {string} notes - Optional notes
   * @returns {Object} Updated checklist
   */
  updateTaskStatus(checklist, taskId, completed, notes = '') {
    let taskFound = false;
    
    checklist.phases = checklist.phases.map(phase => {
      const updatedTasks = phase.tasks.map(task => {
        if (task.id === taskId) {
          taskFound = true;
          return {
            ...task,
            completed,
            completedAt: completed ? new Date() : null,
            notes: notes || task.notes
          };
        }
        return task;
      });

      const completedCount = updatedTasks.filter(task => task.completed).length;
      
      return {
        ...phase,
        tasks: updatedTasks,
        completedTaskCount: completedCount,
        status: this.calculatePhaseStatus(phase, completedCount, updatedTasks.length)
      };
    });

    if (!taskFound) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Recalculate overall progress
    checklist.completedTasks = checklist.phases.reduce((total, phase) => {
      return total + phase.completedTaskCount;
    }, 0);
    
    checklist.progress = Math.round((checklist.completedTasks / checklist.totalTasks) * 100);
    checklist.lastUpdated = new Date();

    return checklist;
  }

  /**
   * Calculate phase status based on task completion
   * @param {Object} phase - Phase object
   * @param {number} completedCount - Number of completed tasks
   * @param {number} totalCount - Total number of tasks
   * @returns {string} Phase status
   */
  calculatePhaseStatus(phase, completedCount, totalCount) {
    if (completedCount === totalCount) return 'completed';
    if (completedCount > 0) return 'active';
    
    const now = new Date();
    if (phase.startDate && now >= phase.startDate) return 'active';
    
    return 'upcoming';
  }

  /**
   * Get milestones for a checklist
   * @param {Object} checklist - The checklist object
   * @returns {Array} Array of milestone objects
   */
  getMilestones(checklist) {
    return checklist.phases.map(phase => ({
      id: phase.id,
      name: phase.name,
      date: phase.endDate,
      completed: phase.status === 'completed',
      taskCount: phase.taskCount,
      completedTaskCount: phase.completedTaskCount,
      description: `Complete ${phase.name} phase tasks`
    }));
  }

  /**
   * Generate analytics for a checklist
   * @param {Object} checklist - The checklist object
   * @returns {Object} Analytics data
   */
  generateAnalytics(checklist) {
    const categoryStats = {};
    const priorityStats = { high: 0, medium: 0, low: 0 };
    const phaseStats = checklist.phases.map(phase => ({
      name: phase.name,
      progress: Math.round((phase.completedTaskCount / phase.taskCount) * 100),
      timeRemaining: this.calculateTimeRemaining(phase)
    }));

    checklist.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        // Category statistics
        if (!categoryStats[task.category]) {
          categoryStats[task.category] = { total: 0, completed: 0 };
        }
        categoryStats[task.category].total++;
        if (task.completed) {
          categoryStats[task.category].completed++;
        }

        // Priority statistics
        if (priorityStats.hasOwnProperty(task.priority)) {
          priorityStats[task.priority]++;
        }
      });
    });

    return {
      overall: {
        progress: checklist.progress,
        totalTasks: checklist.totalTasks,
        completedTasks: checklist.completedTasks,
        estimatedTimeRemaining: this.calculateTotalTimeRemaining(checklist)
      },
      byCategory: categoryStats,
      byPriority: priorityStats,
      byPhase: phaseStats,
      upcomingDeadlines: this.getUpcomingDeadlines(checklist)
    };
  }

  /**
   * Calculate time remaining for a phase
   * @param {Object} phase - Phase object
   * @returns {number} Days remaining
   */
  calculateTimeRemaining(phase) {
    if (!phase.endDate) return null;
    
    const now = new Date();
    const diff = phase.endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate total time remaining for checklist
   * @param {Object} checklist - The checklist object
   * @returns {number} Total estimated hours remaining
   */
  calculateTotalTimeRemaining(checklist) {
    return checklist.phases.reduce((total, phase) => {
      return total + phase.tasks
        .filter(task => !task.completed)
        .reduce((phaseTotal, task) => phaseTotal + (task.estimatedHours || 0), 0);
    }, 0);
  }

  /**
   * Get upcoming deadlines
   * @param {Object} checklist - The checklist object
   * @returns {Array} Array of upcoming deadline objects
   */
  getUpcomingDeadlines(checklist) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    const deadlines = [];
    
    checklist.phases.forEach(phase => {
      if (phase.endDate && phase.endDate <= sevenDaysFromNow && phase.status !== 'completed') {
        deadlines.push({
          type: 'phase',
          name: phase.name,
          date: phase.endDate,
          daysRemaining: this.calculateTimeRemaining(phase),
          priority: 'high'
        });
      }
      
      phase.tasks.forEach(task => {
        if (task.dueDate && task.dueDate <= sevenDaysFromNow && !task.completed) {
          deadlines.push({
            type: 'task',
            name: task.task,
            date: task.dueDate,
            daysRemaining: Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            priority: task.priority,
            category: task.category
          });
        }
      });
    });
    
    return deadlines.sort((a, b) => a.date - b.date);
  }

  /**
   * Generate a unique ID for checklists
   * @returns {string} Unique identifier
   */
  generateId() {
    return `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export checklist to different formats
   * @param {Object} checklist - The checklist object
   * @param {string} format - Export format ('json', 'csv', 'markdown')
   * @returns {string} Formatted export data
   */
  exportChecklist(checklist, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(checklist, null, 2);
      
      case 'csv':
        return this.exportToCSV(checklist);
      
      case 'markdown':
        return this.exportToMarkdown(checklist);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export checklist to CSV format
   * @param {Object} checklist - The checklist object
   * @returns {string} CSV formatted data
   */
  exportToCSV(checklist) {
    const headers = ['Phase', 'Task', 'Priority', 'Category', 'Due Date', 'Completed', 'Notes'];
    const rows = [headers.join(',')];
    
    checklist.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const row = [
          phase.name,
          `"${task.task}"`,
          task.priority,
          task.category,
          task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
          task.completed ? 'Yes' : 'No',
          `"${task.notes || ''}"`
        ];
        rows.push(row.join(','));
      });
    });
    
    return rows.join('\n');
  }

  /**
   * Export checklist to Markdown format
   * @param {Object} checklist - The checklist object
   * @returns {string} Markdown formatted data
   */
  exportToMarkdown(checklist) {
    let markdown = `# ${checklist.releaseType} Checklist\n\n`;
    markdown += `**Release Date:** ${checklist.releaseDate ? checklist.releaseDate.toDateString() : 'TBD'}\n`;
    markdown += `**Progress:** ${checklist.progress}% (${checklist.completedTasks}/${checklist.totalTasks} tasks)\n`;
    markdown += `**Created:** ${checklist.createdAt.toDateString()}\n\n`;
    
    checklist.phases.forEach(phase => {
      markdown += `## ${phase.name}\n\n`;
      markdown += `**Timeline:** ${phase.startDate ? phase.startDate.toDateString() : 'TBD'} - ${phase.endDate ? phase.endDate.toDateString() : 'TBD'}\n`;
      markdown += `**Progress:** ${Math.round((phase.completedTaskCount / phase.taskCount) * 100)}%\n\n`;
      
      phase.tasks.forEach(task => {
        const checkbox = task.completed ? '[x]' : '[ ]';
        const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        markdown += `- ${checkbox} ${priority} **${task.task}** (${task.category})\n`;
        if (task.dueDate) {
          markdown += `  - Due: ${task.dueDate.toDateString()}\n`;
        }
        if (task.notes) {
          markdown += `  - Notes: ${task.notes}\n`;
        }
      });
      
      markdown += '\n';
    });
    
    return markdown;
  }
}

// Export singleton instance
export const releaseChecklistGenerator = new ReleaseChecklistGenerator();
export default ReleaseChecklistGenerator;
