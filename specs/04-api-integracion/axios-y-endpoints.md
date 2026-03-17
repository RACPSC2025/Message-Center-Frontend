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

## Convencion de payload

Muchos endpoints *_amatia_express trabajan con FormData para operaciones create/update con adjuntos o metadatos.

## Eventos custom para sincronizacion UI

Tras ciertas operaciones de escritura, se dispara:

- window.dispatchEvent(new CustomEvent('dashboard-message-created'))

Esto permite refrescar contadores sin acoplar componentes.
