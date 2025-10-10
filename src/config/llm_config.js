/**
 * LLM Configuration for Discharge Summary Generation
 * Manages configuration for different LLM providers (Anthropic, OpenAI, Google)
 */

export class DischargeSummaryConfig {
  constructor(options = {}) {
    this.modelProvider = options.modelProvider || 'anthropic'; // 'anthropic', 'openai', 'google'
    this.modelName = options.modelName || this.getDefaultModel();
    this.temperature = options.temperature !== undefined ? options.temperature : 0.1; // Low for medical accuracy
    this.maxTokens = options.maxTokens || 4000;
    this.apiKeys = {
      anthropic: options.anthropicApiKey || null,
      openai: options.openaiApiKey || null,
      google: options.googleApiKey || null
    };
  }

  getDefaultModel() {
    const defaults = {
      anthropic: 'claude-3-sonnet-20240229',
      openai: 'gpt-4',
      google: 'gemini-pro'
    };
    return defaults[this.modelProvider] || defaults.anthropic;
  }

  getApiKey() {
    return this.apiKeys[this.modelProvider];
  }

  isConfigured() {
    return this.getApiKey() !== null;
  }

  static fromLocalStorage() {
    const savedGemini = localStorage.getItem('geminiApiKey');
    const savedOpenAI = localStorage.getItem('openaiApiKey');
    const savedClaude = localStorage.getItem('claudeApiKey');

    return new DischargeSummaryConfig({
      googleApiKey: savedGemini,
      openaiApiKey: savedOpenAI,
      anthropicApiKey: savedClaude
    });
  }
}

export const DEFAULT_CONFIG = new DischargeSummaryConfig();
