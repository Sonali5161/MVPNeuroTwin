'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfraStore, type MLModel, type StorageService, type ServiceStatus } from '@/lib/infra-store';
import {
  Server, Cloud, Database, Clock, Activity, Cpu, HardDrive,
  RefreshCw, ChevronRight, ArrowRight, Zap, Wifi, WifiOff,
  AlertTriangle, CheckCircle2, XCircle, Loader2, Box,
  Brain, Network, Search, Sparkles, Mic, Pill, LayoutGrid,
  TrendingUp, TrendingDown, Minus, Shield, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const statusConfig: Record<ServiceStatus, { label: string; color: string; bg: string; icon: React.ElementType; dot: string }> = {
  connected: { label: 'Connected', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2, dot: 'bg-emerald-400' },
  degraded: { label: 'Degraded', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle, dot: 'bg-amber-400' },
  syncing: { label: 'Syncing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Loader2, dot: 'bg-blue-400 animate-pulse' },
  disconnected: { label: 'Disconnected', color: 'text-muted-foreground', bg: 'bg-muted/10 border-border', icon: XCircle, dot: 'bg-muted-foreground' },
  error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle, dot: 'bg-red-400' },
};

const providerIcons: Record<string, React.ElementType> = {
  'AWS S3': Cloud,
  'Azure Blob Storage': Cloud,
  'Pinecone': Search,
  'Weaviate': Database,
  'InfluxDB Cloud': Activity,
  'InfluxDB Edge': Activity,
};

const modelIcons: Record<string, React.ElementType> = {
  'vit-brain-age': Brain,
  'gnn-brain-network': Network,
  'ts-transformer': Clock,
  'clinical-bert': FileText,
  'vae-synthetic': Sparkles,
  'whisper-speech': Mic,
  'rl-treatment': Pill,
  'moe-fusion': LayoutGrid,
};

type TabId = 'overview' | 'ml-models' | 'storage' | 'pipelines';

export default function InfrastructurePanel() {
  const { mlModels, storageServices, pipelines, selectedService, setSelectedService, refreshService } = useInfraStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [liveLatencies, setLiveLatencies] = useState<Record<string, number>>({});

  // Simulate live latency pings
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLatencies((prev) => {
        const next = { ...prev };
        mlModels.forEach((m) => {
          next[m.id] = Math.max(5, (prev[m.id] || m.latency) + Math.floor((Math.random() - 0.5) * 30));
        });
        storageServices.forEach((s) => {
          next[s.id] = Math.max(1, (prev[s.id] || s.latency) + Math.floor((Math.random() - 0.5) * 8));
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [mlModels, storageServices]);

  const handleRefresh = useCallback(async (id: string) => {
    setRefreshing(id);
    await refreshService(id);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(null);
  }, [refreshService]);

  const overallHealth = useMemo(() => {
    const allServices = [...mlModels, ...storageServices];
    const connected = allServices.filter((s) => s.status === 'connected').length;
    const degraded = allServices.filter((s) => s.status === 'degraded' || s.status === 'syncing').length;
    return { connected, degraded, total: allServices.length, healthy: degraded === 0 };
  }, [mlModels, storageServices]);

  const totalGPUHours = useMemo(() => mlModels.reduce((sum, m) => sum + m.uptime * (m.gpu.includes('CPU') ? 0 : 1), 0), [mlModels]);

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'ml-models', label: 'ML Models', icon: Cpu, count: mlModels.length },
    { id: 'storage', label: 'Storage & Databases', icon: Database, count: storageServices.length },
    { id: 'pipelines', label: 'Data Pipelines', icon: ArrowRight, count: pipelines.length },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Server className="w-6 h-6 text-neuro" />
            Backend Infrastructure
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real ML microservices · Cloud object storage · Vector similarity search · Time-series ingestion
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('px-3 py-1 text-xs', overallHealth.healthy ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10')}>
            {overallHealth.healthy ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
            {overallHealth.connected}/{overallHealth.total} Services Healthy
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 bg-card rounded-lg p-1 border border-border w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all',
                activeTab === tab.id ? 'bg-neuro/15 text-neuro' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <Badge variant="secondary" className="text-[9px] px-1 h-4 ml-0.5">{tab.count}</Badge>
              )}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'ML Models Deployed', value: mlModels.length, sub: `${mlModels.filter(m => m.gpu.includes('A100')).length} on A100`, icon: Cpu, color: 'text-blue-400' },
                { label: 'Cloud Storage', value: `${((8.4 + 1.9) / 1000 * 100).toFixed(1)} TB`, sub: 'Across S3 + Azure', icon: Cloud, color: 'text-cyan-400' },
                { label: 'Vector Index', value: '1.57M', sub: 'Pinecone + Weaviate', icon: Search, color: 'text-purple-400' },
                { label: 'Time-Series Points', value: '892.4M', sub: 'InfluxDB Cloud + Edge', icon: Activity, color: 'text-emerald-400' },
              ].map((s) => (
                <Card key={s.label} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className={cn('w-4 h-4', s.color)} />
                      <div className={cn('w-2 h-2 rounded-full animate-pulse', overallHealth.healthy ? 'bg-emerald-400' : 'bg-amber-400')} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5">{s.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 4 Service Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ML Microservices Card */}
              <Card className="bg-card border-border hover:border-neuro/30 transition-colors cursor-pointer" onClick={() => setActiveTab('ml-models')}>
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">ML Microservices</CardTitle>
                        <p className="text-[10px] text-muted-foreground">Python (PyTorch/TensorFlow) via FastAPI + TorchServe</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-1">
                      {mlModels.slice(0, 5).map((m) => {
                        const sc = statusConfig[m.status];
                        return <div key={m.id} className={cn('w-5 h-5 rounded-full border-2 border-card', sc.dot)} />;
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">{mlModels.filter(m => m.status === 'connected').length}/{mlModels.length} healthy</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: 'GPU Nodes', v: '4x A100 + 2x T4' },
                      { l: 'Avg Inference', v: `${Math.round(mlModels.reduce((s,m) => s + m.latency, 0) / mlModels.length)}ms` },
                      { l: 'Total Req/s', v: String(mlModels.reduce((s,m) => s + m.throughput, 0)) },
                    ].map((x) => (
                      <div key={x.l} className="text-center">
                        <p className="text-xs font-medium text-foreground">{x.v}</p>
                        <p className="text-[9px] text-muted-foreground">{x.l}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cloud Object Storage Card */}
              <Card className="bg-card border-border hover:border-neuro/30 transition-colors cursor-pointer" onClick={() => setActiveTab('storage')}>
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Cloud Object Storage</CardTitle>
                        <p className="text-[10px] text-muted-foreground">AWS S3 (MRI) + Azure Blob (Genomics/EHR)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-1">
                      {storageServices.filter(s => s.type === 'object').map((s) => {
                        const sc = statusConfig[s.status];
                        return <div key={s.id} className={cn('w-5 h-5 rounded-full border-2 border-card', sc.dot)} />;
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">MRI + Genomics + EHR</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: 'Total Stored', v: '10.3 TB' },
                      { l: 'MRI Objects', v: '2.85M' },
                      { l: 'Avg GET Latency', v: '31ms' },
                    ].map((x) => (
                      <div key={x.l} className="text-center">
                        <p className="text-xs font-medium text-foreground">{x.v}</p>
                        <p className="text-[9px] text-muted-foreground">{x.l}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vector Database Card */}
              <Card className="bg-card border-border hover:border-neuro/30 transition-colors cursor-pointer" onClick={() => setActiveTab('storage')}>
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                        <Search className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Vector Databases</CardTitle>
                        <p className="text-[10px] text-muted-foreground">Pinecone (similarity) + Weaviate (RAG embeddings)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-1">
                      {storageServices.filter(s => s.type === 'vector').map((s) => {
                        const sc = statusConfig[s.status];
                        return <div key={s.id} className={cn('w-5 h-5 rounded-full border-2 border-card', sc.dot)} />;
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">Patient sim + RAG</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: 'Total Vectors', v: '1.57M' },
                      { l: 'Query Latency', v: '12-45ms' },
                      { l: 'Queries/24h', v: '6,060' },
                    ].map((x) => (
                      <div key={x.l} className="text-center">
                        <p className="text-xs font-medium text-foreground">{x.v}</p>
                        <p className="text-[9px] text-muted-foreground">{x.l}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time-Series DB Card */}
              <Card className="bg-card border-border hover:border-neuro/30 transition-colors cursor-pointer" onClick={() => setActiveTab('storage')}>
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Time-Series Database</CardTitle>
                        <p className="text-[10px] text-muted-foreground">InfluxDB Cloud (longitudinal) + Edge (wearable streams)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-1">
                      {storageServices.filter(s => s.type === 'timeseries').map((s) => {
                        const sc = statusConfig[s.status];
                        return <div key={s.id} className={cn('w-5 h-5 rounded-full border-2 border-card', sc.dot)} />;
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">892M+ data points</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: 'Active Streams', v: '2,340' },
                      { l: 'Ingest Rate', v: '125K/s' },
                      { l: 'Query p95', v: '8ms' },
                    ].map((x) => (
                      <div key={x.l} className="text-center">
                        <p className="text-xs font-medium text-foreground">{x.v}</p>
                        <p className="text-[9px] text-muted-foreground">{x.l}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Flow Pipeline Visual */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-neuro" />
                  Data Pipeline Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'MRI (PACS)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                    { label: 'WGS (Illumina)', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                    { label: 'Lab (HL7 FHIR)', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
                    { label: 'Wearables', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                    { label: 'Speech Audio', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                    { label: 'EHR (Epic)', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
                    { label: 'Cognitive', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
                  ].map((src) => (
                    <div key={src.label} className={cn('px-2 py-1 rounded-md border text-[10px] font-medium', src.color)}>
                      {src.label}
                    </div>
                  ))}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="px-2 py-1 rounded-md bg-neuro/20 text-neuro border border-neuro/30 text-[10px] font-medium">
                    ETL Pipeline
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  {[
                    { label: 'AWS S3', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                    { label: 'Azure Blob', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
                    { label: 'Pinecone', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
                    { label: 'Weaviate', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
                    { label: 'InfluxDB', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
                  ].map((dst) => (
                    <div key={dst.label} className={cn('px-2 py-1 rounded-md border text-[10px] font-medium', dst.color)}>
                      {dst.label}
                    </div>
                  ))}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="px-2 py-1 rounded-md bg-neuro/20 text-neuro border border-neuro/30 text-[10px] font-medium">
                    ML Inference
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ===== ML MODELS TAB ===== */}
        {activeTab === 'ml-models' && (
          <motion.div key="ml-models" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* MoE Router Highlight */}
            <Card className="bg-neuro/5 border-neuro/20 glow-neuro">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neuro/20 flex items-center justify-center flex-shrink-0">
                    <LayoutGrid className="w-5 h-5 text-neuro" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Mixture of Experts — Central Fusion Router</h3>
                    <p className="text-xs text-muted-foreground mt-1">Routes modality features through 8 specialized expert networks. 4x A100 GPUs, 120 req/s throughput.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                      {[
                        { l: 'Architecture', v: 'Top-K Gating (K=3)' },
                        { l: 'Total Params', v: '2.1B (260M active)' },
                        { l: 'Active GPUs', v: '4x A100 80GB' },
                        { l: 'p50 Latency', v: `${liveLatencies['moe-fusion'] || 95}ms` },
                        { l: 'Throughput', v: '120 req/s' },
                      ].map((x) => (
                        <div key={x.l}>
                          <p className="text-[9px] text-muted-foreground">{x.l}</p>
                          <p className="text-xs font-medium text-foreground">{x.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All ML Models */}
            <div className="space-y-3">
              {mlModels.map((model) => {
                const sc = statusConfig[model.status];
                const StatusIcon = sc.icon;
                const Icon = modelIcons[model.id] || Cpu;
                const liveLat = liveLatencies[model.id] || model.latency;
                const isSelected = selectedService === model.id;
                return (
                  <Card
                    key={model.id}
                    className={cn(
                      'bg-card border transition-all cursor-pointer',
                      isSelected ? 'border-neuro/50 glow-neuro' : 'border-border hover:border-neuro/20'
                    )}
                    onClick={() => setSelectedService(isSelected ? null : model.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4.5 h-4.5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-foreground">{model.name}</h4>
                            <Badge variant="outline" className={cn('text-[9px] h-4', sc.bg, sc.color)}>
                              <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                              {sc.label}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] h-4 border-border text-muted-foreground">
                              {model.version}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{model.description}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px]">
                            <span className="text-muted-foreground">{model.architecture}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{model.framework}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{model.parameters} params</span>
                          </div>

                          {/* Metrics Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                            {[
                              { l: 'p50 Latency', v: `${liveLat}ms`, accent: liveLat > model.p99 * 0.8 ? 'text-amber-400' : 'text-foreground' },
                              { l: 'p99 Latency', v: `${model.p99}ms`, accent: 'text-muted-foreground' },
                              { l: 'Throughput', v: `${model.throughput} req/s`, accent: 'text-foreground' },
                              { l: 'Accuracy', v: `${(model.accuracy * 100).toFixed(0)}%`, accent: 'text-emerald-400' },
                              { l: 'GPU', v: model.gpu.includes('CPU') ? 'CPU (32c)' : model.gpu.split(' ')[1], accent: 'text-blue-400' },
                            ].map((x) => (
                              <div key={x.l}>
                                <p className="text-[9px] text-muted-foreground">{x.l}</p>
                                <p className={cn('text-xs font-medium font-mono', x.accent)}>{x.v}</p>
                              </div>
                            ))}
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-border">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                      <span className="text-muted-foreground">Endpoint: </span>
                                      <code className="text-neuro font-mono">{model.endpoint}</code>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Input Shape: </span>
                                      <code className="text-foreground font-mono">{model.inputShape}</code>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Uptime: </span>
                                      <span className="text-foreground">{Math.floor(model.uptime / 24)}d {Math.floor(model.uptime % 24)}h</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Last Deployed: </span>
                                      <span className="text-foreground">{new Date(model.lastDeployed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 h-7 text-[10px] gap-1.5"
                                    onClick={(e) => { e.stopPropagation(); handleRefresh(model.id); }}
                                    disabled={refreshing === model.id}
                                  >
                                    <RefreshCw className={cn('w-3 h-3', refreshing === model.id && 'animate-spin')} />
                                    Health Check
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Live indicator */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <div className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                            <span className="text-[9px] text-muted-foreground">Live</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-mono">{liveLat}ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== STORAGE TAB ===== */}
        {activeTab === 'storage' && (
          <motion.div key="storage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {(['object', 'vector', 'timeseries'] as const).map((type) => {
              const services = storageServices.filter((s) => s.type === type);
              const typeLabels = { object: 'Cloud Object Storage', vector: 'Vector Databases', timeseries: 'Time-Series Databases' };
              const typeIcons = { object: Cloud, vector: Search, timeseries: Activity };
              const TypeIcon = typeIcons[type];
              return (
                <div key={type}>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <TypeIcon className="w-4 h-4 text-neuro" />
                    {typeLabels[type]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map((service) => {
                      const sc = statusConfig[service.status];
                      const StatusIcon = sc.icon;
                      const ProviderIcon = providerIcons[service.provider] || Database;
                      const liveLat = liveLatencies[service.id] || service.latency;
                      const isSelected = selectedService === service.id;
                      return (
                        <Card
                          key={service.id}
                          className={cn(
                            'bg-card border transition-all cursor-pointer',
                            isSelected ? 'border-neuro/50 glow-neuro' : 'border-border hover:border-neuro/20'
                          )}
                          onClick={() => setSelectedService(isSelected ? null : service.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <ProviderIcon className="w-5 h-5 text-neuro" />
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground">{service.name}</h4>
                                  <p className="text-[10px] text-muted-foreground">{service.provider} · {service.region}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn('text-[9px] h-4', sc.bg, sc.color)}>
                                <StatusIcon className={cn('w-2.5 h-2.5 mr-0.5', service.status === 'syncing' && 'animate-spin')} />
                                {sc.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {[
                                { l: 'Endpoint', v: service.endpoint.split('/').slice(-1)[0] || service.endpoint.split('//')[1]?.split('/')[0] || '', mono: true },
                                { l: 'Storage', v: service.usedStorage },
                                { l: 'Latency', v: `${liveLat}ms`, mono: true },
                                { l: 'Encryption', v: service.encryption.split('+')[0].trim() },
                              ].map((x) => (
                                <div key={x.l}>
                                  <p className="text-[9px] text-muted-foreground">{x.l}</p>
                                  <p className={cn('text-[11px] font-medium', x.mono ? 'font-mono text-foreground' : 'text-foreground')}>{x.v}</p>
                                </div>
                              ))}
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-1.5">
                              {service.metrics.map((m) => (
                                <div key={m.label} className="flex items-center justify-between p-1.5 rounded bg-background/50">
                                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-medium text-foreground">{m.value}</span>
                                    {m.trend === 'up' && <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />}
                                    {m.trend === 'down' && <TrendingDown className="w-2.5 h-2.5 text-red-400" />}
                                    {m.trend === 'stable' && <Minus className="w-2.5 h-2.5 text-muted-foreground" />}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                    <div className="text-[10px] text-muted-foreground">
                                      Last sync: {new Date(service.lastSync).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[10px] gap-1.5"
                                      onClick={(e) => { e.stopPropagation(); handleRefresh(service.id); }}
                                      disabled={refreshing === service.id}
                                    >
                                      <RefreshCw className={cn('w-3 h-3', refreshing === service.id && 'animate-spin')} />
                                      Reconnect
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ===== PIPELINES TAB ===== */}
        {activeTab === 'pipelines' && (
          <motion.div key="pipelines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pipelines.map((pipe) => {
                const sc = statusConfig[pipe.status];
                const StatusIcon = sc.icon;
                return (
                  <Card key={pipe.id} className="bg-card border-border hover:border-neuro/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xs font-semibold text-foreground">{pipe.name}</h4>
                        <Badge variant="outline" className={cn('text-[9px] h-4 flex-shrink-0', sc.bg, sc.color)}>
                          <StatusIcon className={cn('w-2.5 h-2.5 mr-0.5', pipe.status === 'syncing' && 'animate-spin')} />
                          {sc.label}
                        </Badge>
                      </div>

                      {/* Source → Destination flow */}
                      <div className="flex items-center gap-1.5 mb-3 text-[10px]">
                        <div className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground truncate max-w-[120px]">{pipe.source}</div>
                        <ArrowRight className="w-3 h-3 text-neuro flex-shrink-0" />
                        <div className="px-1.5 py-0.5 rounded bg-neuro/10 text-neuro truncate max-w-[140px]">{pipe.destination}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { l: 'Throughput', v: pipe.throughput },
                          { l: 'Records Processed', v: pipe.recordsProcessed.toLocaleString() },
                          { l: 'Errors (24h)', v: String(pipe.errors24h), accent: pipe.errors24h > 10 ? 'text-red-400' : pipe.errors24h > 0 ? 'text-amber-400' : 'text-emerald-400' },
                          { l: 'Last Run', v: new Date(pipe.lastRun).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
                        ].map((x) => (
                          <div key={x.l}>
                            <p className="text-[9px] text-muted-foreground">{x.l}</p>
                            <p className={cn('text-[11px] font-medium', 'accent' in x ? x.accent : 'text-foreground')}>{x.v}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pipeline Architecture Diagram */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neuro" />
                  Real-Time Ingestion Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {/* Layer 1: Sources */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Data Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {['Hospital PACS (DICOM)', 'Illumina WGS', 'Lab Instruments', 'Apple Watch / Fitbit / Oura', 'Speech Recordings', 'Epic EHR', 'Cognitive Tests'].map((s) => (
                        <div key={s} className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground border border-border text-[10px]">{s}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-neuro rotate-90" /></div>
                  {/* Layer 2: Ingestion */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Ingestion Layer (Kafka + k8s Workers)</p>
                    <div className="flex flex-wrap gap-2">
                      {pipelines.map((p) => (
                        <div key={p.id} className={cn('px-2 py-1 rounded-md border text-[10px] font-medium',
                          p.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          p.status === 'degraded' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        )}>
                          {p.name.split(' ').slice(0, 2).join(' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-neuro rotate-90" /></div>
                  {/* Layer 3: Storage */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Storage & Indexing Layer</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'AWS S3 (NIfTI MRI)', c: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
                        { label: 'Azure Blob (VCF/EHR)', c: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
                        { label: 'Pinecone (768-dim vectors)', c: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
                        { label: 'Weaviate (RAG chunks)', c: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
                        { label: 'InfluxDB Cloud (longitudinal)', c: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
                        { label: 'InfluxDB Edge (wearable hot)', c: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                      ].map((s) => (
                        <div key={s.label} className={cn('px-2 py-1 rounded-md border text-[10px] font-medium', s.c)}>{s.label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-neuro rotate-90" /></div>
                  {/* Layer 4: ML */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">ML Inference Layer (Python Microservices)</p>
                    <div className="flex flex-wrap gap-2">
                      {mlModels.map((m) => (
                        <div key={m.id} className={cn('px-2 py-1 rounded-md border text-[10px] font-medium',
                          m.status === 'connected' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          m.status === 'degraded' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-muted text-muted-foreground border-border'
                        )}>
                          {m.name.split(' ').slice(0, 2).join(' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}