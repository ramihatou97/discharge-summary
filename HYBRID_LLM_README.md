# Hybrid LLM Implementation - Quick Start

## Overview

This repository now implements a **hybrid LLM architecture** that combines:
- ✅ **Deterministic extraction** for structured data (demographics, dates, medications)
- ✅ **LLM-powered analysis** for complex reasoning (complications, clinical synthesis, consultant parsing)
- ✅ **Validation layer** for quality assurance and cross-checking

## Installation

```bash
npm install
```

## Usage

### Option 1: Pattern-Based Only (No API Keys Required)

```javascript
import { NeurosurgicalDischargeSummaryService } from './src/services/discharge_summary_service.js';
import { DischargeSummaryConfig } from './src/config/llm_config.js';

const config = new DischargeSummaryConfig();
const service = new NeurosurgicalDischargeSummaryService(config);

const notes = {
  admission: 'Patient admission note...',
  progress: 'Progress notes...',
  consultant: 'Consultant notes...',
  procedure: 'Procedure note...',
  final: 'Discharge note...'
};

// Fast, deterministic extraction
const result = service.generateWithPatternsOnly(notes);
console.log(result.summary);
```

### Option 2: Hybrid (Recommended) - With LLM

```javascript
import { NeurosurgicalDischargeSummaryService } from './src/services/discharge_summary_service.js';
import { DischargeSummaryConfig } from './src/config/llm_config.js';

// Configure with API key
const config = new DischargeSummaryConfig({
  anthropicApiKey: 'your-claude-api-key',
  // OR openaiApiKey: 'your-openai-key',
  // OR googleApiKey: 'your-gemini-key',
  modelProvider: 'anthropic',
  temperature: 0.1,
  maxTokens: 4000
});

const service = new NeurosurgicalDischargeSummaryService(config);

// Comprehensive hybrid extraction
const result = await service.generateDischargeSummary(notes);

console.log('Summary:', result.summary);
console.log('Validation:', result.validation);
console.log('Pipeline:', result.pipeline);
```

### Option 3: React Hook

```javascript
import { useHybridDischargeSummary } from './src/hooks/useHybridDischargeSummary.js';

function MyComponent() {
  const { loading, error, result, generateSummary } = useHybridDischargeSummary();

  const handleGenerate = async () => {
    const apiKeys = {
      claude: localStorage.getItem('claudeApiKey'),
      openai: localStorage.getItem('openaiApiKey'),
      gemini: localStorage.getItem('geminiApiKey')
    };

    await generateSummary(notes, apiKeys, true); // true = use LLM
  };

  return (
    <div>
      {loading && <p>Generating...</p>}
      {error && <p>Error: {error}</p>}
      {result && <pre>{JSON.stringify(result.summary, null, 2)}</pre>}
    </div>
  );
}
```

## Architecture Components

### Deterministic Extractors
- **ExtractDemographics**: Rule-based demographics extraction
- **ExtractMedications**: NER-based medication extraction
- **ExtractDates**: Regex-based date extraction
- **StructuredDataExtractor**: Coordinates all deterministic extractors

### LLM-Powered Components
- **LLMComplicationDetector**: Detects and categorizes complications
- **LLMClinicalSynthesizer**: Generates clinical narratives
- **LLMConsultantParser**: Parses consultant recommendations

### Validation
- **ClinicalDataValidator**: Cross-validates and quality checks

### Core Services
- **LLMDischargeSummaryEngine**: Unified LLM interface (Claude, GPT, Gemini)
- **NeurosurgicalDischargeSummaryService**: Main orchestration service

## Pipeline Flow

```
Clinical Notes Input
    ↓
[Step 1] Deterministic Extraction
    - Demographics (rule-based)
    - Medications (NER patterns)
    - Dates (regex)
    ↓
[Step 2] LLM Complication Detection
    - Analyze for infections, seizures, deficits
    - Fallback to patterns if LLM unavailable
    ↓
[Step 3] LLM Consultant Parsing
    - Extract recommendations by service
    - Structure follow-up requirements
    ↓
[Step 4] Data Merging
    - Combine structured + LLM data
    ↓
[Step 5] LLM Clinical Synthesis
    - Generate hospital course
    - Create comprehensive narratives
    ↓
[Step 6] Validation
    - Cross-validate demographics
    - Check completeness
    - Calculate confidence scores
    ↓
Final Discharge Summary
```

## Testing

Run tests:
```bash
# All tests
npm test

# Just the hybrid architecture tests
npm test src/services/discharge_summary_service.test.js
```

## Build

```bash
npm run build
```

## API Key Configuration

### Browser (localStorage)
```javascript
localStorage.setItem('claudeApiKey', 'your-key');
localStorage.setItem('openaiApiKey', 'your-key');
localStorage.setItem('geminiApiKey', 'your-key');
```

### Environment Variables
```bash
export ANTHROPIC_API_KEY=your-key
export OPENAI_API_KEY=your-key
export GEMINI_API_KEY=your-key
```

## Documentation

- **Architecture Details**: [docs/HYBRID_ARCHITECTURE.md](docs/HYBRID_ARCHITECTURE.md)
- **Examples**: [src/examples/hybrid_pipeline_example.js](src/examples/hybrid_pipeline_example.js)

## Features

✅ **Deterministic extraction** for high-confidence structured data  
✅ **LLM analysis** for complex clinical reasoning  
✅ **Multi-provider support** (Claude, GPT-4, Gemini)  
✅ **Automatic fallback** from LLM to patterns  
✅ **Validation layer** for quality assurance  
✅ **Confidence scoring** for transparency  
✅ **No API keys required** for basic functionality  

## Performance

- **Pattern-based**: < 100ms
- **Hybrid (with LLM)**: 5-15 seconds
- **Trade-off**: Speed vs comprehensive analysis

## Security

- ✅ API keys never logged or stored in output
- ✅ Patient data never sent without consent
- ✅ All communications over HTTPS
- ✅ Local pattern extraction is PHI-safe

## License

See LICENSE file in repository.

## Contributing

See CONTRIBUTING.md for guidelines.
