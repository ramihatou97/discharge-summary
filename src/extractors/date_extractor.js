/**
 * Deterministic Date Extractor
 * Regex-based extraction for dates
 */

export class ExtractDates {
  constructor() {
    this.patterns = {
      admitDate: [
        /(?:Admission Date|Date of Admission|Admitted|DOA)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /(?:Admitted on|Admission on)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
      ],
      dischargeDate: [
        /(?:Discharge Date|Date of Discharge|DOD|Discharged)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /(?:Discharged on|Discharge on)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
      ],
      procedureDate: [
        /(?:Procedure Date|Surgery Date|Operation Date)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /(?:performed on|underwent on)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
      ]
    };
  }

  extract(admissionNote, finalNote, procedureNote = '') {
    return {
      admitDate: this.tryPatterns(admissionNote, this.patterns.admitDate),
      dischargeDate: this.tryPatterns(finalNote, this.patterns.dischargeDate),
      procedureDate: this.tryPatterns(procedureNote, this.patterns.procedureDate),
      dates: this.extractAllDates(admissionNote + ' ' + finalNote + ' ' + procedureNote)
    };
  }

  tryPatterns(text, patternList) {
    for (const pattern of patternList) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return this.normalizeDate(match[1].trim());
      }
    }
    return '';
  }

  extractAllDates(text) {
    const datePattern = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g;
    const dates = [];
    let match;
    
    while ((match = datePattern.exec(text)) !== null) {
      const normalized = this.normalizeDate(match[1]);
      if (normalized && !dates.includes(normalized)) {
        dates.push(normalized);
      }
    }
    
    return dates;
  }

  normalizeDate(dateStr) {
    // Basic date validation and normalization
    try {
      const parts = dateStr.split(/[/-]/);
      if (parts.length === 3) {
        const [month, day, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${fullYear}`;
      }
    } catch (e) {
      // Return as-is if normalization fails
    }
    return dateStr;
  }
}
