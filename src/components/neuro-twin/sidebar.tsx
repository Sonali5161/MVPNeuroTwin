'use client';

import { useNeuroStore, type PanelId } from '@/lib/neuro-store';
import {
  Brain, Database, UserCircle, Clock, Pill, Eye, Network, Search, Sparkles, LayoutDashboard, HardDriveDownload
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
];

export default function Sidebar() {
  const { activePanel, setActivePanel, selectedPatient } = useNeuroStore();

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

      {/* Patient Badge */}
      {selectedPatient && (
        <div className="hidden lg:block px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neuro/20 flex items-center justify-center text-neuro text-xs font-bold">
              {selectedPatient.name.split(' ').map(n => n[0]).join('')}
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
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActivePanel(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-neuro/15 text-neuro'
                      : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-neuro' : 'group-hover:text-neuro'
                  )} />
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
      </nav>

      {/* Footer */}
      <div className="hidden lg:block p-4 border-t border-sidebar-border">
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