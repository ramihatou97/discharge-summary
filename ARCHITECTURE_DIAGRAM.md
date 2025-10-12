# Hybrid Backend Architecture - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DischargeSummaryGenerator.jsx                   │
│                         (React Component)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      USER INTERFACE                          │  │
│  │  - Unified text input (unifiedNotes)                        │  │
│  │  - API key inputs (Gemini, OpenAI, Claude)                  │  │
│  │  - AI toggle (useAI)                                        │  │
│  │  - Extract button → handleExtractData()                     │  │
│  │  - Display extracted data                                   │  │
│  │  - Training examples manager                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   handleExtractData()                        │  │
│  │                                                              │  │
│  │  Step 1: detectNoteTypes(unifiedNotes)                      │  │
│  │          ↓                                                   │  │
│  │          detected = { admission, progress,                  │  │
│  │                       consultant, procedure, final }        │  │
│  │                                                              │  │
│  │  Step 2: Choose extraction method                           │  │
│  │          ↓                                                   │  │
│  │      if (useAI && hasKeys)                                  │  │
│  │          ↓ YES                       ↓ NO                   │  │
│  │   Hybrid Backend              Pattern Only                  │  │
│  │   (LLM + Patterns)           (Patterns only)                │  │
│  │                                                              │  │
│  │  Step 3: mapHybridResultToUIState()                         │  │
│  │          ↓                                                   │  │
│  │          extractedData (UI format)                          │  │
│  │          ↓                                                   │  │
│  │  Step 4: setExtractedData(extractedData)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
            ┌─────────────────┴─────────────────┐
            │                                   │
            ↓                                   ↓
┌─────────────────────────┐       ┌─────────────────────────┐
│  useHybridDischargeSummary│       │   extractWithPatterns   │
│       (React Hook)        │       │   (Legacy Fallback)     │
└───────────┬───────────────┘       └─────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────────────┐
│        NeurosurgicalDischargeSummaryService                         │
│              (Hybrid Backend Service)                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           generateDischargeSummary(notes, config)            │  │
│  │                    (Full Hybrid Pipeline)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  STEP 1: Deterministic Extraction (Always)                   │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │   StructuredDataExtractor.extract(notes)               │  │  │
│  │  │   - Pattern matching for demographics, dates           │  │  │
│  │  │   - Regex extraction for medications, procedures       │  │  │
│  │  │   - Rule-based parsing for vital signs, allergies      │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │              ↓                                               │  │
│  │        structuredData = { patientName, age, procedures...} │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  STEP 2: LLM Complication Detection (if configured)         │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │   LLMComplicationDetector.detect(notes)                │  │  │
│  │  │   - Uses LLM to identify complex complications         │  │  │
│  │  │   - Detects subtle issues patterns might miss          │  │  │
│  │  │   - Fallback: pattern-based detection                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │              ↓                                               │  │
│  │        complications = { complications: [], hasComplications} │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  STEP 3: LLM Consultant Parsing (if configured)             │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │   LLMConsultantParser.parse(consultantNotes)           │  │  │
│  │  │   - Extracts consultant recommendations               │  │  │
│  │  │   - Identifies specialty consultants                   │  │  │
│  │  │   - Fallback: basic text parsing                       │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │              ↓                                               │  │
│  │        consultantData = { recommendations: [], consultants: [] }│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  STEP 4: Data Merging                                       │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │   Merge all data sources:                              │  │  │
│  │  │   - structuredData (from patterns)                     │  │  │
│  │  │   - complications (from LLM)                           │  │  │
│  │  │   - consultantData (from LLM)                          │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │              ↓                                               │  │
│  │        mergedData = { ...all fields combined }              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  STEP 5: LLM Clinical Synthesis (if configured)             │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │   LLMClinicalSynthesizer.synthesize(mergedData)        │  │  │
│  │  │   - Enhances clinical narratives                       │  │  │
│  │  │   - Improves hospital course description               │  │  │
│  │  │   - Fallback: use merged data as-is                    │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │              ↓                                               │  │
│  │        finalData = { enhanced clinical data }               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  STEP 6: Validation                                         │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │   ClinicalDataValidator.validateClinicalAccuracy()     │  │  │
│  │  │   - Check data integrity                               │  │  │
│  │  │   - Verify clinical accuracy                           │  │  │
│  │  │   - Check completeness                                 │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │              ↓                                               │  │
│  │        validation = { isValid, errors, warnings, score }   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    RETURN RESULT                             │  │
│  │  {                                                           │  │
│  │    summary: finalData,                                       │  │
│  │    validation: validation,                                   │  │
│  │    completeness: completeness,                               │  │
│  │    pipeline: { steps completed },                            │  │
│  │    metadata: { timestamp, approach, provider }               │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Pattern-Only Mode

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Extract" with AI disabled or no API keys             │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  handleExtractData()                                                │
│  - Detects notes: detectNoteTypes()                                 │
│  - Calls: generateHybridSummary(detected, {}, false)                │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  useHybridDischargeSummary Hook                                     │
│  - useLLM = false                                                   │
│  - Calls: service.generateWithPatternsOnly(notes)                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  NeurosurgicalDischargeSummaryService                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  generateWithPatternsOnly()                                  │  │
│  │  - StructuredDataExtractor.extract()                         │  │
│  │  - complicationDetector.fallbackDetection()                  │  │
│  │  - consultantParser.fallbackParsing()                        │  │
│  │  - clinicalSynthesizer.fallbackSynthesis()                   │  │
│  │  - validator.validateClinicalAccuracy()                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
                    { summary, validation, metadata }
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  mapHybridResultToUIState()                                         │
│  - Transforms backend format to UI format                           │
│  - Preserves all 30+ fields                                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
                         extractedData (UI state)
                                 ↓
                         Display in UI
```

## Data Flow: Hybrid Mode (AI Enabled)

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Extract" with AI enabled and API keys provided       │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  handleExtractData()                                                │
│  - Detects notes: detectNoteTypes()                                 │
│  - Calls: generateHybridSummary(detected, apiKeys, true)            │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  useHybridDischargeSummary Hook                                     │
│  - useLLM = true                                                    │
│  - Creates DischargeSummaryConfig with API keys                     │
│  - Calls: service.generateDischargeSummary(notes)                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  NeurosurgicalDischargeSummaryService                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  generateDischargeSummary() - FULL HYBRID PIPELINE          │  │
│  │                                                              │  │
│  │  1. StructuredDataExtractor.extract()                       │  │
│  │     → structuredData (patterns)                             │  │
│  │                                                              │  │
│  │  2. LLMComplicationDetector.detect() [LLM CALL]             │  │
│  │     → complications (LLM-enhanced)                          │  │
│  │                                                              │  │
│  │  3. LLMConsultantParser.parse() [LLM CALL]                  │  │
│  │     → consultantData (LLM-enhanced)                         │  │
│  │                                                              │  │
│  │  4. Merge all data                                          │  │
│  │     → mergedData                                            │  │
│  │                                                              │  │
│  │  5. LLMClinicalSynthesizer.synthesize() [LLM CALL]          │  │
│  │     → finalData (LLM-enhanced narratives)                   │  │
│  │                                                              │  │
│  │  6. ClinicalDataValidator.validateClinicalAccuracy()        │  │
│  │     → validation results                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
        { summary, validation, pipeline, metadata }
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  mapHybridResultToUIState()                                         │
│  - Transforms backend format to UI format                           │
│  - Preserves all 30+ fields                                         │
│  - Includes metadata for debugging                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
                extractedData (UI state with _metadata)
                                 ↓
                         Display in UI
                     (with pipeline status indicator)
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Extract" with AI enabled                             │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  handleExtractData()                                                │
│  Try: generateHybridSummary(detected, apiKeys, true)                │
└────────────────────────────────┬────────────────────────────────────┘
                                 ↓
                    ┌─────────────┴─────────────┐
                    │                           │
                SUCCESS                      ERROR
                    ↓                           ↓
        ┌───────────────────────┐   ┌──────────────────────────┐
        │  Use hybrid result    │   │  Catch aiError           │
        │  Show success message │   │  Log warning             │
        └───────────────────────┘   │  Try: generateHybridSummary│
                                    │       (detected, {}, false)│
                                    └──────────┬─────────────────┘
                                               ↓
                                    ┌──────────┴─────────────┐
                                    │                        │
                                SUCCESS                   ERROR
                                    ↓                        ↓
                        ┌────────────────────┐   ┌──────────────────┐
                        │ Use pattern result │   │  Catch patternError│
                        │ Show info message  │   │  Log warning     │
                        └────────────────────┘   │  Use legacy:     │
                                                 │  extractWithPatterns()│
                                                 └──────────────────┘
                                                           ↓
                                                 ┌──────────────────┐
                                                 │  Use legacy      │
                                                 │  Show fallback   │
                                                 │  message         │
                                                 └──────────────────┘
```

## Component State Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DischargeSummaryGenerator State                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Input State:                                                       │
│  ├─ unifiedNotes (string) - User's raw clinical notes              │
│  ├─ detectedNotes (object) - Auto-detected note sections:          │
│  │  ├─ admission                                                    │
│  │  ├─ progress                                                     │
│  │  ├─ consultant                                                   │
│  │  ├─ procedure                                                    │
│  │  └─ final                                                        │
│  │                                                                  │
│  Configuration State:                                               │
│  ├─ useAI (boolean) - Whether to use LLM                            │
│  ├─ geminiApiKey (string)                                           │
│  ├─ openaiApiKey (string)                                           │
│  ├─ claudeApiKey (string)                                           │
│  ├─ autoSave (boolean)                                              │
│  └─ selectedTemplate (string)                                       │
│  │                                                                  │
│  Output State:                                                      │
│  ├─ extractedData (object) - Structured clinical data:              │
│  │  ├─ Demographics: patientName, age, sex, mrn                    │
│  │  ├─ Dates: admitDate, dischargeDate                             │
│  │  ├─ Diagnoses: admittingDiagnosis, dischargeDiagnosis           │
│  │  ├─ Clinical: historyPresenting, hospitalCourse                 │
│  │  ├─ Procedures: procedures[], complications[]                   │
│  │  ├─ Imaging: imaging[]                                          │
│  │  ├─ Exams: currentExam, dischargeExam, neurologicalExam         │
│  │  ├─ History: pmh[], psh[], allergies                            │
│  │  ├─ Medications: dischargeMedications[]                         │
│  │  ├─ Assessments: vitalSigns, kps, functionalStatus              │
│  │  ├─ Progress: postOpProgress, majorEvents[]                     │
│  │  ├─ Consultants: consultantRecommendations[], consultants[]     │
│  │  ├─ Discharge: disposition, diet, activity, followUp[]          │
│  │  └─ Metadata: _metadata, _pipeline, _validation (optional)      │
│  │                                                                  │
│  ├─ generatedSummary (string) - Final formatted summary            │
│  └─ editableSummary (string) - User-edited version                 │
│  │                                                                  │
│  UI State:                                                          │
│  ├─ activeTab (string) - Current tab: input|review|summary|training│
│  ├─ loading (boolean)                                               │
│  ├─ error (string)                                                  │
│  ├─ warnings (string[])                                             │
│  ├─ success (string)                                                │
│  ├─ copied (boolean)                                                │
│  └─ isEditing (boolean)                                             │
│  │                                                                  │
│  ML Learning State:                                                 │
│  ├─ learningData (object)                                           │
│  └─ globalPatterns (object)                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Integration Points Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│  THREE KEY INTEGRATION POINTS                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. IMPORT (Line ~10)                                               │
│     Add: import { useHybridDischargeSummary } from '../hooks/...'  │
│                                                                     │
│  2. HOOK INITIALIZATION (Line ~11)                                  │
│     Add: const { generateSummary, ... } = useHybridDischargeSummary()│
│                                                                     │
│  3. FUNCTION REPLACEMENT (Lines ~1078-1137)                         │
│     Replace: handleExtractData()                                    │
│     Add: mapHybridResultToUIState()                                 │
│                                                                     │
│  ALL OTHER CODE REMAINS UNCHANGED                                   │
│  - 2400+ lines of UI code preserved                                 │
│  - All existing functions kept as fallbacks                         │
│  - All state management unchanged                                   │
│  - All localStorage logic unchanged                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Before vs After Comparison

### BEFORE (Legacy Multi-AI):
```javascript
handleExtractData() {
  detected = detectNoteTypes(unifiedNotes);

  if (useAI) {
    extracted = await extractWithGemini();      // Direct API call
    extracted = await synthesizeWithOpenAI();   // Direct API call
    extracted = await structureWithClaude();    // Direct API call
  } else {
    extracted = extractWithPatterns();          // Pattern matching
  }

  setExtractedData(extracted);
}
```

### AFTER (Hybrid Backend):
```javascript
handleExtractData() {
  detected = detectNoteTypes(unifiedNotes);

  if (useAI) {
    result = await generateHybridSummary(detected, keys, true);  // Hybrid pipeline
    extracted = mapHybridResultToUIState(result);                // Transform
  } else {
    result = await generateHybridSummary(detected, {}, false);   // Pattern-only
    extracted = mapHybridResultToUIState(result);                // Transform
  }

  // Fallback on error
  if (error) {
    extracted = extractWithPatterns(detected);                   // Legacy fallback
  }

  setExtractedData(extracted);
}
```

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│  BEFORE: Multiple Direct LLM Calls                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Component → Gemini API                                             │
│  Component → OpenAI API                                             │
│  Component → Claude API                                             │
│  Component → Pattern Extraction                                     │
│                                                                     │
│  Problems:                                                          │
│  ✗ Extraction logic in component (hard to test)                    │
│  ✗ Direct API calls (no abstraction)                               │
│  ✗ Sequential calls (slow)                                         │
│  ✗ No validation pipeline                                          │
│  ✗ Hard to add new providers                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  AFTER: Unified Hybrid Backend                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Component → Hook → Service → [Patterns + LLM + Validation]        │
│                                                                     │
│  Benefits:                                                          │
│  ✓ Extraction logic in service (testable)                          │
│  ✓ Abstracted LLM calls (clean interface)                          │
│  ✓ Optimized pipeline (parallel where possible)                    │
│  ✓ Built-in validation                                             │
│  ✓ Easy to extend                                                  │
│  ✓ Fallback at each step                                           │
│  ✓ Metadata and metrics included                                   │
└─────────────────────────────────────────────────────────────────────┘
```
