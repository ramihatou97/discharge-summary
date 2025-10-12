# Discharge Summary Generator Ultimate

An educational tool for learning neurosurgical documentation automation, with AI-powered extraction and evidence-based clinical decision support. **Uses simulated/fake data only for educational purposes.**

## 📚 Documentation

**Comprehensive documentation available!**

- 🔑 **[API Key Guide](API_KEY_GUIDE.md)** - ⭐ **NEW! ESSENTIAL**: Where and how to insert API keys for full LLM integration
- 📖 **[Quick Reference Guide](QUICK_REFERENCE.md)** - Start here! Simple explanation of how everything works
- 🧠 **[Hybrid Architecture](HYBRID_ARCHITECTURE.md)** - Complete LLM integration architecture
- 🔧 **[Technical Documentation](TECHNICAL_DOCUMENTATION.md)** - Deep dive into algorithms, architecture, and implementation
- 🔍 **[Critical Appraisal](CRITICAL_APPRAISAL.md)** - Honest assessment of strengths, weaknesses, and limitations  
- 🚀 **[Enhancement Recommendations](ENHANCEMENT_RECOMMENDATIONS.md)** - Prioritized roadmap for improvements
- 📋 **[Single User Deployment](SINGLE_USER_DEPLOYMENT.md)** - Deploy to GitHub Pages (free forever)

## ⚠️ Important Notice

**This application is an EDUCATIONAL TOOL using simulated data only.** 

**Key Clarifications**:
- ✅ **Educational use**: Learning tool for medical students and residents
- ✅ **Simulated data**: All patient data is fake/simulated scenarios
- ✅ **No FDA/HIPAA requirements**: Not for real clinical use
- ⚠️ **Neurosurgery focus**: Specialized for neurosurgical documentation
- ⚠️ **No extrapolation**: Only extracts what's explicitly in notes
- ⚠️ **Accuracy goal**: Currently 70-87%, target 95%+ for educational effectiveness

**Design Principle**: If information is not explicitly in the notes, the field remains empty. No guessing, no assumptions, no extrapolation.

## Features

- **Dual extraction modes**: Pattern-based (regex) + optional AI enhancement
- **Neurosurgery specialization**: 500+ medical abbreviations, specialty templates
- **Risk assessments**: Seizure, VTE, and readmission risk calculators
- **Evidence-based recommendations**: Clinical guidelines integrated
- **Anti-extrapolation**: Leaves fields empty when data not in notes (by design)
- **Self-learning system**: Improves from user corrections
- **Auto-save**: Never lose your work
- **Multiple templates**: Neurosurgery, standard, and brief formats
- **Dark mode support**: Reduce eye strain

## Quick Start

### Option 1: Deploy to Vercel (Recommended)
1. Fork this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com)
3. Import your forked repository
4. **Framework Preset**: Vercel auto-detects Create React App
5. Deploy with one click

**For better performance**: See [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) for framework preset recommendations (Vite vs Create React App comparison)

### Option 2: Deploy to Netlify
1. Fork this repository
2. Go to [netlify.com](https://netlify.com)
3. Connect your GitHub and select the repository
4. Deploy automatically

### Option 3: Local Development
```bash
# Clone the repository
git clone https://github.com/ramihatou97/discharge-summary-generator.git

# Install dependencies
npm install

# Start development server (Create React App)
npm start

# Build for production
npm run build
```

**Note**: This project currently uses Create React App. For faster builds and better performance on Vercel, consider migrating to Vite. See [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## Usage

### Basic Workflow

1. **Input Clinical Notes**
   - Paste admission note (patient demographics, HPI, admission diagnosis)
   - Add operative note (surgical details, complications)
   - Add progress notes (daily updates, hospital course)
   - Add final/discharge note (discharge planning, medications)

2. **Extract Information**
   - Click "Extract Information" to process the notes
   - System extracts 40+ structured data fields
   - Review confidence scores (green=high, yellow=medium, red=low)
   - Correct any errors (helps train the system)

3. **Review Risk Assessments**
   - Seizure risk (for neurosurgical patients)
   - VTE risk (blood clot prevention)
   - Readmission risk prediction

4. **Generate Summary**
   - Select template (neurosurgery/standard/brief)
   - Click "Generate Summary" to create discharge document
   - Review evidence-based recommendations
   - Copy, download, or print the final summary

### How It Works

The app uses two extraction methods:
- **Pattern Matching** (always active): Fast, offline, ~70-80% accurate
- **AI Enhancement** (optional): Slower, requires API key, ~85-90% accurate

**Critical Design Principle**: The system **ONLY extracts information explicitly stated in notes**. If data is not present, fields remain empty. No extrapolation, no guessing, no assumptions.

For detailed explanation of all algorithms and functions, see [Technical Documentation](../TECHNICAL_DOCUMENTATION.md).

## AI Integration (Optional)

To enable AI-powered extraction:
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enable "Use AI Extraction" in settings
3. Enter your API key

**Note for Educational Use**: The AI is instructed to only extract information explicitly in the notes. It will not infer, assume, or extrapolate missing data. Empty fields remain empty by design.

## Accuracy & Educational Focus

### Extraction Accuracy
- **Pattern matching**: 70-80% baseline accuracy
- **AI enhancement**: 85-90% accuracy  
- **Target goal**: 95%+ for educational effectiveness

### Core Design Principles
1. **No Extrapolation**: If not in notes, leave empty
2. **Explicit Only**: Extract what's written, not what's implied
3. **Neurosurgery Focus**: Deep expertise in one specialty
4. **Educational Value**: Teaches proper documentation habits

### Known Areas for Improvement
- Temporal understanding (patient progression over time)
- Neurosurgical context awareness
- Complex procedure relationships
- Complication timeline tracking

**See [Critical Appraisal](../CRITICAL_APPRAISAL.md) for detailed analysis.**

## Contributing

This is an educational/research project. Contributions welcome! Areas needing help:
- Automated testing
- Clinical validation studies
- Additional specialty templates
- Improved NLP algorithms
- Security enhancements

## License

This project is for educational and research purposes. Not licensed for clinical use.

## Disclaimer

**IMPORTANT**: This software is an **educational tool for learning purposes only** using **simulated patient data**. It is NOT:
- A substitute for professional medical judgment
- FDA-approved or CE-marked
- Intended for real clinical use
- A replacement for proper medical documentation
- HIPAA-compliant (not needed - educational use only)

All data used should be fake/simulated scenarios for training purposes. The authors assume no liability for any misuse of this educational software.

## Support & Contact

- **Issues**: GitHub Issues
- **Documentation**: See links at top of README
- **Repository**: https://github.com/ramihatou97/discharge-summary-ultimate

## Acknowledgments

Built as an educational tool for learning neurosurgical documentation automation. Informed by clinical best practices and designed to teach proper extraction without extrapolation.

---

**For detailed technical information, critical analysis, and enhancement roadmap, please review the comprehensive documentation linked at the top of this README.**
