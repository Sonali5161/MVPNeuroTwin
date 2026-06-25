'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  HardDriveDownload, RefreshCw, CheckCircle2, Loader2, XCircle, ExternalLink,
  Brain, Dna, Droplets, Mic, Moon, Watch, FileText, Users, Calendar, Database,
  BarChart3, ArrowRight, Plug, Zap, Shield, Clock, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type ModalityKey = 'mri' | 'genetics' | 'blood' | 'speech' | 'sleep' | 'activity' | 'cognitive' | 'ehr';

interface Dataset {
  id: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  version: string;
  lastSync: string;
  patients: number;
  patientsWithAD: number;
  controls: number;
  mciPatients: number;
  ageRange: string;
  followUpYears: string;
  modalities: { key: ModalityKey; label: string; icon: React.ElementType; available: boolean; count: string }[];
  features: string[];
}

const datasets: Dataset[] = [
  {
    id: 'adni',
    name: 'ADNI',
    fullName: "Alzheimer's Disease Neuroimaging Initiative",
    description: 'The premier multicenter longitudinal study of AD biomarkers. Includes T1/T2 MRI, FDG-PET, Amyloid PET, Tau PET, CSF biomarkers, genetics, and comprehensive neuropsychological assessments from 63+ sites across North America.',
    url: 'https://adni.loni.usc.edu',
    version: 'ADNI 3 (2024 Release)',
    lastSync: '2 hours ago',
    patients: 2837,
    patientsWithAD: 842,
    controls: 982,
    mciPatients: 1013,
    ageRange: '55–90',
    followUpYears: 'Up to 15+',
    modalities: [
      { key: 'mri', label: 'MRI (T1/T2/DTI/fMRI)', icon: Brain, available: true, count: '42,300 scans' },
      { key: 'genetics', label: 'Genetics (WGS/SNP)', icon: Dna, available: true, count: '2,837 genomes' },
      { key: 'blood', label: 'CSF & Blood Biomarkers', icon: Droplets, available: true, count: '18,400 samples' },
      { key: 'speech', label: 'Speech Recordings', icon: Mic, available: true, count: '5,200 recordings' },
      { key: 'sleep', label: 'Sleep Actigraphy', icon: Moon, available: false, count: '—' },
      { key: 'activity', label: 'Activity Monitoring', icon: Watch, available: false, count: '—' },
      { key: 'cognitive', label: 'Cognitive Tests (MMSE/ADAS/CDR)', icon: FileText, available: true, count: '28,300 visits' },
      { key: 'ehr', label: 'Clinical Assessments', icon: Database, available: true, count: '12,600 records' },
    ],
    features: ['Longitudinal design (15+ years)', 'Standardized protocols', 'Open access with data use agreement', 'PET amyloid and tau imaging', 'Plasma biomarker validation'],
  },
  {
    id: 'oasis',
    name: 'OASIS',
    fullName: 'Open Access Series of Imaging Studies',
    description: 'A collection of neuroimaging datasets freely available to the scientific community. Includes cross-sectional and longitudinal MRI data with clinical and cognitive assessments, spanning healthy aging to advanced dementia.',
    url: 'https://www.oasis-brains.org',
    version: 'OASIS-3 (2023)',
    lastSync: '6 hours ago',
    patients: 1419,
    patientsWithAD: 523,
    controls: 612,
    mciPatients: 284,
    ageRange: '42–95',
    followUpYears: 'Up to 12',
    modalities: [
      { key: 'mri', label: 'MRI (T1/T2/FLAIR)', icon: Brain, available: true, count: '11,200 scans' },
      { key: 'genetics', label: 'Genetics (GWAS)', icon: Dna, available: true, count: '1,419 genotypes' },
      { key: 'blood', label: 'Blood Biomarkers', icon: Droplets, available: false, count: '—' },
      { key: 'speech', label: 'Speech Data', icon: Mic, available: false, count: '—' },
      { key: 'sleep', label: 'Sleep Data', icon: Moon, available: false, count: '—' },
      { key: 'activity', label: 'Activity Data', icon: Watch, available: false, count: '—' },
      { key: 'cognitive', label: 'Cognitive Tests', icon: FileText, available: true, count: '8,400 visits' },
      { key: 'ehr', label: 'Clinical Records', icon: Database, available: true, count: '5,600 records' },
    ],
    features: ['Cross-sectional and longitudinal cohorts', 'T1, T2, FLAIR, and SWI sequences', 'Automated processing pipelines', 'No data use agreement required', 'Harmonized with ADNI protocols'],
  },
  {
    id: 'ukbiobank',
    name: 'UK Biobank',
    fullName: 'UK Biobank (Neuroimaging Sub-study)',
    description: 'Large-scale prospective epidemiological study with deep phenotyping. The neuroimaging sub-study provides brain MRI for 100,000+ participants along with genetics, blood biomarkers, activity tracking, and cognitive data from the full 500,000 cohort.',
    url: 'https://www.ukbiobank.ac.uk',
    version: 'Imaging V2 (2024)',
    lastSync: 'Syncing...',
    patients: 103768,
    patientsWithAD: 1847,
    controls: 98521,
    mciPatients: 3400,
    ageRange: '40–69 (at enrollment)',
    followUpYears: 'Up to 15',
    modalities: [
      { key: 'mri', label: 'MRI (T1/T2/DTI/fMRI/dMRI)', icon: Brain, available: true, count: '207,500 scans' },
      { key: 'genetics', label: 'Genetics (WGS/Array)', icon: Dna, available: true, count: '500,000 genomes' },
      { key: 'blood', label: 'Blood Biomarkers', icon: Droplets, available: true, count: '2.1M samples' },
      { key: 'speech', label: 'Speech Assessments', icon: Mic, available: false, count: '—' },
      { key: 'sleep', label: 'Sleep (Accelerometer)', icon: Moon, available: true, count: '103,700 traces' },
      { key: 'activity', label: 'Wrist-worn Activity', icon: Watch, available: true, count: '103,700 participants' },
      { key: 'cognitive', label: 'Cognitive Battery', icon: FileText, available: true, count: '500,000 assessments' },
      { key: 'ehr', label: 'EHR (Hospital/Primary Care)', icon: Database, available: true, count: '18.2M records' },
    ],
    features: ['Largest neuroimaging dataset globally', 'Linked hospital episode statistics', 'Wrist-worn accelerometer (7-day)', 'Diverse ancestry representation', 'Prospective design with repeated measures'],
  },
  {
    id: 'nacc',
    name: 'NACC',
    fullName: 'National Alzheimer\'s Coordinating Center',
    description: 'Uniform data from 39+ Alzheimer\'s Disease Research Centers (ADRCs) across the US. Provides standardized clinical, neuropathological, and biomarker data with exceptional diagnostic depth and longitudinal follow-up.',
    url: 'https://naccdata.org',
    version: 'UDS v4 (2024)',
    lastSync: 'Not connected',
    patients: 48250,
    patientsWithAD: 15420,
    controls: 12800,
    mciPatients: 20030,
    ageRange: '30–100+',
    followUpYears: 'Up to 25+',
    modalities: [
      { key: 'mri', label: 'MRI (Variable protocols)', icon: Brain, available: true, count: '62,000 scans' },
      { key: 'genetics', label: 'Genetics (Targeted/WGS)', icon: Dna, available: true, count: '32,000 genotypes' },
      { key: 'blood', label: 'CSF & Blood Biomarkers', icon: Droplets, available: true, count: '45,000 samples' },
      { key: 'speech', label: 'Language Assessments', icon: Mic, available: false, count: '—' },
      { key: 'sleep', label: 'Sleep Data', icon: Moon, available: false, count: '—' },
      { key: 'activity', label: 'Activity Data', icon: Watch, available: false, count: '—' },
      { key: 'cognitive', label: 'Full Neuropsych Battery', icon: FileText, available: true, count: '215,000 visits' },
      { key: 'ehr', label: 'Clinical & Neuropath', icon: Database, available: true, count: '215,000 records' },
    ],
    features: ['39+ ADRCs with standardized UDS', 'Neuropathological confirmation', 'Autopsy-linked clinical data', 'Diverse clinical staging', 'Longest follow-up of any AD cohort'],
  },
];

const modalityColors: Record<ModalityKey, string> = {
  mri: 'text-[#14b8a6]',
  genetics: 'text-[#a855f7]',
  blood: 'text-[#ef4444]',
  speech: 'text-[#f97316]',
  sleep: 'text-[#6366f1]',
  activity: 'text-[#22c55e]',
  cognitive: 'text-[#eab308]',
  ehr: 'text-[#ec4899]',
};

function StatusIndicator({ status }: { status: 'connected' | 'syncing' | 'disconnected' }) {
  if (status === 'connected') return <CheckCircle2 className="w-4 h-4 text-risk-low" />;
  if (status === 'syncing') return <Loader2 className="w-4 h-4 text-risk-mid animate-spin" />;
  return <XCircle className="w-4 h-4 text-muted-foreground/50" />;
}

function StatusBadge({ status }: { status: 'connected' | 'syncing' | 'disconnected' }) {
  if (status === 'connected') return <Badge className="bg-risk-low/15 text-risk-low border-0 text-[10px]">Connected</Badge>;
  if (status === 'syncing') return <Badge className="bg-risk-mid/15 text-risk-mid border-0 text-[10px]">Syncing</Badge>;
  return <Badge className="bg-secondary text-muted-foreground border-0 text-[10px]">Disconnected</Badge>;
}

export default function DatasetsPanel() {
  const { datasetStatus, setDatasetStatus } = useNeuroStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setDatasetStatus(id, 'syncing');
    setTimeout(() => setDatasetStatus(id, 'connected'), 3000);
  };

  const totalPatients = datasets.reduce((s, d) => s + d.patients, 0);
  const totalAD = datasets.reduce((s, d) => s + d.patientsWithAD, 0);
  const connectedCount = Object.values(datasetStatus).filter(s => s === 'connected').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <h2 className="text-2xl font-bold text-foreground">Public Datasets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {connectedCount}/{datasets.length} sources connected · Training data for the Digital Twin AI models
        </p>
      </motion.div>

      {/* Aggregate Stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Database className="w-5 h-5 text-neuro mx-auto mb-1" />
              <p className="text-2xl font-bold">{(totalPatients / 1000).toFixed(0)}K+</p>
              <p className="text-[10px] text-muted-foreground">Total Participants</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 text-neuro mx-auto mb-1" />
              <p className="text-2xl font-bold">{(totalAD / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground">AD / MCI Patients</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-5 h-5 text-neuro mx-auto mb-1" />
              <p className="text-2xl font-bold">7</p>
              <p className="text-[10px] text-muted-foreground">Data Modalities</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Calendar className="w-5 h-5 text-neuro mx-auto mb-1" />
              <p className="text-2xl font-bold">25+yr</p>
              <p className="text-[10px] text-muted-foreground">Max Follow-up</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Modality Coverage Matrix */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-neuro" /> Modality Coverage Across Datasets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Modality</th>
                    {datasets.map(d => (
                      <th key={d.id} className="text-center py-2 px-2 font-medium min-w-[80px]">{d.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasets[0].modalities.map((mod) => (
                    <tr key={mod.key} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <mod.icon className={`w-3.5 h-3.5 ${modalityColors[mod.key]}`} />
                          <span className="font-medium">{mod.label.split(' (')[0]}</span>
                        </div>
                      </td>
                      {datasets.map(d => {
                        const dMod = d.modalities.find(m => m.key === mod.key);
                        return (
                          <td key={d.id} className="text-center py-2.5 px-2">
                            {dMod?.available ? (
                              <div>
                                <CheckCircle2 className="w-4 h-4 text-risk-low mx-auto mb-0.5" />
                                <p className="text-[9px] text-muted-foreground">{dMod.count}</p>
                              </div>
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dataset Cards */}
      <motion.div variants={item} className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Sources</h3>
        {datasets.map((ds) => {
          const status = datasetStatus[ds.id] ?? 'disconnected';
          const isExpanded = expandedId === ds.id;
          const adPercent = ((ds.patientsWithAD / ds.patients) * 100).toFixed(0);

          return (
            <Card key={ds.id} className="bg-card border-border hover:border-neuro/30 transition-colors">
              <CardContent className="p-4">
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neuro/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-5 h-5 text-neuro" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold">{ds.name}</h4>
                      <StatusBadge status={status} />
                      <Badge variant="outline" className="text-[9px]">{ds.version}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{ds.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : ds.id)}
                      className="text-xs border-border h-7"
                    >
                      {isExpanded ? 'Collapse' : 'Details'}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => window.open(ds.url, '_blank', 'noopener')}
                      className="text-xs text-neuro h-7 px-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <Users className="w-3.5 h-3.5 text-neuro mx-auto mb-0.5" />
                    <p className="text-sm font-bold">{ds.patients.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <Brain className="w-3.5 h-3.5 text-risk-high mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-risk-high">{ds.patientsWithAD.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">AD ({adPercent}%)</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <Shield className="w-3.5 h-3.5 text-risk-low mx-auto mb-0.5" />
                    <p className="text-sm font-bold">{ds.controls.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Controls</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <Clock className="w-3.5 h-3.5 text-risk-mid mx-auto mb-0.5" />
                    <p className="text-sm font-bold">{ds.mciPatients.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">MCI</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-0.5" />
                    <p className="text-sm font-bold">{ds.followUpYears}</p>
                    <p className="text-[9px] text-muted-foreground">Follow-up</p>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                  >
                    <Separator />

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">{ds.description}</p>

                    {/* Demographics bar */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Diagnosis Distribution</p>
                      <div className="flex h-6 rounded-full overflow-hidden">
                        <div className="bg-risk-low" style={{ width: `${(ds.controls / ds.patients) * 100}%` }} title={`Controls: ${ds.controls}`} />
                        <div className="bg-risk-mid" style={{ width: `${(ds.mciPatients / ds.patients) * 100}%` }} title={`MCI: ${ds.mciPatients}`} />
                        <div className="bg-risk-high" style={{ width: `${(ds.patientsWithAD / ds.patients) * 100}%` }} title={`AD: ${ds.patientsWithAD}`} />
                      </div>
                      <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                        <span>Controls ({ds.controls.toLocaleString()})</span>
                        <span>MCI ({ds.mciPatients.toLocaleString()})</span>
                        <span>AD ({ds.patientsWithAD.toLocaleString()})</span>
                      </div>
                    </div>

                    {/* Available modalities */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Available Modalities ({ds.modalities.filter(m => m.available).length}/{ds.modalities.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {ds.modalities.map((mod) => (
                          <div
                            key={mod.key}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                              mod.available ? 'bg-secondary' : 'bg-secondary/40 opacity-50'
                            }`}
                          >
                            <mod.icon className={`w-3.5 h-3.5 flex-shrink-0 ${mod.available ? modalityColors[mod.key] : 'text-muted-foreground'}`} />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{mod.label.split(' (')[0]}</p>
                              {mod.available && <p className="text-[9px] text-muted-foreground">{mod.count}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key features */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Key Features</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ds.features.map(f => (
                          <Badge key={f} variant="outline" className="text-[10px] border-border">{f}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Sync info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last synced: {ds.lastSync}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(ds.id)}
                        disabled={status === 'syncing'}
                        className="text-xs border-neuro/30 text-neuro hover:bg-neuro/10 h-7"
                      >
                        {status === 'syncing' ? (
                          <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Syncing...</>
                        ) : (
                          <><RefreshCw className="w-3 h-3 mr-1.5" /> Sync Now</>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Data Pipeline Info */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plug className="w-4 h-4 text-neuro" />
              <h3 className="text-sm font-semibold">Data Pipeline</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { step: 'Ingestion', desc: 'Automated ETL from ADNI LONI IDC, UK Biobank AMS, OASIS XNAT', icon: HardDriveDownload },
                { step: 'Preprocessing', desc: 'MONAI pipelines: skull-stripping, registration, segmentation, quality control', icon: Brain },
                { step: 'Feature Extraction', desc: 'ViT embeddings, ClinicalBERT tokens, GNN graphs, time-series features', icon: Zap },
                { step: 'Federation', desc: 'FAISS vector index, differential privacy, cross-dataset harmonization', icon: Shield },
              ].map(s => (
                <div key={s.step} className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1.5">
                    <s.icon className="w-4 h-4 text-neuro" />
                    <span className="text-xs font-semibold">{s.step}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}