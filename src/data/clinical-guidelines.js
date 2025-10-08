export const clinicalGuidelines = {
  sah: {
    bloodPressure: { 
      target: 'Maintain SBP <160 mmHg until aneurysm secured', 
      evidence: 'Class I, Level B',
      medication: 'Nicardipine or labetalol preferred'
    },
    nimodipine: { 
      dose: '60mg PO q4h x 21 days', 
      reason: 'Vasospasm prevention - reduces poor outcomes by 40%', 
      evidence: 'Class I, Level A',
      nnt: '13'
    },
    seizureProphylaxis: { 
      drug: 'Levetiracetam 1000mg BID x 7 days',
      indication: 'Consider in immediate post-hemorrhage period',
      evidence: 'Class IIb, Level B' 
    },
    monitoring: { 
      tcd: 'Daily transcranial Dopplers from day 3-14',
      reason: 'Vasospasm detection',
      evidence: 'Class IIa, Level B',
      threshold: 'MCA velocity >120 cm/s suggests vasospasm'
    }
  },
  spine: {
    antibiotics: { 
      drug: 'Cefazolin 2g IV (3g if >120kg)', 
      timing: 'Within 60 minutes of incision',
      redosing: 'Every 4 hours if procedure >4 hours',
      duration: 'Discontinue within 24 hours',
      evidence: 'Strong recommendation, High quality evidence'
    },
    vte: { 
      drug: 'Enoxaparin 40mg SQ daily or Heparin 5000u SQ BID',
      start: 'POD#1 if no bleeding',
      duration: 'Until fully ambulatory',
      evidence: 'Strong recommendation, Moderate quality' 
    }
  },
  seizure: {
    tbi: {
      indication: 'Severe TBI (GCS <9), penetrating injury, SDH, contusion',
      medication: 'Levetiracetam 1000mg BID preferred over phenytoin',
      duration: '7 days',
      evidence: 'Level A recommendation'
    }
  }
};