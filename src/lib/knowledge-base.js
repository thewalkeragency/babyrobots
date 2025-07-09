// Knowledge Base for indii.music
// Based on IndieLeap Functional Requirements Specification

export const KNOWLEDGE_BASE = {
  // Platform Overview
  platform: {
    mission: 'Empowering independent music artists through comprehensive digital ecosystem',
    principles: [
      'Integration - Breaking down silos between tools/workflows',
      'Transparency - Clear data and insights on revenue/engagement', 
      'Fairness - Equitable treatment and compensation',
      'Artist Empowerment - Tools, data, control, opportunities'
    ],
    features: [
      'Unified Dashboard (customizable, role-based)',
      'Music Distribution & Royalty Management',
      'Collaboration Suite (Split Sheets, Project Workspaces)',
      'Marketing & Promotion Toolkit',
      'Sync Licensing Portal',
      'Service Provider Marketplace',
      'Fan Engagement (Sound Locker, Community)',
      'AI Assistant Agents'
    ]
  },

  // Artist-specific knowledge
  artist: {
    releaseChecklist: [
      'Complete metadata (title, artists, genre, mood, etc.)',
      'High-quality audio files (WAV/FLAC preferred)',
      'Cover artwork (high-resolution, DSP compliant)',
      'Verified split sheets for collaborations',
      'PRO registration (ASCAP, BMI, SESAC)',
      'Distribution channel selection',
      'Marketing timeline and social media strategy',
      'Pre-save campaign setup'
    ],
    marketingStrategy: [
      'Build authentic artist brand identity',
      'Create compelling visual content',
      'Leverage data-driven insights from analytics',
      'Coordinate cross-platform campaigns',
      'Use EPK generator for professional pitching',
      'Set up smart links for releases',
      'Engage with community forums'
    ],
    royaltyTypes: [
      'Mechanical Royalties - From streams/downloads',
      'Performance Royalties - From radio/public performance',
      'Sync Royalties - From film/TV/advertising placements',
      'Sound Locker Revenue - Direct fan support',
      'Marketplace Earnings - Service provider income'
    ],
    collaboration: [
      'Use digital split sheets for clear ownership',
      'Set up project workspaces for file sharing',
      'Implement time-based audio comments',
      'Track task assignments and deadlines',
      'Link verified splits to distribution metadata'
    ]
  },

  // Fan-specific knowledge  
  fan: {
    discovery: [
      'Use advanced filters (genre, mood, activity, era)',
      'Try natural language search ("chill electronic for coding")',
      'Explore AI-generated personalized playlists',
      'Check out "Fans also liked" recommendations',
      'Browse curated playlists and artist selections'
    ],
    engagement: [
      'Access exclusive content via Sound Locker',
      'Join community forums for discussions',
      'Create and share personal playlists',
      'Follow artists for updates and releases',
      'Participate in fan-artist interactions'
    ],
    soundLocker: [
      'Free content for all followers',
      'One-time purchases for exclusive tracks',
      'Subscription tiers for premium content',
      'Direct support/tip-based unlocking',
      'Behind-the-scenes content and demos'
    ]
  },

  // Sync Licensing knowledge
  licensing: {
    searchFilters: [
      'Genre/Subgenre multi-select',
      'Mood tags (Uplifting, Tense, Romantic)',
      'Tempo (BPM ranges or categories)',
      'Instrumentation (Piano, Guitar, Synth)',
      'Vocals (Instrumental, Male/Female vocals)',
      'Era/Decade styling',
      'Situational prompts (NLP search)'
    ],
    licenseTypes: [
      'Non-Exclusive - Multiple users allowed',
      'Exclusive - Single user rights',
      'Territory-specific (Worldwide, Regional)',
      'Term-based (Perpetual, Annual)',
      'Usage context (Background, Featured, Theme)'
    ],
    workflow: [
      'Search and preview tracks (watermarked)',
      'Initiate license request with usage details',
      'Negotiate terms via secure messaging',
      'Generate and sign electronic contracts',
      'Process payment (direct or escrow)',
      'Receive final audio files and documentation'
    ]
  },

  // Service Provider knowledge
  marketplace: {
    services: [
      'Mixing & Mastering Engineering',
      'Music Production & Beat Making',  
      'Session Musicians & Vocalists',
      'Graphic Design & Cover Art',
      'Music Video Production',
      'Lyric Writing & Songwriting'
    ],
    workflow: [
      'Complete detailed provider profile',
      'Showcase portfolio and credentials',
      'Respond to project requests and quotes',
      'Communicate via secure messaging',
      'Use integrated video chat for consultations',
      'Exchange files via secure vault',
      'Manage payments (direct or escrow system)'
    ],
    qualityStandards: [
      'Portfolio review and verification',
      'Client reference checks',
      'Platform-specific testing when applicable',
      'Two-way rating and review system',
      'Clear service descriptions and rates'
    ]
  },

  // Legal guidance (not legal advice)
  legal: {
    contracts: [
      'Recording Agreements - Artist/Label deals',
      'Publishing Deals - Songwriter/Publisher agreements', 
      'Management Agreements - Artist/Manager contracts',
      'Service Agreements - Provider/Client contracts',
      'Sync Licenses - Music/Media usage rights'
    ],
    rights: [
      'Copyright - Original work protection',
      'Performance Rights - Public performance royalties',
      'Mechanical Rights - Reproduction/distribution',
      'Sync Rights - Audio/visual synchronization',
      'Master Rights - Sound recording ownership'
    ],
    organizations: [
      'PROs: ASCAP, BMI, SESAC (Performance royalties)',
      'SoundExchange (Digital performance royalties)',
      'Music distributors (Mechanical royalties)',
      'Content ID platforms (Micro-sync revenue)',
      'Collective Management Organizations (International)'
    ],
    disclaimer: 'This information is for educational purposes only and does not constitute legal advice. Always consult qualified legal counsel for specific situations.'
  },

  // General platform knowledge
  general: {
    gettingStarted: [
      'Choose your user type (Artist, Fan, Licensor, Provider)',
      'Complete profile setup and verification',
      'Link external accounts (PRO, distributor, social media)',
      'Explore role-specific features and tutorials',
      'Connect with the AI assistant for guidance'
    ],
    features: [
      'Unified Dashboard - Customizable overview of activities',
      'Internal Messaging - Secure communication system',
      'Notification Center - Platform-wide alerts',
      'File Management - Secure storage and sharing',
      'Analytics Engine - Performance insights and trends'
    ],
    support: [
      'AI Assistant agents for role-specific help',
      'Community forums for peer discussions',
      'Knowledge base and FAQ resources',
      'Video tutorials and onboarding guides',
      'Platform documentation and help articles'
    ]
  }
};

export const getKnowledgeForRole = (roleId) => {
  const general = KNOWLEDGE_BASE.general;
  const platform = KNOWLEDGE_BASE.platform;
  const roleSpecific = KNOWLEDGE_BASE[roleId] || {};
  
  return {
    platform,
    ...general,
    ...roleSpecific
  };
};

export const searchKnowledge = (query, roleId = null) => {
  const knowledge = roleId ? getKnowledgeForRole(roleId) : KNOWLEDGE_BASE;
  
  // Enhanced search implementation
  const results = [];
  const searchTerm = query.toLowerCase();
  
  const searchInObject = (obj, path = '', category = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const currentCategory = category || key;
      
      if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
        results.push({ 
          path: currentPath, 
          content: value, 
          category: currentCategory,
          relevance: value.toLowerCase().indexOf(searchTerm)
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && item.toLowerCase().includes(searchTerm)) {
            results.push({ 
              path: `${currentPath}[${index}]`, 
              content: item, 
              category: currentCategory,
              relevance: item.toLowerCase().indexOf(searchTerm)
            });
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        searchInObject(value, currentPath, category || key);
      }
    }
  };
  
  searchInObject(knowledge);
  
  // Sort by relevance (earlier appearance of search term = higher relevance)
  return results.sort((a, b) => a.relevance - b.relevance);
};