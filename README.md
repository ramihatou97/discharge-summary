# Discharge Summary Generator

An educational tool for learning neurosurgical documentation automation, with AI-powered extraction and ML learning capabilities. **Uses simulated/fake data only for educational purposes.**

## 📚 Documentation

**Comprehensive documentation available in the `/docs` folder:**

- 📖 **[Quick Reference Guide](docs/QUICK_REFERENCE.md)** - Start here! Simple explanation of how everything works
- 🎓 **[Training Examples Guide](docs/TRAINING_EXAMPLES_GUIDE.md)** - Learn how to teach the system with real examples (NEW!)
- 🔧 **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - Deep dive into algorithms, architecture, and implementation
- 🔍 **[Critical Appraisal](docs/CRITICAL_APPRAISAL.md)** - Honest assessment of strengths, weaknesses, and limitations
- 🚀 **[Enhancement Recommendations](docs/ENHANCEMENT_RECOMMENDATIONS.md)** - Prioritized roadmap for improvements
- 🏗️ **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design patterns
- 📋 **[Deployment Instructions](docs/DEPLOYMENT_INSTRUCTIONS.md)** - Vercel and Railway deployment guides

## ⚠️ Important Notice

**This application is an EDUCATIONAL TOOL using simulated data only.**

**Key Clarifications**:
- ✅ **Educational use**: Learning tool for medical students and residents
- ✅ **Simulated data**: All patient data is fake/simulated scenarios
- ✅ **No FDA/HIPAA requirements**: Not for real clinical use
- ⚠️ **Neurosurgery focus**: Specialized for neurosurgical documentation
- ⚠️ **No extrapolation**: Only extracts what's explicitly in notes

**Design Principle**: If information is not explicitly in the notes, the field remains empty. No guessing, no assumptions, no extrapolation.

## ✨ Features

### Core Capabilities
- **Smart Note Detection**: Automatically identifies admission, progress, consultant, procedure, and discharge notes
- **Multi-AI Extraction**: Support for Gemini, OpenAI, and Claude APIs with intelligent fallback
- **ML Learning**: Learns from user edits to improve future summaries (without storing patient data)
- **Training Examples Library**: Continuously feed completed discharge summaries to teach the system (NEW!)
- **Pattern-Based Extraction**: Works offline without any API keys
- **500+ Medical Abbreviations**: Neurosurgery-specialized terminology database
- **Evidence-Based Guidelines**: Integrated clinical guidelines and recommendations

### User Experience
- **Dark Mode**: Toggle for reduced eye strain
- **Auto-Save**: Never lose your work with automatic draft saving
- **Multiple Templates**: Standard, detailed, and brief formats
- **Confidence Scores**: Shows extraction confidence for each field
- **Editable Output**: Review and modify all extracted data before generating summary
- **Import/Export**: Share training examples and backup your learning data

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended for Production)
1. Fork this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com)
3. Import your forked repository
4. **Framework Preset**: Create React App (auto-detected)
5. Deploy with one click

**For detailed deployment**: See [docs/VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md)

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/ramihatou97/discharge-summary-ultimate.git
cd discharge-summary-ultimate

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## 🔧 Configuration

### Optional AI Integration

The app works perfectly offline with pattern-based extraction. For enhanced extraction, you can optionally configure AI APIs:

1. Click the **Settings** icon
2. Enable "Use Multi-AI Extraction"
3. Add API keys (one or more):
   - **Gemini API Key**: Primary medical extraction (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
   - **OpenAI API Key**: Clinical synthesis (optional)
   - **Claude API Key**: Structuring and organization (optional)

**Note**: API keys are stored locally in your browser and never sent to any server except the respective AI providers.

## 📖 Usage

### Basic Workflow

1. **Paste Clinical Notes**: Copy and paste all your notes into the unified input box
   - Admission notes, progress notes, consultations, procedures, discharge notes
   - System automatically detects and separates note types

2. **Auto-Detect & Extract**: Click the button to extract information
   - Uses pattern matching (always) + AI (if configured)
   - Shows confidence scores for each extracted field

3. **Review & Edit**: Check the extracted data
   - Modify any incorrect or missing information
   - All fields are editable

4. **Generate Summary**: Click to create the final discharge summary
   - Choose from multiple templates
   - Copy, download, or print the result

5. **ML Learning**: When you edit the summary, the system learns
   - Patterns are analyzed (no patient data stored)
   - Future summaries incorporate learned preferences

## 🏗️ Project Structure

```
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   │   └── DischargeSummaryGenerator.jsx  # Main component
│   ├── data/        # Medical data files
│   │   ├── medical-abbreviations.js
│   │   └── clinical-guidelines.js
│   ├── App.jsx      # Root component with dark mode
│   ├── index.js     # Entry point
│   └── index.css    # Global styles
├── docs/            # Documentation
└── package.json     # Dependencies
```

## 🛠️ Tech Stack

- **Framework**: React 18 (Create React App)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: LocalStorage for drafts and ML learning
- **Optional AI**: Gemini, OpenAI, Claude APIs

## 📊 Performance

- **Offline Mode**: Works completely offline with pattern-based extraction
- **AI Mode**: Requires internet for API calls
- **Bundle Size**: Optimized for fast loading
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🤝 Contributing

This is an educational project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes only. Not for clinical use.

## 🙋 Support

For issues or questions:
- Check the [documentation](docs/)
- Review [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- Open an issue on GitHub

---

**⚠️ Disclaimer**: This tool is for educational purposes only and uses simulated data. Not intended for actual clinical documentation or patient care. Always follow your institution's documentation guidelines and obtain appropriate approvals for any clinical tools.
