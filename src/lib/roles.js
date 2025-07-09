// Music Industry Role Definitions for indii.music

export const ROLES = {
  CEO: {
    id: 'ceo',
    name: 'Record Label CEO',
    description: 'Strategic leadership and business development',
    color: '#8B5CF6',
    icon: '👔',
    expertise: [
      'Strategic planning',
      'Business development',
      'Industry partnerships',
      'Financial management',
      'Market analysis',
      'Label operations'
    ]
  },
  MANAGER: {
    id: 'manager',
    name: 'Artist Manager',
    description: 'Career development and artist representation',
    color: '#10B981',
    icon: '🎯',
    expertise: [
      'Career development',
      'Booking and touring',
      'Contract negotiation',
      'Brand management',
      'Industry networking',
      'Artist relations'
    ]
  },
  MARKETING: {
    id: 'marketing',
    name: 'Marketing Specialist',
    description: 'Promotion and fan engagement',
    color: '#F59E0B',
    icon: '📢',
    expertise: [
      'Social media strategy',
      'Fan engagement',
      'Campaign development',
      'Brand positioning',
      'Digital marketing',
      'Content creation'
    ]
  },
  AR: {
    id: 'ar',
    name: 'A&R Representative',
    description: 'Talent scouting and artist development',
    color: '#EF4444',
    icon: '🎵',
    expertise: [
      'Talent scouting',
      'Artist development',
      'Repertoire selection',
      'Creative direction',
      'Industry trends',
      'Music production'
    ]
  },
  LEGAL: {
    id: 'legal',
    name: 'Legal Advisor',
    description: 'Contracts and rights management',
    color: '#6366F1',
    icon: '⚖️',
    expertise: [
      'Contract review',
      'Rights management',
      'Copyright law',
      'Publishing deals',
      'Licensing agreements',
      'Legal compliance'
    ]
  },
  ASSISTANT: {
    id: 'assistant',
    name: 'Music Industry Assistant',
    description: 'General music industry guidance',
    color: '#6B7280',
    icon: '🎼',
    expertise: [
      'General guidance',
      'Industry knowledge',
      'Resource recommendations',
      'Basic advice',
      'Information lookup',
      'Task assistance'
    ]
  }
};

export const getRoleById = (id) => {
  return Object.values(ROLES).find(role => role.id === id) || ROLES.ASSISTANT;
};

export const getAllRoles = () => {
  return Object.values(ROLES);
};