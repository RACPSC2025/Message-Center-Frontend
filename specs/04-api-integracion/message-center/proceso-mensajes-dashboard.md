# Proceso de mensajes del Dashboard (Message Center)

## Objetivo
Documentar el flujo funcional y tecnico de mensajes en Message Center: carga de listas, detalle, acciones sobre mensajes, actualizacion de estadisticas y sincronizacion del contador global.

## Alcance
- Listas de mensajes: importantes, sin leer, leidos.
- Panel de detalle del mensaje.
- Marcar como leido/no leido.
- Marcar/quitar importante.
- Archivado (incluyendo accion masiva).
- Refresco de contador global por evento de navegador.
- Etiqueta de modulo (`module_string`) en la lista.

## Componentes principales
- `src/features/MessageCenterNotifications.js`
- `src/features/MessageCenterImportantTab.js`
- `src/features/MessageCenterUnreadTab.js`
- `src/features/MessageCenterReadTab.js`
- `src/features/MessageCenterCardItem.js`
- `src/features/MessageCenterCardDetails.js`

## Flujo general
1. La vista de notificaciones inicializa estado local y dispara `refreshData()`.
2. `refreshData()` limpia seleccion, detalle y tabs, y solicita estadisticas.
3. Cada tab solicita su lista paginada por endpoint Redux propio:
   - importantes: `dashboardMessageImportantSlice`
   - sin leer: `dashboardMessageUnreadSlice`
   - leidos: `dashboardMessageReadSlice`
4. Al cargar mensajes del tab activo, se selecciona el primer mensaje disponible y se consulta su detalle.
5. El panel derecho muestra detalle con `fetchDashboardMessageDetails`.

## Carga de listas
Cada tab construye `FormData` con:
- `user_id`
- `page`
- `filter_show_archived_messages`
- filtros dinamicos desde `filterData`

Para notifications, los filtros activos en panel izquierdo son:
- `filter_keywords`
- `filter_module_string`
- `filter_start_date`
- `filter_end_date`

Comportamiento:
- Paginacion por `IntersectionObserver`.
- Deduplicacion por `id_message` al anexar nuevas paginas.
- Agrupacion visual por fecha (`date_message`).

## Carga de detalle
`MessageCenterNotifications` usa `handleFetchMessagesDetails(messageID)` para:
- convertir y enviar `id_message`.
- guardar respuesta en `messageDetails`.
- no marcar automaticamente como leido al abrir detalle.

## Acciones sobre mensajes
Todas las acciones pasan por `handleUpdateMessageInfo(messageID, updatedInfo)`:
- campos posibles: `is_read`, `is_important`, `is_archived`.
- endpoint: `updateMessageFlag`.

Si la operacion es exitosa:
- actualiza estado local del mensaje activo.
- refresca estadisticas cuando cambia `is_read` o `is_important`.
- incrementa `tabKey` para forzar remount y recarga visual en listas.

Regla de refresco de estadisticas (fuente unica):
- `handleUpdateMessageInfo` centraliza la reconsulta de `fetchDashboardMessageStatistics`.
- Se dispara cuando el payload de actualizacion incluye `is_read` o `is_important`.
- Esto cubre todos los flujos: marcar leido, marcar no leido, marcar importante y desmarcar importante.

### Marcar leido/no leido
- `markMessageAsRead(messageID)` envia `is_read: 1`.
- `markMessageAsUnread(messageID)` envia `is_read: 0`.
- cuando cambia `is_read`, se emite evento global:
  - `window.dispatchEvent(new CustomEvent('dashboard-message-created'))`

Este evento permite que header/layout refresquen el contador de no leidos.

### Importante
- `toggleMessageAsImportant(messageID, isImportant)` envia `is_important` (0/1).
- En panel de detalle, el estado visual de bandera (`isImportant`) se toma del mensaje con foco seleccionado en la lista (tab activo), no del campo `is_important` de la respuesta de detalle.

### Archivado
- individual por bandera `is_archived`.
- masivo mediante seleccion de mensajes + `Promise.all`.

## Etiqueta de modulo en la lista (`module_string`)
Se agrego un badge en la fila del empleado (a la derecha de `singleNotificationEmployeeKey`) en los tres tabs: importantes, sin leer y leidos.

### Mapeo actual
- `LegalMatriz` -> `Matriz legal`
- `tasks` -> `Tareas`
- `actions` -> `Acciones`

## Filtro por modulo en panel izquierdo
Se agrega en `filterConfigs.notifications` el campo `filter_module_string` para filtrar mensajes por modulo.

Visibilidad del filtro:
- La visibilidad de `filter_module_string` se controla por variable de estado local.
- Valor por defecto: `false`.
- Con `false`, el filtro no se muestra en el panel izquierdo y no se aplica en frontend.

Regla de opciones visibles:
- Las opciones se construyen en frontend segun `platformConfig.modules.*.enabled`.
- Solo se muestran modulos habilitados en configuracion de plataforma.

Mapeo de opcion a valor enviado al backend:
- `Matriz legal` -> `LegalMatriz`
- `Tareas` -> `tasks`
- `Acciones` -> `actions`

Regla de procesamiento:
- `filter_module_string` NO se envia al backend.
- El backend responde la lista base segun filtros de texto/fecha/archivado.
- `MessageCenterNotifications` separa filtros en dos grupos:
  - `apiFilterData`: keywords/fecha/otros filtros que SI van al backend.
  - `moduleStringFilter`: selector frontend-only para `module_string`.
- El frontend aplica `moduleStringFilter` localmente en cada tab (importantes, sin leer, leidos).
- El valor del selector se normaliza en frontend (acepta `string` o `{ value, label }`) antes de comparar con `message.module_string`.

### Matriz de filtros (notifications)

| Filtro | Va a backend | Frontend-only |
|---|---|---|
| `filter_keywords` | Si | No |
| `filter_start_date` | Si | No |
| `filter_end_date` | Si | No |
| `filter_module_string` | No | Si |

Plan ejecutado para el ajuste:
1. Definir selector de modulo en filtro de notifications con valores `LegalMatriz`, `tasks`, `actions`.
2. Reubicar la separacion de filtros en `MessageCenterNotifications` (`apiFilterData` y `moduleStringFilter`).
3. Mantener consultas API sin `filter_module_string` en payload.
4. Aplicar filtrado local por `module_string` en los 3 tabs con comparacion normalizada.
4. Validar que la consulta al backend siga operando y documentar el flujo.

Etiquetas de opciones (bilingue):
- `es`: Matriz legal, Tareas, Acciones
- `en`: Legal Matrix, Tasks, Actions

Notas:
- Si llega un valor no mapeado, se muestra el valor original de `module_string`.
- El mapeo es sensible al idioma de la app:
  - `es`: Matriz legal, Tareas, Acciones
  - `en`: Legal Matrix, Tasks, Actions

## Responsabilidades por archivo
- `MessageCenterNotifications.js`
  - define mapeo de `module_string`.
  - expone `getModuleStringLabel`.
  - controla el estado de visibilidad de `filter_module_string` (default `false`).
  - separa filtros API y frontend-only.
  - mantiene metadata del mensaje con foco por tab (incluyendo `is_important`) y la pasa al panel de detalle.
  - pasa la prop a los 3 tabs.
- `MessageCenterImportantTab.js`, `MessageCenterUnreadTab.js`, `MessageCenterReadTab.js`
  - leen `msg.module_string` y calculan etiqueta.
  - al seleccionar mensaje, pasan el objeto del mensaje con foco hacia contenedor.
  - pasan `moduleLabel` a `MessageCenterCardItem`.
- `MessageCenterCardItem.js`
  - renderiza badge de modulo junto al empleado.
- `MessageCenterCardDetails.js`
  - pinta la bandera de importante usando `focusedMessageIsImportant` recibido desde contenedor.

## Validacion recomendada
1. Abrir cada tab (Importante, Sin leer, Leidos).
2. Verificar que la etiqueta del modulo aparezca a la derecha del empleado.
3. Confirmar mapeo correcto para `LegalMatriz`, `tasks`, `actions`.
4. Marcar como leido/no leido y verificar refresco de contador global.
5. Cambiar idioma a ingles y validar labels de modulo en ingles.
