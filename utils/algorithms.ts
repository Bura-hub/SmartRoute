
import { GraphData, GraphLink, PathResult, WeightType, TransportMode, AlgorithmStep } from '../types';
import { PriorityQueue } from './priorityQueue';

/**
 * Validates if a link can be used by the given transport mode
 * @param link - The graph link to validate
 * @param mode - The transport mode (vehicle or pedestrian)
 * @returns true if the link is valid for the mode
 */
const isValidLink = (link: GraphLink, mode: TransportMode): boolean => {
  if (mode === TransportMode.VEHICLE) {
    // Vehicles cannot use pedestrian-only paths
    return !link.isPedestrianOnly;
  }
  return true;
};

/**
 * Gets the weight of a link based on weight type and transport mode
 * @param link - The graph link
 * @param type - The weight type (distance or time)
 * @param mode - The transport mode
 * @returns The weight value
 */
const getWeight = (link: GraphLink, type: WeightType, mode: TransportMode): number => {
  if (type === WeightType.DISTANCE) {
    return link.weightDistance;
  }
  // Time
  return mode === TransportMode.VEHICLE ? link.weightTimeVehicle : link.weightTimePedestrian;
};

/**
 * Gets all neighbors of a node (outgoing edges)
 * @param nodeId - The node ID to get neighbors for
 * @param links - Array of all graph links
 * @returns Array of neighbor nodes with their connecting links
 */
const getNeighbors = (nodeId: string, links: GraphLink[]): Array<{ id: string; link: GraphLink }> => {
  return links
    .filter((l) => {
      const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      // Graph is directed: source -> target
      return sourceId === nodeId;
    })
    .map((l) => {
      const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return { id: targetId, link: l };
    });
};

// Import GraphNode for type safety
import type { GraphNode } from '../types';

// --- Standard Functions (for Instant calculation) ---

/**
 * Dijkstra's algorithm - instant calculation
 * @param graph - The graph data structure
 * @param startNodeId - Starting node ID
 * @param endNodeId - Target node ID
 * @param weightType - Type of weight to optimize
 * @param transportMode - Transport mode
 * @returns PathResult with optimal path, or null if no path exists
 */
export const dijkstra = (
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): PathResult | null => {
  try {
    // Run the generator to completion
    const generator = dijkstraStepGenerator(
      graph,
      startNodeId,
      endNodeId,
      weightType,
      transportMode
    );
    let result: IteratorResult<AlgorithmStep, AlgorithmStep>;
    let lastValue: AlgorithmStep | null = null;

    do {
      result = generator.next();
      lastValue = result.value;
    } while (!result.done);

    return lastValue?.pathResult || null;
  } catch (error) {
    console.error('Error in Dijkstra algorithm:', error);
    return null;
  }
};

/**
 * Bellman-Ford algorithm - instant calculation
 * Can detect negative cycles (though not applicable for this use case)
 * @param graph - The graph data structure
 * @param startNodeId - Starting node ID
 * @param endNodeId - Target node ID
 * @param weightType - Type of weight to optimize
 * @param transportMode - Transport mode
 * @returns PathResult with optimal path, or null if no path exists
 */
export const bellmanFord = (
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): PathResult | null => {
  try {
    // Run generator to completion
    const generator = bellmanFordStepGenerator(
      graph,
      startNodeId,
      endNodeId,
      weightType,
      transportMode
    );
    let result: IteratorResult<AlgorithmStep, AlgorithmStep>;
    let lastValue: AlgorithmStep | null = null;

    do {
      result = generator.next();
      lastValue = result.value;
    } while (!result.done);

    return lastValue?.pathResult || null;
  } catch (error) {
    console.error('Error in Bellman-Ford algorithm:', error);
    return null;
  }
};

// --- Generator Functions (for Step-by-Step) ---

/**
 * Dijkstra's algorithm step-by-step generator
 * Uses a priority queue (min-heap) for optimal O((V + E) log V) performance
 * @param graph - The graph data structure
 * @param startNodeId - Starting node ID
 * @param endNodeId - Target node ID
 * @param weightType - Type of weight to optimize (distance or time)
 * @param transportMode - Transport mode (vehicle or pedestrian)
 * @yields AlgorithmStep - Each step of the algorithm execution
 */
export function* dijkstraStepGenerator(
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): Generator<AlgorithmStep, AlgorithmStep, unknown> {
  // Validate inputs
  if (!graph.nodes.some((n) => n.id === startNodeId)) {
    throw new Error(`Start node ${startNodeId} not found in graph`);
  }
  if (!graph.nodes.some((n) => n.id === endNodeId)) {
    throw new Error(`End node ${endNodeId} not found in graph`);
  }
  if (startNodeId === endNodeId) {
    throw new Error('Start and end nodes cannot be the same');
  }

  const startTime = performance.now();
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const priorityQueue = new PriorityQueue<string>();
  const visited = new Set<string>();
  const inQueue = new Set<string>(); // Track nodes in queue to avoid duplicates

  // Initialize distances
  graph.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });

  distances[startNodeId] = 0;
  priorityQueue.enqueue(startNodeId, 0);
  inQueue.add(startNodeId);

  yield {
    currentNodeId: startNodeId,
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    logMessage: `Inicio: Distancia a ${startNodeId} es 0.`,
    finished: false,
  };

  while (!priorityQueue.isEmpty()) {
    const currentId = priorityQueue.dequeue();
    if (!currentId) break;

    // Skip if we already processed this node with a better distance
    if (visited.has(currentId)) continue;

    visited.add(currentId);

    // Yield State: Just decided to process 'current'
    yield {
      currentNodeId: currentId,
      visited: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      logMessage: `Evaluando nodo ${currentId} (Costo acumulado: ${distances[currentId].toFixed(1)})`,
      finished: false,
    };

    if (currentId === endNodeId) {
      // Found target - early termination
      break;
    }

    const neighbors = getNeighbors(currentId, graph.links);
    let updatesCount = 0;

    for (const neighbor of neighbors) {
      if (!isValidLink(neighbor.link, transportMode)) continue;

      const weight = getWeight(neighbor.link, weightType, transportMode);
      if (weight === Infinity || weight < 0) continue; // Skip invalid weights

      const alt = distances[currentId] + weight;

      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = currentId;

        // Add to queue if not already there
        if (!inQueue.has(neighbor.id)) {
          priorityQueue.enqueue(neighbor.id, alt);
          inQueue.add(neighbor.id);
        } else {
          // Re-insert with new priority (simple approach - could optimize with decrease-key)
          priorityQueue.enqueue(neighbor.id, alt);
        }
        updatesCount++;
      }
    }

    if (updatesCount > 0) {
      yield {
        currentNodeId: currentId,
        visited: Array.from(visited),
        distances: { ...distances },
        previous: { ...previous },
        logMessage: `-> Actualizados ${updatesCount} vecinos de ${currentId}.`,
        finished: false,
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


/**
 * Bellman-Ford algorithm step-by-step generator
 * Relaxes edges up to V-1 times to find shortest paths
 * @param graph - The graph data structure
 * @param startNodeId - Starting node ID
 * @param endNodeId - Target node ID
 * @param weightType - Type of weight to optimize
 * @param transportMode - Transport mode
 * @yields AlgorithmStep - Each step of the algorithm execution
 */
export function* bellmanFordStepGenerator(
  graph: GraphData,
  startNodeId: string,
  endNodeId: string,
  weightType: WeightType,
  transportMode: TransportMode
): Generator<AlgorithmStep, AlgorithmStep, unknown> {
  // Validate inputs
  if (!graph.nodes.some((n) => n.id === startNodeId)) {
    throw new Error(`Start node ${startNodeId} not found in graph`);
  }
  if (!graph.nodes.some((n) => n.id === endNodeId)) {
    throw new Error(`End node ${endNodeId} not found in graph`);
  }
  if (startNodeId === endNodeId) {
    throw new Error('Start and end nodes cannot be the same');
  }

  const startTime = performance.now();
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};

  graph.nodes.forEach((node) => {
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
    finished: false,
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
        if (weight === Infinity || weight < 0) continue; // Skip invalid weights

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
