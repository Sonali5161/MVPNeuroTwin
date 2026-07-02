'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  Brain,
  Calendar,
  DollarSign,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  BarChart3,
  LineChart,
} from 'lucide-react';
import { useNeuroStore } from '@/lib/neuro-store';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface PredictionModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  confidence: number;
  lastUpdated: string;
}

interface ConversionPrediction {
  probability: number;
  timeframe: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: { factor: string; impact: number }[];
}

interface TimeToEventPrediction {
  eventType: string;
  estimatedMonths: number;
  confidenceInterval: [number, number];
  probability: number;
}

interface CaregiverBurdenPrediction {
  currentScore: number;
  projectedScore: number;
  timeframe: string;
  riskFactors: string[];
  recommendations: string[];
}

export function AIPredictionsPanel() {
  const { selectedPatient } = useNeuroStore();
  const [activeModel, setActiveModel] = useState<string>('conversion');
  const [isComputing, setIsComputing] = useState(false);

  // Simulate AI computation
  const computePredictions = () => {
    setIsComputing(true);
    setTimeout(() => setIsComputing(false), 2000);
  };

  useEffect(() => {
    computePredictions();
  }, [selectedPatient]);

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Select a patient to view AI predictions
        </CardContent>
      </Card>
    );
  }

  // Mock predictions based on patient data
  const conversionRisk: ConversionPrediction = {
    probability: selectedPatient.geneticRisk * 85,
    timeframe: '24 months',
    confidence: 0.87,
    riskLevel:
      selectedPatient.geneticRisk > 0.8
        ? 'critical'
        : selectedPatient.geneticRisk > 0.6
        ? 'high'
        : selectedPatient.geneticRisk > 0.4
        ? 'medium'
        : 'low',
    contributingFactors: [
      { factor: 'APOE ε4 Status', impact: selectedPatient.geneticRisk * 100 },
      { factor: 'Amyloid Burden', impact: (selectedPatient.bloodBiomarkers.amyloid / 300) * 100 },
      { factor: 'Brain Age Gap', impact: ((selectedPatient.brainAge - selectedPatient.age) / 30) * 100 },
      { factor: 'Cognitive Decline Rate', impact: ((30 - selectedPatient.cognitiveScore) / 30) * 100 },
      { factor: 'Sleep Quality', impact: (100 - selectedPatient.sleepQuality) },
    ],
  };

  const timeToEventPredictions: TimeToEventPrediction[] = [
    {
      eventType: 'MCI to AD Conversion',
      estimatedMonths: Math.max(12, Math.floor((1 - selectedPatient.geneticRisk) * 36)),
      confidenceInterval: [8, 28],
      probability: conversionRisk.probability / 100,
    },
    {
      eventType: 'Functional Decline (ADL)',
      estimatedMonths: Math.max(18, Math.floor((selectedPatient.mriScore / 100) * 48)),
      confidenceInterval: [12, 36],
      probability: 1 - selectedPatient.mriScore / 100,
    },
    {
      eventType: 'Institutionalization',
      estimatedMonths: Math.max(24, Math.floor((selectedPatient.activityLevel / 100) * 60)),
      confidenceInterval: [18, 48],
      probability: 1 - selectedPatient.activityLevel / 100,
    },
  ];

  const caregiverBurden: CaregiverBurdenPrediction = {
    currentScore: Math.floor((1 - selectedPatient.cognitiveScore / 30) * 100),
    projectedScore: Math.min(100, Math.floor((1 - selectedPatient.cognitiveScore / 30) * 120)),
    timeframe: '12 months',
    riskFactors: [
      'Rapid cognitive decline trajectory',
      'Behavioral symptoms emerging',
      'Limited social support network',
      'Primary caregiver shows stress indicators',
    ],
    recommendations: [
      'Arrange respite care services',
      'Caregiver support group enrollment',
      'Consider adult day programs',
      'Evaluate home care assistance options',
    ],
  };

  const hospitalizationRisk = {
    probability: Math.min(95, (1 - selectedPatient.mriScore / 100) * 100),
    timeframe: '6 months',
    primaryReasons: [
      { reason: 'Falls', probability: 0.42 },
      { reason: 'Infection', probability: 0.28 },
      { reason: 'Medication complications', probability: 0.18 },
      { reason: 'Dehydration/Malnutrition', probability: 0.12 },
    ],
  };

  const costProjections = {
    current: Math.floor(30000 + (1 - selectedPatient.cognitiveScore / 30) * 50000),
    year1: Math.floor(35000 + (1 - selectedPatient.cognitiveScore / 30) * 60000),
    year2: Math.floor(42000 + (1 - selectedPatient.cognitiveScore / 30) * 75000),
    year3: Math.floor(52000 + (1 - selectedPatient.cognitiveScore / 30) * 95000),
    breakdown: [
      { category: 'Medical care', percentage: 35 },
      { category: 'Medications', percentage: 15 },
      { category: 'Home care', percentage: 28 },
      { category: 'Institutionalization', percentage: 22 },
    ],
  };

  const models: PredictionModel[] = [
    {
      id: 'conversion',
      name: 'MCI→AD Conversion Model',
      type: 'Deep Neural Network',
      accuracy: 92.4,
      confidence: 87.2,
      lastUpdated: '2024-12-15',
    },
    {
      id: 'tte',
      name: 'Time-to-Event Model',
      type: 'Cox Proportional Hazard + LSTM',
      accuracy: 88.6,
      confidence: 83.5,
      lastUpdated: '2024-12-10',
    },
    {
      id: 'burden',
      name: 'Caregiver Burden Model',
      type: 'Random Forest Ensemble',
      accuracy: 85.3,
      confidence: 79.8,
      lastUpdated: '2024-12-12',
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header with model status */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-neuro/5 to-transparent border-neuro/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-neuro" />
                  AI/ML Advanced Predictions
                </CardTitle>
                <CardDescription>
                  Patient: {selectedPatient.name} ({selectedPatient.id})
                </CardDescription>
              </div>
              <Button
                onClick={computePredictions}
                disabled={isComputing}
                variant="outline"
                size="sm"
                className="border-neuro/20"
              >
                {isComputing ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Computing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Recompute
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="p-3 rounded-lg bg-card border border-border space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.type}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {model.accuracy}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{model.confidence}%</span>
                    </div>
                    <Progress value={model.confidence} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Predictions Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="conversion" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="conversion">Conversion Risk</TabsTrigger>
            <TabsTrigger value="tte">Time-to-Event</TabsTrigger>
            <TabsTrigger value="caregiver">Caregiver Burden</TabsTrigger>
            <TabsTrigger value="hospitalization">Hospitalization</TabsTrigger>
            <TabsTrigger value="cost">Cost Projection</TabsTrigger>
          </TabsList>

          {/* Conversion Risk */}
          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-neuro" />
                  MCI → AD Conversion Risk
                </CardTitle>
                <CardDescription>
                  Predicted probability of conversion from Mild Cognitive Impairment to Alzheimer's
                  Disease
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {conversionRisk.probability.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Risk within {conversionRisk.timeframe}
                      </div>
                    </div>
                    <Badge className={cn('px-4 py-2', getRiskColor(conversionRisk.riskLevel))}>
                      {conversionRisk.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <Progress
                    value={conversionRisk.probability}
                    className={cn(
                      'h-3',
                      conversionRisk.riskLevel === 'critical' && '[&>div]:bg-red-500',
                      conversionRisk.riskLevel === 'high' && '[&>div]:bg-orange-500',
                      conversionRisk.riskLevel === 'medium' && '[&>div]:bg-yellow-500'
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Model Confidence: {(conversionRisk.confidence * 100).toFixed(1)}%</span>
                    <span>Updated: Just now</span>
                  </div>
                </div>

                {/* Contributing factors */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Contributing Factors
                  </h4>
                  <div className="space-y-3">
                    {conversionRisk.contributingFactors
                      .sort((a, b) => b.impact - a.impact)
                      .map((factor, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{factor.factor}</span>
                            <span className="text-muted-foreground">
                              {factor.impact.toFixed(1)}% impact
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={factor.impact} className="h-2 flex-1" />
                            {factor.impact > 70 ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : factor.impact > 40 ? (
                              <TrendingUp className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Clinical interpretation */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">Clinical Interpretation</div>
                      <p className="text-muted-foreground">
                        {conversionRisk.riskLevel === 'critical' &&
                          'Patient shows very high risk of conversion. Consider intensive monitoring, advanced therapeutics, and early intervention strategies. Family counseling recommended.'}
                        {conversionRisk.riskLevel === 'high' &&
                          'Significant conversion risk detected. Recommend increased monitoring frequency, preventive interventions, and close biomarker tracking.'}
                        {conversionRisk.riskLevel === 'medium' &&
                          'Moderate risk profile. Continue standard monitoring protocols with attention to modifiable risk factors.'}
                        {conversionRisk.riskLevel === 'low' &&
                          'Low conversion risk. Maintain current management plan with routine monitoring intervals.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time-to-Event Analysis */}
          <TabsContent value="tte" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neuro" />
                  Time-to-Event Analysis
                </CardTitle>
                <CardDescription>
                  Predicted timing of clinical milestones and disease progression events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeToEventPredictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border space-y-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{pred.eventType}</div>
                        <div className="text-sm text-muted-foreground">
                          Estimated: {pred.estimatedMonths} months
                        </div>
                      </div>
                      <Badge variant="outline">{(pred.probability * 100).toFixed(1)}%</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>95% Confidence Interval</span>
                        <span>
                          {pred.confidenceInterval[0]}-{pred.confidenceInterval[1]} months
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-neuro/30 rounded-full"
                          style={{
                            left: `${(pred.confidenceInterval[0] / 60) * 100}%`,
                            width: `${
                              ((pred.confidenceInterval[1] - pred.confidenceInterval[0]) / 60) *
                              100
                            }%`,
                          }}
                        />
                        <div
                          className="absolute h-full w-1 bg-neuro"
                          style={{
                            left: `${(pred.estimatedMonths / 60) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 months</span>
                        <span>60 months</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <LineChart className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="space-y-1 text-sm">
                      <div className="font-medium text-blue-500">Survival Analysis</div>
                      <p className="text-muted-foreground">
                        Predictions based on Cox proportional hazards model with time-varying
                        covariates. Survival curves account for competing risks and censored
                        observations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Caregiver Burden */}
          <TabsContent value="caregiver" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-neuro" />
                  Caregiver Burden Prediction
                </CardTitle>
                <CardDescription>
                  Projected caregiver stress and support requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Burden scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Current Burden Score</div>
                    <div className="text-3xl font-bold">{caregiverBurden.currentScore}/100</div>
                    <Progress value={caregiverBurden.currentScore} className="h-2" />
                  </div>
                  <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Projected ({caregiverBurden.timeframe})
                    </div>
                    <div className="text-3xl font-bold text-orange-500">
                      {caregiverBurden.projectedScore}/100
                    </div>
                    <Progress
                      value={caregiverBurden.projectedScore}
                      className="h-2 [&>div]:bg-orange-500"
                    />
                  </div>
                </div>

                {/* Risk factors */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </h4>
                  <div className="space-y-2">
                    {caregiverBurden.riskFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {caregiverBurden.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hospitalization Risk */}
          <TabsContent value="hospitalization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neuro" />
                  Hospitalization Risk
                </CardTitle>
                <CardDescription>
                  Predicted hospital admission probability and primary causes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                  <div className="text-4xl font-bold text-red-500">
                    {hospitalizationRisk.probability.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Risk within {hospitalizationRisk.timeframe}
                  </div>
                  <Progress
                    value={hospitalizationRisk.probability}
                    className="h-3 [&>div]:bg-red-500"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Primary Risk Factors</h4>
                  {hospitalizationRisk.primaryReasons.map((reason, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{reason.reason}</span>
                        <span className="text-muted-foreground">
                          {(reason.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={reason.probability * 100} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Preventive Actions</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Fall prevention assessment and home modifications</li>
                        <li>• Regular medication review and optimization</li>
                        <li>• Infection prevention protocols</li>
                        <li>• Nutritional status monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Projection */}
          <TabsContent value="cost" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-neuro" />
                  Healthcare Cost Projection
                </CardTitle>
                <CardDescription>
                  Estimated annual healthcare costs over 3-year horizon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Current', value: costProjections.current, year: 0 },
                    { label: 'Year 1', value: costProjections.year1, year: 1 },
                    { label: 'Year 2', value: costProjections.year2, year: 2 },
                    { label: 'Year 3', value: costProjections.year3, year: 3 },
                  ].map((cost, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">{cost.label}</div>
                      <div className="text-2xl font-bold">
                        ${(cost.value / 1000).toFixed(0)}K
                      </div>
                      {cost.year > 0 && (
                        <div className="text-xs text-emerald-500">
                          +
                          {(
                            ((cost.value - costProjections.current) / costProjections.current) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Cost Breakdown (Year 1)</h4>
                  {costProjections.breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">
                          ${((costProjections.year1 * item.percentage) / 100 / 1000).toFixed(1)}K
                          ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium text-blue-500">Cost Drivers</div>
                      <p className="text-muted-foreground">
                        Primary cost increases driven by cognitive decline, increased care needs,
                        and potential institutionalization. Early intervention may reduce long-term
                        costs by 15-25%.
                      </p>
                    </div>
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
