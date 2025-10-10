/**
 * LLM Integration Engine
 * Main engine for LLM-powered discharge summary generation
 */

import { DischargeSummaryPrompts } from '../prompts/discharge_summary_prompts.js';

export class LLMDischargeSummaryEngine {
  constructor(config) {
    this.config = config;
    this.promptTemplate = DischargeSummaryPrompts;
  }

  /**
   * Generate discharge summary using configured LLM provider
   * @param {string} prompt - The prompt to send to the LLM
   * @param {Object} options - Generation options (temperature, maxTokens)
   * @returns {Promise<string>} LLM response
   */
  async generate(prompt, options = {}) {
    const provider = this.config.modelProvider;
    
    switch (provider) {
      case 'anthropic':
        return this.generateWithClaude(prompt, options);
      case 'openai':
        return this.generateWithOpenAI(prompt, options);
      case 'google':
        return this.generateWithGemini(prompt, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Generate using Anthropic Claude
   */
  async generateWithClaude(prompt, options) {
    const apiKey = this.config.apiKeys.anthropic;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.modelName,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature ?? this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.content?.[0]?.text || '';
  }

  /**
   * Generate using OpenAI GPT
   */
  async generateWithOpenAI(prompt, options) {
    const apiKey = this.config.apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a neurosurgery medical AI assistant specializing in clinical documentation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature ?? this.config.temperature,
        max_tokens: options.maxTokens || this.config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || '';
  }

  /**
   * Generate using Google Gemini
   */
  async generateWithGemini(prompt, options) {
    const apiKey = this.config.apiKeys.google;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: options.temperature ?? this.config.temperature,
            maxOutputTokens: options.maxTokens || this.config.maxTokens
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Parse JSON from LLM response
   * @param {string} response - LLM response text
   * @returns {Object|null} Parsed JSON or null
   */
  parseJSON(response) {
    try {
      // Try direct parse first
      return JSON.parse(response);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e2) {
          // Continue to next method
        }
      }

      // Try to find JSON object in response
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch (e3) {
          console.error('Failed to parse JSON from response:', e3);
        }
      }
    }

    return null;
  }

  /**
   * Generate complete discharge summary
   * @param {Object} notes - Clinical notes object
   * @param {Object} structuredData - Pre-extracted structured data
   * @returns {Promise<Object>} Complete discharge summary
   */
  async generateDischargeSummary(notes, structuredData = {}) {
    const prompt = this.promptTemplate.NEUROSURGICAL_DISCHARGE_PROMPT(
      notes,
      'Focus on Infectious Disease and Thrombosis recommendations',
      JSON.stringify(this.promptTemplate.JSON_SCHEMA, null, 2)
    );

    const response = await this.generate(prompt);
    const parsed = this.parseJSON(response);

    if (parsed) {
      // Merge with structured data (structured data takes precedence for demographics and dates)
      return {
        ...parsed,
        // Override with deterministic extractions
        patientName: structuredData.patientName || parsed.patientName,
        age: structuredData.age || parsed.age,
        sex: structuredData.sex || parsed.sex,
        mrn: structuredData.mrn || parsed.mrn,
        admitDate: structuredData.admitDate || parsed.admitDate,
        dischargeDate: structuredData.dischargeDate || parsed.dischargeDate,
        dischargeMedications: structuredData.dischargeMedications || parsed.dischargeMedications,
        extractionMethod: 'hybrid',
        llmProvider: this.config.modelProvider
      };
    }

    throw new Error('Failed to parse LLM response');
  }
}
