
import React, { useState } from 'react';
import { AlgorithmType, WeightType, GraphNode, PathResult, TransportMode, AlgorithmStep } from '../types';
import { Navigation, Clock, Activity, BrainCircuit, Car, Footprints, Info, MapPin, ChevronDown, ChevronUp, Play, SkipForward, SkipBack, RotateCcw, Pause } from 'lucide-react';

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
  onPreviousStep: () => void;
  onReset: () => void;
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  canGoBack: boolean;

  pathResult: PathResult | null;
  aiDescription: string;
  isAiLoading: boolean;
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
  aiDescription,
  isAiLoading
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-blue-500 w-6 h-6" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          PathFinder 3D
        </h1>
      </div>

      {/* Nomenclature Guide Toggle */}
      <div className="mb-6">
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-400 hover:text-blue-300 transition-colors bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 hover:border-blue-500/30"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            <span>Guía de Nomenclatura Urbana</span>
          </div>
          {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showGuide && (
          <div className="mt-2 bg-slate-800/80 p-3 rounded-lg border border-slate-600/50 text-xs animate-fadeIn space-y-2 shadow-inner">
            <p className="text-slate-300 leading-relaxed mb-2">
              Los nodos representan intersecciones viales definidas por el sistema de cuadrícula de Pasto:
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <span className="font-bold text-blue-400 bg-blue-900/20 px-1.5 rounded">C</span>
                <div>
                  <strong className="block text-slate-200">Calle (Eje Horizontal)</strong>
                  <span className="text-slate-500 text-[10px]">Vías que corren de Este a Oeste.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <span className="font-bold text-purple-400 bg-purple-900/20 px-1.5 rounded">K</span>
                <div>
                  <strong className="block text-slate-200">Carrera (Eje Vertical)</strong>
                  <span className="text-slate-500 text-[10px]">Vías que corren de Norte a Sur.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
              <MapPin className="w-3 h-3 text-yellow-500" />
              <span className="text-slate-400 italic">
                Ej: <span className="font-mono text-yellow-400">C16_K24</span> = Calle 16 con Cra 24
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Node Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Inicio</label>
          <select 
            disabled={isStepMode}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-slate-750 disabled:opacity-50"
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{node.id} - {node.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Destino</label>
          <select 
             disabled={isStepMode}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-slate-750 disabled:opacity-50"
            value={endNode}
            onChange={(e) => setEndNode(e.target.value)}
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{node.id} - {node.name}</option>
            ))}
          </select>
        </div>

        {/* Algorithm & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Algoritmo</label>
            <select 
              disabled={isStepMode}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer disabled:opacity-50"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
            >
              <option value={AlgorithmType.DIJKSTRA}>Dijkstra</option>
              <option value={AlgorithmType.BELLMAN_FORD}>Bellman-Ford</option>
            </select>
          </div>
          <div>
             <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Optimizar</label>
            <select 
               disabled={isStepMode}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs focus:ring-2 focus:ring-green-500 outline-none cursor-pointer disabled:opacity-50"
              value={weightType}
              onChange={(e) => setWeightType(e.target.value as WeightType)}
            >
              <option value={WeightType.DISTANCE}>Distancia</option>
              <option value={WeightType.TIME}>Tiempo</option>
            </select>
          </div>
        </div>

        {/* Transport Mode */}
        <div>
           <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Modo de Transporte</label>
           <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
              <button 
                onClick={() => setTransportMode(TransportMode.VEHICLE)}
                disabled={isStepMode}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${transportMode === TransportMode.VEHICLE ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700'} disabled:opacity-50`}
              >
                <Car className="w-4 h-4" />
                Vehículo
              </button>
              <button 
                onClick={() => setTransportMode(TransportMode.PEDESTRIAN)}
                disabled={isStepMode}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${transportMode === TransportMode.PEDESTRIAN ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700'} disabled:opacity-50`}
              >
                <Footprints className="w-4 h-4" />
                Peatón
              </button>
           </div>
        </div>

        {/* Buttons Group */}
        {!isStepMode ? (
          <div className="flex gap-2 mt-4">
            <button
              onClick={onCalculate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-2 rounded-lg shadow-lg text-xs flex items-center justify-center gap-1"
            >
              <Navigation className="w-4 h-4" />
              Ruta Instantánea
            </button>
            <button
              onClick={onStartStep}
              className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white font-bold py-3 px-2 rounded-lg shadow-lg text-xs flex items-center justify-center gap-1"
            >
              <Play className="w-4 h-4" />
              Paso a Paso
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
             <div className="flex justify-between items-center mb-1">
               <span className="text-xs font-bold text-amber-400 uppercase tracking-wider animate-pulse">Modo Paso a Paso</span>
               <button onClick={onReset} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700 px-2 py-1 rounded">
                 <RotateCcw className="w-3 h-3" /> Reset
               </button>
             </div>
             
             <div className="flex gap-2">
               <button 
                  onClick={onPreviousStep} 
                  disabled={!canGoBack}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-1"
               >
                 <SkipBack className="w-4 h-4" />
                 Anterior
               </button>
               <button 
                  onClick={onNextStep} 
                  disabled={stepState?.finished}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-1"
               >
                 <SkipForward className="w-4 h-4" />
                 Siguiente
               </button>
               <button 
                  onClick={() => setAutoPlay(!autoPlay)}
                  disabled={stepState?.finished}
                  className={`px-3 py-2 rounded text-white text-xs font-bold flex items-center justify-center ${autoPlay ? 'bg-red-500 hover:bg-red-400' : 'bg-green-600 hover:bg-green-500'} disabled:opacity-50`}
               >
                 {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
               </button>
             </div>
             
             {/* Log Window */}
             <div className="bg-black/40 p-2 rounded border border-slate-600/50 h-24 overflow-y-auto font-mono text-[10px] text-green-400">
               {stepState ? (
                 <>
                   <div className="mb-1 text-slate-500 border-b border-slate-800 pb-1">
                     Actual: {stepState.currentNodeId || '---'}
                   </div>
                   <div className="leading-tight">
                     {'> '}{stepState.logMessage}
                   </div>
                 </>
               ) : (
                 <span className="text-slate-500">Esperando inicio...</span>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Results */}
      {pathResult && (
        <div className="mt-6 pt-6 border-t border-slate-700 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            Resultados Finales
          </h3>
          <div className="bg-slate-800/50 p-3 rounded-lg space-y-2 text-sm">
             <div className="flex justify-between">
                <span className="text-slate-400">Total {weightType}:</span>
                <span className="font-mono text-green-400">{pathResult.totalWeight.toFixed(2)}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-400">Saltos:</span>
                <span className="font-mono text-yellow-400">{pathResult.path.length - 1}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-400">Cómputo:</span>
                <span className="font-mono text-purple-400">{pathResult.executionTime.toFixed(4)} ms</span>
             </div>
          </div>

          {/* AI Section */}
          <div className="mt-4 bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg">
             <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
               <BrainCircuit className="w-3 h-3" />
               Guía Gemini AI
             </div>
             {isAiLoading ? (
               <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-full bg-indigo-500/50 rounded"></div>
                  <div className="h-2 w-1/2 bg-indigo-500/50 rounded"></div>
               </div>
             ) : (
               <p className="text-xs text-indigo-100 leading-relaxed italic">
                 "{aiDescription || 'Genera una ruta para ver la descripción...'}"
               </p>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
