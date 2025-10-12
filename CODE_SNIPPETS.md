# Ready-to-Use Code Snippets for Hybrid Integration

Copy and paste these exact code snippets into `DischargeSummaryGenerator.jsx`.

## Snippet 1: Import Addition (Line ~10)

**Find this line:**
```jsx
import TrainingExamplesManager from './TrainingExamplesManager';
```

**Add this line right after it:**
```jsx
import { useHybridDischargeSummary } from '../hooks/useHybridDischargeSummary';
```

---

## Snippet 2: Hook Initialization (After Line 11)

**Find this line:**
```jsx
const DischargeSummaryGenerator = () => {
```

**Add these lines right after it:**
```jsx
  // Hybrid backend hook
  const {
    loading: hybridLoading,
    error: hybridError,
    generateSummary: generateHybridSummary
  } = useHybridDischargeSummary();

```

---

## Snippet 3: Replace handleExtractData Function (Lines ~1078-1137)

**Find and REPLACE the entire function from:**
```jsx
const handleExtractData = async () => {
```
**to:**
```jsx
};
```

**With this new version:**

```jsx
// Main extraction handler with hybrid backend integration
const handleExtractData = async () => {
  if (!unifiedNotes.trim()) {
    setError('Please enter clinical notes');
    return;
  }

  setLoading(true);
  setError('');
  setWarnings([]);
  setSuccess('');

  try {
    // Step 1: Detect note types
    const detected = detectNoteTypes(unifiedNotes);
    setDetectedNotes(detected);

    // Show what was detected
    const detectedTypes = Object.entries(detected)
      .filter(([_, content]) => content.trim())
      .map(([type, _]) => type);

    if (detectedTypes.length > 0) {
      setSuccess(`Detected notes: ${detectedTypes.join(', ')}`);
    }

    // Step 2: Extract data using hybrid backend or patterns
    let extracted;

    if (useAI && (geminiApiKey || openaiApiKey || claudeApiKey)) {
      try {
        // Use hybrid backend
        console.log('Using hybrid backend for extraction...');

        const apiKeys = {
          gemini: geminiApiKey,
          openai: openaiApiKey,
          claude: claudeApiKey
        };

        // Call hybrid backend
        const hybridResult = await generateHybridSummary(detected, apiKeys, true);

        // Map hybrid result to UI state format
        extracted = mapHybridResultToUIState(hybridResult);

        setSuccess('Hybrid backend extraction completed successfully');

        // Show pipeline info
        if (hybridResult.pipeline) {
          console.log('Pipeline execution:', hybridResult.pipeline);
        }

        // Show validation warnings if any
        if (hybridResult.validation && !hybridResult.validation.isValid) {
          const validationWarnings = hybridResult.validation.errors || [];
          if (validationWarnings.length > 0) {
            setWarnings(validationWarnings);
          }
        }

      } catch (aiError) {
        console.warn('Hybrid backend extraction failed, falling back to patterns:', aiError);
        extracted = extractWithPatterns(detected);
        setWarnings(['Hybrid extraction failed, used pattern matching instead']);
      }
    } else {
      // Fallback: Use pattern-based extraction
      try {
        console.log('Using pattern-only extraction (no AI)...');

        // For consistency, use hybrid backend's pattern-only mode
        const hybridResult = await generateHybridSummary(detected, {}, false);
        extracted = mapHybridResultToUIState(hybridResult);

        setSuccess('Pattern extraction completed');
      } catch (patternError) {
        console.warn('Hybrid pattern extraction failed, using legacy patterns:', patternError);
        extracted = extractWithPatterns(detected);
        setSuccess('Legacy pattern extraction completed');
      }
    }

    // Validate extracted data
    const validationWarnings = [];
    if (!extracted.patientName) validationWarnings.push('Patient name not found');
    if (!extracted.dischargeDiagnosis) validationWarnings.push('Discharge diagnosis not found');
    if (!extracted.dischargeMedications?.length) validationWarnings.push('No discharge medications found');

    if (validationWarnings.length > 0) {
      setWarnings(prev => [...prev, ...validationWarnings]);
    }

    setExtractedData(extracted);
    setActiveTab('review');
  } catch (err) {
    setError(`Extraction failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
```

---

## Snippet 4: Add Mapping Function (After handleExtractData, Line ~1138)

**Add this new function right after the `handleExtractData` function:**

```jsx
// Map hybrid backend result to UI state format
const mapHybridResultToUIState = useCallback((hybridResult) => {
  if (!hybridResult || !hybridResult.summary) {
    throw new Error('Invalid hybrid result format');
  }

  const summary = hybridResult.summary;

  // Map hybrid backend format to existing UI format
  return {
    // Demographics
    patientName: summary.patientName || '',
    age: summary.age || '',
    sex: summary.sex || '',
    mrn: summary.mrn || '',

    // Dates
    admitDate: summary.admitDate || '',
    dischargeDate: summary.dischargeDate || '',

    // Diagnoses
    admittingDiagnosis: summary.admittingDiagnosis || '',
    dischargeDiagnosis: summary.dischargeDiagnosis || '',

    // Clinical narrative
    historyPresenting: summary.historyPresenting || '',
    hospitalCourse: summary.hospitalCourse || '',

    // Procedures & complications
    procedures: summary.procedures || [],
    complications: summary.complications || [],

    // Imaging & exams
    imaging: summary.imaging || [],
    currentExam: summary.currentExam || '',
    dischargeExam: summary.dischargeExam || '',
    neurologicalExam: summary.neurologicalExam || '',

    // Medical history
    pmh: summary.pmh || [],
    psh: summary.psh || [],
    allergies: summary.allergies || '',

    // Medications
    dischargeMedications: summary.dischargeMedications || [],

    // Vital signs & assessments
    vitalSigns: summary.vitalSigns || '',
    kps: summary.kps || '',
    functionalStatus: summary.functionalStatus || '',

    // Post-op & progress
    postOpProgress: summary.postOpProgress || '',
    majorEvents: summary.majorEvents || [],

    // Consultant recommendations
    consultantRecommendations: summary.consultantRecommendations || [],
    consultants: summary.consultants || [],

    // Discharge planning
    disposition: summary.disposition || '',
    diet: summary.diet || '',
    activity: summary.activity || '',
    followUp: summary.followUp || [],

    // Metadata (optional, for debugging)
    _metadata: hybridResult.metadata,
    _pipeline: hybridResult.pipeline,
    _validation: hybridResult.validation
  };
}, []);
```

---

## Snippet 5: OPTIONAL - Pipeline Status Indicator (Line ~2018)

**Find this section in the render:**
```jsx
<div className="card">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
    <Edit className="h-5 w-5 text-gray-400" />
  </div>
```

**Add this right after the `</div>` of the header (before the `<div className="space-y-3...">`:**

```jsx
  {/* Pipeline Status Indicator */}
  {extractedData?._metadata && (
    <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-700">Extraction Method: </span>
          {extractedData._metadata.approach === 'hybrid' ? (
            <span className="text-green-600 font-semibold">Hybrid (LLM + Patterns)</span>
          ) : (
            <span className="text-blue-600 font-semibold">Deterministic Only</span>
          )}
          {extractedData._metadata.llmProvider !== 'none' && (
            <span className="text-gray-600"> via {extractedData._metadata.llmProvider}</span>
          )}
        </div>
        {extractedData._validation && (
          <div className={`flex items-center ${extractedData._validation.isValid ? 'text-green-600' : 'text-yellow-600'}`}>
            {extractedData._validation.isValid ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Validated</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Warnings</span>
              </>
            )}
          </div>
        )}
      </div>
      {extractedData._pipeline && (
        <div className="mt-1 text-gray-600">
          <span>Pipeline: </span>
          <span className="font-mono">
            {extractedData._pipeline.complicationDetection} | {extractedData._pipeline.consultantParsing} | {extractedData._pipeline.clinicalSynthesis}
          </span>
        </div>
      )}
    </div>
  )}
```

---

## Quick Integration Steps

1. **Open** `/Users/ramihatoum/Desktop/app/discharge-summary/src/components/DischargeSummaryGenerator.jsx`

2. **Add Snippet 1** (import) after line 9

3. **Add Snippet 2** (hook initialization) after line 11

4. **Replace with Snippet 3** (handleExtractData function) at lines ~1078-1137

5. **Add Snippet 4** (mapping function) after handleExtractData

6. **OPTIONAL: Add Snippet 5** (status indicator) at line ~2018

7. **Save** the file

8. **Test** with and without API keys

---

## Verification Checklist

After making changes, verify:

- [ ] File compiles without errors
- [ ] No missing imports
- [ ] `detectNoteTypes` function still exists
- [ ] `extractWithPatterns` function still exists
- [ ] All existing state variables present
- [ ] Console shows "Using hybrid backend..." when AI enabled
- [ ] Console shows "Using pattern-only..." when AI disabled
- [ ] Extracted data appears in UI
- [ ] Validation warnings show correctly
- [ ] Auto-save still works
- [ ] Draft restore still works

---

## Common Issues & Solutions

### Issue: "Cannot find module 'useHybridDischargeSummary'"
**Solution:** Make sure the path is correct:
```jsx
import { useHybridDischargeSummary } from '../hooks/useHybridDischargeSummary';
```

### Issue: "mapHybridResultToUIState is not defined"
**Solution:** Make sure you added Snippet 4 and it's wrapped in `useCallback`

### Issue: "extractedData is null"
**Solution:** Check console for errors. Verify hybrid backend is returning data:
```javascript
console.log('Hybrid result:', hybridResult);
```

### Issue: "Fields are missing in UI"
**Solution:** Check the mapping function. Add any missing fields from your UI to the return object.

### Issue: "API key not being used"
**Solution:** Verify the key object structure:
```javascript
const apiKeys = {
  gemini: geminiApiKey,    // matches hook expectation
  openai: openaiApiKey,    // matches hook expectation
  claude: claudeApiKey     // matches hook expectation
};
```

### Issue: "Fallback not working"
**Solution:** Make sure `extractWithPatterns` function still exists in your file. Don't delete it yet.

---

## Testing Commands

### Test 1: Pattern-only (No API keys)
1. Clear all API keys
2. Disable AI toggle
3. Paste test notes
4. Click "Extract"
5. Should see "Pattern extraction completed"

### Test 2: Hybrid with API keys
1. Add at least one API key
2. Enable AI toggle
3. Paste test notes
4. Click "Extract"
5. Should see "Hybrid backend extraction completed successfully"

### Test 3: Error handling
1. Add invalid API key
2. Enable AI toggle
3. Paste test notes
4. Click "Extract"
5. Should fallback gracefully with warning

---

## Rollback Plan

If something goes wrong, you can rollback by:

1. Restore the original `handleExtractData` function
2. Remove the `mapHybridResultToUIState` function
3. Remove the hook initialization
4. Remove the import
5. Keep all other changes

The original functions are still in your file as fallbacks, so the app should still work even if hybrid integration fails.
