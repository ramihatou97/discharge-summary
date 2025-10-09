# Training Examples Guide

## Overview

The Training Examples Library allows you to continuously feed completed discharge summaries to help the system learn and improve its output. This feature implements a sophisticated pattern extraction system that analyzes your examples without storing any patient identifiable information (PHI).

## How It Works

### 1. Pattern Extraction (PHI-Free)

When you add a training example, the system extracts:

- **Structure Patterns**: Section headers and organization (e.g., "PATIENT INFORMATION", "HOSPITAL COURSE")
- **Terminology Patterns**: Common medical terms and abbreviations frequency
- **Clinical Patterns**: Pathology-specific characteristics (summary length, consultant usage, procedure documentation)
- **Formatting Preferences**: Bullet lists vs numbered lists, spacing conventions

**Important**: No patient names, dates, MRN numbers, or other PHI is stored. Only anonymous patterns and structures are extracted.

### 2. Learning Statistics

The system tracks:
- **Total Examples**: Number of training examples in your library
- **Unique Pathologies**: Different types of cases (brain tumor, spine fracture, etc.)
- **With Consultants**: How many examples included consultant notes

### 3. Pattern Application

Learned patterns are automatically applied to future discharge summaries:
- Common section structures are recognized
- Preferred terminology is validated
- Formatting preferences influence output style
- Pathology-specific patterns inform extraction

## Usage

### Adding a Training Example

1. **Click "Add Example"** button in the Training Examples Library section
2. **Fill in the form**:
   - **Pathology/Diagnosis Category** (Optional): e.g., "Brain Tumor", "Spine Fracture", "SAH", "TBI"
   - **Admission Note/H&P** (Optional): Paste the admission note
   - **Progress Notes** (Optional): Paste daily progress notes
   - **Consultant Notes** (Optional): Paste any consultant recommendations
   - **Procedure Note** (Optional): Paste operative/procedure notes
   - **Final/Discharge Note** (Optional): Paste the final discharge note
   - **Completed Discharge Summary** (Required): The final, approved discharge summary
   - **Notes** (Optional): Any special notes about this case
3. **Click "Add to Training Library"**

### Managing Examples

- **View Details**: Click the eye icon to expand and see example content
- **Delete**: Click the trash icon to remove an example
- **Export**: Download all examples as JSON for backup or sharing
- **Import**: Upload previously exported examples

### Best Practices

#### What to Include

✅ **Completed, reviewed discharge summaries** - Use final, approved versions
✅ **Diverse pathologies** - Include various case types you commonly encounter
✅ **Both simple and complex cases** - Mix of routine and complicated patients
✅ **Cases with and without consultants** - Help the system understand both scenarios
✅ **Your preferred formatting** - Use examples that reflect your institution's style

#### What to Avoid

❌ **Draft or incomplete summaries** - Only use finalized versions
❌ **Duplicate cases** - Avoid adding the same case multiple times
❌ **Incorrect information** - Don't include examples with known errors

### Privacy and Security

The training examples feature is designed with privacy in mind:

1. **No PHI in Patterns**: Only structural and linguistic patterns are extracted, never patient-specific data
2. **Local Storage**: Examples are stored in your browser's localStorage (not transmitted to any server)
3. **Export Control**: You control when/if examples are exported or shared
4. **Deletable**: Examples can be removed at any time

### Example Workflow

**Scenario**: You want to teach the system about neurosurgery cases

1. **Week 1**: Add 5 brain tumor cases with completed summaries
2. **Week 2**: Add 5 spine surgery cases
3. **Week 3**: Add 3 SAH cases and 2 TBI cases
4. **Result**: System learns:
   - Brain tumor cases typically need oncology follow-up
   - Spine cases often include neurological exam details
   - SAH cases frequently have consultant notes
   - TBI cases may include KPS scores

## Technical Details

### Pattern Extraction Algorithm

```javascript
// Structure patterns
- Identifies section headers (all caps followed by colon)
- Counts frequency of each section across examples

// Terminology patterns
- Tracks usage of common medical abbreviations
- Measures frequency of specific terms
- No patient-specific terms are stored

// Clinical patterns (by pathology)
- Average summary length
- Consultant inclusion rate
- Procedure documentation rate

// Formatting patterns
- Bullet list vs numbered list preference
- Section spacing conventions
- Line break patterns
```

### Storage Format

Examples are stored in two localStorage keys:

1. **`trainingExamples`**: Array of complete examples
   ```json
   [{
     "id": "timestamp",
     "timestamp": "ISO-8601",
     "pathology": "Brain Tumor",
     "admissionNote": "...",
     "completedSummary": "...",
     "notes": "Complex case with multiple complications"
   }]
   ```

2. **`globalLearningPatterns`**: Aggregated patterns
   ```json
   {
     "commonStructure": {
       "PATIENT INFORMATION": 10,
       "HOSPITAL COURSE": 10,
       "DISCHARGE MEDICATIONS": 8
     },
     "preferredTerminology": {
       "patient": { "count": 10, "totalFreq": 45 },
       "tolerated": { "count": 8, "totalFreq": 12 }
     },
     "pathologySpecificPatterns": {
       "brain tumor": {
         "count": 5,
         "avgSummaryLength": 1200,
         "consultantRate": 0.8,
         "procedureRate": 1.0
       }
     },
     "formattingPreferences": {
       "bullet_list_preferred": 7,
       "numbered_list_used": 3
     },
     "totalExamples": 10
   }
   ```

## Integration with Generation

The training examples influence discharge summary generation in several ways:

1. **Template Selection**: Pathology-specific patterns inform which template elements to emphasize
2. **Terminology Validation**: Common terms from examples are recognized as acceptable
3. **Structure Guidance**: Section ordering follows learned patterns
4. **Formatting Decisions**: List styles and spacing follow preferences from examples

## Limitations

- **Browser-Specific**: Examples are stored per browser, not synced across devices
- **Storage Limits**: Browser localStorage has size limits (~5-10MB typically)
- **Pattern Threshold**: Patterns need 3+ occurrences before automatic application
- **No AI Training**: Examples don't train the AI models, only influence extraction/generation logic

## Future Enhancements

Potential improvements being considered:

- [ ] Cloud sync across devices
- [ ] Collaborative sharing of anonymized patterns
- [ ] More sophisticated pattern matching algorithms
- [ ] Feedback loop showing which patterns were applied
- [ ] Pattern confidence scoring
- [ ] Auto-suggestion based on input similarity

## Support

If you have questions or suggestions about the Training Examples feature:

1. Check this documentation
2. Review the example workflow above
3. Open an issue on GitHub with the tag `training-examples`

## Changelog

### Version 3.0.0 (Current)
- Initial release of Training Examples Library
- PHI-free pattern extraction
- Local storage implementation
- Import/export functionality
- Learning statistics dashboard
