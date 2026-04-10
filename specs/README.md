# Documentacion Tecnica del Proyecto (Specs)

Este directorio centraliza la documentacion para desarrolladores y para agentes de IA.

Objetivos:

- Entender rapido el stack y la arquitectura.
- Entender como se inicializa la aplicacion y como se carga configuracion.
- Entender como navegar el estado Redux por modulo.
- Entender rutas, layout y permisos de navegacion.
- Entender integracion API y patrones de consumo.

## Estructura

- 01-architecture/
  - stack-tecnologico.md
  - inicio-app-y-runtime-config.md
- 02-redux/
  - guia-redux.md
  - estado-redux-por-modulo.md
- 03-navigation/
  - rutas-y-navegacion.md
- 04-api-integracion/
  - axios-y-endpoints.md
  - get_configuration_amatia_express.md
  - actions-module/contracts.md
  - legal-requests-module/README.md
- 05-dev/
  - ejecucion-build-deploy.md
  - tasklist-tags-and-permissions.md
- 06-conventions/
  - componentes-hooks-i18n.md
- colsubsidio/
  - modulos/README.md
  - modulos/gestor-permisos/README.md
  - modulos/procesos-sancionatorios/README.md
- reports/
  - tasks-report-dashboard.md
  - actions-report-dashboard.md

## Documento clave de configuracion de plataforma

- get_configuration_amatia_express.md
- 04-api-integracion/get_configuration_amatia_express.md

Describe como se consulta la configuracion backend, como se guarda en Redux y como se usa para visibilidad/titulos de modulos.

Incluye mapeo de nuevos modulos de configuracion a rutas:

- permit_manager -> /view/permit_manager
- sanctioning_processes -> /view/sanctioning_processes

## Nota de compilado

La carpeta specs no hace parte del bundle de React en produccion. El build toma codigo de src y assets de public.

## Reportes funcionales

- reports/tasks-report-dashboard.md: contrato funcional del dashboard de tareas (vista report) y consistencia de estados/colores en lista, tabla y charts del modulo.
- reports/actions-report-dashboard.md: contrato funcional del dashboard de acciones (vista report), incluyendo fuente de datos, catalogo de estados, consistencia table/report/navbar y consideraciones de layout del chart.
