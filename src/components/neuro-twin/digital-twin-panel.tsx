'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Brain3D from './brain-3d';
import {
  UserCircle, Zap, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface BrainAgeResult {
  actualAge: number;
  brainAge: number;
  gap: number;
  confidence: number;
  regions: { name: string; atrophy: number; color: string }[];
}

export default function DigitalTwinPanel() {
  const { selectedPatient, setActivePanel } = useNeuroStore();
  const [brainData, setBrainData] = useState<BrainAgeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrainAge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/neuro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'brain-age', patientId: selectedPatient?.id }),
      });
      const data = await res.json();
      setBrainData(data);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient?.id]);

  useEffect(() => { fetchBrainAge(); }, [fetchBrainAge]);

  if (!selectedPatient) return null;

  const gap = brainData?.gap ?? (selectedPatient.brainAge - selectedPatient.age);
  const gapPercent = Math.min(gap / 30 * 100, 100);
  const severity = gap > 12 ? 'Severe' : gap > 7 ? 'Moderate' : gap > 3 ? 'Mild' : 'Normal';
  const severityColor = gap > 12 ? 'text-risk-high' : gap > 7 ? 'text-risk-mid' : 'text-risk-low';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Digital Twin</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered brain age estimation and digital twin simulation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBrainAge} disabled={loading}
          className="border-neuro/30 text-neuro hover:bg-neuro/10">
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Re-analyze
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 3D Brain */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="bg-card border-border h-[400px] glow-neuro overflow-hidden">
            <CardContent className="p-0 h-full relative">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <Badge variant="outline" className="bg-background/80 text-neuro border-neuro/30 text-[10px] backdrop-blur-sm">
                  <Zap className="w-3 h-3 mr-1" /> Digital Twin Active
                </Badge>
              </div>
              <Brain3D />
            </CardContent>
          </Card>
        </motion.div>

        {/* Brain Age Analysis */}
        <motion.div variants={item} className="lg:col-span-3 space-y-4">
          {/* Main Brain Age Card */}
          <Card className="bg-card border-border glow-neuro">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="w-5 h-5 text-neuro" />
                <h3 className="text-sm font-semibold">Brain Age Gap Analysis</h3>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Chronological Age</p>
                  <p className="text-3xl font-bold">{selectedPatient.age}</p>
                  <p className="text-[10px] text-muted-foreground">years</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`text-3xl font-bold ${severityColor}`}>
                    {gap > 0 ? '+' : ''}{gap}
                  </div>
                  <p className="text-[10px] text-muted-foreground">year gap</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Brain Age (Predicted)</p>
                  <p className="text-3xl font-bold text-neuro">{brainData?.brainAge ?? selectedPatient.brainAge}</p>
                  <p className="text-[10px] text-muted-foreground">years</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Brain Age Gap</span>
                  <span className={severityColor}>{severity}</span>
                </div>
                <Progress value={gapPercent} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Normal</span>
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {brainData && (
                <div className="mt-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-neuro" />
                  <span className="text-xs text-muted-foreground">
                    Model confidence: <span className="text-foreground font-medium">{(brainData.confidence * 100).toFixed(0)}%</span>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regional Atrophy */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">Regional Atrophy Analysis</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2.5">
                {(brainData?.regions ?? []).map((region) => (
                  <div key={region.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{region.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold">{(region.atrophy * 100).toFixed(0)}%</span>
                        {region.atrophy > 0.25 ? (
                          <AlertTriangle className="w-3 h-3 text-risk-high" />
                        ) : region.atrophy > 0.15 ? (
                          <TrendingDown className="w-3 h-3 text-risk-mid" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-risk-low" />
                        )}
                      </div>
                    </div>
                    <Progress value={region.atrophy * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Model Info */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">Active AI Models:</span>
              {[
                { name: 'Vision Transformer', desc: 'MRI feature extraction' },
                { name: 'Graph Neural Network', desc: 'Genetic pathway analysis' },
                { name: 'ClinicalBERT', desc: 'EHR text understanding' },
                { name: 'Mixture of Experts', desc: 'Final prediction fusion' },
              ].map(m => (
                <Badge key={m.name} variant="outline" className="text-[10px] border-neuro/30 text-neuro">
                  {m.name}
                  <span className="text-muted-foreground ml-1">· {m.desc}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}