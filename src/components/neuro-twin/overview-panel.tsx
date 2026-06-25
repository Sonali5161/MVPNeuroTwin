'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Brain3D from './brain-3d';
import {
  Brain, Activity, Dna, Droplets, Mic, Moon, Watch, FileText, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const modalityCards = [
  { key: 'mriScore', label: 'MRI Scan', icon: Brain, max: 100, unit: 'Health Score' },
  { key: 'geneticRisk', label: 'Genetics', icon: Dna, max: 1, unit: 'Risk Score' },
  { key: 'speechScore', label: 'Speech Pattern', icon: Mic, max: 100, unit: 'Coherence %' },
  { key: 'sleepQuality', label: 'Sleep Data', icon: Moon, max: 100, unit: 'Quality %' },
  { key: 'activityLevel', label: 'Smartwatch Activity', icon: Watch, max: 100, unit: 'Activity %' },
  { key: 'cognitiveScore', label: 'Cognitive Tests', icon: FileText, max: 30, unit: 'MMSE' },
] as const;

export default function OverviewPanel() {
  const { selectedPatient, setActivePanel, patients, setSelectedPatient } = useNeuroStore();
  if (!selectedPatient) return null;

  const biomarkers = selectedPatient.bloodBiomarkers;

  const getBiomarkerStatus = (name: string, val: number) => {
    if (name === 'tau') return val > 40 ? 'Elevated' : val > 25 ? 'Borderline' : 'Normal';
    if (name === 'amyloid') return val > 150 ? 'Elevated' : val > 100 ? 'Borderline' : 'Normal';
    if (name === 'nfL') return val > 30 ? 'Elevated' : val > 18 ? 'Borderline' : 'Normal';
    return 'Normal';
  };

  const getBiomarkerColor = (status: string) => {
    if (status === 'Elevated') return 'text-risk-high';
    if (status === 'Borderline') return 'text-risk-mid';
    return 'text-risk-low';
  };

  const getStageLabel = (mmse: number) => {
    if (mmse >= 27) return { label: 'Normal', color: 'bg-risk-low' };
    if (mmse >= 21) return { label: 'Mild Cognitive Impairment', color: 'bg-risk-mid' };
    if (mmse >= 15) return { label: 'Mild Alzheimer\'s', color: 'bg-risk-high' };
    if (mmse >= 10) return { label: 'Moderate Alzheimer\'s', color: 'bg-risk-high' };
    return { label: 'Severe Alzheimer\'s', color: 'bg-risk-high' };
  };

  const stage = getStageLabel(selectedPatient.cognitiveScore);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedPatient.name} · {selectedPatient.id} · {selectedPatient.sex} · Age {selectedPatient.age}
          </p>
        </div>
        <Badge variant="outline" className={`${stage.color} text-foreground border-0 px-3 py-1 text-xs font-medium self-start`}>
          {stage.label}
        </Badge>
      </motion.div>

      {/* Brain + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="bg-card border-border h-[340px] glow-neuro overflow-hidden">
            <CardContent className="p-0 h-full relative">
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="outline" className="bg-background/80 text-neuro border-neuro/30 text-[10px] backdrop-blur-sm">
                  <Activity className="w-3 h-3 mr-1" /> 3D Brain Model
                </Badge>
              </div>
              <Brain3D />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Brain Age Gap */}
          <Card className="bg-card border-border glow-neuro col-span-2 sm:col-span-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Brain Age Gap</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-neuro text-glow">{selectedPatient.brainAge}</span>
                    <span className="text-sm text-muted-foreground">vs {selectedPatient.age} actual</span>
                  </div>
                  <p className="text-xs text-risk-high mt-1">
                    +{selectedPatient.brainAge - selectedPatient.age} years accelerated aging
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-risk-high">{selectedPatient.brainAge - selectedPatient.age}</div>
                  <p className="text-[10px] text-muted-foreground">year gap</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stat cards */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Brain className="w-5 h-5 text-neuro mx-auto mb-2" />
              <p className="text-2xl font-bold">{selectedPatient.mriScore}</p>
              <p className="text-[10px] text-muted-foreground">MRI Score</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <FileText className="w-5 h-5 text-neuro mx-auto mb-2" />
              <p className="text-2xl font-bold">{selectedPatient.cognitiveScore}/30</p>
              <p className="text-[10px] text-muted-foreground">MMSE Score</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Dna className="w-5 h-5 text-neuro mx-auto mb-2" />
              <p className="text-2xl font-bold">{(selectedPatient.geneticRisk * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Genetic Risk</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modality Cards */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            7 Data Modalities
          </h3>
          <button
            onClick={() => setActivePanel('multimodal')}
            className="text-xs text-neuro hover:text-neuro-bright transition-colors"
          >
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {modalityCards.map((mod) => {
            const Icon = mod.icon;
            const val = selectedPatient[mod.key] as number;
            const pct = Math.round((val / mod.max) * 100);
            return (
              <Card key={mod.key} className="bg-card border-border group hover:border-neuro/40 transition-colors">
                <CardContent className="p-3">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-neuro transition-colors mb-2" />
                  <p className="text-lg font-bold">{typeof val === 'number' && val < 1 ? val.toFixed(2) : val}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{mod.label}</p>
                  <Progress value={pct} className="mt-2 h-1" />
                </CardContent>
              </Card>
            );
          })}
          <Card className="bg-card border-border group hover:border-neuro/40 transition-colors">
            <CardContent className="p-3">
              <Droplets className="w-4 h-4 text-muted-foreground group-hover:text-neuro transition-colors mb-2" />
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">Blood Biomarkers</p>
                <p className={`text-xs font-medium ${getBiomarkerColor(getBiomarkerStatus('tau', biomarkers.tau))}`}>
                  Tau: {biomarkers.tau}
                </p>
                <p className={`text-xs font-medium ${getBiomarkerColor(getBiomarkerStatus('amyloid', biomarkers.amyloid))}`}>
                  Aβ: {biomarkers.amyloid}
                </p>
                <p className={`text-xs font-medium ${getBiomarkerColor(getBiomarkerStatus('nfL', biomarkers.nfL))}`}>
                  NfL: {biomarkers.nfL}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Patient Switcher */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-neuro" /> Patient Cohort
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedPatient.id === p.id
                      ? 'border-neuro/60 bg-neuro/10 glow-neuro'
                      : 'border-border hover:border-neuro/30 hover:bg-secondary'
                  }`}
                >
                  <p className="text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.id} · Age {p.age}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      MMSE {p.cognitiveScore}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      Brain {p.brainAge}yr
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}