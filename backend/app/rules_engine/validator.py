from typing import List, Dict
from app.domain.models import WorkflowNode, Edge, ValidationFeedback, ValidationSeverity, NodeType

class WorkflowValidator:
    def __init__(self, nodes: List[WorkflowNode], edges: List[Edge]):
        self.nodes = {n.id: n for n in nodes}
        self.edges = edges
        self.adjacency_list = self._build_adjacency()
        self.reverse_adjacency = self._build_reverse_adjacency()

    def _build_adjacency(self) -> Dict[str, List[str]]:
        adj = {n_id: [] for n_id in self.nodes}
        for edge in self.edges:
            if edge.source in adj:
                adj[edge.source].append(edge.target)
        return adj

    def _build_reverse_adjacency(self) -> Dict[str, List[str]]:
        rev_adj = {n_id: [] for n_id in self.nodes}
        for edge in self.edges:
            if edge.target in rev_adj:
                rev_adj[edge.target].append(edge.source)
        return rev_adj

    def _get_ancestors(self, node_id: str) -> set:
        ancestors = set()
        queue = [node_id]
        while queue:
            current = queue.pop(0)
            for parent in self.reverse_adjacency.get(current, []):
                if parent not in ancestors:
                    ancestors.add(parent)
                    queue.append(parent)
        return ancestors

    def validate(self) -> List[ValidationFeedback]:
        feedback = []
        
        # Rule 1: Models must have an evaluation downstream to be deployable, but we warn if they don't
        for node in self.nodes.values():
            if node.type == NodeType.MODEL:
                children = self.adjacency_list.get(node.id, [])
                eval_found = any(self.nodes[child].type == NodeType.EVALUATION for child in children)
                if not eval_found:
                    feedback.append(ValidationFeedback(
                        nodeId=node.id,
                        severity=ValidationSeverity.WARNING,
                        shortMessage="Missing Evaluation",
                        whyItMatters="Updating a model without proper evaluation gate is extremely risky.",
                        howToFix="Connect an Evaluation node to the output of this Model."
                    ))

        # Rule 2: Synthetic Gen must have a base Data Source upstream
        for node in self.nodes.values():
            if node.type == NodeType.SYNTHETIC_GEN:
                ancestors = self._get_ancestors(node.id)
                has_data_source = any(self.nodes[anc].type == NodeType.DATA_SOURCE for anc in ancestors)
                if not has_data_source:
                    feedback.append(ValidationFeedback(
                        nodeId=node.id,
                        severity=ValidationSeverity.ERROR,
                        shortMessage="Orphaned Synthetic Generation",
                        whyItMatters="Synthetic data algorithms require empirical seeds or distributions to augment correctly.",
                        howToFix="Connect a Data Source upstream to anchor the synthetic generation."
                    ))

        # Rule 3: Pipeline uses synthetic data BEFORE validation baseline (weakens interpretability)
        # Assuming Evaluation evaluates the Model. If Model's only data path includes synthetic data 
        # without a parallel clean baseline, we issue a warning. (Simplified heuristic here)
        for node in self.nodes.values():
            if node.type == NodeType.MODEL:
                ancestors = self._get_ancestors(node.id)
                has_synthetic = any(self.nodes[anc].type == NodeType.SYNTHETIC_GEN for anc in ancestors)
                has_curation = any(self.nodes[anc].type == NodeType.PREPROCESSOR for anc in ancestors)
                
                if has_synthetic and not has_curation:
                    feedback.append(ValidationFeedback(
                        nodeId=node.id,
                        severity=ValidationSeverity.WARNING,
                        shortMessage="Uncurated Synthetic Injection",
                        whyItMatters="This pipeline uses synthetic data augmentation before any curation. That weakens interpretability.",
                        howToFix="Add a curation or preprocessing step before utilizing synthetic generation."
                    ))

        return feedback
