# Contrato API TaskList Module

## API: list_tasks_new_complete_amatia_express

### Endpoint

- POST /tasklist_api/list_tasks_new_complete_amatia_express

### Respuesta (ejemplo 2026-03)

```json
{
  "status": 1,
  "messages": "Success",
  "data": [
    {
      "id": "50",
      "task_title": "Control de Materiales peligrosos",
      "task_description": "Descripción de cómo se hará control de materiales peligrosos",
      "task_start_date": "2026-02-11",
      "task_end_date": "2026-02-27",
      "task_type": null,
      "progress": "0.00",
      "task_status": null,
      "tags": { ... },
      "created_by": "Super Admin",
      "responsibles": { ... },
      "reviewers": { ... },
      "num_documents": "0",
      "comment_count": 1,
      "logtask_list": []
    },
    ...
  ]
}
```

### Notas de implementación frontend

- El slice `fetchListTaskNew` en `src/stores/tasks/fetchListTaskNewSlice.js` implementa la llamada a este endpoint.
- El componente `TaskTableList.js` y `TasksListView.js` consumen los datos de este slice.
- El filtro por tareas asociadas a requisitos legales (`selected_legal_task_ids`) se aplica en frontend, no en el backend.
- El campo `logtask_list` puede estar vacío o contener los ciclos de la tarea.

### Mejoras pendientes

- Agregar margen izquierdo en la tabla para separar del panel de filtros.
- Agregar selector de año para visualizar los ciclos de la tarea por año.

### Documentación actualizada: marzo 2026
- El endpoint y su contrato están alineados con la implementación actual de frontend.
- El filtro de año debe implementarse en la vista de tabla y reflejarse en la UI.

## API: upload_comment_attachments_amatia_express

### Endpoint

- POST /tasklist_api/upload_comment_attachments_amatia_express

### Request

- multipart/form-data
- Campos:
  - `comment_id` (obligatorio)
  - `imagefiles[]` (obligatorio, uno o varios)

### Respuesta usada por frontend (2026-04)

- `status`:
  - `200` = exito
  - `303` = exito parcial con warnings de carga
  - otros codigos = error
- `logtask_id` y `comment_id` se usan para reenfocar la UI luego de recarga.

### Comportamiento frontend implementado

- `EditEventDetailsDrawer` toma `status` para decidir mensajes de exito/error.
- `TasksListView` usa `logtask_id` y `comment_id` del ultimo upload para:
  - seleccionar la tarea que contiene ese ciclo (`logtask`),
  - abrir el drawer en comentarios,
  - enfocar el comentario objetivo.
- Al cerrar el drawer de detalle se limpian los focos temporales de `logtask` y `comment` para evitar que el filtro de enfoque persista en interacciones posteriores.

### Referencias de implementación

- `src/stores/actions/uploadCommentAttachmentsSlice.js`
- `src/features/tasks/TasksListView.js`
- `src/features/MessageCenterEventsList/EditEventDetailsDrawer.js`
- `src/features/MessageCenterEventsList/CommentCard.js`

## API: add_comment_ajax_amatia_express

### Endpoint

- `POST /tasklist_api/add_comment_ajax_amatia_express/{logtask_id}/{comment_id}/{comment_type}`

Donde:

- `logtask_id`: id del ciclo
- `comment_id`: `-` para crear, id numerico para editar
- `comment_type`: `executed` o `revisor`

### Request

- `multipart/form-data`
- Campos de comentario:
  - `data[monitoring_date]` (`YYYY-MM-DD`)
  - `data[comment]`
  - `data[sharepoint_link]` (opcional)
- Campos de logtask:
  - `percentaje` (compatibilidad backend con `percentage`)
  - `logtask_status`
- Adjuntos opcionales:
  - `imagefiles[]` (uno o varios archivos)

### Respuesta usada por frontend

- `status`:
  - `200`: exito
  - `303`: exito con warnings de adjuntos
- `logtask_id` y `comment_id` se usan para refresco y foco de UI.

### Comportamiento frontend implementado (2026-04)

- En tab "crear comentario" (`EditEventDetailsDrawer`):
  - se permite adjuntar multiples archivos antes de guardar;
  - el control de progreso del formulario se envia como `percentaje`;
  - el valor inicial de la barra de progreso se toma del porcentaje actual del `logtask`.
- En creacion de comentario se llama:
  - `tasklist_api/add_comment_ajax_amatia_express/${logtask_id}/-/${comment_type}`
- El frontend trata `status` 200 y 303 como resultado exitoso.
