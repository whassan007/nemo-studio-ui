# NeMo Studio UI

🧠 An interactive visual application for explaining, designing, simulating,
and presenting LLM data curation and model training pipelines — built as
an open-source community UI layer on top of the NVIDIA NeMo ecosystem.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![HuggingFace Space](https://img.shields.io/badge/🤗%20HuggingFace-Space-yellow)](https://huggingface.co/spaces/whassan/nemo-studio-ui)
[![GitHub](https://img.shields.io/github/stars/whassan007/nemo-studio-ui?style=social)](https://github.com/whassan007/nemo-studio-ui)

> **Community-built tool. Not an official NVIDIA product.**

---

## What It Does

NeMo Studio UI lets you visually compose, validate, and export LLM data
pipelines without writing code. It is designed for three audiences:

- **The Domain Expert** — domain knowledge, limited ML background.
  Plain-language guidance, safeguards, simple workflows.
- **The ML Practitioner** — understands ML pipelines, wants sensible
  defaults and standard forms without raw YAML typing.
- **The MLOps Engineer** — wants total control over the DAG, all 147
  backend components, raw YAML execution, and hardware stats.

---

## Architecture & Features

- **Frontend**: React + TypeScript + XYFlow drag-and-drop canvas
- **Backend Rules Engine**: FastAPI engine mapping `.ipynb` notebook
  dependencies into strict constraint checks and actionable validation
  warnings (e.g. enforcing data curation before synthetic generation)
- **6 Pipeline Stages**: Dataset → Preprocessing → Synthetic Data →
  Training → Evaluation → Export
- **147 Components** across all stages, surfaced by skill level
- **Skill-Level Toggle**: Beginner / Intermediate / Advanced
- **Live Validation**: real-time dependency checking with auto-fix
- **Educator Guide**: per-component learning content, discussion prompts,
  and relevant notebook links
- **Dynamic Exports**: PowerPoint presentation and NeMo YAML config
  generated from your actual pipeline state
- **Core Assets**: migrates `languages-config.yml`, `lm_tasks.yaml`
  natively

---

## Project Structure

```
nemo-studio-ui/
├── frontend/          React + TypeScript + XYFlow application
├── backend/           FastAPI validation and rules engine
├── knowledge_source/  Reference notebooks, configurations
├── launch.sh          Start both services
├── shutdown.sh        Stop both services
├── relaunch.sh        Restart both services
├── LICENSE            Apache 2.0
├── NOTICE             Upstream NeMo attributions
└── CONTRIBUTING.md    Contribution guide
```

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Quick Start (both services)
```bash
chmod +x launch.sh
./launch.sh
```

- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8000

### Manual Setup

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Relationship to NVIDIA NeMo

NeMo Studio UI is an **independent community-built tool**. It references
the component architecture, module paths, and pipeline concepts of the
NVIDIA NeMo open-source ecosystem — all licensed under Apache 2.0 —
but does not bundle, modify, or redistribute any NVIDIA source code,
model weights, or proprietary containers.

| Upstream project | License | Link |
|---|---|---|
| NeMo Framework | Apache 2.0 | github.com/NVIDIA-NeMo/NeMo |
| NeMo Curator | Apache 2.0 | github.com/NVIDIA-NeMo/NeMo-Curator |
| NeMo Guardrails | Apache 2.0 | github.com/NVIDIA-NeMo/Guardrails |
| NeMo Evaluator | Apache 2.0 | github.com/NVIDIA-NeMo/Evaluator |
| NeMo-RL | Apache 2.0 | github.com/NVIDIA-NeMo |
| Nemotron | Apache 2.0 | github.com/NVIDIA-NeMo/Nemotron |

"NeMo", "NVIDIA NeMo", and related names are trademarks of NVIDIA
Corporation. Their use here describes the open-source projects this
tool references and is consistent with nominative fair use.

See [NOTICE](NOTICE) for complete upstream attribution details.

## License

Licensed under the **Apache License 2.0** — see [LICENSE](LICENSE).

```
Copyright 2026 Waël Hassan (github.com/whassan007)
NeMo Studio UI Contributors

Licensed under the Apache License, Version 2.0.
You may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
```

This project is open source. You may use, modify, and distribute it
under the terms of Apache 2.0. Attribution required. See NOTICE.

> **This is a community-built tool. Not an official NVIDIA product.**
> Not affiliated with, endorsed by, or sponsored by NVIDIA Corporation.
