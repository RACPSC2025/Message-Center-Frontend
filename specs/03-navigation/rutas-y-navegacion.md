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
- Los DoughnutChart del sidebar izquierdo solo se muestran si el modulo esta habilitado en platformConfig (modules.*.enabled = true).
- Al hacer click en un DoughnutChart del sidebar, la app navega al modulo correspondiente:
  - legals -> /view/LegalMatriz
  - tasks -> /view/events
  - actions -> /view/actions
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
  - filter_start_date
  - filter_end_date
- Estos valores se leen desde Redux (filter.modules.notifications.filterData) y se envian por POST en los tabs:
  - importantes
  - no leidos
  - leidos
- Si se pulsa ClearFilters en BaseFilter para notifications:
  - se limpia filterData del modulo
  - los tabs resetean paginacion y vuelven a consultar pagina 1
  - se limpia la seleccion de mensajes en MessageCenterNotifications
- En notifications, los tabs Important/Unread/Read consumen filtros del modulo notifications (Redux filter.modules.notifications.filterData):
  - filter_keywords
  - filter_start_date
  - filter_end_date
- El boton ClearFilters de BaseFilter ejecuta removeAllFilters({ module: 'notifications' }) y dispara recarga de tabs por cambio de filterData.

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

- Columna comunications -> regulatory_communications
- Columna analysis_with_amatia -> analysis_of_regulation
- Columna articles -> articles

Reglas de visibilidad en UI (legal_matrix):

- Boton create_legal_requirement (SpeedDial): visible solo si permissions.create_requirement = true
- Tab create_legal_requirement: visible solo si permissions.create_article = true
- Columna analysis_with_amatia y tab analysis_of_regulation: visibles solo si features.analysis_ia = true
- Tab compliance: visible solo si features.compliance_view = true
