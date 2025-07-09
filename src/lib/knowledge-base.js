// Knowledge Base for indii.music
// Contains music industry knowledge for different roles

export const KNOWLEDGE_BASE = {
  // General music industry knowledge
  general: {
    contracts: {
      types: ['Recording Contract', 'Publishing Deal', 'Management Agreement', 'Booking Agreement'],
      keyTerms: ['Advance', 'Royalty Rate', 'Recoupment', 'Territory', 'Term'],
      advice: 'Always have contracts reviewed by a qualified music attorney before signing.'
    },
    royalties: {
      types: ['Mechanical', 'Performance', 'Synchronization', 'Print'],
      organizations: ['ASCAP', 'BMI', 'SESAC', 'SoundExchange'],
      advice: 'Register with PROs and ensure proper splits are documented.'
    },
    distribution: {
      platforms: ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music'],
      distributors: ['DistroKid', 'CD Baby', 'TuneCore', 'LANDR'],
      advice: 'Choose distribution based on your needs: DIY vs full-service.'
    }
  },

  // Role-specific knowledge
  roles: {
    ceo: {
      strategy: [
        'Focus on sustainable growth and artist development',
        'Build strong industry relationships and partnerships',
        'Invest in technology and data analytics',
        'Develop diverse revenue streams',
        'Maintain healthy cash flow and budgets'
      ],
      challenges: [
        'Adapting to streaming economy',
        'Competition from major labels',
        'Artist retention',
        'Digital transformation',
        'Market saturation'
      ]
    },
    manager: {
      responsibilities: [
        'Career planning and goal setting',
        'Industry networking and relationship building',
        'Contract negotiation and deal-making',
        'Tour planning and logistics',
        'Brand development and marketing coordination'
      ],
      tips: [
        'Always prioritize the artist\'s long-term career',
        'Build a strong team of industry professionals',
        'Stay updated on industry trends and changes',
        'Maintain transparent communication with artists',
        'Focus on sustainable career growth'
      ]
    },
    marketing: {
      strategies: [
        'Develop authentic artist brand identity',
        'Create compelling visual content',
        'Build and engage fan communities',
        'Leverage data-driven insights',
        'Coordinate cross-platform campaigns'
      ],
      platforms: [
        'Social media (Instagram, TikTok, Twitter)',
        'Streaming platforms (Spotify, Apple Music)',
        'YouTube and video content',
        'Email marketing and newsletters',
        'Influencer partnerships'
      ]
    },
    ar: {
      skills: [
        'Talent identification and evaluation',
        'Industry trend analysis',
        'Creative development guidance',
        'Market research and positioning',
        'Relationship building with artists and producers'
      ],
      process: [
        'Discover and evaluate new talent',
        'Develop artist creative direction',
        'Coordinate recording projects',
        'Guide repertoire selection',
        'Monitor market trends and opportunities'
      ]
    },
    legal: {
      areas: [
        'Recording and publishing agreements',
        'Copyright and trademark protection',
        'Licensing and synchronization deals',
        'Touring and performance contracts',
        'Digital rights management'
      ],
      warnings: [
        'This is guidance only, not legal advice',
        'Always consult qualified legal counsel',
        'Laws vary by jurisdiction',
        'Contracts should be reviewed by professionals',
        'Keep detailed records of all agreements'
      ]
    }
  }
};

export const getKnowledgeForRole = (roleId) => {
  const general = KNOWLEDGE_BASE.general;
  const roleSpecific = KNOWLEDGE_BASE.roles[roleId] || {};
  
  return {
    ...general,
    ...roleSpecific
  };
};

export const searchKnowledge = (query, roleId = null) => {
  const knowledge = roleId ? getKnowledgeForRole(roleId) : KNOWLEDGE_BASE.general;
  
  // Simple search implementation
  const results = [];
  const searchTerm = query.toLowerCase();
  
  const searchInObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
        results.push({ path: `${path}.${key}`, content: value });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && item.toLowerCase().includes(searchTerm)) {
            results.push({ path: `${path}.${key}[${index}]`, content: item });
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        searchInObject(value, `${path}.${key}`);
      }
    }
  };
  
  searchInObject(knowledge);
  return results;
};