# Configuracion de plataforma: get_configuration_amatia_express

Este documento explica como se obtiene, guarda y consume la configuracion global del proyecto.

## Objetivo

Al iniciar la aplicacion se consulta el endpoint:

- GET /message_center_api/legal_api/get_configuration_amatia_express

La respuesta esperada tiene estructura:

- status
- messages
- configuration

La propiedad configuration contiene version, environment y modules con permisos, features y catalogos por modulo.

Nota:

- El backend retorna el campo enviroment (con esa escritura) y se usa para mostrar el ambiente en el sidebar (ej: DEV).

## Dónde se guarda en Redux

Archivo:

- src/stores/platformConfigSlice.js

Estado del slice:

- loading: estado de carga
- data: configuracion activa (fallback inicial desde src/config/defaultConfig.json)
- error: error de consulta
- fetchedFromApi: indica si vino del backend

Flujo de carga:

1. fetchPlatformConfig llama al endpoint /message_center_api/legal_api/get_configuration_amatia_express.
2. Si existe response.data.configuration, se guarda en state.platformConfig.data.
3. Si la respuesta viene vacia o falla, se conserva defaultConfig.json como fallback.

## Cuándo se consulta

Archivo:

- src/routes/RoutesFile.js

En montaje del componente de rutas se despacha:

- dispatch(fetchPlatformConfiguration())

Con esto la consulta ocurre al iniciar la aplicacion.

## Cómo se usa para visibilidad y titulos de modulos

Archivo:

- src/config/generalConfig.js

Se construye modulePermissions dinamicamente a partir de state.platformConfig.data.modules:

- legal_matrix -> ruta LegalMatriz
- task -> ruta events
- findings -> ruta findings
- actions -> ruta actions
- permit_manager -> ruta permit_manager
- sanctioning_processes -> ruta sanctioning_processes

Reglas aplicadas:

- visibility se toma de modules.[modulo].enabled
- label usa title_es o title_en segun idioma actual
- si no hay titulo en API, usa fallback de etiqueta local
- notifications se mantiene como modulo de navegacion del sistema
- enviroment se usa para renderizar la etiqueta de ambiente en el sidebar izquierdo

Con la nueva respuesta de configuracion, los modulos `permit_manager` y `sanctioning_processes` se deben renderizar como tabs de navegacion cuando `enabled = true`.
En fase inicial pueden apuntar a vistas placeholder (espacio en blanco) mientras se define su funcionalidad completa.

Mapeo implementado actual:

- `permit_manager` -> `/view/permit_manager` -> `src/features/permitManager/PermitManager.js`
- `sanctioning_processes` -> `/view/sanctioning_processes` -> `src/features/sanctioningProcesses/SanctioningProcesses.js`

Uso adicional en filtros de notifications:

- `modules.legal_matrix.enabled`, `modules.task.enabled` y `modules.actions.enabled` controlan que opciones se muestran en el filtro `filter_module_string` del panel izquierdo de notifications.
- Si `enabled = false`, la categoria no se ofrece en el filtro.

## Idioma de los titulos

El idioma activo se toma del provider de lenguaje y se pasa a getGlobalConfiguration.

- language = es -> usa title_es
- language = en -> usa title_en

## Consumo facil desde hooks

Archivo:

- src/hooks/usePlatformConfig.js

Hooks disponibles:

- usePlatformConfig: retorna toda la configuracion
- useIsModuleEnabled(moduleName)
- useHasPermission(moduleName, permission)
- useModuleFeature(moduleName, featurePath)
- useModuleCatalogs(moduleName, catalogName)
- useModuleInfo(moduleName)

Notas de robustez:

- Si features o catalogs llegan como arreglo vacio, los hooks retornan null o {} para evitar errores de acceso.
- useModuleInfo incluye title_es y title_en para consumo directo en UI.

## Ejemplos rapidos

Verificar permiso:

useHasPermission('task', 'create_task')

Leer catalogo status:

useModuleCatalogs('actions', 'status')

Validar si modulo esta habilitado:

useIsModuleEnabled('legal_matrix')

## Patron recomendado para estados, colores y labels en charts

Para evitar hardcodes y desalineaciones entre modulos, la UI usa catalogos de configuracion como fuente de verdad.

Catalogos clave:

- `modules.task.catalogs.status` para estados de tareas y ciclos
- `modules.actions.catalogs.status` para estados de acciones
- `modules.task.catalogs.task_type` para tipo de tarea (`activity_type`)

Reglas implementadas en frontend:

1. Normalizar codigo de estado con `normalizeStatusCode` antes de comparar.
2. Resolver label/color por `numeric_code` desde catalogo.
3. Si el catalogo no existe, usar fallback local para no romper la UI.
4. Reutilizar el mismo mapeo en lista, tabla, tarjetas y graficas para mantener consistencia.

Componentes y hooks donde aplica:

- `src/hooks/useModuleData.js`
	- `tasks`: expone `taskStatusData` y `cycleStatusData` dinamicos + campos legacy (`openTasks`, `completedTasks`, etc.)
	- `actions`: expone `actionStatusData` dinamico + campos legacy (`openActions`, `closedActions`, etc.)
- `src/components/TasksCyclesDoughnutChart.js`: prioriza dataset dinamico y mantiene fallback legacy.
- `src/components/StatusDoughnutChart.js` y `src/components/StatusDoughnutChartNavbar.js`: priorizan color/label dinamicos sin romper layout visual existente.
- `src/features/tasks/TasksListView.js`: usa catalogos para filtros, leyenda, iconografia por tipo, estadisticas de estados y colores.
- `src/features/tasks/TaskCyclesTable.js`: badge y label de estado por catalogo en columna de progreso.
- `src/features/MessageCenterEventsReport.js`: graficas ECharts de tareas/ciclos por catalogo y colores dinamicos.

Beneficio:

- Cambios de estados/nombres/colores en backend se reflejan en frontend sin tocar codigo de presentacion.

## Reglas de UI para legal_matrix (MessageCenterLegalMatriz)

Archivos frontend relacionados:

- src/features/MessageCenterLegalMatriz.js
- src/features/MessageCenterLegalMatriz/OptionsDrawer.js
- src/features/MessageCenterLegalMatriz/tabIds.js
- src/features/articles/Articles.js

Permisos usados desde modules.legal_matrix.permissions:

- create_requirement
	- controla visibilidad del boton SpeedDial create_legal_requirement en la grilla principal.
- create_article
	- controla visibilidad del tab create_legal_requirement dentro de OptionsDrawer.
	- controla visibilidad del boton Add_articles (SpeedDial) dentro del tab articles.

Features usadas desde modules.legal_matrix.features:

- analysis_ia
	- controla visibilidad de la columna analysis_with_amatia en la tabla.
	- controla visibilidad del tab analysis_of_regulation en OptionsDrawer.
- compliance_view
	- controla visibilidad del tab compliance en OptionsDrawer.

Nota de navegacion:

- La redireccion interna de OptionsDrawer se hace con tabId (string) centralizado en src/features/MessageCenterLegalMatriz/tabIds.js.
- No se deben usar indices numericos para abrir tabs, porque los tabs visibles cambian segun permisos/features.

## Nota de compilado

La carpeta specs esta en la raiz del workspace y no hace parte del bundle de React (pnpm build), ya que el compilado toma codigo desde src y activos desde public.

## Nota de contrato API para actions

Este documento describe configuracion de plataforma (permisos/features), no contratos de datos.

Para el modulo actions, el contrato de datos y filtros por nivel queda asi:

- Niveles: Action_api/list_level1..list_level4
- Tabla: Action_api/get_actions_amatia_express
- Encabezados: Action_api/dashboard_actions_table_headers_amatia_express

Alcance:

- Este ajuste aplica solo al modulo actions.
- LegalMatriz y events mantienen su flujo actual de niveles.
