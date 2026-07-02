'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  Database,
  Download,
  LineChart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  GitBranch,
  Calendar,
  Users,
  FileText,
  Brain,
  Shuffle,
  Shield,
  Server,
  Code,
} from 'lucide-react';
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

interface ModelMetrics {
  modelName: string;
  version: string;
  architecture: string;
  trainAccuracy: number;
  testAccuracy: number;
  valAccuracy: number;
  trainLoss: number;
  testLoss: number;
  valLoss: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  sensitivity: number;
  specificity: number;
  trainedOn: string;
  lastUpdated: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: string;
}

interface DatasetInfo {
  name: string;
  fullName: string;
  subjects: number;
  features: number;
  timepoints: string;
  dataTypes: string[];
  modalityBreakdown: { modality: string; count: number }[];
  demographics: {
    ageRange: string;
    meanAge: number;
    femalePercent: number;
    malePercent: number;
  };
  clinicalStatus: { status: string; count: number; percentage: number }[];
  publicationCite: string;
  website: string;
  usage: string;
}

export function ModelMetricsPanel() {
  const [selectedModel, setSelectedModel] = useState<string>('conversion');

  // Model performance metrics
  const models: Record<string, ModelMetrics> = {
    conversion: {
      modelName: 'MCI→AD Conversion Predictor',
      version: 'v2.4.1',
      architecture: 'Deep Neural Network (ResNet-50 + Attention)',
      trainAccuracy: 94.8,
      testAccuracy: 92.4,
      valAccuracy: 93.1,
      trainLoss: 0.142,
      testLoss: 0.189,
      valLoss: 0.165,
      precision: 91.7,
      recall: 89.3,
      f1Score: 90.5,
      auc: 96.2,
      sensitivity: 89.3,
      specificity: 93.8,
      trainedOn: '2024-11-15',
      lastUpdated: '2024-12-15',
      epochs: 150,
      batchSize: 32,
      learningRate: 0.0001,
      optimizer: 'AdamW',
    },
    tte: {
      modelName: 'Time-to-Event Survival Model',
      version: 'v1.8.3',
      architecture: 'Cox Proportional Hazard + LSTM',
      trainAccuracy: 91.2,
      testAccuracy: 88.6,
      valAccuracy: 89.4,
      trainLoss: 0.198,
      testLoss: 0.243,
      valLoss: 0.221,
      precision: 87.4,
      recall: 85.9,
      f1Score: 86.6,
      auc: 93.8,
      sensitivity: 85.9,
      specificity: 90.1,
      trainedOn: '2024-10-20',
      lastUpdated: '2024-12-10',
      epochs: 200,
      batchSize: 64,
      learningRate: 0.0005,
      optimizer: 'Adam',
    },
    burden: {
      modelName: 'Caregiver Burden Predictor',
      version: 'v1.5.2',
      architecture: 'Random Forest Ensemble (500 trees)',
      trainAccuracy: 88.9,
      testAccuracy: 85.3,
      valAccuracy: 86.7,
      trainLoss: 0.256,
      testLoss: 0.312,
      valLoss: 0.289,
      precision: 83.6,
      recall: 81.2,
      f1Score: 82.4,
      auc: 91.5,
      sensitivity: 81.2,
      specificity: 87.9,
      trainedOn: '2024-09-05',
      lastUpdated: '2024-12-12',
      epochs: 100,
      batchSize: 128,
      learningRate: 0.001,
      optimizer: 'SGD with momentum',
    },
  };

  // Dataset information
  const datasets: DatasetInfo[] = [
    {
      name: 'ADNI',
      fullName: 'Alzheimer\'s Disease Neuroimaging Initiative',
      subjects: 2438,
      features: 1247,
      timepoints: 'Longitudinal (baseline, 6m, 12m, 24m, 36m)',
      dataTypes: ['MRI', 'PET', 'Genetic', 'Cognitive', 'Biomarkers', 'Clinical'],
      modalityBreakdown: [
        { modality: 'Structural MRI (T1, T2)', count: 2438 },
        { modality: 'PET (FDG, Amyloid)', count: 1876 },
        { modality: 'Genetic (APOE, WGS)', count: 2201 },
        { modality: 'CSF Biomarkers', count: 1542 },
        { modality: 'Cognitive Assessments', count: 2438 },
        { modality: 'Blood Biomarkers', count: 1923 },
      ],
      demographics: {
        ageRange: '55-90 years',
        meanAge: 73.4,
        femalePercent: 47.2,
        malePercent: 52.8,
      },
      clinicalStatus: [
        { status: 'Cognitively Normal', count: 892, percentage: 36.6 },
        { status: 'MCI', count: 1015, percentage: 41.6 },
        { status: 'Alzheimer\'s Disease', count: 531, percentage: 21.8 },
      ],
      publicationCite: 'Mueller et al. Alzheimers Dement. 2005;1(1):55-66',
      website: 'https://adni.loni.usc.edu',
      usage: 'Training (70%), Validation (15%), Testing (15%)',
    },
    {
      name: 'OASIS',
      fullName: 'Open Access Series of Imaging Studies',
      subjects: 1098,
      features: 892,
      timepoints: 'Cross-sectional and Longitudinal',
      dataTypes: ['MRI', 'Cognitive', 'Clinical', 'Demographic'],
      modalityBreakdown: [
        { modality: 'Structural MRI (T1)', count: 1098 },
        { modality: 'Cognitive Tests (MMSE, CDR)', count: 1098 },
        { modality: 'Clinical Assessments', count: 1098 },
        { modality: 'Demographic Data', count: 1098 },
      ],
      demographics: {
        ageRange: '18-96 years',
        meanAge: 68.7,
        femalePercent: 62.1,
        malePercent: 37.9,
      },
      clinicalStatus: [
        { status: 'Nondemented', count: 678, percentage: 61.7 },
        { status: 'Very Mild Dementia', count: 284, percentage: 25.9 },
        { status: 'Mild to Moderate Dementia', count: 136, percentage: 12.4 },
      ],
      publicationCite: 'Marcus et al. J Cogn Neurosci. 2007;19(9):1498-1507',
      website: 'https://www.oasis-brains.org',
      usage: 'Training (80%), Testing (20%)',
    },
    {
      name: 'UK Biobank',
      fullName: 'UK Biobank Brain Imaging Study',
      subjects: 4521,
      features: 2134,
      timepoints: 'Baseline + Follow-up (subset)',
      dataTypes: ['MRI', 'Genetic', 'Lifestyle', 'Cognitive', 'Blood', 'Medical Records'],
      modalityBreakdown: [
        { modality: 'Brain MRI (T1, T2, fMRI, DTI)', count: 4521 },
        { modality: 'Genetic Array + WES', count: 4521 },
        { modality: 'Cognitive Function Tests', count: 4521 },
        { modality: 'Blood Biomarkers', count: 4521 },
        { modality: 'Lifestyle & Diet', count: 4521 },
        { modality: 'Medical History', count: 4521 },
      ],
      demographics: {
        ageRange: '45-82 years',
        meanAge: 64.2,
        femalePercent: 52.4,
        malePercent: 47.6,
      },
      clinicalStatus: [
        { status: 'Healthy Controls', count: 3897, percentage: 86.2 },
        { status: 'Cognitive Impairment', count: 445, percentage: 9.8 },
        { status: 'Dementia', count: 179, percentage: 4.0 },
      ],
      publicationCite: 'Sudlow et al. PLoS Med. 2015;12(3):e1001779',
      website: 'https://www.ukbiobank.ac.uk',
      usage: 'External Validation (100%)',
    },
    {
      name: 'NACC',
      fullName: 'National Alzheimer\'s Coordinating Center',
      subjects: 8934,
      features: 1876,
      timepoints: 'Longitudinal (annual visits)',
      dataTypes: ['Clinical', 'Cognitive', 'Neuropathology', 'Genetic', 'Biomarkers'],
      modalityBreakdown: [
        { modality: 'Clinical Assessments (UDS)', count: 8934 },
        { modality: 'Cognitive Batteries', count: 8934 },
        { modality: 'Neuropathology (autopsy)', count: 2341 },
        { modality: 'Genetic Testing', count: 6782 },
        { modality: 'CSF & Blood Biomarkers', count: 4521 },
      ],
      demographics: {
        ageRange: '50-105 years',
        meanAge: 71.8,
        femalePercent: 57.3,
        malePercent: 42.7,
      },
      clinicalStatus: [
        { status: 'Normal Cognition', count: 3128, percentage: 35.0 },
        { status: 'MCI', count: 3216, percentage: 36.0 },
        { status: 'Dementia', count: 2590, percentage: 29.0 },
      ],
      publicationCite: 'Beekly et al. Alzheimers Dement. 2007;3(3):196-204',
      website: 'https://naccdata.org',
      usage: 'Training (65%), Testing (35%)',
    },
  ];

  // Training configuration
  const trainingConfig = {
    totalSamples: 17991,
    trainingSamples: 12594,
    validationSamples: 2699,
    testingSamples: 2698,
    trainingStrategy: 'Stratified K-Fold Cross-Validation (k=5)',
    augmentation: ['Gaussian noise injection', 'Temporal jittering', 'Feature dropout'],
    regularization: ['L2 (weight decay=0.01)', 'Dropout (p=0.3)', 'Early stopping'],
    hardware: 'NVIDIA A100 GPU (4x)',
    trainingTime: '48 hours',
    frameworks: ['PyTorch 2.1', 'scikit-learn 1.3', 'TensorFlow 2.14'],
  };

  const currentModel = models[selectedModel];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              Model Training & Testing Metrics
            </CardTitle>
            <CardDescription>
              Comprehensive performance metrics and dataset information for all AI models
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Model Performance</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="training">Training Config</TabsTrigger>
          </TabsList>

          {/* Model Performance */}
          <TabsContent value="performance" className="space-y-4">
            {/* Model selector */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(models).map(([key, model]) => (
                <Card
                  key={key}
                  className={cn(
                    'cursor-pointer transition-all hover:border-blue-500/50',
                    selectedModel === key && 'border-blue-500 bg-blue-500/5'
                  )}
                  onClick={() => setSelectedModel(key)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Brain className="w-5 h-5 text-blue-500" />
                        <Badge variant="outline">{model.version}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{model.modelName}</div>
                        <div className="text-xs text-muted-foreground">{model.architecture}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  {currentModel.modelName}
                </CardTitle>
                <CardDescription>Version {currentModel.version} · Last updated {currentModel.lastUpdated}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Accuracy metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Accuracy Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Training Accuracy</div>
                      <div className="text-3xl font-bold text-emerald-500">
                        {currentModel.trainAccuracy}%
                      </div>
                      <Progress value={currentModel.trainAccuracy} className="h-2 [&>div]:bg-emerald-500" />
                      <div className="text-xs text-muted-foreground">Loss: {currentModel.trainLoss.toFixed(3)}</div>
                    </div>
                    <div className="p-4 rounded-lg border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Validation Accuracy</div>
                      <div className="text-3xl font-bold text-blue-500">
                        {currentModel.valAccuracy}%
                      </div>
                      <Progress value={currentModel.valAccuracy} className="h-2 [&>div]:bg-blue-500" />
                      <div className="text-xs text-muted-foreground">Loss: {currentModel.valLoss.toFixed(3)}</div>
                    </div>
                    <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-500/5 space-y-2">
                      <div className="text-sm text-muted-foreground">Test Accuracy</div>
                      <div className="text-3xl font-bold text-blue-500">
                        {currentModel.testAccuracy}%
                      </div>
                      <Progress value={currentModel.testAccuracy} className="h-2 [&>div]:bg-blue-500" />
                      <div className="text-xs text-muted-foreground">Loss: {currentModel.testLoss.toFixed(3)}</div>
                    </div>
                  </div>
                </div>

                {/* Classification metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Classification Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Precision', value: currentModel.precision, icon: CheckCircle2 },
                      { label: 'Recall', value: currentModel.recall, icon: CheckCircle2 },
                      { label: 'F1-Score', value: currentModel.f1Score, icon: Award },
                      { label: 'AUC-ROC', value: currentModel.auc, icon: LineChart },
                      { label: 'Sensitivity', value: currentModel.sensitivity, icon: TrendingUp },
                      { label: 'Specificity', value: currentModel.specificity, icon: TrendingUp },
                    ].map((metric, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <metric.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{metric.label}</span>
                        </div>
                        <div className="text-2xl font-bold">{metric.value}%</div>
                        <Progress value={metric.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Model Configuration
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Architecture</div>
                      <div className="text-sm font-medium">{currentModel.architecture}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Epochs</div>
                      <div className="text-sm font-medium">{currentModel.epochs}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Batch Size</div>
                      <div className="text-sm font-medium">{currentModel.batchSize}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Learning Rate</div>
                      <div className="text-sm font-medium">{currentModel.learningRate}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Optimizer</div>
                      <div className="text-sm font-medium">{currentModel.optimizer}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Trained On</div>
                      <div className="text-sm font-medium">{currentModel.trainedOn}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Version</div>
                      <div className="text-sm font-medium">{currentModel.version}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="text-xs text-muted-foreground">Last Updated</div>
                      <div className="text-sm font-medium">{currentModel.lastUpdated}</div>
                    </div>
                  </div>
                </div>

                {/* Performance notes */}
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="font-medium text-blue-500">Performance Notes</div>
                      <p className="text-muted-foreground">
                        Model shows excellent generalization with minimal overfitting (train-test gap: {(currentModel.trainAccuracy - currentModel.testAccuracy).toFixed(1)}%). 
                        Validation curves indicate stable convergence. AUC-ROC of {currentModel.auc}% demonstrates strong discriminative ability.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-4">
            {datasets.map((dataset, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-neuro" />
                        {dataset.name}
                      </CardTitle>
                      <CardDescription>{dataset.fullName}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-3 h-3" />
                      Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-neuro/10 to-transparent border border-neuro/20 space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neuro" />
                        <span className="text-xs text-muted-foreground">Subjects</span>
                      </div>
                      <div className="text-2xl font-bold">{dataset.subjects.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Features</span>
                      </div>
                      <div className="text-2xl font-bold">{dataset.features.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Age Range</span>
                      </div>
                      <div className="text-sm font-bold">{dataset.demographics.ageRange}</div>
                      <div className="text-xs text-muted-foreground">Mean: {dataset.demographics.meanAge}y</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Gender Split</span>
                      </div>
                      <div className="text-xs font-medium">F: {dataset.demographics.femalePercent}%</div>
                      <div className="text-xs font-medium">M: {dataset.demographics.malePercent}%</div>
                    </div>
                  </div>

                  {/* Data types */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Data Modalities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {dataset.dataTypes.map((type, typeIdx) => (
                        <Badge key={typeIdx} variant="outline" className="bg-neuro/5 border-neuro/20">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Modality breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Modality Breakdown</h4>
                    <div className="space-y-2">
                      {dataset.modalityBreakdown.map((mod, modIdx) => (
                        <div key={modIdx} className="flex items-center gap-3">
                          <span className="text-sm flex-1">{mod.modality}</span>
                          <span className="text-sm text-muted-foreground">{mod.count.toLocaleString()}</span>
                          <div className="w-32">
                            <Progress value={(mod.count / dataset.subjects) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical status */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Clinical Status Distribution
                    </h4>
                    <div className="space-y-2">
                      {dataset.clinicalStatus.map((status, statusIdx) => (
                        <div key={statusIdx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{status.status}</span>
                            <span className="text-muted-foreground">
                              {status.count.toLocaleString()} ({status.percentage}%)
                            </span>
                          </div>
                          <Progress value={status.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timepoints */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Timepoints</div>
                        <div className="text-sm text-muted-foreground">{dataset.timepoints}</div>
                      </div>
                    </div>
                  </div>

                  {/* Usage split */}
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <GitBranch className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-blue-500">Dataset Usage</div>
                        <div className="text-sm text-muted-foreground">{dataset.usage}</div>
                      </div>
                    </div>
                  </div>

                  {/* Citation */}
                  <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Citation</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{dataset.publicationCite}</p>
                    <a
                      href={dataset.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neuro hover:underline inline-flex items-center gap-1"
                    >
                      {dataset.website}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Dataset summary */}
            <Card className="bg-gradient-to-br from-neuro/5 to-transparent border-neuro/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-neuro" />
                  Combined Dataset Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Total Subjects</div>
                    <div className="text-3xl font-bold">
                      {datasets.reduce((sum, d) => sum + d.subjects, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Total Features</div>
                    <div className="text-3xl font-bold">3,547</div>
                    <div className="text-xs text-muted-foreground">After harmonization</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Datasets</div>
                    <div className="text-3xl font-bold">{datasets.length}</div>
                    <div className="text-xs text-muted-foreground">Multi-site collaboration</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <div className="text-sm text-muted-foreground">Data Points</div>
                    <div className="text-3xl font-bold">~2.8M</div>
                    <div className="text-xs text-muted-foreground">Total measurements</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Configuration */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Training Configuration
                </CardTitle>
                <CardDescription>
                  Data splits, augmentation strategies, and infrastructure details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data splits */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Data Splits
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 space-y-2">
                      <div className="text-sm text-muted-foreground">Total Samples</div>
                      <div className="text-3xl font-bold">{trainingConfig.totalSamples.toLocaleString()}</div>
                      <div className="text-xs text-emerald-500">100%</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Training Set</div>
                      <div className="text-2xl font-bold">{trainingConfig.trainingSamples.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {((trainingConfig.trainingSamples / trainingConfig.totalSamples) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Validation Set</div>
                      <div className="text-2xl font-bold">{trainingConfig.validationSamples.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {((trainingConfig.validationSamples / trainingConfig.totalSamples) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Test Set</div>
                      <div className="text-2xl font-bold">{trainingConfig.testingSamples.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {((trainingConfig.testingSamples / trainingConfig.totalSamples) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="font-medium text-blue-500">Training Strategy</div>
                        <p className="text-muted-foreground">{trainingConfig.trainingStrategy}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Augmentation */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    Data Augmentation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {trainingConfig.augmentation.map((aug, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium">{aug}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regularization */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Regularization Techniques
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {trainingConfig.regularization.map((reg, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">{reg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infrastructure */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Training Infrastructure
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 space-y-2">
                      <div className="text-sm text-muted-foreground">Hardware</div>
                      <div className="text-lg font-bold">{trainingConfig.hardware}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Training Time</div>
                      <div className="text-lg font-bold">{trainingConfig.trainingTime}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                      <div className="text-sm text-muted-foreground">Total Cost</div>
                      <div className="text-lg font-bold">~$2,340</div>
                      <div className="text-xs text-muted-foreground">GPU compute</div>
                    </div>
                  </div>
                </div>

                {/* Frameworks */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Frameworks & Libraries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trainingConfig.frameworks.map((framework, idx) => (
                      <Badge key={idx} variant="outline" className="bg-purple-500/5 border-purple-500/20 px-3 py-1">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional details */}
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="font-medium text-amber-500">Training Notes</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Mixed precision training (FP16) for faster convergence</li>
                        <li>• Gradient clipping (max_norm=1.0) to prevent exploding gradients</li>
                        <li>• Cosine annealing learning rate schedule with warm restarts</li>
                        <li>• Class balancing using weighted loss functions (SMOTE oversampling)</li>
                        <li>• Hyperparameter optimization using Optuna (500 trials)</li>
                      </ul>
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
