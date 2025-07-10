// Music Industry Role Definitions for indii.music
// Based on IndieLeap Functional Requirements Specification

export const ROLES = {
  ARTIST_ASSISTANT: {
    id: 'artist',
    name: 'Artist Assistant',
    description: 'Your personal music career advisor and task manager',
    color: '#8B5CF6',
    icon: '🎵',
    expertise: [
      'Release planning & checklists',
      'Marketing strategy & social media',
      'Royalty explanation & analytics',
      'Career development advice',
      'Platform guidance & tutorials',
      'Task management & scheduling'
    ]
  },
  FAN_ASSISTANT: {
    id: 'fan',
    name: 'Fan Assistant',
    description: 'Music discovery and fan engagement specialist',
    color: '#10B981',
    icon: '🎧',
    expertise: [
      'Personalized music recommendations',
      'Playlist generation',
      'Artist discovery',
      'Sound Locker guidance',
      'Community features help',
      'Music exploration'
    ]
  },
  LICENSOR_ASSISTANT: {
    id: 'licensor',
    name: 'Sync Licensing Assistant',
    description: 'Music licensing and sync placement specialist',
    color: '#F59E0B',
    icon: '🎬',
    expertise: [
      'Music search & discovery',
      'Licensing process guidance',
      'Sync placement advice',
      'Contract explanations',
      'Budget recommendations',
      'Usage rights clarification'
    ]
  },
  PROVIDER_ASSISTANT: {
    id: 'provider',
    name: 'Service Provider Assistant',
    description: 'Marketplace and service delivery specialist',
    color: '#EF4444',
    icon: '🛠️',
    expertise: [
      'Marketplace navigation',
      'Project management',
      'Payment processing help',
      'Profile optimization',
      'Client communication',
      'Service delivery guidance'
    ]
  },
  LEGAL_ASSISTANT: {
    id: 'legal',
    name: 'Music Legal Assistant',
    description: 'Music industry legal guidance (not legal advice)',
    color: '#6366F1',
    icon: '⚖️',
    expertise: [
      'Contract explanations',
      'Rights management info',
      'Copyright basics',
      'Publishing deal guidance',
      'PRO registration help',
      'Industry legal concepts'
    ]
  },
  GENERAL_ASSISTANT: {
    id: 'general',
    name: 'indii.music Assistant',
    description: 'General platform guidance and music industry knowledge',
    color: '#6B7280',
    icon: '🎼',
    expertise: [
      'Platform navigation',
      'Feature explanations', 
      'Getting started guidance',
      'Account setup help',
      'General music industry info',
      'Troubleshooting support'
    ]
  }
};

export const getRoleById = (id) => {
  return Object.values(ROLES).find(role => role.id === id) || ROLES.GENERAL_ASSISTANT;
};

export const getAllRoles = () => {
  return Object.values(ROLES);
};