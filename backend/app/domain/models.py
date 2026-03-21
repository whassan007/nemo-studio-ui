from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class NodeType(str, Enum):
    DATA_SOURCE = "DATA_SOURCE"
    PREPROCESSOR = "PREPROCESSOR"
    SYNTHETIC_GEN = "SYNTHETIC_GEN"
    MODEL = "MODEL"
    EVALUATION = "EVALUATION"

class Edge(BaseModel):
    source: str
    target: str

class WorkflowNode(BaseModel):
    id: str
    type: NodeType
    label: str
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class WorkflowSimulationRequest(BaseModel):
    workflow_id: str
    nodes: List[WorkflowNode]
    edges: List[Edge]

class ValidationSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"

class ValidationFeedback(BaseModel):
    nodeId: str
    severity: ValidationSeverity
    shortMessage: str
    whyItMatters: str
    howToFix: str

class SimulationResult(BaseModel):
    status: str
    metrics: Dict[str, float]
    historical_diff: Optional[Dict[str, float]]
    feedback_trace: List[ValidationFeedback]
