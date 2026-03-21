from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import simulate

app = FastAPI(
    title="Knowledge LLM Interactive Workflow API",
    description="Backend services for validating and simulating education model workflows.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api/v1", tags=["simulation"])

@app.get("/health")
async def root():
    return {"status": "ok", "message": "Knowledge LLM Server Running"}
