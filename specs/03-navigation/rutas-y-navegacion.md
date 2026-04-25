# Rutas y navegacion

## Router principal

Archivo: src/routes/RoutesFile.js

- Se usa HashRouter (definido en src/index.js).
- Ruta raiz redirige a /view/{defaultRoute}.
- Rutas hijas viven bajo /view.

## Modulos navegables

Mapeo actual en RoutesFile:

- notifications
- events
- inspections
- actions
- findings
- LegalMatriz
- permit_manager
- ambiental_permit
- sanctioning_processes

Componentes activos por ruta:

- /view/events -> src/features/tasks/Tasks.js
- /view/actions -> src/features/actions/Actions.js
- /view/LegalMatriz -> src/features/MessageCenterLegalMatriz.js
- /view/permit_manager -> src/features/permitManager/PermitManager.js
- /view/ambiental_permit -> src/features/ambientalPermit/AmbientalPermit.js (placeholder)
- /view/sanctioning_processes -> src/features/sanctioningProcesses/SanctioningProcesses.js

Estado de modulos:

- `ambiental_permit` es placeholder mientras se define su funcionalidad completa.
- Se renderiza cuando `modules.ambiental_permit.enabled = true`.

## Origen de permisos y visibilidad

- src/config/generalConfig.js construye modulePermissions con base en:
  - platformConfig.modules (respuesta backend)
  - idioma activo (title_es/title_en)
  - overrides de subdominio en src/config/modulesConfig.js

## Seleccion de ruta por defecto

- Si notifications esta visible: default = /view/notifications
- Si notifications no esta visible: se usa el primer modulo visible.

## Navegacion por grupos en el header

El header ya no renderiza tabs planos por modulo. Ahora usa grupos definidos en `modules_group`:

- Cada grupo habilitado (`enable: true`) aparece como boton-tab en la barra superior.
- El orden es ascendente por `order`.
- Al hacer click en un grupo se abre un Menu desplegable con los modulos del grupo.
- Solo aparecen en el menu los modulos con `enabled: true` en `modules.[clave]`.
- Al seleccionar un modulo del menu se navega a `/view/[key]`.
- El grupo activo (que contiene el modulo en URL actual) se resalta con subrayado azul `#19aabb`.
- La campana de notificaciones se mantiene como boton separado a la derecha, fuera de los grupos.

Datos de grupos: `moduleGroups` en contexto `GlobalConfig`.
Funcion que los genera: `getModuleGroupsFromPlatformConfig` en `src/config/generalConfig.js`.

## Layout de navegacion

- src/components/TheLayout.js: shell principal
- src/components/TheLayoutNavbar.js: sidebar
- src/components/TheLayoutHeader.js: grupos de modulos con dropdown y acciones de cabecera

## Detalles UX relevantes

- TheLayout hace polling cada 5 minutos para nuevos mensajes (si la pestaña esta visible).
- Header usa polling corto para no leidos y escucha evento custom dashboard-message-created.
- BaseTab recibe items desde modulePermissions.
- Los DoughnutChart del sidebar izquierdo solo se muestran si el modulo esta habilitado en platformConfig (modules.*.enabled = true).
- Sidebar izquierdo: para `permit_manager` y `sanctioning_processes` se muestra boton navegable sin depender de estadisticas cargadas.
- Al hacer click en un DoughnutChart del sidebar, la app navega al modulo correspondiente:
  - legals -> /view/LegalMatriz
  - tasks -> /view/events
  - actions -> /view/actions
  - permit_manager -> /view/permit_manager
  - sanctioning_processes -> /view/sanctioning_processes
- En el dropdown de usuario del header:
  - BackToDashboard redirige a {apiUrl}dashboard
  - SignOut redirige a {apiUrl}login-express/
  - {apiUrl} se obtiene de runtime config (public/config.json -> window.__APP_CONFIG__.apiUrl)
- En el sidebar izquierdo:
  - El texto de ambiente (ej: DEV) se toma de platformConfig.enviroment (respuesta de get_configuration_amatia_express).
  - Al hacer click en el logo de Amatia, se redirige a {origin}{baseName}/#/view/notifications.
  - {baseName} se obtiene de runtime config (config.json -> baseName).

## Filtros en notifications

- El modulo notifications usa el filtro definido en src/config/filterConfig.js > notifications.
- Filtros activos:
  - filter_keywords
  - filter_module_string
  - filter_start_date
  - filter_end_date
- Estos valores se leen desde Redux (filter.modules.notifications.filterData) y se envian por POST en los tabs:
  - importantes
  - no leidos
  - leidos
- `filter_module_string` se renderiza como dropdown en el panel izquierdo y sus opciones se generan en frontend segun modulos habilitados en `platformConfig.modules.*.enabled`:
  - legal_matrix.enabled = true -> LegalMatriz (Matriz legal)
  - task.enabled = true -> tasks (Tareas)
  - actions.enabled = true -> actions (Acciones)
- Este filtro es frontend-only: no se envia al backend en la consulta de listas.
- La visibilidad de `filter_module_string` se controla por variable de estado local (default `false`).
- La separacion de filtros se hace en `MessageCenterNotifications`:
  - filtros API (keywords/fecha) para payload backend.
  - `filter_module_string` como selector frontend-only.
- El filtrado se aplica localmente sobre los resultados cargados de cada tab (Important/Unread/Read).
- La comparacion de `filter_module_string` contra `message.module_string` se hace normalizada (`trim` + `toLowerCase`).
- La persistencia visual de seleccion del dropdown se resuelve en frontend con comparacion por `value` en el componente de autocomplete.
- Etiquetas del dropdown de modulo son bilingues y dependen del idioma activo:
  - es: Matriz legal, Tareas, Acciones
  - en: Legal Matrix, Tasks, Actions
- Nota: por ahora el filtro de modulo en notifications mantiene solo legal_matrix, task y actions.
- Si un modulo esta deshabilitado (`enabled = false`), no aparece como opcion en el filtro.
- Si se pulsa ClearFilters en BaseFilter para notifications:
  - se limpia filterData del modulo
  - los tabs resetean paginacion y vuelven a consultar pagina 1
  - se limpia la seleccion de mensajes en MessageCenterNotifications
- En notifications, los tabs Important/Unread/Read consumen filtros del modulo notifications (Redux filter.modules.notifications.filterData):
  - filter_keywords
  - filter_start_date
  - filter_end_date
- El boton ClearFilters de BaseFilter ejecuta removeAllFilters({ module: 'notifications' }) y dispara recarga de tabs por cambio de filterData.

Resumen rapido de destino de filtros en notifications:

| Filtro | Backend | Frontend |
|---|---|---|
| `filter_keywords` | Si | No |
| `filter_start_date` | Si | No |
| `filter_end_date` | Si | No |
| `filter_module_string` | No | Si |

## Constantes de layout

- src/config/constants.js
  - headerHeight
  - navbarWidth
  - navbarCollapsedWidth
  - backgroundColor

## Navegacion interna de LegalMatriz (OptionsDrawer)

Archivos:

- src/features/MessageCenterLegalMatriz.js
- src/features/MessageCenterLegalMatriz/OptionsDrawer.js
- src/features/MessageCenterLegalMatriz/tabIds.js

Regla principal:

- La navegacion entre tabs del drawer usa identificadores estables (tabId), no indices numericos.
- Esto evita redirecciones incorrectas cuando hay tabs ocultos por permisos/features.

Tab IDs compartidos:

- create_legal_requirement
- regulatory_communications
- analysis_of_regulation
- articles
- compliance

Redirecciones desde la tabla de requerimientos:

- Columna comunications -> `/view/legal_comunications`
- Columna analysis_with_amatia -> analysis_of_regulation
- Columna articles -> articles
- Columna tasks:
  - Si `task_list` tiene elementos, se habilita boton para abrir tareas asociadas.
  - Navega a `/view/events` y establece `selectedTaskView = 'list'`.
  - Guarda en Redux:
    - `selected_legal_task_ids` con los `id_task` provenientes de `task_list`.
    - `selected_legal_requirement_id`.
    - `selected_legal_requirement_title`.
  - El filtro frontend por IDs aplica a vistas de tasks: lista, tabla y calendario.
  - En la parte superior de tasks se muestra etiqueta de contexto con cantidad + requisito (ID + titulo) y boton `X` para deshacer el filtro.

Notas de filtro frontend en tasks:

- `selected_legal_task_ids` es frontend-only.
- No se envia al backend de tasks.
- El backend sigue entregando la lista base y el recorte se realiza en cliente (`task.id` vs `selected_legal_task_ids`).

Contrato LegalMatriz -> LegalComunications:

- Al hacer click en la columna `comunications` de `src/features/MessageCenterLegalMatriz.js`, el frontend navega a `/view/legal_comunications`.
- Antes de navegar, persiste en Redux bajo `filter.modules.LegalMatriz.filterData`:
  - `requisito_actual`
  - `id_requisito_actual`
  - `selected_requisito_id`
  - `isSelected_requisito_id = true`
- `src/features/legalComunications/LegalComunicationsLedger.js` consume `id_requisito_actual` y ejecuta `POST /message_center_api/legal_api/get_request_from_legal` con `{ id_requisito }`.
- Si no existe `id_requisito_actual`, el modulo muestra estado vacio pidiendo seleccionar un requisito primero.

Reglas de visibilidad en UI (legal_matrix):

- Boton create_legal_requirement (SpeedDial): visible solo si permissions.create_requirement = true
- Tab create_legal_requirement: visible solo si permissions.create_article = true
- Columna analysis_with_amatia y tab analysis_of_regulation: visibles solo si features.analysis_ia = true
- Tab compliance: visible solo si features.compliance_view = true

## Filtros jerarquicos en LegalMatriz, actions y events

Regla general:

- Los modulos LegalMatriz, actions y events (tasks) usan el patron de filtros en cascada con useCascadingFilters.
- En ruteo real, este comportamiento vive en:
  - src/features/MessageCenterLegalMatriz.js
  - src/features/actions/Actions.js
  - src/features/tasks/Tasks.js
- El flujo de niveles es level1 -> level2 -> level3 -> level4 y level5 solo cuando enable_level5 es true.
- Al cambiar un nivel, se limpian automaticamente los niveles dependientes.

Origen de APIs por modulo:

- LegalMatriz y events (tasks): niveles desde tasklist_api (fetchTaskListLevel).
- actions: niveles desde Action_api/list_level1..list_level4.
- Este cambio de niveles aplica solo a actions; los otros modulos se mantienen igual.
- En actions, la aplicacion del filtro por nivel es en frontend sobre la tabla renderizada.

Persistencia en Redux:

- LegalMatriz: level1..level5
- events: level1..level5
- actions: id_level1..id_level4 (id_level5 reservado para compatibilidad futura)

Comportamiento de Clear Filters:

- Limpia niveles en estado local del componente.
- Limpia niveles en Redux (removeFilter por cada nivel).
- Reinicia opciones dependientes en UI (resetFilters del hook).

## Cambios recientes (2026):

### Navegación y Tabs en LegalMatriz

- Cuando se selecciona el botón de crear requerimiento (SpeedDial), el OptionsDrawer solo muestra la pestaña de "crear requisito" y oculta las demás tabs, para evitar confusión y mantener el foco en la creación.
- La lógica de tabs en OptionsDrawer ahora filtra dinámicamente los tabs según el contexto de apertura.
- El resto de la navegación entre tabs sigue usando identificadores estables (`tabId`), nunca índices numéricos, para evitar errores si hay tabs ocultos por permisos o contexto.

### Columna de tareas y redirección

- En la tabla de artículos y en la matriz legal, la columna "Tareas" muestra la cantidad de tareas asociadas y un botón para redirigir a la vista de tareas filtrada.
- Al hacer click en el botón de tareas, se navega a `/view/events` y se configuran en Redux los filtros:
  - `selectedTaskView = 'list'`
  - `selected_legal_task_ids = [id_task, ...]`
  - `selected_legal_requirement_id` y `selected_legal_requirement_title` (o equivalentes para artículos)
- El filtro de tareas asociadas es frontend-only: no se envía al backend, solo filtra la lista cargada en TasksListView y componentes relacionados.
- En la parte superior de la vista de tareas, se muestra un banner contextual con la cantidad de tareas filtradas, el texto "Tareas del requisito" o "Tareas del artículo", el ID y el título, y un botón para limpiar el filtro.

### Consistencia de filtros y navegación

- Antes de aplicar un filtro de redirección desde matriz legal o artículos, se limpian los valores previos en Redux para evitar estados inconsistentes.
- La lógica de navegación y filtrado es ahora idéntica entre matriz legal y artículos, diferenciando el origen para mostrar el banner correcto en tasks.

### Resumen de archivos afectados

- src/features/MessageCenterLegalMatriz.js
- src/features/MessageCenterLegalMatriz/OptionsDrawer.js
- src/features/articles/Articles.js
- src/features/tasks/TasksListView.js

> Ver también: specs/02-redux/guia-redux.md para detalles de contrato de filtros y banner contextual en tasks.
