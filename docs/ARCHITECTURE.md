# Architecture Diagrams: Discharge Summary Generator

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DISCHARGE SUMMARY GENERATOR                     │
│                         (React Web Application)                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ Note Input  │  │ Data Review  │  │ Risk Panel  │  │  Output  │ │
│  │  Section    │  │   Section    │  │             │  │  Section │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └──────────┘ │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ML Dashboard & Settings Panel                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                   State Management                          │    │
│  │  • 8 Note Types  • Extracted Data  • ML Training Data     │    │
│  │  • UI State      • Settings        • Risk Scores           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │ Extraction  │  │    Risk     │  │ Recommendation│              │
│  │   Engine    │  │ Assessment  │  │    Engine     │              │
│  └─────────────┘  └─────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
┌─────────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Data Storage Layer │  │  External APIs  │  │  Knowledge Base │
├─────────────────────┤  ├─────────────────┤  ├─────────────────┤
│                     │  │                 │  │                 │
│  • localStorage     │  │  Google Gemini  │  │ 500+ Medical    │
│    - Draft Data     │  │     API         │  │  Abbreviations  │
│    - ML Training    │  │  (Optional)     │  │                 │
│    - User Prefs     │  │                 │  │ Clinical        │
│                     │  │                 │  │  Guidelines     │
│  • Browser Cache    │  │                 │  │                 │
│                     │  │                 │  │ Demo Cases      │
└─────────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘

1. INPUT STAGE
   ┌──────────────────────────────────────┐
   │ User enters clinical notes           │
   │ • Admission  • Operative  • Progress │
   │ • Medications • Final • Imaging      │
   │ • Labs • Consults                    │
   └────────────────┬─────────────────────┘
                    │
                    ▼
2. PREPROCESSING
   ┌──────────────────────────────────────┐
   │ Text normalization                   │
   │ ↓                                    │
   │ Abbreviation expansion               │
   │ ↓                                    │
   │ Entity boundary detection            │
   └────────────────┬─────────────────────┘
                    │
                    ▼
3. EXTRACTION (Parallel Processing)
   ┌─────────────────────────────────────────────┐
   │                                             │
   │  ┌──────────────┐      ┌──────────────┐   │
   │  │   Pattern    │      │   AI/Gemini  │   │
   │  │  Extraction  │      │  Extraction  │   │
   │  │   (Regex)    │      │  (Optional)  │   │
   │  └──────┬───────┘      └──────┬───────┘   │
   │         │                     │            │
   │         └──────────┬──────────┘            │
   │                    ▼                       │
   │         ┌──────────────────┐              │
   │         │ Merge & Dedupe   │              │
   │         └──────────────────┘              │
   └────────────────┬────────────────────────────┘
                    │
                    ▼
4. CONFIDENCE SCORING
   ┌──────────────────────────────────────┐
   │ Calculate confidence for each field  │
   │ • Pattern match quality              │
   │ • Training data frequency            │
   │ • Medical term recognition           │
   │ • Context analysis                   │
   └────────────────┬─────────────────────┘
                    │
                    ▼
5. VALIDATION
   ┌──────────────────────────────────────┐
   │ Check required fields                │
   │ ↓                                    │
   │ Calculate completeness score         │
   │ ↓                                    │
   │ Generate warnings for gaps           │
   └────────────────┬─────────────────────┘
                    │
                    ▼
6. CLINICAL ANALYSIS (Parallel)
   ┌─────────────────────────────────────────┐
   │                                         │
   │  ┌─────────────┐  ┌──────────────┐    │
   │  │  Condition  │  │  Procedure   │    │
   │  │  Detection  │  │  Extraction  │    │
   │  └──────┬──────┘  └──────┬───────┘    │
   │         │                │             │
   │         └────────┬───────┘             │
   │                  ▼                     │
   │         ┌────────────────┐            │
   │         │ Risk Assessment│            │
   │         │  • Seizure     │            │
   │         │  • VTE         │            │
   │         │  • Readmission │            │
   │         └────────┬───────┘            │
   │                  ▼                     │
   │         ┌────────────────┐            │
   │         │ Recommendations│            │
   │         │ (Evidence-Based)│           │
   │         └────────────────┘            │
   └─────────────────┬───────────────────────┘
                    │
                    ▼
7. ML TRAINING (Background)
   ┌──────────────────────────────────────┐
   │ User corrections captured            │
   │ ↓                                    │
   │ Update pattern frequencies           │
   │ ↓                                    │
   │ Recalculate accuracy metrics         │
   │ ↓                                    │
   │ Save to localStorage                 │
   └────────────────┬─────────────────────┘
                    │
                    ▼
8. OUTPUT GENERATION
   ┌──────────────────────────────────────┐
   │ Select template                      │
   │ ↓                                    │
   │ Populate with extracted data         │
   │ ↓                                    │
   │ Apply medical formatting             │
   │ ↓                                    │
   │ Generate final document              │
   └────────────────┬─────────────────────┘
                    │
                    ▼
9. DISPLAY & EXPORT
   ┌──────────────────────────────────────┐
   │ • Display in UI                      │
   │ • Copy to clipboard                  │
   │ • Download as text file              │
   │ • Print formatted document           │
   └──────────────────────────────────────┘
```

---

## Component Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                          App.js (Main)                        │
│                       (1,413 lines - LARGE)                   │
└───────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Input Components│ │ Processing Logic │ │ Output Components│
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ NoteInputSection │ │ extractWithPattern│ │  OutputSection   │
│                  │ │ extractWithAI    │ │                  │
│ • 8 Note Types   │ │ expandAbbrev     │ │ • Summary Display│
│ • Text Areas     │ │ detectConditions │ │ • Copy/Download  │
│ • File Upload    │ │ extractProcedures│ │ • Print          │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ExtractedDataReview│ │  Risk Calculators│ │RiskAssessmentPanel
│                  │ │                  │ │                  │
│ • 40+ Fields     │ │ assessSeizureRisk│ │ • Visual Display │
│ • Edit Support   │ │ assessVTERisk    │ │ • Risk Scores    │
│ • Confidence     │ │ calcReadmissionRisk│ • Recommendations│
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   MLDashboard    │ │ Recommendation   │ │RecommendationsPanel
│                  │ │     Engine       │ │                  │
│ • Accuracy Chart │ │                  │ │ • Evidence-Based │
│ • Training Stats │ │ generateEvidence │ │ • Medications    │
│ • Model Metrics  │ │  BasedRecommend  │ │ • Follow-up      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## Extraction Algorithm Flow

```
┌─────────────────────────────────────────────────────────────┐
│              PATTERN-BASED EXTRACTION ALGORITHM             │
└─────────────────────────────────────────────────────────────┘

Input: Clinical Note Text
         │
         ▼
┌─────────────────────────────────────┐
│ 1. Define Patterns (100+ regex)    │
│    • Patient: /Patient:?\s*([A-Z]/ │
│    • Age: /(\d+)\s*yo/             │
│    • Dates: /(\d{1,2}[/-]\d{1,2})/ │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Expand Abbreviations             │
│    SAH → subarachnoid hemorrhage    │
│    POD → post-operative day         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. Apply Patterns to Text           │
│    For each pattern:                │
│      • Match against text           │
│      • Extract captured groups      │
│      • Calculate confidence         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. Entity Resolution                │
│    • Deduplicate entries            │
│    • Merge similar entities         │
│    • Keep highest confidence        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. Confidence Calculation           │
│    confidence = base (0.7)          │
│      + training_boost (0-0.2)       │
│      + medical_term (0.15)          │
│      - length_penalty (0-0.2)       │
│      - correction_penalty (0-0.1)   │
└────────────┬────────────────────────┘
             │
             ▼
Output: Structured Data with Confidence Scores
```

```
┌─────────────────────────────────────────────────────────────┐
│                AI-ENHANCED EXTRACTION ALGORITHM             │
└─────────────────────────────────────────────────────────────┘

Input: Clinical Notes + API Key
         │
         ▼
┌─────────────────────────────────────┐
│ 1. Construct Prompt                 │
│    "Analyze these clinical notes    │
│     and extract structured data..." │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Define JSON Schema               │
│    {                                │
│      patientName: STRING,           │
│      age: STRING,                   │
│      diagnoses: ARRAY,              │
│      ...                            │
│    }                                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. Call Gemini API                  │
│    POST /generateContent            │
│    • Temperature: 0.1 (deterministic│
│    • Max tokens: 2048               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. Parse Response                   │
│    • Extract JSON from text         │
│    • Validate structure             │
│    • Handle errors                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. Fallback on Failure              │
│    IF error:                        │
│      → Use pattern extraction       │
│      → Log warning                  │
└────────────┬────────────────────────┘
             │
             ▼
Output: AI-Extracted Structured Data
```

---

## Risk Assessment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RISK ASSESSMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────┘

Input: Extracted Data + Clinical Notes
         │
         ├──────────────┬──────────────┬─────────────────
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Seizure Risk │ │   VTE Risk   │ │ Readmission  │
│  Calculator  │ │  Calculator  │ │    Risk      │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Risk Factors │ │ Risk Factors │ │ Risk Factors │
│ • Craniotomy │ │ • Major surg │ │ • Complicat  │
│ • Tumor      │ │ • Spinal fus │ │ • Polypharm  │
│ • Prior sz   │ │ • Malignancy │ │ • Critical   │
│ • Hemorrhage │ │ • Prolonged  │ │ • Age >75    │
│              │ │   surgery    │ │              │
│ Score: 0-1   │ │ Score: 0-1   │ │ Score: 0-1   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Risk Level   │ │ Risk Level   │ │ Risk Level   │
│ • Low <0.3   │ │ • Low <0.3   │ │ • Low <0.2   │
│ • Mod 0.3-0.5│ │ • Mod 0.3-0.6│ │ • Mod 0.2-0.4│
│ • High >0.5  │ │ • High >0.6  │ │ • High >0.4  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Recommendations│ │Prophylaxis   │ │ Mitigation   │
│• Keppra if   │ │• SCDs        │ │• Early f/u   │
│  high risk   │ │• Enoxaparin  │ │• Home health │
│• 7 days      │ │• POD#1 start │ │• Med reconcile│
└──────────────┘ └──────────────┘ └──────────────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
                        ▼
                Display in UI
```

---

## Machine Learning Training Flow

```
┌─────────────────────────────────────────────────────────────┐
│              MACHINE LEARNING TRAINING SYSTEM               │
└─────────────────────────────────────────────────────────────┘

Initial State: Baseline Model
  • Accuracy: 70%
  • Training samples: 0
  • Patterns: {}
         │
         ▼
┌─────────────────────────────────────┐
│ 1. User Makes Correction            │
│    Original: "Jon Smith"            │
│    Corrected: "John Smith"          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Capture Correction               │
│    {                                │
│      timestamp: now,                │
│      field: "patientName",          │
│      original: "Jon Smith",         │
│      corrected: "John Smith"        │
│    }                                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. Update Pattern Frequency         │
│    patterns["patientName:john smith"]++ │
│    patterns count now: 1 → 2        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. Recalculate Accuracy             │
│    accuracy = min(98,               │
│      70 + (totalSamples * 0.5))     │
│    New accuracy: 70.5%              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. Update Confidence Weights        │
│    Future extractions of similar    │
│    patterns get +0.02 boost         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 6. Persist to localStorage          │
│    localStorage.setItem(            │
│      'mlTrainingData',              │
│      JSON.stringify(data)           │
│    )                                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 7. Update Dashboard Metrics         │
│    • Display new accuracy           │
│    • Show training sample count     │
│    • Update history chart           │
└─────────────────────────────────────┘
```

---

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE TREE                    │
└─────────────────────────────────────────────────────────────┘

Root State (in App.js)
│
├─── Clinical Data
│    ├─── notes: {
│    │      admission: "",
│    │      operative: "",
│    │      progress: "",
│    │      medications: "",
│    │      final: "",
│    │      imaging: "",
│    │      labs: "",
│    │      consults: ""
│    │    }
│    │
│    ├─── extractedData: {
│    │      patientName: "",
│    │      age: "",
│    │      diagnoses: [],
│    │      procedures: [],
│    │      medications: [],
│    │      ... (40+ fields)
│    │    }
│    │
│    ├─── generatedSummary: ""
│    ├─── expandedText: ""
│    └─── analysis: {}
│
├─── ML & Training
│    ├─── trainingData: {
│    │      patterns: {},
│    │      corrections: [],
│    │      accuracy: { current, history },
│    │      totalSamples: 0,
│    │      modelVersion: "3.0.0"
│    │    }
│    │
│    ├─── model: {
│    │      confidence: 0.7,
│    │      trained: false,
│    │      performance: { precision, recall, f1 }
│    │    }
│    │
│    ├─── confidenceScores: {}
│    └─── corrections: {}
│
├─── Risk Assessment
│    └─── predictions: {
│           seizureRisk: {},
│           vteRisk: {},
│           readmissionRisk: {}
│         }
│
├─── UI State
│    ├─── activeTab: "input" | "review" | "output"
│    ├─── activeNoteTab: "admission" | ...
│    ├─── isProcessing: false
│    ├─── loading: false
│    ├─── extractionProgress: 0
│    ├─── error: ""
│    ├─── warnings: []
│    ├─── successMessage: ""
│    ├─── copied: false
│    ├─── validationResults: {}
│    └─── showMLDashboard: false
│
└─── Settings
     ├─── extractionMethod: "hybrid"
     ├─── selectedTemplate: "neurosurgery"
     ├─── showAdvancedSettings: false
     ├─── autoSave: true
     ├─── apiKey: ""
     └─── enableAI: false
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  React 18.2.0 Components                                    │
│  • Functional components with hooks                         │
│  • JSX templating                                           │
│  • Event handlers                                           │
├─────────────────────────────────────────────────────────────┤
│  Styling: Tailwind CSS 3.3.0                               │
│  Icons: Lucide-react 0.263.1                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  Core Functions:                                            │
│  • extractWithPatterns() - Regex-based extraction           │
│  • extractWithAI() - API-based extraction                   │
│  • expandAbbreviations() - Medical term expansion           │
│  • detectConditions() - Clinical condition detection        │
│  • assessRisks() - Risk calculators                         │
│  • generateRecommendations() - Evidence-based guidance      │
├─────────────────────────────────────────────────────────────┤
│  State Management:                                          │
│  • React useState hooks                                     │
│  • React useEffect for side effects                         │
│  • React useCallback for memoization                        │
│  • React useMemo for expensive computations                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Local Storage:                                             │
│  • Draft data (auto-save)                                   │
│  • ML training data                                         │
│  • User preferences                                         │
├─────────────────────────────────────────────────────────────┤
│  Static Data:                                               │
│  • Medical abbreviations (500+)                             │
│  • Clinical guidelines                                      │
│  • Demo cases                                               │
│  • Template definitions                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  Google Gemini API (Optional):                             │
│  • AI-powered text extraction                               │
│  • Natural language understanding                           │
│  • JSON structured output                                   │
│  • Temperature: 0.1 for determinism                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture (Current State)

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY ARCHITECTURE                    │
│                      (Current - GAPS EXIST)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  USER LAYER                                                  │
│  ⚠️  No authentication                                       │
│  ⚠️  No authorization                                        │
│  ⚠️  No audit logging                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                           │
│  ⚠️  No input sanitization                                   │
│  ⚠️  No XSS protection                                       │
│  ⚠️  No CSRF tokens                                          │
│  ⚠️  API key in plain text                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                  │
│  ⚠️  localStorage unencrypted                                │
│  ⚠️  PHI stored in browser                                   │
│  ⚠️  No data encryption                                      │
│  ⚠️  No secure deletion                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  NETWORK LAYER                                               │
│  ⚠️  PHI sent to Google API (optional)                       │
│  ⚠️  No BAA with Google                                      │
│  ✓  HTTPS for API calls (if enabled)                        │
└─────────────────────────────────────────────────────────────┘

Legend:
  ⚠️  Security gap / HIPAA concern
  ✓  Implemented / Secure
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OPTIONS                        │
└─────────────────────────────────────────────────────────────┘

Option 1: Static Hosting (Current)
┌────────────────────────────────────┐
│     GitHub Pages / Vercel /        │
│        Netlify                     │
├────────────────────────────────────┤
│  • Static React build              │
│  • No backend required             │
│  • CDN distribution                │
│  • Free tier available             │
│  ⚠️  Client-side only             │
└────────────────────────────────────┘

Option 2: Hospital Internal (Recommended for Production)
┌────────────────────────────────────┐
│  Hospital Private Network          │
├────────────────────────────────────┤
│  • Behind hospital firewall        │
│  • No external API calls           │
│  • Integration with hospital SSO   │
│  • Audit logging to SIEM           │
│  • Encrypted data at rest          │
└────────────────────────────────────┘

Option 3: Cloud with Backend (Future)
┌────────────────────────────────────┐
│    AWS / Azure / GCP               │
├────────────────────────────────────┤
│  Frontend: S3 + CloudFront         │
│  Backend: Lambda / Cloud Functions │
│  Database: RDS / Cloud SQL         │
│  Auth: Cognito / IAM               │
│  Encryption: KMS                   │
│  HIPAA Compliance: BAA signed      │
└────────────────────────────────────┘
```

---

## Summary

This architecture documentation provides visual representations of:
1. **System Architecture**: Overall component layout
2. **Data Flow**: Step-by-step processing pipeline
3. **Component Structure**: React component hierarchy
4. **Extraction Algorithms**: Pattern and AI methods
5. **Risk Assessment**: Clinical risk calculation flow
6. **ML Training**: Learning system mechanics
7. **State Management**: Application state tree
8. **Technology Stack**: Layer-by-layer breakdown
9. **Security Model**: Current gaps and concerns
10. **Deployment Options**: Hosting architectures

For implementation details, see [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md).
For security and privacy concerns, see [CRITICAL_APPRAISAL.md](CRITICAL_APPRAISAL.md).
For improvement roadmap, see [ENHANCEMENT_RECOMMENDATIONS.md](ENHANCEMENT_RECOMMENDATIONS.md).
