# Quick Start: Hybrid Backend Integration

## 5-Minute Integration Guide

Follow these steps to integrate the hybrid backend into your existing component.

---

## Step 1: Open the Component File

```bash
# Open in your editor
code /Users/ramihatoum/Desktop/app/discharge-summary/src/components/DischargeSummaryGenerator.jsx
```

---

## Step 2: Add Import (Line 10)

**Find:**
```jsx
import TrainingExamplesManager from './TrainingExamplesManager';
```

**Add after it:**
```jsx
import { useHybridDischargeSummary } from '../hooks/useHybridDischargeSummary';
```

**Result:**
```jsx
import TrainingExamplesManager from './TrainingExamplesManager';
import { useHybridDischargeSummary } from '../hooks/useHybridDischargeSummary';
```

---

## Step 3: Initialize Hook (Line 12)

**Find:**
```jsx
const DischargeSummaryGenerator = () => {
  // Core State - Single unified input
```

**Add between them:**
```jsx
const DischargeSummaryGenerator = () => {
  // Hybrid backend hook
  const {
    loading: hybridLoading,
    error: hybridError,
    generateSummary: generateHybridSummary
  } = useHybridDischargeSummary();

  // Core State - Single unified input
```

---

## Step 4: Replace handleExtractData Function

### Find this function (around line 1078):

```jsx
const handleExtractData = async () => {
  // ... existing code ...
};
```

### Replace it with:

**See CODE_SNIPPETS.md Snippet 3 for the complete replacement code** (too long to show here).

**Quick copy command:**
```bash
# Copy snippet from guide
open /Users/ramihatoum/Desktop/app/discharge-summary/CODE_SNIPPETS.md
```

---

## Step 5: Add Mapping Function

**After the `handleExtractData` function, add:**

**See CODE_SNIPPETS.md Snippet 4 for the complete mapping function** (too long to show here).

---

## Step 6: Save and Test

### Save the file
```bash
# Ctrl+S or Cmd+S
```

### Test without API keys (Pattern-only)
1. Open app in browser
2. Make sure AI toggle is OFF
3. Paste test notes
4. Click "Extract"
5. Should see: "Pattern extraction completed"

### Test with API keys (Hybrid)
1. Add at least one API key
2. Turn AI toggle ON
3. Paste test notes
4. Click "Extract"
5. Should see: "Hybrid backend extraction completed successfully"

---

## Verification Checklist

After making changes, verify:

- [ ] No compile errors
- [ ] App loads successfully
- [ ] Input field still works
- [ ] Extract button still works
- [ ] Pattern extraction works (AI off, no keys)
- [ ] Hybrid extraction works (AI on, with keys)
- [ ] Extracted data displays correctly
- [ ] All tabs still work (input, review, summary, training)
- [ ] Auto-save still works
- [ ] Dark mode still works

---

## Test Notes

Use these test notes to verify functionality:

```
ADMISSION NOTE
Patient Name: John Smith
Age: 58 years old
Sex: Male
MRN: 123456

Chief Complaint: Patient admitted with severe headache and neck stiffness

History of Present Illness:
Mr. Smith is a 58-year-old male who presented to the ED with sudden onset severe headache,
photophobia, and nuchal rigidity. CT head showed subarachnoid hemorrhage.

PROGRESS NOTE
Post-Op Day 1:
Patient underwent successful clipping of anterior communicating artery aneurysm.
Neurological exam: Alert and oriented x3, no focal deficits.
Vitals stable: BP 128/75, HR 72, Temp 37.2C

DISCHARGE NOTE
Discharge Date: 2024-01-15
Discharge Diagnosis: Subarachnoid hemorrhage, status post aneurysm clipping
Discharge Medications:
- Nimodipine 60mg PO q4h
- Levetiracetam 500mg PO BID
- Acetaminophen 650mg PO q6h PRN

Disposition: Home with family
Follow-up: Neurosurgery clinic in 2 weeks
```

---

## Expected Output

### With Pattern-Only (AI off):
- Patient Name: John Smith
- Age: 58
- Sex: Male
- MRN: 123456
- Discharge Diagnosis: Subarachnoid hemorrhage, status post aneurysm clipping
- Medications: [Nimodipine, Levetiracetam, Acetaminophen]
- Disposition: Home with family

### With Hybrid (AI on):
- All of the above, PLUS:
- Enhanced complications detection
- Improved consultant recommendations parsing
- Better clinical narrative synthesis
- Validation scores
- Pipeline status metadata

---

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Check import path is correct:
```jsx
import { useHybridDischargeSummary } from '../hooks/useHybridDischargeSummary';
```

### Issue: "extractedData is null"
**Solution:** Check browser console for errors. Look for:
```
Using hybrid backend for extraction...
```
or
```
Using pattern-only extraction...
```

### Issue: "Function not defined"
**Solution:** Make sure you added both:
1. `handleExtractData` (replacement)
2. `mapHybridResultToUIState` (new function)

### Issue: "API key not working"
**Solution:** Check console for LLM errors. Verify key format:
```javascript
const apiKeys = {
  gemini: geminiApiKey,    // NOT: google or googleApiKey
  openai: openaiApiKey,    // NOT: gpt
  claude: claudeApiKey     // NOT: anthropic
};
```

### Issue: "Fallback always triggered"
**Solution:** Check that `useAI` state is true and at least one key is provided:
```javascript
if (useAI && (geminiApiKey || openaiApiKey || claudeApiKey)) {
  // Should enter this block when AI is enabled
}
```

---

## Console Logs to Watch For

### Success Path:
```
Detected notes: admission, progress, final
Using hybrid backend for extraction...
Step 1: Deterministic extraction...
Step 2: LLM complication detection...
Step 3: LLM consultant parsing...
Step 4: Merging data...
Step 5: LLM clinical synthesis...
Step 6: Validating output...
Pipeline execution: {complicationDetection: "llm", ...}
```

### Fallback Path:
```
Detected notes: admission, progress
Using hybrid backend for extraction...
Hybrid backend extraction failed, falling back to patterns: [Error details]
Using legacy patterns...
```

---

## Optional: Add Status Indicator

To show users which extraction method was used, add the pipeline status indicator UI.

**See CODE_SNIPPETS.md Snippet 5** for the UI code.

This will display:
- "Hybrid (LLM + Patterns)" when using full pipeline
- "Deterministic Only" when using pattern-only
- Validation status (Validated / Warnings)
- Pipeline step details

---

## Performance Expectations

### Pattern-Only Mode:
- **Speed:** Instant (< 1 second)
- **Accuracy:** Good for structured data
- **Quality:** Basic for complex cases

### Hybrid Mode:
- **Speed:** 5-15 seconds (depends on LLM)
- **Accuracy:** Excellent
- **Quality:** High for complex cases

---

## Next Steps

After successful integration:

1. **Test thoroughly** with real clinical notes
2. **Compare outputs** between pattern-only and hybrid
3. **Monitor console** for any errors
4. **Collect feedback** from users
5. **Fine-tune** extraction patterns if needed
6. **Consider removing** old multi-AI functions if hybrid works well

---

## Rollback Plan

If something goes wrong:

1. **Revert the file:**
   ```bash
   git checkout src/components/DischargeSummaryGenerator.jsx
   ```

2. **Or manually remove:**
   - Remove the import
   - Remove the hook initialization
   - Restore the original `handleExtractData` function
   - Remove the `mapHybridResultToUIState` function

The app will work as before since all original functions are still in the file.

---

## Getting Help

If you encounter issues:

1. **Check the guides:**
   - INTEGRATION_SUMMARY.md - Detailed explanation
   - CODE_SNIPPETS.md - All code snippets
   - ARCHITECTURE_DIAGRAM.md - Visual diagrams
   - HYBRID_INTEGRATION_GUIDE.md - Full integration guide

2. **Check console logs** for error messages

3. **Verify files exist:**
   ```bash
   ls -la src/hooks/useHybridDischargeSummary.js
   ls -la src/services/discharge_summary_service.js
   ```

4. **Check git status:**
   ```bash
   git status
   git diff src/components/DischargeSummaryGenerator.jsx
   ```

---

## Success Indicators

You'll know the integration is successful when:

✓ App compiles without errors
✓ Extract button works
✓ Data displays in UI
✓ Console shows "Using hybrid backend..." or "Using pattern-only..."
✓ No unexpected errors in console
✓ All existing features still work
✓ Auto-save still works
✓ Dark mode still works

---

## Summary

**What you're doing:**
- Adding 1 import line
- Adding 5 hook initialization lines
- Replacing 1 function (~60 lines)
- Adding 1 mapping function (~60 lines)

**What you're preserving:**
- ~2400 lines of existing UI code
- All state management
- All existing features
- All localStorage logic
- All training/ML features

**Total changes:** ~130 lines in a 2500-line file (5% modification)

**Time required:** 5-10 minutes

**Risk level:** Low (all existing code preserved as fallback)

---

## You're Ready!

Open the file, make the 4 changes, save, and test. Good luck!
