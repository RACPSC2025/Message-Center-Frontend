# Configuracion de plataforma: get_configuration_amatia_express

Este documento explica como se obtiene, guarda y consume la configuracion global del proyecto.

## Objetivo

Al iniciar la aplicacion se consulta el endpoint:

- GET /message_center_api/legal_api/get_configuration_amatia_express

La respuesta esperada tiene estructura:

- status
- messages
- configuration

La propiedad configuration contiene version, environment y modules con permisos, features y catalogos por modulo.

## Dónde se guarda en Redux

Archivo:

- src/stores/platformConfigSlice.js

Estado del slice:

- loading: estado de carga
- data: configuracion activa (fallback inicial desde src/config/defaultConfig.json)
- error: error de consulta
- fetchedFromApi: indica si vino del backend

Flujo de carga:

1. fetchPlatformConfig llama al endpoint /message_center_api/legal_api/get_configuration_amatia_express.
2. Si existe response.data.configuration, se guarda en state.platformConfig.data.
3. Si la respuesta viene vacia o falla, se conserva defaultConfig.json como fallback.

## Cuándo se consulta

Archivo:

- src/routes/RoutesFile.js

En montaje del componente de rutas se despacha:

- dispatch(fetchPlatformConfiguration())

Con esto la consulta ocurre al iniciar la aplicacion.

## Cómo se usa para visibilidad y titulos de modulos

Archivo:

- src/config/generalConfig.js

Se construye modulePermissions dinamicamente a partir de state.platformConfig.data.modules:

- legal_matrix -> ruta LegalMatriz
- task -> ruta events
- findings -> ruta findings
- actions -> ruta actions

Reglas aplicadas:

- visibility se toma de modules.[modulo].enabled
- label usa title_es o title_en segun idioma actual
- si no hay titulo en API, usa fallback de etiqueta local
- notifications se mantiene como modulo de navegacion del sistema

## Idioma de los titulos

El idioma activo se toma del provider de lenguaje y se pasa a getGlobalConfiguration.

- language = es -> usa title_es
- language = en -> usa title_en

## Consumo facil desde hooks

Archivo:

- src/hooks/usePlatformConfig.js

Hooks disponibles:

- usePlatformConfig: retorna toda la configuracion
- useIsModuleEnabled(moduleName)
- useHasPermission(moduleName, permission)
- useModuleFeature(moduleName, featurePath)
- useModuleCatalogs(moduleName, catalogName)
- useModuleInfo(moduleName)

Notas de robustez:

- Si features o catalogs llegan como arreglo vacio, los hooks retornan null o {} para evitar errores de acceso.
- useModuleInfo incluye title_es y title_en para consumo directo en UI.

## Ejemplos rapidos

Verificar permiso:

useHasPermission('task', 'create_task')

Leer catalogo status:

useModuleCatalogs('actions', 'status')

Validar si modulo esta habilitado:

useIsModuleEnabled('legal_matrix')

## Nota de compilado

La carpeta specs esta en la raiz del workspace y no hace parte del bundle de React (pnpm build), ya que el compilado toma codigo desde src y activos desde public.
