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
