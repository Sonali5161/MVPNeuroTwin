'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNeuroStore, type PanelId } from '@/lib/neuro-store';
import { useAuthStore, PANEL_PERMISSIONS } from '@/lib/auth-store';
import {
  Brain, Database, UserCircle, Clock, Pill, Eye, Network, Search, Sparkles,
  LayoutDashboard, HardDriveDownload, Shield, LogOut, ChevronDown,
  FlaskConical, Stethoscope, Heart, Settings,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems: { id: PanelId; icon: React.ElementType; label: string }[] = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'multimodal', icon: Database, label: 'Multimodal Data' },
  { id: 'digital-twin', icon: UserCircle, label: 'Digital Twin' },
  { id: 'timeline', icon: Clock, label: 'Disease Timeline' },
  { id: 'drug-simulator', icon: Pill, label: 'Drug Simulator' },
  { id: 'explainable-ai', icon: Eye, label: 'Explainable AI' },
  { id: 'brain-network', icon: Network, label: 'Brain Network' },
  { id: 'research-copilot', icon: Search, label: 'Research Copilot' },
  { id: 'synthetic-patients', icon: Sparkles, label: 'Synthetic Patients' },
  { id: 'datasets', icon: HardDriveDownload, label: 'Datasets' },
  { id: 'audit-log', icon: Shield, label: 'Audit Log' },
];

const roleBadgeConfig = {
  researcher: { label: 'Researcher', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: FlaskConical },
  clinician: { label: 'Clinician', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: Stethoscope },
  patient: { label: 'Patient', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Heart },
};

export default function Sidebar() {
  const router = useRouter();
  const { activePanel, setActivePanel, selectedPatient } = useNeuroStore();
  const { user, logout, addAuditLog, isAuthenticated } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userRole = user?.role || 'researcher';

  // Filter nav items by RBAC
  const visibleNavItems = navItems.filter(
    (item) => PANEL_PERMISSIONS[item.id]?.includes(userRole as 'researcher' | 'clinician' | 'patient')
  );

  // Redirect to first allowed panel if current panel is not accessible
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!PANEL_PERMISSIONS[activePanel]?.includes(userRole as 'researcher' | 'clinician' | 'patient')) {
      const firstAllowed = navItems.find(
        (item) => PANEL_PERMISSIONS[item.id]?.includes(userRole as 'researcher' | 'clinician' | 'patient')
      );
      if (firstAllowed) setActivePanel(firstAllowed.id);
    }
  }, [userRole, isAuthenticated, activePanel, setActivePanel]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handlePanelSwitch = (panelId: PanelId) => {
    setActivePanel(panelId);
    // Auto-audit panel access
    if (user) {
      addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'VIEW',
        resource: `Panel: ${panelId.replace(/-/g, ' ')}`,
        ip: '192.168.1.100',
        status: 'success',
        details: `Navigated to ${panelId.replace(/-/g, ' ')} panel`,
      });
    }
  };

  const roleBadge = roleBadgeConfig[userRole as keyof typeof roleBadgeConfig] || roleBadgeConfig.researcher;
  const RoleIcon = roleBadge.icon;

  return (
    <aside className="w-16 lg:w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-3 lg:p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neuro/20 flex items-center justify-center flex-shrink-0 glow-neuro">
          <Brain className="w-5 h-5 text-neuro" />
        </div>
        <div className="hidden lg:block min-w-0">
          <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">NeuroTwin AI</h1>
          <p className="text-[10px] text-muted-foreground truncate">Alzheimer&apos;s Digital Twin</p>
        </div>
      </div>

      {/* HIPAA Compliance Banner */}
      <div className="hidden lg:block px-4 py-2 border-b border-sidebar-border bg-neuro/5">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-neuro flex-shrink-0" />
          <span className="text-[10px] text-neuro font-medium">HIPAA Protected Session</span>
        </div>
      </div>

      {/* Patient Badge (hidden for patient role) */}
      {selectedPatient && userRole !== 'patient' && (
        <div className="hidden lg:block px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neuro/20 flex items-center justify-center text-neuro text-xs font-bold">
              {selectedPatient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{selectedPatient.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedPatient.id} · Age {selectedPatient.age}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handlePanelSwitch(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-neuro/15 text-neuro'
                      : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-neuro' : 'group-hover:text-neuro'
                    )}
                  />
                  <span className="hidden lg:block truncate">{item.label}</span>
                  {isActive && (
                    <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-neuro animate-brain-pulse" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Show locked panels (dimmed) for non-researchers */}
        {userRole !== 'researcher' &&
          navItems
            .filter((item) => !PANEL_PERMISSIONS[item.id]?.includes(userRole as 'researcher' | 'clinician' | 'patient'))
            .map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm opacity-30 cursor-not-allowed">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label} — Restricted
                  </TooltipContent>
                </Tooltip>
              );
            })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-2 lg:p-3 border-t border-sidebar-border">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <div className="w-8 h-8 rounded-full bg-neuro/20 flex items-center justify-center flex-shrink-0">
                <span className="text-neuro text-xs font-bold">
                  {user?.name?.split(' ').map((n) => n[0]).join('') || '??'}
                </span>
              </div>
              <div className="hidden lg:block flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name || 'Not signed in'}</p>
                <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-4 mt-0.5', roleBadge.color)}>
                  <RoleIcon className="w-2.5 h-2.5 mr-0.5" />
                  {roleBadge.label}
                </Badge>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.organization}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs" onClick={() => handlePanelSwitch('audit-log')}>
              <Shield className="w-3.5 h-3.5" />
              Security &amp; Audit Log
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs" disabled>
              <Settings className="w-3.5 h-3.5" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* System Status (collapsed) */}
      <div className="hidden lg:block px-4 pb-3">
        <div className="text-[10px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-low" />
            <span>System Online</span>
          </div>
          <p>Models: ViT · ClinicalBERT · GNN</p>
          <p>Mixture of Experts Active</p>
        </div>
      </div>
    </aside>
  );
}