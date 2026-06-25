'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell
} from 'recharts';
import { Pill, Beaker, ShieldAlert, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const drugs = [
  { id: 'lecanemab', name: 'Lecanemab', type: 'Anti-Amyloid mAb', phase: 'FDA Approved 2023', desc: 'Monoclonal antibody targeting amyloid beta protofibrils' },
  { id: 'donepezil', name: 'Donepezil', type: 'Cholinesterase Inhibitor', phase: 'FDA Approved', desc: 'Acetylcholinesterase inhibitor for symptomatic treatment' },
  { id: 'memantine', name: 'Memantine', type: 'NMDA Antagonist', phase: 'FDA Approved', desc: 'NMDA receptor antagonist for moderate-to-severe AD' },
  { id: 'placebo', name: 'No Treatment', type: 'Natural Progression', phase: 'Baseline', desc: 'Natural disease progression without intervention' },
];

interface DrugResult {
  drug: string;
  timepoints: string[];
  mmse: number[];
  adas: number[];
  sideEffects: string[];
  efficacy: number;
}

interface TreatmentRec {
  treatment: string;
  dosage: string;
  impact: string;
  confidence: number;
  rank: number;
}

export default function DrugSimulatorPanel() {
  const { selectedPatient } = useNeuroStore();
  const [selectedDrug, setSelectedDrug] = useState('lecanemab');
  const [result, setResult] = useState<DrugResult | null>(null);
  const [treatments, setTreatments] = useState<TreatmentRec[]>([]);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(async (drugId?: string) => {
    setLoading(true);
    try {
      const id = drugId ?? selectedDrug;
      const [drugRes, treatRes] = await Promise.all([
        fetch('/api/neuro', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'drug-simulate', patientId: selectedPatient?.id, drug: id }),
        }).then(r => r.json()),
        fetch('/api/neuro', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'treatment-optimize', patientId: selectedPatient?.id }),
        }).then(r => r.json()),
      ]);
      setResult(drugRes);
      setTreatments(treatRes.recommendations);
    } finally {
      setLoading(false);
    }
  }, [selectedDrug, selectedPatient?.id]);

  const chartData = result ? result.timepoints.map((tp, i) => ({
    time: tp,
    [result.drug]: result.mmse[i],
    placebo: drugs[3] ? [24, 23, 21, 19, 16, 12, 6][i] : 24,
  })) : [];

  if (!selectedPatient) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Drug Simulator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Virtual treatment comparison · {selectedPatient.name}
          </p>
        </div>
      </motion.div>

      {/* Drug Selection */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Select Treatment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {drugs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDrug(d.id); simulate(d.id); }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedDrug === d.id
                      ? 'border-neuro/60 bg-neuro/10 glow-neuro'
                      : 'border-border hover:border-neuro/30 hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-neuro" />
                    <span className="text-sm font-semibold">{d.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{d.type}</p>
                  <Badge variant="outline" className="text-[9px] mt-1.5">{d.phase}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Simulation Results */}
      {result && (
        <>
          <motion.div variants={item}>
            <Card className="bg-card border-border glow-neuro">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Treatment Efficacy: {result.drug}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-neuro/40 text-neuro">
                      Efficacy: {(result.efficacy * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
                    <XAxis dataKey="time" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} domain={[0, 30]} />
                    <RTooltip
                      contentStyle={{ background: 'oklch(0.17 0.008 250)', border: '1px solid oklch(0.28 0.01 250)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey={result.drug} stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 4 }} />
                    <Line type="monotone" dataKey="placebo" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={{ fill: '#ef4444', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Effects */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-risk-high" /> Predicted Side Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {result.sideEffects.map((se, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                      <Beaker className="w-4 h-4 text-risk-mid" />
                      <span className="text-xs">{se}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Treatment Comparison Bar */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Treatment Comparison (18-month MMSE impact)</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Lecanemab', val: 3.2 },
                    { name: 'Donepezil', val: 1.8 },
                    { name: 'Memantine', val: 1.2 },
                    { name: 'Exercise', val: 1.0 },
                    { name: 'Sleep CBT', val: 0.8 },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
                    <XAxis type="number" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} width={80} />
                    <RTooltip contentStyle={{ background: 'oklch(0.17 0.008 250)', border: '1px solid oklch(0.28 0.01 250)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]} name="MMSE improvement">
                      {[
                        { name: 'Lecanemab', val: 3.2 },
                        { name: 'Donepezil', val: 1.8 },
                        { name: 'Memantine', val: 1.2 },
                        { name: 'Exercise', val: 1.0 },
                        { name: 'Sleep CBT', val: 0.8 },
                      ].map((entry, i) => (
                        <Cell key={i} fill={i === 0 ? '#14b8a6' : i < 3 ? '#0d9488' : '#115e59'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* RL Treatment Optimization */}
      {treatments.length > 0 && (
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neuro" /> RL Treatment Optimization
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-neuro/40 text-neuro">Reinforcement Learning</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">AI-optimized treatment plan to maximize cognitive preservation</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {treatments.map((t) => (
                  <div key={t.rank} className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-neuro/20 flex items-center justify-center text-neuro text-sm font-bold flex-shrink-0">
                      #{t.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{t.treatment}</p>
                        {t.rank === 1 && <CheckCircle className="w-3.5 h-3.5 text-risk-low flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{t.dosage}</span>
                        <ArrowRight className="w-3 h-3 text-neuro" />
                        <span className="text-[10px] text-neuro font-medium">{t.impact}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-neuro/30 flex-shrink-0">
                      {(t.confidence * 100).toFixed(0)}% conf
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}