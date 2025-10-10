/**
 * LLM Clinical Synthesizer
 * Uses LLM to synthesize and enhance clinical narratives
 */

export class LLMClinicalSynthesizer {
  constructor(llmClient, config) {
    this.client = llmClient;
    this.config = config;
  }

  async synthesize(extractedData, notes) {
    const prompt = this.buildPrompt(extractedData, notes);
    
    try {
      const response = await this.client.generate(prompt, {
        temperature: 0.2,
        maxTokens: 2000
      });
      
      return this.parseResponse(response, extractedData);
    } catch (error) {
      console.error('Clinical synthesis failed:', error);
      return this.fallbackSynthesis(extractedData);
    }
  }

  buildPrompt(extractedData, notes) {
    return `You are a neurosurgical documentation specialist. Synthesize a comprehensive clinical narrative from the extracted data and notes.

EXTRACTED DATA:
${JSON.stringify(extractedData, null, 2)}

CLINICAL NOTES:
${JSON.stringify(notes, null, 2)}

Create a professional, concise clinical narrative including:
1. HISTORY OF PRESENTING ILLNESS: Chief complaint and timeline
2. HOSPITAL COURSE: Chronological summary of treatment and response
3. POST-OPERATIVE PROGRESS: Day-by-day progress if applicable
4. MAJOR EVENTS: Significant clinical events during hospitalization
5. CURRENT STATUS: Patient's condition at discharge

Guidelines:
- Use medical terminology appropriately
- Be concise but comprehensive
- Focus on neurosurgical context
- Maintain chronological flow
- Include response to interventions
- Highlight functional status changes

Return ONLY valid JSON:
{
  "historyPresenting": "Brief HPI...",
  "hospitalCourse": "Chronological summary...",
  "postOpProgress": "POD 1: ... POD 2: ...",
  "majorEvents": ["Event 1", "Event 2"],
  "currentStatus": "Patient's current condition..."
}`;
  }

  parseResponse(response, extractedData) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const synthesized = JSON.parse(jsonMatch[0]);
        
        // Merge with extracted data
        return {
          ...extractedData,
          ...synthesized,
          synthesisMethod: 'llm'
        };
      }
    } catch (e) {
      console.error('Failed to parse synthesis response:', e);
    }
    
    return this.fallbackSynthesis(extractedData);
  }

  fallbackSynthesis(extractedData) {
    // Create basic narratives from extracted data
    return {
      ...extractedData,
      historyPresenting: extractedData.admittingDiagnosis || 'See notes',
      hospitalCourse: this.createBasicHospitalCourse(extractedData),
      postOpProgress: extractedData.postOpProgress || 'See progress notes',
      majorEvents: extractedData.majorEvents || [],
      currentStatus: extractedData.dischargeExam || extractedData.currentExam || 'See discharge exam',
      synthesisMethod: 'fallback'
    };
  }

  createBasicHospitalCourse(data) {
    const parts = [];
    
    if (data.admittingDiagnosis) {
      parts.push(`Patient admitted with ${data.admittingDiagnosis}.`);
    }
    
    if (data.procedures && data.procedures.length > 0) {
      parts.push(`Underwent ${data.procedures.join(', ')}.`);
    }
    
    if (data.complications && data.complications.length > 0) {
      parts.push(`Complications: ${data.complications.join(', ')}.`);
    }
    
    parts.push('Patient progressed through recovery as documented in progress notes.');
    
    return parts.join(' ');
  }
}
