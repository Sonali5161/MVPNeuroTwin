import { create } from 'zustand';

export type OnboardingStep = 'demographics' | 'medical-history' | 'data-upload' | 'consent' | 'review' | 'completed';
export type ConsentStatus = 'pending' | 'signed' | 'expired' | 'revoked';
export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface UploadedFile {
  id: string;
  name: string;
  type: 'DICOM' | 'CSV' | 'JSON' | 'PDF' | 'NIfTI';
  size: string;
  status: UploadStatus;
  uploadedAt: string;
 modality?: string;
 records?: number;
}

export interface ConsentRecord {
  id: string;
  type: 'research' | 'treatment' | 'data-sharing' | 'clinical-trial' | 'family-access';
  status: ConsentStatus;
  signedAt?: string;
  expiresAt?: string;
  version: string;
 documentName: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'spouse' | 'child' | 'sibling' | 'caregiver' | 'legal-guardian' | 'other';
  email: string;
  phone: string;
  accessLevel: 'full' | 'limited' | 'view-only';
  hasConsent: boolean;
  lastLogin?: string;
  notifications: 'realtime' | 'daily-digest' | 'weekly';
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    sex: string;
    ethnicity: string;
    education: string;
    phone: string;
    emergencyContact: string;
  };
  medicalHistory: {
    primaryDiagnosis: string;
    diagnosisDate: string;
    stage: string;
    comorbidities: string[];
    currentMedications: string[];
    pastTreatments: string[];
    familyHistory: string;
    allergies: string[];
  };
  isSubmitting: boolean;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  sex: string;
  status: 'active' | 'onboarding' | 'inactive' | 'discharged' | 'deceased';
  diagnosis: string;
  stage: string;
  enrolledAt: string;
  lastVisit: string;
  nextAppointment: string;
  primaryClinician: string;
  uploadedFiles: UploadedFile[];
  consents: ConsentRecord[];
  familyMembers: FamilyMember[];
  onboardingComplete: boolean;
  dataCompleteness: number; // 0-100
  riskScore: number;
  mmse: number;
  cdr: number;
}

const mockUploadedFiles: UploadedFile[] = [
  { id: 'UF-001', name: 'T1w_MRI_2026-06.nii.gz', type: 'NIfTI', size: '178.4 MB', status: 'completed', uploadedAt: '2026-06-15T10:30:00Z', modality: 'MRI', records: 1 },
  { id: 'UF-002', name: 'T2_FLAIR_2026-06.dcm.zip', type: 'DICOM', size: '245.2 MB', status: 'completed', uploadedAt: '2026-06-15T10:32:00Z', modality: 'MRI', records: 186 },
  { id: 'UF-003', name: 'blood_biomarkers_2026-06.csv', type: 'CSV', size: '24.8 KB', status: 'completed', uploadedAt: '2026-06-20T14:15:00Z', modality: 'Blood', records: 42 },
  { id: 'UF-004', name: 'genetic_report_WGS.json', type: 'JSON', size: '8.2 MB', status: 'completed', uploadedAt: '2026-05-28T09:00:00Z', modality: 'Genetics', records: 1 },
  { id: 'UF-005', name: 'speech_recording_visit4.wav', type: 'DICOM', size: '12.6 MB', status: 'completed', uploadedAt: '2026-06-25T16:00:00Z', modality: 'Speech', records: 1 },
];

const mockConsents: ConsentRecord[] = [
  { id: 'CON-001', type: 'research', status: 'signed', signedAt: '2026-01-15T10:00:00Z', expiresAt: '2028-01-15T10:00:00Z', version: 'v3.1', documentName: 'Research Participation Consent' },
  { id: 'CON-002', type: 'data-sharing', status: 'signed', signedAt: '2026-01-15T10:00:00Z', expiresAt: '2028-01-15T10:00:00Z', version: 'v2.4', documentName: 'De-identified Data Sharing Agreement' },
  { id: 'CON-003', type: 'treatment', status: 'signed', signedAt: '2026-02-01T09:30:00Z', expiresAt: '2027-02-01T09:30:00Z', version: 'v1.8', documentName: 'AI-Assisted Treatment Consent' },
  { id: 'CON-004', type: 'clinical-trial', status: 'pending', version: 'v4.0', documentName: 'Lecanemab Phase IV Trial Consent' },
  { id: 'CON-005', type: 'family-access', status: 'signed', signedAt: '2026-03-10T11:00:00Z', expiresAt: '2027-03-10T11:00:00Z', version: 'v1.2', documentName: 'Family Member Data Access Authorization' },
];

const mockFamilyMembers: FamilyMember[] = [
  { id: 'FM-001', name: 'David Mitchell', relationship: 'spouse', email: 'david.m@email.com', phone: '+1-555-0142', accessLevel: 'limited', hasConsent: true, lastLogin: '2026-06-29T07:30:00Z', notifications: 'daily-digest' },
  { id: 'FM-002', name: 'Jennifer Mitchell', relationship: 'child', email: 'jenny.m@email.com', phone: '+1-555-0198', accessLevel: 'view-only', hasConsent: true, lastLogin: '2026-06-28T19:00:00Z', notifications: 'weekly' },
];

export const mockPatientRecords: PatientRecord[] = [
  {
    id: 'PT-001', name: 'Eleanor Mitchell', age: 68, sex: 'Female', status: 'active',
    diagnosis: 'Mild Cognitive Impairment (MCI)', stage: 'MCI', enrolledAt: '2026-01-15',
    lastVisit: '2026-06-28', nextAppointment: '2026-07-15', primaryClinician: 'Dr. James Chen',
    uploadedFiles: mockUploadedFiles, consents: mockConsents, familyMembers: mockFamilyMembers,
    onboardingComplete: true, dataCompleteness: 87, riskScore: 0.72, mmse: 24, cdr: 0.5,
  },
  {
    id: 'PT-002', name: 'Robert Chen', age: 74, sex: 'Male', status: 'active',
    diagnosis: 'Moderate Alzheimer\'s Disease', stage: 'Moderate AD', enrolledAt: '2025-08-20',
    lastVisit: '2026-06-27', nextAppointment: '2026-07-04', primaryClinician: 'Dr. James Chen',
    uploadedFiles: mockUploadedFiles.slice(0, 4), consents: mockConsents.slice(0, 3), familyMembers: [mockFamilyMembers[0]],
    onboardingComplete: true, dataCompleteness: 92, riskScore: 0.89, mmse: 18, cdr: 1.0,
  },
  {
    id: 'PT-003', name: 'Maria Garcia', age: 62, sex: 'Female', status: 'active',
    diagnosis: 'Healthy Control', stage: 'Normal', enrolledAt: '2026-03-01',
    lastVisit: '2026-06-25', nextAppointment: '2026-09-01', primaryClinician: 'Dr. Sarah Mitchell',
    uploadedFiles: mockUploadedFiles.slice(0, 3), consents: mockConsents.slice(0, 2), familyMembers: [],
    onboardingComplete: true, dataCompleteness: 78, riskScore: 0.12, mmse: 29, cdr: 0,
  },
  {
    id: 'PT-004', name: 'James Thompson', age: 71, sex: 'Male', status: 'active',
    diagnosis: 'Mild Alzheimer\'s Disease', stage: 'Mild AD', enrolledAt: '2025-11-10',
    lastVisit: '2026-06-26', nextAppointment: '2026-07-10', primaryClinician: 'Dr. James Chen',
    uploadedFiles: mockUploadedFiles.slice(0, 4), consents: mockConsents.slice(0, 4), familyMembers: [mockFamilyMembers[0]],
    onboardingComplete: true, dataCompleteness: 95, riskScore: 0.65, mmse: 21, cdr: 1.0,
  },
  {
    id: 'PT-245', name: 'Hiroshi Tanaka', age: 76, sex: 'Male', status: 'active',
    diagnosis: 'Moderate-to-Severe Alzheimer\'s Disease', stage: 'Moderate-Severe AD', enrolledAt: '2025-06-15',
    lastVisit: '2026-06-29', nextAppointment: '2026-07-02', primaryClinician: 'Dr. Sarah Mitchell',
    uploadedFiles: mockUploadedFiles, consents: mockConsents.slice(0, 3), familyMembers: [mockFamilyMembers[0], mockFamilyMembers[1]],
    onboardingComplete: true, dataCompleteness: 84, riskScore: 0.94, mmse: 15, cdr: 2.0,
  },
  {
    id: 'PT-300', name: 'Alice Park', age: 65, sex: 'Female', status: 'onboarding',
    diagnosis: 'Pending Assessment', stage: 'Unknown', enrolledAt: '2026-06-28',
    lastVisit: '-', nextAppointment: '2026-07-01', primaryClinician: 'Dr. James Chen',
    uploadedFiles: [], consents: [], familyMembers: [],
    onboardingComplete: false, dataCompleteness: 12, riskScore: 0, mmse: 0, cdr: 0,
  },
  {
    id: 'PT-301', name: 'William Brown', age: 69, sex: 'Male', status: 'onboarding',
    diagnosis: 'Pending Assessment', stage: 'Unknown', enrolledAt: '2026-06-29',
    lastVisit: '-', nextAppointment: '2026-07-03', primaryClinician: 'Dr. Sarah Mitchell',
    uploadedFiles: [mockUploadedFiles[3]], consents: [mockConsents[0]], familyMembers: [],
    onboardingComplete: false, dataCompleteness: 25, riskScore: 0, mmse: 0, cdr: 0,
  },
  {
    id: 'PT-102', name: 'Ruth Anderson', age: 82, sex: 'Female', status: 'discharged',
    diagnosis: 'Severe Alzheimer\'s Disease', stage: 'Severe AD', enrolledAt: '2024-03-15',
    lastVisit: '2026-05-20', nextAppointment: '-', primaryClinician: 'Dr. James Chen',
    uploadedFiles: mockUploadedFiles, consents: mockConsents.slice(0, 3).map(c => ({ ...c, status: 'expired' as const })), familyMembers: [mockFamilyMembers[0]],
    onboardingComplete: true, dataCompleteness: 91, riskScore: 0.97, mmse: 8, cdr: 3.0,
  },
];

const onboardingSteps: OnboardingStep[] = ['demographics', 'medical-history', 'data-upload', 'consent', 'review', 'completed'];

interface PatientMgmtStore {
  patients: PatientRecord[];
  selectedPatientRecord: PatientRecord | null;
  setSelectedPatientRecord: (p: PatientRecord | null) => void;
  onboardingState: OnboardingState;
  setOnboardingStep: (step: OnboardingStep) => void;
  updateDemographics: (d: Partial<OnboardingState['demographics']>) => void;
  updateMedicalHistory: (d: Partial<OnboardingState['medicalHistory']>) => void;
  submitOnboarding: () => Promise<void>;
  addUploadedFile: (file: UploadedFile) => void;
  updateConsent: (patientId: string, consentId: string, status: ConsentStatus) => void;
  addFamilyMember: (patientId: string, member: FamilyMember) => void;
  removeFamilyMember: (patientId: string, memberId: string) => void;
  updateFamilyAccess: (patientId: string, memberId: string, accessLevel: FamilyMember['accessLevel']) => void;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
  clearComparison: () => void;
  filterStatus: 'all' | 'active' | 'onboarding' | 'inactive' | 'discharged';
  setFilterStatus: (s: PatientMgmtStore['filterStatus']) => void;
  activeSubTab: 'patients' | 'onboarding' | 'consent' | 'family-portal' | 'comparison';
  setActiveSubTab: (t: PatientMgmtStore['activeSubTab']) => void;
}

const emptyOnboarding: OnboardingState = {
  currentStep: 'demographics',
  demographics: { firstName: '', lastName: '', dateOfBirth: '', sex: '', ethnicity: '', education: '', phone: '', emergencyContact: '' },
  medicalHistory: { primaryDiagnosis: '', diagnosisDate: '', stage: '', comorbidities: [], currentMedications: [], pastTreatments: [], familyHistory: '', allergies: [] },
  isSubmitting: false,
};

export const usePatientMgmtStore = create<PatientMgmtStore>((set, get) => ({
  patients: mockPatientRecords,
  selectedPatientRecord: null,
  setSelectedPatientRecord: (p) => set({ selectedPatientRecord: p }),
  onboardingState: emptyOnboarding,
  setOnboardingStep: (step) => set((s) => ({ onboardingState: { ...s.onboardingState, currentStep: step } })),
  updateDemographics: (d) => set((s) => ({ onboardingState: { ...s.onboardingState, demographics: { ...s.onboardingState.demographics, ...d } } })),
  updateMedicalHistory: (d) => set((s) => ({ onboardingState: { ...s.onboardingState, medicalHistory: { ...s.onboardingState.medicalHistory, ...d } } })),
  submitOnboarding: async () => {
    set((s) => ({ onboardingState: { ...s.onboardingState, isSubmitting: true } }));
    await new Promise((r) => setTimeout(r, 2000));
    const st = get().onboardingState;
    const newPatient: PatientRecord = {
      id: `PT-${300 + get().patients.length + 1}`,
      name: `${st.demographics.firstName} ${st.demographics.lastName}`,
      age: 2026 - parseInt(st.demographics.dateOfBirth.split('-')[0] || '1950'),
      sex: st.demographics.sex,
      status: 'active',
      diagnosis: st.medicalHistory.primaryDiagnosis,
      stage: st.medicalHistory.stage,
      enrolledAt: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: '-',
      primaryClinician: 'Dr. James Chen',
      uploadedFiles: [], consents: [], familyMembers: [],
      onboardingComplete: true, dataCompleteness: 30, riskScore: 0.5, mmse: 0, cdr: 0,
    };
    set((s) => ({
      patients: [newPatient, ...s.patients],
      onboardingState: { ...emptyOnboarding, currentStep: 'completed' },
    }));
  },
  addUploadedFile: (file) => set((s) => {
    if (!s.selectedPatientRecord) return s;
    const updated = s.patients.map((p) => p.id === s.selectedPatientRecord?.id ? { ...p, uploadedFiles: [...p.uploadedFiles, file] } : p);
    return { patients: updated, selectedPatientRecord: updated.find((p) => p.id === s.selectedPatientRecord?.id) || null };
  }),
  updateConsent: (patientId, consentId, status) => set((s) => ({
    patients: s.patients.map((p) => p.id === patientId ? {
      ...p, consents: p.consents.map((c) => c.id === consentId ? { ...c, status, signedAt: status === 'signed' ? new Date().toISOString() : c.signedAt } : c),
    } : p),
  })),
  addFamilyMember: (patientId, member) => set((s) => ({
    patients: s.patients.map((p) => p.id === patientId ? { ...p, familyMembers: [...p.familyMembers, member] } : p),
  })),
  removeFamilyMember: (patientId, memberId) => set((s) => ({
    patients: s.patients.map((p) => p.id === patientId ? { ...p, familyMembers: p.familyMembers.filter((m) => m.id !== memberId) } : p),
  })),
  updateFamilyAccess: (patientId, memberId, accessLevel) => set((s) => ({
    patients: s.patients.map((p) => p.id === patientId ? { ...p, familyMembers: p.familyMembers.map((m) => m.id === memberId ? { ...m, accessLevel } : m) } : p),
  })),
  comparisonIds: [],
  toggleComparison: (id) => set((s) => ({
    comparisonIds: s.comparisonIds.includes(id) ? s.comparisonIds.filter((x) => x !== id) : s.comparisonIds.length < 5 ? [...s.comparisonIds, id] : s.comparisonIds,
  })),
  clearComparison: () => set({ comparisonIds: [] }),
  filterStatus: 'all',
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  activeSubTab: 'patients',
  setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
}));
