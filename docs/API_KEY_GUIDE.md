# API Key Guide: Complete LLM Integration

**📊 For visual diagrams, see [LLM_VISUAL_GUIDE.md](LLM_VISUAL_GUIDE.md)**

## Overview

This application uses **Large Language Models (LLMs) at EVERY level** that requires:
- **Reading** clinical notes and medical documentation
- **Deeply understanding** medical context, symptoms, and conditions
- **Analyzing** complications, consultant recommendations, and clinical progression
- **Synthesizing** comprehensive clinical narratives
- **Summarizing** patient hospital course and discharge information

## Full LLM Integration Scope

### 1. **Reading & Understanding Phase** (LLM-Powered)
The LLMs read and comprehend:
- Admission notes
- Progress notes (daily updates)
- Consultant recommendations
- Procedure notes
- Discharge documentation

**API Keys Used:** Gemini (primary), OpenAI (optional), Claude (optional)

### 2. **Deep Analysis Phase** (LLM-Powered)
The LLMs analyze and extract:
- **Complication Detection** (`LLMComplicationDetector`)
  - Infections, seizures, hemorrhages
  - New neurological deficits
  - Post-operative complications
  - Severity and treatment details

- **Consultant Parsing** (`LLMConsultantParser`)
  - Infectious Disease recommendations
  - Thrombosis/Anticoagulation plans
  - Specialist follow-up requirements
  - Medication recommendations

**API Keys Used:** All three providers can be used

### 3. **Synthesis Phase** (LLM-Powered)
The LLMs synthesize comprehensive narratives:
- **Clinical Synthesizer** (`LLMClinicalSynthesizer`)
  - History of presenting illness
  - Chronological hospital course
  - Post-operative progress (day-by-day)
  - Major clinical events
  - Current discharge status

**API Keys Used:** OpenAI (for synthesis), Claude (for structuring)

### 4. **Summarization Phase** (LLM-Powered)
The LLMs create final summaries:
- Structured discharge summary
- Organized by clinical sections
- Professional medical documentation format
- Concise yet comprehensive

**API Keys Used:** Claude (primary for structuring), all providers participate

---

## Where to Insert API Keys

### For GitHub Pages Deployment (Recommended)

**API keys are entered IN THE BROWSER APPLICATION, not in the GitHub repository.**

#### Step-by-Step Instructions:

1. **Deploy your app to GitHub Pages** (if not already deployed):
   ```bash
   npm run deploy
   ```
   Your app will be available at: `https://ramihatou97.github.io/discharge-summary`

2. **Open the deployed application** in your browser:
   ```
   https://ramihatou97.github.io/discharge-summary
   ```

3. **Click the Settings Icon** (gear icon in the top-right of the interface)

4. **Enable "Use Multi-AI Extraction"** checkbox

5. **Click "Add API Keys" or "Manage API Keys"** button

6. **Enter your API keys:**
   - **Gemini API Key**: Primary medical extraction (REQUIRED for LLM features)
     - Get from: https://makersuite.google.com/app/apikey
     - Role: Medical information extraction, reading and understanding clinical notes
   
   - **OpenAI API Key**: Clinical synthesis (OPTIONAL but recommended)
     - Get from: https://platform.openai.com/api-keys
     - Role: Synthesizing narratives, enhancing clinical descriptions
   
   - **Claude API Key**: Structuring and summarization (OPTIONAL but recommended)
     - Get from: https://console.anthropic.com/
     - Role: Organizing content, structuring discharge summaries

7. **Click "Save API Keys"**

8. **Your API keys are stored in browser localStorage** (locally on your computer)
   - Never sent to GitHub
   - Never stored in the repository
   - Only sent to respective AI providers (Google, OpenAI, Anthropic)
   - Persist across sessions on the same browser

### Important Security Notes

✅ **Safe:**
- API keys stored in browser localStorage (your computer only)
- Keys never committed to GitHub repository
- Keys only sent to AI providers via HTTPS

⚠️ **Never do this:**
- Never commit API keys to the GitHub repository
- Never add API keys to environment variables in GitHub repo settings
- Never include API keys in code files

❌ **DO NOT add API keys here:**
- ❌ NOT in `.env` files
- ❌ NOT in `package.json`
- ❌ NOT in any code files
- ❌ NOT in GitHub repository secrets
- ❌ NOT in GitHub Pages settings

✅ **DO add API keys here:**
- ✅ In the application UI (Settings → API Keys)
- ✅ Each user adds their own keys in their browser
- ✅ Keys stay local to each user's browser

---

## How LLM Integration Works (Technical Details)

### Multi-Stage Pipeline

```
Clinical Notes
     ↓
[STAGE 1: Reading & Extraction]
     ↓ (Gemini API)
Patient Data + Medical Context
     ↓
[STAGE 2: Deep Analysis]
     ↓ (All APIs)
Complications + Consultant Recs + Events
     ↓
[STAGE 3: Synthesis]
     ↓ (OpenAI API)
Enhanced Clinical Narratives
     ↓
[STAGE 4: Structuring]
     ↓ (Claude API)
Organized Discharge Summary
     ↓
Final Output
```

### Code Architecture

**File Locations:**

1. **LLM Core Engine**: `/src/core/llm_integration.js`
   - Handles all LLM API communications
   - Supports Gemini, OpenAI, Claude

2. **LLM Components**: `/src/llm/`
   - `complication_detector.js` - Analyzes complications
   - `clinical_synthesizer.js` - Synthesizes narratives
   - `consultant_parser.js` - Parses recommendations

3. **Main Service**: `/src/services/discharge_summary_service.js`
   - Orchestrates the hybrid pipeline
   - Combines deterministic + LLM extraction

4. **React Component**: `/src/components/DischargeSummaryGenerator.jsx`
   - UI for API key management
   - Calls LLM extraction functions

5. **Configuration**: `/src/config/llm_config.js`
   - Manages API keys from localStorage
   - Provider configuration

### API Key Usage per Component

| Component | Primary API | Purpose |
|-----------|-------------|---------|
| Medical Extraction | Gemini | Read and extract patient data |
| Complication Detection | All | Analyze and identify complications |
| Consultant Parsing | All | Parse specialist recommendations |
| Clinical Synthesis | OpenAI | Synthesize narratives |
| Structuring | Claude | Organize final summary |

---

## Fallback Behavior

The application is designed to work even if API keys are not provided:

- **No API Keys**: Uses pattern-based extraction (offline mode)
- **Partial API Keys**: Uses available LLMs + patterns for missing ones
- **API Errors**: Automatically falls back to pattern matching

However, **for the BEST results** with full LLM integration:
- ✅ Provide **at least Gemini API key** (primary)
- ✅ Optionally add OpenAI and Claude for enhanced results

---

## Testing Your API Keys

After entering API keys:

1. **Paste sample clinical notes** in the input area
2. **Click "Auto-Detect & Extract Data"**
3. **Check the success message**:
   - ✅ "Multi-AI extraction completed successfully" = LLMs working
   - ⚠️ "Pattern extraction completed" = Using patterns only (no LLM)
4. **Review extracted data** for quality and completeness

---

## Cost Considerations

### API Usage Costs (Approximate)

- **Gemini**: ~$0.50-1.00 per 100 discharge summaries (very affordable)
- **OpenAI GPT-4**: ~$2-5 per 100 discharge summaries
- **Claude**: ~$1-3 per 100 discharge summaries

**Total estimated cost**: $3-9 per 100 discharge summaries with all three APIs

**For educational single-user use**: Minimal monthly costs (likely under $10/month)

---

## Frequently Asked Questions

### Q: Can I use just one API key?
**A:** Yes! Gemini alone provides excellent results. OpenAI and Claude are optional enhancements.

### Q: Are my API keys safe?
**A:** Yes, they're stored in your browser's localStorage and only sent to the respective AI providers via HTTPS.

### Q: Do I need to add keys to GitHub?
**A:** NO! Never add API keys to GitHub. Add them in the application UI instead.

### Q: Will other users see my API keys?
**A:** No, each user must enter their own API keys in their own browser.

### Q: What if I clear my browser cache?
**A:** You'll need to re-enter your API keys. Consider saving them in a password manager.

### Q: Can I switch between APIs?
**A:** Yes, the system automatically uses available APIs and falls back gracefully.

### Q: Does it work offline?
**A:** Pattern-based extraction works offline. LLM features require internet and API keys.

---

## Summary

### ✅ LLM Integration is COMPLETE at Every Level:
1. ✅ **Reading** clinical notes (Gemini)
2. ✅ **Understanding** medical context (All providers)
3. ✅ **Analyzing** complications and recommendations (All providers)
4. ✅ **Synthesizing** clinical narratives (OpenAI)
5. ✅ **Summarizing** discharge information (Claude)

### ✅ API Keys Should Be Added:
- ✅ **In the browser application UI** (Settings → API Keys)
- ✅ **Not in GitHub repository**
- ✅ **Stored locally in your browser**

### ✅ For GitHub Pages Deployment:
1. Deploy with `npm run deploy`
2. Open the deployed app
3. Enter API keys in Settings
4. Start using LLM-powered extraction

---

## Related Documentation

- [HYBRID_ARCHITECTURE.md](HYBRID_ARCHITECTURE.md) - Technical architecture details
- [SINGLE_USER_DEPLOYMENT.md](SINGLE_USER_DEPLOYMENT.md) - Deployment guide
- [README.md](../README.md) - Project overview

---

**Last Updated**: 2025-10-11
