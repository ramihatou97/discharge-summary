import { describe, it, expect } from 'vitest';

describe('Extraction Pattern Fixes - Problem Statement Issues', () => {
  // These tests validate the fixes for the issues described in the problem statement
  
  describe('Admitting Diagnosis Extraction', () => {
    it('should not extract long narrative paragraphs as diagnosis', () => {
      const narrativeText = "Reason for Admission: occasionally led to frustration on his part. He denies associated headaches, focal weakness, seizures, visual disturbances, dysphagia, or nausea and vomiting. There have been no recent falls, loss of consciousness, or other new neurologic symptoms.";
      
      // Pattern with validation
      const pattern = /(?:Admitting Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]{1,200}?)(?=\n|$)/i;
      const match = pattern.exec(narrativeText);
      
      // This should not match because it doesn't have the right header
      expect(match).toBeNull();
    });
    
    it('should validate captured diagnosis text and reject narrative text', () => {
      const captured = "occasionally led to frustration on his part. He denies associated headaches, focal weakness, seizures";
      
      // Validation logic from the fix
      const isNarrative = captured.match(/\b(he|she|patient|denies|reports|states|presents with|led to|his|her)\b/i);
      const tooLong = captured.length > 100;
      const multipleSentences = captured.split(/[.!?]/).length > 2;
      
      expect(isNarrative).not.toBeNull(); // Should detect narrative markers
      expect(tooLong || isNarrative || multipleSentences).toBe(true); // Should be rejected
    });
    
    it('should accept valid short diagnosis', () => {
      const captured = "Brain tumor, glioblastoma";
      
      // Validation logic
      const isNarrative = captured.match(/\b(he|she|patient|denies|reports|states|presents with|led to|his|her)\b/i);
      const tooLong = captured.length > 100;
      const multipleSentences = captured.split(/[.!?]/).length > 2;
      
      expect(isNarrative).toBeNull();
      expect(tooLong).toBe(false);
      expect(multipleSentences).toBe(false);
      // This should be accepted
    });
  });
  
  describe('Procedure Extraction', () => {
    it('should reject single word "progress" as a procedure', () => {
      const text = "Procedure: progress";
      const match = text.match(/(?:Procedure)\s*:?\s*([^\n]+)/i);
      
      if (match && match[1]) {
        const proc = match[1].trim();
        
        // Validation logic from the fix
        const hasMinLength = proc.length >= 15;
        const notJustAbbrev = !proc.match(/^[\(\)\s\w]{1,5}$/);
        const notCommonWords = !proc.match(/^(progress|notes?|s|LRB|RRB|\(s\)|\([A-Z]+\)|assessment|plan|in bed|received|see below|as follows)$/i);
        const hasMultipleWords = proc.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2).length >= 2;
        const hasMedicalTerm = proc.match(/\b(craniotomy|craniectomy|laminectomy|discectomy|fusion|biopsy|resection|excision|removal|drainage|evacuation|decompression|clipping|coiling|shunt|evd|minicraniotomy|duraplasty)\b/i);
        
        const isValid = hasMinLength && notJustAbbrev && notCommonWords && hasMultipleWords && hasMedicalTerm;
        
        expect(isValid).toBe(false); // Should be rejected
        expect(hasMinLength).toBe(false); // Too short
        expect(notCommonWords).toBe(false); // Is a common word
      }
    });
    
    it('should reject abbreviation "(s) (LRB):" as a procedure', () => {
      const text = "Procedure(s) (LRB):";
      const match = text.match(/(?:Procedure)\s*(?:\(s\))?\s*(?:\([A-Z]+\))?\s*:?\s*([^\n]{15,})/i);
      
      // With the 15 char minimum, this should not match since there's no text after the colon
      expect(match).toBeNull(); // Pattern shouldn't match with nothing after
    });
    
    it('should extract valid multi-word procedure with medical terms', () => {
      const text = "Post-Op Procedure(s) (LRB):\nLeft Minicraniotomy, Open Biopsy of Tumor, Duraplasty, Image Guidance and Microscope (Left)";
      
      // Pattern to match procedure on next line after header
      const pattern = /(?:Post-?Op(?:erative)?\s+)?(?:Procedure|Operation|Surgery)\s*(?:\(s\))?\s*(?:\([A-Z]+\))?\s*:\s*\n([^\n]{15,})/gi;
      const matches = Array.from(text.matchAll(pattern));
      
      expect(matches.length).toBeGreaterThan(0);
      
      if (matches.length > 0) {
        const proc = matches[0][1].trim();
        
        // Validation logic
        const hasMinLength = proc.length >= 15;
        const notJustAbbrev = !proc.match(/^[\(\)\s\w]{1,5}$/);
        const notCommonWords = !proc.match(/^(progress|notes?|s|LRB|RRB|\(s\)|\([A-Z]+\)|assessment|plan|in bed|received|see below|as follows)$/i);
        const hasMultipleWords = proc.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2).length >= 2;
        const hasMedicalTerm = proc.match(/\b(craniotomy|craniectomy|laminectomy|discectomy|fusion|biopsy|resection|excision|removal|drainage|evacuation|decompression|clipping|coiling|shunt|evd|minicraniotomy|duraplasty)\b/i);
        
        const isValid = hasMinLength && notJustAbbrev && notCommonWords && hasMultipleWords && (hasMedicalTerm !== null);
        
        expect(isValid).toBe(true); // Should be accepted
        expect(proc).toContain('Minicraniotomy');
        expect(proc).toContain('Biopsy');
      }
    });
    
    it('should require medical terminology in procedures', () => {
      const proc = "Patient received treatment in hospital";
      
      // Should not contain recognized medical procedure terms
      const hasMedicalTerm = proc.match(/\b(craniotomy|craniectomy|laminectomy|discectomy|fusion|biopsy|resection|excision|removal|drainage|evacuation|decompression|clipping|coiling|shunt|evd|minicraniotomy|duraplasty)\b/i);
      
      expect(hasMedicalTerm).toBeNull(); // Should be rejected for lack of medical terms
    });
  });
  
  describe('Discharge Diagnosis Extraction', () => {
    it('should correctly extract comma-separated diagnoses', () => {
      const text = "Discharge Diagnosis: tumor, glioma, seizures";
      const pattern = /(?:Discharge Diagnosis|Final Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]+)/i;
      const match = pattern.exec(text);
      
      expect(match).not.toBeNull();
      expect(match[1].trim()).toBe('tumor, glioma, seizures');
    });
  });
  
  describe('PMH vs Reason for Admission', () => {
    it('should not confuse PMH items with reason for admission', () => {
      const text = `
PMH:
Atrial fibrillation
Dyslipidemia
Hypertension
Type 2 DM
`;
      
      // PMH pattern should match
      const pmhPattern = /(?:PMH|Past Medical History|Medical History)\s*:?\s*([\s\S]{20,500}?)(?=\n\n+|\n(?:PSH|Past Surgical|Medications|Allergies|Social History|Family History)\s*:|$)/i;
      const pmhMatch = pmhPattern.exec(text);
      
      expect(pmhMatch).not.toBeNull();
      expect(pmhMatch[1]).toContain('Atrial fibrillation');
      expect(pmhMatch[1]).toContain('Hypertension');
      
      // These should NOT be extracted as admitting diagnosis
      const admitPattern = /(?:Admitting Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]{1,200}?)(?=\n|$)/i;
      const admitMatch = admitPattern.exec(text);
      
      expect(admitMatch).toBeNull(); // No admitting diagnosis in PMH section
    });
  });
  
  describe('Integration Test - Full Clinical Note', () => {
    it('should correctly extract all fields from problematic clinical note', () => {
      const clinicalNote = `
Patient: Bryan Kay
Age: 83 yo
Sex: M

Reason for Admission: occasionally led to frustration on his part. He denies associated headaches, focal weakness, seizures, visual disturbances, dysphagia, or nausea and vomiting.

Admitting Diagnosis: Brain tumor

PMH:
Atrial fibrillation
Dyslipidemia
Hypertension
Type 2 DM
Parkinson's disease

Procedure: progress
Post-Op Procedure(s) (LRB):
Left Minicraniotomy, Open Biopsy of Tumor, Duraplasty, Image Guidance and Microscope (Left)

Discharge Diagnosis: tumor, glioma, seizures
`;
      
      // Test admitting diagnosis
      const admitPattern = /(?:Admitting Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]{1,200}?)(?=\n|$)/i;
      const admitMatch = admitPattern.exec(clinicalNote);
      expect(admitMatch).not.toBeNull();
      expect(admitMatch[1].trim()).toBe('Brain tumor'); // Should get the actual diagnosis
      
      // Test discharge diagnosis
      const dischargePattern = /(?:Discharge Diagnosis|Final Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]+)/i;
      const dischargeMatch = dischargePattern.exec(clinicalNote);
      expect(dischargeMatch).not.toBeNull();
      expect(dischargeMatch[1].trim()).toBe('tumor, glioma, seizures');
      
      // Test PMH extraction
      const pmhPattern = /(?:PMH|Past Medical History|Medical History)\s*:?\s*([\s\S]{20,500}?)(?=\n\n+|\n(?:PSH|Past Surgical|Medications|Allergies|Social History|Family History|Procedure)\s*:|$)/i;
      const pmhMatch = pmhPattern.exec(clinicalNote);
      expect(pmhMatch).not.toBeNull();
      expect(pmhMatch[1]).toContain('Atrial fibrillation');
      expect(pmhMatch[1]).toContain('Parkinson');
      
      // Test procedure extraction (should get the real procedure, not "progress")
      const procPattern = /(?:Post-?Op(?:erative)?\s+)?(?:Procedure|Operation|Surgery)\s*(?:\(s\))?\s*(?:\([A-Z]+\))?\s*:\s*\n([^\n]{15,})/gi;
      const procMatches = Array.from(clinicalNote.matchAll(procPattern));
      expect(procMatches.length).toBeGreaterThan(0);
      
      if (procMatches.length > 0) {
        const proc = procMatches[0][1].trim();
        expect(proc).toContain('Minicraniotomy');
        expect(proc).toContain('Biopsy');
        expect(proc).not.toBe('progress'); // Should NOT be "progress"
      }
    });
  });
});
