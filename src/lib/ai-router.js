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
    
    const response = await fetch(
      `${this.baseUrl}/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: this.formatMessage(message, role)
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  formatMessage(message, role) {
    const rolePrompts = {
      'ceo': 'You are a record label CEO. Provide strategic, business-focused advice for the music industry.',
      'manager': 'You are an artist manager. Help with career development, bookings, and artist representation.',
      'marketing': 'You are a music marketing specialist. Provide advice on promotion, social media, and fan engagement.',
      'ar': 'You are an A&R representative. Help with talent scouting, artist development, and repertoire decisions.',
      'legal': 'You are a music industry legal advisor. Provide guidance on contracts, rights, and legal matters (not legal advice).',
      'assistant': 'You are a knowledgeable music industry assistant. Help with general music industry questions and guidance.'
    };

    const rolePrompt = rolePrompts[role] || rolePrompts['assistant'];
    return `${rolePrompt}\n\nUser: ${message}`;
  }

  async healthCheck() {
    try {
      const response = await fetch(
        `${this.baseUrl}/gemini-pro:generateContent?key=${this.apiKey}`,
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