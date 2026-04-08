
# Tasks Report Dashboard (Tremor)

## Objetivo

Implementar un nuevo dashboard para la vista `report` del modulo de tareas usando Tremor, conectado a datos reales del API de tareas y respetando los filtros activos que ya usa la vista de listado.

## Ubicación de código

- `src/features/tasks/TaskReportTremor.js` (componente principal actual)

## Librerías usadas

- `@tremor/react` instalada con `pnpm add @tremor/react`

## Fuente de datos

### Endpoint principal

- `POST /tasklist_api/list_tasks_new_complete_amatia_express`

### Slice reutilizado

- `src/stores/tasks/fetchListTaskNewSlice.js`
- Thunk: `fetchListTaskNew`


`TaskReportTremor` dispara `dispatch(fetchListTaskNew({}))` al montar el componente y normaliza la respuesta para el dashboard.

Campos normalizados:

- `task_start_date` -> `start_date`
- `task_end_date` -> `end_date`
- `task_status` -> codigo normalizado (`1`, `2`, `3`, `4`)
- `progress` -> numero
- `tags` -> arreglo (si viene objeto se convierte con `Object.values`)
- `responsibles` y `reviewers` -> arreglo de nombres
- `logtask_list` -> arreglo

## Filtros aplicados

El dashboard replica la logica de filtros de `TasksListView` (frontend-only sobre la data cargada):

- `events.filter_keywords` (titulo de tarea)
- `events.filter_status` (estado normalizado)
- `events.filter_start_date`
- `events.filter_end_date`
- `events.filter_executor` (responsable)
- `events.filter_reviewer`
- `events.Etiquetas` (tag id)
- `events.sort_by` (A-Z, Z-A, newest, oldest)
- `task.selected_legal_task_ids` (filtro contextual desde LegalMatriz/Articles)

Notas:

- El filtro por fechas usa logica de solapamiento igual que la vista de lista.
- `selected_legal_task_ids` no se envia al backend, solo filtra localmente.

## Visualizaciones del dashboard

El dashboard renderiza con componentes Tremor y layout propio:

- KPIs:
  - Total de tareas filtradas
  - Ciclos activos
  - Progreso promedio
- Distribución por estado de tareas (Donut SVG, colores dinámicos)
- Distribución por estado de ciclos (Donut SVG, colores dinámicos)
- Tabla de tareas clave (con badges de tags y estado coloreado)

> **Nota:** El segmento de título y filtros (header/filtros superiores) se muestra solo si la variable de estado `showHeaderFilters` es `true` (por defecto es `false`).

## Estados y colores

- Los colores y etiquetas de estado se obtienen dinámicamente del catálogo de configuración de plataforma:
  - `platformConfig.data.modules.task.catalogs.status` (vía hook `useModuleCatalogs('task', 'status')`)
  - Se mapea por `numeric_code` (`1`, `2`, `3`, `4`)
  - Si no hay catálogo, se usan colores/etiquetas fallback (`#28a745`, `#348fe2`, `#ffc107`, `#dc3545`)
- Las etiquetas de estado en donuts y tabla usan primero el label del catálogo, luego traducción, luego fallback.

## Consistencia transversal del modulo tasks (2026)

Ademas del dashboard Tremor, el mismo contrato de estados y colores ya se aplica en otras vistas del modulo:

- `src/features/tasks/TasksListView.js`
  - filtros de estado y colores de UI por catalogo `task.status`.
  - estadisticas de ciclos por estado con conteo dinamico (`countsByStatus`), sin `if` hardcode por codigo.
- `src/features/tasks/TaskCyclesTable.js`
  - badge de progreso y label de estado por `taskStatusCatalog`.
  - visibilidad del label de estado controlada por estado local (`showStatusLabel`, default `false`).
- `src/components/TaskDoubleRingChart.js`
  - anillo interno/externo usando colores del dataset dinamico (`chartData`) cuando estan disponibles.
- `src/components/TasksCyclesDoughnutChart.js`
  - consumo preferente de `taskStatusData` y `cycleStatusData` generado en `useModuleData`.
  - fallback legacy para compatibilidad si aun no llega dataset dinamico.
- `src/features/MessageCenterEventsReport.js`
  - graficas ECharts de tareas y ciclos alimentadas por `task.status` (labels y colores dinamicos).

Resultado:

- La misma definicion de estados (codigo, nombre, color) se refleja de forma consistente en lista, tabla, cards y donuts.

## Comportamiento de carga

- Mientras `fetchListTaskNew` está en `loading`, se muestra `TheFullPageLoader`.
- Si no hay resultados con filtros activos, el dashboard muestra estados vacíos en listas/tabla.

## Relación con TaskListView

`TaskReportTremor` usa la misma base de datos que `TasksListView` y aplica los mismos criterios de filtrado para asegurar consistencia entre:

- vista lista
- vista tabla
- vista report

Esto evita discrepancias entre número de tareas, estados y subconjuntos filtrados.
