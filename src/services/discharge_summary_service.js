/**
 * Neurosurgical Discharge Summary Service
 * Orchestrates the hybrid pipeline combining deterministic and LLM extraction
 */

import { StructuredDataExtractor } from '../extractors/structured_data_extractor.js';
import { LLMDischargeSummaryEngine } from '../core/llm_integration.js';
import { LLMComplicationDetector } from '../llm/complication_detector.js';
import { LLMClinicalSynthesizer } from '../llm/clinical_synthesizer.js';
import { LLMConsultantParser } from '../llm/consultant_parser.js';
import { ClinicalDataValidator } from '../validators/clinical_validator.js';

export class NeurosurgicalDischargeSummaryService {
  constructor(config) {
    this.config = config;
    this.llmEngine = new LLMDischargeSummaryEngine(config);
    this.validator = new ClinicalDataValidator();
    this.structuredExtractor = new StructuredDataExtractor();
    
    // LLM-powered components
    this.complicationDetector = new LLMComplicationDetector(this.llmEngine, config);
    this.clinicalSynthesizer = new LLMClinicalSynthesizer(this.llmEngine, config);
    this.consultantParser = new LLMConsultantParser(this.llmEngine, config);
  }

  /**
   * Main entry point for discharge summary generation using hybrid approach
   * @param {Object} notes - Clinical notes (admission, progress, consultant, procedure, final)
   * @returns {Promise<Object>} Complete discharge summary with validation
   */
  async generateDischargeSummary(notes) {
    try {
      // STEP 1: Deterministic extraction for structured data
      console.log('Step 1: Deterministic extraction...');
      const structuredData = this.structuredExtractor.extract(notes);
      
      // STEP 2: LLM-powered complication detection
      console.log('Step 2: LLM complication detection...');
      let complications = { complications: [], hasComplications: false };
      if (this.config.isConfigured()) {
        try {
          complications = await this.complicationDetector.detect(notes, structuredData);
        } catch (error) {
          console.warn('Complication detection failed, using fallback:', error);
          complications = this.complicationDetector.fallbackDetection(notes);
        }
      } else {
        complications = this.complicationDetector.fallbackDetection(notes);
      }
      
      // STEP 3: LLM-powered consultant parsing
      console.log('Step 3: LLM consultant parsing...');
      let consultantData = { consultants: [], recommendations: [] };
      if (this.config.isConfigured() && notes.consultant) {
        try {
          consultantData = await this.consultantParser.parse(notes.consultant);
        } catch (error) {
          console.warn('Consultant parsing failed, using fallback:', error);
          consultantData = this.consultantParser.fallbackParsing(notes.consultant);
        }
      } else if (notes.consultant) {
        consultantData = this.consultantParser.fallbackParsing(notes.consultant);
      }
      
      // STEP 4: Merge structured and LLM data
      console.log('Step 4: Merging data...');
      const mergedData = {
        ...structuredData,
        complications: complications.complications,
        hasComplications: complications.hasComplications,
        consultantRecommendations: consultantData.recommendations,
        consultants: consultantData.consultants
      };
      
      // STEP 5: LLM-powered clinical synthesis
      console.log('Step 5: LLM clinical synthesis...');
      let finalData = mergedData;
      if (this.config.isConfigured()) {
        try {
          finalData = await this.clinicalSynthesizer.synthesize(mergedData, notes);
        } catch (error) {
          console.warn('Clinical synthesis failed, using structured data:', error);
          finalData = this.clinicalSynthesizer.fallbackSynthesis(mergedData);
        }
      } else {
        finalData = this.clinicalSynthesizer.fallbackSynthesis(mergedData);
      }
      
      // STEP 6: Validate output
      console.log('Step 6: Validating output...');
      const validation = this.validator.validateClinicalAccuracy(
        finalData,
        { ...structuredData, rawNotes: JSON.stringify(notes) }
      );
      
      const completeness = this.validator.validateCompleteness(finalData);
      
      return {
        summary: finalData,
        validation,
        completeness,
        pipeline: {
          structuredExtraction: 'completed',
          complicationDetection: complications.method || 'llm',
          consultantParsing: consultantData.method || 'llm',
          clinicalSynthesis: finalData.synthesisMethod || 'llm',
          validationStatus: validation.isValid ? 'passed' : 'warnings'
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          approach: 'hybrid',
          llmProvider: this.config.isConfigured() ? this.config.modelProvider : 'none',
          version: '1.0.0'
        }
      };
    } catch (error) {
      console.error('Discharge summary generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate summary using pattern-based extraction only (no LLM)
   * @param {Object} notes - Clinical notes
   * @returns {Object} Discharge summary from deterministic extraction only
   */
  generateWithPatternsOnly(notes) {
    console.log('Generating with patterns only (no LLM)...');
    
    const structuredData = this.structuredExtractor.extract(notes);
    
    // Use fallback methods for complex tasks
    const complications = this.complicationDetector.fallbackDetection(notes);
    const consultantData = this.consultantParser.fallbackParsing(notes.consultant || '');
    
    const mergedData = {
      ...structuredData,
      complications: complications.complications,
      hasComplications: complications.hasComplications,
      consultantRecommendations: consultantData.recommendations,
      consultants: consultantData.consultants
    };
    
    const finalData = this.clinicalSynthesizer.fallbackSynthesis(mergedData);
    
    const validation = this.validator.validateClinicalAccuracy(
      finalData,
      { ...structuredData, rawNotes: JSON.stringify(notes) }
    );
    
    const completeness = this.validator.validateCompleteness(finalData);
    
    return {
      summary: finalData,
      validation,
      completeness,
      pipeline: {
        structuredExtraction: 'completed',
        complicationDetection: 'fallback',
        consultantParsing: 'fallback',
        clinicalSynthesis: 'fallback',
        validationStatus: validation.isValid ? 'passed' : 'warnings'
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        approach: 'deterministic-only',
        llmProvider: 'none',
        version: '1.0.0'
      }
    };
  }

  /**
   * Hybrid implementation - recommended approach
   * Combines deterministic extraction with LLM for complex tasks
   */
  getHybridPipeline() {
    return [
      // Deterministic extraction for structured data
      { name: 'ExtractDemographics', type: 'rule-based', component: 'StructuredDataExtractor' },
      { name: 'ExtractMedications', type: 'ner-model', component: 'StructuredDataExtractor' },
      { name: 'ExtractDates', type: 'regex', component: 'StructuredDataExtractor' },
      
      // LLM for complex tasks
      { name: 'LLMComplicationDetector', type: 'llm', component: 'LLMComplicationDetector' },
      { name: 'LLMClinicalSynthesizer', type: 'llm', component: 'LLMClinicalSynthesizer' },
      { name: 'LLMConsultantParser', type: 'llm', component: 'LLMConsultantParser' },
      
      // Validation
      { name: 'ClinicalValidator', type: 'validation', component: 'ClinicalDataValidator' }
    ];
  }
}
