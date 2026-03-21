# Knowledge LLM Interactive Workflow
An interactive visual application for explaining, simulating, and managing model training, data curation, synthetic data generation, and model updates.

## Architecture & Features
- **Frontend Panel**: React + TypeScript + React Flow application providing a drag-and-drop workspace layout matching original workshop objectives. 
- **Backend Rules Engine**: FastAPI engine mapping `.ipynb` dependencies into strict constraint checks and actionable warnings (e.g. enforcing data curation requirements before synthetic generation).
- **Core Assets preserved**: Migrates the `languages-config.yml`, `lm_tasks.yaml`, and PPTX slides natively.

## Project Structure
- `/knowledge_source`: Contains the original source-of-truth notebooks, configurations, and historical `.pptx` slides.
- `/backend`: Python FastAPI Backend integrating validation checks and Simulation tracing for workflows dynamically configured by the webapp.
- `/frontend`: The visual workspace built with XYFlow enabling user testing of node pathways.

## Installation
### Backend
```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Copyright & License
See the `LICENSE` file for strict copyright terms. No part of this software may be copied, distributed, or modified without explicit consent.
