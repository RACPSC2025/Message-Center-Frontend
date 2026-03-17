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
