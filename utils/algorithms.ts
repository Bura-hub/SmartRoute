
import { GraphData, GraphLink, PathResult, WeightType, TransportMode, AlgorithmStep } from '../types';

// Helper to check connectivity based on mode
const isValidLink = (link: GraphLink, mode: TransportMode): boolean => {
  if (mode === TransportMode.VEHICLE) {
    // Vehicles cannot use pedestrian-only paths
    return !link.isPedestrianOnly;
  }
  return true;
};

// Helper to get weight based on selection and mode
const getWeight = (link: GraphLink, type: WeightType, mode: TransportMode): number => {
  if (type === WeightType.DISTANCE) {
    return link.weightDistance;
  }
  // Time
  return mode === TransportMode.VEHICLE ? link.weightTimeVehicle : link.weightTimePedestrian;
};

// Helper to get neighbors
const getNeighbors = (nodeId: string, links: GraphLink[]) => {
  return links.filter(l => {
    const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
    // Graph is directed now! source -> target
    return s === nodeId;
  }).map(l => {
    const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
    return { id: t, link: l };
  });
};

// --- Standard Functions (for Instant calculation) ---

export const dijkstra = (
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): PathResult | null => {
  // Run the generator to completion
  const generator = dijkstraStepGenerator(graph, startNodeId, endNodeId, weightType, transportMode);
  let result: IteratorResult<AlgorithmStep, AlgorithmStep>;
  let lastValue: AlgorithmStep | null = null;
  
  do {
    result = generator.next();
    lastValue = result.value;
  } while (!result.done);

  return lastValue?.pathResult || null;
};

export const bellmanFord = (
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): PathResult | null => {
  // Run generator to completion
  const generator = bellmanFordStepGenerator(graph, startNodeId, endNodeId, weightType, transportMode);
  let result: IteratorResult<AlgorithmStep, AlgorithmStep>;
  let lastValue: AlgorithmStep | null = null;
  
  do {
    result = generator.next();
    lastValue = result.value;
  } while (!result.done);

  return lastValue?.pathResult || null;
};

// --- Generator Functions (for Step-by-Step) ---

export function* dijkstraStepGenerator(
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): Generator<AlgorithmStep, AlgorithmStep, unknown> {
  const startTime = performance.now();
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq: { id: string; dist: number }[] = [];
  const visited = new Set<string>();

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });

  distances[startNodeId] = 0;
  pq.push({ id: startNodeId, dist: 0 });

  yield {
    currentNodeId: startNodeId,
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    logMessage: `Inicio: Distancia a ${startNodeId} es 0.`,
    finished: false
  };

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const current = pq.shift()!;
    
    if (current.dist > distances[current.id]) continue;
    
    visited.add(current.id);

    // Yield State: Just decided to process 'current'
    yield {
      currentNodeId: current.id,
      visited: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      logMessage: `Evaluando nodo ${current.id} (Costo acumulado: ${current.dist.toFixed(1)})`,
      finished: false
    };

    if (current.id === endNodeId) {
        // Found target
        break; 
    }

    const neighbors = getNeighbors(current.id, graph.links);
    let updatesCount = 0;

    for (const neighbor of neighbors) {
      if (!isValidLink(neighbor.link, transportMode)) continue;

      const weight = getWeight(neighbor.link, weightType, transportMode);
      const alt = distances[current.id] + weight;

      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = current.id;
        pq.push({ id: neighbor.id, dist: alt });
        updatesCount++;
      }
    }
    
    if (updatesCount > 0) {
         yield {
          currentNodeId: current.id,
          visited: Array.from(visited),
          distances: { ...distances },
          previous: { ...previous },
          logMessage: `-> Actualizados ${updatesCount} vecinos de ${current.id}.`,
          finished: false
        };
    }
  }

  // Reconstruction
  const path: string[] = [];
  let currentId: string | null = endNodeId;
  const found = distances[endNodeId] !== Infinity;

  if (found) {
    while (currentId !== null) {
        path.unshift(currentId);
        currentId = previous[currentId];
    }
  }

  const endTime = performance.now();
  const result: PathResult = {
    path: found ? path : [],
    totalWeight: distances[endNodeId],
    visitedCount: visited.size,
    executionTime: endTime - startTime
  };

  return {
    currentNodeId: null,
    visited: Array.from(visited),
    distances: { ...distances },
    previous: { ...previous },
    logMessage: found ? `Destino encontrado. Costo total: ${distances[endNodeId].toFixed(2)}` : "No se encontró ruta.",
    finished: true,
    pathResult: result
  };
}


export function* bellmanFordStepGenerator(
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): Generator<AlgorithmStep, AlgorithmStep, unknown> {
  const startTime = performance.now();
  let distances: Record<string, number> = {};
  let previous: Record<string, string | null> = {};
  
  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });

  distances[startNodeId] = 0;
  const nodeCount = graph.nodes.length;
  
  yield {
    currentNodeId: startNodeId,
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    logMessage: `Inicio: Bellman-Ford inicializado.`,
    finished: false
  };

  for (let i = 0; i < nodeCount - 1; i++) {
    let changed = false;
    
    // Iteramos nodo a nodo para visualizar la propagación como una "ola"
    // Esto es equivalente a iterar aristas, pero agrupadas por nodo origen.
    for (const node of graph.nodes) {
      // Optimización visual y lógica: Solo propagamos desde nodos alcanzados
      if (distances[node.id] === Infinity) continue;

      // Reportamos que estamos visitando este nodo (similar a Dijkstra)
      yield {
        currentNodeId: node.id,
        visited: [], // En BF no cerramos nodos, pero mostramos el actual
        distances: { ...distances },
        previous: { ...previous },
        logMessage: `Iteración ${i + 1}: Revisando conexiones desde ${node.id}`,
        finished: false
      };

      const neighbors = getNeighbors(node.id, graph.links);
      for (const neighbor of neighbors) {
        if (!isValidLink(neighbor.link, transportMode)) continue;

        const weight = getWeight(neighbor.link, weightType, transportMode);
        const newDist = distances[node.id] + weight;

        if (newDist < distances[neighbor.id]) {
          distances[neighbor.id] = newDist;
          previous[neighbor.id] = node.id;
          changed = true;
        }
      }
    }

    if (!changed) {
        yield {
            currentNodeId: null,
            visited: [],
            distances: { ...distances },
            previous: { ...previous },
            logMessage: `Converge tempranamente en iteración ${i + 1}.`,
            finished: false
        };
        break;
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let currentId: string | null = endNodeId;
  const found = distances[endNodeId] !== Infinity;
  let safety = 0;

  if (found) {
    while (currentId !== null && safety < nodeCount + 2) {
        path.unshift(currentId);
        currentId = previous[currentId];
        safety++;
    }
  }

  const endTime = performance.now();
  const result: PathResult = {
    path: found ? path : [],
    totalWeight: distances[endNodeId],
    visitedCount: nodeCount, 
    executionTime: endTime - startTime
  };

  return {
    currentNodeId: null,
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    logMessage: found ? `Finalizado. Ruta encontrada.` : `Finalizado. Sin ruta.`,
    finished: true,
    pathResult: result
  };
}
