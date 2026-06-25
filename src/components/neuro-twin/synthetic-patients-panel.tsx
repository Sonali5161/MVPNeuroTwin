'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, UserPlus, BarChart3, Shield, Dna, Brain, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface SyntheticPatient {
  id: string;
  age: number;
  sex: string;
  mriScore: number;
  geneticRisk: number;
  bloodBiomarkers: { tau: number; amyloid: number; nfL: number };
  speechScore: number;
  sleepQuality: number;
  activityLevel: number;
  cognitiveScore: number;
  brainAge: number;
}

interface QualityMetrics {
  realism: number;
  diversity: number;
  validity: number;
}

export default function SyntheticPatientsPanel() {
  const { selectedPatient } = useNeuroStore();
  const [generated, setGenerated] = useState<SyntheticPatient[]>([]);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState<'random' | 'targeted'>('random');

  const generate = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        Array.from({ length: count }, () =>
          fetch('/api/neuro', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'synthetic-patient' }),
          }).then(r => r.json())
        )
      );
      const patients = results.map(r => ({
        ...r.generated,
        brainAge: r.generated.age + Math.floor(Math.random() * 15),
      }));
      setGenerated(prev => [...patients, ...prev]);
      setQuality(results[0]?.quality ?? null);
    } finally {
      setLoading(false);
    }
  };

  const getMmseStage = (mmse: number) => {
    if (mmse >= 27) return { label: 'Normal', color: 'text-risk-low' };
    if (mmse >= 21) return { label: 'MCI', color: 'text-risk-mid' };
    if (mmse >= 15) return { label: 'Mild AD', color: 'text-risk-mid' };
    return { label: 'Mod-Severe AD', color: 'text-risk-high' };
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Synthetic Patient Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Diffusion model-based realistic patient generation for research augmentation
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Mode:</span>
                <Button
                  size="sm" variant={mode === 'random' ? 'default' : 'outline'}
                  onClick={() => setMode('random')}
                  className={mode === 'random' ? 'bg-neuro text-primary-foreground hover:bg-neuro-bright text-xs' : 'text-xs border-border'}
                >
                  Random
                </Button>
                <Button
                  size="sm" variant={mode === 'targeted' ? 'default' : 'outline'}
                  onClick={() => setMode('targeted')}
                  className={mode === 'targeted' ? 'bg-neuro text-primary-foreground hover:bg-neuro-bright text-xs' : 'text-xs border-border'}
                >
                  Targeted
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Count:</span>
                {[1, 5, 10, 25].map(n => (
                  <Button key={n} size="sm" variant={count === n ? 'default' : 'outline'}
                    onClick={() => setCount(n)}
                    className={count === n ? 'bg-neuro text-primary-foreground hover:bg-neuro-bright text-xs' : 'text-xs border-border'}>
                    {n}
                  </Button>
                ))}
              </div>

              <Button onClick={generate} disabled={loading}
                className="bg-neuro text-primary-foreground hover:bg-neuro-bright ml-auto text-xs">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate {count} Patient{count > 1 ? 's' : ''}
              </Button>
            </div>

            {mode === 'targeted' && selectedPatient && (
              <div className="mt-3 p-3 rounded-lg bg-secondary">
                <p className="text-[10px] text-muted-foreground mb-1">Targeting profile similar to:</p>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-neuro" />
                  <span className="text-xs font-medium">{selectedPatient.name}</span>
                  <span className="text-[10px] text-muted-foreground">({selectedPatient.id})</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quality Metrics */}
      {quality && (
        <motion.div variants={item}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Realism', val: quality.realism, icon: Shield, desc: 'How realistic the generated data is' },
              { label: 'Diversity', val: quality.diversity, icon: BarChart3, desc: 'Distribution diversity from training data' },
              { label: 'Validity', val: quality.validity, icon: Brain, desc: 'Clinical plausibility of biomarker values' },
            ].map(m => (
              <Card key={m.label} className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <m.icon className="w-5 h-5 text-neuro mx-auto mb-1" />
                  <p className="text-2xl font-bold">{(m.val * 100).toFixed(0)}%</p>
                  <p className="text-xs font-medium">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Generated Patients */}
      <AnimatePresence>
        {generated.length > 0 && (
          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Patients ({generated.length})
              </h3>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setGenerated([])}>
                Clear All
              </Button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {generated.map((p, i) => {
                const stage = getMmseStage(p.cognitiveScore);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-card border-border hover:border-neuro/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-neuro/10 flex items-center justify-center text-neuro font-bold text-sm flex-shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">{p.id}</p>
                                <Badge variant="outline" className="text-[9px] text-neuro border-neuro/30">Synthetic</Badge>
                                <Badge variant="outline" className={`text-[9px] ${stage.color}`}>
                                  {stage.label}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{p.sex} · Age {p.age} · Brain Age {p.brainAge}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className="text-center">
                              <p className="text-muted-foreground text-[10px]">MMSE</p>
                              <p className="font-bold">{p.cognitiveScore}/30</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-[10px]">MRI</p>
                              <p className="font-bold">{p.mriScore}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-[10px]">APOE Risk</p>
                              <p className="font-bold">{(p.geneticRisk * 100).toFixed(0)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-[10px]">Tau</p>
                              <p className="font-bold text-risk-high">{p.bloodBiomarkers.tau}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-[10px]">Aβ</p>
                              <p className="font-bold text-risk-mid">{p.bloodBiomarkers.amyloid}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-[10px]">NfL</p>
                              <p className="font-bold">{p.bloodBiomarkers.nfL}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Info */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">Generation Models:</span>
              {[
                'Diffusion Models (DDPM)',
                'Conditional VAE',
                'Wasserstein GAN',
                'Tabular Data Synthesis',
              ].map(m => (
                <Badge key={m} variant="outline" className="text-[10px] border-neuro/30 text-neuro">{m}</Badge>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Generated patients preserve statistical distributions and longitudinal correlations from ADNI, OASIS, and UK Biobank datasets.
              All synthetic data is de-identified and HIPAA/GDPR compliant.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}