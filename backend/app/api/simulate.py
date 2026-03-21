from fastapi import APIRouter
from app.domain.models import WorkflowSimulationRequest, SimulationResult, ValidationSeverity
from app.rules_engine.validator import WorkflowValidator

router = APIRouter()

@router.post("/simulate", response_model=SimulationResult)
async def simulate_workflow(request: WorkflowSimulationRequest):
    validator = WorkflowValidator(request.nodes, request.edges)
    feedback = validator.validate()

    # If any error-level feedback exists, fail fast
    if any(f.severity == ValidationSeverity.ERROR for f in feedback):
        return SimulationResult(
            status="FAILED",
            metrics={"interpretability": 0.0, "performance_delta": 0.0},
            historical_diff=None,
            feedback_trace=feedback
        )

    # Mock up simulation diff calculation based on node topologies
    has_synthetic = any(n.type == "SYNTHETIC_GEN" for n in request.nodes)
    has_preprocessor = any(n.type == "PREPROCESSOR" for n in request.nodes)
    has_model = any(n.type == "MODEL" for n in request.nodes)
    
    performance = 0.5 # Base
    if has_preprocessor: performance += 0.2
    if has_synthetic: performance += 0.15
    if not has_model: performance = 0.0

    interpretability = 0.9
    if has_synthetic and not has_preprocessor:
        interpretability -= 0.4 # Penalty for uncurated injection

    return SimulationResult(
        status="SUCCESS",
        metrics={"performance": round(performance, 2), "interpretability": round(interpretability, 2)},
        historical_diff={"performance": round(performance - 0.5, 2)},
        feedback_trace=feedback
    )
