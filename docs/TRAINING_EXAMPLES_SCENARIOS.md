# Training Examples: Real-World Usage Scenarios

## Scenario 1: Teaching the System About Brain Tumor Cases

### Step 1: Add First Example

**Pathology**: Brain Tumor - Glioblastoma

**Admission Note**:
```
Patient is a 55-year-old male presenting with progressive headaches and left-sided weakness for 2 weeks. MRI brain shows 4.5cm right frontal mass with significant perilesional edema and midline shift. Consistent with high-grade glioma.

PMH: Hypertension, Type 2 DM
PSH: None
Allergies: NKDA
```

**Progress Notes**:
```
POD 1: Patient underwent right frontal craniotomy for tumor resection. Tolerated procedure well. Post-op exam shows improved left-sided strength (4/5). Neuro checks stable. Pain controlled.

POD 2: Ambulating with PT. Left arm strength improving to 4+/5. Dexamethasone taper initiated. No new deficits.

POD 3: Ready for discharge. Stable neurological exam. Follow-up arranged with oncology and neurosurgery.
```

**Completed Discharge Summary**:
```
DISCHARGE SUMMARY

PATIENT INFORMATION:
Age/Sex: 55M
Admission Date: 01/15/2024
Discharge Date: 01/18/2024

DIAGNOSES:
Primary: Glioblastoma, right frontal lobe
Secondary: Post-operative period, s/p craniotomy

PROCEDURES:
1. Right frontal craniotomy for tumor resection (01/15/2024)

HOSPITAL COURSE:
Patient underwent right frontal craniotomy for resection of large frontal mass. Intraoperative findings consistent with high-grade glioma. Post-operative course was uneventful. Patient experienced improvement in left-sided weakness from 3/5 to 4+/5. Ambulating independently by POD 3.

IMAGING:
• Pre-op MRI: 4.5cm right frontal mass with edema
• Post-op MRI: Gross total resection with expected post-surgical changes

DISCHARGE CONDITION:
Stable, ambulatory. KPS 80.

DISCHARGE MEDICATIONS:
• Dexamethasone 4mg PO q6h x 5 days, then taper
• Levetiracetam 500mg PO BID
• Famotidine 20mg PO daily
• Continue home medications

FOLLOW-UP:
• Neuro-oncology in 1 week for pathology discussion
• Neurosurgery in 2 weeks for wound check and staple removal
• Radiation oncology consultation as arranged

DISCHARGE INSTRUCTIONS:
• Wound care: keep dry, no soaking
• Activity: light activity as tolerated, no heavy lifting
• Report any seizures, worsening weakness, or wound concerns
```

**What the System Learns**:
- Brain tumor cases typically have oncology follow-up
- KPS scores are commonly documented
- Post-op strength improvement is tracked
- Dexamethasone taper is standard
- Multiple specialist follow-ups needed

---

## Scenario 2: Teaching About Spine Surgery Cases

### Step 2: Add Second Example

**Pathology**: Cervical Stenosis with Myelopathy

**Admission Note**:
```
Patient is a 68-year-old female with progressive gait instability and hand numbness for 6 months. MRI cervical spine shows severe stenosis at C5-6 with cord signal changes consistent with myelopathy.

PMH: Hypothyroidism, Osteoarthritis
PSH: Hysterectomy 2005
Allergies: PCN (rash)
```

**Procedure Note**:
```
Procedure: C5-6 anterior cervical discectomy and fusion (ACDF)
Findings: Severe disc herniation with cord compression
Hardware: Titanium cage and anterior plate
EBL: 50ml
Complications: None
Neuromonitoring: Stable throughout
```

**Completed Discharge Summary**:
```
DISCHARGE SUMMARY

PATIENT INFORMATION:
Age/Sex: 68F
Admission Date: 02/10/2024
Discharge Date: 02/12/2024

DIAGNOSES:
Primary: Cervical myelopathy secondary to stenosis C5-6
Secondary: Post-operative period, s/p ACDF C5-6

PROCEDURES:
1. Anterior cervical discectomy and fusion C5-6 (02/10/2024)

HOSPITAL COURSE:
Patient underwent C5-6 ACDF for symptomatic cervical myelopathy. Procedure was uneventful with stable neuromonitoring. Post-operative neurological exam showed stable hand function and steady gait. Patient ambulated with PT on POD 1. Soft cervical collar fitted. Dysphagia minimal and improving.

IMAGING:
• Pre-op MRI C-spine: Severe stenosis C5-6 with T2 cord signal
• Post-op X-ray C-spine: Good hardware position, appropriate alignment

NEUROLOGICAL EXAM AT DISCHARGE:
• Motor: 5/5 all extremities
• Sensation: Intact to light touch
• Reflexes: 2+ symmetric
• Gait: Steady, no support needed
• Hoffmann sign: Negative bilaterally

DISCHARGE CONDITION:
Stable, ambulatory. mJOA score: 15/18 (improved from 12/18).

DISCHARGE MEDICATIONS:
• Oxycodone 5mg PO q4-6h PRN pain
• Acetaminophen 1000mg PO q6h PRN
• Muscle relaxant PRN
• Continue home medications (Levothyroxine)

DISCHARGE INSTRUCTIONS:
• Soft collar at all times x 6 weeks
• No BLT (bending, lifting, twisting)
• Progressive ambulation encouraged
• Wound care: keep incision dry

FOLLOW-UP:
• Neurosurgery in 2 weeks for wound check
• Neurosurgery in 6 weeks for X-rays and collar removal
• PT referral as arranged
```

**What the System Learns**:
- Spine cases document detailed neurological exams
- Functional scores (mJOA) are important
- BLT restrictions are standard
- Cervical collar duration specified
- Hardware details included

---

## Scenario 3: Teaching About Cases Without Consultants

### Step 3: Add Third Example

**Pathology**: Lumbar Disc Herniation

**Admission Note**:
```
Patient is a 42-year-old male with 3-month history of right leg radicular pain, failed conservative management. MRI shows large L4-5 disc herniation with nerve root compression.
```

**Completed Discharge Summary**:
```
DISCHARGE SUMMARY

PATIENT INFORMATION:
Age/Sex: 42M
Dates: 03/05/2024 - 03/06/2024

DIAGNOSES:
Primary: L4-5 disc herniation with right L5 radiculopathy
Secondary: Post-operative, s/p microdiscectomy

PROCEDURES:
1. Right L4-5 microdiscectomy (03/05/2024)

HOSPITAL COURSE:
Patient underwent uncomplicated right L4-5 microdiscectomy. Immediate post-operative exam showed resolution of pre-operative radicular symptoms. Ambulated same day of surgery. Pain well-controlled. Discharged home POD 1.

DISCHARGE CONDITION:
Ambulatory, independent. Pain improved from 8/10 to 2/10.

DISCHARGE MEDICATIONS:
• Ibuprofen 600mg PO TID with food
• Cyclobenzaprine 10mg PO qHS PRN

ACTIVITY:
• Walking encouraged
• No lifting >10lbs x 2 weeks
• Return to work: desk work in 2 weeks, manual labor in 6 weeks

FOLLOW-UP:
• Neurosurgery clinic in 2 weeks
```

**What the System Learns**:
- Simple cases don't always need consultants
- Pain scores are tracked (pre/post)
- Return to work guidance is specific
- Shorter hospital stays for routine cases
- Less complex medication regimens

---

## Pattern Learning Summary

After adding these 3 examples, the system has learned:

### Structure Patterns
- **Common sections**: Patient Information, Diagnoses, Procedures, Hospital Course, Discharge Condition, Medications, Follow-up
- **Section ordering**: Demographics → Diagnoses → Procedures → Course → Current Status → Medications → Follow-up

### Terminology Patterns
- **Frequently used**: "tolerated procedure well", "uneventful", "stable", "ambulating"
- **Abbreviations**: POD (post-operative day), s/p (status post), PRN (as needed), BID (twice daily)

### Clinical Patterns by Pathology

| Pathology | Consultant Rate | Avg Summary Length | Key Elements |
|-----------|----------------|-------------------|--------------|
| Brain Tumor | 100% | 1400 chars | KPS score, oncology f/u, steroid taper |
| Cervical Myelopathy | 33% | 1600 chars | Neuro exam details, mJOA score, collar |
| Lumbar Disc | 0% | 800 chars | Pain scores, activity restrictions, short stay |

### Formatting Preferences
- **Bullet lists**: 100% (3/3 examples use bullets for medications/imaging)
- **Numbered lists**: 100% (3/3 examples use numbers for procedures)
- **Section spacing**: Double line breaks between sections

---

## How This Improves Future Summaries

When a new patient is entered:

1. **Brain tumor case** → System suggests:
   - Include KPS score
   - Add oncology follow-up
   - Document steroid taper schedule
   - Expect longer summary (~1400 chars)

2. **Spine case** → System suggests:
   - Detailed neurological exam section
   - Include functional score if available
   - Specify BLT restrictions
   - Document hardware details

3. **Simple discectomy** → System suggests:
   - Shorter, focused summary
   - Pain improvement metric
   - Return to work timeline
   - Minimal follow-up needed

---

## Best Practices Demonstrated

✅ **Include various pathologies** - Teaches system different patterns  
✅ **Mix complexity levels** - Simple and complex cases both valuable  
✅ **Vary consultant involvement** - Shows when consultants are/aren't needed  
✅ **Use consistent formatting** - Reinforces preferred style  
✅ **Complete documentation** - All sections filled helps learning  

---

## Privacy Note

Notice that in all examples:
- No real patient names used
- No actual MRN numbers
- Dates can be anonymized
- Only the **structure and patterns** are what matters for learning

The system extracts:
- ✅ "Section called HOSPITAL COURSE exists"
- ✅ "Term 'tolerated procedure well' used frequently"
- ✅ "Brain tumor cases average 1400 characters"

NOT:
- ❌ "Patient named John Smith"
- ❌ "MRN 12345678"
- ❌ "Admitted on January 15, 2024"

This keeps all learning **PHI-free** while still being highly effective!
