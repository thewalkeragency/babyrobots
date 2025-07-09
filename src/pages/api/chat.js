import AIRouter from '@/lib/ai-router';
import { ROLES, getRoleById } from '@/lib/roles';
import { getKnowledgeForRole } from '@/lib/knowledge-base';

// Initialize AI Router (will be configured with API keys)
const aiRouter = new AIRouter();

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
    const { message, role = 'assistant' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Handle system commands
    if (message.startsWith('/')) {
      const reply = handleSystemCommands(message);
      return res.status(200).json({ reply, role });
    }

    // Check if AI is configured
    if (!isGeminiConfigured()) {
      const reply = `Hello! I'm indii.music, your AI music industry assistant. 

I can help you with different music industry roles:
${Object.values(ROLES).map(r => `${r.icon} ${r.name} - ${r.description}`).join('\n')}

However, I need to be configured with an API key first. Please provide your Gemini API key to enable AI responses.

For now, try these system commands:
/help - Show available commands
/roles - List all available roles
/knowledge [role] - Show knowledge for a specific role
/status - Check system status`;

      return res.status(200).json({ reply, role: 'assistant' });
    }

    // Get role information
    const roleInfo = getRoleById(role);
    
    // Enhance message with role-specific knowledge
    const knowledge = getKnowledgeForRole(role);
    const enhancedMessage = enhanceMessageWithKnowledge(message, knowledge, roleInfo);

    // Generate AI response
    const aiResponse = await aiRouter.route(enhancedMessage, { role });
    
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

function handleSystemCommands(message) {
  const [command, ...args] = message.split(' ');
  
  switch (command) {
    case '/help':
      return `indii.music System Commands:

/help - Show this help message
/roles - List all available roles  
/knowledge [role] - Show knowledge for a specific role
/status - Check system status
/switch [role] - Switch to a different role (use role ID)

Available roles: ${Object.values(ROLES).map(r => r.id).join(', ')}

Just start typing to chat with me in any role!`;

    case '/roles':
      return `Available Music Industry Roles:

${Object.values(ROLES).map(role => 
  `${role.icon} ${role.name} (${role.id})
  ${role.description}
  Expertise: ${role.expertise.join(', ')}`
).join('\n\n')}

Use /switch [role-id] to switch roles or just mention the role in your message.`;

    case '/knowledge':
      const roleId = args[0];
      if (!roleId) {
        return 'Please specify a role. Usage: /knowledge [role-id]\nAvailable roles: ' + Object.values(ROLES).map(r => r.id).join(', ');
      }
      
      const knowledge = getKnowledgeForRole(roleId);
      const roleInfo = getRoleById(roleId);
      
      return `Knowledge Base for ${roleInfo.name}:

${JSON.stringify(knowledge, null, 2)}`;

    case '/status':
      return `indii.music System Status:

🎵 Application: Running
🤖 AI Router: ${isGeminiConfigured() ? 'Configured (Gemini)' : 'Not configured'}
📚 Knowledge Base: Loaded
🎭 Roles: ${Object.keys(ROLES).length} available
🔧 API Version: v1.0

${isGeminiConfigured() ? 'Ready to assist with music industry guidance!' : 'Please configure API key to enable AI responses.'}`;

    default:
      return `Unknown command: ${command}. Type /help for available commands.`;
  }
}

function enhanceMessageWithKnowledge(message, knowledge, roleInfo) {
  // Add role context and relevant knowledge to the message
  const context = `You are ${roleInfo.name} for indii.music. 
Your expertise: ${roleInfo.expertise.join(', ')}.
Your role: ${roleInfo.description}.

Relevant knowledge context:
${JSON.stringify(knowledge, null, 2)}

Please provide helpful, accurate music industry guidance based on your role and expertise.`;

  return `${context}\n\nUser question: ${message}`;
}

function formatResponse(aiResponse, roleInfo) {
  return `${roleInfo.icon} **${roleInfo.name}**\n\n${aiResponse}`;
}
