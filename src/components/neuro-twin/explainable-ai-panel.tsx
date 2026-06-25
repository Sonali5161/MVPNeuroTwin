'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Eye, RefreshCw, Dna, Brain, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface XAIResult {
  shapValues: { feature: string; value: number; direction: string }[];
  gradcamRegions: { region: string; importance: number; x: number; y: number }[];
  topGenes: { gene: string; variant: string; impact: string; oddsRatio: number }[];
}

export default function ExplainableAIPanel() {
  const { selectedPatient } = useNeuroStore();
  const [data, setData] = useState<XAIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchXAI = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/neuro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'xai', patientId: selectedPatient?.id }),
      });
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient?.id]);

  useEffect(() => { fetchXAI(); }, [fetchXAI]);

  if (!selectedPatient || !data) return null;

  const shapData = data.shapValues.map(s => ({
    ...s,
    absVal: Math.abs(s.value),
    color: s.value > 0 ? '#ef4444' : '#22c55e',
    label: s.value > 0 ? 'Increases Risk' : 'Decreases Risk',
  }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Explainable AI</h2>
          <p className="text-sm text-muted-foreground mt-1">
            SHAP values & Grad-CAM explanations · {selectedPatient.name}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchXAI} disabled={loading}
          className="border-neuro/30 text-neuro hover:bg-neuro/10">
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Re-analyze
        </Button>
      </motion.div>

      {/* SHAP Values */}
      <motion.div variants={item}>
        <Card className="bg-card border-border glow-neuro">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-neuro" /> SHAP Feature Importance
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px] border-risk-high/40 text-risk-high">Increases Risk</Badge>
                <Badge variant="outline" className="text-[10px] border-risk-low/40 text-risk-low">Decreases Risk</Badge>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Which features drove the AI prediction and by how much</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={shapData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
                <XAxis type="number" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} width={140} />
                <RTooltip
                  contentStyle={{ background: 'oklch(0.17 0.008 250)', border: '1px solid oklch(0.28 0.01 250)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => {
                    if (name === 'value') return [v.toFixed(3), 'SHAP Value'];
                    return [v, name];
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="value">
                  {shapData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grad-CAM Regions */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-neuro" /> Grad-CAM Attention Map
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">Brain regions the AI focused on most</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {/* Simulated Brain Heatmap */}
              <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-xl bg-secondary border border-border overflow-hidden mb-3">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  <ellipse cx="50" cy="50" rx="40" ry="45" fill="none" stroke="oklch(0.35 0.02 250)" strokeWidth="0.5" />
                </svg>
                {data.gradcamRegions.map((r) => (
                  <div
                    key={r.region}
                    className="absolute rounded-full border-2 border-white/20 animate-brain-pulse flex items-center justify-center"
                    style={{
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      width: `${12 + r.importance * 14}px`,
                      height: `${12 + r.importance * 14}px`,
                      transform: 'translate(-50%, -50%)',
                      background: `rgba(239, 68, 68, ${r.importance * 0.6})`,
                    }}
                    title={`${r.region}: ${(r.importance * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {data.gradcamRegions.map((r) => (
                  <div key={r.region} className="flex items-center justify-between text-xs">
                    <span>{r.region}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-risk-high" style={{ width: `${r.importance * 100}%` }} />
                      </div>
                      <span className="text-muted-foreground font-mono w-8 text-right">{(r.importance * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Genes */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Dna className="w-4 h-4 text-neuro" /> Genetic Contributors
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">Genes most responsible for predicted progression</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {data.topGenes.map((g, i) => (
                  <div key={g.gene} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <div className="w-10 h-10 rounded-lg bg-neuro/10 flex items-center justify-center text-neuro font-bold text-sm flex-shrink-0">
                      {g.gene.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{g.gene}</span>
                        <Badge variant="outline" className="text-[9px]">{g.variant}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Odds Ratio: {g.oddsRatio}x</p>
                    </div>
                    <Badge className={`text-[10px] ${
                      g.impact === 'Very High' ? 'bg-risk-high/20 text-risk-high border-0' :
                      g.impact === 'High' ? 'bg-risk-mid/20 text-risk-mid border-0' :
                      g.impact === 'Moderate' ? 'bg-risk-mid/10 text-foreground border-0' :
                      'bg-secondary text-muted-foreground border-0'
                    }`}>
                      {g.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Why the AI predicted this */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-neuro" />
              <h3 className="text-sm font-semibold">Why the AI Predicted This Progression</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <span className="text-risk-high font-medium">Primary driver:</span> The patient&apos;s elevated amyloid beta (Aβ42/40 ratio of {selectedPatient.bloodBiomarkers.amyloid})
                combined with hippocampal atrophy (MRI score {selectedPatient.mriScore}/100) creates a high-probability trajectory
                toward moderate dementia within 3-5 years.
              </p>
              <p>
                <span className="text-risk-mid font-medium">Genetic amplification:</span> APOE ε4/ε4 homozygosity increases the odds
                ratio to 12.4x, accelerating amyloid deposition and tau spread. The TREM2 R47H variant further impairs
                microglial clearance mechanisms.
              </p>
              <p>
                <span className="text-risk-low font-medium">Protective factors:</span> Higher sleep quality and physical activity
                levels are associated with slower progression. Improving these modifiable factors could extend the
                predicted timeline by 1-2 years based on the digital twin simulation.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}