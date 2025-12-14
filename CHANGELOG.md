# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2025-01-XX

### 🚀 Mejoras Principales

#### Optimización de Algoritmos
- ✅ Implementada **Priority Queue (min-heap)** para algoritmo Dijkstra
- ✅ Complejidad mejorada de O(V²) a **O((V+E) log V)**
- ✅ Validación de pesos negativos e infinitos en ambos algoritmos
- ✅ Mejor manejo de casos edge (nodos no encontrados, rutas inexistentes)

#### Manejo de Errores
- ✅ Try-catch robusto en todas las funciones críticas
- ✅ Validación completa de nodos de inicio y destino
- ✅ Mensajes de error descriptivos y visibles en la UI
- ✅ Prevención de errores en tiempo de ejecución

#### TypeScript y Calidad de Código
- ✅ Eliminados todos los tipos `any` - TypeScript estricto
- ✅ Tipos específicos para todos los componentes y funciones
- ✅ Interfaces bien definidas y documentadas
- ✅ Mejor type safety en toda la aplicación

#### Optimización de React
- ✅ `React.memo` en componente Graph3D para evitar re-renders innecesarios
- ✅ `useMemo` para cálculos costosos (estadísticas del grafo)
- ✅ `useCallback` para todas las funciones pasadas como props
- ✅ Memoización estratégica para mejor rendimiento

#### Experiencia de Usuario (UX)
- ✅ Indicadores de carga durante cálculos
- ✅ Mensajes de error visibles y claros con iconos
- ✅ Botones deshabilitados apropiadamente durante operaciones
- ✅ Feedback visual mejorado en todos los estados
- ✅ Animaciones suaves y transiciones

#### Accesibilidad
- ✅ ARIA labels en todos los controles interactivos
- ✅ Roles semánticos (radiogroup, main)
- ✅ Descripciones para lectores de pantalla
- ✅ Navegación por teclado mejorada
- ✅ Meta tags descriptivos en HTML

#### Documentación
- ✅ README completamente reescrito con guía profesional
- ✅ JSDoc en todas las funciones principales
- ✅ Comentarios explicativos en código complejo
- ✅ Documentación de algoritmos y estructura del proyecto

#### Limpieza y Mantenibilidad
- ✅ Eliminado servicio Gemini (dependencia opcional removida)
- ✅ Removida dependencia `@google/genai` del package.json
- ✅ Limpieza de configuración de Vite
- ✅ Código más organizado y mantenible

### 📦 Dependencias

#### Removidas
- `@google/genai` - Servicio de IA removido

#### Mantenidas
- `react` ^19.2.1
- `react-dom` ^19.2.1
- `react-force-graph-3d` ^1.29.0
- `three` ^0.182.0
- `lucide-react` ^0.556.0

### 🐛 Correcciones

- Corregido manejo de nodos no encontrados
- Corregida validación de rutas inexistentes
- Mejorado manejo de estados de carga
- Corregidos problemas de tipos TypeScript

### 📝 Notas

Esta versión representa una refactorización completa del código con enfoque en:
- **Performance**: Algoritmos optimizados y memoización
- **Calidad**: TypeScript estricto y manejo de errores robusto
- **UX**: Mejor feedback visual y accesibilidad
- **Mantenibilidad**: Código limpio y bien documentado

---

## [1.0.0] - Versión Inicial

- Implementación inicial de PathFinder 3D
- Algoritmos Dijkstra y Bellman-Ford básicos
- Visualización 3D interactiva
- Modos de transporte (Vehículo y Peatonal)
- Modo paso a paso y modo instantáneo
