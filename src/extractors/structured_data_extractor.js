/**
 * Structured Data Extractor
 * Coordinates all deterministic extraction components
 */

import { ExtractDemographics } from './demographics_extractor.js';
import { ExtractDates } from './date_extractor.js';
import { ExtractMedications } from './medication_extractor.js';

export class StructuredDataExtractor {
  constructor() {
    this.demographicsExtractor = new ExtractDemographics();
    this.dateExtractor = new ExtractDates();
    this.medicationExtractor = new ExtractMedications();
  }

  /**
   * Extract structured data from clinical notes
   * @param {Object} notes - Object containing admission, progress, consultant, procedure, final notes
   * @returns {Object} Structured extracted data
   */
  extract(notes) {
    const { admission = '', progress = '', consultant = '', procedure = '', final = '' } = notes;
    
    // Combine all text for comprehensive extraction
    const allText = `${admission}\n${progress}\n${consultant}\n${procedure}\n${final}`;
    
    // Extract demographics (primarily from admission note)
    const demographics = this.demographicsExtractor.extract(admission || allText);
    
    // Extract dates
    const dates = this.dateExtractor.extract(admission, final, procedure);
    
    // Extract medications (primarily from final/discharge note)
    const medications = this.medicationExtractor.extractFromSection(final || allText);
    
    // Extract procedures
    const procedures = this.extractProcedures(procedure, allText);
    
    // Extract diagnoses
    const diagnoses = this.extractDiagnoses(admission, final, allText);
    
    return {
      // Demographics (deterministic)
      patientName: demographics.patientName,
      age: demographics.age,
      sex: demographics.sex,
      mrn: demographics.mrn,
      
      // Dates (deterministic)
      admitDate: dates.admitDate,
      dischargeDate: dates.dischargeDate,
      procedureDate: dates.procedureDate,
      
      // Medications (deterministic)
      dischargeMedications: medications.medications,
      medicationCount: medications.count,
      
      // Procedures (deterministic)
      procedures: procedures.procedures,
      procedureTypes: procedures.types,
      
      // Diagnoses (semi-structured)
      admittingDiagnosis: diagnoses.admitting,
      dischargeDiagnosis: diagnoses.discharge,
      
      // Metadata
      extractionMethod: 'deterministic',
      extractionTimestamp: new Date().toISOString(),
      confidence: {
        demographics: this.calculateConfidence(demographics),
        dates: this.calculateConfidence(dates),
        medications: medications.count > 0 ? 0.9 : 0.3
      }
    };
  }

  extractProcedures(procedureNote, allText) {
    const procedures = [];
    const types = new Set();
    
    const procedurePatterns = [
      /(?:underwent|performed|completed|s\/p)\s+([^.\n]+?(?:craniotomy|craniectomy|laminectomy|discectomy|fusion|decompression|EVD|shunt|biopsy|resection|clipping|coiling)[^.\n]*)/gi,
      /(?:Procedure|Operation|Surgery)\s*:?\s*([^.\n]{10,150})/gi
    ];
    
    const procedureTypes = [
      'craniotomy', 'craniectomy', 'laminectomy', 'discectomy', 'fusion',
      'decompression', 'EVD', 'shunt', 'biopsy', 'resection', 'clipping', 'coiling'
    ];
    
    procedurePatterns.forEach(pattern => {
      const matches = allText.matchAll(pattern);
      for (const match of matches) {
        const procedure = match[1].trim();
        const normalized = procedure.toLowerCase();
        
        if (procedure.length >= 10 && !procedures.some(p => p.toLowerCase() === normalized)) {
          procedures.push(procedure);
          
          // Identify procedure type
          procedureTypes.forEach(type => {
            if (normalized.includes(type)) {
              types.add(type);
            }
          });
        }
      }
    });
    
    return {
      procedures,
      types: Array.from(types)
    };
  }

  extractDiagnoses(admissionNote, finalNote, allText) {
    const result = {
      admitting: '',
      discharge: ''
    };
    
    // Extract admitting diagnosis
    const admitPatterns = [
      /(?:Admitting Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]{1,150}?)(?=\n|$)/i,
      /(?:Chief Complaint|CC)\s*:?\s*([^\n]{1,150}?)(?=\n|$)/i
    ];
    
    for (const pattern of admitPatterns) {
      const match = admissionNote.match(pattern);
      if (match && match[1] && !this.isNarrativeText(match[1])) {
        result.admitting = match[1].trim();
        break;
      }
    }
    
    // Extract discharge diagnosis
    const dischargePatterns = [
      /(?:Discharge Diagnosis|Final Diagnosis)\s*:?\s*([^\n]{1,150}?)(?=\n|$)/i,
      /(?:Diagnosis at Discharge)\s*:?\s*([^\n]{1,150}?)(?=\n|$)/i
    ];
    
    for (const pattern of dischargePatterns) {
      const match = finalNote.match(pattern);
      if (match && match[1] && !this.isNarrativeText(match[1])) {
        result.discharge = match[1].trim();
        break;
      }
    }
    
    return result;
  }

  isNarrativeText(text) {
    // Check if text looks like narrative (contains personal pronouns, verbs, etc.)
    const narrativeIndicators = /\b(he|she|patient|denies|reports|states|presents|led to|his|her)\b/i;
    return narrativeIndicators.test(text) || text.length > 100 || text.split(/[.!?]/).length > 2;
  }

  calculateConfidence(data) {
    const values = Object.values(data).filter(v => v && v !== '');
    const total = Object.keys(data).length;
    return values.length / total;
  }
}
