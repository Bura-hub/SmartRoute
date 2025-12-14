import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { GraphData, GraphNode, GraphLink, AlgorithmStep } from '../types';

interface Graph3DProps {
  data: GraphData;
  activePath: string[];
  onNodeClick: (node: GraphNode) => void;
  stepState: AlgorithmStep | null; // Pass detailed algorithm state
}

// Type for ForceGraph3D ref
interface ForceGraph3DRef {
  d3Force: (name: string) => { strength: (value: number) => void };
}

const Graph3D: React.FC<Graph3DProps> = ({ data, activePath, onNodeClick, stepState }) => {
  const fgRef = useRef<ForceGraph3DRef | null>(null);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(0); 
    }
  }, [data]);

  // Helper to check if a link is part of the active path segment - memoized for performance
  const isLinkActive = useCallback((link: GraphLink | { source: string | GraphNode; target: string | GraphNode }) => {
    if (!activePath || activePath.length < 2) return false;
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    // Check if this link connects two consecutive nodes in the active path
    return activePath.some((id, index) => {
      if (index === activePath.length - 1) return false;
      const nextId = activePath[index + 1];
      return (sourceId === id && targetId === nextId); 
    });
  }, [activePath]);

  // Helper to check if link is part of the constructed tree in step mode - memoized for performance
  const isLinkInTree = useCallback((link: GraphLink | { source: string | GraphNode; target: string | GraphNode }) => {
      if (!stepState || !stepState.previous) return false;
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // If target's predecessor is source, this link is part of the tree
      return stepState.previous[targetId] === sourceId;
  }, [stepState]);

  // Helper to get node index in the nodes array
  const getNodeIndex = useCallback((nodeId: string): number => {
    const index = data.nodes.findIndex((n) => n.id === nodeId);
    return index >= 0 ? index + 1 : 0; // Return 1-based index, or 0 if not found
  }, [data.nodes]);

  // Helper to calculate node size
  const getNodeSize = useCallback((node: GraphNode): number => {
    // Prioritize path nodes when algorithm is finished
    if (stepState && stepState.finished && activePath.length > 0 && activePath.includes(node.id)) {
      if (activePath[activePath.length - 1] === node.id) return 100; // Destination
      if (activePath[0] === node.id) return 100; // Start
      return 60; // Path nodes
    }
    if (stepState && stepState.currentNodeId === node.id) return 100;
    // Instant mode: prioritize start and destination nodes
    if (activePath.length > 0 && activePath.includes(node.id)) {
      if (activePath[activePath.length - 1] === node.id) return 100; // Destination
      if (activePath[0] === node.id) return 100; // Start
      return 60; // Path nodes
    }
    return 30;
  }, [stepState, activePath]);

  // Helper to calculate node color
  const getNodeColor = useCallback((node: GraphNode): string => {
    // If algorithm finished, highlight the final path
    if (stepState && stepState.finished && activePath.length > 0) {
      if (activePath.includes(node.id)) {
        // Highlight path nodes
        if (activePath[activePath.length - 1] === node.id) return '#fbbf24'; // Amber for destination
        if (activePath[0] === node.id) return '#10b981'; // Green for start
        return '#ef4444'; // Red for path nodes
      }
    }
    
    // Step Mode Logic
    if (stepState) {
      if (stepState.currentNodeId === node.id) return '#fbbf24'; // Amber (Currently processing)
      if (stepState.distances && stepState.distances[node.id] !== Infinity && stepState.distances[node.id] !== undefined) {
        // Check if visited (closed set)
        if (stepState.visited && stepState.visited.includes(node.id)) return '#8b5cf6'; // Violet (Visited/Closed)
        return '#3b82f6'; // Blue (Frontier/Open but with value)
      }
      return '#4b5563'; // Gray - Unvisited nodes
    }

    // Normal/Path Animation Logic
    if (activePath.length > 0) {
      if (activePath.includes(node.id)) {
        if (activePath[activePath.length - 1] === node.id) return '#fbbf24'; // Amber for destination
        if (activePath[0] === node.id) return '#10b981'; // Green for start
        return '#ef4444'; // Red for path nodes
      }
    }
    return '#3b82f6'; // Blue default
  }, [stepState, activePath]);

  // Create text sprite for node labels
  const createNodeLabel = useCallback(
    (node: GraphNode, nodeRadius: number): THREE.Sprite | null => {
      const sprite = new THREE.Sprite();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) return null;
    
      // Set canvas size - large enough for good text quality when scaled
      canvas.width = 1024;
      canvas.height = 512;
    
      // Clear canvas with transparent background
      context.clearRect(0, 0, canvas.width, canvas.height);
    
      // Configure text style
      const fontSize = 400;
      const fontFamily = 'Arial, sans-serif';
      context.font = `bold ${fontSize}px ${fontFamily}`;
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#000000';
      context.lineWidth = 64; // Thick outline
      context.textAlign = 'center';
      context.textBaseline = 'middle';
    
      // Draw text with outline - use numeric index instead of node.id
      const nodeIndex = getNodeIndex(node.id);
      const text = nodeIndex > 0 ? nodeIndex.toString() : '?';
      const x = canvas.width / 2;
      const y = canvas.height / 2;
    
      // Draw stroke (outline) for better visibility
      for (let i = 0; i < 12; i++) {
        context.strokeText(text, x, y);
      }
      // Draw fill
      context.fillText(text, x, y);
    
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
    
      // Create sprite material
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.01,
        depthTest: false,
        depthWrite: false
      });
    
      sprite.material = spriteMaterial;
    
      // Calculate scale to position sprite at the circumference of the node
      const nodeSize = getNodeSize(node);
      const sphereRadius = nodeSize / 10;
    
      // Make sprite visible at the circumference
      const baseScale = nodeSize / 10;
      const minScale = 6.0;
      const scale = Math.max(minScale, baseScale); 
      sprite.scale.set(scale * 4.0, scale * 2.0, 1);
    
      // Position sprite centered on the node
      sprite.position.x = 0;
      sprite.position.y = 0;
      sprite.position.z = 0;
    
      sprite.renderOrder = 999; // Render on top

      return sprite;
    },
    [getNodeSize, getNodeIndex]
  );

  return (
    <div className="w-full h-full bg-transparent overflow-hidden relative">
       
       {/* Legend Box - Styled professionally */}
       <div className="absolute bottom-6 right-6 z-20 pointer-events-none select-none">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/50 min-w-[180px]">
              <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Leyenda Visual</span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {stepState ? (
                    stepState.finished && activePath.length > 0 ? (
                      <>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Inicio</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Ruta</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Destino</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Ruta Final</span>
                          <span className="w-6 h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-full"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">No Visitado</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500"></span> 
                       </div>
                      </>
                    ) : (
                      <>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Nodo Actual</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">En Frontera</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Visitado</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">No Visitado</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500"></span> 
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Árbol de Expansión</span>
                          <span className="w-6 h-0.5 bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)] rounded-full"></span> 
                       </div>
                      </>
                    )
                 ) : activePath.length > 0 ? (
                    <>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Inicio</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Ruta</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> 
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Destino</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span> 
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Ruta Final</span>
                        <span className="w-6 h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-full"></span> 
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">No Visitado</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500"></span> 
                     </div>
                    </>
                 ) : (
                    <>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Tramo Vehicular</span>
                        <span className="w-6 h-0.5 bg-yellow-600 rounded-full opacity-80"></span> 
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Tramo Peatonal</span>
                        <span className="w-6 h-0.5 bg-emerald-500 rounded-full opacity-80"></span> 
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Ruta Óptima</span>
                        <span className="w-6 h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-full"></span> 
                     </div>
                    </>
                 )}
              </div>
          </div>
       </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)" // Transparent canvas
        rendererConfig={useMemo(() => ({ 
          alpha: true,
          antialias: true,
          powerPreference: "high-performance"
        }), [])} // Allow transparency in WebGL, optimized for performance
        
        // Label logic - memoized for performance
        nodeLabel={useCallback((node: GraphNode) => {
           const basic = `<div style="padding:4px 8px; border-radius:4px; background:rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.2); font-family:sans-serif; font-size:12px; font-weight:bold;">${node.id}</div>`;
           if (stepState && stepState.distances && stepState.distances[node.id] !== undefined) {
             const cost = stepState.distances[node.id];
             const costStr = cost === Infinity ? '∞' : cost.toFixed(1);
             return `${basic}<div style="margin-top:2px; font-size:10px; color:#fbbf24; text-align:center;">Cost: ${costStr}</div>`;
           }
           return basic;
        }, [stepState])}
        
        nodeColor={getNodeColor}

        nodeVal={getNodeSize} 
        
        nodeResolution={16}
        nodeOpacity={0.9}
        
        // Node Labels (3D Text with indices)
        nodeThreeObject={(node: GraphNode) => {
          const group = new THREE.Group();

          // Calculate node properties
          const nodeSize = getNodeSize(node);
          const nodeColor = getNodeColor(node);
          const sphereRadius = nodeSize / 10;

          // Add the sphere (node)
          const geometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
          const material = new THREE.MeshBasicMaterial({
            color: nodeColor,
            transparent: true,
            opacity: 0.9,
          });
          const sphere = new THREE.Mesh(geometry, material);
          group.add(sphere);

          // Add text label positioned at the circumference
          try {
            const label = createNodeLabel(node, sphereRadius);
            if (label) {
              group.add(label);
            }
          } catch (error) {
            console.warn('Error creating node label:', error);
          }

          return group;
        }}

        // Update node objects when data changes
        nodeThreeObjectExtend={(node: GraphNode) => {
          // This ensures the object updates when node properties change
          return true;
        }}
        
        // Link Visualization
        linkCurvature={0.2} 
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        
        linkWidth={useMemo(() => (link: GraphLink | { source: string | GraphNode; target: string | GraphNode }) => {
            // If algorithm finished, highlight the final path
            if (stepState?.finished && isLinkActive(link)) {
              return 4; // Thicker for final path
            }
            if (stepState) {
                return isLinkInTree(link) ? 3 : 0.5;
            }
            return isLinkActive(link) ? 3 : 0.5;
        }, [stepState, isLinkActive, isLinkInTree])}
        
        linkColor={useMemo(() => (link: GraphLink | { source: string | GraphNode; target: string | GraphNode }) => {
            // If algorithm finished, highlight the final path in red
            if (stepState?.finished && isLinkActive(link)) {
              return '#ef4444'; // Red for final path
            }
            if (stepState) {
                // Highlight the tree being built
                if (isLinkInTree(link)) return '#a855f7'; // Purple-500
                return '#475569'; // Slate 600 - More visible gray for better contrast
            }

            if (isLinkActive(link)) return '#ef4444'; 
            const linkData = link as GraphLink;
            return linkData.isPedestrianOnly ? '#10b981' : '#ca8a04'; 
        }, [stepState, isLinkActive, isLinkInTree])}
        
        // Particles
        linkDirectionalParticles={useMemo(() => (link: GraphLink | { source: string | GraphNode; target: string | GraphNode }) => {
            // Show particles on final path when algorithm is finished
            if (stepState?.finished && isLinkActive(link)) {
              return 6; // More particles for final path
            }
            if (stepState) return isLinkInTree(link) ? 2 : 0;
            return isLinkActive(link) ? 4 : 0;
        }, [stepState, isLinkActive, isLinkInTree])}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={useMemo(() => () => {
            // Use amber particles for final path when finished
            if (stepState && stepState.finished) return '#fbbf24'; // Amber for final path
            return stepState ? '#d8b4fe' : '#fbbf24';
        }, [stepState])}
        
        onNodeClick={(node) => onNodeClick(node as GraphNode)}
        
        linkOpacity={0.6}
        showNavInfo={false}
      />
    </div>
  );
};

export default React.memo(Graph3D);
