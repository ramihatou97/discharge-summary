import React, { useState, useCallback } from 'react';
import { 
  BookOpen, Upload, Download, Trash2, Plus, Eye, 
  AlertCircle, CheckCircle, Brain, TrendingUp, Database
} from 'lucide-react';

/**
 * Training Examples Manager
 * Allows users to feed completed discharge summaries for learning and improvement
 */
const TrainingExamplesManager = ({ onPatternsUpdated }) => {
  const [trainingExamples, setTrainingExamples] = useState(() => {
    const saved = localStorage.getItem('trainingExamples');
    return saved ? JSON.parse(saved) : [];
  });

  const [newExample, setNewExample] = useState({
    admissionNote: '',
    progressNotes: '',
    consultantNotes: '',
    procedureNote: '',
    finalNote: '',
    completedSummary: '',
    pathology: '',
    notes: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingExample, setViewingExample] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Extract PHI-free patterns from examples
  const extractPatternsFromExample = useCallback((example) => {
    const patterns = {
      structure: [],
      terminology: [],
      clinical: [],
      formatting: []
    };

    // Analyze structure patterns
    if (example.completedSummary) {
      const sections = example.completedSummary.split(/\n(?=[A-Z][A-Z\s]+:)/);
      patterns.structure = sections.map(section => {
        const match = section.match(/^([A-Z][A-Z\s]+):/);
        return match ? match[1].trim() : null;
      }).filter(Boolean);

      // Extract formatting patterns
      if (example.completedSummary.includes('•')) {
        patterns.formatting.push('bullet_list_preferred');
      }
      if (example.completedSummary.match(/\d+\./)) {
        patterns.formatting.push('numbered_list_used');
      }
      if (example.completedSummary.match(/\n\n/g)?.length > 3) {
        patterns.formatting.push('section_spacing_used');
      }
    }

    // Extract terminology patterns (clinical terms, abbreviations)
    const allText = [
      example.admissionNote,
      example.progressNotes,
      example.consultantNotes,
      example.procedureNote,
      example.finalNote,
      example.completedSummary
    ].join(' ');

    // Common medical abbreviations and their usage
    const medicalTerms = [
      'POD', 'post-op', 'preop', 'intraop', 's/p', 'w/', 'c/o',
      'pt', 'patient', 'tolerated', 'uneventful', 'stable',
      'discharged', 'follow-up', 'follow up', 'f/u'
    ];

    medicalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length > 0) {
        patterns.terminology.push({
          term: term,
          frequency: matches.length
        });
      }
    });

    // Extract clinical patterns based on pathology
    if (example.pathology) {
      patterns.clinical.push({
        pathology: example.pathology,
        hasConsultant: !!example.consultantNotes,
        hasProcedure: !!example.procedureNote,
        summaryLength: example.completedSummary?.length || 0
      });
    }

    return patterns;
  }, []);

  // Analyze all training examples and update global patterns
  const analyzeAllExamples = useCallback(() => {
    const globalPatterns = {
      commonStructure: {},
      preferredTerminology: {},
      pathologySpecificPatterns: {},
      formattingPreferences: {},
      totalExamples: trainingExamples.length
    };

    trainingExamples.forEach(example => {
      const patterns = extractPatternsFromExample(example);

      // Aggregate structure patterns
      patterns.structure.forEach(section => {
        globalPatterns.commonStructure[section] = 
          (globalPatterns.commonStructure[section] || 0) + 1;
      });

      // Aggregate terminology
      patterns.terminology.forEach(({ term, frequency }) => {
        if (!globalPatterns.preferredTerminology[term]) {
          globalPatterns.preferredTerminology[term] = { count: 0, totalFreq: 0 };
        }
        globalPatterns.preferredTerminology[term].count += 1;
        globalPatterns.preferredTerminology[term].totalFreq += frequency;
      });

      // Aggregate clinical patterns by pathology
      patterns.clinical.forEach(clinical => {
        const pathology = clinical.pathology.toLowerCase();
        if (!globalPatterns.pathologySpecificPatterns[pathology]) {
          globalPatterns.pathologySpecificPatterns[pathology] = {
            count: 0,
            avgSummaryLength: 0,
            consultantRate: 0,
            procedureRate: 0
          };
        }
        const p = globalPatterns.pathologySpecificPatterns[pathology];
        p.count += 1;
        p.avgSummaryLength = ((p.avgSummaryLength * (p.count - 1)) + clinical.summaryLength) / p.count;
        p.consultantRate = ((p.consultantRate * (p.count - 1)) + (clinical.hasConsultant ? 1 : 0)) / p.count;
        p.procedureRate = ((p.procedureRate * (p.count - 1)) + (clinical.hasProcedure ? 1 : 0)) / p.count;
      });

      // Aggregate formatting
      patterns.formatting.forEach(format => {
        globalPatterns.formattingPreferences[format] = 
          (globalPatterns.formattingPreferences[format] || 0) + 1;
      });
    });

    return globalPatterns;
  }, [trainingExamples, extractPatternsFromExample]);

  // Add new training example
  const addTrainingExample = useCallback(() => {
    if (!newExample.completedSummary) {
      setError('Completed summary is required');
      return;
    }

    const example = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...newExample
    };

    const updated = [...trainingExamples, example];
    setTrainingExamples(updated);
    localStorage.setItem('trainingExamples', JSON.stringify(updated));

    // Analyze and update patterns
    const patterns = analyzeAllExamples();
    localStorage.setItem('globalLearningPatterns', JSON.stringify(patterns));
    
    if (onPatternsUpdated) {
      onPatternsUpdated(patterns);
    }

    setSuccess(`Training example added! Total examples: ${updated.length}`);
    setTimeout(() => setSuccess(''), 3000);

    // Reset form
    setNewExample({
      admissionNote: '',
      progressNotes: '',
      consultantNotes: '',
      procedureNote: '',
      finalNote: '',
      completedSummary: '',
      pathology: '',
      notes: ''
    });
    setShowAddForm(false);
  }, [newExample, trainingExamples, analyzeAllExamples, onPatternsUpdated]);

  // Delete training example
  const deleteExample = useCallback((id) => {
    const updated = trainingExamples.filter(ex => ex.id !== id);
    setTrainingExamples(updated);
    localStorage.setItem('trainingExamples', JSON.stringify(updated));

    // Re-analyze patterns
    const patterns = analyzeAllExamples();
    localStorage.setItem('globalLearningPatterns', JSON.stringify(patterns));
    
    if (onPatternsUpdated) {
      onPatternsUpdated(patterns);
    }

    setSuccess('Example deleted and patterns updated');
    setTimeout(() => setSuccess(''), 3000);
  }, [trainingExamples, analyzeAllExamples, onPatternsUpdated]);

  // Export examples
  const exportExamples = useCallback(() => {
    const dataStr = JSON.stringify(trainingExamples, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-examples-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [trainingExamples]);

  // Import examples
  const importExamples = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          setError('Invalid file format');
          return;
        }

        const updated = [...trainingExamples, ...imported];
        setTrainingExamples(updated);
        localStorage.setItem('trainingExamples', JSON.stringify(updated));

        // Re-analyze patterns
        const patterns = analyzeAllExamples();
        localStorage.setItem('globalLearningPatterns', JSON.stringify(patterns));
        
        if (onPatternsUpdated) {
          onPatternsUpdated(patterns);
        }

        setSuccess(`Imported ${imported.length} examples`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to import: ' + err.message);
      }
    };
    reader.readAsText(file);
  }, [trainingExamples, analyzeAllExamples, onPatternsUpdated]);

  // Get patterns summary
  const getPatternsSummary = useCallback(() => {
    const patterns = analyzeAllExamples();
    return patterns;
  }, [analyzeAllExamples]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Training Examples Library</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Example
          </button>
          <button
            onClick={exportExamples}
            disabled={trainingExamples.length === 0}
            className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <label className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importExamples}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Continuous Learning System</p>
            <p className="text-xs mt-1">
              Feed completed discharge summaries (with or without consultant notes) to help the system learn.
              The system analyzes patterns, structure, terminology, and clinical approaches to improve future outputs.
              No patient identifiable information is stored - only patterns and structures are extracted.
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Statistics */}
      {trainingExamples.length > 0 && (
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Learning Statistics</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-2 bg-white rounded">
              <p className="text-gray-600 text-xs">Total Examples</p>
              <p className="font-semibold text-lg">{trainingExamples.length}</p>
            </div>
            <div className="p-2 bg-white rounded">
              <p className="text-gray-600 text-xs">Unique Pathologies</p>
              <p className="font-semibold text-lg">
                {new Set(trainingExamples.map(e => e.pathology).filter(Boolean)).size}
              </p>
            </div>
            <div className="p-2 bg-white rounded">
              <p className="text-gray-600 text-xs">With Consultants</p>
              <p className="font-semibold text-lg">
                {trainingExamples.filter(e => e.consultantNotes).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Example Form */}
      {showAddForm && (
        <div className="card bg-gray-50 border-2 border-indigo-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Training Example</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pathology/Diagnosis Category
              </label>
              <input
                type="text"
                value={newExample.pathology}
                onChange={(e) => setNewExample({ ...newExample, pathology: e.target.value })}
                placeholder="e.g., Brain Tumor, Spine Fracture, SAH, TBI"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Note/H&P
              </label>
              <textarea
                value={newExample.admissionNote}
                onChange={(e) => setNewExample({ ...newExample, admissionNote: e.target.value })}
                placeholder="Paste admission note here..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Notes
              </label>
              <textarea
                value={newExample.progressNotes}
                onChange={(e) => setNewExample({ ...newExample, progressNotes: e.target.value })}
                placeholder="Paste progress notes here..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultant Notes (Optional)
              </label>
              <textarea
                value={newExample.consultantNotes}
                onChange={(e) => setNewExample({ ...newExample, consultantNotes: e.target.value })}
                placeholder="Paste consultant notes here if available..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedure Note (Optional)
              </label>
              <textarea
                value={newExample.procedureNote}
                onChange={(e) => setNewExample({ ...newExample, procedureNote: e.target.value })}
                placeholder="Paste procedure/operative note here if available..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Final/Discharge Note (Optional)
              </label>
              <textarea
                value={newExample.finalNote}
                onChange={(e) => setNewExample({ ...newExample, finalNote: e.target.value })}
                placeholder="Paste final discharge note here if available..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completed Discharge Summary <span className="text-red-600">*</span>
              </label>
              <textarea
                value={newExample.completedSummary}
                onChange={(e) => setNewExample({ ...newExample, completedSummary: e.target.value })}
                placeholder="Paste the completed/final discharge summary here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={newExample.notes}
                onChange={(e) => setNewExample({ ...newExample, notes: e.target.value })}
                placeholder="Any special notes about this case..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addTrainingExample}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                Add to Training Library
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Examples List */}
      {trainingExamples.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Training Examples ({trainingExamples.length})
          </h3>
          {trainingExamples.map((example) => (
            <div key={example.id} className="card bg-white border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium text-sm text-gray-900">
                      {example.pathology || 'Unspecified Pathology'}
                    </span>
                    {example.consultantNotes && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        With Consultant
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Added: {new Date(example.timestamp).toLocaleDateString()}
                  </p>
                  {example.notes && (
                    <p className="text-xs text-gray-600 mt-1">{example.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingExample(viewingExample === example.id ? null : example.id)}
                    className="p-1 text-gray-600 hover:text-indigo-600"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteExample(example.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded View */}
              {viewingExample === example.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-xs">
                  {example.admissionNote && (
                    <div>
                      <p className="font-medium text-gray-700">Admission Note:</p>
                      <p className="text-gray-600 mt-1 max-h-20 overflow-y-auto">
                        {example.admissionNote.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                  {example.completedSummary && (
                    <div>
                      <p className="font-medium text-gray-700">Completed Summary:</p>
                      <p className="text-gray-600 mt-1 max-h-20 overflow-y-auto">
                        {example.completedSummary.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-gray-50 border-2 border-dashed border-gray-300 text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No training examples yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Add your first example to start building the learning library
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainingExamplesManager;
