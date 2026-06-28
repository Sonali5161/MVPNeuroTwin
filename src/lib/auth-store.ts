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
};

// RBAC Feature permissions
export const FEATURE_PERMISSIONS: Record<string, UserRole[]> = {
  'view-patient-data': ['researcher', 'clinician'],
  'edit-patient-data': ['clinician'],
  'run-ai-models': ['researcher', 'clinician'],
  'generate-synthetic-data': ['researcher'],
  'access-raw-datasets': ['researcher'],
  'drug-simulation': ['researcher', 'clinician'],
  'treatment-optimization': ['clinician'],
  'view-own-data': ['patient'],
  'export-data': ['researcher'],
  'audit-access': ['researcher', 'clinician'],
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
        // Simulate API delay
        await new Promise((r) => setTimeout(r, 1200));

        const found = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!found) {
          set({ isLoading: false, error: 'Invalid email or password. Please try again.' });
          return false;
        }

        const { password: _, ...userData } = found;
        const user: User = {
          ...userData,
          lastLogin: new Date().toISOString(),
        };

        const auditEntry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'LOGIN',
          resource: 'Authentication',
          ip: '192.168.1.100',
          status: 'success',
          details: `Successful login for ${user.role} role`,
        };

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          auditLogs: [
            {
              ...auditEntry,
              id: generateAuditId(),
              timestamp: new Date().toISOString(),
            },
          ],
        });
        return true;
      },

      register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1500));

        if (mockUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
          set({ isLoading: false, error: 'An account with this email already exists.' });
          return false;
        }

        const newUser: User = {
          id: `USR-${String(mockUsers.length + 1).padStart(3, '0')}`,
          email: data.email,
          name: data.name,
          role: data.role,
          organization: data.organization,
          hipaaConsent: data.hipaaConsent,
          lastLogin: new Date().toISOString(),
          twoFactorEnabled: false,
        };

        mockUsers.push({ ...newUser, password: data.password });

        const auditEntry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
          userId: newUser.id,
          userName: newUser.name,
          userRole: newUser.role,
          action: 'REGISTER',
          resource: 'Account Creation',
          ip: '192.168.1.100',
          status: 'success',
          details: `New ${newUser.role} account created at ${newUser.organization}`,
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          auditLogs: [
            {
              ...auditEntry,
              id: generateAuditId(),
              timestamp: new Date().toISOString(),
            },
          ],
        });
        return true;
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