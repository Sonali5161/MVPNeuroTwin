'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Brain, Dna, Droplets, Mic, Moon, Watch, FileText, Server, ArrowDown, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const modalities = [
  { key: 'mri', label: 'MRI Scan', sublabel: 'T1/T2/FLAIR + DTI', icon: Brain, model: 'Vision Transformer (ViT)', color: '#14b8a6' },
  { key: 'genetics', label: 'Genetics', sublabel: 'SNP + APOE + WGS', icon: Dna, model: 'Graph Neural Network', color: '#a855f7' },
  { key: 'blood', label: 'Blood Biomarkers', sublabel: 'Tau, Aβ42, NfL, GFAP', icon: Droplets, model: 'Transformer', color: '#ef4444' },
  { key: 'speech', label: 'Speech Pattern', sublabel: 'Acoustic + Linguistic', icon: Mic, model: 'Whisper + Wav2Vec2', color: '#f97316' },
  { key: 'sleep', label: 'Sleep Data', sublabel: 'Actigraphy + EEG', icon: Moon, model: 'Time Series Transformer', color: '#6366f1' },
  { key: 'activity', label: 'Smartwatch Activity', sublabel: 'Steps, HR, GPS', icon: Watch, model: 'Time Series Transformer', color: '#22c55e' },
  { key: 'cognitive', label: 'Cognitive Test Scores', sublabel: 'MMSE, ADAS-Cog, CDR', icon: FileText, model: 'ClinicalBERT', color: '#eab308' },
] as const;

export default function MultimodalPanel() {
  const { selectedPatient } = useNeuroStore();
  const [localData, setLocalData] = useState({
    mriScore: selectedPatient?.mriScore ?? 72,
    geneticRisk: selectedPatient?.geneticRisk ?? 0.78,
    tau: selectedPatient?.bloodBiomarkers.tau ?? 42,
    amyloid: selectedPatient?.bloodBiomarkers.amyloid ?? 180,
    nfL: selectedPatient?.bloodBiomarkers.nfL ?? 28,
    speechScore: selectedPatient?.speechScore ?? 85,
    sleepQuality: selectedPatient?.sleepQuality ?? 54,
    activityLevel: selectedPatient?.activityLevel ?? 40,
    cognitiveScore: selectedPatient?.cognitiveScore ?? 24,
  });
  const [ehr, setEhr] = useState(selectedPatient?.clinicalNotes ?? '');

  if (!selectedPatient) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <h2 className="text-2xl font-bold text-foreground">Multimodal Data Fusion</h2>
        <p className="text-sm text-muted-foreground mt-1">
          7 data modalities feeding into the AI Digital Twin · {selectedPatient.name}
        </p>
      </motion.div>

      {/* Architecture Flow */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0 justify-between">
              {modalities.map((m, i) => (
                <div key={m.key} className="flex items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary flex-1 md:flex-none">
                    <m.icon className="w-4 h-4 flex-shrink-0" style={{ color: m.color }} />
                    <span className="text-xs font-medium hidden lg:inline">{m.label}</span>
                    <span className="text-[10px] text-muted-foreground hidden xl:inline">({m.model.split('(')[0].trim()})</span>
                  </div>
                  {i < modalities.length - 1 && (
                    <ArrowDown className="w-3 h-3 text-muted-foreground rotate-90 md:rotate-0 mx-1 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3">
              <ArrowDown className="w-4 h-4 text-neuro animate-bounce" />
            </div>
            <div className="flex justify-center mt-1">
              <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neuro/10 border border-neuro/30 glow-neuro">
                <Cpu className="w-4 h-4 text-neuro" />
                <span className="text-sm font-semibold text-neuro">Mixture of Experts Fusion</span>
                <Server className="w-4 h-4 text-neuro" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MRI */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4" style={{ color: modalities[0].color }} /> {modalities[0].label}
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">{modalities[0].model}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{modalities[0].sublabel}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Brain Health Score</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[localData.mriScore]} min={0} max={100} step={1}
                    onValueChange={([v]) => setLocalData(p => ({ ...p, mriScore: v }))} className="flex-1" />
                  <span className="text-sm font-mono font-bold w-8 text-right">{localData.mriScore}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['Hippocampus', 'Cortex', 'Ventricles'].map(r => (
                    <div key={r} className="bg-secondary rounded-md p-2 text-center">
                      <p className="text-[9px] text-muted-foreground">{r}</p>
                      <p className="text-xs font-bold">{(30 + Math.random() * 60).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Genetics */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Dna className="w-4 h-4" style={{ color: modalities[1].color }} /> {modalities[1].label}
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">{modalities[1].model}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{modalities[1].sublabel}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Genetic Risk Score</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[localData.geneticRisk * 100]} min={0} max={100} step={1}
                    onValueChange={([v]) => setLocalData(p => ({ ...p, geneticRisk: v / 100 }))} className="flex-1" />
                  <span className="text-sm font-mono font-bold w-12 text-right">{(localData.geneticRisk * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { gene: 'APOE', val: 'ε4/ε4', risk: 'Very High' },
                  { gene: 'TREM2', val: 'R47H', risk: 'High' },
                  { gene: 'BIN1', val: 'rs744373', risk: 'Moderate' },
                ].map(g => (
                  <div key={g.gene} className="bg-secondary rounded-md p-2 text-center">
                    <p className="text-[9px] text-muted-foreground">{g.gene}</p>
                    <p className="text-xs font-bold">{g.val}</p>
                    <p className="text-[9px] text-risk-mid">{g.risk}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blood Biomarkers */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Droplets className="w-4 h-4" style={{ color: modalities[2].color }} /> {modalities[2].label}
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">{modalities[2].model}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{modalities[2].sublabel}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { key: 'tau' as const, label: 'p-Tau 181', range: '8-75 pg/mL', max: 80 },
                { key: 'amyloid' as const, label: 'Aβ42/40 Ratio', range: '0.04-0.15', max: 300 },
                { key: 'nfL' as const, label: 'NfL', range: '5-60 pg/mL', max: 70 },
              ].map(b => (
                <div key={b.key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">{b.label} <span className="text-muted-foreground">({b.range})</span></Label>
                    <span className="text-xs font-mono font-bold">{localData[b.key]}</span>
                  </div>
                  <Progress value={(localData[b.key] / b.max) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Speech + Sleep + Activity combined */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mic className="w-4 h-4" style={{ color: modalities[3].color }} /> {modalities[3].label}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">{modalities[3].sublabel} · <Badge variant="outline" className="text-[9px] ml-1">{modalities[3].model}</Badge></p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Speech Coherence Score</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[localData.speechScore]} min={0} max={100} step={1}
                    onValueChange={([v]) => setLocalData(p => ({ ...p, speechScore: v }))} className="flex-1" />
                  <span className="text-sm font-mono font-bold w-8 text-right">{localData.speechScore}</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Moon className="w-3 h-3" /> Sleep Quality</Label>
                  <div className="flex items-center gap-2">
                    <Slider value={[localData.sleepQuality]} min={0} max={100} step={1}
                      onValueChange={([v]) => setLocalData(p => ({ ...p, sleepQuality: v }))} className="flex-1" />
                    <span className="text-xs font-mono font-bold w-8 text-right">{localData.sleepQuality}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Watch className="w-3 h-3" /> Activity Level</Label>
                  <div className="flex items-center gap-2">
                    <Slider value={[localData.activityLevel]} min={0} max={100} step={1}
                      onValueChange={([v]) => setLocalData(p => ({ ...p, activityLevel: v }))} className="flex-1" />
                    <span className="text-xs font-mono font-bold w-8 text-right">{localData.activityLevel}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><FileText className="w-3 h-3" /> Cognitive Score (MMSE / 30)</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[localData.cognitiveScore]} min={0} max={30} step={1}
                    onValueChange={([v]) => setLocalData(p => ({ ...p, cognitiveScore: v }))} className="flex-1" />
                  <span className="text-sm font-mono font-bold w-8 text-right">{localData.cognitiveScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* EHR */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Electronic Health Records</CardTitle>
            <p className="text-[10px] text-muted-foreground">ClinicalBERT processes unstructured clinical notes</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Textarea
              value={ehr}
              onChange={(e) => setEhr(e.target.value)}
              className="min-h-[100px] bg-secondary border-border text-sm resize-none"
              placeholder="Enter clinical notes..."
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}