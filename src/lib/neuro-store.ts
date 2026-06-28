import { create } from 'zustand';

export type PanelId =
  | 'overview'
  | 'multimodal'
  | 'digital-twin'
  | 'timeline'
  | 'drug-simulator'
  | 'explainable-ai'
  | 'brain-network'
  | 'research-copilot'
  | 'synthetic-patients'
  | 'datasets'
  | 'audit-log';

interface PatientData {
  id: string;
  name: string;
  age: number;
  sex: string;
  mriScore: number;
  geneticRisk: number;
  bloodBiomarkers: { tau: number; amyloid: number; nfL: number };
  speechScore: number;
  sleepQuality: number;
  activityLevel: number;
  cognitiveScore: number;
  brainAge: number;
  clinicalNotes: string;
}

interface NeuroStore {
  activePanel: PanelId;
  setActivePanel: (panel: PanelId) => void;
  selectedPatient: PatientData | null;
  setSelectedPatient: (patient: PatientData) => void;
  isSimulating: boolean;
  setIsSimulating: (v: boolean) => void;
  patients: PatientData[];
  loadingState: Record<string, boolean>;
  setLoading: (key: string, v: boolean) => void;
  datasetStatus: Record<string, 'connected' | 'syncing' | 'disconnected'>;
  setDatasetStatus: (id: string, status: 'connected' | 'syncing' | 'disconnected') => void;
}

export const mockPatients: PatientData[] = [
  {
    id: 'PT-001',
    name: 'Eleanor Mitchell',
    age: 68,
    sex: 'Female',
    mriScore: 72,
    geneticRisk: 0.78,
    bloodBiomarkers: { tau: 42, amyloid: 180, nfL: 28 },
    speechScore: 85,
    sleepQuality: 54,
    activityLevel: 40,
    cognitiveScore: 24,
    brainAge: 78,
    clinicalNotes: 'Early-stage MCI. APOE ε4 carrier. Progressive memory complaints over 18 months.',
  },
  {
    id: 'PT-002',
    name: 'Robert Chen',
    age: 74,
    sex: 'Male',
    mriScore: 58,
    geneticRisk: 0.92,
    bloodBiomarkers: { tau: 68, amyloid: 240, nfL: 45 },
    speechScore: 62,
    sleepQuality: 38,
    activityLevel: 22,
    cognitiveScore: 18,
    brainAge: 89,
    clinicalNotes: 'Moderate AD. Rapid decline in past 6 months. On Donepezil 10mg.',
  },
  {
    id: 'PT-003',
    name: 'Maria Garcia',
    age: 62,
    sex: 'Female',
    mriScore: 88,
    geneticRisk: 0.34,
    bloodBiomarkers: { tau: 18, amyloid: 95, nfL: 12 },
    speechScore: 96,
    sleepQuality: 78,
    activityLevel: 82,
    cognitiveScore: 29,
    brainAge: 59,
    clinicalNotes: 'Healthy control. No cognitive complaints. Normal biomarker profile.',
  },
  {
    id: 'PT-004',
    name: 'James Thompson',
    age: 71,
    sex: 'Male',
    mriScore: 65,
    geneticRisk: 0.65,
    bloodBiomarkers: { tau: 52, amyloid: 210, nfL: 35 },
    speechScore: 74,
    sleepQuality: 45,
    activityLevel: 35,
    cognitiveScore: 21,
    brainAge: 82,
    clinicalNotes: 'Mild AD. Slow progression. Excellent response to current therapy.',
  },
  {
    id: 'PT-245',
    name: 'Hiroshi Tanaka',
    age: 76,
    sex: 'Male',
    mriScore: 48,
    geneticRisk: 0.88,
    bloodBiomarkers: { tau: 75, amyloid: 260, nfL: 52 },
    speechScore: 55,
    sleepQuality: 32,
    activityLevel: 18,
    cognitiveScore: 15,
    brainAge: 92,
    clinicalNotes: 'Moderate-to-severe AD. Lewy body co-pathology suspected. Non-responder to ChEI.',
  },
];

export const useNeuroStore = create<NeuroStore>((set) => ({
  activePanel: 'overview',
  setActivePanel: (panel) => set({ activePanel: panel }),
  selectedPatient: mockPatients[0],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  isSimulating: false,
  setIsSimulating: (v) => set({ isSimulating: v }),
  patients: mockPatients,
  loadingState: {},
  setLoading: (key, v) =>
    set((s) => ({ loadingState: { ...s.loadingState, [key]: v } })),
  datasetStatus: {
    adni: 'connected',
    oasis: 'connected',
    ukbiobank: 'syncing',
    nacc: 'disconnected',
  },
  setDatasetStatus: (id, status) =>
    set((s) => ({ datasetStatus: { ...s.datasetStatus, [id]: status } })),
}));