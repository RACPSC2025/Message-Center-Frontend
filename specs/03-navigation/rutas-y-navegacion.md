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

## Origen de permisos y visibilidad

- src/config/generalConfig.js construye modulePermissions con base en:
  - platformConfig.modules (respuesta backend)
  - idioma activo (title_es/title_en)
  - overrides de subdominio en src/config/modulesConfig.js

## Seleccion de ruta por defecto

- Si notifications esta visible: default = /view/notifications
- Si notifications no esta visible: se usa el primer modulo visible.

## Layout de navegacion

- src/components/TheLayout.js: shell principal
- src/components/TheLayoutNavbar.js: sidebar
- src/components/TheLayoutHeader.js: tabs y acciones de cabecera

## Detalles UX relevantes

- TheLayout hace polling cada 5 minutos para nuevos mensajes (si la pestaña esta visible).
- Header usa polling corto para no leidos y escucha evento custom dashboard-message-created.
- BaseTab recibe items desde modulePermissions.

## Constantes de layout

- src/config/constants.js
  - headerHeight
  - navbarWidth
  - navbarCollapsedWidth
  - backgroundColor
