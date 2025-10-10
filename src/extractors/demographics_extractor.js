/**
 * Deterministic Demographics Extractor
 * Rule-based extraction for patient demographics
 */

export class ExtractDemographics {
  constructor() {
    this.patterns = {
      patientName: [
        /(?:Patient Name|Patient|Name|Mr\.|Mrs\.|Ms\.|Dr\.)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+a\s+\d+/m,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}),?\s+(?:a\s+)?\d{1,3}[\s-]*(?:year|yo)/
      ],
      age: [
        /(\d{1,3})[\s-]*(?:year|years|yo|y\.o\.|y\/o)[\s-]*old/i,
        /(?:Age|AGE)\s*:?\s*(\d{1,3})/i,
        /(?:is\s+a\s+|is\s+an\s+)(\d{1,3})[\s-]*(?:year|yo)/i
      ],
      sex: [
        /\b(male|female|man|woman|M|F)\b/i,
        /(?:Sex|Gender|SEX|GENDER)\s*:?\s*(male|female|M|F)/i
      ],
      mrn: [
        /(?:MRN|Medical Record Number|MR#|Medical Record)\s*:?\s*(\d+)/i,
        /(?:Record|Chart)\s*(?:#|Number)?\s*:?\s*(\d+)/i
      ]
    };
  }

  extract(text) {
    const result = {
      patientName: this.tryPatterns(text, this.patterns.patientName),
      age: this.tryPatterns(text, this.patterns.age),
      sex: this.normalizeSex(this.tryPatterns(text, this.patterns.sex)),
      mrn: this.tryPatterns(text, this.patterns.mrn)
    };

    return result;
  }

  tryPatterns(text, patternList) {
    for (const pattern of patternList) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  normalizeSex(sex) {
    if (!sex) return '';
    const normalized = sex.toUpperCase();
    if (normalized === 'M' || normalized === 'MALE' || normalized === 'MAN') {
      return 'Male';
    }
    if (normalized === 'F' || normalized === 'FEMALE' || normalized === 'WOMAN') {
      return 'Female';
    }
    return sex;
  }
}
