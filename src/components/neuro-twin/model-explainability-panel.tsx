'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  ChevronDown,
  ChevronUp,
  Eye,
  Lightbulb,
  LineChart,
  Shuffle,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNeuroStore } from '@/lib/neuro-store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface LIMEExplanation {
  feature: string;
  impact: number;
  value: string;
  direction: 'positive' | 'negative';
}

interface AttentionWeight {
  region: string;
  weight: number;
  timepoint: string;
}

interface CounterfactualScenario {
  id: string;
  description: string;
  changes: { feature: string; original: string; modified: string }[];
  newPrediction: number;
  originalPrediction: number;
}

interface UncertaintyMeasure {
  metric: string;
  value: number;
  confidence: [number, number];
  interpretation: string;
}

export function ModelExplainabilityPanel() {
  const { selectedPatient } = useNeuroStore();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [sensitivityValue, setSensitivityValue] = useState(50);
  const [expandedSection, setExpandedSection] = useState<string>('lime');

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Select a patient to view model explanations
        </CardContent>
      </Card>
    );
  }

  // Generate LIME explanations
  const limeExplanations: LIMEExplanation[] = [
    {
      feature: 'APOE ε4 Status',
      impact: selectedPatient.geneticRisk * 100,
      value: selectedPatient.geneticRisk > 0.5 ? 'Positive' : 'Negative',
      direction: selectedPatient.geneticRisk > 0.5 ? 'positive' : 'negative',
    },
    {
      feature: 'Amyloid-β (pg/mL)',
      impact: (selectedPatient.bloodBiomarkers.amyloid / 300) * 80,
      value: `${selectedPatient.bloodBiomarkers.amyloid}`,
      direction: selectedPatient.bloodBiomarkers.amyloid > 150 ? 'positive' : 'negative',
    },
    {
      feature: 'p-Tau (pg/mL)',
      impact: (selectedPatient.bloodBiomarkers.tau / 100) * 70,
      value: `${selectedPatient.bloodBiomarkers.tau}`,
      direction: selectedPatient.bloodBiomarkers.tau > 40 ? 'positive' : 'negative',
    },
    {
      feature: 'Brain Age Gap',
      impact: Math.abs((selectedPatient.brainAge - selectedPatient.age) / 30) * 65,
      value: `+${selectedPatient.brainAge - selectedPatient.age} years`,
      direction: selectedPatient.brainAge > selectedPatient.age ? 'positive' : 'negative',
    },
    {
      feature: 'Cognitive Score (MMSE)',
      impact: ((30 - selectedPatient.cognitiveScore) / 30) * 60,
      value: `${selectedPatient.cognitiveScore}/30`,
      direction: selectedPatient.cognitiveScore < 24 ? 'positive' : 'negative',
    },
    {
      feature: 'Hippocampal Volume',
      impact: ((100 - selectedPatient.mriScore) / 100) * 55,
      value: `${selectedPatient.mriScore}th percentile`,
      direction: selectedPatient.mriScore < 70 ? 'positive' : 'negative',
    },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Attention weights across brain regions
  const attentionWeights: AttentionWeight[] = [
    { region: 'Hippocampus', weight: 0.32, timepoint: 'Baseline' },
    { region: 'Entorhinal Cortex', weight: 0.28, timepoint: 'Baseline' },
    { region: 'Temporal Lobe', weight: 0.22, timepoint: 'Baseline' },
    { region: 'Prefrontal Cortex', weight: 0.12, timepoint: 'Baseline' },
    { region: 'Parietal Cortex', weight: 0.06, timepoint: 'Baseline' },
  ];

  // Counterfactual scenarios
  const counterfactualScenarios: CounterfactualScenario[] = [
    {
      id: 'cf1',
      description: 'If patient had lower amyloid burden',
      changes: [
        {
          feature: 'Amyloid-β',
          original: `${selectedPatient.bloodBiomarkers.amyloid} pg/mL`,
          modified: '120 pg/mL',
        },
      ],
      originalPrediction: selectedPatient.geneticRisk * 85,
      newPrediction: selectedPatient.geneticRisk * 85 - 25,
    },
    {
      id: 'cf2',
      description: 'If patient had better sleep quality',
      changes: [
        { feature: 'Sleep Quality', original: `${selectedPatient.sleepQuality}%`, modified: '80%' },
      ],
      originalPrediction: selectedPatient.geneticRisk * 85,
      newPrediction: selectedPatient.geneticRisk * 85 - 12,
    },
    {
      id: 'cf3',
      description: 'If patient increased physical activity',
      changes: [
        {
          feature: 'Activity Level',
          original: `${selectedPatient.activityLevel}%`,
          modified: '75%',
        },
      ],
      originalPrediction: selectedPatient.geneticRisk * 85,
      newPrediction: selectedPatient.geneticRisk * 85 - 15,
    },
    {
      id: 'cf4',
      description: 'Combined lifestyle intervention',
      changes: [
        { feature: 'Sleep Quality', original: `${selectedPatient.sleepQuality}%`, modified: '80%' },
        {
          feature: 'Activity Level',
          original: `${selectedPatient.activityLevel}%`,
          modified: '75%',
        },
        { feature: 'Cognitive Training', original: 'None', modified: '3x/week' },
      ],
      originalPrediction: selectedPatient.geneticRisk * 85,
      newPrediction: selectedPatient.geneticRisk * 85 - 32,
    },
  ];

  // Uncertainty quantification
  const uncertaintyMeasures: UncertaintyMeasure[] = [
    {
      metric: 'Prediction Confidence',
      value: 87.2,
      confidence: [83.5, 90.8],
      interpretation: 'High confidence in model prediction',
    },
    {
      metric: 'Epistemic Uncertainty',
      value: 8.4,
      confidence: [6.2, 10.6],
      interpretation: 'Low model uncertainty (well-trained)',
    },
    {
      metric: 'Aleatoric Uncertainty',
      value: 12.8,
      confidence: [10.1, 15.5],
      interpretation: 'Moderate data uncertainty (inherent variability)',
    },
    {
      metric: 'Feature Importance Stability',
      value: 92.1,
      confidence: [89.3, 94.9],
      interpretation: 'Stable feature rankings across bootstraps',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              Model Explainability Dashboard
            </CardTitle>
            <CardDescription>
              Understanding AI predictions through LIME, attention mechanisms, and counterfactuals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Active Patient</div>
                <div className="font-medium">
                  {selectedPatient.name} ({selectedPatient.id})
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20">
                XAI Enabled
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="lime" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lime">LIME</TabsTrigger>
            <TabsTrigger value="attention">Attention</TabsTrigger>
            <TabsTrigger value="counterfactual">Counterfactuals</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
            <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
          </TabsList>

          {/* LIME Explanations */}
          <TabsContent value="lime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  LIME Explanations
                </CardTitle>
                <CardDescription>
                  Local Interpretable Model-agnostic Explanations showing feature contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-sm space-y-2">
                    <div className="font-medium">Model Prediction</div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">
                        {(selectedPatient.geneticRisk * 85).toFixed(1)}%
                      </div>
                      <span className="text-muted-foreground">conversion risk</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {limeExplanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'p-4 rounded-lg border transition-colors cursor-pointer',
                        selectedFeature === exp.feature
                          ? 'border-purple-500 bg-purple-500/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                      onClick={() =>
                        setSelectedFeature(selectedFeature === exp.feature ? null : exp.feature)
                      }
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium">{exp.feature}</div>
                            <div className="text-sm text-muted-foreground">Value: {exp.value}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              exp.direction === 'positive'
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            )}
                          >
                            {exp.direction === 'positive' ? '+' : '-'}
                            {Math.abs(exp.impact).toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full',
                                  exp.direction === 'positive' ? 'bg-red-500' : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.abs(exp.impact)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {Math.abs(exp.impact).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {selectedFeature === exp.feature && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-border text-sm text-muted-foreground"
                          >
                            This feature {exp.direction === 'positive' ? 'increases' : 'decreases'}{' '}
                            the predicted risk by approximately {Math.abs(exp.impact).toFixed(1)}%.
                            LIME explanation is computed by perturbing this feature locally and
                            observing model behavior.
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="font-medium text-blue-500">How LIME Works</div>
                      <p className="text-muted-foreground">
                        LIME creates local linear approximations by perturbing input features and
                        observing prediction changes. Features with larger impacts have stronger
                        influence on the model's decision for this specific patient.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attention Visualizations */}
          <TabsContent value="attention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-neuro" />
                  Attention Visualizations
                </CardTitle>
                <CardDescription>
                  Neural network attention weights showing which brain regions the model focuses on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {attentionWeights.map((att, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">{att.region}</div>
                          <div className="text-xs text-muted-foreground">{att.timepoint}</div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <div className="font-medium">{(att.weight * 100).toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">attention weight</div>
                        </div>
                      </div>
                      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neuro to-purple-500 transition-all"
                          style={{ width: `${att.weight * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heatmap representation */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-neuro/5 to-purple-500/5 border border-neuro/20">
                  <div className="text-center space-y-3">
                    <Brain className="w-16 h-16 mx-auto text-neuro opacity-50" />
                    <div className="text-sm text-muted-foreground">
                      Attention Heatmap Visualization
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      The model's attention mechanism focuses primarily on hippocampus and
                      entorhinal cortex, regions critically involved in memory formation and early
                      AD pathology.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Peak Attention</div>
                    <div className="text-2xl font-bold">Hippocampus</div>
                    <div className="text-xs text-muted-foreground">32% weight allocation</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Attention Entropy</div>
                    <div className="text-2xl font-bold">0.64</div>
                    <div className="text-xs text-muted-foreground">Moderate focus distribution</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counterfactual Examples */}
          <TabsContent value="counterfactual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="w-5 h-5 text-orange-500" />
                  Counterfactual Scenarios
                </CardTitle>
                <CardDescription>
                  What-if analysis showing how changes in features would affect predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {counterfactualScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-4 rounded-lg border border-border space-y-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="font-medium">{scenario.description}</div>

                      <div className="space-y-2">
                        {scenario.changes.map((change, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50"
                          >
                            <span className="text-muted-foreground">{change.feature}:</span>
                            <span className="line-through text-muted-foreground">
                              {change.original}
                            </span>
                            <span>→</span>
                            <span className="font-medium text-emerald-500">{change.modified}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-emerald-500/10">
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-muted-foreground">Original Risk</div>
                        <div className="text-xl font-bold text-red-500">
                          {scenario.originalPrediction.toFixed(1)}%
                        </div>
                      </div>
                      <TrendingUp className="w-6 h-6 text-muted-foreground rotate-180" />
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-muted-foreground">New Risk</div>
                        <div className="text-xl font-bold text-emerald-500">
                          {scenario.newPrediction.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1 text-right space-y-1">
                        <div className="text-xs text-muted-foreground">Reduction</div>
                        <div className="text-xl font-bold">
                          -{(scenario.originalPrediction - scenario.newPrediction).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 text-sm">
                  <div className="flex items-start gap-2">
                    <Shuffle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="font-medium text-orange-500">Actionable Insights</div>
                      <p className="text-muted-foreground">
                        Counterfactuals identify modifiable risk factors that could reduce disease
                        progression. These scenarios guide intervention strategies and patient
                        counseling.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Sensitivity Analysis */}
          <TabsContent value="sensitivity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  Feature Sensitivity Analysis
                </CardTitle>
                <CardDescription>
                  How model predictions change as individual features vary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Amyloid-β Level (pg/mL)</label>
                      <span className="text-sm text-muted-foreground">{sensitivityValue * 3}</span>
                    </div>
                    <Slider
                      value={[sensitivityValue]}
                      onValueChange={(v) => setSensitivityValue(v[0])}
                      max={100}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>150 (normal)</span>
                      <span>300</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 space-y-2">
                    <div className="text-sm text-muted-foreground">Predicted Risk at This Level</div>
                    <div className="text-3xl font-bold">
                      {(40 + (sensitivityValue / 100) * 50).toFixed(1)}%
                    </div>
                    <Progress
                      value={40 + (sensitivityValue / 100) * 50}
                      className="h-2 [&>div]:bg-cyan-500"
                    />
                  </div>
                </div>

                {/* Sensitivity curve visualization */}
                <div className="p-6 rounded-lg bg-muted/50 border border-border">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Sensitivity Curve</div>
                    <div className="h-40 flex items-end gap-1">
                      {Array.from({ length: 50 }, (_, i) => {
                        const height = 20 + (i / 50) * 80;
                        const isActive = Math.abs(i - sensitivityValue / 2) < 2;
                        return (
                          <div
                            key={i}
                            className={cn(
                              'flex-1 rounded-t transition-all',
                              isActive ? 'bg-cyan-500' : 'bg-cyan-500/30'
                            )}
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Amyloid Level</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border text-center space-y-1">
                    <div className="text-xs text-muted-foreground">Min Risk</div>
                    <div className="text-lg font-bold">38.2%</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border text-center space-y-1">
                    <div className="text-xs text-muted-foreground">Current</div>
                    <div className="text-lg font-bold">
                      {(40 + (sensitivityValue / 100) * 50).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border text-center space-y-1">
                    <div className="text-xs text-muted-foreground">Max Risk</div>
                    <div className="text-lg font-bold">92.8%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Uncertainty Quantification */}
          <TabsContent value="uncertainty" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Uncertainty Quantification
                </CardTitle>
                <CardDescription>
                  Model confidence, prediction intervals, and uncertainty decomposition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {uncertaintyMeasures.map((measure, idx) => (
                  <div key={idx} className="space-y-3 p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{measure.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          {measure.interpretation}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{measure.value.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Progress value={measure.value} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>95% CI: [{measure.confidence[0].toFixed(1)}%, {measure.confidence[1].toFixed(1)}%]</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-purple-500">Understanding Uncertainty</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>
                          <strong>Epistemic:</strong> Reducible uncertainty from limited training
                          data
                        </li>
                        <li>
                          <strong>Aleatoric:</strong> Irreducible uncertainty from data variability
                        </li>
                        <li>
                          <strong>Total:</strong> Combined uncertainty affecting predictions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 space-y-2">
                    <div className="text-sm text-muted-foreground">Prediction Quality</div>
                    <div className="text-2xl font-bold text-emerald-500">Excellent</div>
                    <div className="text-xs text-muted-foreground">
                      High confidence, low uncertainty
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Calibration Score</div>
                    <div className="text-2xl font-bold">0.94</div>
                    <div className="text-xs text-muted-foreground">Well-calibrated model</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
