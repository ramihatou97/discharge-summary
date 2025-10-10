/**
 * Discharge Summary Prompts
 * Centralized prompt templates for LLM interactions
 */

export class DischargeSummaryPrompts {
  static NEUROSURGICAL_DISCHARGE_PROMPT(notes, consultantFocus = '', jsonSchema = '{}') {
    return `You are a neurosurgical discharge summary generator. Generate a comprehensive
discharge summary using ONLY information from the provided clinical notes.

STRICT REQUIREMENTS:
1. Extract information ONLY from provided notes - no inference or assumptions
2. Include all procedures (OR and bedside) with dates
3. Identify ALL complications (infections, seizures, neurological deficits)
4. Document consultant recommendations (especially ID and Thrombosis)
5. Track major events and their evolution

STRUCTURED SECTIONS NEEDED:

DEMOGRAPHICS:
- Age and sex (extract exactly as documented)

ADMISSION DIAGNOSIS:
- Primary diagnosis leading to admission

PROCEDURES:
- OR procedures with dates
- Bedside procedures (EVD, lumbar drain, etc.)

PRE-ADMISSION ANTICOAGULATION:
- Medication name and indication if documented

HOSPITAL COURSE:
- Chronological summary of treatment
- Response to interventions

COMPLICATIONS (BE VIGILANT):
- Infections (surgical site, meningitis, ventriculitis)
- Seizures (clinical or electrographic)
- New neurological deficits
- CSF leaks, hydrocephalus, hemorrhage

CONSULTANT RECOMMENDATIONS:
${consultantFocus}

DISCHARGE EXAMINATION:
- Neurological status from last progress note
- KPS if calculable from functional status

FOLLOW-UP:
- Neurosurgery follow-up plans
- Consultant follow-up requirements

Notes to process:
${JSON.stringify(notes, null, 2)}

Generate the discharge summary in the following JSON structure:
${jsonSchema}`;
  }

  static COMPLICATION_EXTRACTION_PROMPT(notes) {
    return `Extract ALL complications from these clinical notes.

Look for:
- Infections (surgical site, meningitis, ventriculitis, wound)
- Seizures (clinical or electrographic)
- New neurological deficits (motor, sensory, cognitive)
- CSF leaks
- Hemorrhage or rebleeding
- Hydrocephalus
- Wound complications
- DVT/PE
- Other post-operative complications

For each complication, include:
- Type of complication
- Date of onset
- Severity (mild/moderate/severe)
- Treatment provided
- Current status (resolved/ongoing/improving)

Notes:
${JSON.stringify(notes, null, 2)}

Return as JSON array of complications.`;
  }

  static CONSULTANT_RECOMMENDATIONS_PROMPT(consultantNotes) {
    return `Extract recommendations from consultant notes.

Focus on:
- Infectious Disease recommendations
- Thrombosis/Anticoagulation recommendations
- Other specialist recommendations

Include:
- Service/specialty
- Date of consultation
- Specific medications and doses
- Duration of treatment
- Monitoring plans
- Follow-up requirements

Format: Service | Date | Recommendations | Follow-up

Consultant Notes:
${consultantNotes}

Return structured JSON.`;
  }

  static CLINICAL_SYNTHESIS_PROMPT(extractedData, notes) {
    return `Given this extracted patient data, synthesize a comprehensive clinical narrative.

Ensure:
- Medical accuracy
- Completeness
- Chronological flow
- Neurosurgical context
- Professional medical documentation style

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Clinical Notes:
${JSON.stringify(notes, null, 2)}

Create narratives for:
1. History of Presenting Illness
2. Hospital Course
3. Post-operative Progress
4. Major Events
5. Current Status

Return enhanced data in JSON structure.`;
  }

  static FUNCTIONAL_STATUS_PROMPT(examFindings) {
    return `Based on these physical examination findings, estimate the patient's functional status.

Exam Findings:
${examFindings}

Determine:
1. Karnofsky Performance Status (KPS) score (0-100)
2. Functional description
3. Level of independence
4. Mobility status
5. Discharge condition score (1-5)

Guidelines:
- KPS 100: Normal, no complaints
- KPS 90: Normal activity with minor symptoms
- KPS 80: Normal activity with effort
- KPS 70: Cares for self, unable to work
- KPS 60: Requires occasional assistance
- KPS 50: Requires considerable assistance
- KPS 40: Disabled, requires special care
- KPS 30: Severely disabled
- KPS 20: Very sick
- KPS 10: Moribund

Return JSON with KPS score, description, and discharge condition.`;
  }

  static get JSON_SCHEMA() {
    return {
      patientName: 'string',
      age: 'number',
      sex: 'string',
      mrn: 'string',
      admitDate: 'string',
      dischargeDate: 'string',
      admittingDiagnosis: 'string',
      dischargeDiagnosis: 'string',
      procedures: ['array of procedure strings'],
      historyPresenting: 'string',
      hospitalCourse: 'string',
      postOpProgress: 'string',
      complications: ['array of complication objects'],
      imaging: ['array of imaging findings'],
      consultantRecommendations: ['array of recommendations'],
      majorEvents: ['array of major events'],
      currentExam: 'string',
      dischargeExam: 'string',
      neurologicalExam: 'string',
      kps: 'string',
      functionalStatus: 'string',
      dischargeMedications: ['array of medications'],
      disposition: 'string',
      followUp: ['array of follow-up items']
    };
  }
}
