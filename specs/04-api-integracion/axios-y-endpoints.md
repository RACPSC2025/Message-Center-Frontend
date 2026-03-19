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

## Eventos custom para sincronizacion UI

Tras ciertas operaciones de escritura, se dispara:

- window.dispatchEvent(new CustomEvent('dashboard-message-created'))

Esto permite refrescar contadores sin acoplar componentes.

## Endpoint de niveles para filtros en cascada

Endpoint usado por LegalMatriz, actions y events:

- fetchTaskListLevel (slice: src/stores/tasks/fetchtaskListLevelSlice.js)

Componentes que consumen este endpoint en UI activa:

- src/features/MessageCenterLegalMatriz.js
- src/features/actions/Actions.js
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

Nota:

- En actions se persisten filtros como id_levelN.
- En LegalMatriz y events se persisten como levelN y se usan para construir filtros API del modulo.
- En events (Tasks.js), los niveles seleccionados se mapean adicionalmente a filtros del endpoint de tareas:
  - level1 -> filter_region
  - level2 -> filter_country
  - level3 -> filter_business
  - level4 -> filter_plant
