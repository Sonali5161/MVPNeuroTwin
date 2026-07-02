import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'researcher' | 'clinician' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  avatar?: string;
  hipaaConsent: boolean;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  patientId?: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'denied' | 'warning';
  details?: string;
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  auditLogs: AuditLogEntry[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  checkPermission: (requiredRoles: UserRole[]) => boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organization: string;
  hipaaConsent: boolean;
  age?: number;
  sex?: string;
}

// Mock user database
const mockUsers: (User & { password: string })[] = [
  {
    id: 'USR-001',
    email: 'dr.smith@neuroresearch.org',
    name: 'Dr. Sarah Mitchell',
    role: 'researcher',
    organization: 'National Institute on Aging',
    hipaaConsent: true,
    lastLogin: '2026-06-28T14:30:00Z',
    twoFactorEnabled: true,
    password: 'researcher123',
  },
  {
    id: 'USR-002',
    email: 'dr.chen@memoryclinic.com',
    name: 'Dr. James Chen',
    role: 'clinician',
    organization: 'Mayo Clinic Neurology',
    hipaaConsent: true,
    lastLogin: '2026-06-29T09:15:00Z',
    twoFactorEnabled: true,
    password: 'clinician123',
  },
  {
    id: 'USR-003',
    email: 'eleanor.m@email.com',
    name: 'Eleanor Mitchell',
    role: 'patient',
    organization: 'Self-enrolled',
    hipaaConsent: true,
    lastLogin: '2026-06-29T08:00:00Z',
    twoFactorEnabled: false,
    password: 'patient123',
  },
];

// RBAC Panel permissions
export const PANEL_PERMISSIONS: Record<string, UserRole[]> = {
  'overview': ['researcher', 'clinician', 'patient'],
  'multimodal': ['researcher', 'clinician'],
  'digital-twin': ['researcher', 'clinician'],
  'timeline': ['researcher', 'clinician', 'patient'],
  'drug-simulator': ['researcher', 'clinician'],
  'explainable-ai': ['researcher'],
  'brain-network': ['researcher', 'clinician'],
  'research-copilot': ['researcher'],
  'synthetic-patients': ['researcher'],
  'datasets': ['researcher'],
  'audit-log': ['researcher', 'clinician'],
  'infrastructure': ['researcher'],
  'patient-management': ['researcher', 'clinician'],
  'clinical-trials': ['researcher', 'clinician'],
  'ai-predictions': ['researcher', 'clinician'],
  'model-explainability': ['researcher'],
  'model-metrics': ['researcher'],
};

// RBAC Feature permissions
export const FEATURE_PERMISSIONS: Record<string, UserRole[]> = {
  'view-patient-data': ['researcher', 'clinician'],
  'manage-patients': ['researcher', 'clinician'],
  'edit-patient-data': ['clinician'],
  'run-ai-models': ['researcher', 'clinician'],
  'view-infra-status': ['researcher'],
  'generate-synthetic-data': ['researcher'],
  'access-raw-datasets': ['researcher'],
  'drug-simulation': ['researcher', 'clinician'],
  'treatment-optimization': ['clinician'],
  'view-own-data': ['patient'],
  'export-data': ['researcher'],
  'audit-access': ['researcher', 'clinician'],
  'view-infrastructure': ['researcher'],
  'manage-ml-models': ['researcher'],
  'manage-storage': ['researcher'],
  'patient-onboard': ['clinician'],
  'patient-consent': ['clinician'],
  'patient-comparison': ['researcher', 'clinician'],
  'trial-enroll': ['clinician'],
  'trial-ae-report': ['clinician'],
  'trial-compliance': ['researcher', 'clinician'],
};

function generateAuditId(): string {
  return `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      auditLogs: [],

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: result.error || 'Login failed' });
            return false;
          }

          const user: User = {
            ...result.user,
            lastLogin: new Date().toISOString(),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Network error. Please check your connection.' 
          });
          return false;
        }
      },

      register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: result.error || 'Registration failed' });
            return false;
          }

          const user: User = {
            ...result.user,
            lastLogin: new Date().toISOString(),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Network error. Please check your connection.' 
          });
          return false;
        }
      },

      logout: () => {
        const { user, addAuditLog } = get();
        if (user) {
          addAuditLog({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: 'LOGOUT',
            resource: 'Authentication',
            ip: '192.168.1.100',
            status: 'success',
            details: 'User logged out',
          });
        }
        set({ user: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),

      addAuditLog: (entry) =>
        set((state) => ({
          auditLogs: [
            {
              ...entry,
              id: generateAuditId(),
              timestamp: new Date().toISOString(),
            },
            ...state.auditLogs,
          ].slice(0, 500), // Keep last 500 entries
        })),

      checkPermission: (requiredRoles: UserRole[]): boolean => {
        const { user } = get();
        if (!user) return false;
        return requiredRoles.includes(user.role);
      },
    }),
    {
      name: 'neuro-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        auditLogs: state.auditLogs,
      }),
    }
  )
);