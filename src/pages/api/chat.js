import AIRouter from '@/lib/ai-router';
import { ROLES, getRoleById } from '@/lib/roles';
import { getKnowledgeForRole } from '@/lib/knowledge-base';

// Initialize AI Router
const aiRouter = new AIRouter();

// Enhanced AI capabilities
const ENHANCED_TASKS = {
  'release_checklist': {
    trigger: ['release', 'checklist', 'plan', 'launch'],
    template: `Generate a comprehensive release checklist for {releaseType} with timeline:
    
    **PRE-PRODUCTION (8-12 weeks before)**
    - [ ] Finalize track selection and order
    - [ ] Create/verify split sheets in indii.music
    - [ ] Register with PRO (ASCAP/BMI/SESAC)
    - [ ] Plan marketing strategy
    
    **PRODUCTION (6-8 weeks before)**
    - [ ] Complete mixing and mastering
    - [ ] Create high-resolution artwork (3000x3000px)
    - [ ] Prepare metadata (ISRC, genre, mood tags)
    - [ ] Set up Sound Locker exclusive content
    
    **PRE-RELEASE (4-6 weeks before)**
    - [ ] Submit to indii.music distribution
    - [ ] Generate smart links and EPK
    - [ ] Pitch to playlist curators
    - [ ] Schedule social media content
    
    **RELEASE WEEK**
    - [ ] Monitor analytics dashboard
    - [ ] Engage with fans via Sound Locker
    - [ ] Share on social media
    - [ ] Track playlist adds
    
    **POST-RELEASE (1-4 weeks after)**
    - [ ] Analyze performance metrics
    - [ ] Plan follow-up content
    - [ ] Consider sync licensing opportunities
    - [ ] Prepare next release`
  },
  
  'social_media_post': {
    trigger: ['post', 'social', 'instagram', 'twitter', 'tiktok'],
    template: `🎵 **NEW RELEASE ALERT** 🎵

"{trackTitle}" is now live on indii.music!

✨ {genreVibes} vibes for your {mood} playlist
🎧 Stream now: [indii.music link]
🔐 Exclusive content in Sound Locker
💿 Available on all platforms

#{genre} #indiimusic #independentartist #newmusic #{artistName}

---
📸 Visual suggestion: Studio shot with artwork overlay
⏰ Best posting time: {timeRecommendation}
🎯 Target: {targetAudience}`
  },
  
  'royalty_explanation': {
    trigger: ['royalty', 'earnings', 'revenue', 'payment'],
    template: `**Your Royalty Breakdown - Simple Explanation**

💰 **Total Earnings:** ${totalEarnings}
📈 **Change from last month:** {changePercent}%

**Where your money came from:**
🎵 Streaming (Spotify, Apple Music): ${streamingRevenue}
📻 Performance (ASCAP/BMI): ${performanceRevenue}
🎬 Sync Licensing: ${syncRevenue}
🔐 Sound Locker Sales: ${directRevenue}

**Platform fees (transparent):**
- indii.music commission: {platformFee}% (${platformFeeAmount})
- Payment processing: ${processingFee}
- **You keep:** ${netPayout} ({artistShare}%)

**What this means:** {explanation}

**Next steps:** {recommendations}`
  }
};

// Check if Gemini is configured
const isGeminiConfigured = () => {
  return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';
};

// Initialize Gemini provider if API key is available
if (isGeminiConfigured()) {
  aiRouter.initializeProvider('gemini', {
    apiKey: process.env.GEMINI_API_KEY
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { message, role = 'general' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Handle system commands
    if (message.startsWith('/')) {
      const reply = handleSystemCommands(message, role);
      return res.status(200).json({ reply, role });
    }

    // Check if AI is configured
    if (!isGeminiConfigured()) {
      const reply = `Hello! I'm your indii.music AI assistant. 

I'm ready to help with:
${Object.values(ROLES).map(r => `${r.icon} ${r.name} - ${r.description}`).join('\n')}

However, I need to be configured with an API key first. Please provide your Gemini API key to enable AI responses.

For now, try these system commands:
/help - Show available commands
/roles - List all available roles
/demo - See enhanced AI capabilities
/status - Check system status`;

      return res.status(200).json({ reply, role: 'general' });
    }

    // Enhanced AI task detection
    const detectedTask = detectEnhancedTask(message);
    let enhancedMessage = message;

    if (detectedTask) {
      enhancedMessage = `${message}\n\n[ENHANCED TASK: ${detectedTask}]`;
    }

    // Get role information
    const roleInfo = getRoleById(role);
    
    // Enhance message with role-specific knowledge
    const knowledge = getKnowledgeForRole(role);
    const contextualMessage = enhanceMessageWithKnowledge(enhancedMessage, knowledge, roleInfo);

    // Generate AI response
    const aiResponse = await aiRouter.route(contextualMessage, { role });
    
    // Format response with role context
    const reply = formatResponse(aiResponse, roleInfo);

    return res.status(200).json({ reply, role });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.',
      details: error.message 
    });
  }
}

function detectEnhancedTask(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [taskType, config] of Object.entries(ENHANCED_TASKS)) {
    if (config.trigger.some(trigger => lowerMessage.includes(trigger))) {
      return taskType;
    }
  }
  
  return null;
}

function handleSystemCommands(message, role) {
  const [command, ...args] = message.split(' ');
  
  switch (command) {
    case '/help':
      return `🎵 **indii.music AI Assistant Commands**

**System Commands:**
/help - Show this help message
/roles - List all available roles  
/demo - See enhanced AI capabilities
/status - Check system status
/switch [role] - Switch to a different role

**Available Roles:**
${Object.values(ROLES).map(r => `${r.icon} ${r.name} (${r.id})`).join('\n')}

**Enhanced AI Features:**
- Release checklist generation
- Social media post creation
- Royalty explanations
- Marketing strategy advice
- Career development guidance

Just start typing to chat with me in any role!`;

    case '/roles':
      return `🎭 **Available indii.music AI Assistants**

${Object.values(ROLES).map(role => 
  `${role.icon} **${role.name}** (${role.id})
  ${role.description}
  
  **Expertise:** ${role.expertise.join(', ')}
  ${role.id === role ? '← *Currently Active*' : ''}`
).join('\n\n')}

Use /switch [role-id] to switch roles or just mention what you need help with!`;

    case '/demo':
      return `🚀 **Enhanced AI Capabilities Demo**

**🎵 Artist Assistant Powers:**
- "Help me create a release checklist" → Full timeline with tasks
- "Write an Instagram post for my new song" → Platform-optimized content
- "Explain my royalty statement" → Clear revenue breakdown
- "Plan my marketing strategy" → Comprehensive campaign plan

**🎧 Fan Assistant Powers:**
- "Create a chill playlist for studying" → Personalized recommendations
- "Find artists similar to [artist]" → Discovery suggestions
- "What's new in indie rock?" → Latest releases and trends

**🎬 Sync Licensing Powers:**
- "Find music for a car commercial" → Filtered search results
- "Explain sync licensing terms" → Clear contract guidance

**Try asking me anything! I'm powered by advanced AI with deep music industry knowledge.**`;

    case '/status':
      return `🔥 **indii.music System Status**

🎵 **Application:** Running on localhost:2001
🤖 **AI System:** ${isGeminiConfigured() ? '✅ Fully Operational (Gemini-powered)' : '❌ Not configured'}
🎭 **Active Roles:** ${Object.keys(ROLES).length} specialized assistants
📚 **Knowledge Base:** ✅ Loaded with music industry expertise
🚀 **Enhanced Features:** ✅ Release planning, social media, royalty analysis
🔧 **API Integration:** ✅ Multi-provider support ready

**Current Role:** ${getRoleById(role).name}

${isGeminiConfigured() ? '🎶 Ready to help with your music career!' : '⚠️ Please configure API key to enable AI responses.'}

**Next Updates:** User management, file uploads, dashboard widgets`;

    case '/switch':
      const newRole = args[0];
      if (!newRole) {
        return 'Please specify a role. Usage: /switch [role-id]\nAvailable roles: ' + Object.values(ROLES).map(r => r.id).join(', ');
      }
      
      const roleInfo = getRoleById(newRole);
      if (roleInfo.id === 'general' && newRole !== 'general') {
        return `Role '${newRole}' not found. Available roles: ${Object.values(ROLES).map(r => r.id).join(', ')}`;
      }
      
      return `🎭 **Switched to ${roleInfo.name}**

${roleInfo.icon} **${roleInfo.name}**
${roleInfo.description}

**My expertise:** ${roleInfo.expertise.join(', ')}

How can I help you today?`;

    default:
      return `Unknown command: ${command}. Type /help for available commands.`;
  }
}

function enhanceMessageWithKnowledge(message, knowledge, roleInfo) {
  const context = `You are ${roleInfo.name} for indii.music. 
Your expertise: ${roleInfo.expertise.join(', ')}.
Your role: ${roleInfo.description}.

Platform context: indii.music is a comprehensive ecosystem for independent artists featuring integrated distribution, royalty management, AI assistance, collaboration tools, sync licensing, fan engagement, and service marketplace.

Key principles: Integration, Transparency, Fairness, Artist Empowerment.

Relevant knowledge: ${JSON.stringify(knowledge, null, 2)}

Please provide helpful, accurate, and actionable guidance. Be specific about indii.music features when relevant.`;

  return `${context}\n\nUser: ${message}`;
}

function formatResponse(aiResponse, roleInfo) {
  return `${roleInfo.icon} **${roleInfo.name}**\n\n${aiResponse}`;
}
