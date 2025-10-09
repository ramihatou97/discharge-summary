import { describe, it, expect, beforeEach } from 'vitest';

describe('Training Examples - Pattern Extraction', () => {
  // Simulate pattern extraction logic
  const extractPatternsFromExample = (example) => {
    const patterns = {
      structure: [],
      terminology: [],
      clinical: [],
      formatting: []
    };

    // Analyze structure patterns
    if (example.completedSummary) {
      const sections = example.completedSummary.split(/\n(?=[A-Z][A-Z\s]+:)/);
      patterns.structure = sections.map(section => {
        const match = section.match(/^([A-Z][A-Z\s]+):/);
        return match ? match[1].trim() : null;
      }).filter(Boolean);

      // Extract formatting patterns
      if (example.completedSummary.includes('•')) {
        patterns.formatting.push('bullet_list_preferred');
      }
      if (example.completedSummary.match(/\d+\./)) {
        patterns.formatting.push('numbered_list_used');
      }
      if (example.completedSummary.match(/\n\n/g)?.length > 3) {
        patterns.formatting.push('section_spacing_used');
      }
    }

    // Extract terminology patterns
    const allText = [
      example.admissionNote,
      example.progressNotes,
      example.consultantNotes,
      example.procedureNote,
      example.finalNote,
      example.completedSummary
    ].join(' ');

    const medicalTerms = [
      'POD', 'post-op', 'preop', 'intraop', 's/p', 'w/', 'c/o',
      'pt', 'patient', 'tolerated', 'uneventful', 'stable',
      'discharged', 'follow-up', 'follow up', 'f/u'
    ];

    medicalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length > 0) {
        patterns.terminology.push({
          term: term,
          frequency: matches.length
        });
      }
    });

    // Extract clinical patterns
    if (example.pathology) {
      patterns.clinical.push({
        pathology: example.pathology,
        hasConsultant: !!example.consultantNotes,
        hasProcedure: !!example.procedureNote,
        summaryLength: example.completedSummary?.length || 0
      });
    }

    return patterns;
  };

  it('should extract structure patterns from completed summary', () => {
    const example = {
      completedSummary: `PATIENT INFORMATION:
Name: John Doe

DIAGNOSES:
Primary: Brain Tumor

HOSPITAL COURSE:
Patient tolerated procedure well.`,
      admissionNote: '',
      progressNotes: '',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      pathology: 'Brain Tumor'
    };

    const patterns = extractPatternsFromExample(example);
    
    expect(patterns.structure).toContain('PATIENT INFORMATION');
    expect(patterns.structure).toContain('DIAGNOSES');
    expect(patterns.structure).toContain('HOSPITAL COURSE');
  });

  it('should detect bullet list formatting preference', () => {
    const example = {
      completedSummary: `MEDICATIONS:
• Medication 1
• Medication 2
• Medication 3`,
      admissionNote: '',
      progressNotes: '',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      pathology: ''
    };

    const patterns = extractPatternsFromExample(example);
    
    expect(patterns.formatting).toContain('bullet_list_preferred');
  });

  it('should detect numbered list formatting', () => {
    const example = {
      completedSummary: `PROCEDURES:
1. Craniotomy
2. Tumor resection
3. Closure`,
      admissionNote: '',
      progressNotes: '',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      pathology: ''
    };

    const patterns = extractPatternsFromExample(example);
    
    expect(patterns.formatting).toContain('numbered_list_used');
  });

  it('should extract terminology frequency', () => {
    const example = {
      completedSummary: 'The patient tolerated the procedure well. Patient was stable post-op.',
      admissionNote: 'Patient admitted for surgery',
      progressNotes: 'POD 1: Patient stable',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      pathology: ''
    };

    const patterns = extractPatternsFromExample(example);
    
    const patientTerm = patterns.terminology.find(t => t.term === 'patient');
    expect(patientTerm).toBeDefined();
    expect(patientTerm.frequency).toBeGreaterThan(0);
    
    const stableTerm = patterns.terminology.find(t => t.term === 'stable');
    expect(stableTerm).toBeDefined();
  });

  it('should extract clinical patterns including consultant presence', () => {
    const example = {
      completedSummary: 'Discharge summary for spine fracture case',
      admissionNote: 'Patient with spine fracture',
      progressNotes: 'Recovering well',
      consultantNotes: 'Neurology recommends continued monitoring',
      procedureNote: 'Surgical stabilization performed',
      finalNote: '',
      pathology: 'Spine Fracture'
    };

    const patterns = extractPatternsFromExample(example);
    
    expect(patterns.clinical).toHaveLength(1);
    expect(patterns.clinical[0].pathology).toBe('Spine Fracture');
    expect(patterns.clinical[0].hasConsultant).toBe(true);
    expect(patterns.clinical[0].hasProcedure).toBe(true);
  });

  it('should handle examples without consultant notes', () => {
    const example = {
      completedSummary: 'Simple discharge summary',
      admissionNote: 'Admission note',
      progressNotes: 'Progress',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      pathology: 'Minor Injury'
    };

    const patterns = extractPatternsFromExample(example);
    
    expect(patterns.clinical[0].hasConsultant).toBe(false);
  });

  it('should aggregate patterns from multiple examples', () => {
    const examples = [
      {
        completedSummary: 'PATIENT INFORMATION:\nName: Test\n\nDIAGNOSES:\nBrain tumor',
        admissionNote: 'The patient was admitted',
        progressNotes: 'Patient stable',
        consultantNotes: '',
        procedureNote: '',
        finalNote: '',
        pathology: 'Brain Tumor'
      },
      {
        completedSummary: 'PATIENT INFORMATION:\nName: Test2\n\nDIAGNOSES:\nSpine fracture',
        admissionNote: 'Patient admitted for surgery',
        progressNotes: 'Patient tolerated well',
        consultantNotes: '',
        procedureNote: '',
        finalNote: '',
        pathology: 'Spine Fracture'
      }
    ];

    const globalPatterns = {
      commonStructure: {},
      preferredTerminology: {},
      pathologySpecificPatterns: {},
      formattingPreferences: {},
      totalExamples: examples.length
    };

    examples.forEach(example => {
      const patterns = extractPatternsFromExample(example);

      // Aggregate structure patterns
      patterns.structure.forEach(section => {
        globalPatterns.commonStructure[section] = 
          (globalPatterns.commonStructure[section] || 0) + 1;
      });

      // Aggregate terminology
      patterns.terminology.forEach(({ term, frequency }) => {
        if (!globalPatterns.preferredTerminology[term]) {
          globalPatterns.preferredTerminology[term] = { count: 0, totalFreq: 0 };
        }
        globalPatterns.preferredTerminology[term].count += 1;
        globalPatterns.preferredTerminology[term].totalFreq += frequency;
      });
    });

    expect(globalPatterns.totalExamples).toBe(2);
    expect(globalPatterns.commonStructure['PATIENT INFORMATION']).toBe(2);
    expect(globalPatterns.commonStructure['DIAGNOSES']).toBe(2);
    expect(globalPatterns.preferredTerminology['patient']).toBeDefined();
    expect(globalPatterns.preferredTerminology['patient'].count).toBe(2);
  });

  it('should not store any PHI in patterns', () => {
    const example = {
      completedSummary: 'PATIENT INFORMATION:\nName: John Smith\nMRN: 12345\n\nDIAGNOSES:\nBrain tumor',
      admissionNote: 'John Smith admitted on 01/01/2024',
      progressNotes: 'Patient stable',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      pathology: 'Brain Tumor'
    };

    const patterns = extractPatternsFromExample(example);
    
    // Check that no specific patient names or MRNs are in patterns
    const allPatternText = JSON.stringify(patterns);
    expect(allPatternText).not.toContain('John Smith');
    expect(allPatternText).not.toContain('12345');
    
    // Only structural and terminology patterns should be present
    expect(patterns.structure).toBeDefined();
    expect(patterns.terminology).toBeDefined();
    expect(patterns.clinical).toBeDefined();
    expect(patterns.formatting).toBeDefined();
  });
});

describe('Training Examples - Storage and Retrieval', () => {
  it('should properly format training examples for storage', () => {
    const example = {
      id: '1',
      timestamp: new Date().toISOString(),
      pathology: 'Brain Tumor',
      completedSummary: 'Test summary',
      admissionNote: 'Test admission',
      progressNotes: '',
      consultantNotes: '',
      procedureNote: '',
      finalNote: ''
    };

    const serialized = JSON.stringify([example]);
    const deserialized = JSON.parse(serialized);
    
    expect(deserialized).toHaveLength(1);
    expect(deserialized[0].pathology).toBe('Brain Tumor');
    expect(deserialized[0].id).toBe('1');
  });

  it('should properly format global patterns for storage', () => {
    const patterns = {
      commonStructure: { 'PATIENT INFORMATION': 1, 'DIAGNOSES': 2 },
      preferredTerminology: { 'patient': { count: 3, totalFreq: 10 } },
      pathologySpecificPatterns: {},
      formattingPreferences: { 'bullet_list_preferred': 5 },
      totalExamples: 3
    };
    
    const serialized = JSON.stringify(patterns);
    const deserialized = JSON.parse(serialized);
    
    expect(deserialized.totalExamples).toBe(3);
    expect(deserialized.commonStructure['PATIENT INFORMATION']).toBe(1);
    expect(deserialized.commonStructure['DIAGNOSES']).toBe(2);
    expect(deserialized.preferredTerminology['patient'].count).toBe(3);
    expect(deserialized.formattingPreferences['bullet_list_preferred']).toBe(5);
  });
});
