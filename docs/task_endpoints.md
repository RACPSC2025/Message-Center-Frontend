# Documentación de Endpoints - Tasks (Message-Center)

Última actualización: 2026-02-11

Resumen
- Este documento recoge todos los endpoints HTTP relacionados con la gestión de tareas (`tasks`, `logtasks`, catálogos y operaciones asociadas`) encontrados en el repositorio Message-Center-Frontend. Incluye descripción, método, uso típico, headers esperados, estructura general de request/response y referencias a los slices y componentes que los consumen.

Autenticación y headers comunes
- Todos los endpoints requieren autenticación mediante headers: `Auth-Token` y `System-Token` (valores en `src/data/sofactia_task_endpoints.json` como ejemplo). Además se usa `Content-Type: application/json` o `multipart/form-data` según el endpoint.

Convención de nombres
- Se usan dos prefijos frecuentes: `/tasklist_api/` y `/amatia/tasklist_api/`. En muchos casos ambos apuntan a la misma funcionalidad (versiones o alias según entorno).

Índice
- `/tasklist_api/list_tasks_new_complete`
- `/amatia/tasklist_api/list_tasks`
- `/tasklist_api/list_logtasks/{id}`
- `/tasklist_api/get_task_counts`
- `/tasklist_api/get_logtask_details`
- `/amatia/tasklist_api/get_logtask_comments/{logtask_id}`
- `/amatia/tasklist_api/create_logtask_comment`
- `/tasklist_api/list_task_status`
- `/tasklist_api/taskcreate_api/save_task`
- `/tasklist_api/update_task_progress_post`
- `/tasklist_api/delete_logtask`
- `/amatia/tasklist_api/update_responsabels`
- `/amatia/tasklist_api/update_logtask_details`
- Endpoints de catálogos y auxiliares (programas, fases, pmas, proyectos, contractors, administradores, niveles, alertas, tags, settings)

Detalle de endpoints

1) /tasklist_api/list_tasks_new_complete (POST)
- Función: Devuelve la lista completa de tareas con paginación y datos anidados (responsibles, logtasks, contadores, etc.). Es el endpoint principal para cargar vistas de tabla o listas paginadas.
- Request: JSON o FormData. Parámetros típicos: `page`, `per_page`, filtros (estado, programa, fecha, responsable).
- Response: `messages`, `data` (array de tareas), `total_pages`.
- Slices / código: [src/data/sofactia_task_endpoints.json](src/data/sofactia_task_endpoints.json) (documentación interna), [src/stores/tasks/fetchListTaskNewSlice.js](src/stores/tasks/fetchListTaskNewSlice.js).
- Componentes que lo usan: TaskTableList, TaskGroupList, MessageCenterEventsList, MessageCenterEventsTable.

2) /amatia/tasklist_api/list_tasks (POST)
- Función: Variante/alias para listar tareas en ciertos slices; similar a `list_tasks_new_complete` pero usada en algunos puntos del código legacy.
- Slices: [src/stores/tasks/fetchListTasksSlice.js](src/stores/tasks/fetchListTasksSlice.js).

3) /tasklist_api/list_logtasks/{id}  (POST)
- Función: Lista los `logtasks` (ciclos o subtareas) asociados a una tarea (`task_id` en la URL). Se carga bajo demanda para mostrar ciclos de una tarea.
- Uso: `POST /tasklist_api/list_logtasks/123` donde `123` es `task_id`.
- Slices: [src/stores/tasks/fetchLogtaskListSlice.js](src/stores/tasks/fetchLogtaskListSlice.js).

4) /tasklist_api/get_task_counts  (POST)
- Función: Devuelve contadores agregados por estado (tasks y logtasks). Utilizado para dashboards y widgets de resumen.
- Request: normalmente sin body.
- Response: objeto con `total_tasks`, `tasks` (map estado→cuenta), `total_logtasks`, `logtasks`.
- Slices: [src/stores/tasks/fetchTaskCountsSlice.js](src/stores/tasks/fetchTaskCountsSlice.js).

5) /tasklist_api/get_logtask_details  (POST)
- Función: Recupera información detallada de un logtask (ciclo), incluyendo descripción amplia, asignados, fechas, progresos y contadores de comentarios/adjuntos.
- Request: `{ "logtask_id": 102 }` o similar.
- Slices: [src/stores/tasks/getLogtaskDetailsSlice.js](src/stores/tasks/getLogtaskDetailsSlice.js).

6) /amatia/tasklist_api/get_logtask_comments/{logtask_id} (GET/POST según uso)
- Función: Obtiene la lista de comentarios asociados a un logtask concreto.
- Uso: se emplea con la interpolación de `logtask_id` en componentes y drawers (ver EditEventDetailsDrawer).
- Componentes / referencias: [src/features/MessageCenterEventsList/EditEventDetailsDrawer.js](src/features/MessageCenterEventsList/EditEventDetailsDrawer.js), [src/stores/tasks/getLogtaskCommentsSlice.js](src/stores/tasks/getLogtaskCommentsSlice.js).

7) /amatia/tasklist_api/create_logtask_comment (POST)
- Función: Crea un comentario en un `logtask`. Soporta `multipart/form-data` cuando hay adjuntos.
- Slices: [src/stores/tasks/createLogtaskCommentSlice.js](src/stores/tasks/createLogtaskCommentSlice.js).

8) /tasklist_api/list_task_status (POST)
- Función: Devuelve la lista de estados posibles para tareas/logtasks (etiquetas, colores, orden). Utilizado en filtros y en la UI para mostrar estado con color.
- Slices: [src/stores/tasks/fetchTaskListStatusSlice.js](src/stores/tasks/fetchTaskListStatusSlice.js).

9) /tasklist_api/taskcreate_api/save_task (POST)
- Función: Endpoint de creación y actualización de tareas (formulario completo). Recibe el payload del formulario de creación/edición y devuelve el objeto creado/actualizado o errores de validación.
- Slices: [src/stores/tasks/saveTaskSlice.js](src/stores/tasks/saveTaskSlice.js).

10) /tasklist_api/update_task_progress_post (POST)
- Función: Actualiza el avance (porcentaje) o progreso de un task/logtask. Usado por actualizaciones rápidas en listas o cambios de progreso desde el UI.
- Referencias: aparece en variantes de slices `fetchListTaskNewSlice.js` y backups.

11) /tasklist_api/delete_logtask (POST)
- Función: Elimina un `logtask`. Se envía `logtask_id` en el body.
- Slices: [src/stores/tasks/deleteLogtaskSlice.js](src/stores/tasks/deleteLogtaskSlice.js), UI: MessageCenterEventsList.

12) /amatia/tasklist_api/update_responsabels (POST)
- Función: Actualiza la lista de responsables de una tarea (re-asignaciones masivas o individuales).
- Slices: [src/stores/tasks/updateResponsiblesSlice.js](src/stores/tasks/updateResponsiblesSlice.js).

13) /amatia/tasklist_api/update_logtask_details (POST)
- Función: Actualiza campos básicos/avanzados de un `logtask` (fechas, título, descripción, porcentaje, etc.).
- Slices: [src/stores/tasks/updateLogtaskDetailsSlice.js](src/stores/tasks/updateLogtaskDetailsSlice.js).

14) /tasklist_api/get_settings (POST)
- Función: Obtiene configuraciones y valores necesarios para los formularios (por ejemplo, opciones por defecto, reglas de validación o listas auxiliares).
- Slices: [src/stores/tasks/getSettingsSlice.js](src/stores/tasks/getSettingsSlice.js).

15) Catálogos y auxiliares
- `/tasklist_api/get_programs` — Obtiene programas disponibles. Slice: [src/stores/tasks/getProgramsSlice.js](src/stores/tasks/getProgramsSlice.js).
- `/tasklist_api/get_sub_programs` — Obtiene subprogramas. Slice: [src/stores/tasks/getSubProgramsSlice.js](src/stores/tasks/getSubProgramsSlice.js).
- `/amatia/tasklist_api/list_fases` y `/tasklist_api/get_subfases` — Fases y subfases de tareas. Slices: [src/stores/tasks/fetchPhasesSlice.js](src/stores/tasks/fetchPhasesSlice.js), [src/stores/tasks/fetchSubPhasesSlice.js](src/stores/tasks/fetchSubPhasesSlice.js).
- `/tasklist_api/list_pmas`, `/tasklist_api/list_programa_ambiental`, `/tasklist_api/list_proyecto` — Catálogos para campos del formulario. Slices: fetchPMASListSlice.js, fetchProgramAmbientalSlice.js, fetchProyectoAmbientalSlice.js.
- `/tasklist_api/list_contractor`, `/tasklist_api/list_administradores`, `/tasklist_api/get_position_user_list` — Listas de usuarios/roles/contratistas. Slices: fetchContractorListSlice.js, fetchAdministratorsListSlice.js, getPositionUserListSlice.js.
- `/amatia/tasklist_api/list_tags` — Tags disponibles para tareas. Slice: fetchTaskTagsSlice.js.
- `/tasklist_api/list_alerta` — Tipos de alerta. Slice: fetchAlertListSlice.js.
- `/tasklist_api/list_level_ejecutor`, `/amatia/tasklist_api/list_level1`, `/tasklist_api/tasklist_api/get_level*` — Endpoints para niveles/jeraquías que alimentan selectores y filtros. Revisar `src/config/filterConfig.js` y `src/components/BaseFilter.js`.

Notas de integración y uso práctico
- Muchos endpoints aceptan tanto `application/json` como `multipart/form-data`. Cuando se suben adjuntos (comentarios con archivos, creación de task con documentos), use `FormData` y no olvide los headers que axios puede configurar automáticamente.
- Para obtener comentarios o listas específicas que incluyen un id en la URL, el código realiza la interpolación en el front (ej.: ``/tasklist_api/list_logtasks/${task_id}``).
- La mayoría de las integraciones están centralizadas en `src/stores/tasks/` donde cada slice Redux contiene la llamada con `axiosInstance.post(...)`.

Archivos relevantes (puntos de entrada en el código)
- [src/data/sofactia_task_endpoints.json](src/data/sofactia_task_endpoints.json)
- [src/stores/tasks/](src/stores/tasks/)  — Carpeta con slices que consumen los endpoints listados.
- Piezas de UI principales: [src/features/MessageCenterEventsList.js](src/features/MessageCenterEventsList.js), [src/features/tasks/](src/features/tasks/), [src/components/BaseFilter.js](src/components/BaseFilter.js).

Siguientes pasos recomendados
- Mantener este archivo actualizado cuando se agreguen nuevos endpoints o cambie la versión del backend.
- Añadir ejemplos curl/requests concretos para cada endpoint si se desea facilitar pruebas manuales.

Contacto
- Si quieres que agregue ejemplos curl, payloads reales y respuestas mock para cada endpoint, responda con "Agregar ejemplos" y lo incorporo.

---
Generado automáticamente a partir del código del repositorio (slices y `src/data/sofactia_task_endpoints.json`).
