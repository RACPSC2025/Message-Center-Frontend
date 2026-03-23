# API: Listar etiquetas (tags) disponibles

**Endpoint:** `/color_tags/list_tags`

**Método:** GET

**Descripción:**
Obtiene la lista de etiquetas (tags) disponibles para asociar a tareas. Cada tag incluye su id, nombre y color.

**Respuesta de ejemplo:**
```json
{
  "status": 200,
  "messages": "Success",
  "data": [
    { "value": "3", "label": "Gestion Ambiental" },
    { "value": "4", "label": "Gestion de Permisos" },
    { "value": "21", "label": "Gestion PMA" }
  ]
}
```

**Uso en frontend:**
- El menú de opciones de cada tarea incluye "Agregar etiqueta".
- Al seleccionar esta opción, se abre un modal que consulta este endpoint y permite seleccionar una etiqueta para asociar a la tarea.
- El id de la tarea se pasa al modal para la asociación.

**Notas:**
- El endpoint solo lista las etiquetas, la asociación a la tarea requiere un endpoint adicional.
- El flujo y UI están documentados en el código de TasksListView.js y AddTagDialog.js.
