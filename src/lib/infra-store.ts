import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ServiceStatus = 'connected' | 'degraded' | 'syncing' | 'disconnected' | 'error';

export interface MLModel {
  id: string;
  name: string;
  architecture: string;
  framework: string;
  version: string;
  endpoint: string;
  status: ServiceStatus;
  gpu: string;
  latency: number; // ms p50
  p99: number;
  throughput: number; // req/s
  uptime: number; // hours
  lastDeployed: string;
  accuracy: number;
  inputShape: string;
  parameters: string;
  description: string;
}

export interface StorageService {
  id: string;
  name: string;
  provider: string;
  type: 'object' | 'vector' | 'timeseries' | 'relational';
  status: ServiceStatus;
  endpoint: string;
  region: string;
  totalStorage: string;
  usedStorage: string;
  iops: number;
  latency: number;
  lastSync: string;
  encryption: string;
  metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
}

export interface DataPipelineStage {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: ServiceStatus;
  throughput: string;
  recordsProcessed: number;
  errors24h: number;
  lastRun: string;
}

export interface InfraStore {
  mlModels: MLModel[];
  storageServices: StorageService[];
  pipelines: DataPipelineStage[];
  selectedService: string | null;
  setSelectedService: (id: string | null) => void;
  servicePollInterval: number;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  refreshService: (id: string) => Promise<void>;
}

const mlModels: MLModel[] = [
  {
    id: 'vit-brain-age',
    name: 'Brain Age Estimator',
    architecture: 'Vision Transformer (ViT-L/16)',
    framework: 'PyTorch 2.3 + TorchServe',
    version: 'v3.2.1',
    endpoint: 'http://ml-gateway.internal:8001/predict/brain-age',
    status: 'connected',
    gpu: 'NVIDIA A100 80GB',
    latency: 145,
    p99: 320,
    throughput: 42,
    uptime: 720,
    lastDeployed: '2026-06-25T14:00:00Z',
    accuracy: 0.94,
    inputShape: '(1, 1, 182, 218, 182)',
    parameters: '307M',
    description: 'Estimates brain age from T1-weighted MRI using 3D patch embedding ViT trained on ADNI+UKB.',
  },
  {
    id: 'gnn-brain-network',
    name: 'Brain Network GNN',
    architecture: 'Graph Attention Network (GATv2)',
    framework: 'PyTorch Geometric + FastAPI',
    version: 'v2.8.0',
    endpoint: 'http://ml-gateway.internal:8002/predict/brain-network',
    status: 'connected',
    gpu: 'NVIDIA A100 40GB',
    latency: 88,
    p99: 195,
    throughput: 65,
    uptime: 720,
    lastDeployed: '2026-06-22T09:30:00Z',
    accuracy: 0.89,
    inputShape: '(N, 16) node features + (E, 2) edges',
    parameters: '12.4M',
    description: 'GNN for brain connectivity analysis. Predicts degradation patterns from structural/functional connectomes.',
  },
  {
    id: 'ts-transformer',
    name: 'Time Series Transformer',
    architecture: 'Temporal Fusion Transformer',
    framework: 'PyTorch + Ray Serve',
    version: 'v1.5.3',
    endpoint: 'http://ml-gateway.internal:8003/predict/timeline',
    status: 'connected',
    gpu: 'NVIDIA T4 16GB',
    latency: 210,
    p99: 480,
    throughput: 28,
    uptime: 480,
    lastDeployed: '2026-06-20T11:00:00Z',
    accuracy: 0.87,
    inputShape: '(batch, seq_len=24, features=42)',
    parameters: '45.2M',
    description: 'Multivariate time series model for longitudinal disease progression forecasting from all 7 modalities.',
  },
  {
    id: 'clinical-bert',
    name: 'ClinicalBERT NER',
    architecture: 'ClinicalBERT (Bio+Clinical)',
    framework: 'HuggingFace Transformers + vLLM',
    version: 'v4.1.0',
    endpoint: 'http://ml-gateway.internal:8004/predict/clinical-ner',
    status: 'degraded',
    gpu: 'NVIDIA T4 16GB',
    latency: 340,
    p99: 720,
    throughput: 18,
    uptime: 168,
    lastDeployed: '2026-06-27T16:00:00Z',
    accuracy: 0.91,
    inputShape: '(batch, max_tokens=512)',
    parameters: '110M',
    description: 'Named entity recognition for clinical notes, EHR extraction, and research copilot RAG query embedding.',
  },
  {
    id: 'vae-synthetic',
    name: 'Synthetic Data VAE-GAN',
    architecture: 'Conditional VAE + StyleGAN3',
    framework: 'PyTorch + TorchServe',
    version: 'v2.0.4',
    endpoint: 'http://ml-gateway.internal:8005/generate/synthetic-patient',
    status: 'connected',
    gpu: 'NVIDIA A100 80GB',
    latency: 1850,
    p99: 4200,
    throughput: 3,
    uptime: 336,
    lastDeployed: '2026-06-18T08:00:00Z',
    accuracy: 0.86,
    inputShape: 'Latent z=(128,) + condition c=(42,)',
    parameters: '89.7M',
    description: 'Generates realistic synthetic patient profiles conditioned on disease stage, demographics, and target biomarkers.',
  },
  {
    id: 'whisper-speech',
    name: 'Whisper+Wav2Vec2 Fusion',
    architecture: 'Whisper Large v3 + Wav2Vec2-XLSR',
    framework: 'PyTorch + FastAPI',
    version: 'v1.3.0',
    endpoint: 'http://ml-gateway.internal:8006/predict/speech',
    status: 'connected',
    gpu: 'NVIDIA T4 16GB',
    latency: 680,
    p99: 1400,
    throughput: 8,
    uptime: 240,
    lastDeployed: '2026-06-15T12:00:00Z',
    accuracy: 0.88,
    inputShape: '(1, 16000) audio samples @ 16kHz',
    parameters: '1.55B',
    description: 'Speech analysis fusion model. Transcribes, extracts acoustic features, and scores cognitive-linguistic decline markers.',
  },
  {
    id: 'rl-treatment',
    name: 'RL Treatment Optimizer',
    architecture: 'PPO with Transformer Policy',
    framework: 'Stable-Baselines3 + Ray RLlib',
    version: 'v1.1.2',
    endpoint: 'http://ml-gateway.internal:8007/optimize/treatment',
    status: 'connected',
    gpu: 'CPU (32 cores)',
    latency: 2500,
    p99: 5800,
    throughput: 1,
    uptime: 144,
    lastDeployed: '2026-06-12T10:00:00Z',
    accuracy: 0.82,
    inputShape: '(42,) patient state + (10, 3) action history',
    parameters: '8.3M',
    description: 'Reinforcement learning agent for personalized treatment sequence optimization. Trained on 50K simulated patient trajectories.',
  },
  {
    id: 'moe-fusion',
    name: 'Mixture of Experts Router',
    architecture: 'Top-K Gating MoE (8 experts)',
    framework: 'PyTorch 2.3 + Custom Serving',
    version: 'v2.1.0',
    endpoint: 'http://ml-gateway.internal:8000/fuse',
    status: 'connected',
    gpu: '4x NVIDIA A100 80GB',
    latency: 95,
    p99: 180,
    throughput: 120,
    uptime: 720,
    lastDeployed: '2026-06-26T08:00:00Z',
    accuracy: 0.93,
    inputShape: 'Multi-modal dict: mri + gen + bio + speech + sleep + act + cog',
    parameters: '2.1B (260M active per inference)',
    description: 'Central fusion layer that routes modality-specific features to specialized expert networks and produces unified risk prediction.',
  },
];

const storageServices: StorageService[] = [
  {
    id: 'aws-s3-mri',
    name: 'MRI Image Storage',
    provider: 'AWS S3',
    type: 'object',
    status: 'connected',
    endpoint: 's3://neurotwin-mri-us-east-1',
    region: 'us-east-1 (Virginia)',
    totalStorage: '12.8 TB',
    usedStorage: '8.4 TB (65.6%)',
    iops: 3500,
    latency: 28,
    lastSync: '2026-06-29T08:30:00Z',
    encryption: 'AES-256-SSE + KMS (HIPAA)',
    metrics: [
      { label: 'Objects Stored', value: '2,847,293', trend: 'up' },
      { label: 'Daily Uploads', value: '~340 NIfTI files', trend: 'stable' },
      { label: 'GET Requests/24h', value: '18,420', trend: 'up' },
      { label: 'Bandwidth', value: '24.6 GB/day', trend: 'stable' },
    ],
  },
  {
    id: 'azure-blob-genomics',
    name: 'Genomics & EHR Storage',
    provider: 'Azure Blob Storage',
    type: 'object',
    status: 'connected',
    endpoint: 'https://neurotwin.blob.core.windows.net/genomics',
    region: 'East US 2',
    totalStorage: '3.2 TB',
    usedStorage: '1.9 TB (59.4%)',
    iops: 2200,
    latency: 35,
    lastSync: '2026-06-29T06:15:00Z',
    encryption: 'AES-256 + Customer-Managed Key',
    metrics: [
      { label: 'VCF Files', value: '142,870', trend: 'up' },
      { label: 'EHR Records', value: '891,204', trend: 'up' },
      { label: 'FHIR Bundles', value: '456,012', trend: 'stable' },
      { label: 'Data Ingestion Rate', value: '12.4 MB/min', trend: 'stable' },
    ],
  },
  {
    id: 'pinecone-vectors',
    name: 'Patient Similarity Engine',
    provider: 'Pinecone',
    type: 'vector',
    status: 'connected',
    endpoint: 'https://neurotwin-vectors.pinecone.io',
    region: 'us-east-1 (Serverless)',
    totalStorage: 'Index: 768-dim',
    usedStorage: '1.24M vectors',
    iops: 850,
    latency: 12,
    lastSync: '2026-06-29T09:00:00Z',
    encryption: 'TLS 1.3 + at-rest AES-256',
    metrics: [
      { label: 'Vector Dimensions', value: '768', trend: 'stable' },
      { label: 'Total Vectors', value: '1,243,890', trend: 'up' },
      { label: 'Avg Query Latency', value: '12ms', trend: 'stable' },
      { label: 'Queries/24h', value: '4,820', trend: 'up' },
    ],
  },
  {
    id: 'weaviate-embeddings',
    name: 'RAG Document Embeddings',
    provider: 'Weaviate',
    type: 'vector',
    status: 'connected',
    endpoint: 'https://neurotwin-rag.weaviate.cloud',
    region: 'GKE us-central1',
    totalStorage: 'Index: 1536-dim',
    usedStorage: '328K chunks',
    iops: 420,
    latency: 45,
    lastSync: '2026-06-28T22:00:00Z',
    encryption: 'TLS 1.3 + disk encryption',
    metrics: [
      { label: 'Embedding Model', value: 'text-embedding-3-large', trend: 'stable' },
      { label: 'Document Chunks', value: '328,450', trend: 'up' },
      { label: 'Hybrid Searches/24h', value: '1,240', trend: 'up' },
      { label: 'Recall@10', value: '0.96', trend: 'stable' },
    ],
  },
  {
    id: 'influxdb-longitudinal',
    name: 'Longitudinal Time-Series DB',
    provider: 'InfluxDB Cloud',
    type: 'timeseries',
    status: 'connected',
    endpoint: 'https://us-east-1-1.aws.cloud2.influxdata.com',
    region: 'AWS us-east-1',
    totalStorage: '480 GB',
    usedStorage: '312 GB (65%)',
    iops: 12000,
    latency: 4,
    lastSync: '2026-06-29T09:45:00Z',
    encryption: 'TLS 1.3 + AES-256 at-rest',
    metrics: [
      { label: 'Measurements', value: '47', trend: 'stable' },
      { label: 'Total Data Points', value: '892.4M', trend: 'up' },
      { label: 'Write Throughput', value: '42K pts/sec', trend: 'stable' },
      { label: 'Query Latency p95', value: '8ms', trend: 'stable' },
    ],
  },
  {
    id: 'influxdb-wearable',
    name: 'Wearable Streams (Hot)',
    provider: 'InfluxDB Edge',
    type: 'timeseries',
    status: 'connected',
    endpoint: 'http://influxdb-edge.internal:8086',
    region: 'On-premise (Edge Node)',
    totalStorage: '64 GB RAM',
    usedStorage: '38 GB (59.4%)',
    iops: 85000,
    latency: 1,
    lastSync: '2026-06-29T09:59:00Z',
    encryption: 'mTLS + AES-256',
    metrics: [
      { label: 'Active Streams', value: '2,340 patients', trend: 'up' },
      { label: 'Data Points/sec', value: '125,000', trend: 'up' },
      { label: 'Downsampled (7d)', value: '4.2M pts', trend: 'stable' },
      { label: 'Retention Policy', value: 'Raw 90d, Downsampled 7yr', trend: 'stable' },
    ],
  },
];

const pipelines: DataPipelineStage[] = [
  {
    id: 'pipe-mri-ingest',
    name: 'MRI NIfTI Ingestion',
    source: 'DICOM Router (Hospital PACS)',
    destination: 'AWS S3 + Pinecone (feature vectors)',
    status: 'connected',
    throughput: '45 scans/hour',
    recordsProcessed: 2847293,
    errors24h: 2,
    lastRun: '2026-06-29T09:30:00Z',
  },
  {
    id: 'pipe-genomics-etl',
    name: 'Genomics ETL Pipeline',
    source: 'Illumina Sequencer / WGS VCFs',
    destination: 'Azure Blob + InfluxDB (variant time-series)',
    status: 'connected',
    throughput: '12 genomes/hour',
    recordsProcessed: 142870,
    errors24h: 0,
    lastRun: '2026-06-29T06:15:00Z',
  },
  {
    id: 'pipe-biomarker-stream',
    name: 'Blood Biomarker Stream',
    source: 'Lab API (HL7 FHIR)',
    destination: 'InfluxDB Longitudinal + Pinecone',
    status: 'connected',
    throughput: '180 results/hour',
    recordsProcessed: 3421890,
    errors24h: 1,
    lastRun: '2026-06-29T09:45:00Z',
  },
  {
    id: 'pipe-wearable-ingest',
    name: 'Wearable Data Ingestion',
    source: 'Apple Watch / Fitbit / Oura APIs',
    destination: 'InfluxDB Edge (hot) → Cloud (cold)',
    status: 'syncing',
    throughput: '125K pts/sec',
    recordsProcessed: 892400000,
    errors24h: 14,
    lastRun: '2026-06-29T09:59:00Z',
  },
  {
    id: 'pipe-speech-process',
    name: 'Speech Audio Processing',
    source: 'Recording devices / Telehealth',
    destination: 'S3 (audio) + Whisper features → InfluxDB',
    status: 'connected',
    throughput: '24 recordings/hour',
    recordsProcessed: 189420,
    errors24h: 0,
    lastRun: '2026-06-29T08:00:00Z',
  },
  {
    id: 'pipe-ehr-sync',
    name: 'EHR FHIR Sync',
    source: 'Epic / Cerner FHIR R4 APIs',
    destination: 'Azure Blob (FHIR bundles) + Weaviate (chunks)',
    status: 'degraded',
    throughput: '8 records/min (throttled)',
    recordsProcessed: 456012,
    errors24h: 23,
    lastRun: '2026-06-29T07:30:00Z',
  },
  {
    id: 'pipe-vector-index',
    name: 'Embedding & Vector Indexing',
    source: 'All modalities (post-ETL)',
    destination: 'Pinecone (patient similarity) + Weaviate (RAG)',
    status: 'connected',
    throughput: '2,400 vectors/hour',
    recordsProcessed: 1572340,
    errors24h: 0,
    lastRun: '2026-06-29T09:00:00Z',
  },
];

export const useInfraStore = create<InfraStore>()(
  persist(
    (set, get) => ({
      mlModels,
      storageServices,
      pipelines,
      selectedService: null,
      setSelectedService: (id) => set({ selectedService: id }),
      servicePollInterval: 30000,
      isPolling: false,

      startPolling: () => {
        if (get().isPolling) return;
        set({ isPolling: true });
        const interval = setInterval(async () => {
          // Simulate live metric jitter
          set((state) => ({
            mlModels: state.mlModels.map((m) => ({
              ...m,
              latency: Math.max(10, m.latency + Math.floor((Math.random() - 0.5) * 20)),
              throughput: Math.max(1, m.throughput + Math.floor((Math.random() - 0.5) * 4)),
            })),
            storageServices: state.storageServices.map((s) => ({
              ...s,
              latency: Math.max(1, s.latency + Math.floor((Math.random() - 0.5) * 5)),
              iops: Math.max(100, s.iops + Math.floor((Math.random() - 0.5) * 200)),
            })),
          }));
        }, get().servicePollInterval);
        // Store interval for cleanup
        (get as any)._pollInterval = interval;
      },

      stopPolling: () => {
        set({ isPolling: false });
        if ((get as any)._pollInterval) {
          clearInterval((get as any)._pollInterval);
        }
      },

      refreshService: async (id: string) => {
        // Simulate a health check call
        await new Promise((r) => setTimeout(r, 800));
        set((state) => ({
          mlModels: state.mlModels.map((m) =>
            m.id === id ? { ...m, status: 'connected' as const, uptime: m.uptime + 0.01 } : m
          ),
          storageServices: state.storageServices.map((s) =>
            s.id === id ? { ...s, status: 'connected' as const } : s
          ),
        }));
      },
    }),
    {
      name: 'neuro-infra-storage',
      partialize: (state) => ({
        mlModels: state.mlModels,
        storageServices: state.storageServices,
        pipelines: state.pipelines,
      }),
    }
  )
);