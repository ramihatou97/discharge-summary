# Hybrid Backend Integration Guide

This document provides the KEY CHANGES needed to integrate the hybrid backend into `DischargeSummaryGenerator.jsx`.

## 1. IMPORT CHANGES

Replace the imports section with these additions:

```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Download, Copy, AlertCircle, CheckCircle,
  Upload, Trash2, Wand2, RefreshCw, Edit, Settings,
  Save, Eye, EyeOff, Printer, Shield, Database,
  Activity, Clock, ClipboardList, ChevronDown, ChevronRight,
  Heart, Brain, Zap, Loader2, Info, BookOpen
} from 'lucide-react';
import TrainingExamplesManager from './TrainingExamplesManager';
// NEW: Import hybrid backend hook
import { useHybridDischargeSummary } from '../hooks/useHybridDischargeSummary';
```

## 2. HOOK INITIALIZATION

Add this hook initialization right after the component declaration (after line 11):

```jsx
const DischargeSummaryGenerator = () => {
  // NEW: Initialize hybrid backend hook
  const {
    loading: hybridLoading,
    error: hybridError,
    generateSummary: generateHybridSummary
  } = useHybridDischargeSummary();

  // Core State - Single unified input
  const [unifiedNotes, setUnifiedNotes] = useState('');
  // ... rest of existing state
```

## 3. REPLACE handleExtractData FUNCTION

Replace the entire `handleExtractData` function (lines 1078-1137) with this hybrid version:

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
    // Step 1: Detect note types (keep existing logic)
    const detected = detectNoteTypes(unifiedNotes);
    setDetectedNotes(detected);

    // Show what was detected
    const detectedTypes = Object.entries(detected)
      .filter(([_, content]) => content.trim())
      .map(([type, _]) => type);

    if (detectedTypes.length > 0) {
      setSuccess(`Detected notes: ${detectedTypes.join(', ')}`);
    }

    // Step 2: Extract data using HYBRID BACKEND or patterns
    let extracted;

    if (useAI && (geminiApiKey || openaiApiKey || claudeApiKey)) {
      try {
        // NEW: Use hybrid backend
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
      // Fallback: Use pattern-based extraction only
      try {
        console.log('Using pattern-only extraction (no AI)...');

        // NEW: For consistency, use hybrid backend's pattern-only mode
        const hybridResult = await generateHybridSummary(detected, {}, false);
        extracted = mapHybridResultToUIState(hybridResult);

        setSuccess('Pattern extraction completed');
      } catch (patternError) {
        console.warn('Hybrid pattern extraction failed, using legacy patterns:', patternError);
        extracted = extractWithPatterns(detected);
        setSuccess('Legacy pattern extraction completed');
      }
    }

    // Validate extracted data (keep existing validation)
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

## 4. ADD MAPPING FUNCTION

Add this new helper function right after `handleExtractData` (around line 1138):

```jsx
// NEW: Map hybrid backend result to UI state format
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

## 5. OPTIONAL: Add Pipeline Status Indicator

If you want to show users which backend method was used, add this component in the UI (around line 2018, right after the "Extracted Data" card title):

```jsx
{/* Pipeline Status Indicator */}
{extractedData?._metadata && (
  <div className="mb-2 text-xs text-gray-600">
    <span className="font-medium">Method: </span>
    {extractedData._metadata.approach === 'hybrid' ? (
      <span className="text-green-600">Hybrid (LLM + Patterns)</span>
    ) : (
      <span className="text-blue-600">Deterministic Only</span>
    )}
    {extractedData._metadata.llmProvider !== 'none' && (
      <span> via {extractedData._metadata.llmProvider}</span>
    )}
  </div>
)}
```

## 6. KEEP EXISTING FUNCTIONS

IMPORTANT: Keep all existing functions as fallbacks:
- `detectNoteTypes` - Still needed for note detection
- `extractWithPatterns` - Fallback for legacy mode
- `extractWithGemini`, `synthesizeWithOpenAI`, `structureWithClaude` - Optional fallbacks
- All ML learning functions
- All UI components and rendering logic

## Summary of Changes

1. Added hybrid hook import and initialization
2. Replaced `handleExtractData` to call hybrid backend
3. Added `mapHybridResultToUIState` to transform hybrid output to UI format
4. Optional: Added pipeline status indicator UI
5. Maintained backward compatibility with pattern-based fallback

## Testing the Integration

1. Without API keys: Should use pattern-only extraction via hybrid backend
2. With API keys: Should use full hybrid pipeline (patterns + LLM)
3. On errors: Should gracefully fallback to legacy pattern extraction
4. All existing UI features should continue working (auto-save, editing, training, etc.)

## File Structure

```
src/
├── components/
│   ├── DischargeSummaryGenerator.jsx (modify this file)
│   └── TrainingExamplesManager.jsx (no changes)
├── hooks/
│   └── useHybridDischargeSummary.js (already exists)
└── services/
    └── discharge_summary_service.js (already exists)
```
