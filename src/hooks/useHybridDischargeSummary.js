/**
 * React Hook for Hybrid Discharge Summary Service
 * Integrates the hybrid pipeline into React components
 */

import { useState, useCallback } from 'react';
import { NeurosurgicalDischargeSummaryService } from '../services/discharge_summary_service.js';
import { DischargeSummaryConfig } from '../config/llm_config.js';

export const useHybridDischargeSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Generate discharge summary using hybrid pipeline
   * @param {Object} notes - Clinical notes object
   * @param {Object} apiKeys - API keys for LLM providers
   * @param {boolean} useLLM - Whether to use LLM or patterns only
   * @returns {Promise<Object>} Generated summary with validation
   */
  const generateSummary = useCallback(async (notes, apiKeys = {}, useLLM = false) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create configuration
      const config = new DischargeSummaryConfig({
        anthropicApiKey: apiKeys.claude,
        openaiApiKey: apiKeys.openai,
        googleApiKey: apiKeys.gemini,
        modelProvider: determineProvider(apiKeys),
        temperature: 0.1,
        maxTokens: 4000
      });

      // Create service
      const service = new NeurosurgicalDischargeSummaryService(config);

      // Generate summary
      let summaryResult;
      if (useLLM && config.isConfigured()) {
        console.log('Using hybrid pipeline with LLM...');
        summaryResult = await service.generateDischargeSummary(notes);
      } else {
        console.log('Using deterministic extraction only...');
        summaryResult = service.generateWithPatternsOnly(notes);
      }

      setResult(summaryResult);
      return summaryResult;
    } catch (err) {
      console.error('Discharge summary generation error:', err);
      setError(err.message || 'Failed to generate discharge summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get pipeline information
   */
  const getPipelineInfo = useCallback((apiKeys = {}) => {
    const config = new DischargeSummaryConfig({
      anthropicApiKey: apiKeys.claude,
      openaiApiKey: apiKeys.openai,
      googleApiKey: apiKeys.gemini
    });

    const service = new NeurosurgicalDischargeSummaryService(config);
    return service.getHybridPipeline();
  }, []);

  return {
    loading,
    error,
    result,
    generateSummary,
    getPipelineInfo
  };
};

/**
 * Determine which provider to use based on available API keys
 */
function determineProvider(apiKeys) {
  if (apiKeys.claude) return 'anthropic';
  if (apiKeys.openai) return 'openai';
  if (apiKeys.gemini) return 'google';
  return 'anthropic'; // Default
}
