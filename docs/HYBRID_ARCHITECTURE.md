# Hybrid LLM Architecture Documentation

## Overview

This discharge summary application now implements a **hybrid architecture** that combines deterministic extraction methods with Large Language Model (LLM) capabilities for optimal accuracy and reliability.

## Architecture Philosophy

The hybrid approach follows the principle:
- **Use deterministic methods** for structured, well-defined data (demographics, dates, medications)
- **Use LLM** for complex reasoning tasks (complication detection, clinical synthesis, consultant parsing)

## Pipeline Components

### 1. Deterministic Extraction Layer

#### ExtractDemographics (Rule-based)
- **Purpose**: Extract patient demographics using regex patterns
- **Extracts**: Patient name, age, sex, MRN
- **Method**: Pattern matching with high confidence
- **Location**: `/src/extractors/demographics_extractor.js`

#### ExtractMedications (NER-based)
- **Purpose**: Extract discharge medications with doses
- **Extracts**: Medication names, doses, routes, frequencies
- **Method**: Pattern matching with known medication database
- **Location**: `/src/extractors/medication_extractor.js`

#### ExtractDates (Regex)
- **Purpose**: Extract and normalize clinical dates
- **Extracts**: Admission date, discharge date, procedure dates
- **Method**: Regex patterns with date normalization
- **Location**: `/src/extractors/date_extractor.js`

#### StructuredDataExtractor (Coordinator)
- **Purpose**: Orchestrate all deterministic extractors
- **Combines**: Demographics, medications, dates, procedures, diagnoses
- **Location**: `/src/extractors/structured_data_extractor.js`

### 2. LLM-Powered Components

#### LLMComplicationDetector
- **Purpose**: Detect and categorize medical complications using LLM reasoning
- **Detects**: Infections, seizures, deficits, CSF leaks, hemorrhage, etc.
- **Method**: LLM with structured prompts + fallback to pattern matching
- **Location**: `/src/llm/complication_detector.js`

#### LLMClinicalSynthesizer
- **Purpose**: Generate comprehensive clinical narratives
- **Creates**: Hospital course, presenting illness, major events
- **Method**: LLM synthesis with medical context + fallback
- **Location**: `/src/llm/clinical_synthesizer.js`

#### LLMConsultantParser
- **Purpose**: Extract and structure consultant recommendations
- **Extracts**: Service, recommendations, medications, follow-up plans
- **Method**: LLM parsing + pattern-based fallback
- **Location**: `/src/llm/consultant_parser.js`

### 3. Validation Layer

#### ClinicalDataValidator
- **Purpose**: Cross-validate LLM output against deterministic extraction
- **Validates**: 
  - Required fields completeness
  - Demographic consistency
  - Missed complications
  - Temporal consistency
  - Medication accuracy
- **Location**: `/src/validators/clinical_validator.js`

### 4. Core Integration

#### LLMDischargeSummaryEngine
- **Purpose**: Unified interface to multiple LLM providers
- **Supports**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Features**: Provider abstraction, response parsing, error handling
- **Location**: `/src/core/llm_integration.js`

#### NeurosurgicalDischargeSummaryService
- **Purpose**: Main orchestration service for the hybrid pipeline
- **Workflow**:
  1. Deterministic extraction (demographics, dates, medications)
  2. LLM complication detection
  3. LLM consultant parsing
  4. Data merging
  5. LLM clinical synthesis
  6. Validation and quality checks
- **Location**: `/src/services/discharge_summary_service.js`

## Usage

### Basic Usage (Patterns Only)

```javascript
import { NeurosurgicalDischargeSummaryService } from './services/discharge_summary_service.js';
import { DischargeSummaryConfig } from './config/llm_config.js';

// Create configuration (no API keys = patterns only)
const config = new DischargeSummaryConfig();
const service = new NeurosurgicalDischargeSummaryService(config);

// Generate summary
const notes = {
  admission: 'Patient admission note...',
  progress: 'Progress notes...',
  consultant: 'Consultant notes...',
  procedure: 'Procedure note...',
  final: 'Discharge note...'
};

const result = service.generateWithPatternsOnly(notes);
console.log(result.summary);
console.log(result.validation);
```

### Advanced Usage (Hybrid with LLM)

```javascript
import { NeurosurgicalDischargeSummaryService } from './services/discharge_summary_service.js';
import { DischargeSummaryConfig } from './config/llm_config.js';

// Create configuration with API keys
const config = new DischargeSummaryConfig({
  anthropicApiKey: 'your-claude-api-key',
  openaiApiKey: 'your-openai-api-key',
  googleApiKey: 'your-gemini-api-key',
  modelProvider: 'anthropic', // or 'openai', 'google'
  temperature: 0.1,
  maxTokens: 4000
});

const service = new NeurosurgicalDischargeSummaryService(config);

// Generate summary with LLM
const result = await service.generateDischargeSummary(notes);

console.log('Summary:', result.summary);
console.log('Validation:', result.validation);
console.log('Completeness:', result.completeness);
console.log('Pipeline:', result.pipeline);
```

### React Hook Usage

```javascript
import { useHybridDischargeSummary } from './hooks/useHybridDischargeSummary.js';

function MyComponent() {
  const { loading, error, result, generateSummary } = useHybridDischargeSummary();

  const handleGenerate = async () => {
    const apiKeys = {
      claude: 'your-claude-key',
      openai: 'your-openai-key',
      gemini: 'your-gemini-key'
    };

    const notes = {
      admission: '...',
      progress: '...',
      // ...
    };

    await generateSummary(notes, apiKeys, true); // true = use LLM
  };

  return (
    <div>
      {loading && <p>Generating...</p>}
      {error && <p>Error: {error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

## Pipeline Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Clinical Notes Input                     │
│  (admission, progress, consultant, procedure, final)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 1: Deterministic Extraction                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • ExtractDemographics (Rule-based)                  │   │
│  │ • ExtractMedications (NER patterns)                 │   │
│  │ • ExtractDates (Regex)                              │   │
│  │ • Extract Procedures & Diagnoses                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 2: LLM Complication Detection                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Analyze notes for complications                   │   │
│  │ • Categorize and structure findings                 │   │
│  │ • Fallback to pattern matching if LLM fails         │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 3: LLM Consultant Parsing                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Extract consultant recommendations                │   │
│  │ • Structure by service/specialty                    │   │
│  │ • Fallback to pattern matching if needed            │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 4: Data Merging                                │
│  (Combine structured data with LLM analysis)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 5: LLM Clinical Synthesis                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Generate hospital course narrative                │   │
│  │ • Synthesize presenting illness                     │   │
│  │ • Create comprehensive summaries                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 6: Validation & Quality Checks                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Cross-validate demographics                       │   │
│  │ • Check for missed complications                    │   │
│  │ • Validate temporal consistency                     │   │
│  │ • Assess completeness                               │   │
│  │ • Calculate confidence scores                       │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Final Discharge Summary Output                 │
│  • Complete patient data                                    │
│  • Validation results                                       │
│  • Completeness assessment                                  │
│  • Pipeline execution details                               │
│  • Metadata and timestamps                                  │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### API Key Management

API keys can be configured in three ways:

1. **localStorage** (recommended for browser apps):
```javascript
localStorage.setItem('claudeApiKey', 'your-key');
localStorage.setItem('openaiApiKey', 'your-key');
localStorage.setItem('geminiApiKey', 'your-key');

const config = DischargeSummaryConfig.fromLocalStorage();
```

2. **Direct configuration**:
```javascript
const config = new DischargeSummaryConfig({
  anthropicApiKey: process.env.CLAUDE_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleApiKey: process.env.GEMINI_API_KEY
});
```

3. **Environment variables** (for server-side):
```bash
export ANTHROPIC_API_KEY=your-key
export OPENAI_API_KEY=your-key
export GEMINI_API_KEY=your-key
```

### Model Configuration

```javascript
const config = new DischargeSummaryConfig({
  modelProvider: 'anthropic',  // 'anthropic', 'openai', 'google'
  modelName: 'claude-3-sonnet-20240229',  // or custom model
  temperature: 0.1,  // Low for medical accuracy
  maxTokens: 4000
});
```

## Validation Results

The validation system provides:

```javascript
{
  isValid: boolean,           // Overall validity
  warnings: string[],         // Non-critical issues
  errors: string[],           // Critical issues
  confidenceScores: {
    demographics: 0.0-1.0,
    dates: 0.0-1.0,
    clinical: 0.0-1.0,
    medications: 0.0-1.0,
    overall: 0.0-1.0
  },
  timestamp: ISO_DATE_STRING
}
```

## Error Handling

The hybrid pipeline includes robust error handling:

1. **LLM Failures**: Automatic fallback to pattern-based extraction
2. **API Errors**: Graceful degradation to deterministic methods
3. **Parse Errors**: Multiple JSON extraction strategies
4. **Validation Warnings**: Non-blocking alerts for review

## Testing

Run the test suite:

```bash
npm test src/services/discharge_summary_service.test.js
```

Test coverage includes:
- Configuration management
- All extractor components
- Service orchestration
- Validation logic
- Pipeline workflow

## Performance Considerations

- **Deterministic extraction**: Fast (< 100ms)
- **LLM processing**: Moderate (2-5 seconds per call)
- **Total pipeline**: 5-15 seconds with LLM, < 1 second without

## Security Notes

- API keys are never logged or stored in generated summaries
- Patient data is never sent to external services without explicit consent
- All LLM communications use HTTPS
- Local pattern extraction is PHI-safe (no external transmission)

## Future Enhancements

- [ ] Local NLP models for offline operation
- [ ] Caching layer for repeated extractions
- [ ] Advanced validation rules
- [ ] Multi-language support
- [ ] Custom prompt templates
- [ ] Feedback loop for continuous improvement
