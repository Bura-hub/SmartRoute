
import React, { useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode, GraphLink, AlgorithmStep } from '../types';

interface Graph3DProps {
  data: GraphData;
  activePath: string[];
  onNodeClick: (node: GraphNode) => void;
  stepState: AlgorithmStep | null; // Pass detailed algorithm state
}

const Graph3D: React.FC<Graph3DProps> = ({ data, activePath, onNodeClick, stepState }) => {
  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(0); 
    }
  }, [data]);

  // Helper to check if a link is part of the active path segment
  const isLinkActive = (link: any) => {
    if (!activePath || activePath.length < 2) return false;
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    // Check if this link connects two consecutive nodes in the active path
    return activePath.some((id, index) => {
      if (index === activePath.length - 1) return false;
      const nextId = activePath[index + 1];
      return (sourceId === id && targetId === nextId); 
    });
  };

  // Helper to check if link is part of the constructed tree in step mode
  const isLinkInTree = (link: any) => {
      if (!stepState || !stepState.previous) return false;
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // If target's predecessor is source, this link is part of the tree
      return stepState.previous[targetId] === sourceId;
  };

  return (
    <div className="w-full h-full bg-transparent overflow-hidden relative">
       <div className="absolute bottom-6 right-6 text-slate-500 text-xs pointer-events-none select-none z-20 bg-slate-900/50 p-2 rounded border border-slate-700">
          <div className="mb-1 text-slate-400 font-bold border-b border-slate-700 pb-1">Leyenda</div>
          <div className="flex flex-col gap-1.5">
            {stepState ? (
                stepState.finished && activePath.length > 0 ? (
                  <>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> <span className="text-slate-300">Inicio</span></div>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> <span className="text-slate-300">Ruta</span></div>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> <span className="text-slate-300">Destino</span></div>
                   <div className="flex items-center"><span className="w-6 h-0.5 bg-red-500 mr-2"></span> <span className="text-slate-300 font-medium">Ruta Final</span></div>
                  </>
                ) : (
                  <>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> <span className="text-slate-300">Nodo Actual</span></div>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> <span className="text-slate-300">En Frontera</span></div>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-600 mr-2"></span> <span className="text-slate-300">Visitado</span></div>
                   <div className="flex items-center"><span className="w-6 h-0.5 bg-purple-500 mr-2"></span> <span className="text-slate-300 font-medium">Árbol de Ruta</span></div>
                  </>
                )
             ) : activePath.length > 0 ? (
                <>
                 <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> <span className="text-slate-300">Inicio</span></div>
                 <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> <span className="text-slate-300">Ruta</span></div>
                 <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> <span className="text-slate-300">Destino</span></div>
                 <div className="flex items-center"><span className="w-6 h-0.5 bg-red-500 mr-2"></span> <span className="text-slate-300 font-medium">Ruta Final</span></div>
                </>
             ) : (
                <>
                 <div className="flex items-center"><span className="w-6 h-0.5 bg-yellow-600 mr-2"></span> <span className="text-slate-300">Vehículo</span></div>
                 <div className="flex items-center"><span className="w-6 h-0.5 bg-green-500 mr-2"></span> <span className="text-slate-300">Peatonal</span></div>
                 <div className="flex items-center"><span className="w-6 h-0.5 bg-red-500 mr-2"></span> <span className="text-slate-300">Ruta Final</span></div>
                </>
             )}
          </div>
       </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)" // Transparent canvas
        rendererConfig={{ alpha: true }} // Allow transparency in WebGL
        
        // Label logic: Show cost if in step mode
        nodeLabel={(node: any) => {
           const basic = `${node.id}: ${node.name}`;
           if (stepState && stepState.distances && stepState.distances[node.id] !== undefined) {
             const cost = stepState.distances[node.id];
             const costStr = cost === Infinity ? '∞' : cost.toFixed(1);
             return `${basic} \n Costo Actual: ${costStr}`;
           }
           return basic;
        }}
        
        nodeColor={(node: any) => {
           // If algorithm finished, highlight the final path
           if (stepState && stepState.finished && activePath.length > 0) {
              if (activePath.includes(node.id)) {
                 // Highlight path nodes in red
                 if (activePath[activePath.length - 1] === node.id) return '#fbbf24'; // Amber for destination
                 if (activePath[0] === node.id) return '#10b981'; // Green for start
                 return '#ef4444'; // Red for path nodes
              }
           }
           
           // Step Mode Logic (when not finished or no path)
           if (stepState) {
              if (stepState.currentNodeId === node.id) return '#fbbf24'; // Amber (Currently processing)
              if (stepState.distances && stepState.distances[node.id] !== Infinity && stepState.distances[node.id] !== undefined) {
                 // Check if visited (closed set)
                 if (stepState.visited && stepState.visited.includes(node.id)) return '#4b5563'; // Gray (Visited/Closed)
                 return '#3b82f6'; // Blue (Frontier/Open but with value)
              }
              return '#1e293b'; // Dark Slate (Infinity/Unreached)
           }

           // Normal/Path Animation Logic (Instant Mode)
           if (activePath.length > 0) {
              if (activePath.includes(node.id)) {
                 if (activePath[activePath.length - 1] === node.id) return '#fbbf24'; // Amber for destination
                 if (activePath[0] === node.id) return '#10b981'; // Green for start
                 return '#ef4444'; // Red for path nodes
              }
           }
           return '#3b82f6'; // Blue default
        }}
        
        nodeVal={(node: any) => {
           // Prioritize path nodes when algorithm is finished
           if (stepState && stepState.finished && activePath.length > 0 && activePath.includes(node.id)) {
              if (activePath[activePath.length - 1] === node.id) return 120; // Larger for destination
              if (activePath[0] === node.id) return 120; // Larger for start
              return 80; // Larger for path nodes
           }
           if (stepState && stepState.currentNodeId === node.id) return 100;
           // Instant mode: prioritize start and destination nodes
           if (activePath.length > 0 && activePath.includes(node.id)) {
              if (activePath[activePath.length - 1] === node.id) return 100; // Destination
              if (activePath[0] === node.id) return 100; // Start
              return 60; // Path nodes
           }
           return 30; 
        }} 
        
        nodeResolution={16}
        nodeOpacity={0.9}
        
        // Link Visualization
        linkCurvature={0.2} 
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        
        linkWidth={(link: any) => {
            // If algorithm finished, highlight the final path
            if (stepState && stepState.finished && isLinkActive(link)) {
                return 4; // Thicker for final path
            }
            if (stepState) {
                return isLinkInTree(link) ? 3 : 0.5;
            }
            return isLinkActive(link) ? 3 : 0.5;
        }}
        
        linkColor={(link: any) => {
            // If algorithm finished, highlight the final path in red
            if (stepState && stepState.finished && isLinkActive(link)) {
                return '#ef4444'; // Red for final path
            }
            if (stepState) {
                // Highlight the tree being built
                if (isLinkInTree(link)) return '#a855f7'; // Purple-500
                return '#334155'; // Dark Slate 700
            }

            if (isLinkActive(link)) return '#ef4444'; 
            return link.isPedestrianOnly ? '#10b981' : '#ca8a04'; 
        }}
        
        // Particles
        linkDirectionalParticles={(link: any) => {
            // Show particles on final path when algorithm is finished
            if (stepState && stepState.finished && isLinkActive(link)) {
                return 6; // More particles for final path
            }
            if (stepState) return isLinkInTree(link) ? 2 : 0;
            return isLinkActive(link) ? 4 : 0;
        }}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => {
            // Use red particles for final path when finished
            if (stepState && stepState.finished) return '#fbbf24'; // Amber for final path
            return stepState ? '#d8b4fe' : '#fbbf24';
        }}
        
        onNodeClick={(node) => onNodeClick(node as GraphNode)}
        
        linkOpacity={0.6}
        showNavInfo={false}
      />
    </div>
  );
};

export default Graph3D;
