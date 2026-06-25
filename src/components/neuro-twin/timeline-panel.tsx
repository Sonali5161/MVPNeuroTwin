'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { Clock, TrendingDown, Brain, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface TimelinePoint {
  time: string;
  mmse: number;
  adas: number;
  cdr: number;
  mriAtrophy: number;
  dailyFunction: number;
}

export default function TimelinePanel() {
  const { selectedPatient } = useNeuroStore();
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/neuro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'timeline', patientId: selectedPatient?.id }),
      });
      const data = await res.json();
      setTimeline(data.timeline);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient?.id]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  if (!selectedPatient || !timeline.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading timeline...</div>
      </div>
    );
  }

  const currentMmse = timeline[0].mmse;
  const threeYearMmse = timeline[4]?.mmse ?? timeline[timeline.length - 1].mmse;
  const fiveYearMmse = timeline[5]?.mmse ?? timeline[timeline.length - 1].mmse;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Disease Timeline Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Longitudinal progression prediction over 10 years · {selectedPatient.name}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTimeline} disabled={loading}
          className="border-neuro/30 text-neuro hover:bg-neuro/10">
          <Clock className="w-3.5 h-3.5 mr-2" /> Regenerate
        </Button>
      </motion.div>

      {/* Key Predictions */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Brain className="w-5 h-5 text-neuro mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Current MMSE</p>
            <p className="text-2xl font-bold">{currentMmse}/30</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-5 h-5 text-risk-mid mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">3-Year MMSE</p>
            <p className="text-2xl font-bold text-risk-mid">{threeYearMmse}/30</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-risk-high mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">5-Year MMSE</p>
            <p className="text-2xl font-bold text-risk-high">{fiveYearMmse}/30</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Activity className="w-5 h-5 text-neuro mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">5-Year Function</p>
            <p className="text-2xl font-bold">{timeline[5]?.dailyFunction ?? 0}%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* MMSE + ADAS Chart */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Cognitive Trajectory</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px] border-neuro/40 text-neuro">MMSE (higher = better)</Badge>
                <Badge variant="outline" className="text-[10px] border-risk-high/40 text-risk-high">ADAS-Cog (lower = better)</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
                <XAxis dataKey="time" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                <RTooltip
                  contentStyle={{ background: 'oklch(0.17 0.008 250)', border: '1px solid oklch(0.28 0.01 250)', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="mmse" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 4 }} name="MMSE" />
                <Line type="monotone" dataKey="adas" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="ADAS-Cog" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* MRI Atrophy + Daily Function */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">MRI Brain Atrophy Progression</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
                  <XAxis dataKey="time" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <RTooltip
                    contentStyle={{ background: 'oklch(0.17 0.008 250)', border: '1px solid oklch(0.28 0.01 250)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Atrophy']}
                  />
                  <defs>
                    <linearGradient id="atrophyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="mriAtrophy" stroke="#f97316" strokeWidth={2} fill="url(#atrophyGrad)" name="Atrophy Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">Daily Function Score</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
                  <XAxis dataKey="time" tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'oklch(0.65 0.01 250)', fontSize: 11 }} domain={[0, 100]} />
                  <RTooltip
                    contentStyle={{ background: 'oklch(0.17 0.008 250)', border: '1px solid oklch(0.28 0.01 250)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, 'Function']}
                  />
                  <defs>
                    <linearGradient id="funcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="dailyFunction" stroke="#14b8a6" strokeWidth={2} fill="url(#funcGrad)" name="Daily Function" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CDR Staging */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Clinical Dementia Rating (CDR) Over Time</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-3">
              {timeline.map((t) => (
                <div key={t.time} className="flex-1 min-w-[80px] text-center p-3 rounded-lg bg-secondary">
                  <p className="text-[10px] text-muted-foreground mb-1">{t.time}</p>
                  <p className="text-lg font-bold">{t.cdr.toFixed(1)}</p>
                  <Badge variant="outline" className={`text-[9px] mt-1 ${
                    t.cdr === 0 ? 'border-risk-low/40 text-risk-low' :
                    t.cdr === 0.5 ? 'border-risk-mid/40 text-risk-mid' :
                    'border-risk-high/40 text-risk-high'
                  }`}>
                    {t.cdr === 0 ? 'Normal' : t.cdr === 0.5 ? 'MCI' : t.cdr <= 1 ? 'Mild' : t.cdr <= 2 ? 'Moderate' : 'Severe'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}