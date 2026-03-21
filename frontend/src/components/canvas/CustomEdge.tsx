import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex flex-col items-center gap-1.5 z-20 opacity-80 hover:opacity-100 transition-opacity nodrag nopan"
        >
          {data && typeof data.label === 'string' && (
            <span className="bg-slate-800 shadow-xl text-[10px] uppercase font-bold tracking-wider text-slate-300 px-2 py-1.5 rounded-md border border-slate-600 leading-none backdrop-blur-sm whitespace-nowrap">{data.label}</span>
          )}
          <button
            className="w-5 h-5 bg-slate-800 border bg-clip-padding border-slate-600 rounded-full text-slate-300 flex items-center justify-center text-[12px] hover:bg-rose-500 hover:text-white hover:border-rose-400 transition-colors shadow-lg cursor-pointer"
            onClick={onEdgeClick}
            title="Remove Connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
