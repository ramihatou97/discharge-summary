/**
 * Medication Extractor
 * NER-based medication extraction using patterns
 */

export class ExtractMedications {
  constructor() {
    this.medicationPatterns = [
      // Common medication formats
      /\b([A-Z][a-z]+(?:in|ol|ide|zole|pam|cillin|mycin|pine|zine|xone))\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL|units?)(?:\s+(PO|IV|IM|SC|SL))?\s+(?:q|every)?\s*(\d+(?:-\d+)?h|daily|BID|TID|QID|QHS|PRN)/gi,
      // Discharge medication format
      /(?:^|\n)\s*\d+\.\s+([A-Z][a-z]+(?:in|ol|ide|zole|pam|cillin|mycin|pine|zine|xone)?)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL|units?)\s+(?:PO|IV|IM|SC|SL)?\s*(daily|BID|TID|QID|QHS|PRN|q\d+h)/gim,
      // Common neurosurgical medications
      /\b(Keppra|Levetiracetam|Dexamethasone|Decadron|Ondansetron|Zofran|Morphine|Oxycodone|Acetaminophen|Tylenol|Ibuprofen|Gabapentin|Pregabalin|Baclofen|Diazepam|Lorazepam)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL|units?)\s+(?:PO|IV|IM|SC|SL)?\s*(daily|BID|TID|QID|QHS|PRN|q\d+h)/gi
    ];

    this.commonMedications = new Set([
      'Acetaminophen', 'Aspirin', 'Baclofen', 'Decadron', 'Dexamethasone', 
      'Diazepam', 'Gabapentin', 'Ibuprofen', 'Keppra', 'Levetiracetam',
      'Lorazepam', 'Morphine', 'Ondansetron', 'Oxycodone', 'Pregabalin',
      'Tylenol', 'Zofran'
    ]);
  }

  extract(text) {
    const medications = [];
    const seenMeds = new Set();

    this.medicationPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const [fullMatch, name, dose, unit, route, frequency] = match;
        
        if (name && dose && unit) {
          const medication = this.formatMedication(name, dose, unit, route, frequency);
          const key = medication.toLowerCase();
          
          if (!seenMeds.has(key)) {
            medications.push(medication);
            seenMeds.add(key);
          }
        }
      }
    });

    return {
      medications,
      count: medications.length
    };
  }

  formatMedication(name, dose, unit, route, frequency) {
    // Capitalize medication name properly
    const capitalizedName = this.capitalizeMedicationName(name);
    
    let formatted = `${capitalizedName} ${dose}${unit}`;
    
    if (route && route.length <= 4) {
      formatted += ` ${route}`;
    }
    
    if (frequency) {
      formatted += ` ${frequency}`;
    }
    
    return formatted.trim();
  }

  capitalizeMedicationName(name) {
    // Check if it's a known medication
    const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    for (const med of this.commonMedications) {
      if (med.toLowerCase() === normalized.toLowerCase()) {
        return med;
      }
    }
    
    return normalized;
  }

  // Extract from specific medication section
  extractFromSection(text) {
    const medSection = text.match(/(?:DISCHARGE MEDICATIONS|Medications on Discharge|Discharge Meds)\s*:?\s*([\s\S]+?)(?=\n\n|FOLLOW|DISPOSITION|$)/i);
    
    if (medSection) {
      return this.extract(medSection[1]);
    }
    
    return this.extract(text);
  }
}
