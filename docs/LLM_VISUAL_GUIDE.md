# Visual Guide: LLM Integration & API Key Flow

## Complete LLM Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DISCHARGE SUMMARY APPLICATION                         │
│                     (GitHub Pages Deployment)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (Browser)                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Settings → API Keys Input                                        │  │
│  │  • Gemini API Key    ← User enters here (NOT in GitHub)          │  │
│  │  • OpenAI API Key    ← User enters here (NOT in GitHub)          │  │
│  │  • Claude API Key    ← User enters here (NOT in GitHub)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Stored in
                                 ▼
                    ┌────────────────────────┐
                    │  Browser localStorage  │
                    │  (Your Computer Only)  │
                    └────────────────────────┘
                                 │ Loaded by
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  DischargeSummaryConfig.fromLocalStorage()               │
│                      (src/config/llm_config.js)                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              HYBRID LLM PIPELINE (Multi-Stage Processing)                │
│                                                                           │
│  STAGE 1: READING & EXTRACTION (LLM Required)                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Input: Clinical Notes (Admission, Progress, Consultant, etc.)  │    │
│  │ LLM: Gemini API                                                 │    │
│  │ Process: Read and comprehend medical text                       │    │
│  │ Output: Extracted patient data + medical context                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              ↓                                           │
│  STAGE 2: DEEP ANALYSIS (LLM Required)                                  │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ A) Complication Detection (LLMComplicationDetector)            │    │
│  │    LLM: All Providers                                           │    │
│  │    Analyzes: Infections, seizures, deficits, hemorrhages       │    │
│  │                                                                  │    │
│  │ B) Consultant Parsing (LLMConsultantParser)                    │    │
│  │    LLM: All Providers                                           │    │
│  │    Analyzes: ID recommendations, anticoagulation, follow-up    │    │
│  │                                                                  │    │
│  │ C) Event Analysis                                               │    │
│  │    LLM: All Providers                                           │    │
│  │    Analyzes: Major clinical events, symptom progression        │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              ↓                                           │
│  STAGE 3: SYNTHESIS (LLM Required)                                      │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Clinical Synthesizer (LLMClinicalSynthesizer)                  │    │
│  │ LLM: OpenAI (primary)                                           │    │
│  │ Synthesizes:                                                    │    │
│  │   • History of presenting illness                               │    │
│  │   • Chronological hospital course                               │    │
│  │   • Post-operative progress (day-by-day)                        │    │
│  │   • Major events narrative                                      │    │
│  │   • Current discharge status                                    │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              ↓                                           │
│  STAGE 4: SUMMARIZATION & STRUCTURING (LLM Required)                    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Structuring (Claude API)                                        │    │
│  │ LLM: Claude (primary)                                           │    │
│  │ Summarizes:                                                     │    │
│  │   • Organized discharge summary                                 │    │
│  │   • Professional medical documentation                          │    │
│  │   • Structured by clinical sections                             │    │
│  │   • Concise yet comprehensive                                   │    │
│  └────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Final Discharge       │
                    │  Summary Generated     │
                    └────────────────────────┘
```

## API Key Usage Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GITHUB PAGES DEPLOYMENT                          │
│               https://ramihatou97.github.io/discharge-summary       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ User Opens App
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser Application                           │
│                                                                       │
│  Settings Panel:                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ [x] Use Multi-AI Extraction                              │      │
│  │                                                            │      │
│  │ Gemini API Key:    [*******************]  🔑              │      │
│  │ OpenAI API Key:    [*******************]  🔑              │      │
│  │ Claude API Key:    [*******************]  🔑              │      │
│  │                                                            │      │
│  │                          [Save API Keys]                  │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    Save clicked │
                                 ▼
            ┌────────────────────────────────────┐
            │  localStorage.setItem()            │
            │  • 'geminiApiKey'  → user's key    │
            │  • 'openaiApiKey'  → user's key    │
            │  • 'claudeApiKey'  → user's key    │
            └────────────────────────────────────┘
                                 │
                    Never sent to│ GitHub
                      Only used │ locally
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LLM API Calls (HTTPS Only)                        │
│                                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │  Gemini API Call    │  │  OpenAI API Call    │                  │
│  │  ↓                  │  │  ↓                  │                  │
│  │  Google Servers     │  │  OpenAI Servers     │                  │
│  │  (via API key)      │  │  (via API key)      │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                       │
│              ┌─────────────────────┐                                │
│              │  Claude API Call    │                                │
│              │  ↓                  │                                │
│              │  Anthropic Servers  │                                │
│              │  (via API key)      │                                │
│              └─────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Where API Keys Should and Should NOT Be

### ✅ CORRECT - API Keys in Browser UI

```
User's Browser
    └── Application (GitHub Pages)
            └── Settings Panel
                    └── API Key Input Fields  ← ENTER KEYS HERE
                            ↓
                    localStorage (Browser)
                            ↓
                    LLM API Calls (Direct to AI providers)
```

**Why this is safe:**
- Keys stored only on user's computer
- Never committed to GitHub
- Only sent to AI providers via HTTPS
- Each user manages their own keys

### ❌ WRONG - API Keys in Repository

```
GitHub Repository
    ├── .env file              ❌ NEVER put keys here
    ├── package.json           ❌ NEVER put keys here
    ├── src/config/*.js        ❌ NEVER put keys here
    ├── .github/workflows/     ❌ NEVER put keys here
    └── Any code file          ❌ NEVER put keys here
```

**Why this is dangerous:**
- Keys become public on GitHub
- Anyone can steal and use your keys
- Violates API provider terms of service
- Security risk

## LLM Integration Points (Code Level)

```
Component: DischargeSummaryGenerator.jsx
    ↓
    Calls: handleExtractData()
        ↓
        Branches:
            ├── useAI = true, API keys present
            │   └── extractWithMultiAI()
            │       ├── extractWithGemini()      [READS & UNDERSTANDS]
            │       ├── synthesizeWithOpenAI()   [SYNTHESIZES]
            │       └── structureWithClaude()    [SUMMARIZES]
            │
            └── useAI = false or no API keys
                └── extractWithPatterns()        [Fallback: Pattern matching]

Service: NeurosurgicalDischargeSummaryService
    ↓
    Method: generateDischargeSummary(notes)
        ↓
        Pipeline:
            Step 1: Deterministic extraction (dates, medications)
                ↓
            Step 2: LLMComplicationDetector.detect()   [ANALYZES]
                Uses: All LLM providers via API keys
                ↓
            Step 3: LLMConsultantParser.parse()        [ANALYZES]
                Uses: All LLM providers via API keys
                ↓
            Step 4: Merge data
                ↓
            Step 5: LLMClinicalSynthesizer.synthesize()  [SYNTHESIZES]
                Uses: OpenAI via API key
                ↓
            Step 6: Validation
                ↓
            Final Output: Complete discharge summary

Core Engine: LLMDischargeSummaryEngine
    ↓
    Methods:
        ├── generateWithGemini()    → Google API (uses geminiApiKey)
        ├── generateWithOpenAI()    → OpenAI API (uses openaiApiKey)
        └── generateWithClaude()    → Anthropic API (uses claudeApiKey)
```

## Summary of LLM Integration

### ✅ Confirmed Integration Points:

| Level | Component | API Keys Used | Purpose |
|-------|-----------|---------------|---------|
| **Reading** | `extractWithGemini()` | Gemini | Read clinical notes |
| **Understanding** | All LLM components | All | Comprehend medical context |
| **Analyzing** | `LLMComplicationDetector` | All | Detect complications |
| **Analyzing** | `LLMConsultantParser` | All | Parse recommendations |
| **Synthesizing** | `LLMClinicalSynthesizer` | OpenAI | Create narratives |
| **Summarizing** | `structureWithClaude()` | Claude | Organize summary |

### 🔑 API Key Management:

1. **Entry Point**: Browser UI (Settings → API Keys)
2. **Storage**: Browser localStorage (local only)
3. **Usage**: Direct HTTPS calls to AI providers
4. **Security**: Never committed to GitHub repository

### 📍 For GitHub Pages Deployment:

```bash
# 1. Deploy
npm run deploy

# 2. Open app in browser
https://ramihatou97.github.io/discharge-summary

# 3. Enter API keys in Settings
(In the browser UI, NOT in code)

# 4. Start using full LLM capabilities
```

---

**Last Updated**: 2025-10-11
**Status**: ✅ Complete and Verified
