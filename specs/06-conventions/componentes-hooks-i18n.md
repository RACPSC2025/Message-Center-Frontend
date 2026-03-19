# Convenciones: componentes, hooks e i18n

## Componentes

## Base components

Ubicacion: src/components

Convencion: prefijo Base* para componentes reutilizables y agnosticos al dominio.

Ejemplos:

- BaseFilter
- BaseSortPopper
- BaseFormControl
- BaseFeaturePageLayout
- BaseEmptyState
- BaseTab

## Layout components

Convencion: prefijo The* para estructura principal unica.

- TheLayout
- TheLayoutNavbar
- TheLayoutHeader
- TheFullPageLoader

## Feature components

Ubicacion: src/features

Convencion de nombres por dominio (MessageCenter*, tasks/*, actions/*, findings/*).

## Hooks

Ubicacion: src/hooks

Hooks relevantes:

- usePageVisibility
- useUnreadMessagesPolling
- useModuleNavigation
- useModuleData
- useCascadingFilters
- useMessageCreatedListener
- useInterSectionObserver
- usePlatformConfig

## Internacionalizacion

Archivos:

- src/lib/i18n.js
- src/providers/languageProvider.js

Reglas:

- Idioma por defecto: es
- Cambio de idioma desde header (EN/ES)
- dayjs locale sincronizado al idioma
- En UI se recomienda usar t('key') para texto traducible

## Configuracion de modulos por idioma

La navegacion de modulos usa titulos dinamicos desde backend (title_es/title_en) cuando vienen en platformConfig.

Implementacion:

- src/config/generalConfig.js
- src/routes/RoutesFile.js
- src/components/BaseTab.js

## Recomendaciones para nuevas features

1. Crear componentes en src/features/{modulo} con nombre descriptivo.
2. Crear slices en src/stores/{modulo}.
3. Registrar reducer key en src/store.js.
4. Agregar ruta en src/routes/RoutesFile.js (idealmente lazy).
5. Si aplica, integrar filtros en src/config/filterConfig.js y filterSlice.
6. Documentar comportamiento en specs.

## Convencion de tabs dinamicos por configuracion

Cuando un drawer o vista tenga tabs condicionados por permisos/features:

- Definir IDs en un archivo compartido de constantes.
	- Ejemplo: src/features/MessageCenterLegalMatriz/tabIds.js
- Usar esos IDs para redireccionar vistas (setActiveTabId('...')) en vez de indices numericos.
- Resolver el tab activo visible con fallback al primer tab disponible.
- Leer permisos/features con hooks de plataforma:
	- useHasPermission(module, permission)
	- useModuleFeature(module, featurePath)

Caso implementado:

- src/features/MessageCenterLegalMatriz.js
- src/features/MessageCenterLegalMatriz/OptionsDrawer.js
- src/features/articles/Articles.js

Reglas aplicadas:

- permissions.create_requirement: boton create_legal_requirement en SpeedDial
- permissions.create_article: tab create_legal_requirement en OptionsDrawer
- permissions.create_article: boton Add_articles en SpeedDial del componente Articles
- features.analysis_ia: columna analysis_with_amatia y tab analysis_of_regulation
- features.compliance_view: tab compliance

## Convencion de filtros jerarquicos en cascada

Patron recomendado para filtros de organizacion por niveles:

- Hook base: useCascadingFilters
- Carga de opciones por nivel por modulo:
	- LegalMatriz y events (tasks): fetchTaskListLevel
	- actions: Action_api/list_level1..list_level4
- Fallback de niveles visibles: level1..level4 y level5 solo cuando el flag enable_level5 sea true
- Limpieza total: resetFilters() + removeFilter en Redux para cada nivel

Modulos que usan este patron:

- src/features/MessageCenterLegalMatriz.js
- src/features/actions/Actions.js
- src/features/tasks/Tasks.js

Nota de ruteo:

- /view/actions renderiza src/features/actions/Actions.js
- /view/events renderiza src/features/tasks/Tasks.js

Reglas de persistencia por modulo:

- LegalMatriz: guarda level1..level5 en filter.modules.LegalMatriz.filterData
- events (tasks): guarda level1..level5 en filter.modules.events.filterData
- actions: guarda id_level1..id_level4 en filter.modules.actions.filterData (id_level5 reservado para compatibilidad futura)

Nota de implementacion:

- La respuesta de niveles se valida con response.payload.data.messages === 'Success' y opciones en response.payload.data.data.
- En actions, la tabla y encabezados se consultan con Action_api:
	- get_actions_amatia_express (datos)
	- dashboard_actions_table_headers_amatia_express (headers)
