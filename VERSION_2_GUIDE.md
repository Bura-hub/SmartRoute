# Guía para Publicar Versión 2.0.0

Esta guía te ayudará a subir la versión 2.0.0 a GitHub sin reemplazar la versión actual.

## Opción 1: Crear Tag de Versión (Recomendado)

Esta opción mantiene todo en la rama `main` pero crea un tag para la versión 2.0.0:

```bash
# 1. Agregar todos los cambios
git add .

# 2. Hacer commit con mensaje descriptivo
git commit -m "feat: Versión 2.0.0 - Optimizaciones profesionales y mejoras de UX

- Implementada Priority Queue para Dijkstra (O((V+E) log V))
- Eliminados todos los tipos 'any' - TypeScript estricto
- Agregado manejo robusto de errores
- Optimización de React con memoización
- Mejoras de UX y accesibilidad
- Documentación completa actualizada
- Removido servicio Gemini"

# 3. Crear tag para la versión 2.0.0
git tag -a v2.0.0 -m "Versión 2.0.0 - Optimizaciones profesionales"

# 4. Subir cambios y tags
git push origin main
git push origin v2.0.0
```

## Opción 2: Crear Nueva Rama para v2

Si prefieres mantener la versión 1 en `main` y crear una rama separada:

```bash
# 1. Crear nueva rama para v2
git checkout -b release/v2.0.0

# 2. Agregar todos los cambios
git add .

# 3. Hacer commit
git commit -m "feat: Versión 2.0.0 - Optimizaciones profesionales y mejoras de UX"

# 4. Crear tag
git tag -a v2.0.0 -m "Versión 2.0.0 - Optimizaciones profesionales"

# 5. Subir rama y tag
git push origin release/v2.0.0
git push origin v2.0.0
```

## Opción 3: Crear Release en GitHub

Después de hacer push, puedes crear un Release en GitHub:

1. Ve a tu repositorio: https://github.com/Bura-hub/SmartRoute
2. Click en "Releases" → "Create a new release"
3. Selecciona el tag `v2.0.0`
4. Título: "Versión 2.0.0 - Optimizaciones Profesionales"
5. Descripción: Copia el contenido del CHANGELOG.md para la versión 2.0.0
6. Marca como "Latest release" si quieres que sea la versión principal
7. Publica el release

## Verificación

Después de hacer push, verifica:

```bash
# Ver tags
git tag --list

# Ver ramas remotas
git branch -r

# Ver último commit
git log --oneline -1
```

## Notas Importantes

- ✅ La versión 1.0.0 seguirá disponible en el historial de Git
- ✅ Los tags permiten acceder a versiones específicas fácilmente
- ✅ Puedes crear múltiples releases en GitHub
- ✅ Los usuarios pueden elegir qué versión usar

## Comandos Rápidos (Opción 1 - Recomendada)

```bash
cd pathfinder-3d---city-map
git add .
git commit -m "feat: Versión 2.0.0 - Optimizaciones profesionales"
git tag -a v2.0.0 -m "Versión 2.0.0"
git push origin main
git push origin v2.0.0
```

¡Listo! Tu versión 2.0.0 estará disponible sin afectar la versión anterior.
