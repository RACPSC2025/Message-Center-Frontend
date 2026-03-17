# Inicio de la app y runtime config

## Flujo de inicio

1. index.html carga el bundle.
2. src/index.js crea root y muestra un loader temporal.
3. Se ejecuta loadRuntimeConfig() desde src/config/runtimeConfig.js.
4. Cuando termina, React se monta con:
   - ApolloProvider
   - Provider (Redux)
   - HashRouter
5. App renderiza ThemeProvider + RoutesFile.

## Runtime config (sin recompilar)

Archivo: src/config/runtimeConfig.js

- Fuente principal: public/config.json
- Campos esperados:
  - apiUrl
  - baseName
  - environment
  - version
- Se guarda en: window.__APP_CONFIG__ (Object.freeze)
- Si falla la carga:
  - fallback a variables de entorno REACT_APP_*

## Razones de este enfoque

- Permite cambiar URL/API/env sin nuevo build.
- Mantiene un punto unico de verdad para config en runtime.

## Donde se consume

- src/lib/axios.js: baseURL por request
- src/config/constants.js: helpers getAPIUrl/getBaseName/getEnvironmentName

## Archivos de referencia

- src/index.js
- src/config/runtimeConfig.js
- public/config.json
- public/config.development.json
- public/config.production.json
