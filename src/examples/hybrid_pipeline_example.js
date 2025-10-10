/**
 * Example: Using the Hybrid LLM Architecture
 * 
 * This example demonstrates how to use the hybrid discharge summary service
 */

import { NeurosurgicalDischargeSummaryService } from '../services/discharge_summary_service.js';
import { DischargeSummaryConfig } from '../config/llm_config.js';

// Sample clinical notes
const sampleNotes = {
  admission: `
ADMISSION NOTE
Patient Name: John Doe
Age: 45 years old
Sex: Male
MRN: 123456
Admission Date: 12/15/2024

Chief Complaint: Severe headache and confusion

History of Presenting Illness:
45-year-old male with no significant past medical history presented to ED with sudden onset severe headache, nausea, and confusion. CT head showed large right frontal hemorrhage with mass effect and midline shift.

Past Medical History: Hypertension
Past Surgical History: None
Allergies: NKDA
  `,

  procedure: `
PROCEDURE NOTE
Date: 12/16/2024
Procedure: Right frontal craniotomy for evacuation of intracerebral hemorrhage

Indication: 45-year-old male with large right frontal ICH causing mass effect

Procedure Details:
Patient underwent right frontal craniotomy under general anesthesia. Hematoma was evacuated. Hemostasis achieved. Dura closed. Bone flap replaced and secured.

Estimated Blood Loss: 200 mL
Complications: None
  `,

  progress: `
PROGRESS NOTES

POD 1 (12/17/2024):
Patient awake, following commands. Left hemiparesis 3/5. GCS 14 (E4V4M6).
Plan: Continue ICU monitoring, DVT prophylaxis, seizure prophylaxis with Keppra 500mg BID.

POD 2 (12/18/2024):
Neurologically improved. Left arm strength 4/5, left leg 4/5. Transferred to floor.

POD 3 (12/19/2024):
Patient ambulating with assistance. No new deficits. Labs stable.

POD 4 (12/20/2024):
Patient doing well. Ready for discharge.
  `,

  consultant: `
INFECTIOUS DISEASE CONSULT (12/17/2024)
Consulted for perioperative antibiotic management.

Recommendations:
- Continue cefazolin 1g IV q8h for 24 hours post-op
- No further antibiotics needed if wound clean
- Monitor for signs of infection
- Follow-up in ID clinic if any concerns

PHYSICAL THERAPY CONSULT (12/18/2024)
Patient evaluated for mobility and strength.

Recommendations:
- Home with outpatient PT
- Focus on left-sided strengthening
- Gait training
- Follow-up in 2 weeks
  `,

  final: `
DISCHARGE SUMMARY
Discharge Date: 12/21/2024

Discharge Diagnosis: Right frontal intracerebral hemorrhage, status post craniotomy

Discharge Examination:
Alert and oriented x3
Left upper extremity strength 4/5
Left lower extremity strength 4/5
Ambulating with minimal assistance
Wound clean, dry, intact

Discharge Medications:
1. Keppra (Levetiracetam) 500mg PO BID
2. Dexamethasone 4mg PO daily (taper over 1 week)
3. Acetaminophen 650mg PO q6h PRN pain
4. Docusate 100mg PO BID

Disposition: Home with family

Follow-up:
- Neurosurgery clinic in 2 weeks
- Physical therapy outpatient in 1 week
- Primary care in 1 month
  `
};

/**
 * Example 1: Pattern-based extraction only (no LLM)
 */
export async function examplePatternBasedExtraction() {
  console.log('=== Example 1: Pattern-Based Extraction (No LLM) ===\n');

  // Create config without API keys
  const config = new DischargeSummaryConfig();
  const service = new NeurosurgicalDischargeSummaryService(config);

  // Generate summary using patterns only
  const result = service.generateWithPatternsOnly(sampleNotes);

  console.log('Extracted Data:');
  console.log('- Patient Name:', result.summary.patientName);
  console.log('- Age:', result.summary.age);
  console.log('- Sex:', result.summary.sex);
  console.log('- MRN:', result.summary.mrn);
  console.log('- Admission Date:', result.summary.admitDate);
  console.log('- Discharge Date:', result.summary.dischargeDate);
  console.log('- Medications:', result.summary.dischargeMedications?.length || 0);
  
  console.log('\nValidation Results:');
  console.log('- Valid:', result.validation.isValid);
  console.log('- Warnings:', result.validation.warnings.length);
  console.log('- Confidence Scores:', result.validation.confidenceScores);
  
  console.log('\nCompleteness:', result.completeness.completeness * 100 + '%');
  
  return result;
}

/**
 * Example 2: Get pipeline information
 */
export function exampleGetPipelineInfo() {
  console.log('\n=== Example 2: Pipeline Information ===\n');

  const config = new DischargeSummaryConfig();
  const service = new NeurosurgicalDischargeSummaryService(config);

  const pipeline = service.getHybridPipeline();

  console.log('Hybrid Pipeline Components:');
  console.log('\nDeterministic Components:');
  pipeline.filter(p => p.type !== 'llm' && p.type !== 'validation').forEach(comp => {
    console.log(`- ${comp.name} (${comp.type})`);
  });

  console.log('\nLLM Components:');
  pipeline.filter(p => p.type === 'llm').forEach(comp => {
    console.log(`- ${comp.name}`);
  });

  console.log('\nValidation:');
  pipeline.filter(p => p.type === 'validation').forEach(comp => {
    console.log(`- ${comp.name}`);
  });

  return pipeline;
}

// Export sample notes for testing
export { sampleNotes };
