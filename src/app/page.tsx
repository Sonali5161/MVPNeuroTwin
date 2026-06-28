'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, PANEL_PERMISSIONS } from '@/lib/auth-store';
import { useNeuroStore, type PanelId } from '@/lib/neuro-store';
import Sidebar from '@/components/neuro-twin/sidebar';
import OverviewPanel from '@/components/neuro-twin/overview-panel';
import MultimodalPanel from '@/components/neuro-twin/multimodal-panel';
import DigitalTwinPanel from '@/components/neuro-twin/digital-twin-panel';
import TimelinePanel from '@/components/neuro-twin/timeline-panel';
import DrugSimulatorPanel from '@/components/neuro-twin/drug-simulator-panel';
import ExplainableAIPanel from '@/components/neuro-twin/explainable-ai-panel';
import BrainNetworkPanel from '@/components/neuro-twin/brain-network-panel';
import ResearchCopilotPanel from '@/components/neuro-twin/research-copilot-panel';
import SyntheticPatientsPanel from '@/components/neuro-twin/synthetic-patients-panel';
import DatasetsPanel from '@/components/neuro-twin/datasets-panel';
import AuditLogPanel from '@/components/neuro-twin/audit-log-panel';
import InfrastructurePanel from '@/components/neuro-twin/infrastructure-panel';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const panels: Record<PanelId, React.ComponentType> = {
  'overview': OverviewPanel,
  'multimodal': MultimodalPanel,
  'digital-twin': DigitalTwinPanel,
  'timeline': TimelinePanel,
  'drug-simulator': DrugSimulatorPanel,
  'explainable-ai': ExplainableAIPanel,
  'brain-network': BrainNetworkPanel,
  'research-copilot': ResearchCopilotPanel,
  'synthetic-patients': SyntheticPatientsPanel,
  'datasets': DatasetsPanel,
  'audit-log': AuditLogPanel,
  'infrastructure': InfrastructurePanel,
};

const roleLabels = {
  researcher: 'Researcher',
  clinician: 'Clinician',
  patient: 'Patient',
};

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { activePanel, setActivePanel } = useNeuroStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  // RBAC check — redirect if user doesn't have access to current panel
  const userRole = user?.role as 'researcher' | 'clinician' | 'patient' | undefined;
  const hasAccess = userRole && PANEL_PERMISSIONS[activePanel]?.includes(userRole);
  const PanelComponent = panels[activePanel];

  // Auth loading state
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neuro/20 flex items-center justify-center glow-neuro animate-pulse">
            <Shield className="w-6 h-6 text-neuro" />
          </div>
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // No access to panel
  if (!hasAccess) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md p-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
              <p className="text-sm text-muted-foreground mt-2">
                The <span className="text-neuro font-medium">{activePanel.replace(/-/g, ' ')}</span> panel
                requires <span className="font-medium text-foreground">
                  {PANEL_PERMISSIONS[activePanel]?.map((r) => roleLabels[r]).join(' or ')}
                </span> role access.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your current role: <span className="font-medium text-foreground capitalize">{userRole}</span>.
                Contact your administrator to request elevated access.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-destructive/80">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>This access attempt has been logged for security purposes.</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setActivePanel('overview')}
              className="gap-2"
            >
              Return to Overview
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* HIPAA Top Bar */}
        <div className="sticky top-0 z-40 bg-sidebar/80 backdrop-blur-md border-b border-sidebar-border px-4 lg:px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-neuro" />
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              HIPAA Protected · All access is audited
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              Signed in as <span className="text-foreground font-medium">{user?.name}</span>
            </span>
            <div className={cn(
              'px-2 py-0.5 rounded text-[10px] font-medium border',
              userRole === 'researcher' && 'bg-blue-500/10 text-blue-400 border-blue-500/30',
              userRole === 'clinician' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              userRole === 'patient' && 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            )}>
              {roleLabels[userRole!]}
            </div>
          </div>
        </div>
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          <PanelComponent />
        </div>
      </main>
    </div>
  );
}