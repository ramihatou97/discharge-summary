/**
 * LLM Complication Detector
 * Uses LLM to detect and analyze medical complications
 */

export class LLMComplicationDetector {
  constructor(llmClient, config) {
    this.client = llmClient;
    this.config = config;
  }

  async detect(notes, structuredData) {
    const prompt = this.buildPrompt(notes, structuredData);
    
    try {
      const response = await this.client.generate(prompt, {
        temperature: 0.1,
        maxTokens: 1500
      });
      
      return this.parseResponse(response);
    } catch (error) {
      console.error('Complication detection failed:', error);
      return this.fallbackDetection(notes);
    }
  }

  buildPrompt(notes, structuredData) {
    const { admission = '', progress = '', consultant = '', procedure = '', final = '' } = notes;
    
    return `You are a neurosurgical complications expert. Analyze these clinical notes and identify ALL complications.

CRITICAL COMPLICATIONS TO DETECT:
- Infections (surgical site, meningitis, ventriculitis, wound infection)
- Seizures (clinical or electrographic)
- New neurological deficits (motor, sensory, cognitive)
- CSF leaks
- Hemorrhage or rebleeding
- Hydrocephalus
- Wound complications
- DVT/PE
- Other post-operative complications

NOTES:
Admission: ${admission}
Progress: ${progress}
Consultant: ${consultant}
Procedure: ${procedure}
Final: ${final}

For each complication found, provide:
1. Complication type
2. Date of onset (if documented)
3. Severity (mild/moderate/severe)
4. Treatment provided
5. Resolution status (resolved/ongoing/improving)

Return ONLY valid JSON in this format:
{
  "complications": [
    {
      "type": "infection",
      "specific": "surgical site infection",
      "onset": "POD 3",
      "severity": "moderate",
      "treatment": "antibiotics started",
      "status": "improving"
    }
  ],
  "hasComplications": true,
  "complicationCount": 1
}

If NO complications found, return:
{
  "complications": [],
  "hasComplications": false,
  "complicationCount": 0
}`;
  }

  parseResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse complication response:', e);
    }
    
    return {
      complications: [],
      hasComplications: false,
      complicationCount: 0
    };
  }

  fallbackDetection(notes) {
    // Simple pattern-based fallback
    const allText = Object.values(notes).join('\n').toLowerCase();
    const complications = [];
    
    const patterns = {
      infection: /\b(infection|infected|meningitis|ventriculitis|wound.*infection|abscess)\b/gi,
      seizure: /\b(seizure|convulsion|epileptic|status epilepticus)\b/gi,
      deficit: /\b(new.*deficit|weakness|paresis|plegia|numbness|sensory.*loss)\b/gi,
      csf_leak: /\b(csf.*leak|cerebrospinal.*leak|rhinorrhea|otorrhea)\b/gi,
      hemorrhage: /\b(hemorrhage|bleeding|rebleed|hematoma)\b/gi,
      hydrocephalus: /\b(hydrocephalus|ventricular.*dilation)\b/gi
    };
    
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = allText.match(pattern);
      if (matches && matches.length > 0) {
        complications.push({
          type,
          specific: matches[0],
          onset: 'Not specified',
          severity: 'unknown',
          treatment: 'See notes',
          status: 'documented'
        });
      }
    });
    
    return {
      complications,
      hasComplications: complications.length > 0,
      complicationCount: complications.length,
      method: 'fallback'
    };
  }
}
