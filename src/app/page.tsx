'use client';

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
};

export default function Home() {
  const { activePanel } = useNeuroStore();
  const PanelComponent = panels[activePanel];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          <PanelComponent />
        </div>
      </main>
    </div>
  );
}