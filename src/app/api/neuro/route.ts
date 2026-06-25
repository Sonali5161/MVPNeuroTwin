import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { type, patientId, drug, timeframe } = body;

  switch (type) {
    case 'brain-age':
      return NextResponse.json({
        actualAge: 68,
        brainAge: 78,
        gap: 10,
        confidence: 0.92,
        regions: [
          { name: 'Hippocampus', atrophy: 0.34, color: '#ef4444' },
          { name: 'Entorhinal Cortex', atrophy: 0.28, color: '#f97316' },
          { name: 'Temporal Lobe', atrophy: 0.22, color: '#eab308' },
          { name: 'Prefrontal Cortex', atrophy: 0.15, color: '#22c55e' },
          { name: 'Parietal Lobe', atrophy: 0.12, color: '#06b6d4' },
          { name: 'Occipital Lobe', atrophy: 0.05, color: '#14b8a6' },
        ],
      });

    case 'timeline':
      return NextResponse.json({
        timeline: [
          { time: 'Today', mmse: 24, adas: 12, cdr: 0.5, mriAtrophy: 0.12, dailyFunction: 85 },
          { time: '6 Months', mmse: 23, adas: 14, cdr: 0.5, mriAtrophy: 0.16, dailyFunction: 82 },
          { time: '1 Year', mmse: 21, adas: 16, cdr: 1.0, mriAtrophy: 0.21, dailyFunction: 76 },
          { time: '2 Years', mmse: 19, adas: 20, cdr: 1.0, mriAtrophy: 0.29, dailyFunction: 68 },
          { time: '3 Years', mmse: 16, adas: 25, cdr: 2.0, mriAtrophy: 0.38, dailyFunction: 55 },
          { time: '5 Years', mmse: 12, adas: 32, cdr: 2.0, mriAtrophy: 0.52, dailyFunction: 38 },
          { time: '10 Years', mmse: 6, adas: 45, cdr: 3.0, mriAtrophy: 0.71, dailyFunction: 15 },
        ],
      });

    case 'drug-simulate':
      const drugEffects: Record<string, Record<string, number[]>> = {
        donepezil: {
          mmse: [24, 23.5, 23, 22, 21, 19, 14],
          adas: [12, 12.5, 13, 14.5, 16, 20, 30],
        },
        memantine: {
          mmse: [24, 23.2, 22.5, 21, 19.5, 17, 12],
          adas: [12, 13, 14.5, 16.5, 19, 24, 36],
        },
        lecanemab: {
          mmse: [24, 24, 23.5, 23, 22, 20.5, 17],
          adas: [12, 11.5, 12, 13, 14.5, 18, 26],
        },
        placebo: {
          mmse: [24, 23, 21, 19, 16, 12, 6],
          adas: [12, 14, 16, 20, 25, 32, 45],
        },
      };
      const selected = drugEffects[(drug as string) || 'placebo'] || drugEffects.placebo;
      const timepoints = ['Baseline', '6mo', '1yr', '2yr', '3yr', '5yr', '10yr'];
      return NextResponse.json({
        drug: drug || 'placebo',
        timepoints,
        mmse: selected.mmse,
        adas: selected.adas,
        sideEffects: drug === 'lecanemab' ? ['ARIA (15%)', 'Headache (22%)', 'Infusion reaction (8%)'] :
          drug === 'donepezil' ? ['Nausea (18%)', 'Insomnia (12%)', 'Bradycardia (3%)'] :
            drug === 'memantine' ? ['Dizziness (10%)', 'Confusion (7%)', 'Headache (6%)'] :
              ['None'],
        efficacy: drug === 'lecanemab' ? 0.72 : drug === 'donepezil' ? 0.45 : drug === 'memantine' ? 0.38 : 0,
      });

    case 'xai':
      return NextResponse.json({
        shapValues: [
          { feature: 'Amyloid Beta (CSF)', value: 0.34, direction: 'high' },
          { feature: 'Hippocampal Volume', value: 0.28, direction: 'low' },
          { feature: 'APOE ε4 Status', value: 0.18, direction: 'high' },
          { feature: 'Tau (CSF)', value: 0.12, direction: 'high' },
          { feature: 'Sleep Efficiency', value: -0.08, direction: 'low' },
          { feature: 'Daily Step Count', value: -0.06, direction: 'low' },
          { feature: 'Speech Coherence', value: 0.05, direction: 'low' },
          { feature: 'Age', value: 0.04, direction: 'high' },
        ],
        gradcamRegions: [
          { region: 'Left Hippocampus', importance: 0.95, x: 35, y: 45 },
          { region: 'Right Hippocampus', importance: 0.91, x: 60, y: 45 },
          { region: 'Entorhinal Cortex', importance: 0.82, x: 42, y: 55 },
          { region: 'Posterior Cingulate', importance: 0.71, x: 50, y: 35 },
          { region: 'Angular Gyrus', importance: 0.58, x: 30, y: 30 },
          { region: 'Precuneus', importance: 0.52, x: 65, y: 30 },
        ],
        topGenes: [
          { gene: 'APOE', variant: 'ε4/ε4', impact: 'Very High', oddsRatio: 12.4 },
          { gene: 'TREM2', variant: 'R47H', impact: 'High', oddsRatio: 3.2 },
          { gene: 'BIN1', variant: 'rs744373', impact: 'Moderate', oddsRatio: 1.8 },
          { gene: 'CLU', variant: 'rs11136000', impact: 'Moderate', oddsRatio: 1.5 },
          { gene: 'PICALM', variant: 'rs3851179', impact: 'Low', oddsRatio: 1.2 },
        ],
      });

    case 'brain-network':
      return NextResponse.json({
        nodes: [
          { id: 'hippocampus', label: 'Hippocampus', group: 'medial_temporal', centrality: 0.94, degradation: 0.72 },
          { id: 'entorhinal', label: 'Entorhinal Cortex', group: 'medial_temporal', centrality: 0.89, degradation: 0.65 },
          { id: 'parahippocampal', label: 'Parahippocampal', group: 'medial_temporal', centrality: 0.78, degradation: 0.48 },
          { id: 'amygdala', label: 'Amygdala', group: 'medial_temporal', centrality: 0.72, degradation: 0.35 },
          { id: 'post_cingulate', label: 'Post. Cingulate', group: 'default_mode', centrality: 0.85, degradation: 0.58 },
          { id: 'precuneus', label: 'Precuneus', group: 'default_mode', centrality: 0.81, degradation: 0.52 },
          { id: 'mpfc', label: 'Medial PFC', group: 'default_mode', centrality: 0.76, degradation: 0.42 },
          { id: 'angular_gyrus', label: 'Angular Gyrus', group: 'default_mode', centrality: 0.69, degradation: 0.38 },
          { id: 'temporal_pole', label: 'Temporal Pole', group: 'lateral_temporal', centrality: 0.74, degradation: 0.55 },
          { id: 'middle_temporal', label: 'Mid. Temporal', group: 'lateral_temporal', centrality: 0.68, degradation: 0.45 },
          { id: 'inferior_temporal', label: 'Inf. Temporal', group: 'lateral_temporal', centrality: 0.62, degradation: 0.38 },
          { id: 'fusiform', label: 'Fusiform', group: 'ventral_visual', centrality: 0.58, degradation: 0.28 },
          { id: 'lingual', label: 'Lingual Gyrus', group: 'ventral_visual', centrality: 0.45, degradation: 0.18 },
          { id: 'dlpfc', label: 'Dorsolateral PFC', group: 'frontal', centrality: 0.65, degradation: 0.32 },
          { id: 'vlpfc', label: 'Ventrolateral PFC', group: 'frontal', centrality: 0.60, degradation: 0.28 },
          { id: 'primary_visual', label: 'Primary Visual', group: 'visual', centrality: 0.35, degradation: 0.08 },
        ],
        edges: [
          { source: 'hippocampus', target: 'entorhinal', strength: 0.92, change: -0.35 },
          { source: 'hippocampus', target: 'parahippocampal', strength: 0.88, change: -0.28 },
          { source: 'entorhinal', target: 'parahippocampal', strength: 0.85, change: -0.30 },
          { source: 'hippocampus', target: 'post_cingulate', strength: 0.82, change: -0.42 },
          { source: 'post_cingulate', target: 'precuneus', strength: 0.90, change: -0.38 },
          { source: 'precuneus', target: 'mpfc', strength: 0.86, change: -0.32 },
          { source: 'mpfc', target: 'hippocampus', strength: 0.78, change: -0.40 },
          { source: 'angular_gyrus', target: 'temporal_pole', strength: 0.72, change: -0.25 },
          { source: 'middle_temporal', target: 'inferior_temporal', strength: 0.80, change: -0.18 },
          { source: 'fusiform', target: 'lingual', strength: 0.68, change: -0.12 },
          { source: 'hippocampus', target: 'amygdala', strength: 0.75, change: -0.22 },
          { source: 'dlpfc', target: 'mpfc', strength: 0.70, change: -0.28 },
          { source: 'dlpfc', target: 'vlpfc', strength: 0.72, change: -0.20 },
          { source: 'temporal_pole', target: 'amygdala', strength: 0.78, change: -0.18 },
          { source: 'angular_gyrus', target: 'middle_temporal', strength: 0.74, change: -0.22 },
          { source: 'precuneus', target: 'hippocampus', strength: 0.80, change: -0.36 },
          { source: 'primary_visual', target: 'lingual', strength: 0.65, change: -0.05 },
          { source: 'fusiform', target: 'inferior_temporal', strength: 0.71, change: -0.15 },
          { source: 'post_cingulate', target: 'angular_gyrus', strength: 0.77, change: -0.30 },
          { source: 'vlpfc', target: 'temporal_pole', strength: 0.66, change: -0.20 },
        ],
      });

    case 'similar-patients':
      return NextResponse.json({
        query: 'PT-245',
        results: [
          { id: 'PT-089', similarity: 0.94, age: 75, stage: 'Moderate AD', outcome: 'Stable on Lecanemab' },
          { id: 'PT-156', similarity: 0.88, age: 73, stage: 'Moderate AD', outcome: 'Slow decline on combo therapy' },
          { id: 'PT-312', similarity: 0.82, age: 78, stage: 'MCI-AD', outcome: 'Progressed to moderate in 2yr' },
          { id: 'PT-078', similarity: 0.79, age: 70, stage: 'Mild AD', outcome: 'Good response to Donpezil+Memantine' },
          { id: 'PT-421', similarity: 0.74, age: 77, stage: 'Moderate AD', outcome: 'Rapid progression, Lewy body' },
        ],
        literature: [
          { title: 'Lecanemab in early Alzheimer\'s disease', journal: 'NEJM', year: 2023, relevance: 0.95 },
          { title: 'APOE ε4 and disease progression rates', journal: 'Lancet Neurology', year: 2023, relevance: 0.91 },
          { title: 'Multimodal prediction of AD progression', journal: 'Nature Medicine', year: 2024, relevance: 0.88 },
          { title: 'Digital twins for neurodegenerative diseases', journal: 'Nature Computational Science', year: 2024, relevance: 0.85 },
        ],
      });

    case 'synthetic-patient':
      return NextResponse.json({
        generated: {
          id: `SYN-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
          age: 60 + Math.floor(Math.random() * 25),
          sex: Math.random() > 0.55 ? 'Female' : 'Male',
          mriScore: Math.round(40 + Math.random() * 50),
          geneticRisk: +(0.2 + Math.random() * 0.7).toFixed(2),
          bloodBiomarkers: {
            tau: Math.round(10 + Math.random() * 70),
            amyloid: Math.round(80 + Math.random() * 200),
            nfL: Math.round(8 + Math.random() * 50),
          },
          speechScore: Math.round(50 + Math.random() * 48),
          sleepQuality: Math.round(25 + Math.random() * 60),
          activityLevel: Math.round(15 + Math.random() * 75),
          cognitiveScore: Math.round(10 + Math.random() * 22),
          brainAge: 0,
          clinicalNotes: '',
        },
        quality: {
          realism: +(0.85 + Math.random() * 0.12).toFixed(2),
          diversity: +(0.78 + Math.random() * 0.18).toFixed(2),
          validity: +(0.90 + Math.random() * 0.08).toFixed(2),
        },
      });

    case 'treatment-optimize':
      return NextResponse.json({
        recommendations: [
          { treatment: 'Lecanemab (IV biweekly)', dosage: '10 mg/kg', impact: '+3.2 MMSE points at 18mo', confidence: 0.87, rank: 1 },
          { treatment: 'Donepezil + Memantine', dosage: '10mg + 20mg daily', impact: '+1.8 MMSE points at 18mo', confidence: 0.79, rank: 2 },
          { treatment: 'Moderate Exercise (150min/wk)', dosage: '30min × 5 days', impact: '+1.2 MMSE points at 18mo', confidence: 0.82, rank: 3 },
          { treatment: 'Sleep Optimization (CBT-I)', dosage: 'Weekly sessions × 8 weeks', impact: '+0.8 MMSE points at 18mo', confidence: 0.71, rank: 4 },
          { treatment: 'Mediterranean Diet', dosage: 'Daily adherence >80%', impact: '+0.6 MMSE points at 18mo', confidence: 0.68, rank: 5 },
        ],
        monitoringSchedule: {
          mri: 'Every 12 months',
          bloodBiomarkers: 'Every 6 months',
          cognitive: 'Every 3 months',
          sleep: 'Continuous (wearable)',
          activity: 'Continuous (smartwatch)',
        },
      });

    default:
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  }
}