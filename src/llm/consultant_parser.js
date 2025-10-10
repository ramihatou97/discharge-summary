/**
 * LLM Consultant Parser
 * Uses LLM to parse and extract consultant recommendations
 */

export class LLMConsultantParser {
  constructor(llmClient, config) {
    this.client = llmClient;
    this.config = config;
  }

  async parse(consultantNotes) {
    if (!consultantNotes || consultantNotes.trim().length === 0) {
      return {
        consultants: [],
        recommendations: [],
        count: 0
      };
    }

    const prompt = this.buildPrompt(consultantNotes);
    
    try {
      const response = await this.client.generate(prompt, {
        temperature: 0.1,
        maxTokens: 1500
      });
      
      return this.parseResponse(response);
    } catch (error) {
      console.error('Consultant parsing failed:', error);
      return this.fallbackParsing(consultantNotes);
    }
  }

  buildPrompt(consultantNotes) {
    return `You are an expert at parsing medical consultant notes. Extract ALL consultant recommendations from these notes.

FOCUS ON:
- Infectious Disease recommendations (antibiotics, monitoring)
- Thrombosis/Hematology recommendations (anticoagulation)
- Endocrinology recommendations
- Cardiology recommendations
- Any specialist follow-up requirements

CONSULTANT NOTES:
${consultantNotes}

For each consultant, extract:
1. Service/specialty
2. Date of consultation
3. Key recommendations
4. Medications prescribed/recommended
5. Follow-up requirements
6. Duration of treatment

Return ONLY valid JSON:
{
  "consultants": [
    {
      "service": "Infectious Disease",
      "date": "12/15/2024",
      "recommendations": [
        "Continue vancomycin for 6 weeks",
        "Weekly CBC and CRP monitoring"
      ],
      "medications": ["Vancomycin 1g IV q12h"],
      "followUp": "ID clinic in 2 weeks",
      "duration": "6 weeks"
    }
  ],
  "count": 1
}`;
  }

  parseResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Flatten recommendations for easy access
        const allRecommendations = [];
        if (parsed.consultants) {
          parsed.consultants.forEach(consultant => {
            if (consultant.recommendations) {
              consultant.recommendations.forEach(rec => {
                allRecommendations.push({
                  service: consultant.service,
                  recommendation: rec,
                  date: consultant.date
                });
              });
            }
          });
        }
        
        return {
          ...parsed,
          recommendations: allRecommendations
        };
      }
    } catch (e) {
      console.error('Failed to parse consultant response:', e);
    }
    
    return this.fallbackParsing(consultantNotes);
  }

  fallbackParsing(consultantNotes) {
    const consultants = [];
    const recommendations = [];
    
    // Pattern-based extraction for common consultants
    const servicePatterns = {
      'Infectious Disease': /(?:ID|Infectious Disease|Infectious Diseases)\s+(?:Consult|Consultation)/gi,
      'Hematology': /(?:Hematology|Thrombosis|Anticoagulation)\s+(?:Consult|Consultation)/gi,
      'Cardiology': /Cardiology\s+(?:Consult|Consultation)/gi,
      'Endocrinology': /Endocrin(?:e|ology)\s+(?:Consult|Consultation)/gi
    };
    
    Object.entries(servicePatterns).forEach(([service, pattern]) => {
      if (pattern.test(consultantNotes)) {
        // Extract section after the service mention
        const serviceRegex = new RegExp(`(${service}.*?)(?=\\n\\n|\\n[A-Z][a-z]+:|$)`, 'is');
        const match = consultantNotes.match(serviceRegex);
        
        if (match) {
          const section = match[1];
          
          // Extract recommendations (lines starting with - or numbers)
          const recPattern = /(?:^|\n)\s*[-•*]\s*([^\n]+)/g;
          const recs = [];
          let recMatch;
          
          while ((recMatch = recPattern.exec(section)) !== null) {
            recs.push(recMatch[1].trim());
            recommendations.push({
              service,
              recommendation: recMatch[1].trim(),
              date: 'See notes'
            });
          }
          
          if (recs.length > 0) {
            consultants.push({
              service,
              date: 'See notes',
              recommendations: recs,
              medications: [],
              followUp: 'See notes',
              duration: 'As directed'
            });
          }
        }
      }
    });
    
    return {
      consultants,
      recommendations,
      count: consultants.length,
      method: 'fallback'
    };
  }
}
