<div align="center">
  <h1>🗺️ PathFinder 3D</h1>
  <p><strong>Visualizador Interactivo de Algoritmos de Rutas Óptimas</strong></p>
  <p>Algoritmos de Dijkstra y Bellman-Ford en tiempo real para el micro-centro de San Juan de Pasto, Colombia</p>
</div>

---

## 📋 Descripción

PathFinder 3D es una aplicación web interactiva que visualiza algoritmos de búsqueda de rutas óptimas en un grafo 3D. La aplicación permite explorar el micro-centro de San Juan de Pasto (Calles 16-20 y Carreras 24-29) utilizando dos algoritmos clásicos: **Dijkstra** y **Bellman-Ford**.

### Características Principales

- 🎯 **Visualización 3D Interactiva**: Grafo tridimensional con navegación fluida
- 🔍 **Dos Modos de Ejecución**: 
  - **Instantáneo**: Cálculo y visualización inmediata de la ruta
  - **Paso a Paso**: Visualización detallada del proceso del algoritmo
- 🚗 **Modos de Transporte**: Vehículo y Peatonal con restricciones realistas
- ⚡ **Optimización Dual**: Por distancia o por tiempo
- 📊 **Información Detallada**: Estadísticas de ejecución, nodos visitados y costos
- 🎨 **Interfaz Moderna**: Diseño oscuro con feedback visual en tiempo real

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   
   La aplicación estará disponible en `http://localhost:3000`

---

## 🏗️ Estructura del Proyecto

```
pathfinder-3d---city-map/
├── components/
│   ├── ControlPanel.tsx    # Panel de control con configuraciones
│   └── Graph3D.tsx         # Componente de visualización 3D
├── utils/
│   ├── algorithms.ts       # Implementación de Dijkstra y Bellman-Ford
│   └── priorityQueue.ts   # Cola de prioridad (heap) optimizada
├── constants.ts            # Datos del grafo (nodos y aristas)
├── types.ts                # Definiciones de tipos TypeScript
├── App.tsx                 # Componente principal
└── index.tsx              # Punto de entrada
```

---

## 🎮 Uso

### Selección de Nodos

1. **Nodo de Inicio**: Selecciona el punto de partida desde el dropdown
2. **Nodo de Destino**: Selecciona el punto de llegada
3. **Click en el Grafo**: También puedes hacer click directamente en los nodos del grafo 3D

### Configuración de Algoritmo

- **Algoritmo**: 
  - **Dijkstra**: Más eficiente para grafos sin pesos negativos (O((V+E) log V))
  - **Bellman-Ford**: Detecta ciclos negativos, útil para validación (O(V·E))

- **Optimizar por**:
  - **Distancia**: Encuentra la ruta más corta en metros
  - **Tiempo**: Encuentra la ruta más rápida en minutos

- **Modo de Transporte**:
  - **Vehículo**: Respeta restricciones viales, excluye zonas peatonales
  - **Peatón**: Puede usar todas las rutas, incluyendo pasajes peatonales

### Modos de Ejecución

#### Modo Instantáneo
- Calcula y muestra la ruta óptima inmediatamente
- Animación suave de la ruta encontrada
- Ideal para uso rápido

#### Modo Paso a Paso
- Visualiza cada iteración del algoritmo
- Muestra el nodo actual siendo procesado
- Indica nodos visitados, en frontera y no alcanzados
- Permite avanzar/retroceder paso a paso
- Incluye modo auto-play para visualización continua
- Log detallado de cada operación

---

## 🧮 Algoritmos Implementados

### Dijkstra
- **Complejidad**: O((V + E) log V) con cola de prioridad optimizada
- **Uso**: Grafos sin pesos negativos
- **Optimización**: Implementado con min-heap para mejor rendimiento

### Bellman-Ford
- **Complejidad**: O(V·E)
- **Uso**: Validación y detección de ciclos negativos
- **Característica**: Relaja todas las aristas hasta V-1 veces

---

## 🎨 Características Visuales

### Código de Colores

**Nodos:**
- 🟢 **Verde**: Nodo de inicio
- 🔴 **Rojo**: Nodos en la ruta óptima
- 🟡 **Amarillo**: Nodo de destino
- 🔵 **Azul**: Nodos en la frontera (pendientes de evaluar)
- ⚫ **Gris**: Nodos visitados/cerrados
- ⚪ **Oscuro**: Nodos no alcanzados

**Aristas:**
- 🟡 **Amarillo**: Rutas vehiculares
- 🟢 **Verde**: Rutas peatonales
- 🔴 **Rojo**: Ruta óptima encontrada
- 🟣 **Púrpura**: Árbol de ruta en construcción (modo paso a paso)

---

## 🔧 Tecnologías Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Three.js** - Renderizado 3D
- **react-force-graph-3d** - Visualización de grafos 3D
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos (via CDN)
- **Lucide React** - Iconos

---

## 📊 Datos del Grafo

El grafo representa el micro-centro de San Juan de Pasto:
- **31 nodos**: Intersecciones viales (formato: C[calle]_K[carrera])
- **145+ conexiones**: Aristas dirigidas con distancias y velocidades reales
- **Coordenadas geográficas**: Latitud y longitud reales (WGS84)

### Nomenclatura
- **C**: Calle (eje horizontal, Este-Oeste)
- **K**: Carrera (eje vertical, Norte-Sur)
- **Ejemplo**: `C18_K25` = Calle 18 con Carrera 25

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en puerto 3000

# Producción
npm run build        # Construye la aplicación para producción
npm run preview      # Previsualiza el build de producción
```

---

## 🐛 Solución de Problemas

### La aplicación no inicia
- Verifica que Node.js >= 18 esté instalado
- Ejecuta `npm install` para instalar dependencias
- Verifica que el puerto 3000 esté disponible

### Los nodos no se visualizan
- Verifica la consola del navegador para errores
- Asegúrate de que WebGL esté habilitado en tu navegador
- Prueba en Chrome, Firefox o Edge (navegadores modernos)

### No se encuentra ruta
- Verifica que los nodos de inicio y destino sean diferentes
- Asegúrate de que exista una conexión válida según el modo de transporte
- En modo vehículo, verifica que no estés intentando usar rutas peatonales

---

## 📝 Notas Técnicas

### Optimizaciones Implementadas

1. **Priority Queue (Heap)**: Dijkstra usa un min-heap en lugar de array ordenado
2. **Memoización**: Componentes optimizados con `React.memo`, `useMemo` y `useCallback`
3. **Validación de Entrada**: Validación robusta de nodos y parámetros
4. **Manejo de Errores**: Try-catch y mensajes de error descriptivos
5. **TypeScript Estricto**: Tipos específicos, eliminación de `any`

### Limitaciones Conocidas

- El grafo está limitado a 31 nodos (área específica de Pasto)
- No soporta pesos negativos en aristas (por diseño del problema)
- La visualización 3D requiere un navegador con soporte WebGL

---

## 🤝 Contribuciones

Este es un proyecto académico para el curso de Optimización. Las mejoras y sugerencias son bienvenidas.

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico de la Universidad de Nariño (UDENAR).

---

## 👨‍💻 Autor

Proyecto desarrollado para el curso de Optimización - Maestría en Ingeniería de Sistemas y Computación.

---

## 🔗 Enlaces Útiles

- [Documentación de React](https://react.dev)
- [Three.js Documentation](https://threejs.org/docs/)
- [react-force-graph-3d](https://github.com/vasturiano/react-force-graph-3d)

---

<div align="center">
  <p>Hecho con ❤️ para la visualización de algoritmos de optimización</p>
</div>
