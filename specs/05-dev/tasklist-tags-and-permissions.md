# Documentación de Cambios y Funcionalidad: TaskListView y Etiquetas


## 1. Botones de Opciones y Flotantes en la Lista de Tareas

### Permisos Utilizados
- **create_task**: Permite mostrar el botón flotante para crear tareas (SpeedDial) en el módulo de tareas. Solo visible si el permiso es true en la configuración del módulo (API get_configuration_amatia_express).
- **create_cycle**: Permite mostrar el botón flotante para crear ciclos (SpeedDial) en el módulo de tareas. Solo visible si el permiso es true en la configuración del módulo.
- **edit_task**: Permite mostrar el botón "Editar tarea" en el menú de opciones de cada tarea.
- **delete_task**: Permite mostrar el botón "Eliminar tarea" en el menú de opciones de cada tarea.
- **create_tags**: Permite mostrar el botón "Agregar etiqueta" en el menú de opciones de cada tarea.

**Fuente de permisos:**
- Los permisos se obtienen mediante el hook `useHasPermission('task', '<permiso>')`.
- Los botones solo se renderizan si el permiso correspondiente es `true` en la configuración del módulo (obtenida vía API `/message_center_api/legal_api/get_configuration_amatia_express`).

**Ejemplo de uso en código:**
```js
const canCreateTask = useHasPermission('task', 'create_task');
const canCreateCycle = useHasPermission('task', 'create_cycle');
const canEditTask = useHasPermission('task', 'edit_task');
const canDeleteTask = useHasPermission('task', 'delete_task');
const canCreateTags = useHasPermission('task', 'create_tags');
```

- El botón flotante para crear tareas solo es visible si `canCreateTask` es true.
- El botón flotante para crear ciclos solo es visible si `canCreateCycle` es true.

## 2. Documentación de Etiquetas (Tags)

### APIs Utilizadas
- **GET** `/tasklist_api/list_tags`: Obtiene la lista de etiquetas disponibles.
- **POST** `/tasklist_api/add_tag_to_task`: Asocia etiquetas existentes y/o nuevas a una tarea.
- **GET** `/tasklist_api/list_tasks_new_complete_amatia_express`: Recarga la lista de tareas para reflejar los cambios de etiquetas.

### Flujo de Etiquetado
1. El usuario abre el modal de etiquetas desde el menú de opciones de una tarea (requiere permiso `create_tags`).
2. El modal permite:
   - Seleccionar una o varias etiquetas existentes (multi-select).
   - Crear nuevas etiquetas con nombre y color personalizado.
   - Visualizar las etiquetas a crear antes de guardar.
3. Al guardar:
   - Se envía la selección y/o nuevas etiquetas al endpoint `/add_tag_to_task`.
   - Se recarga la lista de tareas desde `/list_tasks_new_complete_amatia_express`.
   - Se da foco a la tarea actualizada para mostrar las nuevas etiquetas.

### Paleta de Colores
- Se utiliza un array ampliado de colores hexadecimales para mayor variedad visual.
- Ejemplo de paleta:
  - Azules: `#0050d4`, `#1976D2`, ...
  - Verdes: `#16A085`, `#388E3C`, ...
  - Rojos: `#b31b25`, `#C62828`, ...
  - Morados, naranjas, marrones, grises, rosas, neutros, etc.
- El usuario selecciona el color visualmente, nunca se muestra el código hexadecimal en la UI.


### Visualización de Etiquetas
- Las etiquetas asociadas a una tarea se muestran como chips de color en la lista y detalles de la tarea.
- El color del chip corresponde al color seleccionado/definido para la etiqueta.
- El nombre de la etiqueta se muestra en el chip, con estilo legible sobre el fondo de color.

## 3. Visualización y lógica de tipo de tarea (task_type)

- El tipo de tarea mostrado en la UI se determina a partir del campo `activity_type` de cada tarea y el catálogo `task_type` definido en la configuración de plataforma (API `/message_center_api/legal_api/get_configuration_amatia_express`).
- El catálogo `task_type` contiene los posibles tipos de tarea, cada uno con:
   - `code` (string, ej: "unique", "cyclic", "permanent")
   - `numeric_code` (número, ej: 1, 3, 5)
   - `label_es` (nombre en español)
   - `label_en` (nombre en inglés)
- El label mostrado en la UI depende del idioma activo (i18n):
   - Si el idioma es español (`es`), se usa `label_es`.
   - Si el idioma es inglés (`en`), se usa `label_en`.
- Si no se encuentra coincidencia, se muestra el valor por defecto "CÍCLICA".

**Ejemplo de mapeo en código:**
```js
const taskTypeCatalog = useSelector(
   (state) => state?.platformConfig?.data?.modules?.task?.catalogs?.task_type ?? []
);
const { i18n } = useTranslation();
const currentLang = (i18n?.language || 'es').toLowerCase();

let typeLabel = '';
if (task.activity_type) {
   const foundType = taskTypeCatalog.find(
      (item) => item.code === task.activity_type || item.numeric_code === Number(task.activity_type)
   );
   if (foundType) {
      typeLabel = currentLang === 'en' ? foundType.label_en : foundType.label_es;
   }
}
// ...
task_type: typeLabel || 'CÍCLICA',
```

**Notas:**
- El catálogo de tipos de tarea puede ser actualizado desde backend y soporta nuevos tipos.
- El mapeo es robusto ante valores numéricos o string en `activity_type`.
- El label es consistente con el idioma de la UI y se obtiene desde `i18n.language` (no desde `window`).
- El resultado normalizado en `TasksListView` expone:
   - `task_type` (label final)
   - `task_type_code` (ej: unique/cyclic/permanent)
   - `task_type_numeric_code`

## 4. Estados y gráficas de tareas/ciclos por configuración

- Los estados visibles en `TasksListView`, `TaskCyclesTable` y gráficos de tareas/ciclos se toman de `modules.task.catalogs.status`.
- El frontend normaliza códigos con `normalizeStatusCode` para evitar diferencias entre string/number.
- Se mantiene fallback local de estados/colores si no existe catálogo.

Cambios aplicados en frontend:

- `TasksListView.js`
   - filtros y leyenda de estados dinámicos por catálogo;
   - conteo de `logtasks` por estado sin hardcode (`countsByStatus`);
   - promedio de progreso con ajuste para estado completado (`100%` cuando corresponda).
- `TaskCyclesTable.js`
   - color y label del badge de progreso desde catálogo (`taskStatusCatalog` prop).
- `TaskDoubleRingChart.js`
   - prioriza colores provenientes de `chartData` dinámico.
- `TaskReportTremor.js`
   - donuts y tabla por catálogo dinámico de estados (`task.status`).

### Consideraciones de UX
- El modal de etiquetas es accesible solo si el permiso `create_tags` está activo.
- El usuario puede crear varias etiquetas nuevas antes de guardar.
- El sistema soporta i18n para todos los textos del modal y botones.
- Al guardar, la UI se actualiza automáticamente para reflejar los cambios.

---

**Última actualización:** Abril 2026
