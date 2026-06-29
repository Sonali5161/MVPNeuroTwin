import { create } from 'zustand';

export type TrialPhase = 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'Pilot';
export type TrialStatus = 'recruiting' | 'active' | 'completed' | 'paused' | 'terminated';
export type EnrollmentStatus = 'screening' | 'eligible' | 'enrolled' | 'active-treatment' | 'follow-up' | 'completed' | 'withdrawn' | 'screen-fail';

export interface TrialCohort {
  id: string;
  name: string;
  criteria: string[];
  targetSize: number;
  enrolled: number;
  arm: string; // e.g. 'Treatment A', 'Placebo'
}

export interface TrialParticipant {
  patientId: string;
  name: string;
  age: number;
  sex: string;
  cohortId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  site: string;
  lastVisit: string;
  mmseBaseline: number;
  mmseLatest: number;
  change: number;
  adverseEvents: number;
  daysInTrial: number;
}

export interface AdverseEvent {
  id: string;
  patientId: string;
  patientName: string;
  trialId: string;
  eventDate: string;
  reportedDate: string;
  type: 'serious' | 'non-serious' | 'mild' | 'moderate' | 'severe';
  category: string;
  description: string;
  action: string;
  outcome: 'resolved' | 'ongoing' | 'fatal' | 'unknown';
  causality: 'definite' | 'probable' | 'possible' | 'unlikely' | 'unrelated';
  severity: number; // 1-5 CTCAE grade
}

export interface ProtocolCheck {
  id: string;
  protocolId: string;
  checkpoint: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  complianceRate: number;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  items: { label: string; met: boolean }[];
}

export interface ClinicalTrial {
  id: string;
  name: string;
  sponsor: string;
  phase: TrialPhase;
  status: TrialStatus;
  indication: string;
  intervention: string;
  startDate: string;
  endDate: string;
  principalInvestigator: string;
  sites: number;
  targetEnrollment: number;
  currentEnrollment: number;
  cohorts: TrialCohort[];
  participants: TrialParticipant[];
  adverseEvents: AdverseEvent[];
  protocolChecks: ProtocolCheck[];
  keyEndpoints: { name: string; target: string; current: string; unit: string }[];
}

const trialParticipants: TrialParticipant[] = [
  { patientId: 'PT-001', name: 'Eleanor Mitchell', age: 68, sex: 'Female', cohortId: 'LEC-A', status: 'active-treatment', enrolledAt: '2026-02-01', site: 'Mayo Clinic', lastVisit: '2026-06-28', mmseBaseline: 25, mmseLatest: 24, change: -1, adverseEvents: 1, daysInTrial: 148 },
  { patientId: 'PT-002', name: 'Robert Chen', age: 74, sex: 'Male', cohortId: 'LEC-A', status: 'active-treatment', enrolledAt: '2026-01-15', site: 'Mass General', lastVisit: '2026-06-27', mmseBaseline: 20, mmseLatest: 18, change: -2, adverseEvents: 2, daysInTrial: 165 },
  { patientId: 'PT-004', name: 'James Thompson', age: 71, sex: 'Male', cohortId: 'PLC-B', status: 'active-treatment', enrolledAt: '2026-03-01', site: 'Mayo Clinic', lastVisit: '2026-06-26', mmseBaseline: 22, mmseLatest: 21, change: -1, adverseEvents: 0, daysInTrial: 120 },
  { patientId: 'PT-245', name: 'Hiroshi Tanaka', age: 76, sex: 'Male', cohortId: 'LEC-B', status: 'follow-up', enrolledAt: '2025-11-01', site: 'Johns Hopkins', lastVisit: '2026-06-29', mmseBaseline: 17, mmseLatest: 15, change: -2, adverseEvents: 3, daysInTrial: 240 },
  { patientId: 'PT-050', name: 'Patricia Lee', age: 70, sex: 'Female', cohortId: 'LEC-A', status: 'active-treatment', enrolledAt: '2026-02-15', site: 'Mayo Clinic', lastVisit: '2026-06-25', mmseBaseline: 23, mmseLatest: 23, change: 0, adverseEvents: 0, daysInTrial: 134 },
  { patientId: 'PT-078', name: 'Michael Scott', age: 67, sex: 'Male', cohortId: 'PLC-B', status: 'active-treatment', enrolledAt: '2026-03-10', site: 'Mass General', lastVisit: '2026-06-24', mmseBaseline: 24, mmseLatest: 22, change: -2, adverseEvents: 1, daysInTrial: 111 },
  { patientId: 'PT-089', name: 'Linda Williams', age: 73, sex: 'Female', cohortId: 'LEC-B', status: 'screening', enrolledAt: '2026-06-28', site: 'Johns Hopkins', lastVisit: '2026-06-28', mmseBaseline: 0, mmseLatest: 0, change: 0, adverseEvents: 0, daysInTrial: 1 },
  { patientId: 'PT-092', name: 'George Davis', age: 75, sex: 'Male', cohortId: 'LEC-A', status: 'withdrawn', enrolledAt: '2026-01-20', site: 'Mayo Clinic', lastVisit: '2026-05-15', mmseBaseline: 21, mmseLatest: 19, change: -2, adverseEvents: 4, daysInTrial: 115 },
  { patientId: 'PT-110', name: 'Susan Clark', age: 64, sex: 'Female', cohortId: 'PLC-B', status: 'active-treatment', enrolledAt: '2026-04-01', site: 'Mass General', lastVisit: '2026-06-28', mmseBaseline: 26, mmseLatest: 25, change: -1, adverseEvents: 0, daysInTrial: 89 },
  { patientId: 'PT-156', name: 'Richard Taylor', age: 72, sex: 'Male', cohortId: 'LEC-B', status: 'active-treatment', enrolledAt: '2026-02-20', site: 'Johns Hopkins', lastVisit: '2026-06-27', mmseBaseline: 19, mmseLatest: 18, change: -1, adverseEvents: 1, daysInTrial: 129 },
];

export const mockAdverseEvents: AdverseEvent[] = [
  { id: 'AE-001', patientId: 'PT-245', patientName: 'Hiroshi Tanaka', trialId: 'TR-001', eventDate: '2026-06-20', reportedDate: '2026-06-20', type: 'serious', category: 'ARIA-E (Edema)', description: 'Asymptomatic ARIA-E detected on follow-up MRI. Moderate vasogenic edema in left temporal lobe.', action: 'Lecanemab dose held for 4 weeks. MRI monitoring weekly.', outcome: 'ongoing', causality: 'probable', severity: 3 },
  { id: 'AE-002', patientId: 'PT-002', patientName: 'Robert Chen', trialId: 'TR-001', eventDate: '2026-06-15', reportedDate: '2026-06-16', type: 'non-serious', category: 'ARIA-H (Microhemorrhage)', description: '2 small foci of ARIA-H on susceptibility-weighted MRI. Asymptomatic.', action: 'Continued treatment with enhanced MRI monitoring.', outcome: 'ongoing', causality: 'possible', severity: 1 },
  { id: 'AE-003', patientId: 'PT-001', patientName: 'Eleanor Mitchell', trialId: 'TR-001', eventDate: '2026-06-10', reportedDate: '2026-06-11', type: 'mild', category: 'Infusion Reaction', description: 'Mild infusion-related reaction during 4th dose. Flushing and pruritus resolved with antihistamine.', action: 'Pre-medication with diphenhydramine added. Slower infusion rate.', outcome: 'resolved', causality: 'probable', severity: 2 },
  { id: 'AE-004', patientId: 'PT-092', patientName: 'George Davis', trialId: 'TR-001', eventDate: '2026-04-28', reportedDate: '2026-04-28', type: 'serious', category: 'Fall with Injury', description: 'Fall resulting in wrist fracture. Patient withdrawn per protocol.', action: 'Withdrawal from trial. Orthopedic referral.', outcome: 'resolved', causality: 'unlikely', severity: 3 },
  { id: 'AE-005', patientId: 'PT-078', patientName: 'Michael Scott', trialId: 'TR-001', eventDate: '2026-06-18', reportedDate: '2026-06-19', type: 'mild', category: 'Headache', description: 'Moderate headache post-infusion, lasting 4 hours. No neurological deficits.', action: 'Acetaminophen PRN. Continued treatment.', outcome: 'resolved', causality: 'possible', severity: 1 },
  { id: 'AE-006', patientId: 'PT-245', patientName: 'Hiroshi Tanaka', trialId: 'TR-001', eventDate: '2026-05-10', reportedDate: '2026-05-10', type: 'serious', category: 'ARIA-E Recurrence', description: 'ARIA-E recurrence after rechallenge. Larger area of edema involving bilateral temporal lobes.', action: 'Permanent treatment discontinuation. MRI monitoring continued.', outcome: 'ongoing', causality: 'definite', severity: 4 },
  { id: 'AE-007', patientId: 'PT-002', patientName: 'Robert Chen', trialId: 'TR-001', eventDate: '2026-05-25', reportedDate: '2026-05-26', type: 'mild', category: 'Nausea', description: 'Intermittent nausea over 3 days. Managed with ondansetron.', action: 'Supportive care. No dose adjustment.', outcome: 'resolved', causality: 'unlikely', severity: 1 },
];

export const mockTrials: ClinicalTrial[] = [
  {
    id: 'TR-001',
    name: 'LEARN-AD: Lecanemab Real-World Outcomes',
    sponsor: 'NeuroTwin AI Research Consortium',
    phase: 'Phase IV',
    status: 'active',
    indication: 'Early Alzheimer\'s Disease (MCI due to AD / Mild AD)',
    intervention: 'Lecanemab 10 mg/kg IV biweekly',
    startDate: '2026-01-15',
    endDate: '2028-01-15',
    principalInvestigator: 'Dr. Sarah Mitchell',
    sites: 3,
    targetEnrollment: 200,
    currentEnrollment: 10,
    cohorts: [
      { id: 'LEC-A', name: 'Lecanemab + Standard Care', criteria: ['MMSE 20-27', 'Amyloid positive', 'APOE any genotype'], targetSize: 100, enrolled: 4, arm: 'Treatment' },
      { id: 'LEC-B', name: 'Lecanemab + AI-Optimized Therapy', criteria: ['MMSE 15-27', 'Amyloid positive', 'Multi-modal data available'], targetSize: 50, enrolled: 3, arm: 'Treatment + AI' },
      { id: 'PLC-B', name: 'Standard Care (Placebo-Controlled)', criteria: ['MMSE 20-27', 'Amyloid positive', 'No contra-indications'], targetSize: 50, enrolled: 3, arm: 'Control' },
    ],
    participants: trialParticipants,
    adverseEvents: mockAdverseEvents,
    protocolChecks: [
      { id: 'PC-001', protocolId: 'TR-001', checkpoint: 'MRI Safety Monitoring', frequency: 'Every 6 infusions', lastCompleted: '2026-06-28', nextDue: '2026-08-25', complianceRate: 98, status: 'compliant', items: [
        { label: 'ARIA screening completed', met: true },
        { label: 'Radiologist sign-off', met: true },
        { label: 'PI notification within 24h', met: true },
      ]},
      { id: 'PC-002', protocolId: 'TR-001', checkpoint: 'Cognitive Assessment (MMSE)', frequency: 'Every 3 months', lastCompleted: '2026-06-15', nextDue: '2026-09-15', complianceRate: 95, status: 'compliant', items: [
        { label: 'MMSE administered', met: true },
        { label: 'ADAS-Cog administered', met: true },
        { label: 'Results entered in EDC', met: true },
      ]},
      { id: 'PC-003', protocolId: 'TR-001', checkpoint: 'Blood Biomarker Collection', frequency: 'Every 6 months', lastCompleted: '2026-06-20', nextDue: '2026-12-20', complianceRate: 88, status: 'at-risk', items: [
        { label: 'p-tau181 collected', met: true },
        { label: 'p-tau217 collected', met: true },
        { label: 'Aβ42/40 ratio', met: false },
        { label: 'NfL collected', met: true },
      ]},
      { id: 'PC-004', protocolId: 'TR-001', checkpoint: 'Informed Consent Re-verification', frequency: 'Annually', lastCompleted: '2026-01-15', nextDue: '2027-01-15', complianceRate: 100, status: 'compliant', items: [
        { label: 'Consent reviewed with patient', met: true },
        { label: 'Updated consent signed', met: true },
      ]},
      { id: 'PC-005', protocolId: 'TR-001', checkpoint: 'Wearable Data Compliance', frequency: 'Continuous', lastCompleted: '2026-06-29', nextDue: '2026-06-30', complianceRate: 72, status: 'at-risk', items: [
        { label: 'Device worn ≥18hr/day', met: false },
        { label: 'Sleep data ≥5 nights/week', met: true },
        { label: 'Step count data valid', met: true },
        { label: 'HR data streaming', met: false },
      ]},
    ],
    keyEndpoints: [
      { name: 'Change in CDR-SB', target: '≤0.5 at 18mo', current: '0.32 avg', unit: 'points' },
      { name: 'MMSE Decline Rate', target: '<1.5 pts/year', current: '0.8 pts/year', unit: 'points/year' },
      { name: 'Amyloid Reduction', target: '>40% from baseline', current: '52% avg', unit: 'percent' },
      { name: 'ARIA Incidence', target: '<20%', current: '12.5%', unit: 'percent' },
    ],
  },
  {
    id: 'TR-002',
    name: 'COG-ENHANCE: Digital Cognitive Rehabilitation',
    sponsor: 'NIH / NIA Grant R01AG082341',
    phase: 'Pilot',
    status: 'recruiting',
    indication: 'Mild Cognitive Impairment',
    intervention: 'AI-adaptive cognitive training + wearable monitoring',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    principalInvestigator: 'Dr. Sarah Mitchell',
    sites: 2,
    targetEnrollment: 60,
    currentEnrollment: 0,
    cohorts: [
      { id: 'COG-A', name: 'AI-Adaptive Training', criteria: ['MMSE 24-30', 'Subjective cognitive decline', 'Smartphone-capable'], targetSize: 30, enrolled: 0, arm: 'Intervention' },
      { id: 'COG-B', name: 'Standard Computer Training', criteria: ['MMSE 24-30', 'Subjective cognitive decline'], targetSize: 30, enrolled: 0, arm: 'Active Control' },
    ],
    participants: [],
    adverseEvents: [],
    protocolChecks: [],
    keyEndpoints: [
      { name: 'Cognitive Composite Score', target: '+3 points', current: '-', unit: 'points' },
      { name: 'Daily Function (ADL)', target: 'No decline', current: '-', unit: 'score' },
    ],
  },
];

interface TrialStore {
  trials: ClinicalTrial[];
  selectedTrial: ClinicalTrial | null;
  setSelectedTrial: (t: ClinicalTrial | null) => void;
  activeSubTab: 'trials' | 'enrollment' | 'outcomes' | 'adverse-events' | 'compliance';
  setActiveSubTab: (t: TrialStore['activeSubTab']) => void;
  enrollPatient: (trialId: string, patientId: string, cohortId: string) => void;
  withdrawPatient: (trialId: string, patientId: string) => void;
  addAdverseEvent: (trialId: string, event: AdverseEvent) => void;
  resolveAdverseEvent: (trialId: string, eventId: string, outcome: AdverseEvent['outcome']) => void;
  cohortFilter: string;
  setCohortFilter: (c: string) => void;
  statusFilter: EnrollmentStatus | 'all';
  setStatusFilter: (s: EnrollmentStatus | 'all') => void;
}

export const useTrialStore = create<TrialStore>((set, get) => ({
  trials: mockTrials,
  selectedTrial: null,
  setSelectedTrial: (t) => set({ selectedTrial: t }),
  activeSubTab: 'trials',
  setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
  enrollPatient: (trialId, patientId, cohortId) => set((s) => ({
    trials: s.trials.map((t) => t.id === trialId ? {
      ...t,
      currentEnrollment: t.currentEnrollment + 1,
      cohorts: t.cohorts.map((c) => c.id === cohortId ? { ...c, enrolled: c.enrolled + 1 } : c),
      participants: [...t.participants, {
        patientId, name: `Patient ${patientId}`, age: 70, sex: 'Unknown', cohortId,
        status: 'screening' as EnrollmentStatus, enrolledAt: new Date().toISOString().split('T')[0],
        site: 'Mayo Clinic', lastVisit: '-', mmseBaseline: 0, mmseLatest: 0, change: 0, adverseEvents: 0, daysInTrial: 0,
      }],
    } : t),
  })),
  withdrawPatient: (trialId, patientId) => set((s) => ({
    trials: s.trials.map((t) => t.id === trialId ? {
      ...t, currentEnrollment: t.currentEnrollment - 1,
      participants: t.participants.map((p) => p.patientId === patientId ? { ...p, status: 'withdrawn' as EnrollmentStatus } : p),
    } : t),
  })),
  addAdverseEvent: (trialId, event) => set((s) => ({
    trials: s.trials.map((t) => t.id === trialId ? { ...t, adverseEvents: [event, ...t.adverseEvents] } : t),
  })),
  resolveAdverseEvent: (trialId, eventId, outcome) => set((s) => ({
    trials: s.trials.map((t) => t.id === trialId ? {
      ...t, adverseEvents: t.adverseEvents.map((e) => e.id === eventId ? { ...e, outcome, type: 'mild' as const } : e),
    } : t),
  })),
  cohortFilter: 'all',
  setCohortFilter: (cohortFilter) => set({ cohortFilter }),
  statusFilter: 'all',
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));