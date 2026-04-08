# Actions Report Dashboard (Tremor)

## Objetivo

Documentar el dashboard de la vista `report` del modulo de acciones, su fuente de datos y la relacion con la vista de tabla/listado del modulo.

## Ubicacion de codigo

- `src/features/actions/ActionsReportTremos.js` (componente principal del dashboard)
- `src/features/actions/Actions.js` (selector de vista `table` / `report` y filtros)

## Fuente de informacion

### Endpoint principal de acciones

- `POST /message_center_api/action_api/get_actions_amatia_express`

### Endpoint de conteo

- `POST /message_center_api/action_api/get_action_counts`

### Slice / thunks reutilizados

- `src/stores/actions/fetchActionSlice.js`
- Thunks: `fetchActionList`, `fetchActionCount`

### Flujo de carga de datos

1. `Actions.js` arma `FormData` desde filtros activos (`filter.modules.actions.filterData`).
2. `Actions.js` ejecuta `fetchActionList(formData)` y `fetchActionCount(formData)`.
3. `Actions.js` aplica filtrado adicional frontend (`filteredActions`) para campos no confiables en backend:
   - `id_level1..id_level4`
   - `filter_executor`
   - `filter_reviewer`
4. `ActionsReportTremos` recibe `filteredActions` por props y calcula KPIs / series.

## Fuente de estados, nombres y colores

Los estados del dashboard se obtienen del catalogo de configuracion de plataforma (no hardcodeados):

- `platformConfig.data.modules.actions.catalogs.status`
- Hook usado: `useModuleCatalogs('actions', 'status')`
- Mapeo robusto por codigo: `numeric_code`, `value_number`, `value` o `code`
- Mapeo robusto de color: `color` o `color_code`

Fallback solamente si no existe catalogo en configuracion:

- `1`: `#2e7d32`
- `2`: `#0288d1`
- `3`: `#f9a825`
- `4`: `#c62828`

Consumo adicional en estadisticas globales y navbar:

- `src/hooks/useModuleData.js` construye `actionStatusData` dinamico por catalogo.
- `src/components/TheLayoutNavbar.js` usa `actionStatusData` cuando existe para alimentar el donut lateral.
- `src/components/StatusDoughnutChartNavbar.js` prioriza el color del dataset dinamico antes de fallback.

## Normalizacion de datos

`ActionsReportTremos` normaliza los campos recibidos para evitar variaciones del API:

- `action_id | id` -> `id`
- `action_description | action_title | title` -> `title`
- `action_status | status` -> `statusCode` normalizado
- `responsible_person_name | responsable_name | executor_name | responsible_name` -> `responsible`
- `reviewer_person_name | reviewer_name` -> `reviewer`
- `action_start_date | start_date` -> `startDate`
- `action_closing_date | action_real_closing_date | end_date` -> `endDate`

## Visualizaciones incluidas

- KPI: total de acciones filtradas
- KPI: acciones activas (en progreso + abiertas)
- KPI: progreso promedio
- Donut 1: distribucion por estado (en progreso, abierta, cerrada)
- Donut 2: cumplimiento (cerradas vs vencidas)
- Tabla de acciones clave (subset ordenado por fecha de cierre)

## Comportamiento UI

- El segmento superior de titulo/filtros del dashboard usa `showHeaderFilters` y por defecto esta en `false`.
- El cambio de vista `table/report` se maneja en `Actions.js` con tabs visuales alineados a la barra de filtros.
- El toggle `table/report` replica el comportamiento visual del modulo Tasks para mantener consistencia UX entre modulos.
- En `src/components/StatusDoughnutChart.js` se mantuvo la composicion visual original del donut (leyenda embebida desactivada) para evitar rompimiento de layout; labels dinamicos se muestran via tooltip/dataset.

## Consistencia de filtros y niveles

- El dashboard y la tabla consumen exactamente el mismo dataset (`filteredActions`) luego de aplicar filtros activos.
- Los filtros de niveles (`id_level1..id_level4`) y el formulario de creacion/edicion usan la misma logica de carga de opciones (`actionLevelService.js`) y los mismos endpoints `Action_api/list_level{1..4}`.
- Solo `level_1` es obligatorio en el formulario; `level_2..level_4` son opcionales.

## Notas de robustez recientes

- Se aplico deep clone del modelo/campos de formulario antes de mutaciones para evitar errores runtime por objetos readonly.
- Se ajusto la actualizacion de estado de niveles para que sea atomica y no pierda la seleccion del usuario.
- Se corrigio el flujo de submit para evitar referencias a variables no definidas durante guardado.

## Relacion con la vista de tabla

La vista `report` usa exactamente el mismo conjunto de datos filtrados (`filteredActions`) que consume `ActionTable`, para mantener consistencia en:

- total mostrado
- distribucion por estados
- subconjunto de registros visibles

## Referencias cruzadas

- `specs/get_configuration_amatia_express.md`
- `specs/04-api-integracion/get_configuration_amatia_express.md`
- `specs/04-api-integracion/actions-module/contracts.md`
