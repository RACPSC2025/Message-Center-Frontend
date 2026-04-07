# API integration, axios y endpoints

## Cliente HTTP base

Archivo: src/lib/axios.js

- Timeout: 600000 ms
- baseURL: window.__APP_CONFIG__.apiUrl (fallback REACT_APP_API_URL)
- Request interceptor agrega:
  - Auth-Token
  - System-Token
- Response interceptor maneja 401 con redirect_url cuando aplica.

## Tokens

Fuente:

- Desarrollo: LOCAL_AUTH_TOKEN y SYSTEM_TOKEN desde src/config/constants.js
- Produccion: storage.getToken() y storage.getSystemToken() desde src/utils/storage.js

## Proxy en desarrollo

Archivo: src/setupProxy.js

- Rutea /api -> REACT_APP_API_URL
- Util para evitar CORS en entorno local

## Patrones de endpoints

- /tasklist_api/*
- /message_center_api/*
- /message_center_api/legal_api/*
- /message_center_api/action_api/*

## Configuracion funcional del proyecto

Ver documento especializado:

- specs/get_configuration_amatia_express.md

Endpoint usado:

- GET /message_center_api/legal_api/get_configuration_amatia_express

Uso adicional de apiUrl en frontend:

- Redirecciones del dropdown de usuario se construyen desde getAPIUrl() (runtime config):
  - {apiUrl}dashboard
  - {apiUrl}login-express/

## Convencion de payload

Muchos endpoints *_amatia_express trabajan con FormData para operaciones create/update con adjuntos o metadatos.

## Contrato actualizado: list_legals_amatia_express

Endpoint:

- GET /message_center_api/legal_api/list_legals_amatia_express

Cambio de contrato (2026-03):

- Cada elemento de `data[]` puede incluir `task_list`.
- `task_list` es un array (puede venir vacio).
- Cuando tiene datos, cada item de `task_list` contiene al menos:
  - `id`
  - `id_requisito`
  - `id_tipo_requisito`
  - `id_task`
  - `created`
  - `modified`
  - `deleted`

Regla de frontend implementada:

- Normalizar `task_list` como array en el thunk (`fetchListLegals`), incluso si el backend no lo envia o lo envia nulo.
- En `MessageCenterLegalMatriz`, mantener `tasks` desde `total_tareas` cuando exista; usar fallback `task_list.length` si `total_tareas` no llega.

## Eventos custom para sincronizacion UI

Tras ciertas operaciones de escritura, se dispara:

- window.dispatchEvent(new CustomEvent('dashboard-message-created'))

Esto permite refrescar contadores sin acoplar componentes.

## Endpoint de niveles para filtros en cascada

### LegalMatriz y events (tasks)

Endpoint usado:

- fetchTaskListLevel (slice: src/stores/tasks/fetchtaskListLevelSlice.js)

Componentes que consumen este endpoint en UI activa:

- src/features/MessageCenterLegalMatriz.js
- src/features/tasks/Tasks.js

Patron de request:

- payload base: { level }
- payload con dependencia: { level, formData }
- formData incluye IDs de niveles previos (ej: id_level1, id_level2, ...)

Patron de response esperado:

- response.payload.data.messages = 'Success'
- response.payload.data.data = array de opciones

Mapeo de opciones en frontend:

- { value: item.value, label: item.label }

Nota events (Tasks.js):

- Los niveles seleccionados se mapean adicionalmente a filtros del endpoint de tareas:
  - level1 -> filter_region
  - level2 -> filter_country
  - level3 -> filter_business
  - level4 -> filter_plant

### Actions (ajuste por contrato API)

Base path de niveles (Action_api):

- POST /message_center_api/Action_api/list_level1
- POST /message_center_api/Action_api/list_level2
- POST /message_center_api/Action_api/list_level3
- POST /message_center_api/Action_api/list_level4

Reglas:

- Este ajuste aplica solo al modulo actions.
- LegalMatriz y events mantienen su flujo actual de niveles.
- Los filtros en actions se persisten como id_level1..id_level4 (id_level5 si aplica por configuracion futura).
- En actions, los filtros de nivel se aplican en frontend sobre la data ya cargada en tabla.
- Por esta razon, id_level1..id_level4 no se envian en el request de get_actions_amatia_express.

## Contrato de tabla de actions (actualizado)

Consulta de informacion de tabla:

- POST /message_center_api/Action_api/get_actions_amatia_express

Consulta de encabezados dinamicos:

- POST /message_center_api/Action_api/dashboard_actions_table_headers_amatia_express

Consideraciones funcionales:

- Los datos de actions ya incluyen campos de nivel (level_1..level_4 y nombres de nivel) segun contrato.
- Al seleccionar filtros por nivel en actions, esos filtros impactan el render de la tabla por filtrado cliente-side.
- get_actions_amatia_express sigue siendo la fuente de datos base para la tabla.
- Referencia de contrato: contracts.md (documento adjunto de Action_api).

## Contrato de creacion de actions

Endpoint:

- POST /message_center_api/Action_api/action_form_submit_amatia_express

Reglas de action_source:

- Campo principal: action_source
- Valores: hs_action | all_action_plan
- Si no llega action_source, se usa hs_action por defecto
- module_string_id no se usa para decidir tabla destino en este endpoint

Implementacion frontend:

- src/features/actions/Actions.js envia action_source con default hs_action
- src/stores/actions/submitActionFormSlice.js refuerza action_source=hs_action cuando el payload no lo trae
- src/stores/actions/submitActionFormSlice.js normaliza aliases de payload para evitar desalineaciones con el contrato PHP:
  - `module_string_id`/`action_table` -> `action_source`
  - `reviewer_person` -> `reviewer_person_id`
  - `responsibe_person`/`responsible_person` -> `responsible_person_id` (all_action_plan)
  - `id_region`/`id_planta`/`level3`/`level4` -> `level_1`/`level_2`/`level_3`/`level_4`
  - `hs_cause` -> `hs_causes`

Referencia completa del contrato:

- specs/04-api-integracion/actions-module/contracts.md
