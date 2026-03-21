import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useOnSelectionChange,
  addEdge,
  BackgroundVariant,
  useReactFlow
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import { WorkflowNode } from './CustomNode';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const edgeTypes = {
  default: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    data: { label: 'Original Dataset', type: 'DATA_SOURCE', status: 'success', metrics: { 'Rows': '10,000', 'Size': '24 MB' } },
    position: { x: 50, y: 150 },
  },
];

const initialEdges: Edge[] = [];

const SWIMLANES = [
  { id: 'dataset', label: '1. Dataset', color: 'border-emerald-500/20' },
  { id: 'preprocessing', label: '2. Preprocessing', color: 'border-blue-500/20' },
  { id: 'synthetic', label: '3. Synthetic Data', color: 'border-purple-500/20' },
  { id: 'training', label: '4. Training', color: 'border-amber-500/20' },
  { id: 'evaluation', label: '5. Evaluation', color: 'border-rose-500/20' },
  { id: 'export', label: '6. Export', color: 'border-slate-500/20' },
];

interface InteractiveCanvasProps {
  onNodeSelect?: (node: Node | null) => void;
}

export default function InteractiveCanvas({ onNodeSelect }: InteractiveCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      if (onNodeSelect) {
        onNodeSelect(nodes.length === 1 ? nodes[0] : null);
      }
    },
  });

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      let edgeLabel = 'data flow';
      if (sourceNode?.data.type === 'MODEL' && targetNode?.data.type === 'EVALUATION') edgeLabel = 'model output';
      if (sourceNode?.data.type === 'EVALUATION' && targetNode?.data.type === 'MODEL') edgeLabel = 'eval feedback';
      if (targetNode?.data.type === 'EXPORT') edgeLabel = 'artifact';
      
      return setEdges((eds) => addEdge({ ...params, type: 'default', data: { label: edgeLabel } }, eds));
    },
    [nodes, setEdges]
  );

  const autoArrange = useCallback(() => {
    const stageX: Record<string, number> = {
      DATA_SOURCE: 50,
      PREPROCESSOR: 350,
      SYNTHETIC_GEN: 650,
      MODEL: 950,
      EVALUATION: 1250,
      EXPORT: 1550
    };
    
    // Provide a gentle vertical stagger to prevent overlap of identical types
    const yTracker: Record<number, number> = {};
    
    setNodes(nds => nds.map(node => {
      const type = (node.data.type as string) || 'DATA_SOURCE';
      const x = stageX[type] || 50;
      
      if (yTracker[x] === undefined) yTracker[x] = 150;
      const y = yTracker[x];
      yTracker[x] += 100;
      
      return { ...node, position: { x, y } };
    }));
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let type, label;
      try {
        const parsed = JSON.parse(dataStr);
        type = parsed.type;
        label = parsed.label;
      } catch {
        type = dataStr;
        const labels: Record<string, string> = {
          DATA_SOURCE: 'Data Source',
          PREPROCESSOR: 'Data Cleansing',
          SYNTHETIC_GEN: 'Synthetic Gen',
          MODEL: 'Train Model',
          EVALUATION: 'Rule-based Eval',
        };
        label = labels[type] || 'New Component';
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'workflowNode',
        position,
        data: { label: label, type: type, status: 'pending' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, screenToFlowPosition]
  );

  useEffect(() => {
    const handleInsert = (event: Event) => {
      const e = event as CustomEvent<{type: string, label: string}>;
      const { type, label } = e.detail;
      const newNodeId = `node-${Date.now()}`;
      
      setNodes((currentNodes) => {
        // Find the rightmost node to branch off from
        const lastNode = currentNodes.length > 0 ? currentNodes[currentNodes.length - 1] : null;
        const newX = lastNode ? lastNode.position.x + 350 : 50;
        const newY = lastNode ? lastNode.position.y : 150;
        
        const newNode: Node = {
          id: newNodeId,
          type: 'workflowNode',
          position: { x: newX, y: newY },
          data: { label, type, status: 'pending' },
        };
        
        // Ensure auto-edge connects the correct types if needed (simplistic logic: wire to the end chain)
        if (lastNode && lastNode.type !== 'EVALUATION') {
          setTimeout(() => {
            setEdges((eds) => addEdge({
              id: `edge-${lastNode.id}-${newNodeId}`,
              source: lastNode.id,
              target: newNodeId,
              sourceHandle: null,
              targetHandle: null,
              type: 'default',
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 }
            }, eds));
          }, 0);
        }
        
        return [...currentNodes, newNode];
      });
    };

    window.addEventListener('insertNode', handleInsert);
    return () => window.removeEventListener('insertNode', handleInsert);
  }, [setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Swimlanes Background */}
      <div className="absolute inset-0 pointer-events-none flex z-0 opacity-40">
        {SWIMLANES.map((lane) => (
          <div key={lane.id} className={`flex-1 border-r border-dashed ${lane.color} h-full relative`}>
            <div className="absolute top-4 left-4 text-xs font-semibold tracking-widest uppercase text-slate-500">
              {lane.label}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button 
          onClick={autoArrange}
          className="bg-black/60 hover:bg-black/80 backdrop-blur border border-white/10 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all"
        >
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          Auto Arrange
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'default', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }}
        fitView
        className="z-10"
      >
        <Controls className="bg-slate-900 border-slate-700 text-slate-300 fill-slate-300" />
        <MiniMap 
          zoomable 
          pannable 
          nodeColor={(n) => {
            if (n.data?.type === 'DATA_SOURCE') return '#10b981';
            if (n.data?.type === 'MODEL') return '#f59e0b';
            return '#3b82f6';
          }} 
          maskColor="rgba(15, 17, 21, 0.8)" 
          className="bg-slate-900/80 border border-slate-700 rounded-lg overflow-hidden"
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="rgba(255, 255, 255, 0.05)" />
      </ReactFlow>

      {/* Empty state guidance */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 p-6 rounded-xl text-center max-w-sm">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-slate-200 font-semibold text-lg mb-2">Build your workflow</h3>
            <p className="text-slate-400 text-sm">Drag components from the left library into the appropriate swimlanes to begin composing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
