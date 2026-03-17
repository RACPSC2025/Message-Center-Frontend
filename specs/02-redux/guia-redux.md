# Guia Redux

## Vista general

El store principal se configura en src/store.js y registra reducers por dominio funcional.

Patron principal:

- createAsyncThunk para llamadas API
- createSlice para estado local de cada recurso
- shape comun en slices:
  - loading
  - data
  - error

## Slices base globales

- filter: filtros transversales por modulo
- globalData: datos globales (usuario, regiones, etc.)
- taskData: estado transversal de tareas
- moduleStatistics: estadisticas globales
- platformConfig: configuracion funcional del proyecto desde API

## Carpetas por dominio en src/stores

- actions/
- events/
- findings/
- legal/
- messages/
- tasks/

Cada carpeta contiene slices y thunks del dominio.

## Buenas practicas del proyecto

- Evitar acceder al estado con rutas fragiles sin optional chaining.
- Preferir hooks por dominio cuando existan (ej. usePlatformConfig).
- Mantener nombres de reducer key coherentes con nombre de slice en store.js.
- Reusar axiosInstance para heredar tokens, baseURL e interceptores.

## Arranque de configuracion funcional

Al iniciar rutas se dispara fetchPlatformConfig (src/stores/platformConfigSlice.js), y ese estado alimenta la navegacion de modulos en src/config/generalConfig.js.

## Referencias

- src/store.js
- src/stores/platformConfigSlice.js
- src/hooks/usePlatformConfig.js
