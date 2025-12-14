import React, { useState } from 'react';
import { AlgorithmType, WeightType, GraphNode, PathResult, TransportMode, AlgorithmStep } from '../types';
import { Navigation, Clock, Activity, Car, Footprints, Info, MapPin, ChevronDown, ChevronUp, Play, SkipForward, RotateCcw, Pause, Settings2, Waypoints, AlertCircle, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  nodes: GraphNode[];
  startNode: string;
  endNode: string;
  algorithm: AlgorithmType;
  weightType: WeightType;
  transportMode: TransportMode;
  setStartNode: (id: string) => void;
  setEndNode: (id: string) => void;
  setAlgorithm: (algo: AlgorithmType) => void;
  setWeightType: (weight: WeightType) => void;
  setTransportMode: (mode: TransportMode) => void;
  onCalculate: () => void;
  
  // Step Props
  isStepMode: boolean;
  stepState: AlgorithmStep | null;
  onStartStep: () => void;
  onNextStep: () => void;
  onPreviousStep?: () => void;
  onReset: () => void;
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  canGoBack?: boolean;

  pathResult: PathResult | null;
  error: string | null;
  isCalculating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  nodes,
  startNode,
  endNode,
  algorithm,
  weightType,
  transportMode,
  setStartNode,
  setEndNode,
  setAlgorithm,
  setWeightType,
  setTransportMode,
  onCalculate,
  isStepMode,
  stepState,
  onStartStep,
  onNextStep,
  onPreviousStep,
  onReset,
  autoPlay,
  setAutoPlay,
  canGoBack,
  pathResult,
  error,
  isCalculating
}) => {
  const [showGuide, setShowGuide] = useState(false);

  // Common styles
  const labelStyle = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5";
  const selectStyle = "w-full bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/50 focus:border-blue-500 rounded-lg p-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-inner backdrop-blur-sm";
  const sectionBox = "bg-slate-900/40 border border-white/5 rounded-xl p-4 shadow-sm";

  return (
    <div className="absolute top-6 left-6 z-30 w-[22rem] flex flex-col gap-4 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1 pb-4">
      
      {/* Main Controls */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 flex flex-col gap-5">
        
        {/* Nomenclature Toggle */}
        <div>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-blue-300 transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-lg border border-white/5"
          >
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              <span>Guía de Nomenclatura</span>
            </div>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showGuide && (
            <div className="mt-2 bg-slate-900/90 p-3 rounded-lg border border-white/10 text-xs animate-fadeIn space-y-2">
               <div className="grid grid-cols-2 gap-2">
                 <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                   <div className="flex items-center gap-1.5 mb-1">
                     <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1 rounded">C</span>
                     <span className="text-slate-200 font-semibold">Calle</span>
                   </div>
                   <div className="text-[9px] text-slate-500">Eje Este - Oeste</div>
                 </div>
                 <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                   <div className="flex items-center gap-1.5 mb-1">
                     <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-1 rounded">K</span>
                     <span className="text-slate-200 font-semibold">Carrera</span>
                   </div>
                   <div className="text-[9px] text-slate-500">Eje Norte - Sur</div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Route Selection */}
        <div className={sectionBox}>
          {/* Title Section */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Waypoints className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                PathFinder <span className="text-blue-400 font-light">3D</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Interactive Graph Engine</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 text-slate-300 border-b border-white/5 pb-2">
             <MapPin className="w-4 h-4 text-emerald-400" />
             <span className="text-xs font-bold uppercase tracking-wider">Configurar Ruta</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>Punto de Partida</label>
              <select 
                disabled={isStepMode}
                className={selectStyle}
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
              >
                {nodes.map((node, index) => (
                  <option key={node.id} value={node.id} className="bg-slate-900">{index + 1} - {node.id} - {node.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex justify-center py-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-slate-700/50"></div></div>
                <div className="relative bg-slate-800 rounded-full p-1 border border-slate-700">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                </div>
            </div>

            <div>
              <label className={labelStyle}>Destino Final</label>
              <select 
                disabled={isStepMode}
                className={selectStyle}
                value={endNode}
                onChange={(e) => setEndNode(e.target.value)}
              >
                {nodes.map((node, index) => (
                  <option key={node.id} value={node.id} className="bg-slate-900">{index + 1} - {node.id} - {node.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Algorithm Settings */}
        <div className={sectionBox}>
          <div className="flex items-center gap-2 mb-3 text-slate-300 border-b border-white/5 pb-2">
             <Settings2 className="w-4 h-4 text-amber-400" />
             <span className="text-xs font-bold uppercase tracking-wider">Parámetros</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelStyle}>Algoritmo</label>
              <select 
                disabled={isStepMode}
                className={selectStyle}
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
              >
                <option value={AlgorithmType.DIJKSTRA} className="bg-slate-900">Dijkstra</option>
                <option value={AlgorithmType.BELLMAN_FORD} className="bg-slate-900">Bellman-Ford</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Criterio</label>
              <select 
                disabled={isStepMode}
                className={selectStyle}
                value={weightType}
                onChange={(e) => setWeightType(e.target.value as WeightType)}
              >
                <option value={WeightType.DISTANCE} className="bg-slate-900">Distancia</option>
                <option value={WeightType.TIME} className="bg-slate-900">Tiempo</option>
              </select>
            </div>
          </div>

          <div>
             <label className={labelStyle}>Modo de Transporte</label>
             <div className="flex bg-slate-950/50 rounded-lg p-1 border border-slate-800/80">
                <button 
                  onClick={() => setTransportMode(TransportMode.VEHICLE)}
                  disabled={isStepMode}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-md transition-all ${transportMode === TransportMode.VEHICLE ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'} disabled:opacity-50`}
                >
                  <Car className="w-3.5 h-3.5" />
                  Vehículo
                </button>
                <button 
                  onClick={() => setTransportMode(TransportMode.PEDESTRIAN)}
                  disabled={isStepMode}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-md transition-all ${transportMode === TransportMode.PEDESTRIAN ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'} disabled:opacity-50`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  Peatón
                </button>
             </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300 flex-1 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!isStepMode ? (
          <div className="flex gap-3">
            <button
              onClick={onCalculate}
              disabled={isCalculating || !startNode || !endNode || startNode === endNode}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed border-t border-white/10 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/30 text-xs flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Ruta Rápida
                </>
              )}
            </button>
            <button
              onClick={onStartStep}
              disabled={isCalculating || !startNode || !endNode || startNode === endNode}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed border border-slate-600/50 text-slate-200 font-bold py-3 px-4 rounded-xl shadow-lg text-xs flex items-center justify-center gap-2 transition-all hover:border-slate-500"
            >
              <Play className="w-4 h-4" />
              Paso a Paso
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 animate-fadeIn">
             <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-2 text-amber-500">
                 <Activity className="w-4 h-4 animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-wider">Ejecutando</span>
               </div>
               <button onClick={onReset} className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors border border-white/5">
                 <RotateCcw className="w-3 h-3" /> Reiniciar
               </button>
             </div>
             
             <div className="flex gap-2 mb-3">
               {onPreviousStep && canGoBack && (
                 <button 
                    onClick={onPreviousStep} 
                    disabled={!canGoBack}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                 >
                   <SkipForward className="w-4 h-4 rotate-180" />
                   Anterior
                 </button>
               )}
               <button 
                  onClick={onNextStep} 
                  disabled={stepState?.finished}
                  className={`${onPreviousStep ? 'flex-1' : 'flex-1'} bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 border-t border-white/10 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20`}
               >
                 <SkipForward className="w-4 h-4" />
                 Siguiente
               </button>
               <button 
                  onClick={() => setAutoPlay(!autoPlay)}
                  disabled={stepState?.finished}
                  className={`px-4 py-2.5 rounded-lg text-white text-xs font-bold flex items-center justify-center transition-all shadow-lg ${autoPlay ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'} disabled:opacity-50 disabled:grayscale`}
               >
                 {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
               </button>
             </div>
             
             {/* Log Terminal */}
             <div className="bg-black/60 rounded-lg border border-white/5 p-3 h-28 overflow-y-auto font-mono text-[10px] leading-relaxed shadow-inner">
               {stepState ? (
                 <div className="flex flex-col gap-2">
                   <div className="text-slate-400 border-b border-white/5 pb-1 flex justify-between">
                     <span>Nodo: <span className="text-amber-400">{stepState.currentNodeId || '---'}</span></span>
                   </div>
                   <div className="text-emerald-400">
                     <span className="text-slate-600 mr-1">{'>'}</span>{stepState.logMessage}
                   </div>
                 </div>
               ) : (
                 <span className="text-slate-600 italic">Sistema listo. Iniciando secuencia...</span>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {pathResult && (
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-green-500/10 rounded-md">
                <Clock className="w-4 h-4 text-green-400" />
             </div>
             <h3 className="text-xs font-bold text-white uppercase tracking-wider">Análisis de Ruta</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
             <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Costo</span>
                <span className="text-sm font-mono text-green-400 font-bold">{pathResult.totalWeight.toFixed(1)}</span>
             </div>
             <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Nodos</span>
                <span className="text-sm font-mono text-amber-400 font-bold">{pathResult.path.length}</span>
             </div>
             <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Tiempo</span>
                <span className="text-sm font-mono text-purple-400 font-bold">{pathResult.executionTime.toFixed(2)}<span className="text-[9px] text-slate-600 ml-0.5">ms</span></span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ControlPanel);
