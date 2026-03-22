# Estado Redux por modulo

Este documento lista las claves (reducer keys) registradas en src/store.js y su agrupacion funcional.

## Global

- filter
- globalData
- taskData
- moduleStatistics
- platformConfig

## Tasks / Events

- fetchTaskCounts
- fetchTaskListStatus
- fetchEventsList
- fetchTaskListLevel
- fetchListTaskNew
- fetchLogtaskList
- deleteLogtask
- getLogtaskDetails
- fetchListLevelExecutor
- fetchTaskTags
- fetchPhase
- fetchSubPhases
- fetchPMASList
- getPrograms
- getSubPrograms
- fetchProyectoAmbiental
- fetchProgramAmbiental
- fetchConvenioList
- fetchAlertList
- updateTaskDetails
- getSettings
- updateLogtaskDetails
- updateResponsibles
- getPositionUserList
- fetchContractorList
- fetchAdministratorsList
- getResponsibles
- saveTask
- getLogtaskComments

## Legal matrix

- fetchLegalCounts
- getLegalTree
- fetchSubGeovisor
- fetchListGeovisor
- getLegalDetails
- fetchRisksList
- fetchArticles

Nota: tambien existen archivos en src/stores/legal no registrados directamente en src/store.js para casos puntuales, utilitarios o legacy.

## Messages / Notifications

- dashboardMessage
- dashboardMessageUnread
- dashboardMessageRead
- dashboardMessageImportant
- fetchDashboardMessageDetails
- fetchDashboardMessageStatistics
- dashboardMessageStatistics
- updateMessage
- submitMessageData
- fetchMessageFormFields
- unreadMessages
- updateMessageFlag
- moduleNavigation

Notas funcionales de filtros en notifications:

- El selector `filter_module_string` vive en Redux dentro de `filter.modules.notifications.filterData`.
- Valores validos del selector: `LegalMatriz`, `tasks`, `actions`.
- Este filtro es frontend-only para las listas de mensajes:
	- no se envia en `FormData` al backend.
	- se aplica localmente en tabs Important/Unread/Read comparando con `message.module_string`.
- La comparacion se normaliza en frontend (`trim` + `toLowerCase`) para evitar fallas por espacios o variaciones de mayusculas/minusculas.

## Actions

- fetchTableColumns
- fetchActionFormFields
- fetchActionFormModel
- fetchActionComments
- editActionComments
- actionData
- submitActionForm
- getActionDetails
- getActionLogtask
- uploadCommentAttachments

Notas funcionales de filtros por nivel en actions:

- El estado de niveles vive en filter.modules.actions.filterData (id_level1..id_level4).
- Las opciones de niveles para actions se consultan contra Action_api/list_level1..list_level4.
- La tabla de actions se consulta con Action_api/get_actions_amatia_express y headers con Action_api/dashboard_actions_table_headers_amatia_express.
- El filtrado por id_level1..id_level4 se aplica en frontend sobre los registros cargados en la tabla de actions.

## Findings

- findings
- findingDetails
- findingsOptions
- findingsStats

## Mapa de carpetas en src/stores

- src/stores/actions
- src/stores/events
- src/stores/findings
- src/stores/legal
- src/stores/messages
- src/stores/tasks

## Recomendacion de lectura para IA

1. Leer src/store.js para ubicar claves reales.
2. Abrir carpeta del dominio en src/stores/{modulo}.
3. Revisar thunks createAsyncThunk para conocer endpoints.
4. Revisar componentes/hooks que hacen dispatch de esas acciones.
