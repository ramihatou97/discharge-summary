/**
 * Tests for Hybrid Discharge Summary Service
 */

import { describe, it, expect } from 'vitest';
import { NeurosurgicalDischargeSummaryService } from '../services/discharge_summary_service.js';
import { DischargeSummaryConfig } from '../config/llm_config.js';
import { StructuredDataExtractor } from '../extractors/structured_data_extractor.js';
import { ExtractDemographics } from '../extractors/demographics_extractor.js';
import { ExtractDates } from '../extractors/date_extractor.js';
import { ExtractMedications } from '../extractors/medication_extractor.js';

describe('Hybrid LLM Architecture', () => {
  describe('DischargeSummaryConfig', () => {
    it('should create config with default values', () => {
      const config = new DischargeSummaryConfig();
      
      expect(config.modelProvider).toBe('anthropic');
      expect(config.temperature).toBe(0.1);
      expect(config.maxTokens).toBe(4000);
    });

    it('should determine if config is configured', () => {
      const unconfigured = new DischargeSummaryConfig();
      expect(unconfigured.isConfigured()).toBe(false);

      const configured = new DischargeSummaryConfig({
        anthropicApiKey: 'test-key'
      });
      expect(configured.isConfigured()).toBe(true);
    });

    it('should get correct API key for provider', () => {
      const config = new DischargeSummaryConfig({
        anthropicApiKey: 'claude-key',
        openaiApiKey: 'openai-key',
        modelProvider: 'anthropic'
      });

      expect(config.getApiKey()).toBe('claude-key');
    });
  });

  describe('ExtractDemographics', () => {
    it('should extract patient demographics', () => {
      const extractor = new ExtractDemographics();
      const text = 'Patient Name: John Doe. Age: 45 years old. Sex: Male. MRN: 123456';
      
      const result = extractor.extract(text);
      
      expect(result.patientName).toBe('John Doe');
      expect(result.age).toBe('45');
      expect(result.sex).toBe('Male');
      expect(result.mrn).toBe('123456');
    });

    it('should normalize sex values', () => {
      const extractor = new ExtractDemographics();
      
      expect(extractor.normalizeSex('M')).toBe('Male');
      expect(extractor.normalizeSex('F')).toBe('Female');
      expect(extractor.normalizeSex('male')).toBe('Male');
      expect(extractor.normalizeSex('FEMALE')).toBe('Female');
    });
  });

  describe('ExtractDates', () => {
    it('should extract admission and discharge dates', () => {
      const extractor = new ExtractDates();
      const admissionNote = 'Admission Date: 12/15/2024';
      const finalNote = 'Discharge Date: 12/20/2024';
      
      const result = extractor.extract(admissionNote, finalNote);
      
      expect(result.admitDate).toContain('12/15/2024');
      expect(result.dischargeDate).toContain('12/20/2024');
    });

    it('should normalize date formats', () => {
      const extractor = new ExtractDates();
      
      const normalized = extractor.normalizeDate('1/5/24');
      expect(normalized).toBe('01/05/2024');
    });
  });

  describe('ExtractMedications', () => {
    it('should extract medications with doses', () => {
      const extractor = new ExtractMedications();
      const text = 'Discharge medications: Keppra 500mg PO BID, Decadron 4mg PO daily';
      
      const result = extractor.extract(text);
      
      expect(result.medications.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(0);
    });

    it('should format medications correctly', () => {
      const extractor = new ExtractMedications();
      
      const formatted = extractor.formatMedication('Keppra', '500', 'mg', 'PO', 'BID');
      expect(formatted).toContain('Keppra');
      expect(formatted).toContain('500mg');
    });
  });

  describe('StructuredDataExtractor', () => {
    it('should coordinate all extractors', () => {
      const extractor = new StructuredDataExtractor();
      const notes = {
        admission: 'Patient Name: Jane Smith, Age: 50, Sex: Female, MRN: 789. Admission Date: 12/15/2024',
        final: 'Discharge Date: 12/20/2024. Discharge medications: Keppra 500mg PO BID'
      };
      
      const result = extractor.extract(notes);
      
      expect(result.patientName).toBe('Jane Smith');
      expect(result.age).toBe('50');
      expect(result.sex).toBe('Female');
      expect(result.extractionMethod).toBe('deterministic');
    });

    it('should calculate confidence scores', () => {
      const extractor = new StructuredDataExtractor();
      
      const data = { field1: 'value', field2: '', field3: 'value' };
      const confidence = extractor.calculateConfidence(data);
      
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('NeurosurgicalDischargeSummaryService', () => {
    it('should create service with config', () => {
      const config = new DischargeSummaryConfig();
      const service = new NeurosurgicalDischargeSummaryService(config);
      
      expect(service).toBeDefined();
      expect(service.structuredExtractor).toBeDefined();
      expect(service.validator).toBeDefined();
    });

    it('should return hybrid pipeline info', () => {
      const config = new DischargeSummaryConfig();
      const service = new NeurosurgicalDischargeSummaryService(config);
      
      const pipeline = service.getHybridPipeline();
      
      expect(Array.isArray(pipeline)).toBe(true);
      expect(pipeline.length).toBeGreaterThan(0);
      
      // Check for deterministic components
      const demographics = pipeline.find(p => p.name === 'ExtractDemographics');
      expect(demographics).toBeDefined();
      expect(demographics.type).toBe('rule-based');
      
      // Check for LLM components
      const complications = pipeline.find(p => p.name === 'LLMComplicationDetector');
      expect(complications).toBeDefined();
      expect(complications.type).toBe('llm');
    });

    it('should generate summary with patterns only', () => {
      const config = new DischargeSummaryConfig();
      const service = new NeurosurgicalDischargeSummaryService(config);
      
      const notes = {
        admission: 'John Doe is a 45 year old male admitted with headache. MRN: 123. Admission Date: 12/15/2024',
        progress: 'Patient doing well post-operatively.',
        final: 'Discharge Date: 12/20/2024. Discharged home in stable condition.'
      };
      
      const result = service.generateWithPatternsOnly(notes);
      
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.completeness).toBeDefined();
      expect(result.pipeline).toBeDefined();
      expect(result.metadata.approach).toBe('deterministic-only');
    });
  });
});
