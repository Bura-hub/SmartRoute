import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Graph3D from './components/Graph3D';
import ControlPanel from './components/ControlPanel';
import { INITIAL_GRAPH_DATA } from './constants';
import { dijkstra, bellmanFord, dijkstraStepGenerator, bellmanFordStepGenerator } from './utils/algorithms';
import { AlgorithmType, WeightType, PathResult, GraphNode, TransportMode, AlgorithmStep } from './types';

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
  

  // AutoPlay Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoPlay && isStepMode && stepState && !stepState.finished) {
      interval = setInterval(() => {
        handleNextStep();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [autoPlay, isStepMode, stepState]);

  // Effect for instant result animation
  useEffect(() => {
    if (!isStepMode && pathResult && pathResult.path.length > 0) {
      setDisplayedPath([pathResult.path[0]]);
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < pathResult.path.length) {
          setDisplayedPath(prev => [...prev, pathResult.path[currentStep]]);
        } else {
          clearInterval(interval);
        }
      }, 400); 
      return () => clearInterval(interval);
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
            // Show full path instantly or animate it? Let's show it fully red
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

  // Memoize graph stats to avoid recalculation
  const graphStats = useMemo(
    () => ({
      nodeCount: graphData.nodes.length,
      linkCount: graphData.links.length,
    }),
    [graphData]
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

      <div className="absolute top-0 right-0 p-4 z-10 pointer-events-none">
        <div className="bg-slate-900/50 backdrop-blur text-slate-500 text-xs px-3 py-1 rounded border border-slate-700">
          {graphStats.nodeCount} Nodos | {graphStats.linkCount} Conexiones
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