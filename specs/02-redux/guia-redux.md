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

## Nota de contrato para actions

Para el modulo actions (ruta /view/actions):

- La consulta de tabla se basa en Action_api/get_actions_amatia_express.
- Los encabezados dinamicos se consultan con Action_api/dashboard_actions_table_headers_amatia_express.
- Los filtros por niveles se persisten en filter.modules.actions.filterData como id_level1..id_level4.
- Los niveles seleccionados se aplican como filtro cliente-side sobre actionList en frontend.
- En el submit de creacion/edicion, action_source se normaliza en el thunk (default hs_action) para garantizar consistencia de fuente.

Importante:

- Este ajuste aplica solo a actions.
- LegalMatriz y events mantienen su flujo de niveles actual.

## Nota de contrato LegalMatriz -> Tasks (task_list)

- Cuando `list_legals_amatia_express` devuelve `task_list` con datos, LegalMatriz habilita accion en columna `tasks` para navegar a tareas asociadas.
- La navegacion configura en Redux:
  - `filter.modules.task.filterData.selectedTaskView = 'list'`
  - `filter.modules.task.filterData.selected_legal_task_ids = [id_task, ...]`
  - `filter.modules.task.filterData.selected_legal_requirement_id = <id_requisito>`
  - `filter.modules.task.filterData.selected_legal_requirement_title = <nombre_requisito>`
- `selected_legal_task_ids` es frontend-only:
  - no se envia al backend de tasks;
  - se aplica en `TasksListView`, `TaskTableList` y calendario de `Tasks` para filtrar localmente los registros cargados.

Banner de contexto en tasks:

- Cuando el filtro por requisito esta activo, `Tasks` muestra una etiqueta superior con:
  - cantidad de tareas filtradas;
  - texto "Tareas del requisito";
  - ID y titulo del requisito.
- La etiqueta incluye boton `X` para limpiar:
  - `selected_legal_task_ids`
  - `selected_legal_requirement_id`
  - `selected_legal_requirement_title`

## Referencias

- src/store.js
- src/stores/platformConfigSlice.js
- src/hooks/usePlatformConfig.js
