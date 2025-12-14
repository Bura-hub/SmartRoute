
import { GoogleGenAI } from "@google/genai";
import { GraphNode, PathResult, WeightType } from "../types";

export const getRouteDescription = async (
  pathResult: PathResult,
  nodes: GraphNode[],
  weightType: WeightType
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API_KEY no configurada. No se puede generar la descripción.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a prompt based on the path
    const pathNames = pathResult.path.map(id => {
        const node = nodes.find(n => n.id === id);
        return node ? node.name : id;
    }).join(" -> ");

    const prompt = `
      Eres un experto en logística urbana y guía turístico.
      Hemos calculado una ruta óptima en el mapa de una ciudad (Calles y Carreras).
      
      Detalles de la ruta:
      - Trayectoria: ${pathNames}
      - Costo Total (${weightType}): ${pathResult.totalWeight.toFixed(2)}
      
      Por favor, describe la ruta brevemente como si fueras un GPS avanzado.
      Incluye un dato interesante inventado sobre uno de los cruces (nodos) específicos de la ruta.
      Mantén la respuesta en español y bajo 80 palabras.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar una descripción.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al conectar con el guía virtual IA.";
  }
};
