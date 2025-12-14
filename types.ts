
export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  // react-force-graph specific for fixed positioning
  fx?: number;
  fy?: number;
  fz?: number;
  val: number; // For visualization size
  group?: number;
}

export interface GraphLink {
  source: string | GraphNode; // force-graph-3d mutates this to object
  target: string | GraphNode;
  distance: number; // in meters
  maxSpeed: number; // km/h
  isPedestrianOnly: boolean; // if true, only pedestrians. If false, both (but vehicles use this speed).
  
  // Computed weights for algorithms (simplifies logic later)
  weightDistance: number;
  weightTimeVehicle: number;
  weightTimePedestrian: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export enum AlgorithmType {
  DIJKSTRA = 'Dijkstra',
  BELLMAN_FORD = 'Bellman-Ford'
}

export enum WeightType {
  DISTANCE = 'Distancia (m)',
  TIME = 'Tiempo (min)'
}

export enum TransportMode {
  VEHICLE = 'Vehículo',
  PEDESTRIAN = 'Peatón'
}

export interface PathResult {
  path: string[]; // Array of Node IDs
  totalWeight: number;
  visitedCount: number;
  executionTime: number; // ms
}

// Nueva interfaz para el modo paso a paso
export interface AlgorithmStep {
  currentNodeId: string | null;     // Nodo siendo evaluado actualmente
  visited: string[];                // Nodos ya cerrados/visitados
  distances: Record<string, number>; // Mapa actual de pesos
  previous: Record<string, string | null>; // Mapa de procedencia para dibujar el árbol
  logMessage: string;               // Mensaje explicativo de lo que acaba de pasar
  finished: boolean;                // Si el algoritmo terminó
  pathResult?: PathResult | null;   // Resultado final si finished es true
}
