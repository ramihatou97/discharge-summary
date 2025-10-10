/**
 * Clinical Data Validator
 * Validates clinical data for accuracy and completeness
 */

export class ClinicalDataValidator {
  constructor() {
    this.requiredFields = [
      'demographics', 'admittingDiagnosis', 'dischargeExam'
    ];
    
    this.criticalTerms = [
      'infection', 'meningitis', 'seizure', 'deficit',
      'csf leak', 'hemorrhage', 'rebleed', 'ventriculitis'
    ];
  }

  /**
   * Validate LLM output against structured extraction
   * @param {Object} llmOutput - Output from LLM
   * @param {Object} structuredData - Data from deterministic extraction
   * @returns {Object} Validation results
   */
  validateClinicalAccuracy(llmOutput, structuredData) {
    const validationResults = {
      isValid: true,
      warnings: [],
      errors: [],
      confidenceScores: {},
      timestamp: new Date().toISOString()
    };

    // Check required fields
    this.checkRequiredFields(llmOutput, validationResults);

    // Cross-validate demographics
    this.crossValidateDemographics(llmOutput, structuredData, validationResults);

    // Check for missed complications
    this.checkMissedComplications(llmOutput, structuredData, validationResults);

    // Validate temporal consistency
    this.validateTemporalConsistency(llmOutput, validationResults);

    // Validate medication consistency
    this.validateMedications(llmOutput, structuredData, validationResults);

    // Calculate confidence scores
    validationResults.confidenceScores = this.calculateConfidenceScores(
      llmOutput,
      structuredData
    );

    return validationResults;
  }

  checkRequiredFields(output, results) {
    const fieldMap = {
      demographics: ['patientName', 'age', 'sex'],
      admittingDiagnosis: 'admittingDiagnosis',
      dischargeExam: 'dischargeExam'
    };

    Object.entries(fieldMap).forEach(([category, fields]) => {
      if (Array.isArray(fields)) {
        const hasAny = fields.some(field => output[field] && output[field] !== '');
        if (!hasAny) {
          results.errors.push(`Missing required category: ${category}`);
          results.isValid = false;
        }
      } else {
        if (!output[fields] || output[fields] === '') {
          results.warnings.push(`Missing recommended field: ${fields}`);
        }
      }
    });
  }

  crossValidateDemographics(llmOutput, structuredData, results) {
    if (!structuredData || !structuredData.age) return;

    // Compare age
    if (llmOutput.age && structuredData.age) {
      const llmAge = parseInt(llmOutput.age);
      const structuredAge = parseInt(structuredData.age);

      if (Math.abs(llmAge - structuredAge) > 1) {
        results.warnings.push(
          `Age mismatch: LLM=${llmAge}, Structured=${structuredAge}`
        );
      }
    }

    // Compare sex
    if (llmOutput.sex && structuredData.sex) {
      const llmSex = llmOutput.sex.toLowerCase();
      const structuredSex = structuredData.sex.toLowerCase();

      if (llmSex !== structuredSex && 
          !llmSex.startsWith(structuredSex[0]) &&
          !structuredSex.startsWith(llmSex[0])) {
        results.warnings.push(
          `Sex mismatch: LLM=${llmOutput.sex}, Structured=${structuredData.sex}`
        );
      }
    }
  }

  checkMissedComplications(llmOutput, structuredData, results) {
    // Check if critical terms appear in original notes but not in output
    const rawNotesText = structuredData?.rawNotes || '';
    const outputText = JSON.stringify(llmOutput).toLowerCase();

    this.criticalTerms.forEach(term => {
      if (rawNotesText.toLowerCase().includes(term)) {
        if (!outputText.includes(term)) {
          results.warnings.push(
            `Potential missed complication: "${term}" found in notes but not in output`
          );
        }
      }
    });

    // Verify complication structure
    if (llmOutput.complications) {
      if (!Array.isArray(llmOutput.complications)) {
        results.errors.push('Complications should be an array');
        results.isValid = false;
      } else {
        llmOutput.complications.forEach((comp, idx) => {
          if (!comp.type && !comp.specific) {
            results.warnings.push(
              `Complication ${idx + 1} missing type/specific information`
            );
          }
        });
      }
    }
  }

  validateTemporalConsistency(output, results) {
    // Check date ordering
    if (output.admitDate && output.dischargeDate) {
      const admit = this.parseDate(output.admitDate);
      const discharge = this.parseDate(output.dischargeDate);

      if (admit && discharge && admit > discharge) {
        results.errors.push(
          'Temporal inconsistency: Admission date is after discharge date'
        );
        results.isValid = false;
      }
    }

    // Check procedure dates
    if (output.procedureDate && output.admitDate && output.dischargeDate) {
      const procedure = this.parseDate(output.procedureDate);
      const admit = this.parseDate(output.admitDate);
      const discharge = this.parseDate(output.dischargeDate);

      if (procedure && admit && discharge) {
        if (procedure < admit || procedure > discharge) {
          results.warnings.push(
            'Procedure date outside of admission period'
          );
        }
      }
    }
  }

  validateMedications(llmOutput, structuredData, results) {
    if (!structuredData?.dischargeMedications) return;

    const structuredMeds = new Set(
      structuredData.dischargeMedications.map(m => 
        m.toLowerCase().split(/\s+/)[0] // First word (drug name)
      )
    );

    const llmMeds = new Set(
      (llmOutput.dischargeMedications || []).map(m =>
        m.toLowerCase().split(/\s+/)[0]
      )
    );

    // Check if structured extraction found meds that LLM missed
    const missedMeds = [...structuredMeds].filter(med => !llmMeds.has(med));
    
    if (missedMeds.length > 0 && structuredMeds.size > 0) {
      results.warnings.push(
        `Potentially missed medications: ${missedMeds.join(', ')}`
      );
    }
  }

  calculateConfidenceScores(llmOutput, structuredData) {
    const scores = {};

    // Demographics confidence
    scores.demographics = this.calculateFieldConfidence([
      llmOutput.patientName,
      llmOutput.age,
      llmOutput.sex,
      llmOutput.mrn
    ]);

    // Dates confidence
    scores.dates = this.calculateFieldConfidence([
      llmOutput.admitDate,
      llmOutput.dischargeDate
    ]);

    // Clinical data confidence
    scores.clinical = this.calculateFieldConfidence([
      llmOutput.admittingDiagnosis,
      llmOutput.hospitalCourse,
      llmOutput.dischargeExam
    ]);

    // Medications confidence
    scores.medications = (llmOutput.dischargeMedications?.length || 0) > 0 ? 0.8 : 0.3;

    // Overall confidence (weighted average)
    scores.overall = (
      scores.demographics * 0.3 +
      scores.dates * 0.2 +
      scores.clinical * 0.4 +
      scores.medications * 0.1
    );

    return scores;
  }

  calculateFieldConfidence(fields) {
    const nonEmpty = fields.filter(f => f && f !== '').length;
    return fields.length > 0 ? nonEmpty / fields.length : 0;
  }

  parseDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate completeness of discharge summary
   */
  validateCompleteness(summary) {
    const sections = [
      'patientName',
      'age',
      'sex',
      'admittingDiagnosis',
      'hospitalCourse',
      'dischargeExam',
      'dischargeMedications',
      'followUp'
    ];

    const missing = sections.filter(section => 
      !summary[section] || 
      (Array.isArray(summary[section]) && summary[section].length === 0)
    );

    return {
      isComplete: missing.length === 0,
      missingElements: missing,
      completeness: (sections.length - missing.length) / sections.length
    };
  }
}
