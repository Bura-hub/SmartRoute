import React, { useState, useEffect, useRef, useCallback } from 'react';
import Graph3D from './components/Graph3D';
import ControlPanel from './components/ControlPanel';
import { INITIAL_GRAPH_DATA } from './constants';
import { dijkstra, bellmanFord, dijkstraStepGenerator, bellmanFordStepGenerator } from './utils/algorithms';
import { AlgorithmType, WeightType, PathResult, GraphNode, TransportMode, AlgorithmStep } from './types';
import { Network } from 'lucide-react';

const App: React.FC = () => {
  const [graphData] = useState(INITIAL_GRAPH_DATA);
  const [startNode, setStartNode] = useState(graphData.nodes[0]?.id || '');
  const [endNode, setEndNode] = useState(graphData.nodes[graphData.nodes.length - 1]?.id || '');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.DIJKSTRA);
  const [weightType, setWeightType] = useState<WeightType>(WeightType.DISTANCE);
  const [transportMode, setTransportMode] = useState<TransportMode>(TransportMode.VEHICLE);
  
  // pathResult contiene el cálculo final completo (para modo instantáneo o cuando termina el paso a paso)
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  
  // Step by Step State
  const [isStepMode, setIsStepMode] = useState(false);
  const [stepState, setStepState] = useState<AlgorithmStep | null>(null);
  const iteratorRef = useRef<Generator<AlgorithmStep, AlgorithmStep, unknown> | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  // History for step navigation
  const [stepHistory, setStepHistory] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  // displayedPath es lo que se muestra visualmente
  const [displayedPath, setDisplayedPath] = useState<string[]>([]);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Effect for instant result animation - Optimized with requestAnimationFrame for smoother animations
  useEffect(() => {
    if (!isStepMode && pathResult && pathResult.path.length > 0) {
      setDisplayedPath([pathResult.path[0]]);
      let currentStep = 0;
      let animationFrameId: number;
      let lastTime = performance.now();
      const frameDelay = 300; // Reduced from 400ms for smoother animation

      const animate = (currentTime: number) => {
        if (currentTime - lastTime >= frameDelay) {
          currentStep++;
          if (currentStep < pathResult.path.length) {
            setDisplayedPath(prev => [...prev, pathResult.path[currentStep]]);
            lastTime = currentTime;
          } else {
            return; // Animation complete
          }
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    } else if (!isStepMode) {
      setDisplayedPath([]);
    }
  }, [pathResult, isStepMode]);

  const handleCalculateInstant = useCallback(async () => {
    setIsStepMode(false);
    setAutoPlay(false);
    setStepState(null);
    setError(null);
    setIsCalculating(true);

    // Validation
    if (!startNode || !endNode) {
      setError('Por favor selecciona nodos de inicio y destino');
      setIsCalculating(false);
      return;
    }

    if (startNode === endNode) {
      setError('El nodo de inicio y destino no pueden ser el mismo');
      setIsCalculating(false);
      return;
    }

    try {
      setPathResult(null); // Reset
      let result: PathResult | null = null;

      if (algorithm === AlgorithmType.DIJKSTRA) {
        result = dijkstra(graphData, startNode, endNode, weightType, transportMode);
      } else {
        result = bellmanFord(graphData, startNode, endNode, weightType, transportMode);
      }

      if (!result || result.path.length === 0) {
        setError('No se encontró una ruta entre los nodos seleccionados');
      } else {
        setPathResult(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al calcular la ruta';
      setError(errorMessage);
      console.error('Error calculating path:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [graphData, startNode, endNode, algorithm, weightType, transportMode]);

  const handleStartStepMode = useCallback(() => {
    setError(null);
    setIsStepMode(true);
    setPathResult(null);
    setDisplayedPath([]);
    setAutoPlay(false);
    setStepHistory([]);
    setCurrentStepIndex(-1);

    // Validation
    if (!startNode || !endNode) {
      setError('Por favor selecciona nodos de inicio y destino');
      setIsStepMode(false);
      return;
    }

    if (startNode === endNode) {
      setError('El nodo de inicio y destino no pueden ser el mismo');
      setIsStepMode(false);
      return;
    }

    try {
      // Initialize Iterator
      if (algorithm === AlgorithmType.DIJKSTRA) {
        iteratorRef.current = dijkstraStepGenerator(
          graphData,
          startNode,
          endNode,
          weightType,
          transportMode
        );
      } else {
        iteratorRef.current = bellmanFordStepGenerator(
          graphData,
          startNode,
          endNode,
          weightType,
          transportMode
        );
      }

      // First Step
      handleNextStep();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar el algoritmo';
      setError(errorMessage);
      setIsStepMode(false);
      console.error('Error starting step mode:', err);
    }
  }, [graphData, startNode, endNode, algorithm, weightType, transportMode]);

  const handleNextStep = useCallback(() => {
    try {
      // If we're navigating backwards in history, advance forward first
      if (currentStepIndex < stepHistory.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        setStepState(stepHistory[nextIndex]);
        return;
      }

      // Otherwise, get next step from generator
      if (iteratorRef.current) {
        const { value, done } = iteratorRef.current.next();

        // Add to history
        const newHistory = [...stepHistory, value];
        setStepHistory(newHistory);
        setCurrentStepIndex(newHistory.length - 1);
        setStepState(value);

        // If algorithm finished
        if (done || value.finished) {
          setAutoPlay(false);
          if (value.pathResult) {
            setPathResult(value.pathResult);
            setDisplayedPath(value.pathResult.path);
          } else {
            setError('El algoritmo terminó pero no se encontró una ruta');
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al avanzar al siguiente paso';
      setError(errorMessage);
      setAutoPlay(false);
      console.error('Error in next step:', err);
    }
  }, [currentStepIndex, stepHistory]);

  // AutoPlay Effect - Optimized with useRef to avoid dependency issues
  const handleNextStepRef = useRef(handleNextStep);
  useEffect(() => {
    handleNextStepRef.current = handleNextStep;
  }, [handleNextStep]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoPlay && isStepMode && stepState && !stepState.finished) {
      interval = setInterval(() => {
        handleNextStepRef.current();
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, isStepMode, stepState?.finished]);

  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const prevState = stepHistory[prevIndex];
      setStepState(prevState);

      // If we go back from finished state, clear the displayed path
      // If we go to a finished state, show the path
      if (prevState.finished && prevState.pathResult) {
        setDisplayedPath(prevState.pathResult.path);
        setPathResult(prevState.pathResult);
      } else if (stepState?.finished) {
        // Going back from finished state, clear path
        setDisplayedPath([]);
        setPathResult(null);
      }
    }
  }, [currentStepIndex, stepHistory, stepState]);

  const handleReset = useCallback(() => {
    setIsStepMode(false);
    setPathResult(null);
    setStepState(null);
    setDisplayedPath([]);
    setAutoPlay(false);
    setStepHistory([]);
    setCurrentStepIndex(-1);
    setError(null);
    iteratorRef.current = null;
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (isStepMode) return; // Disable clicking during execution
      if (startNode && startNode !== node.id) {
        setEndNode(node.id);
      } else {
        setStartNode(node.id);
      }
      setError(null); // Clear error when selecting new nodes
    },
    [isStepMode, startNode]
  );

  return (
    <div className="relative w-screen h-screen bg-transparent font-sans overflow-hidden">
      <ControlPanel
        nodes={graphData.nodes}
        startNode={startNode}
        endNode={endNode}
        algorithm={algorithm}
        weightType={weightType}
        transportMode={transportMode}
        setStartNode={setStartNode}
        setEndNode={setEndNode}
        setAlgorithm={setAlgorithm}
        setWeightType={setWeightType}
        setTransportMode={setTransportMode}
        onCalculate={handleCalculateInstant}
        // Step Mode Props
        isStepMode={isStepMode}
        stepState={stepState}
        onStartStep={handleStartStepMode}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
        onReset={handleReset}
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
        canGoBack={currentStepIndex > 0}
        pathResult={pathResult}
        error={error}
        isCalculating={isCalculating}
      />
      
      {/* Top Right Stats - Re-styled */}
      <div className="absolute top-6 right-6 z-10 pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-xl text-slate-400 text-[10px] font-medium tracking-wide px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-3">
           <Network className="w-3 h-3 text-blue-500" />
           <span className="flex items-center gap-1">
             <span className="text-white font-bold">{graphData.nodes.length}</span> Nodos
           </span>
           <div className="h-3 w-px bg-white/10"></div>
           <span className="flex items-center gap-1">
             <span className="text-white font-bold">{graphData.links.length}</span> Conexiones
           </span>
        </div>
      </div>

      <Graph3D 
        data={graphData} 
        activePath={displayedPath}
        onNodeClick={handleNodeClick}
        stepState={stepState}
      />
    </div>
  );
};

export default App;
