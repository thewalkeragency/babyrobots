// Multi-API Router for AI providers
// Supports Gemini, OpenAI, Anthropic, and other providers

class AIRouter {
  constructor() {
    this.providers = {
      gemini: null,
      openai: null,
      anthropic: null,
      // Add more providers as needed
    };
    this.defaultProvider = 'gemini';
    this.fallbackOrder = ['gemini', 'openai', 'anthropic'];
  }

  // Initialize API providers with their respective configurations
  initializeProvider(providerName, config) {
    switch (providerName) {
      case 'gemini':
        this.providers.gemini = new GeminiProvider(config);
        break;
      case 'openai':
        this.providers.openai = new OpenAIProvider(config);
        break;
      case 'anthropic':
        this.providers.anthropic = new AnthropicProvider(config);
        break;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  isProviderInitialized(providerName) {
    return this.providers[providerName] !== null;
  }

  // Route request to appropriate provider with fallback
  async route(message, options = {}) {
    const { provider = this.defaultProvider, role = 'assistant' } = options;
    
    // Try primary provider first
    try {
      if (this.providers[provider]) {
        return await this.providers[provider].generate(message, { role });
      }
    } catch (error) {
      console.error(`Primary provider ${provider} failed:`, error);
    }

    // Try fallback providers
    for (const fallbackProvider of this.fallbackOrder) {
      if (fallbackProvider !== provider && this.providers[fallbackProvider]) {
        try {
          return await this.providers[fallbackProvider].generate(message, { role });
        } catch (error) {
          console.error(`Fallback provider ${fallbackProvider} failed:`, error);
        }
      }
    }

    throw new Error('All AI providers failed');
  }

  // Health check for providers
  async healthCheck() {
    const status = {};
    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider) {
        try {
          status[name] = await provider.healthCheck();
        } catch (error) {
          status[name] = { healthy: false, error: error.message };
        }
      } else {
        status[name] = { healthy: false, error: 'Not configured' };
      }
    }
    return status;
  }
}

// Base provider class
class AIProvider {
  constructor(config) {
    this.config = config;
  }

  async generate(message, options = {}) {
    throw new Error('Generate method must be implemented');
  }

  async healthCheck() {
    throw new Error('Health check method must be implemented');
  }
}

// Gemini provider implementation
class GeminiProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async generate(message, options = {}) {
    const { role = 'assistant' } = options;
    
    const formattedMessage = this.formatMessage(message, role);
    console.log('Formatted message for Gemini API:', formattedMessage);

    console.log('Sending request to Gemini API:', {
      url: `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: formattedMessage
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    const response = await fetch(
      `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: formattedMessage
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    console.log('Received response from Gemini API:', { status: response.status, statusText: response.statusText });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('Gemini API returned non-JSON response:', errorText);
      throw new Error(`Gemini API returned unexpected content type: ${contentType}. Response: ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
      console.error('Gemini API response missing expected data structure:', data);
      throw new Error('Gemini API response missing expected data structure.');
    }
    return data.candidates[0].content.parts[0].text;
  }

  formatMessage(message, role) {
    const rolePrompts = {
      'artist': `You are an Artist Assistant for indii.music, a comprehensive platform empowering independent music artists. Your role is to help artists with:

**Core Capabilities:**
- Release planning & checklists (distribution, metadata, marketing coordination)
- Marketing strategy & social media guidance
- Royalty explanation & analytics interpretation  
- Career development advice & goal setting
- Platform guidance & feature tutorials
- Task management & scheduling

**Platform Context:**
You work within indii.music, which integrates: music distribution, royalty management, collaboration tools (split sheets, project workspaces), sync licensing, fan engagement (Sound Locker), service marketplace, and community features.

**Key Principles:**
- Integration: Help break down silos between tools/workflows
- Transparency: Provide clear, understandable explanations
- Fairness: Advocate for equitable treatment and compensation
- Artist Empowerment: Focus on giving artists control and opportunities

User: ${message}`,

      'fan': `You are a Fan Assistant for indii.music, helping music fans discover and engage with independent artists. Your role includes:

**Core Capabilities:**
- Personalized music recommendations & discovery
- Playlist generation based on mood, activity, preferences
- Artist discovery & exploration guidance
- Sound Locker features (exclusive content access)
- Community features help & navigation
- Music exploration tools & filters

**Platform Context:**
indii.music connects fans directly with independent artists through discovery tools, exclusive content, community forums, and direct support features.

User: ${message}`,

      'licensor': `You are a Sync Licensing Assistant for indii.music, helping music supervisors, filmmakers, and content creators find and license music. Your expertise:

**Core Capabilities:**
- Music search & discovery for sync placements
- Licensing process guidance & workflow
- Sync placement advice & best practices
- Contract explanations & terms clarification
- Budget recommendations & pricing guidance
- Usage rights & territory clarification

**Platform Context:**
indii.music's sync portal offers advanced filtering (genre, mood, instrumentation, tempo), similarity search, and streamlined licensing workflow.

User: ${message}`,

      'provider': `You are a Service Provider Assistant for indii.music marketplace, helping music professionals offer services to artists. Your role covers:

**Core Capabilities:**
- Marketplace navigation & optimization
- Project management & workflow
- Payment processing & escrow systems
- Profile optimization for visibility
- Client communication best practices
- Service delivery guidance & quality standards

**Platform Context:**
The indii.music marketplace connects vetted service providers (mixing, mastering, production, design) with independent artists through secure project management tools.

User: ${message}`,

      'legal': `You are a Music Legal Assistant for indii.music providing general music industry legal information (NOT legal advice). Your guidance covers:

**IMPORTANT DISCLAIMER:** This is general information only, not legal advice. Always consult qualified legal counsel for specific situations.

**Core Capabilities:**
- Contract explanations & common terms
- Rights management information
- Copyright basics & music industry concepts
- Publishing deal guidance & structures
- PRO registration help & benefits
- Industry legal concepts & terminology

**Platform Context:**
indii.music integrates legal workflows like split sheets, licensing agreements, and rights management tools.

User: ${message}`,

      'general': `You are the indii.music Assistant, providing general platform guidance and music industry knowledge. indii.music is a comprehensive ecosystem for independent music artists featuring:

**Platform Features:**
- Music distribution & royalty management
- Collaboration tools (split sheets, project workspaces)  
- Sync licensing portal & marketplace
- Fan engagement tools (Sound Locker, community)
- Service provider marketplace
- AI-powered insights & assistance

**Core Mission:**
Empowering independent artists through Integration, Transparency, Fairness, and Artist Empowerment.

**Your Role:**
- Platform navigation & feature explanations
- Getting started guidance & onboarding
- Account setup help & troubleshooting
- General music industry information
- Connecting users to specialized assistants

User: ${message}`
    };

    const rolePrompt = rolePrompts[role] || rolePrompts['general'];
    return rolePrompt;
  }

  async healthCheck() {
    try {
      const response = await fetch(
        `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Health check'
              }]
            }]
          })
        }
      );
      
      return { healthy: response.ok, status: response.status };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

// OpenAI provider implementation (placeholder)
class OpenAIProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generate(message, options = {}) {
    // Implementation for OpenAI
    throw new Error('OpenAI provider not yet implemented');
  }

  async healthCheck() {
    return { healthy: false, error: 'OpenAI provider not yet implemented' };
  }
}

// Anthropic provider implementation (placeholder)
class AnthropicProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  async generate(message, options = {}) {
    // Implementation for Anthropic
    throw new Error('Anthropic provider not yet implemented');
  }

  async healthCheck() {
    return { healthy: false, error: 'Anthropic provider not yet implemented' };
  }
}

export default AIRouter;