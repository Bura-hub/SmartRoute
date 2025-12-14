
import { GraphData, GraphNode, GraphLink } from './types';

// Raw data provided by user (Nodes)
const RAW_NODES = [
  { id: 'C16_K24', lat: 1.2133110019206368, lon: -77.28023488717908, name: 'Calle 16 con Carrera 24' },
  { id: 'C16_K25', lat: 1.214067360436424, lon: -77.28057769259001, name: 'Calle 16 con Carrera 25' },
  { id: 'C16_K26', lat: 1.2149161054845712, lon: -77.2809377390079, name: 'Calle 16 con Carrera 26' },
  { id: 'C16_K27', lat: 1.2158459502494583, lon: -77.2813448421692, name: 'Calle 16 con Carrera 27' },
  { id: 'C16_K29', lat: 1.2173251850330515, lon: -77.2823435646179, name: 'Calle 16 con Carrera 29' },
  { id: 'C17_K24', lat: 1.2136492055368984, lon: -77.2794068067267, name: 'Calle 17 con Carrera 24' },
  { id: 'C17_K25', lat: 1.2144441093582743, lon: -77.27974418689725, name: 'Calle 17 con Carrera 25' },
  { id: 'C17_K26', lat: 1.2152896878346036, lon: -77.28011076960976, name: 'Calle 17 con Carrera 26' },
  { id: 'C17_K27', lat: 1.2162277837058029, lon: -77.28051071052919, name: 'Calle 17 con Carrera 27' },
  { id: 'C17_K28', lat: 1.2169933253215022, lon: -77.28082779759625, name: 'Calle 17 con Carrera 28' },
  { id: 'C17_K29', lat: 1.217818477845427, lon: -77.2811729814518, name: 'Calle 17 con Carrera 29' },
  { id: 'C18_K24', lat: 1.214017213853392, lon: -77.27855368277103, name: 'Calle 18 con Carrera 24' },
  { id: 'C18_K25', lat: 1.2148461425795107, lon: -77.27889441429534, name: 'Calle 18 con Carrera 25' },
  { id: 'C18_K26', lat: 1.21568405223983, lon: -77.27926990015229, name: 'Calle 18 con Carrera 26' },
  { id: 'C18_K27', lat: 1.2166076914622121, lon: -77.27965285737024, name: 'Calle 18 con Carrera 27' },
  { id: 'C18_K28', lat: 1.2173746581229432, lon: -77.28000482816276, name: 'Calle 18 con Carrera 28' },
  { id: 'C18_K29', lat: 1.2182357974946278, lon: -77.28038253916655, name: 'Calle 18 con Carrera 29' },
  { id: 'C18A_K25', lat: 1.215032972084899, lon: -77.27844403442283, name: 'Punto intermedio Calle 18a - Cra 25' },
  { id: 'C18A_K26', lat: 1.215919607898636, lon: -77.27882879278238, name: 'Punto intermedio Calle 18a - Cra 26' },
  { id: 'C19_K24', lat: 1.2143417277384834, lon: -77.27769571781681, name: 'Calle 19 con Carrera 24' },
  { id: 'C19_K25', lat: 1.2151772519788349, lon: -77.27807187425633, name: 'Calle 19 con Carrera 25' },
  { id: 'C19_K26', lat: 1.2160825031323437, lon: -77.27846571358744, name: 'Calle 19 con Carrera 26' },
  { id: 'C19_K27', lat: 1.2169717220065817, lon: -77.27883938637183, name: 'Calle 19 con Carrera 27' },
  { id: 'C19_K28', lat: 1.2177751402244923, lon: -77.27918000736679, name: 'Calle 19 con Carrera 28' },
  { id: 'C19_K29', lat: 1.2186165475722694, lon: -77.27951615845953, name: 'Calle 19 con Carrera 29' },
  { id: 'C20_K24', lat: 1.2147598964503565, lon: -77.27689476615224, name: 'Calle 20 con Carrera 24' },
  { id: 'C20_K25', lat: 1.2155787969161387, lon: -77.2772494333722, name: 'Calle 20 con Carrera 25' },
  { id: 'C20_K26', lat: 1.2163839217523016, lon: -77.27758610254952, name: 'Calle 20 con Carrera 26' },
  { id: 'C20_K27', lat: 1.2173568647788782, lon: -77.277969849767, name: 'Calle 20 con Carrera 27' },
  { id: 'C20_K28', lat: 1.2182454580551343, lon: -77.27835782440715, name: 'Calle 20 con Carrera 28' },
  { id: 'C20_K29', lat: 1.2190798304720984, lon: -77.27872112332174, name: 'Calle 20 con Carrera 29' },
];

const CSV_DATA = `C16_K24;C16_K25;94;40;FALSE
C16_K25;C16_K24;94;5;TRUE
C16_K25;C16_K26;100;30;FALSE
C16_K26;C16_K25;100;5;TRUE
C16_K26;C16_K27;110;15;FALSE
C16_K27;C16_K26;110;5;TRUE
C16_K27;C16_K29;200;40;FALSE
C16_K29;C16_K27;200;5;TRUE
C17_K24;C17_K25;96;5;TRUE
C17_K25;C17_K24;96;30;FALSE
C17_K25;C17_K26;100;5;TRUE
C17_K26;C17_K25;100;15;FALSE
C17_K26;C17_K27;110;5;TRUE
C17_K27;C17_K26;110;30;FALSE
C17_K27;C17_K28;92;5;TRUE
C17_K28;C17_K27;92;15;FALSE
C17_K28;C17_K29;100;5;TRUE
C17_K29;C17_K28;100;15;FALSE
C18_K24;C18_K25;100;15;FALSE
C18_K25;C18_K24;100;5;TRUE
C18_K25;C18_K26;100;15;FALSE
C18_K26;C18_K25;100;5;TRUE
C18_K26;C18_K27;110;15;FALSE
C18_K27;C18_K26;110;5;TRUE
C18_K27;C18_K28;94;40;FALSE
C18_K28;C18_K27;94;5;TRUE
C18_K28;C18_K29;110;30;FALSE
C18_K29;C18_K28;110;5;TRUE
C18_K25;C18a_K25;54;40;FALSE
C18a_K25;C18_K25;54;5;TRUE
C18_K26;C18a_K26;56;30;FALSE
C18a_K26;C18_K26;56;5;TRUE
C19_K24;C19_K25;110;5;TRUE
C19_K25;C19_K24;110;5;TRUE
C19_K25;C19_K26;110;5;TRUE
C19_K26;C19_K25;110;5;TRUE
C19_K26;C19_K27;110;5;TRUE
C19_K27;C19_K26;110;15;FALSE
C19_K27;C19_K28;97;5;TRUE
C19_K28;C19_K27;97;15;FALSE
C19_K28;C19_K29;100;5;TRUE
C19_K29;C19_K28;100;30;FALSE
C20_K24;C20_K25;99;15;FALSE
C20_K25;C20_K24;99;5;TRUE
C20_K25;C20_K26;97;15;FALSE
C20_K26;C20_K25;97;5;TRUE
C20_K26;C20_K27;120;15;FALSE
C20_K27;C20_K26;120;5;TRUE
C20_K27;C20_K28;110;40;FALSE
C20_K28;C20_K27;110;5;TRUE
C20_K28;C20_K29;100;30;FALSE
C20_K29;C20_K28;90;5;TRUE
C16_K24;C17_K24;100;5;TRUE
C17_K24;C16_K24;100;15;FALSE
C17_K24;C18_K24;100;5;TRUE
C18_K24;C17_K24;100;15;FALSE
C18_K24;C19_K24;100;5;TRUE
C19_K24;C18_K24;100;15;FALSE
C19_K24;C20_K24;90;5;TRUE
C20_K24;C19_K24;100;40;FALSE
C18_K25;C19_K24;141;5;TRUE
C19_K25;C18_K24;147;5;TRUE
C19_K24;C18_K25;141;5;TRUE
C18_K24;C19_K25;147;5;TRUE
C18A_K25;C19_K25;44;5;FALSE
C18A_K26;C18A_K25;110;5;TRUE
C18A_K25;C18A_K26;110;5;TRUE
C18A_K26;C19_K26;44;30;FALSE
C19_K26;C18A_K26;44;5;TRUE
C16_K25;C17_K25;100;15;FALSE
C17_K25;C16_K25;100;5;TRUE
C17_K25;C18_K25;110;15;FALSE
C18_K25;C17_K25;110;5;TRUE
C19_K25;C20_K25;100;15;FALSE
C20_K25;C19_K25;100;5;TRUE
C16_K26;C17_K26;100;30;FALSE
C17_K26;C16_K26;100;5;TRUE
C17_K26;C18_K26;100;30;FALSE
C18_K26;C17_K26;100;5;TRUE
C19_K26;C20_K26;100;15;FALSE
C20_K26;C19_K26;100;5;TRUE
C16_K27;C17_K27;100;40;FALSE
C17_K27;C16_K27;100;30;FALSE
C17_K27;C18_K27;100;30;FALSE
C18_K27;C17_K27;100;15;FALSE
C18_K27;C19_K27;99;30;FALSE
C19_K27;C18_K27;99;15;FALSE
C19_K27;C20_K27;110;15;FALSE
C20_K27;C19_K27;110;15;FALSE
C17_K28;C18_K28;100;5;TRUE
C18_K28;C17_K28;100;30;FALSE
C18_K28;C19_K28;100;5;TRUE
C19_K28;C18_K28;100;15;FALSE
C19_K28;C20_K28;110;5;TRUE
C20_K28;C19_K28;110;30;FALSE
C16_K29;C17_K29;140;40;FALSE
C17_K29;C16_K29;140;5;TRUE
C17_K29;C18_K29;99;15;FALSE
C18_K29;C17_K29;99;5;TRUE
C18_K29;C19_K29;110;15;FALSE
C19_K29;C18_K29;110;5;TRUE
C19_K29;C20_K29;100;15;FALSE
C20_K29;C19_K29;100;5;TRUE
C16_K27;C17_K28;135;5;TRUE
C17_K28;C16_K27;135;5;TRUE
C16_K29;C17_K28;172;5;TRUE
C17_K28;C16_K29;172;5;TRUE`;

// Parse ID for Grid Logic (C18A_K25) - Used for color grouping
const parseGridId = (id: string) => {
  const parts = id.split('_');
  const parsePart = (str: string) => {
    const valStr = str.substring(1); 
    const numMatch = valStr.match(/(\d+)/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    return num;
  };
  return {
    c: parsePart(parts[0]), // Calle Value
  };
};

export const generateGraphData = (): GraphData => {
  // Normalize Coordinates for 3D Visualization
  const lats = RAW_NODES.map(n => n.lat);
  const lons = RAW_NODES.map(n => n.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const avgLat = (minLat + maxLat) / 2;
  const avgLon = (minLon + maxLon) / 2;

  const SCALE = 80000; 

  const nodes: GraphNode[] = RAW_NODES.map((n) => {
    // Map Lat -> Z (Depth), Lon -> X (Width), Y = 0 (Flat)
    // Invert X because western hemisphere is negative
    const x = (n.lon - avgLon) * SCALE;
    const z = (n.lat - avgLat) * SCALE * -1; 

    return {
      ...n,
      id: n.id.toUpperCase(), // Ensure uppercase
      val: 1,
      fx: x,
      fy: 0, 
      fz: z,
      group: parseGridId(n.id).c
    };
  });

  const links: GraphLink[] = CSV_DATA.split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [origen, destino, distancia, velocidad, esPeatonal] = line.trim().split(';');
      const distM = parseInt(distancia); // meters
      const speedKmH = parseInt(velocidad);
      const isPed = esPeatonal === 'TRUE';
      
      // Calculate weights
      // Vehicle: If isPedestrianOnly=TRUE, weight is Infinity (handled in algo filter), else dist/speed
      // Pedestrian: dist / 5km/h always
      
      const timeVeh = isPed ? Infinity : (distM / 1000) / speedKmH * 60; // min
      const timePed = (distM / 1000) / 5 * 60; // min (assuming 5km/h walking speed)

      return {
        source: origen.toUpperCase(),
        target: destino.toUpperCase(),
        distance: distM,
        maxSpeed: speedKmH,
        isPedestrianOnly: isPed,
        weightDistance: distM,
        weightTimeVehicle: parseFloat(timeVeh.toFixed(2)),
        weightTimePedestrian: parseFloat(timePed.toFixed(2))
      };
    });

  return { nodes, links };
};

export const INITIAL_GRAPH_DATA = generateGraphData();
