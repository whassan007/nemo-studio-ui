import { Handle, Position, useReactFlow } from '@xyflow/react';

interface NodeData {
  label: string;
  type: string;
  status?: 'success' | 'warning' | 'error' | 'pending';
  metrics?: Record<string, string>;
}

const colorMap: Record<string, { border: string, bg: string, text: string }> = {
  DATA_SOURCE: { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  PREPROCESSOR: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  SYNTHETIC_GEN: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  MODEL: { border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  EVALUATION: { border: 'border-rose-500/50', bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

const iconMap: Record<string, string> = {
  DATA_SOURCE: '📄',
  PREPROCESSOR: '⚙️',
  SYNTHETIC_GEN: '🪄',
  MODEL: '🤖',
  EVALUATION: '📊',
};

export function WorkflowNode({ id, data, selected }: { id: string, data: NodeData, selected: boolean }) {
  const { setNodes, setEdges } = useReactFlow();
  const theme = colorMap[data.type] || colorMap.PREPROCESSOR;
  const icon = iconMap[data.type] || '⚙️';

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className={`w-64 rounded-xl backdrop-blur-md bg-slate-900/90 border-2 transition-all duration-200 shadow-xl
      ${selected ? 'border-blue-500 shadow-blue-500/20 scale-[1.02]' : 'border-slate-700 hover:border-slate-500'}`}
    >
      {/* Target input handle (only if not source) */}
      {data.type !== 'DATA_SOURCE' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-slate-800 border-2 border-slate-400 ml-[-6px]"
        />
      )}

      {/* Header */}
      <div className={`px-4 py-2 border-b border-white/5 flex items-center justify-between ${theme.bg}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className={`text-xs font-semibold tracking-wide uppercase ${theme.text}`}>
            {data.type.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          {data.status === 'success' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
          {data.status === 'warning' && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>}
          {data.status === 'error' && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>}
          
          {/* Delete Button */}
          <button onClick={onDelete} className="text-slate-500 hover:text-white transition-colors ml-2" title="Remove Component">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-slate-100 font-medium truncate">{data.label}</h3>

        {/* Mock Metrics or configs */}
        {data.metrics && (
          <div className="mt-3 space-y-1.5">
            {Object.entries(data.metrics).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{key}</span>
                <span className="text-slate-200 font-medium">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source output handle */}
      {data.type !== 'EVALUATION' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-blue-500 border-2 border-blue-200 mr-[-6px]"
        />
      )}
    </div>
  );
}
