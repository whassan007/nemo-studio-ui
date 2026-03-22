import React, { useState, useMemo } from 'react';
import './index.css';

/* ── STAGE DEFINITIONS ── */
const STAGES=[
  {id:1,label:'1. Dataset',       color:'#00c896',cls:'sc1'},
  {id:2,label:'2. Preprocessing', color:'#3b82f6',cls:'sc2'},
  {id:3,label:'3. Synthetic Data',color:'#a855f7',cls:'sc3'},
  {id:4,label:'4. Training',      color:'#f59e0b',cls:'sc4'},
  {id:5,label:'5. Evaluation',    color:'#ef4444',cls:'sc5'},
  {id:6,label:'6. Export',        color:'#10b981',cls:'sc6'},
];

const REQUIRED_STAGES=new Set([1,4,5]);
const SC: Record<number, string>={1:'#00c896',2:'#3b82f6',3:'#a855f7',4:'#f59e0b',5:'#ef4444',6:'#10b981'};
const SKCL: Record<string, string>={beginner:'#00c896',intermediate:'#f59e0b',advanced:'#ef4444'};
const SKDOT: Record<string, string>={beginner:'🟢',intermediate:'🟡',advanced:'🔴'};
const SKRANK: Record<string, number>={beginner:0,intermediate:1,advanced:2};

/* ── ALL 147 COMPONENTS ── */
const ALL=[
  /* STAGE 1 — DATASET (9) */
  {id:'orig-data',      s:1,sk:'beginner',    sg:'Sources',       icon:'🗄️', name:'Original Data',               desc:'Upload raw .csv or .json files directly.'},
  {id:'hf-hub',         s:1,sk:'intermediate',sg:'Sources',       icon:'🤗', name:'HuggingFace Hub',             desc:'Pull datasets via HF Datasets API.'},
  {id:'s3-parquet',     s:1,sk:'advanced',    sg:'Sources',       icon:'☁️', name:'S3 Parquet Stream',           desc:'High-throughput stream from AWS S3.'},
  {id:'common-crawl',   s:1,sk:'advanced',    sg:'Sources',       icon:'🌐', name:'Common Crawl',                desc:'Web-scale pretraining corpus download.'},
  {id:'wikidumps',      s:1,sk:'intermediate',sg:'Sources',       icon:'📖', name:'Wikidumps',                   desc:'Wikipedia full-text dump ingestion.'},
  {id:'arxiv-dl',       s:1,sk:'advanced',    sg:'Sources',       icon:'📄', name:'ArXiv Download',              desc:'Scientific paper corpus via ArXiv API.'},
  {id:'jsonl-handler',  s:1,sk:'intermediate',sg:'Formats',       icon:'📋', name:'JSONL Handler',               desc:'Read/write JSON-Lines format files.'},
  {id:'custom-loader',  s:1,sk:'advanced',    sg:'Formats',       icon:'⚙️', name:'Custom Dataset Loader',       desc:'YAML-configured adapter for any source.'},
  {id:'url-ingest',     s:1,sk:'advanced',    sg:'Formats',       icon:'🔗', name:'URL-based Ingestion',         desc:'Parallel download from URL lists.'},

  /* STAGE 2 — PREPROCESSING (27) */
  {id:'cleanse',        s:2,sk:'beginner',    sg:'Cleaning',      icon:'🧹', name:'Data Cleansing',              desc:'Remove nulls and handle basic outliers.'},
  {id:'text-fmt',       s:2,sk:'intermediate',sg:'Cleaning',      icon:'✏️', name:'Text Reformatter',            desc:'Fix bad Unicode, normalize newlines.'},
  {id:'repeat-rm',      s:2,sk:'intermediate',sg:'Cleaning',      icon:'🔁', name:'Repetition Removal',          desc:'Detect and remove repeated n-grams.'},
  {id:'nonalpha',       s:2,sk:'intermediate',sg:'Cleaning',      icon:'🔤', name:'Non-alphanumeric Filter',     desc:'Strip excessive symbols and noise.'},
  {id:'prompt-tmpl',    s:2,sk:'intermediate',sg:'Cleaning',      icon:'📝', name:'Prompt Template',             desc:'Apply structured prompt format to data.'},
  {id:'shuffle',        s:2,sk:'beginner',    sg:'Cleaning',      icon:'🔀', name:'Data Shuffling',              desc:'Randomize and shuffle dataset rows.'},
  {id:'blend',          s:2,sk:'intermediate',sg:'Cleaning',      icon:'🧪', name:'Data Blending',               desc:'Mix multiple sources with ratio control.'},
  {id:'dedup-exact',    s:2,sk:'intermediate',sg:'Deduplication', icon:'🔑', name:'Exact Deduplication',         desc:'Hash-based identical document removal.'},
  {id:'dedup-fuzzy',    s:2,sk:'intermediate',sg:'Deduplication', icon:'🔍', name:'Fuzzy Deduplication',         desc:'Remove near-duplicate docs via MinHash+LSH.'},
  {id:'dedup-sem',      s:2,sk:'advanced',    sg:'Deduplication', icon:'🧮', name:'Semantic Deduplication',      desc:'Embedding cosine-distance dedup.'},
  {id:'dedup-gpu',      s:2,sk:'advanced',    sg:'Deduplication', icon:'⚡', name:'Multi-GPU Deduplication',     desc:'RAPIDS-accelerated distributed dedup.'},
  {id:'quality-rule',   s:2,sk:'beginner',    sg:'Quality',       icon:'✅', name:'Rule-based Quality Filter',   desc:'Heuristic document quality checks.'},
  {id:'quality-cls',    s:2,sk:'intermediate',sg:'Quality',       icon:'🎯', name:'Quality Classifier',          desc:'ML High/Medium/Low quality scoring.'},
  {id:'heuristic-flt',  s:2,sk:'intermediate',sg:'Quality',       icon:'📏', name:'Heuristic-based Filter',      desc:'Statistical document quality rules.'},
  {id:'contam-filter',  s:2,sk:'advanced',    sg:'Quality',       icon:'🧫', name:'Contamination Filter',        desc:'Downstream task decontamination.'},
  {id:'multilingual-dc',s:2,sk:'advanced',    sg:'Quality',       icon:'🌍', name:'Multilingual Decontamination',desc:'Remove benchmark text across languages.'},
  {id:'domain-cls',     s:2,sk:'intermediate',sg:'Classification',icon:'🏷️', name:'Domain Classifier',           desc:'26-class domain labeling (Finance, Health…).'},
  {id:'pii-filter',     s:2,sk:'beginner',    sg:'Classification',icon:'🔒', name:'PII Filter',                  desc:'Remove or redact personal information.'},
  {id:'toxicity-cls',   s:2,sk:'intermediate',sg:'Classification',icon:'🚫', name:'Toxicity Classifier',         desc:'Filter harmful and toxic content.'},
  {id:'task-cls',       s:2,sk:'advanced',    sg:'Classification',icon:'🗂️', name:'Task Classifier',             desc:'Label documents by downstream task type.'},
  {id:'complexity-cls', s:2,sk:'advanced',    sg:'Classification',icon:'📊', name:'Complexity Classifier',       desc:'Score document linguistic complexity.'},
  {id:'prompt-task-cls',s:2,sk:'advanced',    sg:'Classification',icon:'🧠', name:'Prompt Task & Complexity Cls',desc:'Joint prompt task and complexity scoring.'},
  {id:'instr-guard',    s:2,sk:'advanced',    sg:'Classification',icon:'🛡️', name:'Instruction Data Guard',      desc:'Detect malicious or poisoned instructions.'},
  {id:'safety-cls',     s:2,sk:'advanced',    sg:'Classification',icon:'🔐', name:'Safety Classifier',           desc:'NIM-powered safety content filtering.'},
  {id:'content-cls',    s:2,sk:'advanced',    sg:'Classification',icon:'📦', name:'Content Classifier',          desc:'Broad content category labeling.'},
  {id:'diversity-cls',  s:2,sk:'advanced',    sg:'Classification',icon:'🌈', name:'Diversity Classifier',        desc:'Measure and maximize dataset diversity.'},
  {id:'entity-cls-pre', s:2,sk:'advanced',    sg:'Classification',icon:'🏷️', name:'Entity Classification',       desc:'Named entity tagging and classification.'},

  /* STAGE 3 — SYNTHETIC DATA (12) */
  {id:'synth-gen',      s:3,sk:'beginner',    sg:'Generation',    icon:'✨', name:'Synthetic Gen',               desc:'Inject synthetic variations into dataset.'},
  {id:'qa-open',        s:3,sk:'intermediate',sg:'Generation',    icon:'💬', name:'Open Q&A Generation',         desc:'Generate open-ended question-answer pairs.'},
  {id:'qa-closed',      s:3,sk:'intermediate',sg:'Generation',    icon:'📝', name:'Closed Q&A Generation',       desc:'Multiple-choice synthetic questions.'},
  {id:'writing-gen',    s:3,sk:'intermediate',sg:'Generation',    icon:'✍️', name:'Writing Prompt Generation',   desc:'Creative writing prompt synthesis.'},
  {id:'math-code-gen',  s:3,sk:'advanced',    sg:'Generation',    icon:'🔢', name:'Math / Coding Prompt Gen',    desc:'Synthetic math problems and code tasks.'},
  {id:'two-turn-gen',   s:3,sk:'advanced',    sg:'Generation',    icon:'↩️', name:'Synthetic Two-Turn Prompts',  desc:'Follow-up conversation generation.'},
  {id:'dialogue-gen',   s:3,sk:'advanced',    sg:'Generation',    icon:'🗣️', name:'Dialogue Generation',         desc:'Multi-turn conversation synthesis.'},
  {id:'entity-cls-sdg', s:3,sk:'advanced',    sg:'Pipelines',     icon:'🏷️', name:'Entity Classification Pipeline',desc:'Entity-grounded SDG pipeline.'},
  {id:'nemotron-reward',s:3,sk:'advanced',    sg:'Pipelines',     icon:'🏆', name:'Nemotron-4 340B Reward',      desc:'Use Nemotron reward model for SDG scoring.'},
  {id:'openai-sdg',     s:3,sk:'advanced',    sg:'Pipelines',     icon:'🔌', name:'OpenAI-Compatible SDG',       desc:'Bring your own Instruct/Reward model.'},
  {id:'synth-filter',   s:3,sk:'intermediate',sg:'Filtering',     icon:'🧹', name:'Synthetic Data Filter',       desc:'Wide-range filtering for synthetic outputs.'},
  {id:'multidim-score', s:3,sk:'advanced',    sg:'Filtering',     icon:'📐', name:'Multidimensional Scoring',    desc:'Human preference multi-axis scoring.'},

  /* STAGE 4 — TRAINING (44) */
  /* Pretraining */
  {id:'train-model',    s:4,sk:'beginner',    sg:'Pretraining',   icon:'🤖', name:'Train Model',                 desc:'Language model next-token prediction task.'},
  {id:'pretraining',    s:4,sk:'intermediate',sg:'Pretraining',   icon:'📚', name:'Pretraining',                 desc:'Self-supervised training on raw text.'},
  {id:'cpt',            s:4,sk:'intermediate',sg:'Pretraining',   icon:'🔄', name:'Continued Pretraining (CPT)', desc:'Domain-specific continued pretraining.'},
  {id:'dapt',           s:4,sk:'advanced',    sg:'Pretraining',   icon:'🎯', name:'Domain-Adaptive Pretraining', desc:'DAPT for deep domain specialization.'},
  {id:'long-ctx',       s:4,sk:'advanced',    sg:'Pretraining',   icon:'📏', name:'Long-Context Pretraining',    desc:'Extend model context window length.'},
  {id:'tok-adapt',      s:4,sk:'advanced',    sg:'Pretraining',   icon:'🔤', name:'Tokenizer Adaptation',        desc:'Expand tokenizer vocabulary for domain.'},
  {id:'tok-train',      s:4,sk:'advanced',    sg:'Pretraining',   icon:'🧩', name:'Tokenizer Training',          desc:'Train new tokenizer on domain corpus.'},
  {id:'embed-init',     s:4,sk:'advanced',    sg:'Pretraining',   icon:'🎲', name:'Embedding Initialization',    desc:'Initialize new token embeddings properly.'},
  /* SFT */
  {id:'sft',            s:4,sk:'intermediate',sg:'Fine-Tuning',   icon:'🎓', name:'Supervised Fine-Tuning (SFT)',desc:'Full-parameter fine-tune on labeled examples.'},
  {id:'instr-tuning',   s:4,sk:'intermediate',sg:'Fine-Tuning',   icon:'💬', name:'Instruction Tuning',          desc:'Teach model to follow instructions.'},
  {id:'multi-task-ft',  s:4,sk:'advanced',    sg:'Fine-Tuning',   icon:'📋', name:'Multi-Task Fine-Tuning',      desc:'Simultaneous multi-objective fine-tuning.'},
  {id:'cot-ft',         s:4,sk:'advanced',    sg:'Fine-Tuning',   icon:'🧠', name:'Chain-of-Thought FT',         desc:'Teach structured reasoning via CoT.'},
  /* PEFT */
  {id:'lora',           s:4,sk:'intermediate',sg:'PEFT',          icon:'⚡', name:'LoRA',                        desc:'Low-Rank Adaptation — efficient fine-tuning.'},
  {id:'adapters',       s:4,sk:'advanced',    sg:'PEFT',          icon:'🔌', name:'Adapters',                    desc:'Bottleneck MLP adapter modules.'},
  {id:'prefix-tuning',  s:4,sk:'advanced',    sg:'PEFT',          icon:'🔠', name:'Prefix Tuning / P-Tuning',    desc:'Learn continuous task-specific prefixes.'},
  {id:'bitfit',         s:4,sk:'advanced',    sg:'PEFT',          icon:'⚙️', name:'BitFit',                      desc:'Tune only bias terms — ultra-lightweight.'},
  {id:'peft-gen',       s:4,sk:'intermediate',sg:'PEFT',          icon:'🛠️', name:'PEFT (General)',              desc:'Parameter-efficient fine-tuning framework.'},
  {id:'qat',            s:4,sk:'advanced',    sg:'PEFT',          icon:'🔬', name:'Quantization-Aware Training', desc:'Fine-tune with simulated quantization ops.'},
  /* Alignment */
  {id:'reward-model',   s:4,sk:'advanced',    sg:'Alignment & RL',icon:'🏅', name:'Reward Model Training',       desc:'Train scalar reward model from preferences.'},
  {id:'rlhf',           s:4,sk:'advanced',    sg:'Alignment & RL',icon:'🎮', name:'RLHF',                        desc:'Reinforcement Learning from Human Feedback.'},
  {id:'ppo',            s:4,sk:'advanced',    sg:'Alignment & RL',icon:'📈', name:'PPO',                         desc:'Proximal Policy Optimization for alignment.'},
  {id:'grpo',           s:4,sk:'advanced',    sg:'Alignment & RL',icon:'📊', name:'GRPO',                        desc:'Group Relative Policy Optimization.'},
  {id:'dpo',            s:4,sk:'advanced',    sg:'Alignment & RL',icon:'👍', name:'DPO',                         desc:'Direct Preference Optimization.'},
  {id:'rule-rewards',   s:4,sk:'advanced',    sg:'Alignment & RL',icon:'✔️', name:'Rule-Based Rewards',          desc:'Verifiable rule rewards (DeepSeek R1 style).'},
  {id:'kl-penalty',     s:4,sk:'advanced',    sg:'Alignment & RL',icon:'🔀', name:'KL Divergence Penalty',       desc:'Penalize policy divergence from reference.'},
  {id:'value-model',    s:4,sk:'advanced',    sg:'Alignment & RL',icon:'💎', name:'Value Model',                 desc:'Estimate advantage for PPO training.'},
  {id:'ref-model',      s:4,sk:'advanced',    sg:'Alignment & RL',icon:'📌', name:'Reference Model',             desc:'Frozen baseline for KL stabilization.'},
  {id:'nemo-rl',        s:4,sk:'advanced',    sg:'Alignment & RL',icon:'🧬', name:'NeMo-RL',                     desc:'Scalable post-training RL library.'},
  /* Compression */
  {id:'ptq',            s:4,sk:'advanced',    sg:'Compression',   icon:'🗜️', name:'Post-Training Quantization',  desc:'Quantize model weights after training.'},
  {id:'fp8-quant',      s:4,sk:'advanced',    sg:'Compression',   icon:'⚗️', name:'FP8 Quantization (W8A8)',     desc:'Float8 weight and activation quantization.'},
  {id:'int8-sq',        s:4,sk:'advanced',    sg:'Compression',   icon:'8️⃣', name:'INT8 SmoothQuant (W8A8)',     desc:'SmoothQuant for INT8 quantization.'},
  {id:'int8-wo',        s:4,sk:'advanced',    sg:'Compression',   icon:'🔢', name:'INT8 Weight-Only (W8A16)',    desc:'Weight-only INT8 quantization.'},
  {id:'int4-wo',        s:4,sk:'advanced',    sg:'Compression',   icon:'4️⃣', name:'INT4 Weight-Only (W4A16)',    desc:'Weight-only INT4 quantization.'},
  {id:'int4-awq',       s:4,sk:'advanced',    sg:'Compression',   icon:'🎯', name:'INT4 AWQ (W4A16)',            desc:'Activation-Aware Weight Quantization.'},
  {id:'int4-gptq',      s:4,sk:'advanced',    sg:'Compression',   icon:'🔩', name:'INT4 GPTQ (W4A16)',           desc:'GPTQ second-order quantization method.'},
  {id:'int4-fp8-awq',   s:4,sk:'advanced',    sg:'Compression',   icon:'🔮', name:'INT4-FP8 AWQ (W4A8)',         desc:'Combined INT4/FP8 quantization.'},
  {id:'fp4-blackwell',  s:4,sk:'advanced',    sg:'Compression',   icon:'🖤', name:'FP4 Quantization (Blackwell)',desc:'FP4 for NVIDIA Blackwell GPUs.'},
  {id:'depth-pruning',  s:4,sk:'advanced',    sg:'Compression',   icon:'✂️', name:'Depth Pruning',               desc:'Remove layers via Block Importance ranking.'},
  {id:'width-pruning',  s:4,sk:'advanced',    sg:'Compression',   icon:'↔️', name:'Width Pruning',               desc:'Prune attention heads, neurons, channels.'},
  {id:'nas',            s:4,sk:'advanced',    sg:'Compression',   icon:'🗺️', name:'Neural Architecture Search',  desc:'Search for optimal compressed architecture.'},
  {id:'soft-distill',   s:4,sk:'advanced',    sg:'Compression',   icon:'🧬', name:'Soft Knowledge Distillation', desc:'Student learns from teacher logits (KL).'},
  {id:'hard-distill',   s:4,sk:'advanced',    sg:'Compression',   icon:'💪', name:'Hard Knowledge Distillation', desc:'Student learns from teacher outputs.'},
  {id:'minitron',       s:4,sk:'advanced',    sg:'Compression',   icon:'🤏', name:'Minitron Approach',           desc:'Iterative pruning + distillation pipeline.'},
  {id:'sparsity',       s:4,sk:'advanced',    sg:'Compression',   icon:'🕳️', name:'Sparsity',                    desc:'Structured/unstructured weight removal.'},

  /* STAGE 5 — EVALUATION (24) */
  {id:'rule-eval',      s:5,sk:'beginner',    sg:'Functional',    icon:'📊', name:'Rule-based Eval',             desc:'Assess model performance with rules.'},
  {id:'llm-judge',      s:5,sk:'intermediate',sg:'Functional',    icon:'⚖️', name:'LLM-as-a-Judge',             desc:'Use a model to evaluate another model.'},
  {id:'zero-shot-eval', s:5,sk:'intermediate',sg:'Functional',    icon:'0️⃣', name:'Zero-Shot Evaluation',        desc:'Evaluate without task-specific examples.'},
  {id:'few-shot-eval',  s:5,sk:'intermediate',sg:'Functional',    icon:'✨', name:'Few-Shot / ICL Evaluation',   desc:'Evaluate with in-context examples.'},
  {id:'mmlu',           s:5,sk:'intermediate',sg:'Benchmarks',    icon:'📐', name:'MMLU',                        desc:'Massive Multitask Language Understanding.'},
  {id:'gsm8k',          s:5,sk:'intermediate',sg:'Benchmarks',    icon:'🔢', name:'GSM8K',                       desc:'Math and quantitative reasoning benchmark.'},
  {id:'hellaswag',      s:5,sk:'intermediate',sg:'Benchmarks',    icon:'🌀', name:'HellaSwag / WinoGrande',      desc:'Commonsense reasoning benchmarks.'},
  {id:'bleu',           s:5,sk:'intermediate',sg:'Benchmarks',    icon:'📏', name:'BLEU Score',                  desc:'N-gram overlap for translation quality.'},
  {id:'rouge',          s:5,sk:'intermediate',sg:'Benchmarks',    icon:'🔴', name:'ROUGE Score',                 desc:'Summarization recall-oriented metric.'},
  {id:'perplexity',     s:5,sk:'intermediate',sg:'Benchmarks',    icon:'❓', name:'Perplexity Metric',           desc:'Language model confidence measurement.'},
  {id:'acc-f1',         s:5,sk:'beginner',    sg:'Benchmarks',    icon:'✅', name:'Accuracy / F1 Score',         desc:'Standard classification metrics.'},
  {id:'glue',           s:5,sk:'intermediate',sg:'Benchmarks',    icon:'🧩', name:'GLUE / SuperGLUE',            desc:'Language understanding task suites.'},
  {id:'squad',          s:5,sk:'intermediate',sg:'Benchmarks',    icon:'📖', name:'SQuAD Score',                 desc:'Question answering performance metric.'},
  {id:'humaneval',      s:5,sk:'advanced',    sg:'Benchmarks',    icon:'💻', name:'HumanEval / MBPP',            desc:'Code generation benchmark suites.'},
  {id:'truthfulqa',     s:5,sk:'advanced',    sg:'Benchmarks',    icon:'🛡️', name:'TruthfulQA / ToxiGen',        desc:'Safety and alignment benchmarks.'},
  {id:'bigbench',       s:5,sk:'advanced',    sg:'Benchmarks',    icon:'🏋️', name:'BigBench Hard',               desc:'Complex reasoning challenge tasks.'},
  {id:'pairwise-elo',   s:5,sk:'intermediate',sg:'Human Eval',    icon:'👥', name:'Pairwise Comparison / ELO',   desc:'Human ranking via ELO tournament scoring.'},
  {id:'likert',         s:5,sk:'intermediate',sg:'Human Eval',    icon:'📋', name:'Likert Scale Eval',           desc:'Expert quality rating on 5-point scale.'},
  {id:'bias-eval',      s:5,sk:'advanced',    sg:'Human Eval',    icon:'⚖️', name:'Bias & Fairness Metrics',     desc:'Measure and report model bias.'},
  {id:'robustness',     s:5,sk:'advanced',    sg:'Human Eval',    icon:'💪', name:'Robustness Evaluation',       desc:'Consistency across diverse test cases.'},
  {id:'mlflow',         s:5,sk:'intermediate',sg:'Tooling',       icon:'📈', name:'MLflow Tracking',             desc:'Log experiments, metrics, artifacts.'},
  {id:'wandb',          s:5,sk:'intermediate',sg:'Tooling',       icon:'🐝', name:'Weights & Biases',            desc:'Real-time experiment visualization.'},
  {id:'nemo-evaluator', s:5,sk:'advanced',    sg:'Tooling',       icon:'🔬', name:'NeMo Evaluator',              desc:'RAG, retrieval, and custom LLM eval.'},
  {id:'e2e-eval',       s:5,sk:'advanced',    sg:'Tooling',       icon:'🔁', name:'End-to-End Eval',             desc:'Full pipeline application evaluation.'},

  /* STAGE 6 — EXPORT & DEPLOYMENT (31) */
  {id:'hf-export',      s:6,sk:'intermediate',sg:'Serving',       icon:'🤗', name:'HuggingFace Export',          desc:'Push model weights to HF Hub.'},
  {id:'onnx-export',    s:6,sk:'intermediate',sg:'Serving',       icon:'📦', name:'ONNX / PyTorch Export',       desc:'Export to standard inference formats.'},
  {id:'trt-llm',        s:6,sk:'advanced',    sg:'Serving',       icon:'🚀', name:'TensorRT-LLM Engine',         desc:'NVIDIA optimized inference engine build.'},
  {id:'trt-compile',    s:6,sk:'advanced',    sg:'Serving',       icon:'⚙️', name:'TRT-LLM Compilation',         desc:'Kernel fusion and graph optimization.'},
  {id:'triton',         s:6,sk:'advanced',    sg:'Serving',       icon:'🖥️', name:'Triton Inference Server',     desc:'Production-grade model serving.'},
  {id:'dynamic-batch',  s:6,sk:'advanced',    sg:'Serving',       icon:'📦', name:'Dynamic Batching',            desc:'Maximize GPU utilization with batching.'},
  {id:'concurrent',     s:6,sk:'advanced',    sg:'Serving',       icon:'⚡', name:'Concurrent Model Execution',  desc:'Run multiple models simultaneously.'},
  {id:'vllm',           s:6,sk:'advanced',    sg:'Serving',       icon:'🔥', name:'vLLM Integration',            desc:'PagedAttention efficient LLM serving.'},
  {id:'sglang',         s:6,sk:'advanced',    sg:'Serving',       icon:'🧵', name:'SGLang Integration',          desc:'Structured generation serving backend.'},
  {id:'nim',            s:6,sk:'advanced',    sg:'Serving',       icon:'🎯', name:'NIM Microservices',           desc:'NVIDIA Inference Microservices.'},
  {id:'lora-serving',   s:6,sk:'advanced',    sg:'Serving',       icon:'🔌', name:'LoRA Multi-Adapter Serving',  desc:'Serve multiple LoRA adapters from one base.'},
  {id:'genai-perf',     s:6,sk:'advanced',    sg:'Serving',       icon:'📊', name:'GenAI-Perf Benchmarking',     desc:'Measure inference latency and throughput.'},
  {id:'model-repo',     s:6,sk:'advanced',    sg:'Serving',       icon:'🗂️', name:'Model Repository',            desc:'Version and manage model artifacts.'},
  {id:'k8s',            s:6,sk:'advanced',    sg:'Infrastructure',icon:'☸️', name:'Kubernetes / KServe',         desc:'Container orchestration for model serving.'},
  {id:'prometheus',     s:6,sk:'advanced',    sg:'Infrastructure',icon:'📡', name:'Prometheus & Grafana',        desc:'Metrics collection and dashboards.'},
  {id:'nemo-curator',   s:6,sk:'advanced',    sg:'Infrastructure',icon:'🗃️', name:'NeMo Curator',               desc:'Full pipeline orchestration framework.'},
  {id:'nemo-customizer',s:6,sk:'advanced',    sg:'Infrastructure',icon:'🎛️', name:'NeMo Customizer',            desc:'Post-training microservice.'},
  {id:'nemo-eval-svc',  s:6,sk:'advanced',    sg:'Infrastructure',icon:'🔬', name:'NeMo Evaluator Svc',         desc:'Evaluation microservice deployment.'},
  {id:'guardrails',     s:6,sk:'intermediate',sg:'Infrastructure',icon:'🛡️', name:'NeMo Guardrails',            desc:'Safety and policy enforcement layer.'},
  {id:'nemo-retriever', s:6,sk:'advanced',    sg:'Infrastructure',icon:'🔗', name:'NeMo Retriever (RAG)',        desc:'Embedding-based retrieval augmentation.'},
  {id:'nemo-rl-svc',    s:6,sk:'advanced',    sg:'Infrastructure',icon:'🧬', name:'NeMo RL Service',            desc:'RL training coordination service.'},
  {id:'nemo-container', s:6,sk:'advanced',    sg:'Infrastructure',icon:'🐳', name:'NeMo Framework Container',   desc:'Official NeMo Docker container.'},
  {id:'rapids-cudf',    s:6,sk:'advanced',    sg:'Infrastructure',icon:'💨', name:'RAPIDS / cuDF',              desc:'GPU-accelerated data processing.'},
  {id:'cuml',           s:6,sk:'advanced',    sg:'Infrastructure',icon:'📐', name:'cuML',                       desc:'GPU K-means for semantic dedup.'},
  {id:'cugraph',        s:6,sk:'advanced',    sg:'Infrastructure',icon:'🕸️', name:'cuGraph',                    desc:'GPU graph processing for fuzzy dedup.'},
  {id:'ray',            s:6,sk:'advanced',    sg:'Infrastructure',icon:'☀️', name:'Ray',                        desc:'Distributed resource scheduling.'},
  {id:'megatron',       s:6,sk:'advanced',    sg:'Infrastructure',icon:'⚙️', name:'Megatron Core',              desc:'Tensor/pipeline/data parallelism.'},
  {id:'api-gateway',    s:6,sk:'advanced',    sg:'Infrastructure',icon:'🚪', name:'API Gateway',                desc:'Route and manage API traffic.'},
  {id:'nvidia-ai-ent',  s:6,sk:'advanced',    sg:'Infrastructure',icon:'🏢', name:'NVIDIA AI Enterprise',       desc:'Production SLAs and security patches.'},
  {id:'lora-nim',       s:6,sk:'advanced',    sg:'Infrastructure',icon:'🔌', name:'LoRA NIM Serving',           desc:'Deploy LoRA adapters via NIM.'},
  {id:'multi-node',     s:6,sk:'advanced',    sg:'Infrastructure',icon:'🖧',  name:'Multi-Node Scaling',         desc:'Distributed multi-node infrastructure.'},
];

/* ── VALIDATION RULES ── */
type RuleSeverity = 'error'|'warn'|'info';
type Skill = 'beginner'|'intermediate'|'advanced';

type Rule = {
  id: string;
  category: string;
  check: (ns: string[]) => boolean;
  type: RuleSeverity | ((skill: Skill) => RuleSeverity | null);
  title: string;
  msgs: string | ((skill: Skill) => string);
  autofix?: string;
};

const RULES: Rule[] = [
  // A1: Stage Gap Detection
  {
    id: 'a1-gap', category: 'Flow',
    check: (ns) => {
      const stages = Array.from(new Set(ns.map(n => ALL.find(c=>c.id===n)?.s).filter(Boolean) as number[])).sort();
      for (let i = 1; i < stages.length; i++) {
        if (stages[i] - stages[i-1] > 1) return true;
      }
      return false;
    },
    type: 'warn', title: 'Pipeline Stage Gap',
    msgs: 'Your data skips one or more stages (e.g., from ingestion directly to training). This is valid but unusual — are you sure you want to skip intermediate steps?',
  },
  // A2: Orphaned Terminal Components
  {
    id: 'a2-orphan', category: 'Flow',
    check: (ns) => {
      const has5or6 = ns.some(n => { const s = ALL.find(c=>c.id===n)?.s; return s===5||s===6; });
      const has3or4 = ns.some(n => { const s = ALL.find(c=>c.id===n)?.s; return s===3||s===4; });
      return has5or6 && !has3or4;
    },
    type: 'warn', title: 'Orphaned Output Component',
    msgs: 'You have Evaluation or Export blocks, but no upstream Training or Synthetic generation. Evaluation with nothing to evaluate is a dead end.'
  },
  // A3: Preprocessing Without Destination
  {
    id: 'a3-pre-deadend', category: 'Flow',
    check: (ns) => {
      const has2 = ns.some(n => ALL.find(c=>c.id===n)?.s === 2);
      const has3456 = ns.some(n => { const s = ALL.find(c=>c.id===n)?.s; return s&&s>=3; });
      return has2 && !has3456;
    },
    type: (skill) => skill === 'beginner' ? null : 'warn', 
    title: 'Preprocessing Without Destination',
    msgs: 'You have preprocessing steps but nothing that consumes the cleaned data.'
  },

  // B1: No Artifact Output
  {
    id: 'b1-no-art', category: 'Output',
    check: (ns) => {
      const has4 = ns.some(n => ALL.find(c=>c.id===n)?.s === 4);
      const has5or6 = ns.some(n => { const s = ALL.find(c=>c.id===n)?.s; return s===5||s===6; });
      return has4 && !has5or6;
    },
    type: 'warn', title: 'No Artifact Output',
    msgs: 'Your pipeline trains a model but produces no output artifact or evaluation. Add an Export or Evaluation block.'
  },
  // B2: Evaluation Without Artifact
  {
    id: 'b2-eval-no-art', category: 'Output',
    check: (ns) => {
      const has5 = ns.some(n => ALL.find(c=>c.id===n)?.s === 5);
      const has4 = ns.some(n => ALL.find(c=>c.id===n)?.s === 4);
      return has5 && !has4;
    },
    type: (skill) => skill === 'beginner' ? 'warn' : 'info',
    title: 'Evaluation Without Artifact',
    msgs: 'You are evaluating without a training step. This is only valid if you are loading a pre-trained model externally.'
  },
  // B3: Export Without Evaluation
  {
    id: 'b3-exp-no-eval', category: 'Output',
    check: (ns) => {
      const has6 = ns.some(n => ALL.find(c=>c.id===n)?.s === 6);
      const has5 = ns.some(n => ALL.find(c=>c.id===n)?.s === 5);
      const has4 = ns.some(n => ALL.find(c=>c.id===n)?.s === 4);
      return has6 && !has5 && has4;
    },
    type: 'warn', title: 'Export Without Evaluation',
    msgs: 'You are exporting a model without an evaluation gate. Consider adding Rule-based Eval or MMLU before export.',
    autofix: 'rule-eval'
  },

  // C1: Alignment Without SFT
  {
    id: 'c1-align-no-sft', category: 'Prerequisite',
    check: (ns) => {
      const align = ['dpo','ppo','grpo','rlhf'];
      const sft = ['sft','instr-tuning'];
      return ns.some(n => align.includes(n)) && !ns.some(n => sft.includes(n));
    },
    type: (skill) => skill === 'beginner' ? null : 'warn',
    title: 'Alignment Without SFT',
    msgs: 'Alignment techniques like DPO work best after supervised fine-tuning. Consider adding SFT before alignment.',
    autofix: 'sft'
  },
  // C2: Compression Without Model
  {
    id: 'c2-comp-no-model', category: 'Prerequisite',
    check: (ns) => {
      const comp = ns.some(n => ALL.find(c=>c.id===n)?.sg === 'Compression');
      const train = ns.some(n => { const c = ALL.find(x=>x.id===n); return c?.s===4 && c?.sg !== 'Compression'; });
      return comp && !train;
    },
    type: 'error', title: 'Compression Without a Model',
    msgs: 'Compression techniques require a trained model. Add a Train Model or SFT block upstream.',
    autofix: 'train-model'
  },
  // C3: Reward Model Without Preference Data
  {
    id: 'c3-rm-no-pref', category: 'Prerequisite',
    check: (ns) => {
      const rm = ns.includes('reward-model');
      const hasSynthLabel = ns.some(n => ['synth-gen','nemotron-reward','openai-sdg'].includes(n));
      return rm && !hasSynthLabel;
    },
    type: (skill) => skill === 'advanced' ? 'warn' : null,
    title: 'Reward Model Without Preference Data',
    msgs: 'Reward Model Training requires preference data (chosen/rejected pairs). Your current data source may not produce this format.'
  },
  // C4: Semantic Dedup Without Embeddings
  {
    id: 'c4-sem-dedup-embed', category: 'Prerequisite',
    check: (ns) => ns.includes('dedup-sem') && !ns.includes('nemo-retriever'), 
    type: (skill) => skill === 'beginner' ? null : 'info',
    title: 'Semantic Deduplication Without Embeddings',
    msgs: 'Semantic Dedup requires a running embedding model endpoint — NeMo Retriever or a custom embedding API.'
  },
  // C5: LoRA Serving Without LoRA Training
  {
    id: 'c5-lora-serve-no-train', category: 'Prerequisite',
    check: (ns) => (ns.includes('lora-serving') || ns.includes('lora-nim')) && !ns.includes('lora'),
    type: (skill) => skill === 'beginner' ? null : 'warn',
    title: 'LoRA Serving Without LoRA Training',
    msgs: 'LoRA Serving requires LoRA adapters produced during training. Add LoRA to your Training stage.',
    autofix: 'lora'
  },
  // C6: RAG Without Retriever
  {
    id: 'c6-rag-no-pipe', category: 'Prerequisite',
    check: (ns) => ns.includes('nemo-retriever') && !ns.some(n=> ALL.find(c=>c.id===n)?.s===1),
    type: (skill) => skill === 'beginner' ? null : 'warn',
    title: 'RAG Without Document Pipeline',
    msgs: 'RAG deployment requires an embedding pipeline and vector store. Add semantic search or retriever components upstream.'
  },

  // D1: Conflicting Deduplication Methods
  {
    id: 'd1-conflict-dedup', category: 'Coherence',
    check: (ns) => {
      const count = ['dedup-exact','dedup-fuzzy','dedup-sem'].filter(n => ns.includes(n)).length;
      return count >= 2;
    },
    type: (skill) => skill === 'advanced' ? 'info' : null,
    title: 'Conflicting Deduplication Methods',
    msgs: 'You have multiple deduplication methods active. Semantic Dedup is the most thorough but most expensive. Consider whether all are necessary.'
  },
  // D2: Redundant Quality Filters
  {
    id: 'd2-redundant-quality', category: 'Coherence',
    check: (ns) => {
      const count = ['quality-rule','quality-cls','heuristic-flt'].filter(n => ns.includes(n)).length;
      return count >= 2;
    },
    type: (skill) => skill === 'beginner' ? null : 'info',
    title: 'Redundant Quality Filters',
    msgs: 'You have multiple quality filtering methods. For most pipelines, one classifier is sufficient. Multiple filters may over-prune your dataset.'
  },
  // D3: Compression After Alignment
  {
    id: 'd3-comp-after-align', category: 'Coherence',
    check: (ns) => {
      const align = ['dpo','ppo','grpo','rlhf'].some(n=>ns.includes(n));
      const comp = ns.some(n => ALL.find(c=>c.id===n)?.sg === 'Compression');
      return align && comp;
    },
    type: (skill) => skill === 'advanced' ? 'warn' : null,
    title: 'Compression After Alignment',
    msgs: 'Quantizing after alignment can degrade preference learning. Consider quantizing before alignment or re-evaluating after compression.'
  },
  // D4: Full SFT + LoRA Together
  {
    id: 'd4-sft-lora', category: 'Coherence',
    check: (ns) => ns.includes('sft') && ns.includes('lora'),
    type: (skill) => skill === 'beginner' ? null : 'info',
    title: 'Full SFT + LoRA Together',
    msgs: 'You have both full-parameter SFT and LoRA. If these are sequential, that is a valid multi-stage approach. If parallel, one is redundant.'
  },
  // D5: Synthetic -> Training Filtering
  {
    id: 'd5-synth-no-filt', category: 'Coherence',
    check: (ns) => {
      const synth = ns.some(n => ALL.find(c=>c.id===n)?.s === 3);
      const train = ns.some(n => ALL.find(c=>c.id===n)?.s === 4);
      const filter = ns.some(n => ['synth-filter','quality-cls','quality-rule'].includes(n));
      return synth && train && !filter;
    },
    type: 'warn', title: 'Synthetic Data Skipping Filtering',
    msgs: 'Synthetic data feeds directly into training without a quality filter. Synthetic noise will propagate to training.'
  },

  // E1: Training Heavy, Eval Light
  {
    id: 'e1-train-heavy', category: 'Balance',
    check: (ns) => {
      const tc = ns.filter(n => ALL.find(c=>c.id===n)?.s === 4).length;
      const ec = ns.filter(n => ALL.find(c=>c.id===n)?.s === 5).length;
      return tc >= 8 && ec <= 1; 
    },
    type: (skill) => skill === 'beginner' ? null : 'info',
    title: 'Training Heavy, Eval Light',
    msgs: 'Your pipeline has extensive training configuration but minimal evaluation. Consider adding benchmarks or LLM-as-a-Judge to match the training depth.'
  },
  // E2: Over-Preprocessing
  {
    id: 'e2-over-pre', category: 'Balance',
    check: (ns) => {
      const p2 = ns.filter(n => ALL.find(c=>c.id===n)?.s === 2).length;
      const t4 = ns.filter(n => ALL.find(c=>c.id===n)?.s === 4).length;
      return p2 > 6 && t4 === 1;
    },
    type: (skill) => skill === 'advanced' ? 'info' : null,
    title: 'Over-Preprocessing',
    msgs: 'Your preprocessing pipeline is highly detailed. Make sure your training configuration matches this level of data quality investment.'
  },
  // E3: Export Without Infrastructure
  {
    id: 'e3-exp-no-infra', category: 'Balance',
    check: (ns) => {
      const exp = ns.includes('trt-llm') || ns.includes('nim');
      const infra = ns.some(n => ALL.find(c=>c.id===n)?.sg === 'Infrastructure');
      return exp && !infra;
    },
    type: (skill) => skill === 'advanced' ? 'info' : null,
    title: 'Export Without Infrastructure',
    msgs: 'TensorRT-LLM and NIM require serving infrastructure. Add Triton Server or Kubernetes to complete your deployment configuration.'
  }
];

/* ── TEMPLATES ── */
const TEMPLATES=[
  {id:'basic',    name:'Basic Domain Fine-Tune',        sk:'beginner',    desc:'Simplest pipeline to fine-tune on your own documents.',                     nodes:['orig-data','cleanse','pii-filter','sft','rule-eval','hf-export']},
  {id:'synth',    name:'Synthetic Data Augmentation',   sk:'intermediate',desc:'Augment data with synthetic variations before fine-tuning.',                 nodes:['orig-data','cleanse','dedup-exact','quality-cls','synth-gen','synth-filter','sft','llm-judge','hf-export']},
  {id:'rag',      name:'RAG Evaluation Pipeline',       sk:'intermediate',desc:'Evaluate retrieval-augmented generation quality.',                           nodes:['orig-data','quality-rule','llm-judge','mmlu','rouge','e2e-eval','nemo-retriever']},
  {id:'compress', name:'Model Compression Workflow',    sk:'advanced',    desc:'Prune, distill, and quantize for edge or constrained deployments.',          nodes:['orig-data','cleanse','train-model','depth-pruning','soft-distill','fp8-quant','bias-eval','trt-llm','genai-perf']},
  {id:'sov',      name:'Sovereign LLM — Full Pipeline', sk:'advanced',    desc:'DAPT → SFT → RLHF → NeMo Evaluator → NIM deploy.',                        nodes:['common-crawl','contam-filter','dedup-fuzzy','multilingual-dc','dapt','sft','dpo','reward-model','rlhf','nemo-evaluator','e2e-eval','nim','guardrails']},
  {id:'class',    name:'Classroom Starter',             sk:'beginner',    desc:'Minimal pipeline for students learning LLM fundamentals.',                   nodes:['orig-data','cleanse','synth-gen','train-model','rule-eval']},
];

/* ── SKILL BADGE ── */
function SkillBadge({sk,inline}: {sk:string; inline?:boolean;}){
  const cl=sk;
  const style=inline?{position:'static' as any, margin:'0'}:{};
  return <div className={`skbadge ${cl}`} style={style} title={sk.toUpperCase()} />;
}

/* ── COMP CARD ── */
function CompCard({comp,onDragStart}: any){
  const bg=SC[comp.s]+'20';
  return(
    <div className="cc" draggable onDragStart={e=>onDragStart(e,comp)} title={`Drag to canvas: ${comp.name}`}>
      <SkillBadge sk={comp.sk}/>
      <div className="cc-icon" style={{background:bg}}>{comp.icon}</div>
      <div className="cc-info">
        <div className="cc-name">{comp.name}</div>
        <div className="cc-desc">{comp.desc}</div>
      </div>
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({skill,search,onSearch,onDragStart}: any){
  const maxR=SKRANK[skill];
  const filtered=useMemo(()=>ALL.filter(c=>{
    const skOk=SKRANK[c.sk]<=maxR;
    const srOk=!search||c.name.toLowerCase().includes(search.toLowerCase())||c.desc.toLowerCase().includes(search.toLowerCase())||(c.sg||'').toLowerCase().includes(search.toLowerCase());
    return skOk&&srOk;
  }),[skill,search]);

  const cnt={beginner:filtered.filter(c=>c.sk==='beginner').length, intermediate:filtered.filter(c=>c.sk==='intermediate').length, advanced:filtered.filter(c=>c.sk==='advanced').length};

  return(
    <div className="sidebar">
      <div className="srch-box">
        <div className="srch-wrap">
          <span className="srch-icon">🔍</span>
          <input className="srch-inp" placeholder="Search components..." value={search} onChange={e=>onSearch(e.target.value)}/>
        </div>
      </div>
      <div className="sb-counts">
        <span style={{color:'#00c896'}}>● {cnt.beginner}</span>
        <span style={{color:'#f59e0b'}}>● {cnt.intermediate}</span>
        {skill==='advanced'&&<span style={{color:'#ef4444'}}>● {cnt.advanced}</span>}
        <span style={{marginLeft:'auto'}}>{filtered.length} components</span>
      </div>
      <div className="sb-content">
        {STAGES.map(stage=>{
          const sc=filtered.filter(c=>c.s===stage.id);
          if(!sc.length) return null;
          const sgs: Record<string, any[]>={};
          sc.forEach(c=>{const g=c.sg||'General';if(!sgs[g])sgs[g]=[];sgs[g].push(c);});
          const isReq=REQUIRED_STAGES.has(stage.id);
          return(
            <div className="sg" key={stage.id}>
              <div className="sg-hdr">
                <div className="sg-left">
                  <span className="sdot" style={{background:stage.color}}/>
                  <span style={{color:stage.color}}>{stage.label}</span>
                  <span className="scnt">{sc.length}</span>
                </div>
                {isReq&&<span className="req-badge">REQUIRED</span>}
              </div>
              {Object.entries(sgs).map(([g,comps])=>(
                <div key={g}>
                  {Object.keys(sgs).length>1&&<div className="sub-lbl">— {g}</div>}
                  {comps.map(comp=><CompCard key={comp.id} comp={comp} onDragStart={onDragStart}/>)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── PIPELINE NODE ── */
function PNode({comp,selected,onClick,onRemove}: any){
  const color=SC[comp.s];
  const stage=STAGES.find(s=>s.id===comp.s);
  return(
    <div className={`pnode${selected?' sel':''}`} onClick={()=>onClick(comp.id)}>
      <div className="pn-hdr" style={{background:color+'18',color}}>{stage?.label.toUpperCase()}</div>
      <div className="pn-status ok"/>
      <button className="pn-rm" onClick={(e: any)=>{e.stopPropagation();onRemove(comp.id);}}>✕</button>
      <div className="pn-body">
        <div className="pn-irow">
          <div className="pn-icon" style={{background:color+'20'}}>{comp.icon}</div>
          <div className="pn-name">{comp.name}</div>
        </div>
        <div className="pn-desc">{comp.desc}</div>
        <div style={{marginTop:6}}><SkillBadge sk={comp.sk} inline/></div>
      </div>
    </div>
  );
}

/* ── VALIDATION PANEL ── */
function ValPanel({nodes,skill,onAutofix}: any){
  const active = RULES.map(r => {
    if (!r.check(nodes)) return null;
    const severity = typeof r.type === 'function' ? r.type(skill) : r.type;
    if (!severity) return null;
    const msg = typeof r.msgs === 'function' ? r.msgs(skill) : r.msgs;
    return { ...r, severity, msg };
  }).filter(Boolean) as any[];

  active.sort((a,b) => {
    const w = {error: 3, warn: 2, info: 1};
    return (w as any)[b.severity] - (w as any)[a.severity];
  });

  const checklist=[
    {l:'Dataset Provided',      done:nodes.some((n:string)=>ALL.find(c=>c.id===n)?.s===1)},
    {l:'Preprocessing Strategy',done:nodes.some((n:string)=>ALL.find(c=>c.id===n)?.s===2)},
    {l:'Training Configured',   done:nodes.some((n:string)=>ALL.find(c=>c.id===n)?.s===4)},
    {l:'Evaluation Gate',       done:nodes.some((n:string)=>ALL.find(c=>c.id===n)?.s===5)},
    {l:'Export Configured',     done:nodes.some((n:string)=>ALL.find(c=>c.id===n)?.s===6)},
  ];
  return(
    <div className="pcontent">
      <div className="ptitle">Validation Summary</div>
      {nodes.length===0&&<div className="vcard info"><div className="vtitle info">💡 Start Building</div><div className="vbody">{skill==='beginner'?'Drag "Original Data" from Dataset on the left to begin.':'Drag components from the sidebar or load a template.'}</div></div>}
      {active.length===0&&nodes.length>0&&<div className="vcard ok"><div className="vtitle ok">✅ No Issues Found</div><div className="vbody">Pipeline structure looks good. Run validation to confirm.</div></div>}
      {active.map(r=>{
        const fc=ALL.find(c=>c.id===r.autofix);
        return(
          <div key={r.id} className={`vcard ${r.severity}`}>
            <div className={`vtitle ${r.severity}`}>{r.severity==='error'?'⚠️':r.severity==='warn'?'⚠️':'ℹ️'} {r.title}</div>
            <div className="vbody">{r.msg}</div>
            {fc&&<button className="afix-btn" onClick={()=>onAutofix(r.autofix)}>Auto-fix: Add {fc.name}</button>}
          </div>
        );
      })}
      <div className="ptitle">Required Stages</div>
      {checklist.map((item,i)=>(
        <div className="chk" key={i}>
          <span className="chk-ico">{item.done?'✅':'⭕'}</span>
          <span className={`chk-lbl${item.done?' done':i<3?' miss':''}`}>{item.l}</span>
        </div>
      ))}
      <div className="ptitle">Stage Breakdown</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:4}}>
        {STAGES.map(st=>{
          const n=nodes.filter((id:string)=>ALL.find(c=>c.id===id)?.s===st.id).length;
          return(
            <div key={st.id} style={{background:'var(--surface2)',borderRadius:6,padding:'7px 10px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:9,fontWeight:700,color:n?st.color:'var(--text3)',letterSpacing:.8,marginBottom:2}}>{st.label.replace(/^\d\. /,'')}</div>
              <div style={{fontSize:20,fontWeight:700,color:n?'var(--text)':'var(--text3)',fontFamily:'Space Mono,monospace'}}>{n}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── EDUCATOR PANEL ── */
function EduPanel({sel}: any){
  if(!sel) return <div className="pcontent" style={{color:'var(--text3)',fontSize:13,paddingTop:24,textAlign:'center',lineHeight:1.8}}><div style={{fontSize:36,marginBottom:10}}>👆</div>Click any canvas node<br/>to see educator notes.</div>;
  const stage=STAGES.find(s=>s.id===sel.s);
  const color=SC[sel.s];
  return(
    <div className="pcontent">
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid var(--border)'}}>
        <div style={{width:40,height:40,borderRadius:10,background:color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{sel.icon}</div>
        <div><div style={{fontWeight:700,fontSize:15}}>{sel.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{stage?.label} › {sel.sg}</div></div>
        <div style={{marginLeft:'auto'}}><SkillBadge sk={sel.sk}/></div>
      </div>
      <div style={{fontSize:12,lineHeight:1.75,color:'var(--text2)'}}>
        <strong style={{color:'var(--text)',display:'block',marginBottom:4}}>What it does</strong>
        {sel.desc}
        <strong style={{color:'var(--text)',display:'block',marginTop:14,marginBottom:4}}>Pipeline Role</strong>
        Sits in the <span style={{color}}>{stage?.label}</span> stage within the <em>{sel.sg}</em> sub-group.
        <strong style={{color:'var(--text)',display:'block',marginTop:14,marginBottom:4}}>Skill Level</strong>
        <span style={{color:SKCL[sel.sk],fontWeight:700}}>{sel.sk}</span> —
        {sel.sk==='beginner'&&' suitable for domain experts without ML background.'}
        {sel.sk==='intermediate'&&' for ML practitioners familiar with fine-tuning.'}
        {sel.sk==='advanced'&&' for MLOps engineers with infrastructure experience.'}
        <strong style={{color:'var(--text)',display:'block',marginTop:14,marginBottom:4}}>NeMo Reference</strong>
        <a href="https://github.com/NVIDIA-NeMo" target="_blank" style={{color:'var(--accent)'}}>github.com/NVIDIA-NeMo ↗</a><br/>
        <span style={{fontSize:10,color:'var(--text3)'}}>Apache 2.0 Licensed — not an official NVIDIA product</span>
      </div>
    </div>
  );
}

/* ── TEMPLATES MODAL ── */
function TmplModal({onClose,onLoad}: any){
  return(
    <div className="moverlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr">
          <div className="mtitle">🗂 Pipeline Templates</div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          {TEMPLATES.map(t=>(
            <div className="tcard" key={t.id} onClick={()=>{onLoad(t);onClose();}}>
              <div className="tname">{t.name}</div>
              <div className="tdesc">{t.desc}</div>
              <div className="ttags">
                <span className={`tag ${t.sk}`}>{SKDOT[t.sk]} {t.sk}</span>
                <span className="tag neutral">{t.nodes.length} components</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App(){
  const [skill,setSkill]=useState('beginner');
  const [search,setSearch]=useState('');
  const [nodes,setNodes]=useState<string[]>([]);
  const [sel,setSel]=useState<string|null>(null);
  const [tab,setTab]=useState('state');
  const [showTmpl,setShowTmpl]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const [toast,setToast]=useState<string|null>(null);

  const notify=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(null),2500);};

  const handleDrop=(e: React.DragEvent)=>{
    e.preventDefault();setDragOver(false);
    const id=e.dataTransfer.getData('compId');
    if(!id)return;
    if(nodes.includes(id)){notify(`Already added: ${ALL.find(c=>c.id===id)?.name}`);return;}
    setNodes(p=>[...p,id]);
    notify(`✓ Added: ${ALL.find(c=>c.id===id)?.name}`);
  };

  const handleAutofix=(id:string)=>{
    if(nodes.includes(id))return;
    setNodes(p=>[...p,id]);
    notify(`⚡ Auto-fixed → Added: ${ALL.find(c=>c.id===id)?.name}`);
  };

  const handleRemove=(id:string)=>{
    setNodes(p=>p.filter(n=>n!==id));
    if(sel===id)setSel(null);
    notify(`Removed: ${ALL.find(c=>c.id===id)?.name}`);
  };

  const handleLoadTmpl=(t:any)=>{
    setNodes(t.nodes);setSel(null);
    notify(`📋 Loaded: ${t.name} (${t.nodes.length} components)`);
  };

  const ordered=useMemo(()=>[...nodes].sort((a,b)=>{
    const sa=ALL.find(c=>c.id===a)?.s||0;
    const sb=ALL.find(c=>c.id===b)?.s||0;
    return sa-sb;
  }),[nodes]);

  const selComp=sel?ALL.find(c=>c.id===sel):null;
  const visCount=useMemo(()=>ALL.filter(c=>SKRANK[c.sk]<=SKRANK[skill]).length,[skill]);

  return(
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo">🧠 NeMo Studio UI</div>
        <div className="proj-badge"><span className="proj-dot"/>Project: Alpha Pipeline</div>
        <div className="tab-grp">
          <button className="tab active">Build</button>
          <button className="tab" onClick={()=>notify('Simulate — coming soon')}>Simulate</button>
          <button className="tab" onClick={()=>notify('Review — coming soon')}>Review</button>
        </div>
        <div className="skill-tog">
          {['beginner','intermediate','advanced'].map(s=>{
            const cls=s==='beginner'?'bA':s==='intermediate'?'iA':'aA';
            const cnt=ALL.filter(c=>SKRANK[c.sk]<=SKRANK[s]).length;
            return(
              <button key={s} className={`skbtn${skill===s?' '+cls:''}`}
                onClick={()=>{setSkill(s);notify(`${SKDOT[s]} ${s.charAt(0).toUpperCase()+s.slice(1)} mode — ${cnt} components visible`);}}
                title={`${cnt} components`}>
                {SKDOT[s]} {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            );
          })}
        </div>
        <button className="ibtn" onClick={()=>setShowTmpl(true)}>🗂 Templates</button>
        {nodes.length>0&&<button className="ibtn danger" onClick={()=>{setNodes([]);setSel(null);notify('Pipeline cleared');}}>✕ Clear</button>}
        <button className="run-btn" onClick={()=>{
          const errs=RULES.filter(r=>r.type==='error'&&r.check(nodes));
          const warns=RULES.filter(r=>r.type==='warn'&&r.check(nodes));
          notify(errs.length===0?`✅ Validation passed — ${nodes.length} components, ${warns.length} warnings`:`⚠️ ${errs.length} error(s), ${warns.length} warning(s) — check Pipeline State`);
        }}>✓ Run Validation</button>
      </div>

      {/* STAGE BAR */}
      <div className="stage-bar">
        {STAGES.map(s=><div key={s.id} className={`scol ${s.cls}`}>{s.label}</div>)}
      </div>

      {/* MAIN */}
      <div className="main">
        <Sidebar skill={skill} search={search} onSearch={setSearch} onDragStart={(e: React.DragEvent,comp: any)=>e.dataTransfer.setData('compId',comp.id)}/>

        {/* CANVAS */}
        <div className="canvas-wrap"
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={handleDrop}>
          {dragOver&&<div className="drop-hint"/>}
          <div className="lane-lines">{STAGES.map(s=><div className="lane" key={s.id}/>)}</div>
          {nodes.length===0&&!dragOver&&(
            <div className="canvas-empty">
              <div className="ce-icon">⬡</div>
              <div className="ce-title">Drag components to build your pipeline</div>
              <div className="ce-sub">
                {skill==='beginner'
                  ?'Start with "Original Data" from the Dataset section on the left sidebar.'
                  :`${visCount} components available at ${skill} level. Load a template or drag components to start.`}
              </div>
            </div>
          )}
          <div className="pipe-scroll">
            {ordered.length>0&&(
              <div className="pipe-nodes">
                {ordered.map((id,i)=>{
                  const comp=ALL.find(c=>c.id===id);
                  if(!comp)return null;
                  return(
                    <React.Fragment key={id}>
                      {i>0&&<div className="arrow"><div className="aline"/></div>}
                      <PNode comp={comp} selected={sel===id}
                        onClick={(nid:string)=>{setSel(nid);setTab('guide');}}
                        onRemove={handleRemove}/>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="rpanel">
          <div className="ptabs">
            <div className={`ptab${tab==='state'?' active':''}`} onClick={()=>setTab('state')}>Pipeline State</div>
            <div className={`ptab${tab==='guide'?' active':''}`} onClick={()=>setTab('guide')}>Educator Guide</div>
          </div>
          {tab==='state'&&<ValPanel nodes={nodes} skill={skill} onAutofix={handleAutofix}/>}
          {tab==='guide'&&<EduPanel sel={selComp}/>}
        </div>
      </div>

      {showTmpl&&<TmplModal onClose={()=>setShowTmpl(false)} onLoad={handleLoadTmpl}/>}
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}
