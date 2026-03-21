export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Stage = '1. Dataset' | '2. Preprocessing' | '3. Synthetic Gen' | '4. Training' | '5. Evaluation' | '6. Export';

export interface ComponentDef {
  id: string;
  name: string;
  stage: Stage;
  category: string;
  description: string;
  skillLevel: SkillLevel;
  type: string;
  icon: string; // Emoji
}

export const COMPONENTS: ComponentDef[] = [
  // Stage 1: Dataset
  { id: 'ds1', name: 'Original Data', stage: '1. Dataset', category: 'Upload', description: 'Upload raw .csv or .json files directly.', skillLevel: 'beginner', type: 'DATA_SOURCE', icon: '🗄️' },
  { id: 'ds2', name: 'HuggingFace Hub', stage: '1. Dataset', category: 'Integration', description: 'Pull datasets via HF API.', skillLevel: 'intermediate', type: 'DATA_SOURCE', icon: '🤗' },
  { id: 'ds3', name: 'S3 Parquet Stream', stage: '1. Dataset', category: 'Data Lake', description: 'High-throughput stream from AWS S3.', skillLevel: 'advanced', type: 'DATA_SOURCE', icon: '☁️' },

  // Stage 2: Preprocessing
  { id: 'pp1', name: 'Data Cleansing', stage: '2. Preprocessing', category: 'Cleaning', description: 'Remove nulls and handle basic outliers.', skillLevel: 'beginner', type: 'PREPROCESSOR', icon: '🧹' },
  { id: 'pp2', name: 'Fuzzy Deduplication', stage: '2. Preprocessing', category: 'Deduplication', description: 'Remove near-duplicate documents to prevent memorization.', skillLevel: 'intermediate', type: 'PREPROCESSOR', icon: '👯' },
  { id: 'pp3', name: 'PII Redaction', stage: '2. Preprocessing', category: 'Privacy', description: 'Scrub personally identifiable information using NER.', skillLevel: 'intermediate', type: 'PREPROCESSOR', icon: '🛡️' },
  { id: 'pp4', name: 'MinHash LSH', stage: '2. Preprocessing', category: 'Deduplication', description: 'Scalable structural deduplication at corpus level.', skillLevel: 'advanced', type: 'PREPROCESSOR', icon: '🕸️' },

  // Stage 3: Synthetic Gen
  { id: 'sg1', name: 'Synthetic Gen', stage: '3. Synthetic Gen', category: 'Augmentation', description: 'Inject synthetic variations of existing data.', skillLevel: 'beginner', type: 'SYNTHETIC_GEN', icon: '🪄' },
  { id: 'sg2', name: 'Nemotron Generator', stage: '3. Synthetic Gen', category: 'Agentic', description: 'Use Nemotron-4-340B to generate QA pairs.', skillLevel: 'intermediate', type: 'SYNTHETIC_GEN', icon: '🤖' },
  { id: 'sg3', name: 'Adversarial Prompting', stage: '3. Synthetic Gen', category: 'Red Teaming', description: 'Generate adversarial edge cases to exploit vulnerabilities.', skillLevel: 'advanced', type: 'SYNTHETIC_GEN', icon: '🦹' },

  // Stage 4: Training
  { id: 'tr1', name: 'Train Model', stage: '4. Training', category: 'Core', description: 'Standard language model fine-tuning.', skillLevel: 'beginner', type: 'MODEL', icon: '🧠' },
  { id: 'tr2', name: 'LoRA Fine-Tune', stage: '4. Training', category: 'PEFT', description: 'Low-Rank Adaptation for efficient tuning.', skillLevel: 'intermediate', type: 'MODEL', icon: '🔬' },
  { id: 'tr3', name: 'DPO Alignment', stage: '4. Training', category: 'Alignment', description: 'Direct Preference Optimization against a reference model.', skillLevel: 'advanced', type: 'MODEL', icon: '⚖️' },
  { id: 'tr4', name: 'Tensor Parallel Run', stage: '4. Training', category: 'Infrastructure', description: 'Multi-GPU distributed training configuration.', skillLevel: 'advanced', type: 'MODEL', icon: '⚡' },

  // Stage 5: Evaluation
  { id: 'ev1', name: 'Rule-based Eval', stage: '5. Evaluation', category: 'Validation', description: 'Assess model performance against static metrics.', skillLevel: 'beginner', type: 'EVALUATION', icon: '📊' },
  { id: 'ev2', name: 'LLM-as-a-Judge', stage: '5. Evaluation', category: 'Agentic', description: 'Use a strong teacher model to grade responses.', skillLevel: 'intermediate', type: 'EVALUATION', icon: '⚖️' },
  { id: 'ev3', name: 'Toxicity Benchmark', stage: '5. Evaluation', category: 'Safety', description: 'Measure propensity for hate speech and bias.', skillLevel: 'intermediate', type: 'EVALUATION', icon: '☢️' },
  { id: 'ev4', name: 'Custom MMLU Router', stage: '5. Evaluation', category: 'Benchmarks', description: 'Run Massive Multitask Language Understanding suite.', skillLevel: 'advanced', type: 'EVALUATION', icon: '🎓' },

  // Stage 6: Export
  { id: 'ex1', name: 'Save Weights', stage: '6. Export', category: 'Local', description: 'Download the final LoRA weights.', skillLevel: 'beginner', type: 'EXPORT', icon: '💾' },
  { id: 'ex2', name: 'HuggingFace Push', stage: '6. Export', category: 'Integration', description: 'Push merged model artifact to HF.', skillLevel: 'intermediate', type: 'EXPORT', icon: '🚀' },
  { id: 'ex3', name: 'ONNX Quantization', stage: '6. Export', category: 'Compression', description: 'Quantize to 8-bit INT8 for edge deployment.', skillLevel: 'advanced', type: 'EXPORT', icon: '🗜️' }
];

export const SKILL_WEIGHTS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3
};
