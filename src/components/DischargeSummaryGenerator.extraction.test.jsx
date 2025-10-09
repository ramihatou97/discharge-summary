import { describe, it, expect } from 'vitest';

describe('Note Detection and Extraction - Issue Fix', () => {
  // Simulate the extraction logic from DischargeSummaryGenerator.jsx
  const extractWithPatterns = (detectedNotes) => {
    const admissionNote = detectedNotes.admission || '';
    const progressNotes = detectedNotes.progress || '';
    const finalNote = detectedNotes.final || '';
    const procedureNote = detectedNotes.procedure || '';
    
    const extracted = {
      admittingDiagnosis: '',
      dischargeDiagnosis: '',
      hospitalCourse: '',
      procedures: [],
    };

    // Extract diagnoses - search across all note types for better detection
    const allNotes = admissionNote + '\n' + progressNotes + '\n' + finalNote;
    
    // Try admitting diagnosis first in admission note
    let admitDxMatch = admissionNote.match(/(?:Chief Complaint|CC|Presenting Problem|Reason for Admission|Admitting Diagnosis)\s*:?\s*([^\n]+)/i);
    // Fallback to generic "Diagnosis:" in admission note
    if (!admitDxMatch) {
      admitDxMatch = admissionNote.match(/^Diagnosis\s*:?\s*([^\n]+)/im);
    }
    if (admitDxMatch) extracted.admittingDiagnosis = admitDxMatch[1].trim();

    // Try discharge diagnosis in final note first
    let dischargeDxMatch = finalNote.match(/(?:Discharge Diagnosis|Final Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]+)/i);
    // Fallback to searching all notes for discharge/final diagnosis
    if (!dischargeDxMatch) {
      dischargeDxMatch = allNotes.match(/(?:Discharge Diagnosis|Final Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]+)/i);
    }
    // Fallback to generic "Diagnosis:" if still not found
    if (!dischargeDxMatch) {
      dischargeDxMatch = allNotes.match(/^Diagnosis\s*:?\s*([^\n]+)/im);
    }
    if (dischargeDxMatch) extracted.dischargeDiagnosis = dischargeDxMatch[1].trim();

    // Extract procedures from procedure note or progress notes
    const procedureText = procedureNote || progressNotes;
    if (procedureText) {
      const procMatches = procedureText.match(/(?:Procedure|Operation|Surgery)\s*:?\s*([^\n]+)/gi);
      if (procMatches) {
        extracted.procedures = procMatches.map(match => 
          match.replace(/(?:Procedure|Operation|Surgery)\s*:?\s*/i, '').trim()
        );
      }

      // Build hospital course from progress notes
      const courseMatches = progressNotes.match(/(?:POD|Post-op day|Hospital Day|HD)\s*#?\d+[^\n]*\n([\s\S]{50,500}?)(?=\n(?:POD|Post-op|Hospital Day|HD)|$)/gi);
      if (courseMatches) {
        extracted.hospitalCourse = courseMatches.join('\n\n');
      }
    }
    
    // Try to extract hospital course from explicit "Hospital Course:" header if not found yet
    if (!extracted.hospitalCourse) {
      const allNotes = admissionNote + '\n' + progressNotes + '\n' + finalNote;
      const hospitalCourseMatch = allNotes.match(/(?:Hospital Course|Clinical Course|Course)\s*:?\s*([\s\S]{30,1000}?)(?=\n\n(?:[A-Z][a-z]+\s*:)|Discharge|Physical Exam|Medications|Disposition|$)/i);
      if (hospitalCourseMatch) {
        extracted.hospitalCourse = hospitalCourseMatch[1].trim();
      }
    }

    return extracted;
  };

  it('should extract diagnosis from generic "Diagnosis:" header', () => {
    const detectedNotes = {
      admission: `Patient Name: John Smith
Age: 45 years old

Diagnosis: Subarachnoid hemorrhage

Hospital Course: 
Patient underwent craniotomy.`,
      progress: '',
      consultant: '',
      procedure: '',
      final: ''
    };

    const extracted = extractWithPatterns(detectedNotes);
    
    expect(extracted.admittingDiagnosis).toBe('Subarachnoid hemorrhage');
  });

  it('should extract discharge diagnosis from "Discharge Diagnosis:" even when in admission section', () => {
    const detectedNotes = {
      admission: `Patient Name: John Smith

Diagnosis: SAH

Hospital Course: 
Patient stable.

Discharge Diagnosis: SAH status post craniotomy`,
      progress: '',
      consultant: '',
      procedure: '',
      final: ''
    };

    const extracted = extractWithPatterns(detectedNotes);
    
    expect(extracted.dischargeDiagnosis).toBe('SAH status post craniotomy');
  });

  it('should extract hospital course from "Hospital Course:" header', () => {
    const detectedNotes = {
      admission: `Patient Name: John Smith

Diagnosis: SAH

Hospital Course: 
Patient underwent craniotomy. Post-op course was uneventful.
Patient stable on discharge.

Discharge Diagnosis: SAH status post craniotomy`,
      progress: '',
      consultant: '',
      procedure: '',
      final: ''
    };

    const extracted = extractWithPatterns(detectedNotes);
    
    expect(extracted.hospitalCourse).toContain('Patient underwent craniotomy');
    expect(extracted.hospitalCourse).toContain('Post-op course was uneventful');
  });

  it('should still work with POD-style hospital course', () => {
    const detectedNotes = {
      admission: 'Patient admitted',
      progress: `POD 1
Patient underwent surgery. Tolerated well.

POD 2
Patient improving, stable vitals.`,
      consultant: '',
      procedure: '',
      final: ''
    };

    const extracted = extractWithPatterns(detectedNotes);
    
    expect(extracted.hospitalCourse).toContain('Patient underwent surgery');
    expect(extracted.hospitalCourse).toContain('Patient improving');
  });

  it('should extract both admitting and discharge diagnosis when both present', () => {
    const detectedNotes = {
      admission: `Chief Complaint: Headache

Hospital Course: Patient treated`,
      progress: '',
      consultant: '',
      procedure: '',
      final: 'Discharge Diagnosis: SAH s/p clipping'
    };

    const extracted = extractWithPatterns(detectedNotes);
    
    expect(extracted.admittingDiagnosis).toBe('Headache');
    expect(extracted.dischargeDiagnosis).toBe('SAH s/p clipping');
  });

  it('should handle notes with different diagnosis formats', () => {
    const testCases = [
      {
        notes: { admission: 'Admitting Diagnosis: Stroke', progress: '', consultant: '', procedure: '', final: '' },
        expected: 'Stroke'
      },
      {
        notes: { admission: 'Diagnosis: Brain tumor', progress: '', consultant: '', procedure: '', final: '' },
        expected: 'Brain tumor'
      },
      {
        notes: { admission: 'CC: Seizures', progress: '', consultant: '', procedure: '', final: '' },
        expected: 'Seizures'
      },
      {
        notes: { admission: 'Presenting Problem: TBI', progress: '', consultant: '', procedure: '', final: '' },
        expected: 'TBI'
      }
    ];

    testCases.forEach(({ notes, expected }) => {
      const extracted = extractWithPatterns(notes);
      expect(extracted.admittingDiagnosis).toBe(expected);
    });
  });
});
