import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, Download, Copy, AlertCircle, CheckCircle, 
  Upload, Trash2, Wand2, RefreshCw, Edit, Settings,
  Save, Eye, EyeOff, Printer, Shield, Database,
  Activity, Clock, ClipboardList, ChevronDown, ChevronRight,
  Heart, Brain, Zap, Loader2, Info, BookOpen
} from 'lucide-react';
import TrainingExamplesManager from './TrainingExamplesManager';

const DischargeSummaryGenerator = () => {
  // Core State - Single unified input
  const [unifiedNotes, setUnifiedNotes] = useState('');
  const [detectedNotes, setDetectedNotes] = useState({
    admission: '',
    progress: '',
    consultant: '',
    procedure: '',
    final: ''
  });
  const [extractedData, setExtractedData] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  
  // UI State
  const [activeTab, setActiveTab] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Settings - Multi-AI Configuration
  const [useAI, setUseAI] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  
  // ML Learning State
  const [learningData, setLearningData] = useState(() => {
    const saved = localStorage.getItem('dischargeSummaryLearning');
    return saved ? JSON.parse(saved) : {
      corrections: [],
      patterns: {},
      totalEdits: 0,
      lastUpdated: null
    };
  });
  
  // Training patterns from examples
  const [globalPatterns, setGlobalPatterns] = useState(() => {
    const saved = localStorage.getItem('globalLearningPatterns');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Refs
  const fileInputRef = useRef(null);
  const summaryRef = useRef(null);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('dischargeSummaryDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.unifiedNotes) setUnifiedNotes(parsed.unifiedNotes);
        if (parsed.detectedNotes) setDetectedNotes(parsed.detectedNotes);
        setSuccess('Previous draft restored');
        setTimeout(() => setSuccess(''), 3000);
      } catch (e) {
        console.error('Failed to load saved draft');
      }
    }

    // Load API keys if saved
    const savedGemini = localStorage.getItem('geminiApiKey');
    const savedOpenAI = localStorage.getItem('openaiApiKey');
    const savedClaude = localStorage.getItem('claudeApiKey');
    
    if (savedGemini) {
      setGeminiApiKey(savedGemini);
      setUseAI(true);
    }
    if (savedOpenAI) setOpenaiApiKey(savedOpenAI);
    if (savedClaude) setClaudeApiKey(savedClaude);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!autoSave) return;
    
    const saveTimer = setTimeout(() => {
      if (unifiedNotes || Object.values(detectedNotes).some(n => n)) {
        localStorage.setItem('dischargeSummaryDraft', JSON.stringify({
          unifiedNotes,
          detectedNotes,
          savedAt: new Date().toISOString()
        }));
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [unifiedNotes, detectedNotes, autoSave]);

  // Smart Note Detection Function
  const detectNoteTypes = useCallback((text) => {
    const detected = {
      admission: '',
      progress: '',
      consultant: '',
      procedure: '',
      final: ''
    };

    // Split by common delimiters
    const sections = text.split(/(?:\n={3,}|\n-{3,}|\n\*{3,}|\n#{2,})/);
    
    // If there's only 1 section (no delimiters), treat the entire text as all types
    // This allows pattern extraction to work across the unified note
    if (sections.length === 1 && sections[0].trim().length > 100) {
      detected.admission = text;
      detected.progress = text;
      detected.final = text;
      return detected;
    }
    
    sections.forEach(section => {
      const lowerSection = section.toLowerCase();
      const trimmedSection = section.trim();
      
      if (!trimmedSection) return;
      
      // Admission/H&P Note Detection
      if (lowerSection.includes('admission') || 
          lowerSection.includes('history and physical') || 
          lowerSection.includes('h&p') ||
          lowerSection.includes('chief complaint') ||
          (lowerSection.includes('patient') && lowerSection.includes('admitted'))) {
        detected.admission += trimmedSection + '\n\n';
      }
      // Progress Note Detection
      else if (lowerSection.includes('progress note') || 
               lowerSection.includes('daily note') ||
               lowerSection.includes('soap note') ||
               (lowerSection.includes('neurosurgery') && lowerSection.includes('note')) ||
               lowerSection.match(/post[- ]?op(?:erative)?\s+day/i)) {
        detected.progress += trimmedSection + '\n\n';
      }
      // Consultant Note Detection
      else if (lowerSection.includes('consult') || 
               lowerSection.includes('consultation') ||
               lowerSection.includes('recommendations from') ||
               lowerSection.match(/(?:cardiology|neurology|medicine|icu|surgery)\s+note/i)) {
        detected.consultant += trimmedSection + '\n\n';
      }
      // Procedure Note Detection (check for explicit procedure note headers first)
      else if (lowerSection.includes('operative note') || 
               lowerSection.includes('procedure note') ||
               lowerSection.includes('operation performed') ||
               lowerSection.includes('operative report') ||
               lowerSection.includes('op note')) {
        detected.procedure += trimmedSection + '\n\n';
      }
      // Discharge/Final Note Detection
      else if (lowerSection.includes('discharge') || 
               lowerSection.includes('final note') ||
               lowerSection.includes('discharge summary') ||
               lowerSection.includes('disposition')) {
        detected.final += trimmedSection + '\n\n';
      }
      // If no specific marker, add to admission as default
      else if (detected.admission === '' && trimmedSection.length > 50) {
        detected.admission += trimmedSection + '\n\n';
      }
    });

    // Fallback: if nothing detected, treat entire text as admission note
    if (!Object.values(detected).some(v => v.trim())) {
      detected.admission = text;
    }

    return detected;
  }, []);

  // Semantic analysis helper - analyzes text word-by-word to infer medical information
  const analyzeTextSemantically = useCallback((text) => {
    const result = {
      diagnoses: [],
      procedures: [],
      medications: [],
      hospitalCourseEvents: [],
      clinicalFindings: []
    };
    
    // Medical condition patterns (common diagnoses)
    const conditionPatterns = [
      // Neurosurgical hemorrhage/bleeding conditions
      /\b(bleed|bleeding|hemorrhage|hematoma|ICH|intracranial hemorrhage|SDH|subdural hematoma|EDH|epidural hematoma|SAH|subarachnoid hemorrhage|IPH|intraparenchymal hemorrhage|IVH|intraventricular hemorrhage)\b/gi,
      
      // Neurosurgical tumor/mass conditions
      /\b(tumor|neoplasm|glioma|glioblastoma|GBM|astrocytoma|oligodendroglioma|meningioma|schwannoma|acoustic neuroma|pituitary adenoma|craniopharyngioma|metastasis|metastatic|brain mass|spinal tumor)\b/gi,
      
      // Neurosurgical spine conditions
      /\b(spinal stenosis|herniated disc|disc herniation|radiculopathy|radicular pain|myelopathy|spondylolisthesis|spondylosis|degenerative disc disease|spinal fracture|vertebral fracture|spinal cord injury|SCI)\b/gi,
      
      // Neurosurgical vascular conditions
      /\b(aneurysm|AVM|arteriovenous malformation|cavernous malformation|cavernoma|dural arteriovenous fistula|dural AVF|vasospasm|moyamoya)\b/gi,
      
      // Neurosurgical infection/inflammatory
      /\b(infection|abscess|brain abscess|spinal abscess|epidural abscess|meningitis|encephalitis|osteomyelitis|discitis|empyema|subdural empyema)\b/gi,
      
      // Neurosurgical CSF/hydrocephalus conditions
      /\b(CSF leak|cerebrospinal fluid leak|CSF rhinorrhea|CSF otorrhea|hydrocephalus|NPH|normal pressure hydrocephalus|obstructive hydrocephalus|communicating hydrocephalus|pseudotumor cerebri|IIH|idiopathic intracranial hypertension|increased ICP|intracranial pressure)\b/gi,
      
      // Neurosurgical seizure/epilepsy
      /\b(seizure|seizures|epilepsy|status epilepticus|convulsion|convulsions|post-traumatic epilepsy)\b/gi,
      
      // Other neurosurgical conditions
      /\b(stroke|CVA|cerebrovascular accident|TIA|transient ischemic attack|ischemic stroke|hemorrhagic stroke)\b/gi,
      /\b(traumatic brain injury|TBI|head trauma|head injury|concussion|contusion|diffuse axonal injury|DAI)\b/gi,
      /\b(Chiari malformation|syringomyelia|tethered cord|spinal dysraphism)\b/gi,
      
      // General medical conditions
      /\b(hypertension|HTN|high blood pressure)\b/gi,
      /\b(diabetes|DM|diabetic)\b/gi,
      /\b(pneumonia|UTI|urinary tract infection|sepsis)\b/gi,
      /\b(MI|myocardial infarction|heart attack|CHF|heart failure)\b/gi,
      /\b(COPD|asthma|respiratory failure)\b/gi,
      /\b(renal failure|kidney disease|CKD|acute kidney injury|AKI)\b/gi,
      /\b(DVT|deep vein thrombosis|PE|pulmonary embolism)\b/gi
    ];
    
    // Surgical procedure patterns
    const procedurePatterns = [
      /\b(craniotomy|craniectomy)\b/gi,
      /\b(clipping|coiling)\b/gi,
      /\b(evacuation|drainage)\b/gi,
      /\b(laminectomy|discectomy|fusion|decompression)\b/gi,
      /\b(shunt|EVD|external ventricular drain|ventriculostomy)\b/gi,
      /\b(biopsy|resection|excision|removal)\b/gi,
      /\b(embolization|angioplasty)\b/gi
    ];
    
    // Medication patterns (name + dose + frequency)
    const medicationPatterns = [
      /\b([A-Z][a-z]+(?:cillin|mycin|oxacin|tidine|prazole|olol|pril|sartan|statin))\s+(\d+\.?\d*)\s*(mg|mcg|g|units?)(?:\s+(daily|BID|TID|QID|q\d+h|PRN))?/gi,
      /\b(aspirin|acetaminophen|ibuprofen|morphine|fentanyl|hydrocodone|oxycodone)\s+(\d+\.?\d*)\s*(mg|mcg)(?:\s+(daily|BID|TID|QID|q\d+h|PRN))?/gi,
      /\b(levetiracetam|keppra|phenytoin|dilantin|carbamazepine|valproic acid)\s+(\d+\.?\d*)\s*(mg|mcg)(?:\s+(daily|BID|TID|QID|q\d+h|PRN))?/gi,
      /\b(nimodipine|labetalol|metoprolol|lisinopril|amlodipine)\s+(\d+\.?\d*)\s*(mg|mcg)(?:\s+(daily|BID|TID|QID|q\d+h|PRN))?/gi
    ];
    
    // Clinical event/temporal markers for hospital course
    const hospitalCourseMarkers = [
      /\b(underwent|had|received|completed|tolerated|developed|experienced)\s+([^.]+)/gi,
      /\b(post[-\s]?op(?:erative)?|after surgery|following procedure)\s+([^.]+)/gi,
      /\b(improved|worsened|stabilized|recovered|progressed)\b/gi,
      /\b(transferred to|admitted to|discharged to)\s+([^.]+)/gi,
      /\b(day \d+|POD \d+|hospital day \d+|HD \d+)\s*:?\s*([^.]+)/gi
    ];
    
    // Extract diagnoses from context
    conditionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const diagnosis = match[1] || match[0];
        // Get surrounding context (20 words before and after)
        const index = match.index;
        const before = text.substring(Math.max(0, index - 100), index);
        const after = text.substring(index, Math.min(text.length, index + 100));
        const context = before + match[0] + after;
        
        // Only add if not already in list (avoid duplicates)
        const normalizedDx = diagnosis.trim().toLowerCase();
        if (!result.diagnoses.some(d => d.condition.toLowerCase() === normalizedDx)) {
          result.diagnoses.push({
            condition: diagnosis.trim(),
            context: context.trim()
          });
        }
      }
    });
    
    // Extract procedures from context
    procedurePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const procedure = match[1] || match[0];
        const normalizedProc = procedure.trim().toLowerCase();
        // Only add if not already in list
        if (!result.procedures.some(p => p.toLowerCase() === normalizedProc)) {
          result.procedures.push(procedure.trim());
        }
      }
    });
    
    // Extract medications with doses
    medicationPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2]) {
          const medication = `${match[1]} ${match[2]}${match[3] || ''}${match[4] ? ' ' + match[4] : ''}`;
          const normalizedMed = medication.trim().toLowerCase();
          // Only add if not already in list
          if (!result.medications.some(m => m.toLowerCase() === normalizedMed)) {
            result.medications.push(medication.trim());
          }
        }
      }
    });
    
    // Extract hospital course events
    hospitalCourseMarkers.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const event = match[0];
        const normalizedEvent = event.trim().toLowerCase();
        // Only add if not already in list
        if (!result.hospitalCourseEvents.some(e => e.toLowerCase() === normalizedEvent)) {
          result.hospitalCourseEvents.push(event.trim());
        }
      }
    });
    
    return result;
  }, []);

  // Pattern-based extraction (updated to use detected notes)
  const extractWithPatterns = useCallback((notesToUse = null) => {
    const notes = notesToUse || detectedNotes;
    const admissionNote = notes.admission || '';
    const progressNotes = notes.progress || '';
    const finalNote = notes.final || '';
    const procedureNote = notes.procedure || '';
    
    // Perform semantic analysis on all notes
    const allText = admissionNote + ' ' + progressNotes + ' ' + finalNote + ' ' + procedureNote;
    const semanticAnalysis = analyzeTextSemantically(allText);
    
    const patterns = {
      // Demographics patterns
      patientName: [
        /(?:Patient Name|Patient|Name|Mr\.|Mrs\.|Ms\.|Dr\.)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+a\s+\d+/m,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}),?\s+(?:a\s+)?\d{1,3}[\s-]*(?:year|yo)/
      ],
      age: [
        /(\d{1,3})[\s-]*(?:year|years|yo|y\.o\.|y\/o)[\s-]*old/i,
        /(?:Age|AGE)\s*:?\s*(\d{1,3})/i,
        /(?:is\s+a\s+|is\s+an\s+)(\d{1,3})[\s-]*(?:year|yo)/i
      ],
      sex: [
        /\b(male|female|man|woman|M|F)\b/i,
        /(?:Sex|Gender|SEX|GENDER)\s*:?\s*(male|female|M|F)/i
      ],
      mrn: [
        /(?:MRN|Medical Record Number|MR#|Medical Record)\s*:?\s*(\d+)/i,
        /(?:Record|Chart)\s*(?:#|Number)?\s*:?\s*(\d+)/i
      ],
      admitDate: [
        /(?:Admission Date|Date of Admission|Admitted|DOA)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /(?:Admitted on|Admission on)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
      ],
      dischargeDate: [
        /(?:Discharge Date|Date of Discharge|DOD|Discharged)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /(?:Discharged on|Discharge on)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
      ]
    };

    const tryPatterns = (text, patternList) => {
      for (const pattern of patternList) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return '';
    };

    const extracted = {
      // Demographics
      patientName: tryPatterns(admissionNote, patterns.patientName),
      age: tryPatterns(admissionNote, patterns.age),
      sex: tryPatterns(admissionNote, patterns.sex),
      mrn: tryPatterns(admissionNote, patterns.mrn),
      
      // Dates
      admitDate: tryPatterns(admissionNote, patterns.admitDate),
      dischargeDate: tryPatterns(finalNote, patterns.dischargeDate),
      
      // Diagnoses
      admittingDiagnosis: '',
      dischargeDiagnosis: '',
      
      // Clinical Info
      procedures: [],
      historyPresenting: '',
      hospitalCourse: '',
      complications: [],
      imaging: [],
      consultantRecommendations: [],
      postOpProgress: '',
      majorEvents: [],
      
      // Current Status
      currentExam: '',
      dischargeExam: '',
      neurologicalExam: '',
      vitalSigns: '',
      
      // Functional Status Assessment
      kps: '', // Karnofsky Performance Status
      dischargeConditionScore: '', // Discharge Condition Score
      functionalStatus: '', // Overall functional assessment
      
      // Medications
      dischargeMedications: [],
      
      // History
      allergies: '',
      pmh: [],
      psh: [],
      
      // Discharge Planning
      disposition: 'Home',
      diet: 'Regular',
      activity: 'As tolerated',
      followUp: []
    };

    // Extract diagnoses - search across all note types for better detection
    const allNotes = admissionNote + '\n' + progressNotes + '\n' + finalNote;
    
    // Try admitting diagnosis first in admission note
    let admitDxMatch = admissionNote.match(/(?:Chief Complaint|CC|Presenting Problem|Reason for Admission|Admitting Diagnosis)\s*:?\s*([^\n]+)/i);
    // Fallback to generic "Diagnosis:" in admission note
    if (!admitDxMatch) {
      admitDxMatch = admissionNote.match(/^Diagnosis\s*:?\s*([^\n]+)/im);
    }
    // If still not found, use semantic analysis to infer from medical conditions
    if (!admitDxMatch && semanticAnalysis.diagnoses.length > 0) {
      // Use the first identified condition as admitting diagnosis
      extracted.admittingDiagnosis = semanticAnalysis.diagnoses[0].condition;
    } else if (admitDxMatch) {
      extracted.admittingDiagnosis = admitDxMatch[1].trim();
    }

    // Try discharge diagnosis in final note first
    let dischargeDxMatch = finalNote.match(/(?:Discharge Diagnosis|Final Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]+)/i);
    // Fallback to searching all notes for discharge/final diagnosis
    if (!dischargeDxMatch) {
      dischargeDxMatch = allNotes.match(/(?:Discharge Diagnosis|Final Diagnosis|Primary Diagnosis)\s*:?\s*([^\n]+)/i);
    }
    // Fallback to generic "Diagnosis:" if still not found
    if (!dischargeDxMatch) {
      dischargeDxMatch = allNotes.match(/^Diagnosis\s*:?\s*([^\n]+)/im);
    }
    // Use semantic analysis if no header found
    if (!dischargeDxMatch && semanticAnalysis.diagnoses.length > 0) {
      // Combine multiple diagnoses if found, prioritizing those in final/discharge context
      const diagnosesText = semanticAnalysis.diagnoses
        .slice(0, 3) // Take up to 3 diagnoses
        .map(d => d.condition)
        .join(', ');
      extracted.dischargeDiagnosis = diagnosesText;
    } else if (dischargeDxMatch) {
      extracted.dischargeDiagnosis = dischargeDxMatch[1].trim();
    }

    // Extract HPI
    const hpiMatch = admissionNote.match(/(?:HPI|History of Present Illness|History|Present Illness)\s*:?\s*([\s\S]{50,500}?)(?=\n\n|\n[A-Z]|PMH|Past Medical|$)/i);
    if (hpiMatch) extracted.historyPresenting = hpiMatch[1].trim();

    // Extract PMH
    const pmhMatch = admissionNote.match(/(?:PMH|Past Medical History|Medical History)\s*:?\s*([\s\S]{20,300}?)(?=\n\n|\n[A-Z]|PSH|Medications|$)/i);
    if (pmhMatch) {
      extracted.pmh = pmhMatch[1].split(/[,\n]/)
        .filter(item => item.trim())
        .map(item => item.trim());
    }

    // Extract allergies
    const allergyMatch = admissionNote.match(/(?:Allergies|ALLERGIES|Allergy|NKDA)\s*:?\s*([^\n]+)/i);
    if (allergyMatch) {
      extracted.allergies = allergyMatch[1].trim();
    }

    // Extract procedures from procedure note or progress notes
    const procedureText = procedureNote || progressNotes;
    if (procedureText) {
      const procMatches = procedureText.match(/(?:Procedure|Operation|Surgery)\s*:?\s*([^\n]+)/gi);
      if (procMatches) {
        extracted.procedures = procMatches.map(match => 
          match.replace(/(?:Procedure|Operation|Surgery)\s*:?\s*/i, '').trim()
        );
      }

      // Build hospital course from progress notes
      const courseMatches = progressNotes.match(/(?:POD|Post-op day|Hospital Day|HD)\s*#?\d+[^\n]*\n([\s\S]{50,500}?)(?=\n(?:POD|Post-op|Hospital Day|HD)|$)/gi);
      if (courseMatches) {
        extracted.hospitalCourse = courseMatches.join('\n\n');
      }
    }
    
    // Use semantic analysis for procedures if none found
    if (extracted.procedures.length === 0 && semanticAnalysis.procedures.length > 0) {
      extracted.procedures = semanticAnalysis.procedures;
    }
    
    // Try to extract hospital course from explicit "Hospital Course:" header if not found yet
    if (!extracted.hospitalCourse) {
      const allNotes = admissionNote + '\n' + progressNotes + '\n' + finalNote;
      const hospitalCourseMatch = allNotes.match(/(?:Hospital Course|Clinical Course|Course)\s*:?\s*([\s\S]{30,1000}?)(?=\n\n(?:[A-Z][a-z]+\s*:)|Discharge|Physical Exam|Medications|Disposition|$)/i);
      if (hospitalCourseMatch) {
        extracted.hospitalCourse = hospitalCourseMatch[1].trim();
      }
    }
    
    // Use semantic analysis to build hospital course from events if still not found
    if (!extracted.hospitalCourse && semanticAnalysis.hospitalCourseEvents.length > 0) {
      // Construct a narrative from the clinical events
      extracted.hospitalCourse = semanticAnalysis.hospitalCourseEvents
        .slice(0, 10) // Limit to 10 events
        .join('. ') + '.';
    }

    // Extract current exam from final note
    const examMatch = finalNote.match(/(?:Physical Exam|PE|Examination|Exam)\s*:?\s*([\s\S]{30,400}?)(?=\n\n|\n[A-Z]|Labs|Medications|$)/i);
    if (examMatch) extracted.currentExam = examMatch[1].trim();

    // Extract vital signs
    const vitalsMatch = finalNote.match(/(?:Vital Signs|Vitals|VS)\s*:?\s*([^\n]+)/i);
    if (vitalsMatch) extracted.vitalSigns = vitalsMatch[1].trim();

    // Extract discharge medications
    const medsMatch = finalNote.match(/(?:Discharge Medications|Medications|Meds)\s*:?\s*([\s\S]{30,500}?)(?=\n\n|\nFollow|Activity|Diet|$)/i);
    if (medsMatch) {
      extracted.dischargeMedications = medsMatch[1]
        .split(/\n/)
        .filter(med => med.trim() && /\d/.test(med))
        .map(med => med.trim());
    }
    
    // Use semantic analysis for medications if none found
    if (extracted.dischargeMedications.length === 0 && semanticAnalysis.medications.length > 0) {
      extracted.dischargeMedications = semanticAnalysis.medications;
    }

    // Extract disposition
    const dispositionMatch = finalNote.match(/(?:Disposition|Discharge to|Going to)\s*:?\s*([^\n]+)/i);
    if (dispositionMatch) extracted.disposition = dispositionMatch[1].trim();

    // Extract follow-up
    const followUpMatch = finalNote.match(/(?:Follow.?up|F\/U|Appointments)\s*:?\s*([\s\S]{20,300}?)(?=\n\n|Warning|Instructions|$)/i);
    if (followUpMatch) {
      extracted.followUp = followUpMatch[1]
        .split(/\n/)
        .filter(item => item.trim())
        .map(item => item.trim());
    }

    // Extract imaging findings (CT, MRI, X-ray)
    const imagingMatch = allNotes.match(/(?:CT|MRI|X-ray|Imaging|Radiology)\s*(?:scan|report|findings|shows?|demonstrates?|reveals?)\s*:?\s*([\s\S]{30,500}?)(?=\n\n|\n(?:Labs?|Physical|Exam|Assessment|Plan)|$)/gi);
    if (imagingMatch) {
      extracted.imaging = imagingMatch.map(match => {
        return match.replace(/(?:CT|MRI|X-ray|Imaging|Radiology)\s*(?:scan|report|findings|shows?|demonstrates?|reveals?)\s*:?\s*/i, '').trim();
      });
    }

    // Extract complications
    const complicationsMatch = allNotes.match(/(?:Complications?|Adverse Events?|Post-?op complications?)\s*:?\s*([\s\S]{20,400}?)(?=\n\n|\n[A-Z][a-z]+\s*:|$)/i);
    if (complicationsMatch) {
      extracted.complications = complicationsMatch[1]
        .split(/[,;\n]/)
        .filter(item => item.trim() && item.length > 3)
        .map(item => item.trim());
    } else {
      // Extract implicit complications from progress notes
      const implicitComplications = progressNotes.match(/\b(developed|experienced|had)\s+([\w\s]+(?:hemorrhage|infection|leak|dehiscence|failure|arrest|sepsis|pneumonia|DVT|PE|MI|stroke))/gi);
      if (implicitComplications) {
        extracted.complications = implicitComplications.map(match => 
          match.replace(/\b(developed|experienced|had)\s+/i, '').trim()
        );
      }
    }

    // Extract consultant recommendations
    const consultantNote = notes.consultant || '';
    const consultMatch = consultantNote.match(/(?:Recommendations?|Plan|Suggest|Advise)\s*:?\s*([\s\S]{30,500}?)(?=\n\n|\n(?:Signed|Attending)|$)/i);
    if (consultMatch) {
      extracted.consultantRecommendations = consultMatch[1]
        .split(/\n/)
        .filter(item => item.trim() && item.length > 5)
        .map(item => item.trim());
    } else {
      // Look for consultant opinions in progress notes
      const consultRefs = allNotes.match(/(?:Consult(?:ant)?|Specialist|(?:Cardiology|Neurology|PT|OT|Rehab|Pain))\s+(?:recommend|suggest|advise|state)[sd]?\s*:?\s*([^\n]{20,200})/gi);
      if (consultRefs) {
        extracted.consultantRecommendations = consultRefs.map(match => match.trim());
      }
    }

    // Extract post-operative progress (POD breakdown)
    const podMatches = progressNotes.match(/(?:POD|Post-?op(?:erative)? day|Hospital day|HD)\s*#?\s*(\d+)\s*:?\s*([\s\S]{30,500}?)(?=\n(?:POD|Post-?op|Hospital day|HD|Date:|\d{1,2}\/\d{1,2})|\n\n|$)/gi);
    if (podMatches) {
      extracted.postOpProgress = podMatches.join('\n\n');
    }

    // Extract major events
    const majorEventsPatterns = [
      /\b(code blue|rapid response|ICU transfer|intubat(?:ed|ion)|extubat(?:ed|ion)|cardiac arrest|seizure|stroke|hemorrhage|reoperation)\b/gi,
      /\b(transferred to ICU|admitted to ICU|return to OR|emergency surgery)\b/gi
    ];
    
    majorEventsPatterns.forEach(pattern => {
      const matches = allNotes.matchAll(pattern);
      for (const match of matches) {
        // Get surrounding context for the event
        const index = match.index;
        const before = allNotes.substring(Math.max(0, index - 50), index);
        const after = allNotes.substring(index, Math.min(allNotes.length, index + 100));
        const eventContext = (before + match[0] + after).trim();
        
        if (!extracted.majorEvents.some(e => e.toLowerCase().includes(match[0].toLowerCase()))) {
          extracted.majorEvents.push(eventContext);
        }
      }
    });

    // Extract discharge exam (separate from admission exam)
    const dischargeExamMatch = finalNote.match(/(?:Discharge Exam|Physical Exam(?:ination)? at Discharge|Final Exam)\s*:?\s*([\s\S]{30,500}?)(?=\n\n|\n(?:Labs?|Medications|Disposition)|$)/i);
    if (dischargeExamMatch) {
      extracted.dischargeExam = dischargeExamMatch[1].trim();
    } else if (extracted.currentExam) {
      extracted.dischargeExam = extracted.currentExam;
    }

    // Extract neurological exam specifically
    const neuroExamMatch = allNotes.match(/(?:Neuro(?:logical)? Exam|Mental Status|CN|Cranial Nerves|Motor|Sensory)\s*:?\s*([\s\S]{30,400}?)(?=\n\n|\n(?:Cardiovascular|Respiratory|Labs)|$)/i);
    if (neuroExamMatch) {
      extracted.neurologicalExam = neuroExamMatch[1].trim();
    }

    // Extract explicit KPS or functional status if documented
    const kpsMatch = allNotes.match(/(?:KPS|Karnofsky Performance Status|Karnofsky)\s*:?\s*(\d{1,3})/i);
    if (kpsMatch) {
      extracted.kps = kpsMatch[1];
    }

    // Estimate functional status from physical exam and clinical data
    const estimateFunctionalStatus = () => {
      const examText = (extracted.neurologicalExam + ' ' + extracted.dischargeExam + ' ' + extracted.currentExam + ' ' + allNotes).toLowerCase();
      
      let kpsScore = 0;
      let functionalDescription = '';
      
      // Assess based on activity level and independence
      if (examText.includes('independent') || examText.includes('ambulat') && examText.includes('independent')) {
        if (examText.includes('normal') || examText.includes('no deficits') || examText.includes('intact')) {
          kpsScore = 90; // Able to carry on normal activity
          functionalDescription = 'Independent with normal activity; no or minor signs/symptoms of disease';
        } else {
          kpsScore = 80; // Normal activity with effort
          functionalDescription = 'Independent with activities of daily living; some signs/symptoms of disease';
        }
      } else if (examText.includes('minimal assistance') || examText.includes('contact guard')) {
        kpsScore = 70; // Cares for self but unable to carry on normal activity
        functionalDescription = 'Cares for self; unable to carry on normal activity or work; minimal assistance required';
      } else if (examText.includes('moderate assistance') || examText.includes('assist') && !examText.includes('independent')) {
        kpsScore = 60; // Requires occasional assistance
        functionalDescription = 'Requires occasional assistance but able to care for most needs; moderate assistance required';
      } else if (examText.includes('maximal assistance') || examText.includes('dependent')) {
        kpsScore = 50; // Requires considerable assistance
        functionalDescription = 'Requires considerable assistance and frequent care; considerable/maximal assistance required';
      } else if (examText.includes('total care') || examText.includes('unable to care')) {
        kpsScore = 40; // Disabled, requires special care
        functionalDescription = 'Disabled; requires special care and assistance; total care required';
      }
      
      // Adjust based on specific functional indicators
      if (examText.includes('bedridden') || examText.includes('bed-bound')) {
        kpsScore = Math.min(kpsScore, 30);
        functionalDescription = 'Severely disabled; hospitalization/skilled care indicated; bedridden';
      } else if (examText.includes('wheelchair')) {
        kpsScore = Math.max(40, Math.min(kpsScore, 60));
      }
      
      // Check for very good function
      if (examText.includes('fully functional') || examText.includes('no limitations')) {
        kpsScore = 100;
        functionalDescription = 'Normal; no complaints; no evidence of disease';
      }
      
      // Adjust based on motor strength
      if (examText.match(/motor.*5\/5|strength.*5\/5|full strength/i)) {
        kpsScore = Math.max(kpsScore, 80);
      } else if (examText.match(/motor.*[3-4]\/5|strength.*[3-4]\/5/i)) {
        kpsScore = Math.max(40, Math.min(kpsScore, 70));
      } else if (examText.match(/motor.*[1-2]\/5|strength.*[1-2]\/5/i)) {
        kpsScore = Math.min(kpsScore, 50);
      }
      
      // Assess discharge condition score (1-5 scale)
      let dcsScore = '';
      if (kpsScore >= 80) {
        dcsScore = '5 - Excellent'; // Good functional status, independent
      } else if (kpsScore >= 70) {
        dcsScore = '4 - Good'; // Mild functional impairment
      } else if (kpsScore >= 50) {
        dcsScore = '3 - Fair'; // Moderate functional impairment
      } else if (kpsScore >= 30) {
        dcsScore = '2 - Poor'; // Significant functional impairment
      } else if (kpsScore > 0) {
        dcsScore = '1 - Critical'; // Severe functional impairment
      }
      
      return { kpsScore, functionalDescription, dcsScore };
    };
    
    // Apply functional status estimation if not explicitly documented
    if (!extracted.kps && (extracted.neurologicalExam || extracted.dischargeExam || extracted.currentExam)) {
      const functional = estimateFunctionalStatus();
      if (functional.kpsScore > 0) {
        extracted.kps = functional.kpsScore.toString();
        extracted.functionalStatus = functional.functionalDescription;
        extracted.dischargeConditionScore = functional.dcsScore;
      }
    }

    return extracted;
  }, [detectedNotes, analyzeTextSemantically]);

  // Multi-AI Extraction Functions
  
  // Gemini AI - Medical Information Extraction
  const extractWithGemini = useCallback(async () => {
    if (!geminiApiKey) {
      throw new Error('Gemini API key is required');
    }

    const notes = detectedNotes;
    const prompt = `You are a medical AI specialized in extracting neurosurgical and spine patient information. 
Extract the following information from these clinical notes and return as JSON:
- patientName, age, sex, mrn
- admitDate, dischargeDate
- admittingDiagnosis, dischargeDiagnosis
- procedures (array), complications (array)
- historyPresenting, hospitalCourse
- imaging (array - CT/MRI/X-ray findings)
- consultantRecommendations (array - recommendations from consultants)
- postOpProgress (string - post-operative day-by-day progress)
- majorEvents (array - significant events during hospitalization)
- currentExam, dischargeExam, neurologicalExam, vitalSigns
- dischargeMedications (array), allergies
- pmh (array), psh (array)
- disposition, diet, activity
- followUp (array)
- kps (Karnofsky Performance Status score if mentioned)
- functionalStatus (overall functional assessment)

Focus on: reason for admission, signs/symptoms, imaging findings, surgical treatments, post-operative progress, 
symptom changes (new/worsening/improving), major events, consultant plans.

For neurosurgery cases, pay special attention to: hemorrhage/bleed, tumor, infection, abscess, CSF leak, 
hydrocephalus, radicular pain, myelopathy, fracture, seizures.

Estimate functional status from physical exam findings (independence, mobility, motor strength).

ADMISSION NOTE:
${notes.admission}

PROGRESS NOTES:
${notes.progress}

CONSULTANT NOTES:
${notes.consultant}

PROCEDURE NOTE:
${notes.procedure}

DISCHARGE NOTE:
${notes.final}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        // Try to parse JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      throw new Error('Could not parse Gemini response');
    } catch (error) {
      console.error('Gemini extraction error:', error);
      throw error;
    }
  }, [geminiApiKey, detectedNotes]);

  // OpenAI - Clinical Synthesis
  const synthesizeWithOpenAI = useCallback(async (extractedData) => {
    if (!openaiApiKey) {
      return extractedData; // Skip if no API key
    }

    try {
      const prompt = `Given this extracted patient data, synthesize and enhance the clinical narrative, 
ensuring medical accuracy and completeness. Focus on neurosurgical context.

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Return enhanced data in the same JSON structure with improved narratives.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a neurosurgery medical AI assistant specializing in clinical documentation.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        console.warn('OpenAI synthesis skipped:', response.statusText);
        return extractedData;
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      return extractedData;
    } catch (error) {
      console.error('OpenAI synthesis error:', error);
      return extractedData; // Return original if failed
    }
  }, [openaiApiKey]);

  // Claude - Structuring and Summarizing
  const structureWithClaude = useCallback(async (extractedData) => {
    if (!claudeApiKey) {
      return extractedData; // Skip if no API key
    }

    try {
      const prompt = `You are Claude, an AI specialized in medical documentation structure and summarization.
      
Given this clinical data, structure and summarize it into a well-organized discharge summary format.
Focus on clarity, completeness, and proper medical documentation standards.

Clinical Data:
${JSON.stringify(extractedData, null, 2)}

Return the structured data in the same JSON format with improved organization and concise summaries.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        console.warn('Claude structuring skipped:', response.statusText);
        return extractedData;
      }

      const result = await response.json();
      const content = result.content?.[0]?.text;
      
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      return extractedData;
    } catch (error) {
      console.error('Claude structuring error:', error);
      return extractedData; // Return original if failed
    }
  }, [claudeApiKey]);

  // Orchestrated Multi-AI Extraction
  const extractWithMultiAI = useCallback(async () => {
    let extractedData;
    
    // Step 1: Extract with Gemini (primary extraction)
    if (geminiApiKey) {
      try {
        extractedData = await extractWithGemini();
      } catch (error) {
        console.warn('Gemini extraction failed, using patterns:', error);
        extractedData = extractWithPatterns();
      }
    } else {
      extractedData = extractWithPatterns();
    }
    
    // Step 2: Enhance with OpenAI (synthesis)
    if (openaiApiKey && extractedData) {
      try {
        extractedData = await synthesizeWithOpenAI(extractedData);
      } catch (error) {
        console.warn('OpenAI synthesis failed, continuing without:', error);
      }
    }
    
    // Step 3: Structure with Claude (organization)
    if (claudeApiKey && extractedData) {
      try {
        extractedData = await structureWithClaude(extractedData);
      } catch (error) {
        console.warn('Claude structuring failed, continuing without:', error);
      }
    }
    
    return extractedData;
  }, [geminiApiKey, openaiApiKey, claudeApiKey, extractWithGemini, synthesizeWithOpenAI, structureWithClaude, extractWithPatterns]);

  // Main extraction handler with note detection
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

      // Step 2: Extract data using multi-AI or patterns
      let extracted;
      
      if (useAI && (geminiApiKey || openaiApiKey || claudeApiKey)) {
        try {
          extracted = await extractWithMultiAI();
          setSuccess('Multi-AI extraction completed successfully');
        } catch (aiError) {
          console.warn('AI extraction failed, falling back to patterns:', aiError);
          extracted = extractWithPatterns(detected);
          setWarnings(['AI extraction failed, used pattern matching instead']);
        }
      } else {
        extracted = extractWithPatterns(detected);
        setSuccess('Pattern extraction completed');
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

  // ML Learning Functions
  
  // Analyze edits to identify patterns (not patient-specific data)
  const analyzeEdit = useCallback((originalText, editedText) => {
    const patterns = [];
    
    // Identify type of change
    if (originalText.length < editedText.length) {
      patterns.push({ type: 'addition', context: 'content_expansion' });
    } else if (originalText.length > editedText.length) {
      patterns.push({ type: 'reduction', context: 'content_simplification' });
    }
    
    // Check for common medical phrase changes
    const medicalPhrases = {
      'patient': ['pt', 'individual', 'case'],
      'underwent': ['had', 'received', 'completed'],
      'discharge': ['released', 'sent home', 'transferred'],
      'stable': ['improving', 'well', 'good condition'],
      'tolerated': ['did well with', 'handled', 'managed']
    };
    
    for (const [formal, informal] of Object.entries(medicalPhrases)) {
      if (originalText.toLowerCase().includes(formal) && 
          !editedText.toLowerCase().includes(formal) &&
          informal.some(alt => editedText.toLowerCase().includes(alt))) {
        patterns.push({ 
          type: 'terminology_preference', 
          from: formal, 
          context: 'formality_adjustment' 
        });
      }
    }
    
    // Check for structure changes
    if ((originalText.match(/\n/g) || []).length < (editedText.match(/\n/g) || []).length) {
      patterns.push({ type: 'formatting', context: 'improved_readability' });
    }
    
    return patterns;
  }, []);
  
  // Save learning from edits
  const handleSummaryEdit = useCallback((editedSummary) => {
    const patterns = analyzeEdit(generatedSummary, editedSummary);
    
    if (patterns.length > 0) {
      const newLearningData = { ...learningData };
      
      patterns.forEach(pattern => {
        const key = `${pattern.type}_${pattern.context}`;
        newLearningData.patterns[key] = (newLearningData.patterns[key] || 0) + 1;
      });
      
      newLearningData.corrections.push({
        timestamp: new Date().toISOString(),
        patterns: patterns,
        // Do NOT store patient-specific data
        editType: patterns.map(p => p.type).join(',')
      });
      
      newLearningData.totalEdits += 1;
      newLearningData.lastUpdated = new Date().toISOString();
      
      // Keep only last 100 corrections to avoid bloat
      if (newLearningData.corrections.length > 100) {
        newLearningData.corrections = newLearningData.corrections.slice(-100);
      }
      
      setLearningData(newLearningData);
      localStorage.setItem('dischargeSummaryLearning', JSON.stringify(newLearningData));
      
      setSuccess('Learning saved - future summaries will incorporate this pattern');
      setTimeout(() => setSuccess(''), 3000);
    }
    
    setGeneratedSummary(editedSummary);
    setEditableSummary(editedSummary);
    setIsEditing(false);
  }, [generatedSummary, learningData, analyzeEdit]);
  
  // Apply learned patterns to new summaries
  const applyLearnings = useCallback((summaryText) => {
    let enhanced = summaryText;
    
    // Apply the most common learned patterns from edits
    const sortedPatterns = Object.entries(learningData.patterns)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 5); // Top 5 patterns
    
    sortedPatterns.forEach(([patternKey, count]) => {
      if (count >= 3) { // Only apply if seen 3+ times
        const [type, context] = patternKey.split('_');
        
        if (type === 'formatting' && context === 'improved') {
          // Add extra spacing for readability if learned
          enhanced = enhanced.replace(/\n([A-Z])/g, '\n\n$1');
        }
        
        if (type === 'terminology' && context === 'formality') {
          // Apply preferred terminology if learned
          enhanced = enhanced.replace(/\bpatient\b/gi, 'pt');
        }
      }
    });
    
    // Apply global training patterns from examples
    if (globalPatterns) {
      // Apply preferred terminology from training examples
      if (globalPatterns.preferredTerminology) {
        Object.entries(globalPatterns.preferredTerminology).forEach(([term, data]) => {
          // Use terminology that appears frequently in examples
          if (data.count >= 3 && data.totalFreq > 5) {
            // This term is commonly used in completed summaries
            // No specific replacement needed - just validates terminology is acceptable
          }
        });
      }
      
      // Apply formatting preferences from training examples
      if (globalPatterns.formattingPreferences) {
        const bulletPreferred = (globalPatterns.formattingPreferences['bullet_list_preferred'] || 0) > 
                               (globalPatterns.formattingPreferences['numbered_list_used'] || 0);
        
        // This information can be used to guide formatting decisions
        // The template system already handles most of this
      }
    }
    
    return enhanced;
  }, [learningData, globalPatterns]);

  // Generate summary from extracted data
  const generateSummary = () => {
    if (!extractedData) {
      setError('Please extract data first');
      return;
    }

    const formatList = (items, numbered = false) => {
      if (!items || items.length === 0) return 'None';
      return items.map((item, i) => 
        `${numbered ? `${i + 1}.` : '•'} ${item}`
      ).join('\n');
    };

    const templates = {
      standard: () => `DISCHARGE SUMMARY
================================================================================
Date: ${new Date().toLocaleDateString()}

PATIENT INFORMATION
Name: ${extractedData.patientName || '[Name]'}
Age/Sex: ${extractedData.age || '[Age]'} / ${extractedData.sex || '[Sex]'}
MRN: ${extractedData.mrn || '[MRN]'}
Admission Date: ${extractedData.admitDate || '[Admit Date]'}
Discharge Date: ${extractedData.dischargeDate || '[Discharge Date]'}

DIAGNOSES
Admitting Diagnosis: ${extractedData.admittingDiagnosis || '[Admitting Dx]'}
Discharge Diagnosis: ${extractedData.dischargeDiagnosis || '[Discharge Dx]'}

REASON FOR ADMISSION
${extractedData.historyPresenting || '[History of presenting illness and reason for admission]'}

PROCEDURES PERFORMED
${formatList(extractedData.procedures, true)}

IMAGING STUDIES & FINDINGS
${extractedData.imaging && extractedData.imaging.length > 0 ? formatList(extractedData.imaging, false) : '[CT/MRI/X-ray findings]'}

HOSPITAL COURSE
${extractedData.hospitalCourse || '[Detailed hospital course including post-operative progress]'}

POST-OPERATIVE PROGRESS
${extractedData.postOpProgress || '[Post-operative day-by-day progress]'}

COMPLICATIONS
${extractedData.complications && extractedData.complications.length > 0 ? formatList(extractedData.complications, false) : 'None'}

MAJOR EVENTS
${extractedData.majorEvents && extractedData.majorEvents.length > 0 ? formatList(extractedData.majorEvents, false) : 'None'}

CONSULTANT RECOMMENDATIONS
${extractedData.consultantRecommendations && extractedData.consultantRecommendations.length > 0 ? formatList(extractedData.consultantRecommendations, false) : 'None documented'}

PHYSICAL EXAMINATION AT DISCHARGE
Vital Signs: ${extractedData.vitalSigns || 'Stable'}

Neurological Examination:
${extractedData.neurologicalExam || '[Mental status, cranial nerves, motor, sensory findings]'}

General Examination:
${extractedData.dischargeExam || extractedData.currentExam || '[Complete physical exam findings]'}

FUNCTIONAL STATUS ASSESSMENT
${extractedData.kps ? `Karnofsky Performance Status (KPS): ${extractedData.kps}` : ''}
${extractedData.dischargeConditionScore ? `Discharge Condition Score: ${extractedData.dischargeConditionScore}` : ''}
${extractedData.functionalStatus ? `Functional Assessment: ${extractedData.functionalStatus}` : ''}
${!extractedData.kps && !extractedData.dischargeConditionScore && !extractedData.functionalStatus ? '[Functional status assessment based on physical exam and clinical course]' : ''}

PAST MEDICAL HISTORY
${formatList(extractedData.pmh)}

PAST SURGICAL HISTORY
${formatList(extractedData.psh)}

ALLERGIES: ${extractedData.allergies || 'NKDA'}

DISCHARGE INSTRUCTIONS
Disposition: ${extractedData.disposition}
Diet: ${extractedData.diet}
Activity: ${extractedData.activity}

FOLLOW-UP APPOINTMENTS
${formatList(extractedData.followUp)}

DISCHARGE MEDICATIONS
${formatList(extractedData.dischargeMedications, true)}

If you have any questions or concerns, please contact your physician.

_______________________________
Physician Signature`,

      detailed: () => `COMPREHENSIVE DISCHARGE SUMMARY - NEUROSURGERY/SPINE
================================================================================
Date: ${new Date().toLocaleDateString()}

PATIENT INFORMATION
Name: ${extractedData.patientName || '[Name]'}
Age/Sex: ${extractedData.age || '[Age]'} / ${extractedData.sex || '[Sex]'}
MRN: ${extractedData.mrn || '[MRN]'}
Admission Date: ${extractedData.admitDate || '[Admit Date]'}
Discharge Date: ${extractedData.dischargeDate || '[Discharge Date]'}
Length of Stay: ${extractedData.los || '[Calculate from dates]'}

DIAGNOSES
Primary/Admitting Diagnosis: ${extractedData.admittingDiagnosis || '[Primary diagnosis]'}
Discharge/Final Diagnosis: ${extractedData.dischargeDiagnosis || '[Final diagnosis with post-operative status]'}

CHIEF COMPLAINT & REASON FOR ADMISSION
${extractedData.historyPresenting || '[Detailed presenting symptoms, onset, progression, initial signs and symptoms leading to admission]'}

PAST MEDICAL HISTORY
${formatList(extractedData.pmh)}

PAST SURGICAL HISTORY
${formatList(extractedData.psh)}

ALLERGIES: ${extractedData.allergies || 'NKDA'}

IMAGING STUDIES
${extractedData.imaging && extractedData.imaging.length > 0 ? 
  extractedData.imaging.map((img, i) => `\n${i + 1}. ${img}`).join('') : 
  '[Detailed CT/MRI/X-ray findings including dates and key findings]'}

PROCEDURES/OPERATIONS PERFORMED
${extractedData.procedures && extractedData.procedures.length > 0 ?
  extractedData.procedures.map((proc, i) => `${i + 1}. ${proc}`).join('\n') :
  '[Date, procedure name, surgeon, approach, findings, complications]'}

HOSPITAL COURSE & POST-OPERATIVE PROGRESS

Overview:
${extractedData.hospitalCourse || '[Comprehensive narrative of hospital course]'}

${extractedData.postOpProgress ? `
Day-by-Day Progress:
${extractedData.postOpProgress}` : ''}

Treatment Summary:
• Medical Management: [Medications, pain control, DVT prophylaxis]
• Surgical Treatment: [As listed in procedures section]
• Physical Therapy: [Mobility, strength, rehabilitation progress]
• Symptom Evolution: [New, worsening, or improving symptoms noted during hospitalization]

COMPLICATIONS
${extractedData.complications && extractedData.complications.length > 0 ? 
  extractedData.complications.map((comp, i) => `${i + 1}. ${comp}`).join('\n') : 
  'No intraoperative or postoperative complications noted.'}

MAJOR EVENTS
${extractedData.majorEvents && extractedData.majorEvents.length > 0 ?
  extractedData.majorEvents.map((event, i) => `${i + 1}. ${event}`).join('\n') :
  'No major events during hospitalization.'}

CONSULTANT EVALUATIONS & RECOMMENDATIONS
${extractedData.consultantRecommendations && extractedData.consultantRecommendations.length > 0 ?
  extractedData.consultantRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n') :
  'No consultant evaluations documented or none required.'}

DISCHARGE PHYSICAL EXAMINATION
Date: ${extractedData.dischargeDate || new Date().toLocaleDateString()}

Vital Signs: ${extractedData.vitalSigns || 'T: [temp] BP: [bp] HR: [hr] RR: [rr] O2 Sat: [sat]%'}

Neurological Examination:
${extractedData.neurologicalExam || `• Mental Status: [Alert, oriented x3, appropriate]
• Cranial Nerves: [II-XII intact]
• Motor: [Strength 5/5 bilateral upper/lower extremities]
• Sensory: [Intact to light touch and pinprick]
• Reflexes: [DTRs 2+ and symmetric]
• Coordination: [Normal finger-to-nose, heel-to-shin]
• Gait: [Steady, independent/assisted]`}

${extractedData.dischargeExam || extractedData.currentExam ? `
General Physical Examination:
${extractedData.dischargeExam || extractedData.currentExam}` : `
General Physical Examination:
• General: Well-appearing, no acute distress
• HEENT: Normocephalic, atraumatic
• Cardiovascular: Regular rate and rhythm
• Respiratory: Clear to auscultation bilaterally
• Abdomen: Soft, non-tender, non-distended
• Extremities: No edema
• Skin/Wound: [Surgical incision clean, dry, intact]`}

FUNCTIONAL STATUS AT DISCHARGE
${extractedData.kps ? `Karnofsky Performance Status (KPS): ${extractedData.kps}` : ''}
${extractedData.dischargeConditionScore ? `Discharge Condition Score: ${extractedData.dischargeConditionScore}` : ''}
${extractedData.functionalStatus ? `
Functional Assessment: ${extractedData.functionalStatus}` : ''}
${!extractedData.kps && !extractedData.dischargeConditionScore && !extractedData.functionalStatus ? `
KPS Score: [To be assessed based on functional capabilities]
- 100: Normal, no complaints, no evidence of disease
- 90: Able to carry on normal activity, minor signs/symptoms
- 80: Normal activity with effort, some signs/symptoms
- 70: Cares for self, unable to carry on normal activity
- 60: Requires occasional assistance
- 50: Requires considerable assistance and frequent care
- 40: Disabled, requires special care
- 30: Severely disabled, hospitalization indicated
- 20: Very sick, active supportive treatment necessary
- 10: Moribund, fatal processes progressing rapidly

Discharge Condition Score: [1-Critical, 2-Poor, 3-Fair, 4-Good, 5-Excellent]` : ''}

DISCHARGE PLAN

Disposition: ${extractedData.disposition}

Activity: ${extractedData.activity}

Diet: ${extractedData.diet}

Wound Care: [Specific instructions for surgical site care]

Warning Signs - Call physician or go to ER if:
• Severe headache or neck pain
• New or worsening weakness or numbness
• Fever > 101.5°F
• Wound drainage, redness, or swelling
• Loss of bowel/bladder control
• Severe pain not controlled by medications
• Any other concerning symptoms

FOLLOW-UP CARE
${formatList(extractedData.followUp)}
${!extractedData.followUp || extractedData.followUp.length === 0 ? '• Follow up with surgeon in 2 weeks\n• Follow up with primary care physician in 1-2 weeks\n• Physical therapy as arranged' : ''}

DISCHARGE MEDICATIONS
${formatList(extractedData.dischargeMedications, true)}
${!extractedData.dischargeMedications || extractedData.dischargeMedications.length === 0 ? '[Medication list with name, dose, frequency, duration, and indication]' : ''}

ADDITIONAL INSTRUCTIONS
• Continue all medications as prescribed
• Attend all follow-up appointments
• Comply with activity restrictions
• Practice proper wound care
• Contact physician with any concerns

_______________________________
Attending Physician Signature

_______________________________
Date`,

      brief: () => `DISCHARGE SUMMARY - BRIEF
================================================================================
Patient: ${extractedData.patientName || '[Name]'} (${extractedData.age || '[Age]'}/${extractedData.sex || '[Sex]'})
Dates: ${extractedData.admitDate || '[Admit]'} to ${extractedData.dischargeDate || '[Discharge]'}

Diagnosis: ${extractedData.dischargeDiagnosis || '[Diagnosis]'}
Procedures: ${extractedData.procedures?.join(', ') || 'None'}

Course: ${extractedData.hospitalCourse || '[Brief hospital course]'}

Discharge Exam: ${extractedData.dischargeExam || extractedData.currentExam || 'Stable'}

Medications:
${formatList(extractedData.dischargeMedications, true)}

Follow-up:
${formatList(extractedData.followUp)}

Disposition: ${extractedData.disposition}`
    };

    const template = templates[selectedTemplate] || templates.standard;
    let summary = template();
    
    // Apply learned patterns to enhance the summary
    summary = applyLearnings(summary);
    
    setGeneratedSummary(summary);
    setEditableSummary(summary);
    setSuccess('Summary generated successfully');
    setActiveTab('output');
  };

  // File handling
  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target.result);
      setSuccess(`File uploaded: ${file.name}`);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  // Copy to clipboard
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(generatedSummary);
      setCopied(true);
      setSuccess('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Download as file
  const downloadSummary = () => {
    const blob = new Blob([generatedSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discharge_summary_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('Summary downloaded');
  };

  // Print summary
  const printSummary = () => {
    window.print();
  };

  // Clear all
  const clearAll = () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Clear all data? This cannot be undone.')) return;
    
    setUnifiedNotes('');
    setDetectedNotes({
      admission: '',
      progress: '',
      consultant: '',
      procedure: '',
      final: ''
    });
    setExtractedData(null);
    setGeneratedSummary('');
    setEditableSummary('');
    setError('');
    setWarnings([]);
    setSuccess('All data cleared');
    localStorage.removeItem('dischargeSummaryDraft');
  };

  // Handle API keys
  const handleApiKeySave = () => {
    if (geminiApiKey) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
    }
    if (openaiApiKey) {
      localStorage.setItem('openaiApiKey', openaiApiKey);
    }
    if (claudeApiKey) {
      localStorage.setItem('claudeApiKey', claudeApiKey);
    }
    
    if (geminiApiKey || openaiApiKey || claudeApiKey) {
      setUseAI(true);
      setShowApiKeyInput(false);
      setSuccess('API keys saved');
    }
  };

  // Update extracted data
  const updateExtractedData = (key, value) => {
    setExtractedData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="card mb-6 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Discharge Summary Generator
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Extract and generate medical discharge summaries
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {autoSave && (
              <span className="text-xs text-green-600 flex items-center">
                <Save className="h-3 w-3 mr-1" />
                Auto-save on
              </span>
            )}
            <button
              onClick={() => setAutoSave(!autoSave)}
              className="btn-secondary text-sm"
              title="Toggle auto-save"
            >
              <Database className="h-4 w-4" />
            </button>
            <button
              onClick={clearAll}
              className="btn-secondary text-sm text-red-600"
              title="Clear all data"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 no-print">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg no-print">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 no-print animate-fade-in">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6 no-print">
          {/* Settings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => {
                      setUseAI(e.target.checked);
                      if (e.target.checked && !geminiApiKey && !openaiApiKey && !claudeApiKey) {
                        setShowApiKeyInput(true);
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Use Multi-AI Extraction</span>
                  <Brain className="h-4 w-4 text-purple-600" />
                </label>
                {useAI && (
                  <button
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {geminiApiKey || openaiApiKey || claudeApiKey ? 'Manage API Keys' : 'Add API Keys'}
                  </button>
                )}
              </div>
              
              {showApiKeyInput && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">
                    Configure AI APIs for synergistic extraction:
                  </p>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gemini API Key (Medical Extraction)
                    </label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Enter Gemini API key"
                      className="input-field text-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      OpenAI API Key (Clinical Synthesis) - Optional
                    </label>
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="Enter OpenAI API key (optional)"
                      className="input-field text-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Claude API Key (Structuring) - Optional
                    </label>
                    <input
                      type="password"
                      value={claudeApiKey}
                      onChange={(e) => setClaudeApiKey(e.target.value)}
                      placeholder="Enter Claude API key (optional)"
                      className="input-field text-sm w-full"
                    />
                  </div>
                  
                  <button
                    onClick={handleApiKeySave}
                    className="btn-primary text-sm w-full mt-2"
                  >
                    Save API Keys
                  </button>
                </div>
              )}
              
              <div>
                <label htmlFor="template-select" className="block text-sm font-medium mb-1">Template</label>
                <select
                  id="template-select"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="brief">Brief</option>
                </select>
              </div>
            </div>
          </div>

          {/* Note Inputs - Unified Input Box */}
          <div className="card">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Clinical Notes</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="h-4 w-4" />
                  <span>Paste all notes - system will auto-detect types</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Paste admission notes, progress notes, consultant notes, procedure notes, and discharge notes.
                The system will automatically detect and separate different note types.
              </p>
            </div>

            {/* Detected Note Types Display */}
            {Object.entries(detectedNotes).some(([_, content]) => content.trim()) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-2">Detected Note Types:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(detectedNotes).filter(([_, content]) => content.trim()).map(([type, _]) => (
                    <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                value={unifiedNotes}
                onChange={(e) => setUnifiedNotes(e.target.value)}
                placeholder={`Paste all clinical notes here (admission, progress, consultations, procedures, discharge notes)...

Example format (optional delimiters):
===================================
ADMISSION NOTE / H&P
Patient: John Doe...
===================================
PROGRESS NOTE - POD 1
Patient doing well...
===================================
DISCHARGE NOTE
Patient ready for discharge...`}
                className="input-field h-80 font-mono text-sm resize-y"
              />
              
              <label className="absolute top-3 right-3 cursor-pointer">
                <div className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Upload className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.md"
                  onChange={(e) => handleFileUpload(e, setUnifiedNotes)}
                />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Character count: {unifiedNotes.length}</span>
            </div>

            <div className="mt-4">
              <button
                onClick={handleExtractData}
                disabled={loading || !unifiedNotes.trim()}
                className="w-full btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Detecting notes and extracting...</span>
                  </>
                ) : (
                  <>
                    {useAI ? <Brain className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    <span>Auto-Detect & Extract Information</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Extracted Data */}
          {extractedData && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
                <Edit className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(extractedData).map(([key, value]) => {
                  const isArray = Array.isArray(value);
                  const displayValue = isArray ? value.join('\n') : value || '';
                  
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      {isArray ? (
                        <textarea
                          value={displayValue}
                          onChange={(e) => updateExtractedData(key, e.target.value.split('\n').filter(Boolean))}
                          rows={Math.min(3, value.length || 1)}
                          className="input-field text-sm font-mono"
                        />
                      ) : (
                        <input
                          type="text"
                          value={displayValue}
                          onChange={(e) => updateExtractedData(key, e.target.value)}
                          className="input-field text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={generateSummary}
                className="w-full btn-primary mt-4"
              >
                <FileText className="h-5 w-5" />
                <span>Generate Summary</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4 no-print">
              <h2 className="text-lg font-semibold text-gray-900">Generated Summary</h2>
              {generatedSummary && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-2 rounded-lg transition-colors ${
                      isEditing 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={isEditing ? 'View Mode' : 'Edit Mode'}
                  >
                    {isEditing ? <Eye className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={copySummary}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={printSummary}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {isEditing && generatedSummary && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg no-print">
                <div className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">ML Learning Mode Active</p>
                    <p className="text-xs mt-1">
                      Your edits will be analyzed (without storing patient data) to improve future summaries.
                      Total edits learned: {learningData.totalEdits}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generatedSummary ? (
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editableSummary}
                      onChange={(e) => setEditableSummary(e.target.value)}
                      className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 no-print">
                      <button
                        onClick={() => handleSummaryEdit(editableSummary)}
                        className="btn-primary flex-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save & Learn from Edits</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditableSummary(generatedSummary);
                          setIsEditing(false);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={summaryRef}
                    className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-auto"
                  >
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                      {generatedSummary}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3" />
                  <p>Generated summary will appear here</p>
                  <p className="text-xs mt-2">Extract data and generate summary to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* ML Learning Dashboard */}
          {learningData.totalEdits > 0 && (
            <div className="card bg-gradient-to-br from-purple-50 to-blue-50 no-print">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">ML Learning Statistics</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white rounded">
                  <p className="text-gray-600 text-xs">Total Edits</p>
                  <p className="font-semibold text-lg">{learningData.totalEdits}</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-gray-600 text-xs">Patterns Learned</p>
                  <p className="font-semibold text-lg">{Object.keys(learningData.patterns).length}</p>
                </div>
              </div>
              {learningData.lastUpdated && (
                <p className="text-xs text-gray-600 mt-2">
                  Last updated: {new Date(learningData.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Training Examples Section - Full Width */}
      <div className="mt-8 no-print">
        <TrainingExamplesManager 
          onPatternsUpdated={(patterns) => {
            setGlobalPatterns(patterns);
            setSuccess('Training patterns updated from examples');
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      </div>
    </div>
  );
};

export default DischargeSummaryGenerator;