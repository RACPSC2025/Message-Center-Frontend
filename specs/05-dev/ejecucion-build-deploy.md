# Ejecucion, build y despliegue

## Requisitos

- Node.js compatible con react-scripts 5
- npm o pnpm disponible

## Comandos principales

Desde package.json:

- start: react-scripts start
- build: react-scripts build && npm run copy-config
- copy-config: node scripts/copy-config.js
- test: react-scripts test
- postinstall: copia pdf.worker.min.js a public/static/js/pdf.worker.min.js

## Flujos recomendados

### Desarrollo local

- npm install
- npm start

Alternativa si el equipo usa pnpm:

- pnpm install
- pnpm start

### Build de produccion

- npm run build

Alternativa:

- pnpm run build

## Que hace copy-config

Script: scripts/copy-config.js

Copia archivos config.*.json desde public a build para que el runtime config siga funcionando en despliegue.

## Archivos de configuracion runtime

- public/config.json
- public/config.development.json
- public/config.production.json

## Nota para IA y desarrollo

Si hay comportamientos distintos por entorno, validar primero el contenido de public/config.json y luego window.__APP_CONFIG__ en runtime.
